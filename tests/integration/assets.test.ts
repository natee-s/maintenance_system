import "dotenv/config";
import { afterAll,describe,it,expect } from "vitest";
import { db } from "@/lib/db";
import { saveAsset,qrAsset,assetDto,listAssets } from "@/modules/assets/service";
import type { Actor } from "@/lib/permissions";
afterAll(()=>db.$disconnect());
const actor = async (username:string): Promise<Actor> => db.user.findUniqueOrThrow({where:{username},select:{id:true,name:true,role:true,siteId:true}});
describe("asset and QR",()=>{
  it("creates and edits while preserving a unique stable QR",async()=>{
    const admin=await actor("admin");const source=await db.asset.findFirstOrThrow({where:{assetCode:"MP-001"}});
    const input={name:`Test ${Date.now()}`,categoryId:source.categoryId,siteId:source.siteId,criticality:"LOW",status:"ACTIVE",isActive:true};
    const asset=await saveAsset(admin,input);const updated=await saveAsset(admin,{...input,id:asset.id,name:"Updated"});expect(updated.qrToken).toBe(asset.qrToken);
    const requester=await actor("requester");expect(assetDto(requester,await qrAsset(requester,asset.qrToken))).not.toHaveProperty("serialNumber");
    await saveAsset(admin,{...input,id:asset.id,isActive:false});await expect(qrAsset(requester,asset.qrToken)).rejects.toThrow("QR");
  });
  it("limits list size and rejects requester write",async()=>{const requester=await actor("requester");expect((await listAssets(requester,{pageSize:"999"})).pageSize).toBe(100);await expect(saveAsset(requester,{name:"x",categoryId:"x",siteId:"x",status:"ACTIVE",criticality:"LOW"})).rejects.toThrow("สิทธิ์");});
});
