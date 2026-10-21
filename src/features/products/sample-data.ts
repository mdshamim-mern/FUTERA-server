import { categoryCodes, categoryLabels, categorySchema, productSchema, type CategoryCode } from "./schema.ts";

export const sampleCategories = categoryCodes.map((slug, sortOrder) => categorySchema.parse({
  slug, name: categoryLabels[slug], description: `Explore fictional SAMPLE ${categoryLabels[slug]} components.`, sortOrder, active: true, isSample: true,
}));
export const sampleBrands = ["FUTERA Lab", "Sample Works", "Prototype Co"];

function specs(category: CategoryCode, index: number) {
  const ddr5 = index % 2 === 0;
  const socket = ddr5 ? "AM5" : "LGA1700";
  switch (category) {
    case "cpu": return { socket, cores: 6 + (index % 3) * 2, threads: 12 + (index % 3) * 4, boostGHz: Number((4.4 + (index % 4) * .2).toFixed(1)), tdp: [65, 95, 105, 125][index % 4], integratedGraphics: ddr5, supportedChipsets: [ddr5 ? "B650" : "B760"] };
    case "motherboard": return { socket, chipset: ddr5 ? "B650" : "B760", ramType: ddr5 ? "DDR5" : "DDR4", ramSlots: 4, maxRamGb: 128, maxRamSpeedMts: ddr5 ? 6000 : 3600, formFactor: index % 3 ? "ATX" : "Micro-ATX", m2Slots: 2 + index % 2, m2Interfaces: ["PCIe 4.0 NVMe"], sataPorts: 4, biosNote: "Fictional SAMPLE BIOS support only; not evidence for real hardware.", biosStatus: "supported", supportedCpuIds: Array.from({length:5}, (_,i) => `sample-cpu-${String(i*2+(ddr5?1:2)).padStart(2,"0")}`), powerConnectors: ["CPU 8-pin"] };
    case "ram": return { ramType: ddr5 ? "DDR5" : "DDR4", capacityGb: index % 3 ? 32 : 16, modules: 2, speedMts: ddr5 ? 6000 : 3200 };
    case "ssd": return { capacityGb: [500, 1000, 2000][index % 3], interface: "PCIe 4.0 NVMe", formFactor: "M.2 2280", readMBps: 3500 + (index % 4) * 1000 };
    case "hdd": return { capacityGb: [1000, 2000, 4000][index % 3], interface: "SATA III", formFactor: "3.5 inch", rpm: index % 2 ? 5400 : 7200 };
    case "gpu": return { vramGb: [8, 12, 16][index % 3], lengthMm: 240 + index * 10, tdp: 130 + index * 20, connectors: index > 6 ? ["12VHPWR"] : ["8-pin"] };
    case "psu": return { wattage: 550 + (index % 5) * 100, formFactor: "ATX", efficiency: "SAMPLE efficiency rating unverified", connectors: ["CPU 8-pin", "GPU 8-pin", "GPU 8-pin", "SATA", ...(index > 4 ? ["12VHPWR"] : [])], modular: index % 2 === 0 };
    case "case": return { formFactor: "Mid tower", supportedBoards: ["ATX", "Micro-ATX", "Mini-ITX"], gpuClearanceMm: 330 + index * 5, coolerHeightMm: 160 + index % 3 * 5, radiatorSupportMm: ["120", "240", ...(index > 4 ? ["360"] : [])] };
    case "cpu-cooler": return { sockets: ["AM5", "AM4", "LGA1700"], coolerHeightMm: index < 6 ? 150 + index * 2 : 55, tdp: 150 + index * 10, radiatorMm: index < 6 ? 0 : 240, type: index < 6 ? "Air" : "Liquid" };
    case "case-fan": return { sizeMm: index % 2 ? 140 : 120, maxRpm: 1500 + index * 100, airflowCfm: 45 + index * 3, connector: "4-pin PWM" };
    case "monitor": return { diagonalInches: index % 2 ? 27 : 24, resolution: index % 2 ? "2560 × 1440" : "1920 × 1080", refreshHz: [75, 144, 165][index % 3], panel: "IPS", ports: ["HDMI", "DisplayPort"] };
    case "keyboard": return { layout: index % 2 ? "75%" : "Full size", switchType: index % 2 ? "Linear mechanical" : "Tactile mechanical", connectivity: ["USB-C"], backlight: index % 2 === 0 };
    case "mouse": return { maxDpi: 8000 + index * 1000, weightGrams: 65 + index * 3, connectivity: ["USB"], buttons: 6 };
    case "ups": return { capacityVa: 650 + index * 100, wattage: 360 + index * 60, topology: "Line interactive", outlets: 4 };
  }
}
const basePrices: Record<CategoryCode, number> = { cpu: 15000, motherboard: 12000, ram: 4500, ssd: 4000, hdd: 4500, gpu: 22000, psu: 4500, case: 3500, "cpu-cooler": 2000, "case-fan": 500, monitor: 12000, keyboard: 2500, mouse: 1200, ups: 4000 };

// Deterministic fictional fixtures, not specifications or offers for real products.
export const sampleProducts = categoryCodes.flatMap((category) => Array.from({ length: 10 }, (_, index) => productSchema.parse({
  slug: `sample-${category}-${String(index + 1).padStart(2, "0")}`,
  sku: `SAMPLE-${category.toUpperCase()}-${index + 1}`,
  name: `SAMPLE ${categoryLabels[category]} ${["Origin", "Vector", "Orbit"][index % 3]} ${index + 1}`,
  brand: sampleBrands[index % 3], category,
  description: `A fictional ${categoryLabels[category]} for exploring the FUTERA catalog. Its illustrative specifications help demonstrate filtering and comparison. This is not a real product, manufacturer claim or purchase offer.`,
  priceMinor: (basePrices[category] + index * (category === "case-fan" ? 150 : 750)) * 100,
  stock: index % 4 === 0 ? 0 : 3 + index,
  active: true, isSample: true, featured: index === 1,
  images: [{ src: "/placeholders/component.svg", alt: `Neutral SAMPLE ${categoryLabels[category]} illustration` }, { src: "/placeholders/specimen.svg", alt: "Neutral sample specification placeholder, not a product photograph" }],
  specs: specs(category, index),
})));
