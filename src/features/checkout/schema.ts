import {z} from "zod";
import locations from "./data/locations.json" with { type: "json" };
export {locations};
export const addressSchema=z.object({name:z.string().trim().min(2).max(80),phone:z.string().regex(/^01\d{9}$/, "Use 01XXXXXXXXX."),division:z.string().max(10),district:z.string().max(10),upazila:z.string().max(10),street:z.string().trim().min(5).max(300)}).superRefine((a,ctx)=>{
  if(!locations.find(d=>d.id===a.division)?.districts.find(d=>d.id===a.district)?.upazilas.some(u=>u.id===a.upazila))ctx.addIssue({code:"custom",path:["upazila"],message:"Choose a valid division, district and upazila."});
});
export type Address=z.infer<typeof addressSchema>;
export const checkoutSchema=z.object({address:addressSchema,method:z.enum(["home","pickup"]),coupon:z.string().trim().toUpperCase().max(30).regex(/^[A-Z0-9-]*$/),payment:z.literal("COD")});
export type CheckoutInput=z.infer<typeof checkoutSchema>;
export function checkoutForm(form:FormData){return checkoutSchema.parse({address:Object.fromEntries(["name","phone","division","district","upazila","street"].map(k=>[k,form.get(k)])),method:form.get("method"),coupon:form.get("coupon")??"",payment:form.get("payment")});}
