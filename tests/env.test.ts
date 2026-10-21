import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env-schema";

describe("environment validation", () => {
  it("requires explicit commerce shipping, secret and persisted inventory",()=>{
    expect(()=>parseEnv({COMMERCE_ENABLED:"true"})).toThrow("COMMERCE_ENABLED");
    expect(parseEnv({SHIPPING_HOME_MINOR:""}).SHIPPING_HOME_MINOR).toBeUndefined();
  });
  it("requires HTTPS for publicly hosted commerce",()=>{
    expect(()=>parseEnv({COMMERCE_ENABLED:"true",APP_URL:"invalid-private-input"})).toThrow("Invalid environment configuration: APP_URL, COMMERCE_ENABLED");
    expect(()=>parseEnv({COMMERCE_ENABLED:"true",APP_URL:"http://example.test",AUTH_SECRET:"test-only-secret-not-for-deployment-123",CATALOG_SOURCE:"mongodb",MONGODB_URI:"mongodb://localhost:27017",MONGODB_DB:"test",SHIPPING_HOME_MINOR:10000,SHIPPING_PICKUP_MINOR:0,PICKUP_ADDRESS:"Sample"})).toThrow("APP_URL");
  });
  it("allows the foundation to run without MongoDB", () => {
    expect(parseEnv({ MONGODB_URI: "", MONGODB_DB: "" }).MONGODB_URI).toBeUndefined();
  });
  it("requires a complete database configuration", () => {
    expect(() => parseEnv({ MONGODB_URI: "mongodb://localhost:27017" })).toThrow("Invalid environment");
  });
  it("rejects MongoDB catalog mode without credentials", () => {
    expect(() => parseEnv({ CATALOG_SOURCE: "mongodb" })).toThrow("CATALOG_SOURCE");
  });
  it("rejects invalid config without leaking credentials", () => {
    expect(() => parseEnv({ MONGODB_URI: "secret-password", MONGODB_DB: "futera" })).toThrow("Invalid environment configuration: MONGODB_URI");
    expect(() => parseEnv({ APP_URL: "not-a-url" })).toThrow("APP_URL");
  });
});
