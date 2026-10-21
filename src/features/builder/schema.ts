import { z } from "zod";
import { slugSchema } from "../products/schema.ts";
export const requiredCategories = ["cpu", "motherboard", "ram", "ssd", "case", "psu", "cpu-cooler"] as const;
export const referenceSchema = z.strictObject({ id: slugSchema, quantity: z.number().int().min(1).max(8) });
export type BuildReference = z.infer<typeof referenceSchema>;
/** Invalid rows are ignored, never coerced. Bound input before resolving IDs. */
export function parseReferences(input: unknown): BuildReference[] {
  if (!Array.isArray(input) || input.length > 24) return [];
  const refs = new Map<string, BuildReference>();
  for (const raw of input) { const parsed=referenceSchema.safeParse(raw); if (parsed.success && !refs.has(parsed.data.id)) refs.set(parsed.data.id,parsed.data); }
  return [...refs.values()];
}
export function decodeBuild(value: unknown): BuildReference[] {
  if (typeof value !== "string" || value.length > 4000) return [];
  try { return parseReferences(JSON.parse(value)); } catch { return []; }
}
export const encodeBuild = (refs: BuildReference[]) => JSON.stringify(parseReferences(refs));
