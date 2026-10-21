import {MongoMemoryReplSet} from "mongodb-memory-server";
import mongoose from "mongoose";
import {randomBytes,randomUUID} from "node:crypto";
import {spawn} from "node:child_process";
import {adminModels} from "../src/server/models/admin.ts";
import {sampleProducts,sampleCategories} from "../src/features/products/sample-data.ts";
import {ProductModel,CategoryModel} from "../src/server/models/catalog.ts";
import {hashPassword} from "../src/lib/password.ts";
import {commerceModels,UserModel} from "../src/server/models/commerce.ts";
const replica=await MongoMemoryReplSet.create({instanceOpts:[{launchTimeout:60000}],replSet:{count:1},binary:{version:"8.2.6"}});
await mongoose.connect(replica.getUri(),{dbName:"futera_e2e_sample"});
await Promise.all([ProductModel,CategoryModel,...commerceModels,...adminModels].map(m=>m.createIndexes()));
await CategoryModel.create(sampleCategories);
await ProductModel.create(sampleProducts.map(p=>({...p,stock:p.stock?40:0})));
await UserModel.create({_id:randomUUID(),name:"SAMPLE Administrator",email:"admin@example.test",passwordHash:await hashPassword("SAMPLE-admin-password-123!"),role:"admin"});
await mongoose.disconnect();
const child=spawn(process.execPath,["dist/index.js"],{stdio:"inherit",windowsHide:true,env:{...process.env,PORT:"4100",APP_URL:"http://127.0.0.1:3100",CATALOG_SOURCE:"mongodb",COMMERCE_ENABLED:"true",MONGODB_URI:replica.getUri(),MONGODB_DB:"futera_e2e_sample",AUTH_SECRET:randomBytes(48).toString("hex"),SHIPPING_HOME_MINOR:"10000",SHIPPING_PICKUP_MINOR:"0",PICKUP_ADDRESS:"SAMPLE test pickup desk — not a real fulfillment location"}});
let stopping=false;async function stop(code=0){if(stopping)return;stopping=true;child.kill();await replica.stop();process.exit(typeof code==="number"?code:0);}
process.on("SIGTERM",stop);process.on("SIGINT",stop);child.on("exit",stop);
