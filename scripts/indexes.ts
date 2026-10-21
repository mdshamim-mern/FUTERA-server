import {connectDatabase} from "../src/lib/db.ts";
import mongoose from "mongoose";
import {commerceModels} from "../src/server/models/commerce.ts";
import {adminModels} from "../src/server/models/admin.ts";
import {ProductModel,CategoryModel} from "../src/server/models/catalog.ts";
import {SessionModel} from "../src/auth.ts";
await connectDatabase();for(const model of [...commerceModels,...adminModels,ProductModel,CategoryModel,SessionModel])await model.createIndexes();await mongoose.disconnect();console.log("Indexes created without dropping existing indexes.");
