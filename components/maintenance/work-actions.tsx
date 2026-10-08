import { db } from "@/lib/db";
import { can,type Actor } from "@/lib/permissions";
import type { WorkOrder } from "@/generated/prisma/client";
import { RecordForm,type Field } from "@/components/forms/record-form";
export async function WorkActions({actor,wo}:{actor:Actor;wo:WorkOrder}){
  const endpoint=(action:string)=>`/api/work-orders/${wo.id}/${action}`;const forms:React.ReactNode[]=[];
  if(can(actor.role,"work_order.assign") && ["OPEN","ASSIGNED"].includes(wo.status)){
    const technicians=await db.user.findMany({where:{role:"TECHNICIAN",isActive:true},select:{id:true,name:true}});
    forms.push(<RecordForm key="assign" title="มอบหมายงาน" endpoint={endpoint("assign")} submitLabel="มอบหมายงาน" fields={[{name:"assignedToId",label:"ช่างผู้รับผิดชอบ",type:"select",required:true,options:technicians.map(x=>({value:x.id,label:x.name}))},{name:"plannedStartAt",label:"แผนเริ่ม",type:"datetime-local"},{name:"dueAt",label:"กำหนดเสร็จ",type:"datetime-local"}]} initial={{assignedToId:wo.assignedToId ?? ""}} />);
    if(wo.status === "ASSIGNED")forms.push(<RecordForm key="unassign" endpoint={endpoint("unassign")} fields={[]} submitLabel="ยกเลิกการมอบหมาย" />);
  }
  if(can(actor.role,"work_order.start") && wo.status === "ASSIGNED")forms.push(<RecordForm key="start" endpoint={endpoint("start")} fields={[]} submitLabel="เริ่มงาน" />);
  if(can(actor.role,"work_order.start") && ["PAUSED","WAITING_PART"].includes(wo.status))forms.push(<RecordForm key="resume" endpoint={endpoint("resume")} fields={[]} submitLabel="ทำงานต่อ" />);
  if(can(actor.role,"work_order.update_execution") && ["IN_PROGRESS","PAUSED","WAITING_PART"].includes(wo.status)){
    const categories=await db.masterData.findMany({where:{kind:"FAILURE_CATEGORY",isActive:true}});
    const fields:Field[]=[{name:"findings",label:"สิ่งที่พบ",type:"textarea",required:true},{name:"causeText",label:"สาเหตุ",type:"textarea"},{name:"actionTaken",label:"การแก้ไข",type:"textarea",required:true},{name:"completionNote",label:"บันทึกผล",type:"textarea"},...(wo.type === "CORRECTIVE" ? [{name:"failureCategoryId",label:"ประเภทความขัดข้อง",type:"select" as const,required:true,options:categories.map(x=>({value:x.id,label:x.name}))}] : [])];
    forms.push(<RecordForm key="execution" title="บันทึกผลการปฏิบัติงาน" endpoint={endpoint("execution")} fields={fields} initial={{findings:wo.findings ?? "",causeText:wo.causeText ?? "",actionTaken:wo.actionTaken ?? "",completionNote:wo.completionNote ?? "",failureCategoryId:wo.failureCategoryId ?? ""}} />);
    if(wo.status === "IN_PROGRESS"){
      forms.push(<RecordForm key="complete" endpoint={endpoint("complete")} fields={[]} submitLabel="ยืนยันงานเสร็จ" />);
      forms.push(<RecordForm key="pause" endpoint={endpoint("pause")} fields={[{name:"reason",label:"เหตุผลพักงาน",required:true}]} submitLabel="พักงาน" />);
      forms.push(<RecordForm key="waiting" endpoint={endpoint("waiting-part")} fields={[{name:"reason",label:"เหตุผลรออะไหล่",required:true}]} submitLabel="รออะไหล่" />);
    }
  }
  if(can(actor.role,"work_order.verify_close") && wo.status === "COMPLETED"){
    const downtime=await db.downtimeEvent.findUnique({where:{workOrderId:wo.id}});
    forms.push(<RecordForm key="close" endpoint={endpoint("close")} title={downtime && !downtime.endedAt ? "คำเตือน: เครื่องยังหยุดอยู่" : undefined} fields={downtime && !downtime.endedAt ? [{name:"acknowledgeOpenDowntime",label:"ยืนยันปิดงานโดย Downtime ยังเปิดอยู่",type:"checkbox"}] : []} submitLabel="ตรวจสอบและปิดงาน" />);
    forms.push(<RecordForm key="reopen" endpoint={endpoint("reopen")} fields={[{name:"reason",label:"เหตุผลส่งกลับแก้ไข",required:true}]} submitLabel="ส่งกลับแก้ไข" />);
  }
  if(can(actor.role,"work_order.assign") && ["OPEN","ASSIGNED","PAUSED","WAITING_PART"].includes(wo.status))forms.push(<RecordForm key="cancel" endpoint={endpoint("cancel")} fields={[{name:"reason",label:"เหตุผลยกเลิก",required:true}]} submitLabel="ยกเลิกใบงาน" />);
  return <div id="work-actions" className="mt-6 scroll-mt-24 space-y-4">{forms}</div>;
}
