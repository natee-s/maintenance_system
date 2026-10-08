import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { requirePermission,type Actor } from "@/lib/permissions";
import { pagination,value,type Query } from "@/lib/lists";
import { reportRange } from "@/modules/dashboard/service";
export async function usageHistory(actor:Actor,query:Query){
 requirePermission(actor,"inventory.read");const page=pagination(query),{from,to}=reportRange({dateFrom:"1970-01-01",...query});
 const where:Prisma.WorkOrderPartUsageWhereInput={partId:value(query,"partId"),workOrderId:value(query,"workOrderId"),createdAt:{gte:from,lte:to},workOrder:{assetId:value(query,"assetId"),assignedToId:actor.role === "TECHNICIAN" ? actor.id : undefined,asset:{siteId:value(query,"siteId")}}};
 const [rows,total]=await Promise.all([db.workOrderPartUsage.findMany({where,include:{part:{include:{uom:true}},warehouse:true,workOrder:{include:{asset:{select:{id:true,name:true,assetCode:true}}}}},orderBy:{createdAt:"desc"},skip:page.skip,take:page.take}),db.workOrderPartUsage.count({where})]);return {...page,rows,total};
}
export async function inventoryReport(actor:Actor,query:Query){
 requirePermission(actor,"inventory.read");const {from,to}=reportRange(query);
 const site=value(query,"siteId"),area=value(query,"areaId"),category=value(query,"categoryId");
 const stockFilter=site ? Prisma.sql`AND wh."siteId"=${site}` : Prisma.empty;
 const usageFilter=Prisma.sql`${site ? Prisma.sql`AND a."siteId"=${site}` : Prisma.empty} ${area ? Prisma.sql`AND a."areaId"=${area}` : Prisma.empty} ${category ? Prisma.sql`AND a."categoryId"=${category}` : Prisma.empty} ${actor.role === "TECHNICIAN" ? Prisma.sql`AND w."assignedToId"=${actor.id}` : Prisma.empty}`;
 const base=Prisma.sql`FROM "StockTransaction" t JOIN "Part" p ON p.id=t."partId" JOIN "MasterData" u ON u.id=p."uomId" JOIN "WorkOrder" w ON w.id=t."workOrderId" JOIN "Asset" a ON a.id=w."assetId" WHERE t.type IN ('ISSUE','RETURN') AND t."createdAt" BETWEEN ${from} AND ${to} ${usageFilter}`;
 const net=Prisma.sql`SUM(CASE WHEN t.type='ISSUE' THEN t.quantity ELSE -t.quantity END)`;
 const [activeParts,low,quantities,top,byAsset,byWork]=await Promise.all([
 db.part.count({where:{isActive:true,...(site ? {balances:{some:{warehouse:{siteId:site}}}} : {})}}),
 db.$queryRaw<{low:number;critical:number}[]>(Prisma.sql`SELECT COUNT(DISTINCT p.id)::int AS low,COUNT(DISTINCT p.id) FILTER(WHERE p."isCritical")::int AS critical FROM "StockBalance" b JOIN "Part" p ON p.id=b."partId" JOIN "Warehouse" wh ON wh.id=b."warehouseId" WHERE p."isActive" AND wh."isActive" AND b."onHandQty"-b."reservedQty"<=p."reorderPoint" ${stockFilter}`),
 db.$queryRaw<{name:string;onHand:string;reserved:string;available:string}[]>(Prisma.sql`SELECT u.name,SUM(b."onHandQty")::text AS "onHand",SUM(b."reservedQty")::text AS reserved,SUM(b."onHandQty"-b."reservedQty")::text AS available FROM "StockBalance" b JOIN "Part" p ON p.id=b."partId" JOIN "MasterData" u ON u.id=p."uomId" JOIN "Warehouse" wh ON wh.id=b."warehouseId" WHERE p."isActive" AND wh."isActive" ${stockFilter} GROUP BY u.id,u.name`),
 db.$queryRaw<{name:string;count:number}[]>(Prisma.sql`SELECT p."partCode" || ' · ' || p.name || ' (' || u.name || ')' AS name,${net}::float8 AS count ${base} GROUP BY p.id,p."partCode",p.name,u.name HAVING ${net}<>0 ORDER BY count DESC LIMIT 10`),
 db.$queryRaw<{name:string;count:number}[]>(Prisma.sql`SELECT a."assetCode" || ' (' || u.name || ')' AS name,${net}::float8 AS count ${base} GROUP BY a.id,a."assetCode",u.name HAVING ${net}<>0 ORDER BY count DESC LIMIT 10`),
 db.$queryRaw<{name:string;count:number}[]>(Prisma.sql`SELECT w."workOrderCode" || ' (' || u.name || ')' AS name,${net}::float8 AS count ${base} GROUP BY w.id,w."workOrderCode",u.name HAVING ${net}<>0 ORDER BY count DESC LIMIT 10`),
 ]);return {activeParts,...low[0],quantities,charts:[{title:"อะไหล่ใช้สุทธิในช่วงที่เลือก",data:top},{title:"การใช้สุทธิตามเครื่องจักร / หน่วย",data:byAsset},{title:"การใช้สุทธิตามใบงาน / หน่วย",data:byWork}]};
}

