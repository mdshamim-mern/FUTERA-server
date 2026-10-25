
import mongoose from "mongoose";
import {requireAdmin,assertAdminMutationAccess} from "./guards.ts";
import {ProductModel} from "./models/catalog.ts";
import {CouponModel,OrderModel,UserModel,orderStatuses} from "./models/commerce.ts";
import {AuditModel,SettingModel} from "./models/admin.ts";
import {adminMutationSchema} from "../features/admin/schema.ts";

/** All admin writes enter here; authorization precedes parsing and data access. */
export async function mutateAdmin(input:unknown){
 const actor=await requireAdmin(); assertAdminMutationAccess(actor); const data=adminMutationSchema.parse(input);
 await SettingModel.updateOne({_id:"mutation-lock"},{$setOnInsert:{value:{},revision:0}},{upsert:true});
 await mongoose.connection.transaction(async session=>{
  // Serialize administrator changes, including role revocation, across processes.
  await SettingModel.updateOne({_id:"mutation-lock"},{$inc:{revision:1}},{session});
  const fresh=await UserModel.findOne({_id:actor._id,role:"admin",disabled:false}).session(session);
  if(!fresh||fresh.isDemo||fresh.sessionVersion!==actor.sessionVersion)throw Error("Forbidden");
  let before:unknown=null,after:unknown=null,target="";
  switch(data.operation){
   case "product": {

    const doc=await ProductModel.findOne({slug:data.product.slug}).session(session);target=data.product.slug;
    if(data.existing){
     if(!doc||doc.updatedAt.toISOString()!==data.expectedUpdatedAt)throw Error("Product changed. Reload before saving.");
     if(doc.stock!==data.product.stock)throw Error("Use inventory adjustments to change stock.");
     before=doc.toObject();doc.set(data.product);await doc.save({session});after=doc.toObject();
    }else{if(doc)throw Error("Slug already exists.");const [created]=await ProductModel.create([data.product],{session});after=created.toObject();}
    break;
   }
   case "archive": {
    target=data.ids.join(",");const docs=await ProductModel.find({slug:{$in:data.ids}}).session(session);
    if(docs.length!==new Set(data.ids).size)throw Error("Product not found.");before=docs.map(d=>({slug:d.slug,active:d.active}));
    for(const doc of docs){doc.active=false;await doc.save({session});}after={active:false};break;
   }
   case "inventory": {
    target=data.id;const doc=await ProductModel.findOne({slug:data.id}).session(session);
    if(!doc||doc.stock!==data.expectedStock)throw Error("Stock changed. Reload before adjusting.");
    before={stock:doc.stock};doc.stock+=data.delta;if(doc.stock<0||doc.stock>100000)throw Error("Invalid resulting stock.");await doc.save({session});after={stock:doc.stock};break;
   }
   case "coupon": {
    const {code,...fields}=data.coupon;target=code;const doc=await CouponModel.findById(code).session(session);before=doc?.toObject()??null;
    if(doc&&fields.maxUses<doc.used)throw Error("Maximum uses cannot be below redeemed uses.");
    after=(await CouponModel.findOneAndUpdate({_id:code},{$set:fields,$setOnInsert:{used:0}},{upsert:true,returnDocument:"after",runValidators:true,session}))?.toObject();break;
   }
   case "shipping":case "compatibility":{
    target=data.operation;before=(await SettingModel.findById(target).session(session))?.value??null;
    await SettingModel.updateOne({_id:target},{$set:{value:data.value},$inc:{revision:1}},{upsert:true,session});after=data.value;break;
   }
   case "role": {
    target=data.id;if(target===actor._id)throw Error("You cannot change your own role.");
    const user=await UserModel.findById(target).session(session);if(!user)throw Error("User not found.");
    before={role:user.role};user.role=data.role;user.sessionVersion+=1;await user.save({session});after={role:user.role};break;
   }
   case "order": {
    target=data.id;const doc=await OrderModel.findById(target).session(session);
    if(!doc||orderStatuses.indexOf(data.next)!==orderStatuses.indexOf(doc.status)+1)throw Error("Invalid transition");
    before={status:doc.status};doc.status=data.next;doc.timeline.push({status:data.next,at:new Date()});await doc.save({session});after={status:doc.status};break;
   }
  }
  await AuditModel.create([{actorId:actor._id,action:data.operation,target,reason:data.reason,before,after}],{session});
 });
}
