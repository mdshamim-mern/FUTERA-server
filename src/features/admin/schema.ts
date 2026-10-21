import {z} from "zod";
import {productSchema,slugSchema} from "../products/schema.ts";
const money=z.number().int().min(0).max(100_000_000);
const reason=z.string().trim().min(5).max(300);
export const shippingSchema=z.strictObject({homeMinor:money,pickupMinor:money,pickupAddress:z.string().trim().min(5).max(300)});
export const compatibilitySchema=z.strictObject({sockets:z.array(z.string().min(1).max(60)).max(100),formFactors:z.array(z.string().min(1).max(60)).max(100),overrides:z.array(z.strictObject({partIds:z.array(slugSchema).min(2).max(4),status:z.enum(["warning","error"]),message:z.string().min(5).max(300)})).max(100)});
export const couponSchema=z.strictObject({code:z.string().regex(/^[A-Z0-9-]{1,30}$/),percent:z.number().int().min(1).max(100),minimumMinor:money,maximumDiscountMinor:money,startsAt:z.number().int().nonnegative(),endsAt:z.number().int().positive(),maxUses:z.number().int().min(1).max(1_000_000),active:z.boolean(),sampleOnly:z.boolean()}).refine(v=>v.endsAt>v.startsAt,"End must follow start");
export const adminMutationSchema=z.discriminatedUnion("operation",[
 z.strictObject({operation:z.literal("product"),product:productSchema,existing:z.boolean(),expectedUpdatedAt:z.string().optional(),reason}),
 z.strictObject({operation:z.literal("archive"),ids:z.array(slugSchema).min(1).max(50),reason}),
 z.strictObject({operation:z.literal("inventory"),id:slugSchema,delta:z.number().int().min(-100000).max(100000).refine(n=>n!==0),expectedStock:z.number().int().min(0),reason}),
 z.strictObject({operation:z.literal("coupon"),coupon:couponSchema,reason}),
 z.strictObject({operation:z.literal("shipping"),value:shippingSchema,reason}),
 z.strictObject({operation:z.literal("compatibility"),value:compatibilitySchema,reason}),
 z.strictObject({operation:z.literal("role"),id:z.uuid(),role:z.enum(["customer","admin"]),reason}),
 z.strictObject({operation:z.literal("order"),id:z.uuid(),next:z.enum(["Assembling","Testing","Shipped","Delivered"]),reason}),
]);
export type AdminMutation=z.infer<typeof adminMutationSchema>;
