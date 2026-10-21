
import type {ClientSession} from "mongoose";
import {env} from "../lib/env.ts";
import {connectDatabase} from "../lib/db.ts";
import {SettingModel} from "./models/admin.ts";
import {shippingSchema,compatibilitySchema} from "../features/admin/schema.ts";
export async function shippingSettings(session?:ClientSession){
 await connectDatabase(); const stored=await SettingModel.findById("shipping").session(session??null);
 return shippingSchema.parse(stored?.value??{homeMinor:env.SHIPPING_HOME_MINOR,pickupMinor:env.SHIPPING_PICKUP_MINOR,pickupAddress:env.PICKUP_ADDRESS??"Pickup desk"});
}
export async function compatibilitySettings(){
 if(env.CATALOG_SOURCE!=="mongodb")return {sockets:[],formFactors:[],overrides:[]};
 await connectDatabase();const stored=await SettingModel.findById("compatibility");
 return compatibilitySchema.parse(stored?.value??{sockets:[],formFactors:[],overrides:[]});
}
