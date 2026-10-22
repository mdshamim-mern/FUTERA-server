
import {compatibilitySettings} from "./settings.ts";
import { getProducts } from "./catalog.ts";
import { parseReferences } from "../features/builder/schema.ts";
import { checkCompatibility, checkOverrides, estimatePower } from "../features/builder/compatibility/index.ts";
import type { Product } from "../features/products/schema.ts";

export async function resolveBuild(input: unknown) {
  const refs = parseReferences(input);
  const products = await getProducts(refs.map(r => r.id));
  const seen = new Set<string>();
  const lines: { product: Product; quantity: number }[] = [];
  for (const ref of refs) {
    const product=products.find(p=>p.slug===ref.id);
    if (!product) continue;
    const multiple=["ram","ssd","hdd","case-fan","monitor","keyboard","mouse","ups"].includes(product.category);
    if (!multiple && seen.has(product.category)) continue;
    seen.add(product.category);
    lines.push({product,quantity:multiple?ref.quantity:1});
  }
  const parts=lines.map(({product,quantity})=>({id:product.slug,category:product.category,specs:product.specs,quantity}));
  const settings=await compatibilitySettings();
  const additional=checkOverrides(parts,settings.overrides);
  return {
    overrides:settings.overrides, lines, checks:[...checkCompatibility(parts),...additional], power:estimatePower(parts),
    totalMinor:lines.reduce((n,l)=>n+l.product.priceMinor*l.quantity,0),
    stockIssues:lines.filter(l=>l.product.isReference||l.quantity>l.product.stock).map(l=>({id:l.product.slug,message:l.product.isReference?`${l.product.name}: reference only; price and availability are not supplied.`:`${l.product.name}: requested quantity exceeds ${l.product.isSample?"SAMPLE ":""}stock (${l.product.stock}).`})),
    ignored:refs.length-lines.length,
  };
}
export type BuildQuote = Awaited<ReturnType<typeof resolveBuild>>;
