import "dotenv/config";
import { afterAll,describe,it,expect } from "vitest";
import { db } from "@/lib/db";
import { createWork,operateWork,getWork } from "@/modules/work-orders/service";
import type { Actor } from "@/lib/permissions";
afterAll(()=>db.$disconnect());
const actor=async(username:string):Promise<Actor>=>db.user.findUniqueOrThrow({where:{username},select:{id:true,name:true,role:true,siteId:true}});
describe("corrective work execution",()=>{
  it("assigns, starts, pauses, resumes, completes, reworks and closes with audit",async()=>{
    const sup=await actor("supervisor"),tech=await actor("technician1"),other=await actor("technician2"),asset=await db.asset.findUniqueOrThrow({where:{assetCode:"MP-003"}}),failure=await db.masterData.findFirstOrThrow({where:{kind:"FAILURE_CATEGORY",isActive:true}});
    const wo=await createWork(sup,{assetId:asset.id,title:"Lifecycle test",description:"Test",priority:"MEDIUM"});await expect(operateWork(tech,wo.id,"start",{})).rejects.toThrow();
    await operateWork(sup,wo.id,"assign",{assignedToId:tech.id});await expect(getWork(other,wo.id)).rejects.toThrow();
    const started=await operateWork(tech,wo.id,"start",{});expect(started).toHaveProperty("actualStartAt");const first=(await db.workOrder.findUniqueOrThrow({where:{id:wo.id}})).actualStartAt;
    await expect(operateWork(tech,wo.id,"pause",{})).rejects.toThrow();await operateWork(tech,wo.id,"pause",{reason:"Break"});await operateWork(tech,wo.id,"resume",{});expect((await db.workOrder.findUniqueOrThrow({where:{id:wo.id}})).actualStartAt).toEqual(first);
    await expect(operateWork(tech,wo.id,"complete",{})).rejects.toThrow();await operateWork(tech,wo.id,"execution",{findings:"Worn bearing",actionTaken:"Replaced bearing",failureCategoryId:failure.id});await operateWork(tech,wo.id,"comment",{body:"Verified"});await operateWork(tech,wo.id,"complete",{});
    await expect(operateWork(tech,wo.id,"close",{})).rejects.toThrow("สิทธิ์");await operateWork(sup,wo.id,"reopen",{reason:"Check again"});await operateWork(tech,wo.id,"complete",{});await operateWork(sup,wo.id,"close",{});
    await expect(operateWork(sup,wo.id,"execution",{findings:"change"})).rejects.toThrow();const detail=await getWork(sup,wo.id);expect(detail.status).toBe("CLOSED");expect(detail.activities.length).toBeGreaterThan(8);expect(detail.comments).toHaveLength(1);
  });
});
