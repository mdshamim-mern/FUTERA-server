import { z } from "zod";

export const categoryCodes = ["cpu", "motherboard", "ram", "ssd", "hdd", "gpu", "psu", "case", "cpu-cooler", "case-fan", "monitor", "keyboard", "mouse", "ups"] as const;
export type CategoryCode = typeof categoryCodes[number];
export const categoryLabels: Record<CategoryCode, string> = {
  cpu: "CPU", motherboard: "Motherboard", ram: "RAM", ssd: "SSD", hdd: "HDD", gpu: "GPU", psu: "PSU", case: "Case", "cpu-cooler": "CPU Cooler", "case-fan": "Case Fan", monitor: "Monitor", keyboard: "Keyboard", mouse: "Mouse", ups: "UPS",
};
export const slugSchema = z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const text = z.string().trim().min(1).max(120).nullable();
const positive = z.number().finite().positive().nullable();
const count = z.number().int().nonnegative().nullable();
const strings = z.array(z.string().min(1).max(60)).max(20).nullable();
const ramType = z.enum(["DDR4", "DDR5"]).nullable();
export const specSchemas = {
  cpu: z.strictObject({ socket: text, cores: positive, threads: positive, boostGHz: positive, tdp: positive, integratedGraphics: z.boolean().nullable(), supportedChipsets: strings.optional() }),
  motherboard: z.strictObject({ socket: text, chipset: text, ramType, ramSlots: count, maxRamGb: positive, maxRamSpeedMts: positive, formFactor: text, m2Slots: count, m2Interfaces: strings, sataPorts: count, biosNote: text, biosStatus: z.enum(["supported", "update-required", "unsupported"]).nullable().optional(), supportedCpuIds: strings.optional(), powerConnectors: strings.optional() }),
  ram: z.strictObject({ ramType, capacityGb: positive, modules: positive, speedMts: positive }),
  ssd: z.strictObject({ capacityGb: positive, interface: text, formFactor: text, readMBps: positive }),
  hdd: z.strictObject({ capacityGb: positive, interface: text, formFactor: text, rpm: positive }),
  gpu: z.strictObject({ vramGb: positive, lengthMm: positive, tdp: positive, connectors: strings }),
  psu: z.strictObject({ wattage: positive, formFactor: text, efficiency: text, connectors: strings, modular: z.boolean().nullable() }),
  case: z.strictObject({ formFactor: text, supportedBoards: strings, gpuClearanceMm: positive, coolerHeightMm: positive, radiatorSupportMm: strings }),
  "cpu-cooler": z.strictObject({ sockets: strings, coolerHeightMm: positive, tdp: positive, radiatorMm: count, type: z.enum(["Air", "Liquid"]).nullable() }),
  "case-fan": z.strictObject({ sizeMm: positive, maxRpm: positive, airflowCfm: positive, connector: text }),
  monitor: z.strictObject({ diagonalInches: positive, resolution: text, refreshHz: positive, panel: text, ports: strings }),
  keyboard: z.strictObject({ layout: text, switchType: text, connectivity: strings, backlight: z.boolean().nullable() }),
  mouse: z.strictObject({ maxDpi: positive, weightGrams: positive, connectivity: strings, buttons: positive }),
  ups: z.strictObject({ capacityVa: positive, wattage: positive, topology: text, outlets: positive }),
} satisfies Record<CategoryCode, z.ZodType>;

export const categorySchema = z.strictObject({
  slug: z.enum(categoryCodes), name: z.string().min(1).max(60),
  description: z.string().min(1).max(300), sortOrder: z.number().int().nonnegative(),
  active: z.boolean(), isSample: z.boolean(),
});
export type Category = z.infer<typeof categorySchema>;
export const productSchema = z.strictObject({
  slug: slugSchema, sku: z.string().min(1).max(60), name: z.string().min(1).max(140),
  brand: z.string().min(1).max(60), category: z.enum(categoryCodes),
  description: z.string().min(1).max(2000),
  isReference: z.boolean().optional(), sourceUrl: z.url().startsWith("https://").optional(), reviewedAt: z.iso.date().optional(),
  marketPrice: z.object({amountMinor:z.number().int().positive().max(100_000_000),sourceUrl:z.url().startsWith("https://"),checkedAt:z.iso.date(),note:z.string().min(1).max(250)}).optional(),
  priceMinor: z.number().int().min(0).max(100_000_000),
  stock: z.number().int().min(0).max(100_000),
  active: z.boolean(), isSample: z.boolean(), featured: z.boolean(),
  images: z.array(z.object({ src: z.string().regex(/^\/(?:(?:placeholders|illustrations)\/[a-z0-9-]+\.svg|images\/products\/[a-z0-9-]+\/[a-z0-9-]+\.webp)$/), alt: z.string().min(1).max(180), credit:z.string().min(1).max(120).optional(),sourceUrl:z.url().startsWith("https://").optional(),licenseUrl:z.url().startsWith("https://").optional() })).min(1).max(6),
  specs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()])),
}).superRefine((product, ctx) => {
  if(product.isReference && (product.isSample || product.priceMinor!==0 || product.stock!==0 || !product.sourceUrl || !product.reviewedAt))ctx.addIssue({code:"custom",path:["isReference"],message:"Reference records require a source/date and cannot carry a retail price or inventory."});
  const parsed = specSchemas[product.category].safeParse(product.specs);
  if (!parsed.success) for (const issue of parsed.error.issues) {
    ctx.addIssue({ code: "custom", path: ["specs", ...issue.path], message: issue.message });
  }
  if (product.isSample && (!product.name.startsWith("SAMPLE ") || !product.sku.startsWith("SAMPLE-"))) {
    ctx.addIssue({ code: "custom", path: ["name"], message: "Sample products require SAMPLE name and SKU prefixes." });
  }
});
export type Product = z.infer<typeof productSchema>;
