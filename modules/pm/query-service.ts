import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { Actor } from "@/lib/permissions";
import { invariant } from "@/lib/errors";
import { pagination,value,type Query } from "@/lib/lists";
import { bangkokDay } from "@/lib/dates";
export async function listPlans(actor:Actor,query:Query){invariant(!["REQUESTER","STOREKEEPER"].includes(actor.role),"ไม่มีสิทธิ์ดูแผน PM",403);const page=pagination(query),search=value(query,"search"),today=new Date(bangkokDay());const where:Prisma.PmPlanWhereInput={assetId:value(query,"assetId"),assignedToId:actor.role === "TECHNICIAN" ? actor.id : value(query,"assignedTo"),asset:{siteId:value(query,"siteId"),areaId:value(query,"areaId")},...(value(query,"active") ? {isActive:value(query,"active") === "true"} : {}),...(value(query,"overdue") === "true" ? {isActive:true,nextDueDate:{lt:today}} : {}),...(search ? {OR:[{name:{contains:search,mode:"insensitive"}},{pmPlanCode:{contains:search,mode:"insensitive"}}]} : {})};const [rows,total]=await Promise.all([db.pmPlan.findMany({where,include:{asset:{select:{name:true,assetCode:true}},assignedTo:{select:{name:true}}},orderBy:{nextDueDate:"asc"},skip:page.skip,take:page.take}),db.pmPlan.count({where})]);return {...page,rows,total};}
