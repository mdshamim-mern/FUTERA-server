import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
const audit = new Schema({ actorId: {type:String,required:true}, action:{type:String,required:true}, target:{type:String,required:true}, reason:{type:String,required:true}, before:Schema.Types.Mixed, after:Schema.Types.Mixed }, {timestamps:true,strict:"throw",autoIndex:false});
audit.index({createdAt:-1}); audit.index({target:1,createdAt:-1});
const setting = new Schema({_id:{type:String,required:true}, revision:{type:Number,default:0}, value:{type:Schema.Types.Mixed,required:true}}, {timestamps:true,strict:"throw",autoIndex:false});
function model<T extends Schema>(name:string,schema:T):Model<InferSchemaType<T>> {return (mongoose.models[name]??mongoose.model(name,schema)) as Model<InferSchemaType<T>>;}
export const AuditModel=model("AdminAudit",audit), SettingModel=model("AdminSetting",setting);
export const adminModels=[AuditModel,SettingModel];
