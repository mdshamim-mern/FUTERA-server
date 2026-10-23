import {afterEach,expect,it,vi} from "vitest";
vi.mock("node:fs",()=>({existsSync:()=>false}));
afterEach(()=>{vi.unstubAllEnvs();vi.resetModules();});
it.each(["false","true"])("loads CHECKOUT_ENABLED=%s from the actual runtime environment",async(flag)=>{
  vi.resetModules();
  for(const [key,value] of Object.entries({NODE_ENV:"test",APP_URL:"http://localhost:3000",COMMERCE_ENABLED:"false",CATALOG_SOURCE:"sample",MONGODB_URI:"",MONGODB_DB:"",AUTH_SECRET:"",GOOGLE_CLIENT_ID:"",GOOGLE_CLIENT_SECRET:"",GEMINI_API_KEY:"",GEMINI_MODEL:"",CHECKOUT_ENABLED:flag}))vi.stubEnv(key,value);
  const {env}=await import("../src/lib/env.ts");
  expect(env.CHECKOUT_ENABLED).toBe(flag);
});
