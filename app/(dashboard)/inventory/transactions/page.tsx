import { pageActor } from "@/lib/auth";
import { transactions } from "@/modules/inventory/query-service";
import { inventoryOptions } from "@/modules/inventory/master-service";
import { StockTransactionType } from "@/generated/prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Filters } from "@/components/forms/filters";
import { RecordList } from "@/components/tables/record-list";
import { formatDate } from "@/lib/dates";
import type { Query } from "@/lib/lists";
export default async function Ledger({searchParams}:{searchParams:Promise<Query>}){const actor=await pageActor(),query=await searchParams,data=await transactions(actor,query),[parts,warehouses]=await inventoryOptions();return <><PageHeader title="Stock Transaction Ledger" description="รายการที่โพสต์แล้วแก้ไขไม่ได้ การแก้ยอดใช้รายการใหม่พร้อมเหตุผล"/><Filters query={query} fields={[{name:"dateFrom",label:"ตั้งแต่",type:"date"},{name:"dateTo",label:"ถึง",type:"date"},{name:"workOrderId",label:"ID ใบงาน"},{name:"partId",label:"อะไหล่",type:"select",options:parts.map(x=>({value:x.id,label:x.name}))},{name:"warehouseId",label:"คลัง",type:"select",options:warehouses.map(x=>({value:x.id,label:x.name}))},{name:"type",label:"ประเภท",type:"select",options:Object.values(StockTransactionType).map(value=>({value,label:value}))}]} /><RecordList {...data} base="/inventory/transactions" query={query} columns={["รหัส","อะไหล่ / จำนวน","คลัง","ใบงาน","ผู้บันทึก","เวลา / เหตุผล"]} rows={data.rows.map(x=>({id:x.id,href:`/inventory/parts/${x.partId}`,cells:[x.transactionCode,`${x.part.partCode} · ${x.part.name} · ${x.quantity.toString()}`,x.warehouse.name,x.workOrder?.workOrderCode ?? "—",x.performer.name,`${formatDate(x.createdAt,true)} · ${x.reason ?? x.referenceText ?? "—"}`],badge:x.type}))}/></>;}

