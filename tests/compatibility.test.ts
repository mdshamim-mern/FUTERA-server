import { describe, expect, it } from "vitest";
import { checkCompatibility, estimatePower, type Part, type Status } from "@/features/builder/compatibility";

function fixture(): Part[] { return [
  { id:"cpu",category:"cpu",quantity:1,specs:{socket:"AM5",supportedChipsets:["B650"],tdp:100,integratedGraphics:true} },
  { id:"board",category:"motherboard",quantity:1,specs:{socket:"AM5",chipset:"B650",biosStatus:"supported",supportedCpuIds:["cpu"],ramType:"DDR5",ramSlots:4,maxRamGb:128,maxRamSpeedMts:6000,formFactor:"ATX",m2Slots:2,m2Interfaces:["NVMe"],sataPorts:2,powerConnectors:["CPU 8-pin"]} },
  { id:"ram",category:"ram",quantity:2,specs:{ramType:"DDR5",modules:2,capacityGb:32,speedMts:6000} },
  { id:"case",category:"case",quantity:1,specs:{supportedBoards:["ATX"],gpuClearanceMm:300,coolerHeightMm:160,radiatorSupportMm:["240"]} },
  { id:"cooler",category:"cpu-cooler",quantity:1,specs:{sockets:["AM5"],coolerHeightMm:160,tdp:100,radiatorMm:240} },
  { id:"gpu",category:"gpu",quantity:1,specs:{lengthMm:300,tdp:200,connectors:["8-pin","8-pin"]} },
  { id:"psu",category:"psu",quantity:1,specs:{wattage:520,connectors:["CPU 8-pin","GPU 8-pin","GPU 8-pin","12VHPWR"]} },
  { id:"ssd",category:"ssd",quantity:2,specs:{formFactor:"M.2 2280",interface:"NVMe"} },
  { id:"hdd",category:"hdd",quantity:2,specs:{formFactor:"3.5 inch",interface:"SATA III"} },
]; }
const result = (parts: Part[], id: string) => checkCompatibility(parts).find(c => c.ruleId === id)!;
const matrix: [string,string,string,unknown,Status][] = [
  ["socket","cpu","socket","LGA1700","error"],
  ["chipset","cpu","supportedChipsets",["X670"],"warning"],
  ["bios","board","biosStatus","update-required","warning"],
  ["ram-type","ram","ramType","DDR4","error"],
  ["ram-slots","board","ramSlots",3,"error"],
  ["ram-capacity","board","maxRamGb",63,"error"],
  ["ram-speed","board","maxRamSpeedMts",5999,"warning"],
  ["board-case","case","supportedBoards",["Mini-ITX"],"error"],
  ["gpu-clearance","gpu","lengthMm",301,"error"],
  ["cooler-height","cooler","coolerHeightMm",161,"error"],
  ["radiator","case","radiatorSupportMm",["120"],"error"],
  ["cooler-socket","cooler","sockets",["AM4"],"error"],
  ["cooler-tdp","cooler","tdp",99,"error"],
  ["psu-wattage","psu","wattage",519,"error"],
  ["psu-connectors","psu","connectors",["CPU 8-pin","GPU 8-pin"],"error"],
  ["storage-interface","board","m2Interfaces",["SATA"],"error"],
  ["m2-slots","board","m2Slots",1,"error"],
  ["sata-ports","board","sataPorts",1,"error"],
];
describe("compatibility rule contract", () => {
  for (const [id,part,key,value,status] of matrix) {
    it(`${id}: passes including exact boundaries`, () => expect(result(fixture(),id).status).toBe("ok"));
    it(`${id}: returns ${status} for a conflict`, () => { const parts=fixture(); parts.find(p=>p.id===part)!.specs[key]=value; expect(result(parts,id).status).toBe(status); });
    it(`${id}: missing specs are unknown`, () => { const parts=fixture(); parts.find(p=>p.id===part)!.specs[key]=null; expect(result(parts,id).status).toBe("unknown"); });
  }
  it("empty builds cannot be declared compatible", () => expect(checkCompatibility([]).every(c=>c.status==="unknown")).toBe(true));
  it("provides stable localization keys and involved IDs without mutating input", () => {
    const parts=fixture(), original=structuredClone(parts);
    for (const c of checkCompatibility(parts)) { expect(c.messageKey).toBe(`compatibility.${c.ruleId}.${c.status}`); expect(c.message.length).toBeGreaterThan(10); expect(c.involved.length).toBeGreaterThan(0); }
    expect(parts).toEqual(original);
  });
  it("does not assume unlisted CPUs have BIOS support", () => { const p=fixture(); p[1].specs.supportedCpuIds=[]; expect(result(p,"bios").status).toBe("unknown"); });
  it("reports unsupported BIOS", () => { const p=fixture(); p[1].specs.biosStatus="unsupported"; expect(result(p,"bios").status).toBe("error"); });
  it("counts modules and total kit capacity across different RAM lines", () => {
    const p=fixture(); p.push({...p[2],id:"second-kit",quantity:1});
    expect(result(p,"ram-slots").status).toBe("error"); expect(result(p,"ram-mixing").status).toBe("warning");
    p[1].specs.maxRamGb=95; expect(result(p,"ram-capacity").status).toBe("error");
  });
  it("zero radiator needs no mount and optional GPU needs no clearance check", () => {
    const p=fixture().filter(p=>p.category!=="gpu"); p.find(p=>p.id==="cooler")!.specs.radiatorMm=0; p.find(p=>p.id==="case")!.specs.radiatorSupportMm=null;
    expect(result(p,"radiator").status).toBe("ok"); expect(result(p,"gpu-clearance")).toBeUndefined(); expect(result(p,"display-output").status).toBe("ok");
    p[0].specs.integratedGraphics=false; expect(result(p,"display-output").status).toBe("error"); p[0].specs.integratedGraphics=null; expect(result(p,"display-output").status).toBe("unknown");
  });
  it("12VHPWR cannot be replaced by extra 8-pin cables; EPS is not PCIe", () => {
    const p=fixture(); p.find(p=>p.id==="gpu")!.specs.connectors=["12VHPWR"];
    expect(result(p,"psu-connectors").status).toBe("ok");
    p.find(p=>p.id==="psu")!.specs.connectors=["CPU 8-pin","GPU 8-pin","GPU 8-pin"];
    expect(result(p,"psu-connectors").status).toBe("error");
    p.find(p=>p.id==="gpu")!.specs.connectors=["8-pin"];
    p.find(p=>p.id==="psu")!.specs.connectors=["GPU 8-pin","GPU 8-pin"];
    expect(result(p,"psu-connectors").status).toBe("error");
  });
  it("M.2 SATA consumes an M.2 slot, not a cable SATA port", () => {
    const p=fixture(); p.find(p=>p.id==="ssd")!.specs.interface="SATA III"; p[1].specs.m2Interfaces=["SATA III"];
    expect(result(p,"storage-interface").status).toBe("ok"); expect(result(p,"sata-ports").status).toBe("ok");
  });
  it("unknown drive interfaces and missing form factors never pass", () => {
    const p=fixture(); p.find(p=>p.id==="hdd")!.specs.interface="USB";
    expect(result(p,"storage-interface").status).toBe("error");
    p.find(p=>p.id==="ssd")!.specs.formFactor=null;
    expect(result(p,"storage-interface").status).toBe("unknown"); expect(result(p,"m2-slots").status).toBe("unknown");
  });
  it("power uses all GPU quantities, 100W overhead and 30% headroom", () => {
    expect(estimatePower(fixture())).toEqual({loadWatts:400,minimumWatts:520,recommendedWatts:550});
    const p=fixture(); p.find(p=>p.id==="gpu")!.quantity=2; expect(estimatePower(p)?.minimumWatts).toBe(780);
    expect(estimatePower(p.filter(p=>p.category!=="gpu"))?.minimumWatts).toBe(260);
    p[0].specs.tdp=NaN; expect(estimatePower(p)).toBeNull(); expect(estimatePower([])).toBeNull();
  });
});
