import {beforeAll,afterAll,it,expect} from "vitest";
import {MongoMemoryReplSet} from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import type {Express} from "express";
let app:Express,replica:MongoMemoryReplSet;
const origin="http://localhost:3000";
beforeAll(async()=>{replica=await MongoMemoryReplSet.create({binary:{version:"8.2.6"},instanceOpts:[{launchTimeout:60000}],replSet:{count:1}});Object.assign(process.env,{NODE_ENV:"test",APP_URL:origin,MONGODB_URI:replica.getUri(),MONGODB_DB:"futera_api_sample",CATALOG_SOURCE:"mongodb",COMMERCE_ENABLED:"true",AUTH_SECRET:"TEST-ONLY-ephemeral-api-secret-not-production",SHIPPING_HOME_MINOR:"10000",SHIPPING_PICKUP_MINOR:"0",PICKUP_ADDRESS:"SAMPLE test pickup"});app=(await import("../src/app.ts")).default;await (await import("../src/lib/db.ts")).connectDatabase();const {ProductModel,CategoryModel}=await import("../src/server/models/catalog.ts");const {sampleProducts,sampleCategories}=await import("../src/features/products/sample-data.ts");await ProductModel.create(sampleProducts);await CategoryModel.create(sampleCategories);});
afterAll(async()=>{await mongoose.disconnect();await replica?.stop();});
it("serves health and public filtered catalog",async()=>{expect((await request(app).get("/api/health")).status).toBe(200);const result=await request(app).get("/v1/products?category=cpu&stock=available");expect(result.status).toBe(200);expect(result.body.data.products.every((p:{category:string;stock:number})=>p.category==="cpu"&&p.stock>0)).toBe(true);});
it("rejects cross-origin state changes",async()=>{expect((await request(app).post("/v1/auth/login").set("Origin","https://attacker.invalid").send({})).status).toBe(403);});
it("creates customer-only sessions, isolates accounts, blocks every admin mutation and revokes logout",async()=>{
 const agent=request.agent(app);const result=await agent.post("/v1/auth/register").set("Origin",origin).send({name:"SAMPLE API User",email:"api@example.test",password:"SAMPLE-api-password-123!",role:"admin"});expect(result.status).toBe(200);expect(result.body.data.role).toBe("customer");expect(result.headers["set-cookie"].join(";")).toContain("HttpOnly");
 expect((await agent.get("/v1/account")).status).toBe(200);expect((await request(app).get("/v1/account")).status).toBe(401);
 for(const operation of ["product","archive","inventory","coupon","shipping","compatibility","role","order"]){expect((await agent.post("/v1/admin/mutations").set("Origin",origin).send({operation})).status).toBe(403);expect((await request(app).post("/v1/admin/mutations").set("Origin",origin).send({operation})).status).toBe(401);}
 expect((await agent.patch("/v1/builds/00000000-0000-4000-8000-000000000001").set("Origin",origin).send({operation:"delete"})).status).toBe(404);
 await agent.post("/v1/auth/logout").set("Origin",origin).send({});expect((await agent.get("/v1/account")).status).toBe(401);
});
