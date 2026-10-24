import mongoose from "mongoose";
import {env} from "../src/lib/env.ts";
import {connectDatabase} from "../src/lib/db.ts";
import {referenceProducts} from "../src/features/products/reference-data.ts";
import {productSchema} from "../src/features/products/schema.ts";
import {ProductModel} from "../src/server/models/catalog.ts";
if(env.MONGODB_DB!=="futera_demo"||env.NODE_ENV==="production")throw Error("Requires isolated non-production futera_demo.");
try{
 await connectDatabase();
 const original=referenceProducts.find(p=>p.slug==="amd-ryzen-9-7950x")!;
 const product=productSchema.parse({...original,isReference:false,isDemo:true,sku:"DEMO-RYZEN-9-7950X",priceMinor:original.marketPrice!.amountMinor,stock:12,description:"A 16-core, 32-thread AM5 processor for demanding desktop workloads. Compare its 170W TDP and motherboard requirements in PC Builder. Demo inventory with illustrative pricing and availability.",marketPrice:{...original.marketPrice!,note:"Demo price inspired by the linked tray-processor listing; not a retailer offer. Packaging in credited photographs may differ."}});
 const existing=await ProductModel.findOne({slug:product.slug});
 if(existing?.isDemo){console.log("Demo inventory already activated; no owner edits or stock changed.");}
 else{
  if(existing && (!existing.isReference||existing.sku!==original.sku))throw Error("Conflict; owner record preserved.");
  const doc=existing??new ProductModel();doc.set(product);await doc.save();console.log(JSON.stringify({database:env.MONGODB_DB,activated:product.slug,stock:product.stock,priceMinor:product.priceMinor}));
 }
}catch{console.error("Demo activation failed; credentials hidden.");process.exitCode=1;}finally{await mongoose.disconnect();}
