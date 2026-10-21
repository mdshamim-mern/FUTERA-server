import {connectDatabase} from "../src/lib/db.ts";
import {env} from "../src/lib/env.ts";
import mongoose from "mongoose";
import {sampleProducts,sampleCategories} from "../src/features/products/sample-data.ts";
import {ProductModel,CategoryModel} from "../src/server/models/catalog.ts";
if(env.NODE_ENV==="production"||!env.MONGODB_DB?.endsWith("_sample"))throw Error("Seed requires a non-production _sample database.");
await connectDatabase();for(const item of sampleCategories){const old=await CategoryModel.findOne({slug:item.slug});if(old&&!old.isSample)throw Error("Refusing to overwrite live category");if(old){old.set(item);await old.save();}else await CategoryModel.create(item);}for(const item of sampleProducts){const old=await ProductModel.findOne({slug:item.slug});if(old&&!old.isSample)throw Error("Refusing to overwrite live product");if(old){old.set(item);await old.save();}else await ProductModel.create(item);}await mongoose.disconnect();console.log("Clearly labeled SAMPLE fixtures loaded.");
