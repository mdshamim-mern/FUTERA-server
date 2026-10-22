import {referenceProducts,referenceCategories} from "../features/products/reference-data.ts";

import { cache } from "../platform.ts";
import { env } from "../lib/env.ts";
import { connectDatabase } from "../lib/db.ts";
import { CategoryModel, ProductModel } from "./models/catalog.ts";
import { categorySchema, productSchema, type Product } from "../features/products/schema.ts";
import { sampleCategories, sampleProducts } from "../features/products/sample-data.ts";
import { buildProductFilter, filterSampleProducts, pageSize, productSort, type CatalogQuery } from "../features/products/query.ts";

function productDto(document: Record<string, unknown>): Product {
  const { _id, __v, createdAt, updatedAt, ...product } = document;
  void [_id, __v, createdAt, updatedAt];
  return productSchema.parse(product);
}
export const getCategories = cache(async () => {
  if (env.CATALOG_SOURCE === "sample") return sampleCategories;
  if(env.CATALOG_SOURCE==="reference")return referenceCategories;
  await connectDatabase();
  const docs = await CategoryModel.find({ active: true }).sort({ sortOrder: 1 }).lean();
  return docs.map((doc) => {
    const { _id, __v, createdAt, updatedAt, ...category } = doc;
    void [_id, __v, createdAt, updatedAt];
    return categorySchema.parse(category);
  });
});
export const getBrands = cache(async (): Promise<string[]> => {
  if (env.CATALOG_SOURCE !== "mongodb") return [...new Set((env.CATALOG_SOURCE==="reference"?referenceProducts:sampleProducts).map((product) => product.brand))].sort();
  await connectDatabase();
  return (await ProductModel.distinct("brand", { active: true })).sort();
});
export async function listProducts(query: CatalogQuery) {
  if (env.CATALOG_SOURCE !== "mongodb") {
    const products = filterSampleProducts(env.CATALOG_SOURCE==="reference"?referenceProducts:sampleProducts, query);
    const pages = Math.max(1, Math.ceil(products.length / pageSize));
    const page = Math.min(query.page, pages);
    return { products: products.slice((page - 1) * pageSize, page * pageSize), total: products.length, page, pages };
  }
  await connectDatabase();
  const filter = buildProductFilter(query);
  const total = await ProductModel.countDocuments(filter).maxTimeMS(5000);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(query.page, pages);
  const docs = await ProductModel.find(filter).sort(productSort(query)).skip((page - 1) * pageSize).limit(pageSize).maxTimeMS(5000).lean();
  return { products: docs.map(productDto), total, page, pages };
}
export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  if (!/^[a-z0-9-]{1,100}$/.test(slug)) return null;
  if (env.CATALOG_SOURCE !== "mongodb") return (env.CATALOG_SOURCE==="reference"?referenceProducts:sampleProducts).find((p) => p.slug === slug && p.active) ?? null;
  await connectDatabase();
  const doc = await ProductModel.findOne({ slug, active: true }).lean();
  return doc ? productDto(doc) : null;
});
export async function getProducts(slugs: string[]) {
  const products = await Promise.all(slugs.map(getProduct));
  return products.filter((p): p is Product => p !== null);
}
/** Bounded builder picker inventory; production pagination can replace this contract. */
export async function getBuilderCatalog(): Promise<Product[]> {
  if (env.CATALOG_SOURCE !== "mongodb") return env.CATALOG_SOURCE==="reference"?referenceProducts:sampleProducts;
  await connectDatabase();
  return (await ProductModel.find({ active: true }).sort({ category: 1, priceMinor: 1 }).limit(1000).maxTimeMS(5000).lean()).map(productDto);
}

