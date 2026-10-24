import mongoose from "mongoose";
import {env} from "../src/lib/env.ts";
import {connectDatabase} from "../src/lib/db.ts";
import {ProductModel} from "../src/server/models/catalog.ts";
import {catalogEnrichment} from "../src/features/products/catalog-enrichment.ts";
if(env.MONGODB_DB!=="futera_demo"||env.NODE_ENV==="production")throw Error("Isolated demo database required.");
try{await connectDatabase();let updated=0;for(const [slug,fields] of Object.entries(catalogEnrichment)){const doc=await ProductModel.findOne({slug,isReference:true});if(!doc)continue;if(fields.images)doc.images=fields.images;if(fields.marketPrice)doc.marketPrice=fields.marketPrice;await doc.save();updated++;}console.log(JSON.stringify({database:env.MONGODB_DB,referenceRecordsEnriched:updated,inventoryOverwritten:false}));}finally{await mongoose.disconnect();}
