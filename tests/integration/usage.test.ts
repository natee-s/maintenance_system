import "dotenv/config";
import { afterAll,it,expect } from "vitest";
import { db } from "@/lib/db";
import { savePart,saveWarehouse } from "@/modules/inventory/master-service";
import { postStock } from "@/modules/inventory/stock-service";
import { reservePart,issuePart,returnPart } from "@/modules/inventory/usage-service";
import { createWork,operateWork } from "@/modules/work-orders/service";
import type { Actor } from "@/lib/permissions";
afterAll(()=>db.$disconnect());
it("reserves, consumes, bounds returns, releases terminal reservations and reconciles",async()=>{
 const actor:Actor=await db.user.findUniqueOrThrow({where:{username:"admin"},select:{id:true,name:true,role:true,siteId:true}}),asset=await db.asset.findFirstOrThrow({where:{assetCode:"MP-001"}}),tech=await db.user.findUniqueOrThrow({where:{username:"technician1"}}),category=await db.masterData.findFirstOrThrow({where:{kind:"PART_CATEGORY"}}),uom=await db.masterData.findFirstOrThrow({where:{kind:"UOM",allowsDecimal:false}});
 const part=await savePart(actor,{name:`Usage ${Date.now()}`,categoryId:category.id,uomId:uom.id,minStock:"0",reorderPoint:"1"}),warehouse=await saveWarehouse(actor,{siteId:asset.siteId,code:`U${Date.now()}`,name:"Usage test"}),input={partId:part.id,warehouseId:warehouse.id};
 await postStock(actor,{...input,type:"INITIAL",quantity:"10"});
 const wo=await createWork(actor,{assetId:asset.id,title:"Usage integration",description:"Test",priority:"MEDIUM"});await operateWork(actor,wo.id,"assign",{assignedToId:tech.id});
 await reservePart(actor,wo.id,{...input,quantity:"6"});await issuePart(actor,wo.id,{...input,quantity:"4"});await returnPart(actor,wo.id,{...input,quantity:"1"});await expect(returnPart(actor,wo.id,{...input,quantity:"4"})).rejects.toThrow();
 let balance=await db.stockBalance.findUniqueOrThrow({where:{partId_warehouseId:input}});expect([balance.onHandQty.toString(),balance.reservedQty.toString()]).toEqual(["7","2"]);
 await operateWork(actor,wo.id,"cancel",{reason:"Release test"});balance=await db.stockBalance.findUniqueOrThrow({where:{id:balance.id}});expect(balance.reservedQty.toString()).toBe("0");expect(await db.partReservation.count({where:{workOrderId:wo.id,status:"CANCELLED"}})).toBe(1);
 await expect(issuePart(actor,wo.id,{...input,quantity:"1"})).rejects.toThrow();await returnPart(actor,wo.id,{...input,quantity:"3"});expect((await db.workOrderPartUsage.findFirstOrThrow({where:{workOrderId:wo.id}})).returnedQty.toString()).toBe("4");
});
it("two concurrent issuers cannot spend the last stock twice",async()=>{
 const actor:Actor=await db.user.findUniqueOrThrow({where:{username:"admin"},select:{id:true,name:true,role:true,siteId:true}}),asset=await db.asset.findFirstOrThrow({where:{assetCode:"MP-001"}}),tech=await db.user.findUniqueOrThrow({where:{username:"technician1"}}),category=await db.masterData.findFirstOrThrow({where:{kind:"PART_CATEGORY"}}),uom=await db.masterData.findFirstOrThrow({where:{kind:"UOM",allowsDecimal:false}}),part=await savePart(actor,{name:`Last stock ${Date.now()}`,categoryId:category.id,uomId:uom.id,minStock:"0",reorderPoint:"0"}),warehouse=await saveWarehouse(actor,{siteId:asset.siteId,code:`C${Date.now()}`,name:"Concurrency"}),input={partId:part.id,warehouseId:warehouse.id};await postStock(actor,{...input,type:"INITIAL",quantity:"1"});const orders=await Promise.all([1,2].map(async i=>{const wo=await createWork(actor,{assetId:asset.id,title:`Concurrent ${i}`,description:"Test",priority:"LOW"});await operateWork(actor,wo.id,"assign",{assignedToId:tech.id});return wo;}));const results=await Promise.allSettled(orders.map(wo=>issuePart(actor,wo.id,{...input,quantity:"1"})));expect(results.filter(x=>x.status === "fulfilled")).toHaveLength(1);expect((await db.stockBalance.findUniqueOrThrow({where:{partId_warehouseId:input}})).onHandQty.toString()).toBe("0");expect(await db.stockTransaction.count({where:{...input,type:"ISSUE"}})).toBe(1);
});
