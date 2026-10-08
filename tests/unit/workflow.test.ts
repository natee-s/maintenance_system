import { describe,it,expect } from "vitest";
import { transitions,validateTransition,requireEditable } from "@/modules/work-orders/rules";
import type { WorkOrderStatus } from "@/generated/prisma/client";
describe("mandatory WO state machine",()=>{
  it("permits only the specified directed edges",()=>{const states=Object.keys(transitions) as WorkOrderStatus[];for(const from of states)for(const to of states){if(transitions[from].includes(to))expect(()=>validateTransition(from,to)).not.toThrow();else expect(()=>validateTransition(from,to)).toThrow();}});
  it("prevents terminal and completed execution edits",()=>{for(const status of ["COMPLETED","CLOSED","CANCELLED"] as const)expect(()=>requireEditable(status)).toThrow();});
});
