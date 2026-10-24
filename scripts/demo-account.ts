import mongoose from "mongoose";
import {randomUUID} from "node:crypto";
import {env} from "../src/lib/env.ts";
import {connectDatabase} from "../src/lib/db.ts";
import {hashPassword} from "../src/lib/password.ts";
import {UserModel} from "../src/server/models/commerce.ts";
if(env.MONGODB_DB!=="futera_demo"||env.NODE_ENV==="production")throw Error("Isolated demo database required.");
try{await connectDatabase();const email="customer@futera.example.test";const old=await UserModel.findOne({email});if(old&&(!old.isDemo||old.role!=="customer"))throw Error("Conflicting owner account.");if(!old)await UserModel.create({_id:randomUUID(),email,name:"Demo Customer",passwordHash:await hashPassword("Futera-Demo-Customer-2026!"),role:"customer",isDemo:true});console.log("Isolated customer demo account ready. No admin credentials published.");}finally{await mongoose.disconnect();}
