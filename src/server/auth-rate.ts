
import { createHash } from "node:crypto";
import { connectDatabase } from "../lib/db.ts";
import { RateModel } from "./models/commerce.ts";
export async function limitAuth(key:string,maximum=8){
  await connectDatabase();const window=Math.floor(Date.now()/900000);
  const id=createHash("sha256").update(`${key}:${window}`).digest("hex");
  const value=await RateModel.findOneAndUpdate({_id:id},{$inc:{hits:1},$setOnInsert:{expiresAt:new Date((window+2)*900000)}},{upsert:true,returnDocument:"after"});
  if(value.hits>maximum)throw new Error("Too many attempts. Try again in 15 minutes.");
}
