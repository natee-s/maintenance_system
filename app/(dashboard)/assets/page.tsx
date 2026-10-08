import Link from "next/link";
import { db } from "@/lib/db";
import { FilterChips } from "@/components/ui/filter-chips";
import { pageActor } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listAssets } from "@/modules/assets/service";
import { locationOptions } from "@/modules/locations/service";
import { AssetStatus,Criticality } from "@/generated/prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Filters } from "@/components/forms/filters";
import { RecordList } from "@/components/tables/record-list";
import type { Query } from "@/lib/lists";
export default async function AssetsPage({searchParams}:{searchParams:Promise<Query>}) {
  const actor=await pageActor(), query=await searchParams; const data=await listAssets(actor,query); const [,sites,areas,locations,masters]=await locationOptions();
  const images=actor.role==="REQUESTER" ? [] : await db.attachment.findMany({where:{assetId:{in:data.rows.map(row=>row.id)},mimeType:{startsWith:"image/"}},select:{assetId:true,storageKey:true},orderBy:{createdAt:"desc"}});
  const imageFor=(id:string)=>{const file=images.find(file=>file.assetId===id);return file ? `/api/files/${file.storageKey}` : undefined;};
  return <><PageHeader title="เครื่องจักร" description="ทะเบียนเครื่องจักรและประวัติการดูแล">{can(actor.role,"asset.create") && <Button asChild><Link href="/assets/new">+ เพิ่มเครื่องจักร</Link></Button>}<Button asChild variant="outline"><Link href="/scan">สแกน QR</Link></Button></PageHeader>
    <Filters query={query} fields={[{name:"search",label:"รหัส / ชื่อ / Serial"},{name:"siteId",label:"โรงงาน",type:"select",options:sites.map(x=>({value:x.id,label:x.name}))},{name:"areaId",label:"พื้นที่",type:"select",options:areas.map(x=>({value:x.id,label:x.name}))},{name:"locationId",label:"สถานที่",type:"select",options:locations.map(x=>({value:x.id,label:x.name}))},{name:"categoryId",label:"ประเภท",type:"select",options:masters.filter(x=>x.kind === "ASSET_CATEGORY").map(x=>({value:x.id,label:x.name}))},{name:"status",label:"สถานะ",type:"select",options:Object.values(AssetStatus).map(value=>({value,label:value}))},{name:"criticality",label:"ความสำคัญ",type:"select",options:Object.values(Criticality).map(value=>({value,label:value}))},{name:"sort",label:"เรียงตาม",type:"select",options:[{value:"name",label:"ชื่อ"},{value:"assetCode",label:"รหัส"}]},{name:"order",label:"ลำดับ",type:"select",options:[{value:"asc",label:"น้อยไปมาก"},{value:"desc",label:"มากไปน้อย"}]}]} />
    <FilterChips base="/assets" query={query} name="areaId" label="พื้นที่เครื่องจักร" options={areas.map(area=>({value:area.id,label:area.name}))}/>
    <RecordList {...data} query={query} base="/assets" columns={["รหัส","ชื่อเครื่องจักร","ประเภท","สถานที่","ความสำคัญ"]} rows={data.rows.map(x=>({id:x.id,href:`/assets/${x.id}`,cells:[x.assetCode,x.name,x.category.name,`${x.site.name} / ${x.location?.name ?? x.area?.name ?? "—"}`,actor.role === "REQUESTER" ? "—" : x.criticality],badge:x.status,thumbnail:"asset",image:imageFor(x.id)}))} />
  </>;
}
