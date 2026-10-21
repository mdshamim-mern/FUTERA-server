
import { cookies } from "../platform.ts";
import { z } from "zod";
import { slugSchema } from "../features/products/schema.ts";
export const modeSchema = z.enum(["cart", "build"]);
export type SelectionMode = z.infer<typeof modeSchema>;
export const selectionCookie = (mode: SelectionMode) => `futera_${mode}_preview`;
export async function readSelection(mode: SelectionMode): Promise<string[]> {
  try {
    const value = (await cookies()).get(selectionCookie(mode))?.value ?? "[]";
    const parsed = z.array(slugSchema).max(12).safeParse(JSON.parse(value));
    return parsed.success ? [...new Set(parsed.data)] : [];
  } catch { return []; }
}
