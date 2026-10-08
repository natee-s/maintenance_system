import { pageActor } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { locationOptions } from "@/modules/locations/service";
import { RecordForm, type Field } from "@/components/forms/record-form";
import { PageHeader } from "@/components/ui/page-header";
import { MasterKind } from "@/generated/prisma/client";
export default async function MastersPage() {
  requirePermission(await pageActor(),"location.manage");
  const [organizations,sites,areas,locations,masters] = await locationOptions();
  const base: Field[] = [{name:"code",label:"รหัส",required:true},{name:"name",label:"ชื่อ",required:true},{name:"isActive",label:"สถานะ",type:"checkbox"}];
  const configs = [
    {entity:"organization",title:"องค์กร",rows:organizations,fields:base},
    {entity:"site",title:"โรงงาน",rows:sites,fields:[...base,{name:"organizationId",label:"องค์กร",type:"select",required:true,options:organizations.filter(x=>x.isActive).map(x=>({value:x.id,label:x.name}))}] as Field[]},
    {entity:"area",title:"พื้นที่",rows:areas,fields:[...base,{name:"siteId",label:"โรงงาน",type:"select",required:true,options:sites.filter(x=>x.isActive).map(x=>({value:x.id,label:x.name}))}] as Field[]},
    {entity:"location",title:"สถานที่ / สายการผลิต",rows:locations,fields:[...base,{name:"siteId",label:"โรงงาน",type:"select",required:true,options:sites.filter(x=>x.isActive).map(x=>({value:x.id,label:x.name}))},{name:"areaId",label:"พื้นที่",type:"select",options:areas.filter(x=>x.isActive).map(x=>({value:x.id,label:`${x.site.name} / ${x.name}`}))},{name:"description",label:"รายละเอียด",type:"textarea"}] as Field[]},
    {entity:"master",title:"ประเภทเครื่องจักร / ความขัดข้อง / หน่วย / ทีม",rows:masters,fields:[...base,{name:"kind",label:"ประเภทข้อมูล",type:"select",required:true,options:Object.values(MasterKind).map(value=>({value,label:value}))},{name:"description",label:"รายละเอียด",type:"textarea"},{name:"allowsDecimal",label:"หน่วยรองรับทศนิยม",type:"checkbox"}] as Field[]},
  ];
  return <><PageHeader title="ข้อมูลหลัก" description="โครงสร้างองค์กรและข้อมูลที่ใช้ร่วมกัน" /><div className="space-y-6">{configs.map(config=><section key={config.entity}><details className="panel"><summary className="cursor-pointer text-lg font-bold">{config.title} ({config.rows.length})</summary><div className="mt-4 space-y-4"><RecordForm endpoint="/api/admin/masters" fields={config.fields} title={`เพิ่ม${config.title}`} initial={{entity:config.entity,isActive:true}} />{config.rows.map(row=><details key={row.id}><summary className="cursor-pointer py-2">{row.code} · {row.name} · {row.isActive ? "ใช้งาน" : "ไม่ใช้งาน"}</summary><RecordForm endpoint="/api/admin/masters" fields={config.fields} initial={{...row,entity:config.entity}} /></details>)}</div></details></section>)}</div></>;
}
