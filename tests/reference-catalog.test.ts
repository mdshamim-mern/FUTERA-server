import {describe,it,expect,vi} from "vitest";
vi.mock("../src/lib/env.ts",()=>({env:{CHECKOUT_ENABLED:"false",CATALOG_SOURCE:"reference",APP_URL:"http://localhost:3000",COMMERCE_ENABLED:"false"}}));
import {referenceProducts} from "../src/features/products/reference-data.ts";
import {productSchema} from "../src/features/products/schema.ts";
import {filterSampleProducts,parseCatalogQuery,buildProductFilter} from "../src/features/products/query.ts";
import {calculateOrder} from "../src/features/checkout/pricing.ts";
import {reviewCheckout,placeOrder} from "../src/server/checkout.ts";
import {parseEnv} from "../src/lib/env-schema.ts";
import {listProducts,getProduct} from "../src/server/catalog.ts";
describe("manufacturer reference catalog",()=>{
 it("contains 20 unique sourced real models without retail claims",()=>{expect(referenceProducts).toHaveLength(20);expect(new Set(referenceProducts.map(p=>p.slug)).size).toBe(20);for(const p of referenceProducts){expect(p.isSample).toBe(false);expect(p.isReference).toBe(true);expect(p.priceMinor).toBe(0);expect(p.stock).toBe(0);expect(p.sourceUrl).toMatch(/^https:\/\//);expect(productSchema.safeParse({...p,stock:1}).success).toBe(false);expect(productSchema.safeParse({...p,priceMinor:100}).success).toBe(false);}});
 it("does not present unknown retail prices or availability as filter matches",()=>{for(const query of [{max:"50000"},{min:"0"},{stock:"unavailable"},{stock:"available"}])expect(filterSampleProducts(referenceProducts,parseCatalogQuery(query))).toHaveLength(0);expect(buildProductFilter(parseCatalogQuery({max:"50000"}))).toMatchObject({isReference:{$ne:true}});});
 it("supports factual brand/category/socket filtering and two pages",async()=>{expect(filterSampleProducts(referenceProducts,parseCatalogQuery({brand:"AMD",category:"cpu",socket:"AM5"}))).toHaveLength(4);expect((await listProducts(parseCatalogQuery({}))).products).toHaveLength(12);expect((await listProducts(parseCatalogQuery({page:"2"}))).products).toHaveLength(8);expect((await getProduct(referenceProducts[0].slug))?.isReference).toBe(true);});
 it("rejects an order even if reference stock is corrupted to a positive number",()=>{const p={...referenceProducts[0],stock:100};expect(()=>calculateOrder([{id:p.slug,quantity:1}],[p],null,0)).toThrow("unavailable");});
 it("blocks checkout before database work when retail is disabled",async()=>{await expect(placeOrder("anything")).rejects.toMatchObject({status:503});await expect(reviewCheckout({} as Parameters<typeof reviewCheckout>[0])).rejects.toMatchObject({status:503});});
 it("permits configured accounts without fabricated shipping rates",()=>{expect(parseEnv({COMMERCE_ENABLED:"true",CHECKOUT_ENABLED:"false",CATALOG_SOURCE:"reference",MONGODB_URI:"mongodb://localhost:27017",MONGODB_DB:"futera_live",AUTH_SECRET:"test-only-secret-for-env-validation-123",APP_URL:"https://example.test"}).CHECKOUT_ENABLED).toBe("false");expect(()=>parseEnv({COMMERCE_ENABLED:"true",CHECKOUT_ENABLED:"true",CATALOG_SOURCE:"reference"})).toThrow();});
});
