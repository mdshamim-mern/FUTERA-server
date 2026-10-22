import { categoryCodes, type CategoryCode, type Product } from "./schema.ts";

export type SearchParams = Record<string, string | string[] | undefined>;
export const pageSize = 12;
const sorts = ["featured", "price-asc", "price-desc", "name"] as const;
export type CatalogQuery = {
  category: CategoryCode | ""; q: string; brand: string; min?: number; max?: number;
  stock: "" | "available" | "unavailable"; socket: string; ramType: "" | "DDR4" | "DDR5";
  sort: typeof sorts[number]; page: number;
};
const first = (value: string | string[] | undefined) => typeof value === "string" ? value : value?.[0] ?? "";
function price(value: string) {
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(value)) return undefined;
  const number = Number(value);
  return number <= 1_000_000 ? number : undefined;
}
export function parseCatalogQuery(params: SearchParams): CatalogQuery {
  const category = first(params.category);
  const sort = first(params.sort);
  const stock = first(params.stock);
  const ramType = first(params.ramType);
  let min = price(first(params.min));
  let max = price(first(params.max));
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
  return {
    category: categoryCodes.includes(category as CategoryCode) ? category as CategoryCode : "",
    q: first(params.q).replace(/["\\\u0000-\u001f]/g, " ").trim().slice(0, 80),
    brand: first(params.brand).trim().slice(0, 60), min, max,
    stock: stock === "available" || stock === "unavailable" ? stock : "",
    socket: ["AM5", "AM4", "LGA1700"].includes(first(params.socket)) ? first(params.socket) : "",
    ramType: ramType === "DDR4" || ramType === "DDR5" ? ramType : "",
    sort: sorts.includes(sort as CatalogQuery["sort"]) ? sort as CatalogQuery["sort"] : "featured",
    page: /^\d+$/.test(first(params.page)) ? Math.max(1, Math.min(1000, Number(first(params.page)))) : 1,
  };
}
export function buildProductFilter(query: CatalogQuery) {
  const filter: Record<string, unknown> = { active: true };
  if(query.min!==undefined || query.max!==undefined || query.stock)filter.isReference={$ne:true};
  if (query.category) filter.category = query.category;
  if (query.brand) filter.brand = query.brand;
  if (query.q) filter.$text = { $search: `"${query.q}"` };
  if (query.min !== undefined || query.max !== undefined) filter.priceMinor = {
    ...(query.min !== undefined ? { $gte: Math.round(query.min * 100) } : {}),
    ...(query.max !== undefined ? { $lte: Math.round(query.max * 100) } : {}),
  };
  if (query.stock) filter.stock = query.stock === "available" ? { $gt: 0 } : 0;
  if (query.socket) filter["specs.socket"] = query.socket;
  if (query.ramType) filter["specs.ramType"] = query.ramType;
  return filter;
}
export function productSort(query: CatalogQuery): Record<string, 1 | -1> {
  switch (query.sort) {
    case "price-asc": return { priceMinor: 1, slug: 1 };
    case "price-desc": return { priceMinor: -1, slug: 1 };
    case "name": return { name: 1, slug: 1 };
    default: return { featured: -1, slug: 1 };
  }
}
export function filterSampleProducts(products: Product[], query: CatalogQuery) {
  const result = products.filter((p) => p.active
    && (!p.isReference || (query.min===undefined && query.max===undefined && !query.stock))
    && (!query.category || p.category === query.category)
    && (!query.brand || p.brand === query.brand)
    && (!query.q || `${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(query.q.toLowerCase()))
    && (query.min === undefined || p.priceMinor >= Math.round(query.min * 100))
    && (query.max === undefined || p.priceMinor <= Math.round(query.max * 100))
    && (!query.stock || (query.stock === "available" ? p.stock > 0 : p.stock === 0))
    && (!query.socket || p.specs.socket === query.socket)
    && (!query.ramType || p.specs.ramType === query.ramType));
  return result.sort((a, b) => {
    for (const [key, direction] of Object.entries(productSort(query))) {
      const av = a[key as keyof Product]; const bv = b[key as keyof Product];
      const order = typeof av === "string" && typeof bv === "string" ? av.localeCompare(bv, "en") : Number(av) - Number(bv);
      if (order) return order * direction;
    }
    return 0;
  });
}
export function catalogHref(query: CatalogQuery, changes: Partial<CatalogQuery> = {}) {
  const params = new URLSearchParams();
  const next = { ...query, ...changes };
  for (const [key, value] of Object.entries(next)) {
    if (value !== undefined && value !== "" && !(key === "page" && value === 1)) params.set(key, String(value));
  }
  return `/products?${params.toString()}`;
}
export function compareSlugs(value: string | string[] | undefined) {
  return [...new Set(first(value).split(",").filter((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 100))].slice(0, 3);
}
