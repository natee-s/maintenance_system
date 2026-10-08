"use client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ClipboardList, UploadCloud, UserRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, statusLabel } from "@/components/ui/badge";
type Option = { value: string; label: string };
type Values = { assetId: string; title: string; description: string; priority: string; dueAt: string; assignedToId: string; plannedStartAt: string };
const steps = [{label:"รายละเอียด",icon:ClipboardList},{label:"มอบหมาย",icon:UserRound},{label:"ยืนยัน",icon:ShieldCheck}];
export function WorkOrderWizard({ assets, technicians }: { assets: Option[]; technicians: Option[] }) {
  const { register, trigger, handleSubmit, getValues, formState:{errors,isSubmitting,isReady} } = useForm<Values>({defaultValues:{assetId:"",title:"",description:"",priority:"MEDIUM",dueAt:"",assignedToId:"",plannedStartAt:""},shouldUnregister:false});
  const [step,setStep]=useState(0),[files,setFiles]=useState<File[]>([]),[message,setMessage]=useState(""),[createdId,setCreatedId]=useState("");
  const progress=useRef({id:"",assigned:false,uploaded:0});
  const router=useRouter();
  async function post(url:string,body:Record<string,unknown>) {
    const response=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error ?? "ไม่สามารถบันทึกรายการได้");
    return result as {id:string};
  }
  async function next() {
    const fields: (keyof Values)[]=step===0 ? ["assetId","title","description","priority"] : ["assignedToId","dueAt","plannedStartAt"];
    if(await trigger(fields,{shouldFocus:true})){setMessage("");setStep(current=>current+1);}
  }
  async function save(values: Values) {
    if(step!==2){await next();return;}
    setMessage("");
    try {
      if(!progress.current.id) {
        const result=await post("/api/work-orders",{assetId:values.assetId,title:values.title,description:values.description,priority:values.priority,dueAt:values.dueAt});
        progress.current.id=result.id;setCreatedId(result.id);
      }
      const id=progress.current.id;
      if(values.assignedToId && !progress.current.assigned) {
        await post(`/api/work-orders/${id}/assign`,{assignedToId:values.assignedToId,plannedStartAt:values.plannedStartAt,dueAt:values.dueAt,priority:values.priority});
        progress.current.assigned=true;
      }
      for(let index=progress.current.uploaded;index<files.length;index++) {
        const form=new FormData();form.set("file",files[index]);form.set("entity","work-order");form.set("id",id);
        const response=await fetch("/api/files",{method:"POST",body:form});const result=await response.json();
        if(!response.ok)throw new Error(`ไฟล์ ${files[index].name}: ${result.error ?? "เพิ่มไฟล์ไม่สำเร็จ"}`);
        progress.current.uploaded=index+1;
      }
      router.push(`/work-orders/${id}`);router.refresh();
    }catch(error){setMessage(`${progress.current.id ? "สร้างใบงานแล้ว แต่ขั้นตอนถัดไปยังไม่สำเร็จ กดบันทึกเพื่อลองต่ออีกครั้ง: " : ""}${error instanceof Error ? error.message : "เชื่อมต่อไม่ได้ กรุณาลองใหม่"}`);}
  }
  const values=getValues();
  const requiredText={required:"กรุณาระบุข้อมูล",validate:(value:string)=>Boolean(value.trim()) || "กรุณาระบุข้อมูล"};
  return <form onSubmit={event=>void handleSubmit(save)(event)} className="mx-auto max-w-3xl">
    <ol aria-label="ขั้นตอนสร้างใบงาน" className="mb-6 grid grid-cols-3 gap-2">{steps.map(({label,icon:Icon},index)=><li key={label} aria-current={step===index ? "step" : undefined} className="relative flex flex-col items-center gap-2 text-center">{index<2 && <span aria-hidden="true" className={`absolute left-[60%] right-[-40%] top-5 h-0.5 ${index<step ? "bg-brand" : "bg-slate-200"}`}/>}<span className={`relative z-10 flex size-10 items-center justify-center rounded-full text-sm font-bold ${index<=step ? "bg-brand text-navy" : "bg-slate-200 text-slate-500"}`}>{index<step ? <Check size={19}/> : <Icon size={18}/>}</span><span className={`text-xs font-semibold ${index===step ? "text-navy" : "text-slate-500"}`}>{index+1}. {label}</span></li>)}</ol>
    <section className="panel space-y-5" aria-label={`ขั้นตอน: ${steps[step].label}`}>
      <div><p className="text-xs font-semibold text-brand-dark">ขั้นตอน {step+1} / 3</p><h2 className="mt-2 text-lg font-bold">{step===0 ? "รายละเอียดงานซ่อม" : step===1 ? "ผู้รับผิดชอบและกำหนดเวลา" : "ตรวจสอบก่อนสร้างใบงาน"}</h2></div>
      <fieldset disabled={!isReady || isSubmitting} className="space-y-5">
      {step===0 && <><label>เครื่องจักร <span className="text-brand-dark">*</span><select aria-label="เครื่องจักร" {...register("assetId",{required:"กรุณาเลือกเครื่องจักร"})} aria-invalid={Boolean(errors.assetId)}><option value="">เลือกเครื่องจักร…</option>{assets.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>{errors.assetId && <span role="alert" className="mt-1 block text-xs text-red-700">{errors.assetId.message}</span>}</label>
        <label>หัวข้องาน <span className="text-brand-dark">*</span><input aria-label="หัวข้องาน" {...register("title",{...requiredText,maxLength:{value:200,message:"หัวข้องานต้องไม่เกิน 200 ตัวอักษร"}})} placeholder="เช่น เครื่องจักรมีเสียงผิดปกติ" aria-invalid={Boolean(errors.title)}/>{errors.title && <span role="alert" className="mt-1 block text-xs text-red-700">{errors.title.message}</span>}</label>
        <label>รายละเอียด <span className="text-brand-dark">*</span><textarea aria-label="รายละเอียด" rows={4} {...register("description",{...requiredText,maxLength:{value:5000,message:"รายละเอียดต้องไม่เกิน 5,000 ตัวอักษร"}})} placeholder="ระบุอาการ ตำแหน่ง และข้อมูลที่ช่วยให้ช่างเตรียมงาน" aria-invalid={Boolean(errors.description)}/>{errors.description && <span role="alert" className="mt-1 block text-xs text-red-700">{errors.description.message}</span>}</label>
        <label>ความเร่งด่วน<select aria-label="ความเร่งด่วน" {...register("priority")}>{["LOW","MEDIUM","HIGH","URGENT"].map(priority=><option value={priority} key={priority}>{statusLabel(priority)}</option>)}</select></label>
        <label className="block rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><span className="mb-3 flex items-center gap-2 text-sm"><UploadCloud size={21} className="text-brand-dark"/>แนบรูปภาพ / เอกสาร (ไม่บังคับ)</span><input aria-label="แนบรูปภาพ / เอกสาร" type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" multiple onChange={event=>setFiles(Array.from(event.target.files ?? []))}/><span className="mt-2 block text-xs font-normal text-slate-500">JPG, PNG, WEBP หรือ PDF · แนบภาพหน้างานหรือเอกสารประกอบ</span>{files.map((file,index)=><span key={index} className="mt-2 block truncate text-xs">{file.name}</span>)}</label>
      </>}
      {step===1 && <><label>ช่างผู้รับผิดชอบ<select aria-label="ช่างผู้รับผิดชอบ" {...register("assignedToId")}><option value="">ยังไม่มอบหมาย</option>{technicians.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select><span className="mt-2 block text-xs font-normal text-slate-500">เลือกช่างเพื่อมอบหมายทันที หรือมอบหมายจากหน้าใบงานภายหลัง</span></label><div className="field-grid"><label>วันเริ่มตามแผน<input type="datetime-local" aria-label="วันเริ่มตามแผน" {...register("plannedStartAt")}/></label><label>กำหนดเสร็จ<input type="datetime-local" aria-label="กำหนดเสร็จ" {...register("dueAt",{validate:value=>!value || !getValues("plannedStartAt") || value>=getValues("plannedStartAt") || "กำหนดเสร็จต้องไม่ก่อนวันเริ่ม"})}/>{errors.dueAt && <span role="alert" className="mt-1 block text-xs text-red-700">{errors.dueAt.message}</span>}</label></div></>}
      {step===2 && <><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-semibold text-brand-dark">{assets.find(asset=>asset.value===values.assetId)?.label}</p><h3 className="mt-2 font-bold">{values.title}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{values.description}</p><div className="mt-4 flex gap-2"><Badge value="CORRECTIVE"/><Badge value={values.priority}/></div></div><dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">{[["ช่างผู้รับผิดชอบ",technicians.find(tech=>tech.value===values.assignedToId)?.label ?? "ยังไม่มอบหมาย"],["กำหนดเสร็จ",values.dueAt ? values.dueAt.replace("T"," ") : "ยังไม่ระบุ"],["วันเริ่มตามแผน",values.plannedStartAt ? values.plannedStartAt.replace("T"," ") : "ยังไม่ระบุ"],["ไฟล์แนบ",`${files.length} ไฟล์`]].map(([label,value])=><div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}</dl></>}
      </fieldset>
    </section>
    {message && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{message}{createdId && <Link href={`/work-orders/${createdId}`} className="mt-2 block font-semibold underline">เปิดใบงานที่สร้างแล้ว</Link>}</div>}
    <div className="sticky-actions mt-5 flex gap-3">{step>0 && <Button type="button" variant="outline" disabled={isSubmitting || Boolean(createdId)} onClick={()=>{setMessage("");setStep(current=>current-1);}}><ArrowLeft size={17}/>ย้อนกลับ</Button>}{step<2 ? <Button key="next" type="button" disabled={!isReady || isSubmitting} className="ml-auto flex-1 sm:flex-none" onClick={next}>ถัดไป<ArrowRight size={17}/></Button> : <Button key="submit" type="submit" disabled={!isReady || isSubmitting} className="flex-1">{isSubmitting ? "กำลังบันทึก…" : createdId ? "บันทึกต่อ" : "บันทึก"}</Button>}</div>
  </form>;
}
