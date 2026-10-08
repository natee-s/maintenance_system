import { db,transaction } from "@/lib/db";
import { invariant } from "@/lib/errors";
import type { Actor } from "@/lib/permissions";
import { pagination,type Query } from "@/lib/lists";
import { bangkokDay } from "@/lib/dates";
export async function notifications(actor:Actor,query:Query){
 // Materialize due/overdue notifications for this technician only. Serializable retries deduplicate concurrent visits.
 if(actor.role === "TECHNICIAN")await transaction(async tx=>{const today=new Date(bangkokDay()),orders=await tx.workOrder.findMany({where:{assignedToId:actor.id,type:"PREVENTIVE",status:{notIn:["COMPLETED","CLOSED","CANCELLED"]},scheduledDueDate:{lte:today}},take:100});for(const wo of orders){const type=wo.scheduledDueDate! < today ? "PM_OVERDUE" : "PM_DUE",link=`/work-orders/${wo.id}`;if(!await tx.notification.findFirst({where:{userId:actor.id,type,link}}))await tx.notification.create({data:{userId:actor.id,type,title:type === "PM_OVERDUE" ? "PM เกินกำหนด" : "PM ถึงกำหนด",message:`${wo.workOrderCode} · ${wo.title}`,link}});}});
 const page=pagination(query),where={userId:actor.id};const [rows,total,unread]=await Promise.all([db.notification.findMany({where,orderBy:{createdAt:"desc"},skip:page.skip,take:page.take}),db.notification.count({where}),db.notification.count({where:{...where,readAt:null}})]);return {...page,rows,total,unread};
}
export async function markRead(actor:Actor,id:string){const result=await db.notification.updateMany({where:{id,userId:actor.id,readAt:null},data:{readAt:new Date()}});invariant(result.count || await db.notification.count({where:{id,userId:actor.id}}),"ไม่พบการแจ้งเตือน",404);return {id};}
