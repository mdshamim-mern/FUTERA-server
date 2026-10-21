
import mongoose from "mongoose";
import { env } from "./env.ts";

type DatabaseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};
const globalDb = globalThis as typeof globalThis & { futeraDb?: DatabaseCache };
const cache = globalDb.futeraDb ??= { connection: null, promise: null };

export async function connectDatabase() {
  if (!env.MONGODB_URI || !env.MONGODB_DB) {
    throw new Error("Database is not configured. Set MONGODB_URI and MONGODB_DB.");
  }
  if (cache.connection && mongoose.connection.readyState === 1) return cache.connection;
  cache.promise ??= mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB,
    bufferCommands: false,
    autoIndex: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });
  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch {
    // Driver errors may contain connection details. Keep the public failure generic.
    throw new Error("Database connection failed.");
  } finally {
    cache.promise = null;
  }
}
