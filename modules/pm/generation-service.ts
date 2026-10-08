import { db,transaction } from "@/lib/db";
import { requirePermission,type Actor } from "@/lib/permissions";
import { invariant } from "@/lib/errors";
import { bangkokDay } from "@/lib/dates";
import { nextCode } from "@/lib/codes";
import { activeAsset } from "@/modules/assets/service";
import { nextDue,inLeadWindow } from "./recurrence";
import { activity } from "@/modules/work-orders/activity";
import { audit } from "@/modules/audit/service";
export async function generateOccurrence(actor:Actor,planId:string,scheduledDueDate:Date){requirePermission(actor,"pm.manage");const today=new Date(bangkokDay());return transaction(async tx=>{
  const plan=await tx.pmPlan.findUniqueOrThrow({where:{id:planId},include:{template:{include:{items:{where:{isActive:true},orderBy:{sequence:"asc"}}}}}});
  const existing=await tx.workOrder.findUnique({where:{pmPlanId_scheduledDueDate:{pmPlanId:plan.id,scheduledDueDate}}});if(existing)return {id:existing.id,created:false};
  invariant(plan.nextDueDate.getTime() === scheduledDueDate.getTime() && plan.isActive && plan.template.isActive,"แผน PM เปลี่ยนแปลงหรือปิดใช้งาน",409);invariant(inLeadWindow(scheduledDueDate,plan.leadDays,today),"PM ยังไม่ถึงช่วงสร้างใบงาน");await activeAsset(tx,plan.assetId);invariant(plan.template.items.length,"แบบ PM ไม่มีรายการตรวจสอบ");
  if(plan.assignedToId){const user=await tx.user.findUnique({where:{id:plan.assignedToId}});invariant(user?.isActive && user.role === "TECHNICIAN","ช่างเริ่มต้นไม่พร้อมใช้งาน");}
  const dueAt=new Date(`${scheduledDueDate.toISOString().slice(0,10)}T23:59:59.999+07:00`);
  const wo=await tx.workOrder.create({data:{workOrderCode:await nextCode(tx,"WO"),type:"PREVENTIVE",assetId:plan.assetId,pmPlanId:plan.id,scheduledDueDate,title:plan.name,description:plan.template.description ?? plan.name,safetyNoteSnapshot:plan.template.safetyNote,assignedToId:plan.assignedToId,status:plan.assignedToId ? "ASSIGNED" : "OPEN",dueAt,createdBy:actor.id}});
  await tx.pmExecutionItem.createMany({data:plan.template.items.map(item=>({workOrderId:wo.id,sourceItemId:item.id,sequence:item.sequence,titleSnapshot:item.title,instructionSnapshot:item.instruction,itemType:item.itemType,required:item.required,unit:item.unit,minValue:item.minValue,maxValue:item.maxValue,requiresNoteOnFail:item.requiresNoteOnFail,requiresPhotoOnFail:item.requiresPhotoOnFail}))});
  await tx.pmPlan.update({where:{id:plan.id},data:{nextDueDate:nextDue(scheduledDueDate,plan.frequencyType,plan.intervalValue),lastGeneratedAt:new Date()}});await activity(tx,actor.id,wo.id,"PM_GENERATED",`สร้างตามรอบ ${scheduledDueDate.toISOString().slice(0,10)}`);await audit(tx,actor.id,"PM_GENERATE","PmPlan",plan.id,undefined,{workOrderId:wo.id,scheduledDueDate});
  if(plan.assignedToId)await tx.notification.create({data:{userId:plan.assignedToId,type:"PM_DUE",title:"งาน PM ที่ถึงกำหนด",message:plan.name,link:`/work-orders/${wo.id}`}});return {id:wo.id,created:true};
});}
export async function generateDue(actor:Actor,planId?:string){requirePermission(actor,"pm.manage");const today=new Date(bangkokDay());const plans=await db.pmPlan.findMany({where:{id:planId,isActive:true,template:{isActive:true},nextDueDate:{lte:new Date(today.getTime()+365*86400000)}},orderBy:{nextDueDate:"asc"},take:500});const eligible=plans.filter(plan=>inLeadWindow(plan.nextDueDate,plan.leadDays,today));const results=[];for(const plan of eligible)results.push(await generateOccurrence(actor,plan.id,plan.nextDueDate));console.log(JSON.stringify({event:"pm_generation",created:results.filter(x=>x.created).length,existing:results.filter(x=>!x.created).length}));return {id:results[0]?.id,created:results.filter(x=>x.created).length,results};}
