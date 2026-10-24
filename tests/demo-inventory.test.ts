import {expect,it} from "vitest";
import {productSchema} from "../src/features/products/schema.ts";
import {referenceProducts} from "../src/features/products/reference-data.ts";
import {calculateOrder} from "../src/features/checkout/pricing.ts";
const original=referenceProducts.find(p=>p.slug==="amd-ryzen-9-7950x")!;
const demo={...original,isReference:false,isDemo:true,priceMinor:4690000,stock:12};
it("only activates demo inventory with three licensed photos and a source price",()=>{expect(productSchema.safeParse(demo).success).toBe(true);expect(productSchema.safeParse({...demo,images:demo.images.slice(0,2)}).success).toBe(false);expect(productSchema.safeParse({...demo,marketPrice:undefined}).success).toBe(false);});
it("marks demo quotes and recalculates the authoritative total",()=>{const quote=calculateOrder([{id:demo.slug,quantity:2}],[demo],null,12000);expect(quote.isDemo).toBe(true);expect(quote.totalMinor).toBe(9392000);expect(()=>calculateOrder([{id:demo.slug,quantity:13}],[demo],null,0)).toThrow(/stock/);});
it("rejects mixed demo and non-demo inventory",()=>{const other={...demo,slug:"other-cpu",isDemo:false};expect(()=>calculateOrder([{id:demo.slug,quantity:1},{id:other.slug,quantity:1}],[demo,other],null,0)).toThrow(/Demo/);});
