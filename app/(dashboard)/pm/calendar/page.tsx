import { pageActor } from "@/lib/auth";
import { calendar } from "@/modules/pm/calendar-service";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Filters } from "@/components/forms/filters";
import { MaintenanceCalendar } from "@/components/maintenance/pm-calendar";
import { bangkokDay } from "@/lib/dates";
import type { Query } from "@/lib/lists";
export default async function PmCalendar({searchParams}:{searchParams:Promise<Query>}) {
  const query=await searchParams,data=await calendar(await pageActor(),query);
  const [sites,areas,assets,techs]=await Promise.all([db.site.findMany({where:{isActive:true}}),db.area.findMany({where:{isActive:true}}),db.asset.findMany({where:{isActive:true},select:{id:true,name:true}}),db.user.findMany({where:{role:"TECHNICIAN",isActive:true},select:{id:true,name:true}})]);
  return <div className="mx-auto max-w-5xl"><PageHeader title="ปฏิทิน PM" description="วางแผนงานล่วงหน้า เลือกวันที่เพื่อตรวจสอบงานบำรุงรักษา"/>
    <Filters compact query={{...query,month:data.month}} fields={[{name:"month",label:"เดือน (YYYY-MM)"},{name:"siteId",label:"โรงงาน",type:"select",options:sites.map(x=>({value:x.id,label:x.name}))},{name:"areaId",label:"พื้นที่",type:"select",options:areas.map(x=>({value:x.id,label:x.name}))},{name:"assetId",label:"เครื่องจักร",type:"select",options:assets.map(x=>({value:x.id,label:x.name}))},{name:"assignedTo",label:"ช่าง",type:"select",options:techs.map(x=>({value:x.id,label:x.name}))},{name:"status",label:"สถานะ PM",type:"select",options:["UPCOMING","DUE_SOON","DUE","OVERDUE","COMPLETED"].map(value=>({value,label:value}))}]}/>
    <MaintenanceCalendar key={data.month} month={data.month} events={data.events} today={bangkokDay()} query={query}/>
  </div>;
}
