import {HttpError} from "./guards.ts";

import mongoose from "mongoose";
import {createHmac,randomUUID,timingSafeEqual} from "node:crypto";
import {env} from "../lib/env.ts";
import {CartModel,CouponModel,OrderModel} from "./models/commerce.ts";
import {ProductModel} from "./models/catalog.ts";
import {ownerKey} from "./cart.ts";
import {parseReferences} from "../features/builder/schema.ts";
import {checkoutSchema,type CheckoutInput} from "../features/checkout/schema.ts";
import {calculateOrder,type Coupon,type PricedProduct} from "../features/checkout/pricing.ts";
import {SettingModel} from "./models/admin.ts";
import {shippingSettings} from "./settings.ts";
function testPaymentAllowed(input:CheckoutInput,quote:{isDemo?:boolean;isSample:boolean}){if(input.payment!=="COD"&&(env.MONGODB_DB!=="futera_demo"||(!quote.isDemo&&!quote.isSample)))throw new HttpError(403,"Test payments are available only for isolated demo inventory.");}
const sign=(value:string)=>createHmac("sha256",env.AUTH_SECRET!).update(value).digest("hex");
async function price(owner:string,input:CheckoutInput,session?:mongoose.ClientSession){
  const cart=await CartModel.findById(owner).session(session??null);
  const refs=parseReferences(cart?.refs.map(r=>({id:r.id,quantity:r.quantity})));
  const products=await ProductModel.find({slug:{$in:refs.map(r=>r.id)}}).session(session??null).lean() as unknown as PricedProduct[];
  const coupon=input.coupon?await CouponModel.findById(input.coupon).session(session??null):null;
  if(input.coupon&&!coupon)throw Error("Coupon not found.");
  const shipping=await shippingSettings(session);
  return calculateOrder(refs,products,coupon?.toObject() as Coupon|null,input.method==="home"?shipping.homeMinor:shipping.pickupMinor);
}
export async function reviewCheckout(input:CheckoutInput){
  if(env.CHECKOUT_ENABLED!=="true")throw new HttpError(503,"Retail checkout is disabled. Reference products are not for sale.");
  const owner=await ownerKey(true);const quote=await price(owner!,input);testPaymentAllowed(input,quote);const payload=JSON.stringify({owner,input,quote,expires:Date.now()+600000,requestId:randomUUID()});
  return {quote,payment:input.payment,testOutcome:input.testOutcome,token:Buffer.from(payload).toString("base64url")+"."+sign(payload)};
}
export async function placeOrder(token:string){
  if(env.CHECKOUT_ENABLED!=="true")throw new HttpError(503,"Retail checkout is disabled. Reference products are not for sale.");
  if(token.length>30000)throw Error("Invalid quote.");const [encoded,signature]=token.split(".");if(!encoded||!signature)throw Error("Invalid quote.");
  const payload=Buffer.from(encoded,"base64url").toString("utf8"),actual=Buffer.from(sign(payload)),expected=Buffer.from(signature);
  if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw Error("Invalid quote.");
  const saved=JSON.parse(payload);const input=checkoutSchema.parse(saved.input);const owner=await ownerKey();
  if(!owner||owner!==saved.owner||saved.expires<Date.now())throw Error("Quote expired. Review again.");
  testPaymentAllowed(input,saved.quote);if(input.payment!=="COD"&&input.testOutcome&&input.testOutcome!=="approved")throw new HttpError(400,`Test payment ${input.testOutcome}. No money was charged; no order or stock change was created.`);
  const existing=await OrderModel.findOne({ownerKey:owner,requestId:saved.requestId});if(existing)return existing._id;
  let orderId="";
 await SettingModel.updateOne({_id:"mutation-lock"},{$setOnInsert:{value:{},revision:0}},{upsert:true});
  await mongoose.connection.transaction(async session=>{
    const previous=await OrderModel.findOne({ownerKey:owner,requestId:saved.requestId}).session(session);if(previous){orderId=previous._id;return;}
    // Serialize admin configuration changes with final checkout validation.
    await SettingModel.updateOne({_id:"mutation-lock"},{$inc:{revision:1}},{session});
    const quote=await price(owner!,input,session);testPaymentAllowed(input,quote);
    if(JSON.stringify(quote)!==JSON.stringify(saved.quote))throw Error("Price, stock or discount changed. Review your order again.");
    for(const line of quote.lines){const result=await ProductModel.updateOne({slug:line.id,active:true,isReference:{$ne:true},priceMinor:line.unitMinor,stock:{$gte:line.quantity}},{$inc:{stock:-line.quantity}},{session});if(result.modifiedCount!==1)throw Error("Stock changed. Review your cart.");}
    if(input.coupon){const used=await CouponModel.updateOne({_id:input.coupon,$expr:{$lt:["$used","$maxUses"]}},{$inc:{used:1}},{session});if(used.modifiedCount!==1)throw Error("Coupon exhausted.");}
    orderId=randomUUID();await OrderModel.create([{_id:orderId,ownerKey:owner,requestId:saved.requestId,...quote,address:input.address,method:input.method,coupon:input.coupon,payment:input.payment,isTestPayment:input.payment!=="COD",paymentStatus:"unpaid",status:"Confirmed",timeline:[{status:"Confirmed",at:new Date()}]}],{session});
    await CartModel.updateOne({_id:owner},{$set:{refs:[]}},{session});
  });
  return orderId;
}
