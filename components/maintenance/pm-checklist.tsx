import Image from "next/image";
import { CheckCircle2, Circle, ShieldAlert, ClipboardCheck } from "lucide-react";
import { checklist } from "@/modules/pm/execution-service";
import { answered } from "@/modules/pm/checklist-rules";
import type { Actor } from "@/lib/permissions";
import { can } from "@/lib/permissions";
import type { WorkOrder } from "@/generated/prisma/client";
import { RecordForm,type Field } from "@/components/forms/record-form";
import { UploadForm } from "@/components/forms/upload-form";
export async function PmChecklist({actor,wo}:{actor:Actor;wo:WorkOrder}) {
  if(wo.type!=="PREVENTIVE")return null;
  const items=await checklist(actor,wo.id),count=items.filter(answered).length,percentage=items.length ? count/items.length*100 : 0;
  const editable=can(actor.role,"pm.execute") && Boolean(wo.actualStartAt) && !["COMPLETED","CLOSED","CANCELLED"].includes(wo.status);
  return <section id="pm-checklist" className="mt-6 scroll-mt-24 space-y-4"><div className="panel"><div className="flex items-center gap-3"><span className="rounded-xl bg-orange-50 p-2.5 text-brand-dark"><ClipboardCheck size={22}/></span><div><h2 className="text-lg font-bold">Checklist PM · {count}/{items.length}</h2><p className="mt-1 text-xs text-slate-500">บันทึกผลตรวจและหลักฐานแต่ละข้อก่อนยืนยันงานเสร็จ</p></div></div><div role="progressbar" aria-label="ความคืบหน้า Checklist" aria-valuemin={0} aria-valuemax={items.length || 1} aria-valuenow={count} className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand transition-all" style={{width:`${percentage}%`}}/></div>{wo.safetyNoteSnapshot && <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><ShieldAlert size={18} className="shrink-0"/>{wo.safetyNoteSnapshot}</p>}</div>
    {items.map(item=>{
      const done=answered(item),failed=item.passFailResult==="FAIL" || item.responseBoolean===false;
      const fields:Field[]=[item.itemType==="CHECK" ? {name:"responseBoolean",label:"ผลตรวจ",type:"check-result"} : item.itemType==="TEXT" ? {name:"responseText",label:"ผลตรวจ",type:"textarea"} : item.itemType==="NUMBER" ? {name:"responseNumber",label:`ค่าที่อ่าน (${item.unit ?? "—"})`,type:"number",hint:`ช่วง ${item.minValue ?? "—"} ถึง ${item.maxValue ?? "—"}`} : {name:"passFailResult",label:"ผลตรวจ",type:"select",options:[{value:"PASS",label:"PASS"},{value:"FAIL",label:"FAIL"}]},{name:"note",label:"บันทึกผลตรวจ",type:"textarea"}];
      return <article key={item.id} className="panel"><div className="flex items-start gap-3">{failed ? <ShieldAlert size={22} className="shrink-0 text-red-600"/> : done ? <CheckCircle2 size={22} className="shrink-0 text-emerald-600"/> : <Circle size={22} className="shrink-0 text-slate-300"/>}<div><h3 className="font-bold">ข้อ {item.sequence}: {item.titleSnapshot} {item.required && <span className="text-brand-dark">*</span>}</h3><p className="mt-2 text-sm leading-relaxed text-slate-500">{item.instructionSnapshot}</p></div></div><p className={`my-4 rounded-xl p-3 text-sm ${failed ? "bg-red-50 text-red-800" : done ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-500"}`}>ผล: {item.passFailResult ?? item.responseText ?? item.responseNumber?.toString() ?? (item.responseBoolean===null ? "ยังไม่ตอบ" : item.responseBoolean ? "ผ่าน" : "ไม่ผ่าน")} {item.note && `· ${item.note}`}</p>
        {editable && <><RecordForm embedded endpoint={`/api/work-orders/${wo.id}/checklist/${item.id}/response`} fields={fields} submitLabel={`บันทึกข้อ ${item.sequence}`} initial={{responseBoolean:item.responseBoolean===null ? "" : String(item.responseBoolean),responseText:item.responseText ?? "",responseNumber:item.responseNumber ?? "",passFailResult:item.passFailResult ?? "",note:item.note ?? ""}}/><UploadForm entity="work-order" id={wo.id} executionItemId={item.id}/></>}
        {item.attachments.length>0 && <div className="mt-4 flex flex-wrap gap-3">{item.attachments.map(file=><a key={file.id} className="max-w-28 text-xs text-slate-600" href={`/api/files/${file.storageKey}`} target="_blank" rel="noreferrer">{file.mimeType.startsWith("image/") && <Image unoptimized src={`/api/files/${file.storageKey}`} alt={file.fileName} width={112} height={80} className="mb-2 h-20 w-28 rounded-xl object-cover"/>}หลักฐาน: {file.fileName}</a>)}</div>}
      </article>;
    })}
  </section>;
}
