import { expect, it } from "vitest";
import { decodeBuild, encodeBuild, parseReferences } from "@/features/builder/schema";
it("round-trips IDs and quantities without prices",()=>{
  const refs=[{id:"sample-ram-03",quantity:2}]; expect(decodeBuild(encodeBuild(refs))).toEqual(refs);
});
it("ignores malformed, oversized, duplicate and injected references",()=>{
  expect(decodeBuild("not json")).toEqual([]); expect(decodeBuild("x".repeat(4001))).toEqual([]);
  expect(parseReferences([{id:"ok",quantity:1},{id:"ok",quantity:2},{id:"../bad",quantity:1},{id:"bad",quantity:0},{id:"bad",quantity:9},{id:"bad",quantity:1,priceMinor:1}])).toEqual([{id:"ok",quantity:1}]);
  expect(parseReferences(Array.from({length:25},()=>({id:"ok",quantity:1})))).toEqual([]);
});
