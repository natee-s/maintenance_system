import { db,transaction,type Tx } from "@/lib/db";
import { Prisma,Priority,WorkOrderStatus,WorkOrderType } from "@/generated/prisma/client";
import { z } from "zod";
import { requirePermission,requireAssigned,type Actor,type Permission } from "@/lib/permissions";
import { invariant } from "@/lib/errors";
import { optionalDate,pagination,value,type Query } from "@/lib/lists";
import { nextCode } from "@/lib/codes";
import { activeAsset } from "@/modules/assets/service";
import { activity } from "./activity";
import { validateTransition,requireEditable } from "./rules";
import { audit } from "@/modules/audit/service";
import { validatePmCompletion } from "@/modules/pm/completion";
import { releaseReservations } from "@/modules/inventory/reservation-service";
import { dateFilter } from "@/lib/dates/range";
import { bangkokDay } from "@/lib/dates";
function myWorkFilter(query:Query):Prisma.WorkOrderWhereInput{const today=bangkokDay(),start=new Date(`${today}T00:00:00+07:00`),end=new Date(start.getTime()+86400000),active={notIn:["COMPLETED","CLOSED","CANCELLED"] as WorkOrderStatus[]};switch(value(query,"view")){case "urgent":return {priority:"URGENT",status:active};case "today":return {status:active,OR:[{dueAt:{gte:start,lt:end}},{plannedStartAt:{gte:start,lt:end}}]};case "progress":return {status:"IN_PROGRESS"};case "waiting":return {status:"WAITING_PART"};case "pm":return {type:"PREVENTIVE",status:active};default:return {};}}
export const workInclude={asset:{include:{site:true,area:true,location:true}},assignedTo:{select:{id:true,name:true}},failureCategory:true,sourceWorkRequest:{select:{id:true,requestCode:true,machineStopped:true}},activities:{include:{actor:{select:{name:true}}},orderBy:{createdAt:"asc"}},comments:{include:{author:{select:{name:true}}},orderBy:{createdAt:"asc"}},attachments:true} satisfies Prisma.WorkOrderInclude;
export function workScope(actor:Actor):Prisma.WorkOrderWhereInput{invariant(actor.role !== "REQUESTER","ไม่มีสิทธิ์ดูใบงานซ่อม",403);return actor.role === "TECHNICIAN" ? {assignedToId:actor.id} : {};}
export async function accessibleWork(tx:Tx,actor:Actor,id:string){const row=await tx.workOrder.findFirst({where:{AND:[{id},workScope(actor)]}});invariant(row,"ไม่พบใบงานหรือไม่มีสิทธิ์",404);return row;}
export async function getWork(actor:Actor,id:string){const row=await db.workOrder.findFirst({where:{AND:[{id},workScope(actor)]},include:workInclude});invariant(row,"ไม่พบใบงานหรือไม่มีสิทธิ์",404);return row;}
export async function createWork(actor:Actor,input:unknown){requirePermission(actor,"work_order.create");const data=z.object({assetId:z.string().min(1),title:z.string().trim().min(1).max(200),description:z.string().trim().min(1).max(5000),priority:z.enum(Priority),dueAt:optionalDate}).parse(input);return transaction(async tx=>{await activeAsset(tx,data.assetId);const wo=await tx.workOrder.create({data:{...data,workOrderCode:await nextCode(tx,"WO"),createdBy:actor.id,type:"CORRECTIVE"}});await activity(tx,actor.id,wo.id,"CREATED","สร้างใบงานซ่อม");await audit(tx,actor.id,"WO_CREATE","WorkOrder",wo.id,undefined,wo);return wo;});}
export async function listWork(actor:Actor,query:Query){const page=pagination(query),search=value(query,"search");const where:Prisma.WorkOrderWhereInput={AND:[workScope(actor),myWorkFilter(query),{createdAt:dateFilter(query),assetId:value(query,"assetId"),assignedToId:value(query,"assignedTo"),status:WorkOrderStatus[value(query,"status") as keyof typeof WorkOrderStatus],type:WorkOrderType[value(query,"type") as keyof typeof WorkOrderType],priority:Priority[value(query,"priority") as keyof typeof Priority],asset:{siteId:value(query,"siteId"),areaId:value(query,"areaId")},...(value(query,"overdue") === "true" ? {dueAt:{lt:new Date()},status:{notIn:["COMPLETED","CLOSED","CANCELLED"]}} : {}),...(search ? {OR:[{workOrderCode:{contains:search,mode:"insensitive"}},{title:{contains:search,mode:"insensitive"}}]} : {})}]};const [rows,total]=await Promise.all([db.workOrder.findMany({where,include:{asset:{select:{name:true,assetCode:true}},assignedTo:{select:{name:true}}},orderBy:[{priority:"desc"},{dueAt:"asc"},{createdAt:"desc"}],skip:page.skip,take:page.take}),db.workOrder.count({where})]);return {...page,rows,total};}
export const workActions=["assign","unassign","start","pause","waiting-part","resume","complete","reopen","close","cancel","execution","comment"] as const;
type WorkAction=typeof workActions[number];
const actionPermission:Record<WorkAction,Permission>={assign:"work_order.assign",unassign:"work_order.assign",start:"work_order.start",pause:"work_order.update_execution","waiting-part":"work_order.update_execution",resume:"work_order.start",complete:"work_order.complete",reopen:"work_order.verify_close",close:"work_order.verify_close",cancel:"work_order.assign",execution:"work_order.update_execution",comment:"work_order.update_execution"};
const execution=z.object({findings:z.string().trim().max(5000).optional(),causeText:z.string().trim().max(5000).optional(),actionTaken:z.string().trim().max(5000).optional(),completionNote:z.string().trim().max(2000).optional(),failureCategoryId:z.string().optional()});
export async function operateWork(actor:Actor,id:string,action:WorkAction,input:unknown){requirePermission(actor,actionPermission[action]);return transaction(async tx=>{
  const before=await accessibleWork(tx,actor,id);requireAssigned(actor,before.assignedToId);const now=new Date();
  if(action === "comment"){requireEditable(before.status);const {body}=z.object({body:z.string().trim().min(1).max(3000)}).parse(input);await tx.comment.create({data:{workOrderId:id,authorId:actor.id,body}});await activity(tx,actor.id,id,"COMMENT",body);return {id};}
  if(action === "execution"){requireEditable(before.status);invariant(["IN_PROGRESS","PAUSED","WAITING_PART"].includes(before.status),"กรุณาเริ่มงานก่อนบันทึกผล");const data=execution.parse(input);await validateFailure(tx,data.failureCategoryId);const wo=await tx.workOrder.update({where:{id},data:{...data,failureCategoryId:data.failureCategoryId || null}});await audit(tx,actor.id,"WO_EXECUTION","WorkOrder",id,before,wo);return wo;}
  let target:WorkOrderStatus;let data:Prisma.WorkOrderUncheckedUpdateInput={};let message:string=action;
  if(action === "assign"){
    const assignment=z.object({assignedToId:z.string().min(1),plannedStartAt:optionalDate,dueAt:optionalDate,priority:z.enum(Priority).optional()}).parse(input);
    const technician=await tx.user.findUnique({where:{id:assignment.assignedToId}});invariant(technician?.isActive && technician.role === "TECHNICIAN","กรุณาเลือกช่างที่ใช้งาน");
    invariant(["OPEN","ASSIGNED"].includes(before.status),"มอบหมายได้เฉพาะงานเปิดใหม่หรือมอบหมายแล้ว");invariant(!assignment.dueAt || !assignment.plannedStartAt || assignment.dueAt >= assignment.plannedStartAt,"กำหนดเสร็จต้องไม่ก่อนวันเริ่ม");
    target="ASSIGNED";data={...assignment};message=`มอบหมายให้ ${technician.name}`;await tx.notification.create({data:{userId:technician.id,type:"ASSIGNED",title:"งานใหม่ที่มอบหมาย",message:before.title,link:`/work-orders/${id}`}});
  }else if(action === "unassign"){target="OPEN";data.assignedToId=null;}
  else if(action === "start" || action === "resume" || action === "reopen"){
    if(action === "start")invariant(before.status === "ASSIGNED","เริ่มได้เฉพาะงานมอบหมายแล้ว");if(action === "resume")invariant(["PAUSED","WAITING_PART"].includes(before.status),"งานไม่ได้พักหรือรออะไหล่");
    if(action === "reopen"){invariant(before.status === "COMPLETED","ส่งแก้ไขได้เฉพาะงานเสร็จแล้ว");message=reason(input);data.actualEndAt=null;if(before.assignedToId)await tx.notification.create({data:{userId:before.assignedToId,type:"REWORK",title:"ใบงานส่งกลับแก้ไข",message,link:`/work-orders/${id}`}});}
    target="IN_PROGRESS";data.actualStartAt=before.actualStartAt ?? now;
  }else if(action === "pause" || action === "waiting-part"){target=action === "pause" ? "PAUSED" : "WAITING_PART";message=reason(input);}
  else if(action === "complete"){
    const details=execution.parse(input);const merged={...before,...details};invariant(before.actualStartAt,"กรุณาเริ่มงานก่อน");invariant(merged.findings?.trim() && merged.actionTaken?.trim(),"กรุณาระบุสิ่งที่พบและการแก้ไข");
    if(before.type === "CORRECTIVE")invariant(merged.failureCategoryId,"กรุณาเลือกประเภทความขัดข้อง");else await validatePmCompletion(tx,id);await validateFailure(tx,merged.failureCategoryId);target="COMPLETED";data={...details,failureCategoryId:merged.failureCategoryId || null,actualEndAt:now};
  }else if(action === "close"){const downtime=await tx.downtimeEvent.findUnique({where:{workOrderId:id}});if(downtime && !downtime.endedAt)invariant(z.object({acknowledgeOpenDowntime:z.boolean().default(false)}).parse(input).acknowledgeOpenDowntime,"เครื่องยังหยุดอยู่ กรุณาบันทึกสิ้นสุด Downtime หรือยืนยันคำเตือนก่อนปิดงาน");target="CLOSED";data={closedBy:actor.id,closedAt:now};}
  else {target="CANCELLED";message=reason(input);}
  if(before.status !== target || action !== "assign")validateTransition(before.status,target);
  if(target === "CLOSED" || target === "CANCELLED")await releaseReservations(tx,actor,id);
  const wo=await tx.workOrder.update({where:{id},data:{...data,status:target}});await activity(tx,actor.id,id,action.toUpperCase(),message);await audit(tx,actor.id,`WO_${action.toUpperCase()}`,"WorkOrder",id,before,wo);return wo;
});}
function reason(input:unknown){return z.object({reason:z.string().trim().min(1,"กรุณาระบุเหตุผล").max(2000)}).parse(input).reason;}
async function validateFailure(tx:Tx,id:string|null|undefined){if(!id)return;const category=await tx.masterData.findUnique({where:{id}});invariant(category?.kind === "FAILURE_CATEGORY" && category.isActive,"ประเภทความขัดข้องไม่พร้อมใช้งาน");}


