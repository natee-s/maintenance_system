import { db } from "@/lib/db";
import type { Actor } from "@/lib/permissions";
import { requirePermission } from "@/lib/permissions";
import { reportRange } from "@/modules/dashboard/service";
import { bangkokDay } from "@/lib/dates";
import { value,type Query } from "@/lib/lists";
export async function pmSummary(actor:Actor,query:Query){
 requirePermission(actor,"dashboard.read");const {from,to}=reportRange(query),today=new Date(bangkokDay()),weekStart=new Date(today);weekStart.setUTCDate(today.getUTCDate()-((today.getUTCDay()+6)%7));const weekEnd=new Date(weekStart.getTime()+7*86400000);
 const assignedToId=actor.role === "TECHNICIAN" ? actor.id : undefined,asset={siteId:value(query,"siteId"),areaId:value(query,"areaId"),categoryId:value(query,"categoryId")};
 const common={type:"PREVENTIVE" as const,assignedToId,asset},active={notIn:["COMPLETED","CLOSED","CANCELLED"] as ("COMPLETED"|"CLOSED"|"CANCELLED")[]};
 const period={...common,status:{not:"CANCELLED" as const},scheduledDueDate:{gte:new Date(bangkokDay(from)),lte:new Date(bangkokDay(to))}},monthStart=new Date(`${bangkokDay().slice(0,7)}-01T00:00:00+07:00`);
 const [due,overdue,total,completed,completedThisMonth,plans]=await Promise.all([
 db.workOrder.count({where:{...common,scheduledDueDate:{gte:weekStart,lt:weekEnd},status:active}}),db.workOrder.count({where:{...common,scheduledDueDate:{lt:today},status:active}}),db.workOrder.count({where:period}),db.workOrder.count({where:{...period,status:{in:["COMPLETED","CLOSED"]}}}),db.workOrder.count({where:{...common,status:{in:["COMPLETED","CLOSED"]},actualEndAt:{gte:monthStart,lte:new Date()}}}),db.pmPlan.findMany({where:{isActive:true,template:{isActive:true},asset:{...asset,isActive:true},assignedToId,nextDueDate:{lt:weekEnd}},select:{id:true,nextDueDate:true,workOrders:{select:{scheduledDueDate:true}}}})
 ]);
 // Plans expose their next ungenerated occurrence. Do not double count an existing occurrence after a plan edit.
 const ungenerated=plans.filter(p=>!p.workOrders.some(w=>w.scheduledDueDate?.getTime() === p.nextDueDate.getTime()));
 return {due:due+ungenerated.filter(p=>p.nextDueDate >= weekStart).length,overdue:overdue+ungenerated.filter(p=>p.nextDueDate < today).length,total,completed,completedThisMonth,completionRate:total ? completed/total*100 : 0};
}
