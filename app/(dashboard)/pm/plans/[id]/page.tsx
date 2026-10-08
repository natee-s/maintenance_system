import { db } from "@/lib/db";
import { pageActor } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { invariant } from "@/lib/errors";
import { pmOptions } from "@/modules/pm/master-service";
import { planFields } from "@/modules/pm/fields";
import { PageHeader } from "@/components/ui/page-header";
import { RecordForm } from "@/components/forms/record-form";
import { formatDate,dateInput } from "@/lib/dates";
export default async function PlanDetail({params}:{params:Promise<{id:string}>}){const actor=await pageActor();invariant(!["REQUESTER","STOREKEEPER"].includes(actor.role),"ไม่มีสิทธิ์ดูแผน PM",403);const row=await db.pmPlan.findUniqueOrThrow({where:{id:(await params).id},include:{asset:{select:{name:true,assetCode:true}},template:true}});invariant(actor.role !== "TECHNICIAN" || row.assignedToId === actor.id,"ไม่มีสิทธิ์ดูแผน PM",403);return <><PageHeader title={row.name} description={`${row.pmPlanCode} · ${row.asset.assetCode} · ${row.asset.name}`} /><section className="panel"><p>แบบ PM: {row.template.name}</p><p className="mt-3">กำหนดครั้งถัดไป: {formatDate(row.nextDueDate)} · {row.frequencyType}</p><p className="mt-3 text-orange-700">{row.template.safetyNote}</p></section>{can(actor.role,"pm.manage") && <div className="mt-6"><RecordForm endpoint="/api/pm/generate-due" fields={[]} initial={{planId:row.id}} submitLabel="สร้างงาน PM ตามแผนนี้" redirectTo="/work-orders/:id"/><RecordForm endpoint="/api/pm/plans" fields={planFields(await pmOptions())} initial={{...row,startDate:dateInput(row.startDate),nextDueDate:dateInput(row.nextDueDate)}} /></div>}</>;}
