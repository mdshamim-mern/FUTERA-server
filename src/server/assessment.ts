import mongoose,{Schema} from "mongoose";
import {z} from "zod";
import {requireAdmin,HttpError} from "./guards.ts";
import {env} from "../lib/env.ts";
import {ProductModel} from "./models/catalog.ts";
import {productSchema,type Product} from "../features/products/schema.ts";
const schema=new Schema({_id:String,revision:{type:Number,default:0},items:{type:[Schema.Types.Mixed],default:[]},events:{type:[Schema.Types.Mixed],default:[]}},{strict:"throw",timestamps:true,autoIndex:false});
export const AssessmentModel=mongoose.models.AssessmentWorkspace??mongoose.model("AssessmentWorkspace",schema);
const input=z.discriminatedUnion("operation",[
 z.strictObject({operation:z.literal("create"),revision:z.number().int().nonnegative(),source:z.string().min(1).max(100),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100)}),
 z.strictObject({operation:z.literal("update"),revision:z.number().int().nonnegative(),slug:z.string().max(100),name:z.string().trim().min(2).max(140),description:z.string().trim().min(10).max(2000),priceMinor:z.number().int().min(1).max(100000000),stock:z.number().int().min(0).max(10000)}),
 z.strictObject({operation:z.literal("delete"),revision:z.number().int().nonnegative(),slug:z.string().max(100)}),
 z.strictObject({operation:z.literal("reset"),revision:z.number().int().nonnegative()})]);
async function actor(){const user=await requireAdmin();if(env.MONGODB_DB!=="futera_demo")throw new HttpError(404,"Assessment workspace unavailable");return user;}
export async function assessmentReport(raw:unknown){const user=await actor();const query=z.object({q:z.string().max(100).default(""),page:z.coerce.number().int().min(1).max(100).default(1)}).parse(raw);const doc=await AssessmentModel.findById(user._id).lean();const items:Product[]=(doc?.items??[]).map((p:unknown)=>productSchema.parse(p));const filtered=items.filter(p=>`${p.name} ${p.slug}`.toLowerCase().includes(query.q.toLowerCase()));const pages=Math.max(1,Math.ceil(filtered.length/5)),page=Math.min(query.page,pages);return {revision:doc?.revision??0,items:filtered.slice((page-1)*5,page*5),total:filtered.length,page,pages,events:(doc?.events??[]).slice(-10).reverse()};}
export async function mutateAssessment(raw:unknown){const user=await actor();const data=input.parse(raw);await AssessmentModel.updateOne({_id:user._id},{$setOnInsert:{items:[],events:[],revision:0}},{upsert:true});const doc=await AssessmentModel.findById(user._id);if(doc.revision!==data.revision)throw new HttpError(409,"Workspace changed. Reload before saving.");let items:Product[]=doc.items.map((p:unknown)=>productSchema.parse(p));
 if(data.operation==="create"){if(items.length>=20)throw new HttpError(409,"Workspace limit: 20 products");if(items.some(p=>p.slug===data.slug))throw new HttpError(409,"Choose a different workspace slug");const source=await ProductModel.findOne({slug:data.source,active:true}).lean();if(!source)throw new HttpError(404,"Source product not found");const fields=Object.fromEntries(Object.keys(productSchema.shape).filter(key=>(source as unknown as Record<string,unknown>)[key]!=null).map(key=>[key,(source as unknown as Record<string,unknown>)[key]]));items.push(productSchema.parse({...fields,slug:data.slug}));}
 else if(data.operation==="reset")items=[];
 else {const index=items.findIndex(p=>p.slug===data.slug);if(index<0)throw new HttpError(404,"Workspace product not found");if(data.operation==="delete")items.splice(index,1);else items[index]=productSchema.parse({...items[index],name:data.name,description:data.description,priceMinor:data.priceMinor,stock:data.stock});}
 const result=await AssessmentModel.updateOne({_id:user._id,revision:data.revision},{$set:{items},$inc:{revision:1},$push:{events:{$each:[{operation:data.operation,at:new Date().toISOString(),target:"slug" in data?data.slug:"workspace"}],$slice:-100}}});if(!result.modifiedCount)throw new HttpError(409,"Workspace changed. Reload before saving.");return true;
}
