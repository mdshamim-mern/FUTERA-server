import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
const options={timestamps:true,strict:"throw" as const,autoIndex:false};
const reference=new Schema({id:{type:String,required:true},quantity:{type:Number,required:true,min:1,max:8}},{_id:false});
const address=new Schema({name:String,phone:String,division:String,district:String,upazila:String,street:String},{_id:false});
const user=new Schema({_id:{type:String,required:true},name:{type:String,required:true},email:{type:String,required:true},passwordHash:{type:String,required:true,select:false},role:{type:String,enum:["customer","admin"],default:"customer"},sessionVersion:{type:Number,default:0},disabled:{type:Boolean,default:false},addresses:{type:[address],default:[]},wishlist:{type:[String],default:[]} },options);
user.index({email:1},{unique:true});
const savedBuild=new Schema({_id:{type:String,required:true},ownerId:{type:String,required:true},name:{type:String,required:true},refs:{type:[reference],required:true},shareToken:{type:String,default:null}},options);
savedBuild.index({ownerId:1,updatedAt:-1});savedBuild.index({shareToken:1},{unique:true,partialFilterExpression:{shareToken:{$type:"string"}}});
const cart=new Schema({_id:{type:String,required:true},refs:{type:[reference],default:[]},expiresAt:Date},options);cart.index({expiresAt:1},{expireAfterSeconds:0});
const coupon=new Schema({_id:{type:String,required:true},percent:{type:Number,min:1,max:100,required:true},minimumMinor:{type:Number,default:0},maximumDiscountMinor:{type:Number,required:true},startsAt:{type:Number,required:true},endsAt:{type:Number,required:true},maxUses:{type:Number,required:true},used:{type:Number,default:0},active:{type:Boolean,default:true},sampleOnly:{type:Boolean,default:true}},options);
export const orderStatuses=["Confirmed","Assembling","Testing","Shipped","Delivered"] as const;
const order=new Schema({_id:{type:String,required:true},ownerKey:{type:String,required:true},requestId:{type:String,required:true},lines:{type:[new Schema({id:String,name:String,quantity:Number,unitMinor:Number},{_id:false})],required:true},address:{type:address,required:true},method:{type:String,enum:["home","pickup"],required:true},subtotalMinor:Number,discountMinor:Number,shippingMinor:Number,totalMinor:Number,coupon:String,isSample:Boolean,payment:{type:String,enum:["COD"],default:"COD"},paymentStatus:{type:String,enum:["unpaid"],default:"unpaid"},status:{type:String,enum:orderStatuses,default:"Confirmed"},timeline:{type:[new Schema({status:{type:String,enum:orderStatuses},at:Date},{_id:false})],required:true}},options);
order.index({ownerKey:1,createdAt:-1});order.index({ownerKey:1,requestId:1},{unique:true});
const rate=new Schema({_id:{type:String,required:true},hits:{type:Number,default:0},expiresAt:Date},{autoIndex:false});rate.index({expiresAt:1},{expireAfterSeconds:0});
function model<T extends Schema>(name:string,schema:T):Model<InferSchemaType<T>>{return (mongoose.models[name]??mongoose.model(name,schema)) as Model<InferSchemaType<T>>;}
export const UserModel=model("User",user), BuildModel=model("SavedBuild",savedBuild), CartModel=model("Cart",cart), OrderModel=model("Order",order), CouponModel=model("Coupon",coupon), RateModel=model("AuthRate",rate);
export const commerceModels=[UserModel,BuildModel,CartModel,OrderModel,CouponModel,RateModel];

