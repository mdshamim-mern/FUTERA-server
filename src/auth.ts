import {createHash,randomBytes,randomUUID} from "node:crypto";
import mongoose,{Schema} from "mongoose";
import {z} from "zod";
import {context,cookies} from "./platform.ts";
import {env} from "./lib/env.ts";
import {connectDatabase} from "./lib/db.ts";
import {hashPassword,verifyPassword} from "./lib/password.ts";
import {UserModel} from "./server/models/commerce.ts";
import {limitAuth} from "./server/auth-rate.ts";
import {commerceEnabled,HttpError} from "./server/guards.ts";
import {mergeGuestCart} from "./server/cart.ts";
const schema=new Schema({_id:{type:String,required:true},userId:{type:String,required:true},version:{type:Number,required:true},expiresAt:{type:Date,required:true}},{autoIndex:false});schema.index({expiresAt:1},{expireAfterSeconds:0});
export const SessionModel=mongoose.models.ApiSession??mongoose.model("ApiSession",schema);
const hash=(token:string)=>createHash("sha256").update(token).digest("hex");
const credentials=z.object({email:z.email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(12).max(128)});
export async function loadSession(){if(env.COMMERCE_ENABLED!=="true")return;const token=(await cookies()).get("futera-session")?.value;if(!token||!/^[a-f0-9]{64}$/.test(token))return;await connectDatabase();const session=await SessionModel.findOne({_id:hash(token),expiresAt:{$gt:new Date()}});if(!session)return;const user=await UserModel.findById(session.userId);if(user&&!user.disabled&&user.sessionVersion===session.version)context.getStore()!.userId=user._id;}
export async function login(raw:unknown,register=false){
 commerceEnabled();await limitAuth("api-login-global",300);const input=credentials.parse(raw);await limitAuth(`api-login:${input.email}`,8);
 if(register){const name=z.object({name:z.string().trim().min(2).max(80)}).parse(raw).name;await UserModel.create({_id:randomUUID(),name,email:input.email,passwordHash:await hashPassword(input.password),role:"customer"});}
 const user=await UserModel.findOne({email:input.email}).select("+passwordHash");const valid=await verifyPassword(input.password,user?.passwordHash??`scrypt-v1:${"0".repeat(32)}:${"0".repeat(128)}`);if(!user||user.disabled||!valid)throw new HttpError(401,"Unable to log in. Check your credentials.");
 await mergeGuestCart(user._id);const token=randomBytes(32).toString("hex");await SessionModel.create({_id:hash(token),userId:user._id,version:user.sessionVersion,expiresAt:new Date(Date.now()+86400000)});
 (await cookies()).set("futera-session",token,{httpOnly:true,sameSite:"lax",secure:env.APP_URL.startsWith("https:"),path:"/",maxAge:86400});context.getStore()!.userId=user._id;
 return {id:user._id,name:user.name,email:user.email,role:user.role};
}
export async function logout(){const id=context.getStore()?.userId;if(id)await UserModel.updateOne({_id:id},{$inc:{sessionVersion:1}});const token=(await cookies()).get("futera-session")?.value;if(token)await SessionModel.deleteOne({_id:hash(token)});(await cookies()).delete("futera-session");}
