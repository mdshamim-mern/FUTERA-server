import { describe, expect, it } from "vitest";
import { buildProductFilter, catalogHref, compareSlugs, filterSampleProducts, parseCatalogQuery, productSort } from "@/features/products/query";
import { sampleProducts } from "@/features/products/sample-data";
import { formatPrice } from "@/features/products/format";

describe("catalog URL contract", () => {
  it("normalizes repeated, malformed and extreme parameters", () => {
    expect(parseCatalogQuery({ category: "unknown", sort: "$where", page: "999999", ramType: "DDR9", min: "NaN", q: ["cpu", "gpu"] })).toMatchObject({ category: "", sort: "featured", page: 1000, min: undefined, q: "cpu", ramType: "" });
    expect(parseCatalogQuery({ page: "-2", min: "100", max: "50" })).toMatchObject({ page: 1, min: 50, max: 100 });
  });
  it("builds allowlisted Mongo filters with minor-unit prices and no user operators", () => {
    const query = parseCatalogQuery({ category: "cpu", min: "10.25", max: "20000", stock: "available", socket: "AM5", "$where": "evil()", q: 'cpu"\\' });
    expect(buildProductFilter(query)).toEqual({ active: true, isReference: { $ne: true }, category: "cpu", priceMinor: { $gte: 1025, $lte: 2000000 }, stock: { $gt: 0 }, "specs.socket": "AM5", $text: { $search: '"cpu"' } });
  });
  it("filters specs, stock and price together with deterministic ordering", () => {
    const query = parseCatalogQuery({ category: "motherboard", ramType: "DDR5", stock: "available", sort: "price-desc" });
    const result = filterSampleProducts(sampleProducts, query);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === "motherboard" && p.specs.ramType === "DDR5" && p.stock > 0)).toBe(true);
    expect(result.map((p) => p.priceMinor)).toEqual(result.map((p) => p.priceMinor).sort((a,b) => b-a));
    expect(productSort(query)).toEqual({ priceMinor: -1, slug: 1 });
  });
  it("keeps URL filters across pagination and encodes user text", () => {
    const query = parseCatalogQuery({ brand: "Sample Works", q: "CPU & more", min: "0" });
    const url = new URL(catalogHref(query, { page: 2 }), "http://localhost");
    expect(url.searchParams.get("brand")).toBe("Sample Works");
    expect(url.searchParams.get("q")).toBe("CPU & more");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("min")).toBe("0");
  });
  it("caps and deduplicates comparison refs and rejects unsafe slugs", () => {
    expect(compareSlugs("sample-cpu-01,sample-cpu-01,../bad,sample-ram-01,sample-ssd-01,sample-gpu-01")).toEqual(["sample-cpu-01", "sample-ram-01", "sample-ssd-01"]);
  });
  it("handles zero-result searches without interpreting regex patterns", () => {
    expect(filterSampleProducts(sampleProducts, parseCatalogQuery({ q: ".*" }))).toHaveLength(0);
    expect(formatPrice(8550000)).toBe("৳ 85,500");
  });
});

