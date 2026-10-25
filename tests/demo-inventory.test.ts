import {expect,it} from "vitest";
import {productSchema} from "../src/features/products/schema.ts";
import {referenceProducts} from "../src/features/products/reference-data.ts";
import {calculateOrder} from "../src/features/checkout/pricing.ts";
const original=referenceProducts.find(p=>p.slug==="amd-ryzen-9-7950x")!;
const demo={...original,isReference:false,isDemo:true,priceMinor:4690000,stock:12};
it("only activates demo inventory with documented pricing and credited product photos",()=>{expect(productSchema.safeParse(demo).success).toBe(true);expect(productSchema.safeParse({...demo,images:demo.images.slice(0,1)}).success).toBe(true);expect(productSchema.safeParse({...demo,images:[{src:"/illustrations/cpu.svg",alt:"Diagram"}]}).success).toBe(false);expect(productSchema.safeParse({...demo,marketPrice:undefined}).success).toBe(false);});
it("marks demo quotes and recalculates the authoritative total",()=>{const quote=calculateOrder([{id:demo.slug,quantity:2}],[demo],null,12000);expect(quote.isDemo).toBe(true);expect(quote.totalMinor).toBe(9392000);expect(()=>calculateOrder([{id:demo.slug,quantity:13}],[demo],null,0)).toThrow(/stock/);});
it("rejects mixed demo and non-demo inventory",()=>{const other={...demo,slug:"other-cpu",isDemo:false};expect(()=>calculateOrder([{id:demo.slug,quantity:1},{id:other.slug,quantity:1}],[demo,other],null,0)).toThrow(/Demo/);});

import {demoProducts} from "../src/features/products/demo-data.ts";
it("documents photography and positive demo pricing for every current model",()=>{expect(demoProducts).toHaveLength(20);expect(new Set(demoProducts.map(p=>p.slug)).size).toBe(20);for(const p of demoProducts){expect(p.isDemo).toBe(true);expect(p.priceMinor).toBeGreaterThan(0);expect(p.stock).toBeGreaterThan(0);expect(p.images[0].sourceUrl).toMatch(/^https:/);expect(p.images[0].credit).toBeTruthy();expect(productSchema.safeParse(p).success).toBe(true);}expect(demoProducts.filter(p=>p.marketPrice?.kind==="observed")).toHaveLength(8);expect(demoProducts.filter(p=>p.marketPrice?.kind==="illustrative")).toHaveLength(12);});
