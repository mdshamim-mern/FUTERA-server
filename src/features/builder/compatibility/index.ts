/** Pure, conservative checks. No UI, persistence, catalog or framework dependencies. */
export type Status = "ok" | "warning" | "error" | "unknown";
export type Part = { id: string; category: string; quantity: number; specs: Record<string, unknown> };
export type Check = { status: Status; ruleId: string; message: string; messageKey: string; involved: string[] };
const number = (p: Part | undefined, key: string): number | undefined => {
  const value = p?.specs[key];
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
};
const text = (p: Part | undefined, key: string): string | undefined => typeof p?.specs[key] === "string" && p.specs[key] ? p.specs[key] as string : undefined;
const list = (p: Part | undefined, key: string): string[] | undefined => Array.isArray(p?.specs[key]) && (p.specs[key] as unknown[]).every(v => typeof v === "string") ? p.specs[key] as string[] : undefined;
export function estimatePower(parts: Part[]) {
  const cpu = parts.find(p => p.category === "cpu");
  const gpus = parts.filter(p => p.category === "gpu");
  const cpuTdp = number(cpu, "tdp");
  if (cpuTdp === undefined || gpus.some(p => number(p, "tdp") === undefined)) return null;
  const loadWatts = cpuTdp + gpus.reduce((sum, p) => sum + number(p, "tdp")! * p.quantity, 0) + 100;
  const minimumWatts = Math.ceil(loadWatts * 1.3);
  return { loadWatts, minimumWatts, recommendedWatts: Math.ceil(minimumWatts / 50) * 50 };
}
export function checkCompatibility(parts: Part[]): Check[] {
  const checks: Check[] = [];
  const one = (category: string) => parts.find(p => p.category === category);
  const cpu = one("cpu"), board = one("motherboard"), box = one("case"), cooler = one("cpu-cooler"), psu = one("psu");
  const ram = parts.filter(p => p.category === "ram"), gpu = parts.filter(p => p.category === "gpu"), drives = parts.filter(p => ["ssd", "hdd"].includes(p.category));
  const add = (ruleId: string, status: Status, message: string, involved: (Part | undefined)[]) => checks.push({ ruleId, status, message, messageKey: `compatibility.${ruleId}.${status}`, involved: [...new Set(involved.filter((p): p is Part => !!p).map(p => p.id))] });
  const test = (id: string, known: boolean, pass: boolean, message: string, involved: (Part | undefined)[], failure: Status = "error") => add(id, !known ? "unknown" : pass ? "ok" : failure, !known ? `${message}: specifications missing.` : `${message}: ${pass ? "passed" : failure === "warning" ? "review required" : "incompatible"}.`, involved);
  test("socket", !!text(cpu,"socket") && !!text(board,"socket"), text(cpu,"socket") === text(board,"socket"), "CPU / motherboard socket", [cpu,board]);
  test("chipset", !!list(cpu,"supportedChipsets") && !!text(board,"chipset"), !!list(cpu,"supportedChipsets")?.includes(text(board,"chipset")!), "CPU chipset support", [cpu,board], "warning");
  const bios = text(board,"biosStatus");
  const biosKnown = !!cpu && !!bios && !!list(board,"supportedCpuIds")?.includes(cpu.id);
  add("bios", !biosKnown ? "unknown" : bios === "supported" ? "ok" : bios === "update-required" ? "warning" : bios === "unsupported" ? "error" : "unknown", !biosKnown ? "Exact CPU / BIOS support is unknown." : bios === "supported" ? "Declared BIOS support is available; verify exact CPU revision before purchase." : "Check the CPU support list and BIOS update requirements.", [cpu,board]);
  test("ram-type", ram.length > 0 && !!text(board,"ramType") && ram.every(p => !!text(p,"ramType")), ram.every(p => text(p,"ramType") === text(board,"ramType")), "RAM DDR type", [board,...ram]);
  for (const [id, field, limit, message] of [["ram-slots","modules","ramSlots","RAM module slots"],["ram-capacity","capacityGb","maxRamGb","Total RAM kit capacity"]] as const) {
    test(id, ram.length > 0 && number(board,limit) !== undefined && ram.every(p => number(p,field) !== undefined), ram.reduce((sum,p) => sum + (number(p,field) ?? 0) * p.quantity,0) <= (number(board,limit) ?? 0), message,[board,...ram]);
  }
  test("ram-speed", ram.length > 0 && number(board,"maxRamSpeedMts") !== undefined && ram.every(p => number(p,"speedMts") !== undefined), ram.every(p => (number(p,"speedMts") ?? Infinity) <= (number(board,"maxRamSpeedMts") ?? 0)), "RAM speed may require downclocking",[board,...ram],"warning");
  if (ram.length > 1) add("ram-mixing", "warning", "Different RAM kits may not train reliably together, even with matching specifications.",ram);
  test("board-case", !!text(board,"formFactor") && !!list(box,"supportedBoards"), !!list(box,"supportedBoards")?.includes(text(board,"formFactor")!), "Motherboard / case form factor",[board,box]);
  for (const p of gpu) test("gpu-clearance", number(p,"lengthMm") !== undefined && number(box,"gpuClearanceMm") !== undefined, (number(p,"lengthMm") ?? Infinity) <= (number(box,"gpuClearanceMm") ?? 0), "GPU length / case clearance",[p,box]);
  test("cooler-height", number(cooler,"coolerHeightMm") !== undefined && number(box,"coolerHeightMm") !== undefined, (number(cooler,"coolerHeightMm") ?? Infinity) <= (number(box,"coolerHeightMm") ?? 0), "Cooler height / case clearance",[cooler,box]);
  const radiator = number(cooler,"radiatorMm");
  test("radiator", radiator !== undefined && (radiator === 0 || !!list(box,"radiatorSupportMm")), radiator === 0 || !!list(box,"radiatorSupportMm")?.includes(String(radiator)), "Radiator mount size",[cooler,box]);
  test("cooler-socket", !!text(cpu,"socket") && !!list(cooler,"sockets"), !!list(cooler,"sockets")?.includes(text(cpu,"socket")!), "Cooler mounting socket",[cpu,cooler]);
  test("cooler-tdp", number(cpu,"tdp") !== undefined && number(cooler,"tdp") !== undefined, (number(cpu,"tdp") ?? Infinity) <= (number(cooler,"tdp") ?? 0), "Cooler thermal rating",[cpu,cooler]);
  const power = estimatePower(parts);
  test("psu-wattage", power !== null && number(psu,"wattage") !== undefined, !!power && (number(psu,"wattage") ?? 0) >= power.minimumWatts, "PSU capacity including 30% headroom",[cpu,...gpu,psu]);
  const required = list(board,"powerConnectors");
  const available = list(psu,"connectors");
  const needs = [...(required ?? []), ...gpu.flatMap(p => Array.from({length:p.quantity}, () => list(p,"connectors") ?? []).flat().map(s => s === "8-pin" ? "GPU 8-pin" : s))];
  const connectorKnown = !!required && !!available && gpu.every(p => !!list(p,"connectors"));
  test("psu-connectors", connectorKnown, needs.every(s => needs.filter(v => v === s).length <= (available ?? []).filter(v => v === s).length), "Dedicated PSU connectors (CPU EPS and GPU PCIe are not interchangeable)",[board,...gpu,psu]);
  const m2 = drives.filter(p => text(p,"formFactor")?.startsWith("M.2"));
  const sata = drives.filter(p => !text(p,"formFactor")?.startsWith("M.2") && text(p,"interface")?.startsWith("SATA"));
  const knownDrives = drives.every(p => !!text(p,"formFactor") && !!text(p,"interface"));
  test("storage-interface", !!board && knownDrives && (m2.length === 0 || !!list(board,"m2Interfaces")), drives.every(p => m2.includes(p) ? !!list(board,"m2Interfaces")?.includes(text(p,"interface")!) : sata.includes(p)), "Storage interface support",[board,...drives]);
  test("m2-slots", knownDrives && number(board,"m2Slots") !== undefined, m2.reduce((n,p) => n+p.quantity,0) <= (number(board,"m2Slots") ?? 0), "M.2 slot count",[board,...m2]);
  test("sata-ports", knownDrives && number(board,"sataPorts") !== undefined, sata.reduce((n,p) => n+p.quantity,0) <= (number(board,"sataPorts") ?? 0), "SATA port count",[board,...sata]);
  if (cpu && gpu.length === 0) test("display-output", typeof cpu.specs.integratedGraphics === "boolean", cpu.specs.integratedGraphics === true, "A GPU or integrated graphics is required for display output",[cpu]);
  return checks;
}

/** Additive overrides cannot suppress unknown or failing base checks. */
export type CompatibilityOverride={partIds:string[];status:"warning"|"error";message:string};
export function checkOverrides(parts:Part[],overrides:CompatibilityOverride[]):Check[]{
 return overrides.filter(rule=>rule.partIds.every(id=>parts.some(p=>p.id===id))).map((rule,index)=>({status:rule.status,ruleId:`admin-override-${index}`,message:rule.message,messageKey:"compatibility.admin-override",involved:rule.partIds}));
}
