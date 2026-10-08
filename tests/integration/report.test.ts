import "dotenv/config";
import { afterAll,it,expect } from "vitest";
import { db } from "@/lib/db";
import { inventoryReport,usageHistory } from "@/modules/inventory/report-service";
import { pmSummary } from "@/modules/pm/summary-service";
import { notifications,markRead } from "@/modules/notifications/service";
import type { Actor } from "@/lib/permissions";
afterAll(()=>db.$disconnect());
it("integrated reports use persisted stock and protect notification ownership",async()=>{const admin:Actor=await db.user.findUniqueOrThrow({where:{username:"admin"},select:{id:true,name:true,role:true,siteId:true}}),tech:Actor=await db.user.findUniqueOrThrow({where:{username:"technician1"},select:{id:true,name:true,role:true,siteId:true}});const data=await inventoryReport(admin,{});expect(data.activeParts).toBeGreaterThanOrEqual(5);expect(data.quantities.length).toBeGreaterThan(0);expect(data.charts).toHaveLength(3);expect((await usageHistory(admin,{})).total).toBeGreaterThanOrEqual(0);const pm=await pmSummary(admin,{});expect(pm.completionRate).toBeGreaterThanOrEqual(0);expect(pm.completionRate).toBeLessThanOrEqual(100);const list=await notifications(tech,{});expect(list.total).toBeGreaterThan(0);await expect(markRead(admin,list.rows[0].id)).rejects.toThrow();await markRead(tech,list.rows[0].id);expect((await db.notification.findUniqueOrThrow({where:{id:list.rows[0].id}})).readAt).toBeTruthy();});

