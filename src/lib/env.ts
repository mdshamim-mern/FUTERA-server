import {existsSync} from "node:fs";
import {loadEnvFile} from "node:process";
// Tests must never load real provider credentials from local files.
if(process.env.NODE_ENV!=="test")for(const file of [".env.local",".env"])if(existsSync(file))loadEnvFile(file);

import { parseEnv } from "./env-schema.ts";

export const env = parseEnv({
  GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET,GEMINI_API_KEY:process.env.GEMINI_API_KEY,GEMINI_MODEL:process.env.GEMINI_MODEL,
  NODE_ENV: process.env.NODE_ENV,
  APP_URL: process.env.APP_URL,
  CATALOG_SOURCE: process.env.CATALOG_SOURCE,
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB: process.env.MONGODB_DB,
  COMMERCE_ENABLED: process.env.COMMERCE_ENABLED,
  CHECKOUT_ENABLED: process.env.CHECKOUT_ENABLED,
  AUTH_SECRET: process.env.AUTH_SECRET,
  SHIPPING_HOME_MINOR: process.env.SHIPPING_HOME_MINOR,
  SHIPPING_PICKUP_MINOR: process.env.SHIPPING_PICKUP_MINOR,
  PICKUP_ADDRESS: process.env.PICKUP_ADDRESS,
});

