import { describe, expect, it } from "vitest";
import { categoryCodes, productSchema } from "@/features/products/schema";
import { sampleCategories, sampleProducts } from "@/features/products/sample-data";
import { CategoryModel, ProductModel } from "@/server/models/catalog";

describe("catalog persistence validation", () => {
  it("provides ten validated fictional products per category", async () => {
    for (const category of categoryCodes) expect(sampleProducts.filter((p) => p.category === category)).toHaveLength(10);
    for (const data of sampleCategories) await expect(new CategoryModel(data).validate()).resolves.toBeUndefined();
    for (const data of sampleProducts) await expect(new ProductModel(data).validate()).resolves.toBeUndefined();
  });
  it("rejects cross-category specs and negative prices in both validators", async () => {
    const data = { ...sampleProducts[0], specs: { wattage: 650 }, priceMinor: -1 };
    expect(productSchema.safeParse(data).success).toBe(false);
    await expect(new ProductModel(data).validate()).rejects.toThrow();
  });
  it("retains unknown specs as null and rejects unlabeled sample records", () => {
    expect(productSchema.parse({ ...sampleProducts[0], specs: { ...sampleProducts[0].specs, socket: null } }).specs.socket).toBeNull();
    expect(productSchema.safeParse({ ...sampleProducts[0], name: "Real offer" }).success).toBe(false);
  });
  it("declares unique identity and the query indexes", () => {
    const indexes = ProductModel.schema.indexes().map(([keys]) => keys);
    expect(indexes).toContainEqual({ slug: 1 });
    expect(indexes).toContainEqual({ sku: 1 });
    expect(indexes).toContainEqual({ active: 1, stock: 1 });
    expect(indexes).toContainEqual({ name: "text", brand: "text", description: "text" });
  });
});
