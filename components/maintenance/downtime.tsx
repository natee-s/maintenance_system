import { db } from "@/lib/db";
import type { WorkOrder } from "@/generated/prisma/client";
import { can,type Actor } from "@/lib/permissions";
import { formatDate } from "@/lib/dates";
import { durationMinutes } from "@/modules/downtime/rules";
import { RecordForm } from "@/components/forms/record-form";
function inputTime(date:Date|null|undefined){return date ? new Date(date.getTime()+7*3600000).toISOString().slice(0,16) : "";}
export async function DowntimePanel({actor,wo}:{actor:Actor;wo:WorkOrder}){if(wo.type !== "CORRECTIVE")return null;const row=await db.downtimeEvent.findUnique({where:{workOrderId:wo.id}});const editable=can(actor.role,"work_order.update_execution") && !["COMPLETED","CLOSED","CANCELLED"].includes(wo.status);const correction=can(actor.role,"work_order.verify_close") && !!row && !row.endedAt && ["COMPLETED","CLOSED","CANCELLED"].includes(wo.status);return <section className="panel mt-6"><h2 className="font-bold">Downtime · การหยุดเครื่อง</h2>{row ? <p className="my-4 text-sm">เริ่ม {formatDate(row.startedAt,true)} · {row.endedAt ? `สิ้นสุด ${formatDate(row.endedAt,true)}` : "ยังหยุดอยู่"} · {durationMinutes(row.startedAt,row.endedAt ?? new Date()).toFixed(2)} นาที</p> : <p className="my-4 text-sm text-slate-500">ไม่มีการหยุดเครื่องที่บันทึกไว้</p>}{(editable || correction) && <RecordForm endpoint={`/api/work-orders/${wo.id}/downtime`} initial={{startedAt:inputTime(row?.startedAt),endedAt:inputTime(row?.endedAt),reason:row?.reason ?? ""}} fields={[{name:"startedAt",label:"เริ่มหยุดเครื่อง",type:"datetime-local",required:!row},{name:"endedAt",label:"สิ้นสุดการหยุดเครื่อง (เว้นว่างถ้ายังหยุด)",type:"datetime-local",required:correction},{name:"reason",label:correction ? "เหตุผลแก้ไข Downtime" : "เหตุผลหยุดเครื่อง",required:correction}]} />}</section>;}


