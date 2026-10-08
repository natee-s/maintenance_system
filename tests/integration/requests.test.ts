import "dotenv/config";
import { afterAll,describe,it,expect } from "vitest";
import { db } from "@/lib/db";
import { createRequest,reviewRequest,convertRequest,getRequest } from "@/modules/work-requests/service";
import type { Actor } from "@/lib/permissions";
afterAll(()=>db.$disconnect());
const actor=async(username:string):Promise<Actor>=>db.user.findUniqueOrThrow({where:{username},select:{id:true,name:true,role:true,siteId:true}});
describe("work request conversion",()=>{
  it("converts once under concurrent calls and preserves original evidence",async()=>{
    const requester=await actor("requester"),supervisor=await actor("supervisor"),asset=await db.asset.findUniqueOrThrow({where:{assetCode:"MP-003"}});
    const row=await createRequest(requester,{assetId:asset.id,title:"Bearing noise",problemDescription:"Abnormal sound",priorityRequested:"MEDIUM",machineStopped:false});
    await reviewRequest(supervisor,row.id,{action:"APPROVED",priorityApproved:"HIGH",internalNote:"private note"});
    expect((await getRequest(requester,row.id)).internalNote).toBeUndefined();
    const results=await Promise.allSettled([convertRequest(supervisor,row.id),convertRequest(supervisor,row.id)]);
    expect(results.filter(x=>x.status === "fulfilled")).toHaveLength(1);expect(await db.workOrder.count({where:{sourceWorkRequestId:row.id}})).toBe(1);
    const request=await db.workRequest.findUniqueOrThrow({where:{id:row.id}});expect(request.status).toBe("CONVERTED");expect(request.problemDescription).toBe("Abnormal sound");
    await expect(reviewRequest(supervisor,row.id,{action:"REJECTED",reason:"too late"})).rejects.toThrow();
  });
  it("requires rejection reason and rejects requester approval/foreign reads",async()=>{
    const requester=await actor("requester"),supervisor=await actor("supervisor"),asset=await db.asset.findFirstOrThrow({where:{isActive:true}});
    const row=await createRequest(requester,{assetId:asset.id,title:"Test",problemDescription:"Test",priorityRequested:"LOW"});
    await expect(reviewRequest(supervisor,row.id,{action:"REJECTED"})).rejects.toThrow("เหตุผล");await expect(convertRequest(requester,row.id)).rejects.toThrow("สิทธิ์");
    await expect(getRequest({...requester,id:"foreign"},row.id)).rejects.toThrow("สิทธิ์");
  });
});
