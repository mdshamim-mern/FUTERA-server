import mongoose,{Schema} from "mongoose";
import {z} from "zod";
import {randomUUID} from "node:crypto";
import {env} from "../lib/env.ts";
import {connectDatabase} from "../lib/db.ts";
import {requireUser,HttpError} from "./guards.ts";
import {limitAuth} from "./auth-rate.ts";
import {getProduct} from "./catalog.ts";
import {slugSchema} from "../features/products/schema.ts";
const schema=new Schema({_id:String,product:{type:String,required:true},ownerId:{type:String,required:true},rating:{type:Number,min:1,max:5,required:true},body:{type:String,maxLength:1500,required:true}},{timestamps:true,autoIndex:false,strict:"throw"});schema.index({product:1,ownerId:1},{unique:true});schema.index({product:1,createdAt:-1});
export const ReviewModel=mongoose.models.ProductReview??mongoose.model("ProductReview",schema);
export const reviewInput=z.object({rating:z.number().int().min(1).max(5),body:z.string().trim().min(10).max(1500)});
export async function listReviews(slug:string,page=1){
 if(!env.MONGODB_URI)return {items:[],total:0,average:null,page:1,pages:1};await connectDatabase();
 const total=await ReviewModel.countDocuments({product:slug});const pages=Math.max(1,Math.ceil(total/10));page=Math.min(page,pages);
 const [items,summary]=await Promise.all([ReviewModel.find({product:slug}).select("rating body createdAt -_id").sort({createdAt:-1,_id:1}).skip((page-1)*10).limit(10).lean(),ReviewModel.aggregate([{$match:{product:slug}},{$group:{_id:null,average:{$avg:"$rating"}}}])]);return {items,total,average:summary[0]?.average??null,page,pages};
}
export async function writeReview(slug:string,raw:unknown){
 const user=await requireUser();slugSchema.parse(slug);const input=reviewInput.parse(raw);if(!await getProduct(slug))throw new HttpError(404,"Product not found");await limitAuth(`review:${user._id}`,10);
 await ReviewModel.findOneAndUpdate({product:slug,ownerId:user._id},{$set:input,$setOnInsert:{_id:randomUUID()}},{upsert:true,runValidators:true});return true;
}
