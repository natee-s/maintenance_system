import { db,transaction } from "@/lib/db";
import { z } from "zod";
import { requirePermission,type Actor } from "@/lib/permissions";
import { invariant } from "@/lib/errors";
import { accessibleWork,getWork } from "@/modules/work-orders/service";
import { requireEditable } from "@/modules/work-orders/rules";
import { validateChecklistItem } from "./checklist-rules";
import { activity } from "@/modules/work-orders/activity";
import { audit } from "@/modules/audit/service";
export async function checklist(actor:Actor,id:string){await getWork(actor,id);return db.pmExecutionItem.findMany({where:{workOrderId:id},include:{attachments:true},orderBy:{sequence:"asc"}});}
const bool=z.union([z.boolean(),z.enum(["true","false",""])]).optional().transform(value=>value === undefined || value === "" ? null : value === true || value === "true");
const number=z.union([z.number(),z.string()]).optional().transform(value=>value === "" || value === undefined ? null : Number(value)).refine(value=>value === null || Number.isFinite(value));
export async function respond(actor:Actor,id:string,itemId:string,input:unknown){requirePermission(actor,"pm.execute");const data=z.object({responseBoolean:bool,responseText:z.string().trim().max(3000).optional().transform(value=>value || null),responseNumber:number,passFailResult:z.enum(["PASS","FAIL",""]).optional().transform(value=>value || null),note:z.string().trim().max(3000).optional().transform(value=>value || null)}).parse(input);return transaction(async tx=>{const wo=await accessibleWork(tx,actor,id);requireEditable(wo.status);invariant(wo.type === "PREVENTIVE" && wo.actualStartAt,"กรุณาเริ่มงาน PM ก่อนตอบ Checklist");const before=await tx.pmExecutionItem.findFirstOrThrow({where:{id:itemId,workOrderId:id}});const item={...before,...data};validateChecklistItem(item,false,false);const saved=await tx.pmExecutionItem.update({where:{id:itemId},data:{...data,completedBy:actor.id,completedAt:new Date()}});await activity(tx,actor.id,id,"CHECKLIST_RESPONSE",`บันทึกข้อ ${before.sequence}: ${before.titleSnapshot}`);await audit(tx,actor.id,"PM_RESPONSE","PmExecutionItem",itemId,before,saved);return saved;});}
