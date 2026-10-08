import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { saveUser, listUsers } from "@/modules/users/service";
import { saveLocation } from "@/modules/locations/service";
import type { Actor } from "@/lib/permissions";
afterAll(() => db.$disconnect());
const getActor = async (username: string): Promise<Actor> => db.user.findUniqueOrThrow({where:{username},select:{id:true,name:true,role:true,siteId:true}});
describe("users and masters", () => {
  it("rejects technician administration server-side", async () => { const actor = await getActor("technician1"); await expect(listUsers(actor)).rejects.toThrow("สิทธิ์"); await expect(saveLocation(actor,{})).rejects.toThrow("สิทธิ์"); });
  it("creates an audited user without leaking hash", async () => {
    const actor = await getActor("admin"); const name = `u${Date.now()}`;
    const user = await saveUser(actor,{name,username:name,email:`${name}@demo.local`,role:"REQUESTER",password:"TestPassword!2026",isActive:false});
    expect(user).not.toHaveProperty("passwordHash"); expect(await db.auditLog.count({where:{entityId:user.id,action:"USER_CREATE"}})).toBe(1);
  });
  it("rejects cross-site area selection and inactive parents", async () => {
    const actor = await getActor("admin"); const org = await db.organization.findFirstOrThrow();
    const site = await saveLocation(actor,{entity:"site",organizationId:org.id,code:`T${Date.now()}`,name:"Test",isActive:true});
    const area = await db.area.findFirstOrThrow();
    await expect(saveLocation(actor,{entity:"location",siteId:site.id,areaId:area.id,code:"BAD",name:"Bad"})).rejects.toThrow("พื้นที่");
    await db.site.update({where:{id:site.id},data:{isActive:false}});
    await expect(saveLocation(actor,{entity:"area",siteId:site.id,code:"BAD",name:"Bad"})).rejects.toThrow("โรงงาน");
  });
});
