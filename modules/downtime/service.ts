import { transaction } from "@/lib/db";
import { z } from "zod";
import { requirePermission,type Actor } from "@/lib/permissions";
import { optionalDate } from "@/lib/lists";
import { invariant } from "@/lib/errors";
import { accessibleWork } from "@/modules/work-orders/service";
import { requireEditable } from "@/modules/work-orders/rules";
import { durationMinutes } from "./rules";
import { audit } from "@/modules/audit/service";
import { activity } from "@/modules/work-orders/activity";
import { can } from "@/lib/permissions";
export async function saveDowntime(actor:Actor,id:string,input:unknown){requirePermission(actor,"work_order.update_execution");const data=z.object({startedAt:optionalDate,endedAt:optionalDate,reason:z.string().trim().max(2000).optional()}).parse(input);return transaction(async tx=>{const wo=await accessibleWork(tx,actor,id);invariant(wo.type === "CORRECTIVE","Downtime ใช้กับงานซ่อมแก้ไข");const before=await tx.downtimeEvent.findUnique({where:{workOrderId:id}});if(["COMPLETED","CLOSED","CANCELLED"].includes(wo.status)){invariant(can(actor.role,"work_order.verify_close") && before && !before.endedAt && data.endedAt && data.reason?.trim(),"หลังสิ้นสุดใบงาน หัวหน้าต้องระบุเวลาสิ้นสุดและเหตุผลแก้ไข Downtime");invariant(!data.startedAt || data.startedAt.getTime() === before.startedAt.getTime(),"ห้ามเปลี่ยนเวลาเริ่มหลังสิ้นสุดใบงาน");}else requireEditable(wo.status);const start=data.startedAt ?? before?.startedAt;invariant(start,"กรุณาระบุเวลาเริ่มหยุดเครื่อง");invariant(start <= new Date() && (!data.endedAt || data.endedAt <= new Date()),"เวลา Downtime ต้องไม่อยู่ในอนาคต");const values={startedAt:start,endedAt:data.endedAt,durationMinutes:data.endedAt ? durationMinutes(start,data.endedAt) : null,reason:data.reason ?? before?.reason};const row=await tx.downtimeEvent.upsert({where:{workOrderId:id},create:{...values,assetId:wo.assetId,workOrderId:id,createdBy:actor.id},update:values});await activity(tx,actor.id,id,"DOWNTIME",data.endedAt ? "สิ้นสุดการหยุดเครื่อง" : "บันทึกการหยุดเครื่อง");await audit(tx,actor.id,"DOWNTIME_UPDATE","DowntimeEvent",row.id,before,row);return row;});}

