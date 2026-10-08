import { pageActor } from "@/lib/auth";
import { lowStockRows } from "@/modules/inventory/query-service";
import { PageHeader } from "@/components/ui/page-header";
import { Filters } from "@/components/forms/filters";
import { RecordList } from "@/components/tables/record-list";
import type { Query } from "@/lib/lists";
export default async function LowStock({searchParams}:{searchParams:Promise<Query>}){const query=await searchParams,data=await lowStockRows(await pageActor(),query);return <><PageHeader title="อะไหล่ Stock ต่ำ" description="พร้อมใช้ = คงเหลือ − จอง · แจ้งเมื่อพร้อมใช้ ≤ จุดแจ้ง"/><Filters query={query} fields={[{name:"critical",label:"เฉพาะอะไหล่สำคัญ",type:"select",options:[{value:"true",label:"เฉพาะสำคัญ"}]}]}/><RecordList {...data} base="/inventory/low-stock" query={query} columns={["รหัส","อะไหล่","คลัง","คงเหลือ","จอง","พร้อมใช้ / จุดแจ้ง"]} rows={data.rows.map(x=>({id:x.id,href:`/inventory/parts/${x.partId}`,cells:[x.partCode,x.name,x.warehouse,x.onHand,x.reserved,`${x.available} / ${x.reorder}`],badge:x.critical ? "CRITICAL" : "LOW"}))}/></>;}
