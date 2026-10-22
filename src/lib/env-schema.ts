import { z } from "zod";

const optionalText = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.string().trim().min(1).optional(),
);

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.url().default("http://localhost:3000"),
  CATALOG_SOURCE: z.enum(["sample", "mongodb"]).default("sample"),
  COMMERCE_ENABLED: z.enum(["true", "false"]).default("false"),
  GOOGLE_CLIENT_ID: optionalText,
  GOOGLE_CLIENT_SECRET: optionalText,
  GEMINI_API_KEY: optionalText,
  GEMINI_MODEL: optionalText.pipe(z.string().regex(/^[a-zA-Z0-9.-]+$/).optional()),
  AUTH_SECRET: optionalText.pipe(z.string().min(32).optional()),
  SHIPPING_HOME_MINOR: z.preprocess(v=>v===""?undefined:v,z.coerce.number().int().min(0).max(1000000).optional()),
  SHIPPING_PICKUP_MINOR: z.preprocess(v=>v===""?undefined:v,z.coerce.number().int().min(0).max(1000000).optional()),
  PICKUP_ADDRESS: optionalText,
  MONGODB_URI: optionalText.pipe(z.string().regex(/^mongodb(?:\+srv)?:\/\//).optional()),
  MONGODB_DB: optionalText.pipe(z.string().regex(/^[a-zA-Z0-9_-]+$/).optional()),
}).superRefine((env, ctx) => {
  if(Boolean(env.GOOGLE_CLIENT_ID)!==Boolean(env.GOOGLE_CLIENT_SECRET))ctx.addIssue({code:"custom",path:["GOOGLE_CLIENT_ID"],message:"Configure both Google OAuth variables."});
  if(Boolean(env.GEMINI_API_KEY)!==Boolean(env.GEMINI_MODEL))ctx.addIssue({code:"custom",path:["GEMINI_MODEL"],message:"Configure both Gemini variables."});
  if(env.COMMERCE_ENABLED==="true"&&URL.canParse(env.APP_URL)&&!env.APP_URL.startsWith("https:")&&!["localhost","127.0.0.1"].includes(new URL(env.APP_URL).hostname))ctx.addIssue({code:"custom",path:["APP_URL"],message:"Public commerce requires HTTPS."});
  if (env.COMMERCE_ENABLED === "true" && (!env.AUTH_SECRET || !env.MONGODB_URI || env.CATALOG_SOURCE !== "mongodb" || env.SHIPPING_HOME_MINOR === undefined || env.SHIPPING_PICKUP_MINOR === undefined || !env.PICKUP_ADDRESS)) {
    ctx.addIssue({code:"custom",path:["COMMERCE_ENABLED"],message:"Commerce requires MongoDB, a secret and explicit shipping configuration."});
  }
  if (Boolean(env.MONGODB_URI) !== Boolean(env.MONGODB_DB)) {
    ctx.addIssue({ code: "custom", path: ["MONGODB_URI"], message: "Configure both MongoDB variables or neither." });
  }
  if (env.CATALOG_SOURCE === "mongodb" && !env.MONGODB_URI) {
    ctx.addIssue({ code: "custom", path: ["CATALOG_SOURCE"], message: "MongoDB catalog requires database configuration." });
  }
});

export function parseEnv(input: Record<string, unknown>) {
  const result = envSchema.safeParse(input);
  if (!result.success) {
    // Report variable names only: never print credentials or Zod input values.
    const fields = [...new Set(result.error.issues.map((issue) => issue.path.join(".")))];
    throw new Error(`Invalid environment configuration: ${fields.join(", ")}`);
  }
  return result.data;
}


