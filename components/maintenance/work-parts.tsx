import { can,type Actor } from "@/lib/permissions";
import type { WorkOrder } from "@/generated/prisma/client";
import { workParts } from "@/modules/inventory/usage-service";
import { inventoryOptions } from "@/modules/inventory/master-service";
import { RecordForm } from "@/components/forms/record-form";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { PartOperationForm } from "@/components/forms/part-operation-form";
import { Prisma } from "@/generated/prisma/client";
export async function WorkPartsPanel({actor,wo}:{actor:Actor;wo:WorkOrder}){
 const [reservations,usage]=await workParts(actor,wo.id),[parts,warehouses]=await inventoryOptions();
 const siteId=(await db.asset.findUniqueOrThrow({where:{id:wo.assetId},select:{siteId:true}})).siteId;
 const balances=await db.stockBalance.findMany({where:{warehouse:{siteId,isActive:true},part:{isActive:true}},include:{part:{include:{uom:true}},warehouse:true},orderBy:{part:{partCode:"asc"}}});
 const operationProps={parts:parts.map(x=>({id:x.id,label:`${x.partCode} · ${x.name}`,unit:x.uom.name,decimal:x.uom.allowsDecimal})),warehouses:warehouses.filter(x=>x.siteId === siteId).map(x=>({id:x.id,name:x.name})),stock:balances.map(b=>{const own=reservations.filter(r=>r.partId === b.partId && r.warehouseId === b.warehouseId && ["ACTIVE","PARTIALLY_ISSUED"].includes(r.status)).reduce((sum,r)=>sum.add(r.quantity.sub(r.issuedQuantity)),new Prisma.Decimal(0));return {partId:b.partId,warehouseId:b.warehouseId,onHand:b.onHandQty.toString(),reserved:b.reservedQty.toString(),available:b.onHandQty.sub(b.reservedQty).toString(),issueAvailable:b.onHandQty.sub(b.reservedQty).add(own).toString()};})};
 return <section className="panel mt-6"><h2 className="font-bold">อะไหล่ในใบงาน</h2><div className="mt-4 space-y-3">
 {usage.map(row=><div key={row.id} className="rounded-xl bg-slate-50 p-4"><p className="font-semibold">{row.part.partCode} · {row.part.name} · {row.warehouse.name}</p><p className="mt-2 text-sm">เบิก {row.issuedQty.toString()} · คืน {row.returnedQty.toString()} · ใช้สุทธิ {row.issuedQty.sub(row.returnedQty).toString()}</p>{can(actor.role,"inventory.issue_return") && row.issuedQty.gt(row.returnedQty) && <div className="mt-3"><RecordForm title="คืนอะไหล่" endpoint={`/api/work-orders/${wo.id}/parts/return`} fields={[{name:"quantity",label:"จำนวน",type:"number",required:true}]} initial={{partId:row.partId,warehouseId:row.warehouseId}} submitLabel="คืนอะไหล่"/></div>}</div>)}
 {!usage.length && <p className="text-sm text-slate-500">ยังไม่มีการเบิกอะไหล่</p>}
 {reservations.map(row=><div key={row.id} className="rounded-xl border border-slate-200 p-4"><p className="text-sm">จอง {row.part.name} · {row.quantity.toString()} · เบิกแล้ว {row.issuedQuantity.toString()} · <Badge value={row.status}/></p>{can(actor.role,"inventory.reserve") && ["ACTIVE","PARTIALLY_ISSUED"].includes(row.status) && <RecordForm endpoint={`/api/work-orders/${wo.id}/parts/cancel-reservation`} fields={[]} initial={{reservationId:row.id}} submitLabel="ยกเลิกการจอง"/>}</div>)}</div>
 {(can(actor.role,"inventory.reserve") || can(actor.role,"inventory.issue_return")) && <details className="my-5"><summary className="min-h-11 cursor-pointer py-3 font-semibold text-blue-800">ตรวจยอดก่อนจอง / เบิก</summary><div className="space-y-3 text-sm">{balances.map(row=><p key={row.id}>{row.part.partCode} · {row.part.name} · {row.warehouse.name} — คงเหลือ {row.onHandQty.toString()} · จองรวม {row.reservedQty.toString()} · พร้อมใช้ {row.onHandQty.sub(row.reservedQty).toString()} {row.part.uom.name}</p>)}{!balances.length && <p>ยังไม่มี stock ในโรงงานนี้</p>}</div></details>}
 <div className="mt-5 space-y-4">{can(actor.role,"inventory.reserve") && !["COMPLETED","CLOSED","CANCELLED"].includes(wo.status) && <PartOperationForm title="จองอะไหล่" endpoint={`/api/work-orders/${wo.id}/parts/reserve`} {...operationProps}/>}{can(actor.role,"inventory.issue_return") && ["ASSIGNED","IN_PROGRESS","PAUSED","WAITING_PART"].includes(wo.status) && <PartOperationForm title="เบิกอะไหล่" endpoint={`/api/work-orders/${wo.id}/parts/issue`} {...operationProps}/>}</div></section>;
}


