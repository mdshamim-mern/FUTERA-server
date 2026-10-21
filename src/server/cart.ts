
import { cookies } from "../platform.ts";
import { createHash, randomBytes } from "node:crypto";
import mongoose from "mongoose";
import { env } from "../lib/env.ts";
import { connectDatabase } from "../lib/db.ts";
import { currentUser, commerceEnabled } from "./guards.ts";
import { CartModel, OrderModel } from "./models/commerce.ts";
import { parseReferences, type BuildReference } from "../features/builder/schema.ts";
export const guestHash=(token:string)=>`guest:${createHash("sha256").update(token).digest("hex")}`;
export async function ownerKey(create=false){
  commerceEnabled();await connectDatabase();const user=await currentUser();if(user)return `user:${user._id}`;
  const jar=await cookies();let token=jar.get("futera-guest")?.value;
  if(!token||!/^[a-f0-9]{64}$/.test(token)){if(!create)return null;token=randomBytes(32).toString("hex");jar.set("futera-guest",token,{httpOnly:true,sameSite:"lax",secure:env.APP_URL.startsWith("https:"),path:"/",maxAge:2592000});}
  return guestHash(token);
}
export async function readCart(){const key=await ownerKey();return key?parseReferences((await CartModel.findById(key))?.refs.map(r=>({id:r.id,quantity:r.quantity}))):[];}
export function mergeReferences(a:BuildReference[],b:BuildReference[]){const map=new Map(a.map(r=>[r.id,r.quantity]));for(const r of b){const quantity=(map.get(r.id)??0)+r.quantity;if(quantity>8)throw Error("Cart allows up to 8 units per product. Reduce quantity before merging.");map.set(r.id,quantity);}if(map.size>24)throw Error("Cart holds at most 24 different products.");return [...map].map(([id,quantity])=>({id,quantity}));}
export async function writeCart(refs:BuildReference[]){const key=await ownerKey(true);await CartModel.findOneAndUpdate({_id:key},{$set:{refs,expiresAt:key?.startsWith("guest:")?new Date(Date.now()+2592000000):null}},{upsert:true});}
export async function mergeGuestCart(userId:string){
  const token=(await cookies()).get("futera-guest")?.value;if(!token||!/^[a-f0-9]{64}$/.test(token))return;
  const guest=guestHash(token),owner=`user:${userId}`;await connectDatabase();
  await mongoose.connection.transaction(async session=>{
    const existing=await CartModel.findById(owner).session(session),incoming=await CartModel.findById(guest).session(session);
    const refs=mergeReferences(parseReferences(existing?.refs.map(r=>({id:r.id,quantity:r.quantity}))),parseReferences(incoming?.refs.map(r=>({id:r.id,quantity:r.quantity}))));
    await CartModel.findOneAndUpdate({_id:owner},{$set:{refs},$unset:{expiresAt:1}},{upsert:true,session});
    await CartModel.deleteOne({_id:guest},{session});await OrderModel.updateMany({ownerKey:guest},{$set:{ownerKey:owner}},{session});
  });
  (await cookies()).delete("futera-guest");
}
