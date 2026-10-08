import type { Query } from "@/lib/lists";
import { Pagination } from "@/components/tables/pagination";
import { Filters } from "@/components/forms/filters";
import { pageActor } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { stockRows } from "@/modules/inventory/stock-service";
import { inventoryOptions } from "@/modules/inventory/master-service";
import { stockFields } from "@/modules/inventory/fields";
import { PageHeader } from "@/components/ui/page-header";
import { RecordForm } from "@/components/forms/record-form";
export default async function StockPage({searchParams}:{searchParams:Promise<Query>}){const actor=await pageActor(),query=await searchParams,data=await stockRows(actor,query),rows=data.rows;return <><PageHeader title="Stock ตามคลัง"/><Filters query={query} fields={[{name:"search",label:"รหัส / ชื่ออะไหล่"},{name:"warehouseId",label:"คลัง",type:"select",options:(await inventoryOptions())[1].map(x=>({value:x.id,label:x.name}))}]}/><div className="space-y-3">{rows.map(row=><div key={row.id} className="panel"><h2 className="font-bold">{row.part.partCode} · {row.part.name} · {row.warehouse.name}</h2><p className="mt-3 text-sm">คงเหลือ {row.onHandQty.toString()} · จอง {row.reservedQty.toString()} · พร้อมใช้ {row.onHandQty.sub(row.reservedQty).toString()} {row.part.uom.name} · ช่อง {row.binText ?? "—"}</p></div>)}{!rows.length && <p className="panel">ยังไม่มีรายการ stock กรุณาบันทึกยอดยกมา</p>}</div><Pagination {...data} query={query} base="/inventory/stock"/>{can(actor.role,"inventory.issue_return") && <div className="mt-6"><RecordForm title="รับเข้า / ปรับ Stock" endpoint="/api/inventory/post" fields={stockFields(await inventoryOptions())} initial={{type:"RECEIPT_MANUAL"}}/></div>}</>;}

