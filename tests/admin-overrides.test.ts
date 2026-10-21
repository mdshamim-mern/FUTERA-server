import {expect,it} from "vitest";
import {checkCompatibility,checkOverrides,type Part} from "@/features/builder/compatibility";
const parts:Part[]=[{id:"cpu",category:"cpu",quantity:1,specs:{}},{id:"board",category:"motherboard",quantity:1,specs:{}}];
it("applies an override only when every named part is selected",()=>{
 const overrides=[{partIds:["cpu","board"],status:"error" as const,message:"Revision conflict"}];
 expect(checkOverrides(parts.slice(0,1),overrides)).toEqual([]);
 expect(checkOverrides(parts,overrides)[0]).toMatchObject({status:"error",involved:["cpu","board"]});
 const checks=[...checkCompatibility(parts),...checkOverrides(parts,overrides)];
 expect(checks.find(c=>c.ruleId==="socket")?.status).toBe("unknown");
});
