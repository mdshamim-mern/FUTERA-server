import {z} from "zod";
import {requireAdmin,HttpError} from "./guards.ts";
import {ProductModel} from "./models/catalog.ts";
import {UserModel,OrderModel,CouponModel,orderStatuses} from "./models/commerce.ts";
import {AuditModel} from "./models/admin.ts";
import {shippingSettings,compatibilitySettings} from "./settings.ts";
export const reportQuery=z.object({view:z.enum(["overview","products","orders","users","coupons","shipping","compatibility","audit"]).default("overview"),page:z.coerce.number().int().min(1).max(10000).default(1),q:z.string().trim().max(100).default(""),id:z.string().max(100).default(""),status:z.string().max(30).default("")});
export const escapeSearch=(text:string)=>text.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
export function pagination(total:number,requested:number){const pages=Math.max(1,Math.ceil(total/20)),page=Math.min(requested,pages);return {total,page,pages,pageSize:20,skip:(page-1)*20};}
export async function adminReport(raw:unknown){
 const actor=await requireAdmin(),q=reportQuery.parse(raw),demo=Boolean(actor.isDemo);
 const demoIds=demo?(await UserModel.find({isDemo:true,role:"customer"}).select("_id").lean()).map(u=>`user:${u._id}`):[];
 const scope=demo?{ownerKey:{$in:demoIds}}:{};
 if(q.view==="shipping")return shippingSettings();if(q.view==="compatibility")return compatibilitySettings();
 if(q.view==="products"){const filter=q.q?{$text:{$search:q.q}}:{};const meta=pagination(await ProductModel.countDocuments(filter),q.page);const items=await ProductModel.find(filter).sort({slug:1}).skip(meta.skip).limit(20);return {...meta,items,item:q.id?await ProductModel.findOne({slug:q.id}):null,demoReadOnly:demo};}
 if(q.view==="orders"){const filter={...scope,...(orderStatuses.some(s=>s===q.status)?{status:q.status as typeof orderStatuses[number]}:{}),...(q.q?{$or:[{_id:{$regex:escapeSearch(q.q),$options:"i"}},{"address.name":{$regex:escapeSearch(q.q),$options:"i"}}]}:{})};const meta=pagination(await OrderModel.countDocuments(filter),q.page);const item=q.id&&z.uuid().safeParse(q.id).success?await OrderModel.findOne({_id:q.id,...scope}):null;if(q.id&&!item)throw new HttpError(404,"Order not found");return {...meta,items:await OrderModel.find(filter).sort({createdAt:-1,_id:1}).skip(meta.skip).limit(20),item,demoReadOnly:demo};}
 if(q.view==="users"){const filter={...(demo?{isDemo:true}:{}),...(q.q?{$or:[{email:{$regex:escapeSearch(q.q),$options:"i"}},{name:{$regex:escapeSearch(q.q),$options:"i"}}]}:{})};const meta=pagination(await UserModel.countDocuments(filter),q.page);return {...meta,items:await UserModel.find(filter).select("name email role disabled").sort({_id:1}).skip(meta.skip).limit(20).lean(),demoReadOnly:demo};}
 if(q.view==="coupons"){const filter=q.q?{_id:{$regex:escapeSearch(q.q),$options:"i"}}:{};const meta=pagination(await CouponModel.countDocuments(filter),q.page);return {...meta,items:await CouponModel.find(filter).sort({_id:1}).skip(meta.skip).limit(20),item:q.id?await CouponModel.findById(q.id):null,demoReadOnly:demo};}
 if(q.view==="audit"){const filter={...(demo?{actorId:actor._id}:{}),...(q.q?{$or:[{action:{$regex:escapeSearch(q.q),$options:"i"}},{target:{$regex:escapeSearch(q.q),$options:"i"}},{reason:{$regex:escapeSearch(q.q),$options:"i"}}]}:{})};const meta=pagination(await AuditModel.countDocuments(filter),q.page);return {...meta,items:await AuditModel.find(filter).sort({createdAt:-1,_id:1}).skip(meta.skip).limit(20),demoReadOnly:demo};}
 const [orders,low,pending,trend]=await Promise.all([OrderModel.aggregate([{$match:scope},{$group:{_id:"$isSample",value:{$sum:"$totalMinor"},count:{$sum:1}}}]),ProductModel.countDocuments({active:true,stock:{$lte:5}}),OrderModel.countDocuments({...scope,status:{$ne:"Delivered"}}),OrderModel.aggregate([{$match:scope},{$group:{_id:{$dateToString:{format:"%Y-%m",date:"$createdAt"}},value:{$sum:"$totalMinor"},orders:{$sum:1}}},{$sort:{_id:1}}])]);return {orders,low,pending,trend,demoReadOnly:demo};
}

