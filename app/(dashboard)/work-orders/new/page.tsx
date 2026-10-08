import { pageActor } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { WorkOrderWizard } from "@/components/forms/work-order-wizard";
export default async function NewWork() {
  requirePermission(await pageActor(),"work_order.create");
  const [assets,technicians]=await Promise.all([db.asset.findMany({where:{isActive:true,status:{notIn:["INACTIVE","OUT_OF_SERVICE"]}},select:{id:true,assetCode:true,name:true},orderBy:{assetCode:"asc"}}),db.user.findMany({where:{isActive:true,role:"TECHNICIAN"},select:{id:true,name:true},orderBy:{name:"asc"}})]);
  return <><PageHeader title="สร้างใบงานซ่อม" description="ระบุปัญหา มอบหมายงาน และตรวจสอบก่อนบันทึก"/><WorkOrderWizard assets={assets.map(x=>({value:x.id,label:`${x.assetCode} · ${x.name}`}))} technicians={technicians.map(x=>({value:x.id,label:x.name}))}/></>;
}
