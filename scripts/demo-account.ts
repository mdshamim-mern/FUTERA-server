import mongoose from "mongoose";
import {randomUUID} from "node:crypto";
import {env} from "../src/lib/env.ts";
import {connectDatabase} from "../src/lib/db.ts";
import {hashPassword} from "../src/lib/password.ts";
import {UserModel} from "../src/server/models/commerce.ts";
if(env.MONGODB_DB!=="futera_demo"||env.NODE_ENV==="production")throw Error("Isolated demo database required.");
try{await connectDatabase();for(const input of [{email:"customer@futera.example.test",name:"Demo Customer",role:"customer",password:"Futera-Demo-Customer-2026!"},{email:"admin@futera.example.test",name:"Demo Administrator",role:"admin",password:"Futera-Demo-ReadOnly-2026!"}]){const old=await UserModel.findOne({email:input.email});if(old&&(!old.isDemo||old.role!==input.role))throw Error("Conflicting owner account.");if(!old)await UserModel.create({_id:randomUUID(),email:input.email,name:input.name,passwordHash:await hashPassword(input.password),role:input.role,isDemo:true});}console.log("Isolated customer and read-only administrator demo accounts ready.");}finally{await mongoose.disconnect();}
