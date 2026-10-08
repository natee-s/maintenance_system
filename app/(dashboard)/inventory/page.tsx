import Link from "next/link";
import { Package, ArrowDownToLine, AlertTriangle, History, Warehouse } from "lucide-react";
import { pageActor } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { listParts,inventoryOptions } from "@/modules/inventory/master-service";
import { partFields } from "@/modules/inventory/fields";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chips";
import { Filters } from "@/components/forms/filters";
import { RecordList } from "@/components/tables/record-list";
import { RecordForm } from "@/components/forms/record-form";
import type { Query } from "@/lib/lists";
import { Prisma } from "@/generated/prisma/client";
export default async function Inventory({searchParams}:{searchParams:Promise<Query>}) {
  const actor=await pageActor(),query=await searchParams,data=await listParts(actor,query);
  const [categories,images]=await Promise.all([db.masterData.findMany({where:{kind:"PART_CATEGORY",isActive:true},orderBy:{name:"asc"}}),db.attachment.findMany({where:{partId:{in:data.rows.map(row=>row.id)},mimeType:{startsWith:"image/"}},select:{partId:true,storageKey:true},orderBy:{createdAt:"desc"}})]);
  return <><PageHeader title="คลังอะไหล่" description="อะไหล่พร้อมใช้ งานซ่อมพร้อมเดินหน้า">{can(actor.role,"inventory.manage_master") && <Button asChild><a href="#add-part"><Package size={17}/>เพิ่มอะไหล่</a></Button>}</PageHeader>
    <nav aria-label="เมนูคลังอะไหล่" className="mb-5 flex gap-2 overflow-x-auto pb-1">{[{href:"/inventory/stock",label:"Stock / รับเข้า / ปรับยอด",icon:ArrowDownToLine},{href:"/inventory/warehouses",label:"คลัง",icon:Warehouse},{href:"/inventory/transactions",label:"Ledger",icon:History},{href:"/inventory/low-stock",label:"Stock ต่ำ",icon:AlertTriangle}].map(({href,label,icon:Icon})=><Link href={href} key={href} className="chip"><Icon size={16}/>{label}</Link>)}</nav>
    <Filters query={query} fields={[{name:"search",label:"รหัส / ชื่ออะไหล่"},{name:"categoryId",label:"กรองประเภทอะไหล่",type:"select",options:categories.map(x=>({value:x.id,label:x.name}))}]}/>
    <FilterChips base="/inventory" query={query} name="categoryId" label="หมวดหมู่อะไหล่" options={categories.map(x=>({value:x.id,label:x.name}))}/>
    <RecordList {...data} base="/inventory" query={query} columns={["รหัส","อะไหล่","พร้อมใช้รวม","หน่วย","ความสำคัญ"]} rows={data.rows.map(x=>{const available=x.balances.reduce((sum,b)=>sum.add(b.onHandQty.sub(b.reservedQty)),new Prisma.Decimal(0));const file=images.find(file=>file.partId===x.id);const low=x.isActive && x.balances.some(b=>b.onHandQty.sub(b.reservedQty).lte(x.reorderPoint));return {id:x.id,href:`/inventory/parts/${x.id}`,cells:[x.partCode,x.name,available.toString(),x.uom.name,x.isCritical ? "สำคัญ" : "ปกติ"],badge:!x.isActive ? "INACTIVE" : low ? "LOW_STOCK" : "ACTIVE",thumbnail:"part",image:file ? `/api/files/${file.storageKey}` : undefined,hint:low ? "ตรวจสอบยอดพร้อมใช้แยกตามคลัง" : undefined};})}/>
    {can(actor.role,"inventory.manage_master") && <div id="add-part" className="mt-6 scroll-mt-24"><RecordForm title="เพิ่มอะไหล่" endpoint="/api/parts" fields={partFields(await inventoryOptions())} initial={{minStock:0,reorderPoint:0,isCritical:false,isActive:true}} redirectTo="/inventory/parts/:id"/></div>}
  </>;
}
