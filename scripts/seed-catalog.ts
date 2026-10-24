import mongoose from "mongoose";
import {env} from "../src/lib/env.ts";
import {connectDatabase} from "../src/lib/db.ts";
import {referenceProducts,referenceCategories} from "../src/features/products/reference-data.ts";
import {ProductModel,CategoryModel} from "../src/server/models/catalog.ts";
if(env.MONGODB_DB!=="futera_demo" || env.NODE_ENV==="production")throw Error("Catalog seed requires non-production futera_demo.");
try {
 await connectDatabase();
 // Preflight the complete input before inserting; never replace inventory or owner edits.
 for(const item of referenceProducts){const old=await ProductModel.findOne({slug:item.slug});if(old && (!old.isReference || old.sku!==item.sku))throw Error("Conflicting catalog record; no records overwritten.");}
 let productsInserted=0,categoriesInserted=0;
 for(const item of referenceCategories)if(!await CategoryModel.exists({slug:item.slug})){await CategoryModel.create(item);categoriesInserted++;}
 for(const item of referenceProducts)if(!await ProductModel.exists({slug:item.slug})){await ProductModel.create(item);productsInserted++;}
 console.log(JSON.stringify({database:env.MONGODB_DB,productsInserted,categoriesInserted,products:await ProductModel.countDocuments(),categories:await CategoryModel.countDocuments()}));
} catch {console.error("Catalog seed failed. Connection details are hidden; existing records were not overwritten.");process.exitCode=1;} finally {await mongoose.disconnect();}
