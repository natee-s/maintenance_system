import { db } from "@/lib/db";
import { invariant } from "@/lib/errors";
import type { Actor } from "@/lib/permissions";
import { getAsset } from "./service";
import { pagination,value,type Query } from "@/lib/lists";
import { WorkOrderType,WorkOrderStatus,type Prisma } from "@/generated/prisma/client";
import { usageHistory } from "@/modules/inventory/report-service";
import { dateFilter } from "@/lib/dates/range";
export async function assetHistory(actor:Actor,id:string,query:Query){invariant(actor.role !== "REQUESTER","ไม่มีสิทธิ์ดูประวัติการซ่อม",403);const asset=await getAsset(actor,id);const page=pagination(query);dateFilter(query);const from=value(query,"dateFrom"),to=value(query,"dateTo");const where:Prisma.WorkOrderWhereInput={assetId:id,type:WorkOrderType[value(query,"type") as keyof typeof WorkOrderType],status:WorkOrderStatus[value(query,"status") as keyof typeof WorkOrderStatus],failureCategoryId:value(query,"failureCategoryId"),createdAt:{...(from ? {gte:new Date(`${from}T00:00:00+07:00`)} : {}),...(to ? {lte:new Date(`${to}T23:59:59.999+07:00`)} : {})}};const [rows,total,requests]=await Promise.all([db.workOrder.findMany({where,include:{assignedTo:{select:{name:true}},failureCategory:true,downtime:true,attachments:true},orderBy:{createdAt:"desc"},skip:page.skip,take:page.take}),db.workOrder.count({where}),db.workRequest.findMany({where:{assetId:id,reportedAt:{...(from ? {gte:new Date(`${from}T00:00:00+07:00`)} : {}),...(to ? {lte:new Date(`${to}T23:59:59.999+07:00`)} : {})}},orderBy:{reportedAt:"desc"},take:100})]);const parts=await usageHistory(actor,{dateFrom:"1970-01-01",...query,assetId:id});return {asset,...page,rows,total,requests,parts};}



