"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export type Field = { name: string; label: string; type?: "text" | "textarea" | "number" | "date" | "datetime-local" | "password" | "select" | "checkbox" | "check-result"; required?: boolean; options?: { value: string; label: string }[]; step?: string; hint?: string };
export function RecordForm({endpoint,fields,initial={},title,submitLabel="บันทึก",redirectTo,embedded=false}:{endpoint:string;fields:Field[];initial?:Record<string,unknown>;title?:string;submitLabel?:string;redirectTo?:string;embedded?:boolean}) {
  const {register,control,handleSubmit,formState:{isSubmitting,isReady}}=useForm<Record<string,unknown>>({defaultValues:initial});
  const [message,setMessage]=useState(""),[failed,setFailed]=useState(false);const router=useRouter();
  const submit=handleSubmit(async values=>{
    setMessage("");
    try {
      const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});const result=await response.json();
      if(!response.ok){setFailed(true);setMessage(result.error ?? "บันทึกไม่สำเร็จ");return;}
      setFailed(false);setMessage("บันทึกเรียบร้อยแล้ว");
      if(redirectTo && result.id)router.push(redirectTo.replace(":id",result.id));else router.refresh();
    }catch{setFailed(true);setMessage("เชื่อมต่อไม่ได้ กรุณาลองอีกครั้ง");}
  });
  return <form onSubmit={submit} className={embedded ? "space-y-4" : "panel space-y-5"}>{title && <h2 className="text-lg font-bold">{title}</h2>}<fieldset disabled={!isReady || isSubmitting} className="field-grid">{fields.map(field=>{
    if(field.type==="check-result")return <div key={field.name}><p className="mb-2 text-sm font-medium">{field.label}</p><Controller control={control} name={field.name} render={({field:choice})=><div role="group" aria-label="ผลการตรวจรายการ" className="flex flex-wrap gap-3">{[{value:"true",label:"ตรวจแล้ว / ผ่าน",color:"text-emerald-800"},{value:"false",label:"ไม่ผ่าน",color:"text-red-800"}].map(option=><label key={option.value} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 ${option.color}`}><input type="checkbox" aria-label={option.label} checked={choice.value===option.value} onBlur={choice.onBlur} onChange={event=>choice.onChange(event.target.checked ? option.value : "")}/>{option.label}</label>)}</div>}/></div>;
    return <label key={field.name} className={field.type==="textarea" ? "col-span-full" : ""}>{field.label}{field.required && <span className="text-brand-dark"> *</span>}
      {field.type==="select" ? <select aria-label={field.label} {...register(field.name)} required={field.required}><option value="">เลือก…</option>{field.options?.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>
      : field.type==="textarea" ? <textarea aria-label={field.label} {...register(field.name)} required={field.required} rows={3}/>
      : field.type==="checkbox" ? <span className="mt-2 flex items-center gap-2"><input type="checkbox" aria-label={field.label} {...register(field.name)}/><span className="font-normal">ใช่ / เปิดใช้งาน</span></span>
      : <input aria-label={field.label} {...register(field.name)} type={field.type ?? "text"} step={field.step ?? (field.type==="number" ? "any" : undefined)} required={field.required} autoComplete={field.type==="password" ? "new-password" : undefined}/>}
      {field.hint && <span className="mt-1 block text-xs font-normal text-slate-500">{field.hint}</span>}
    </label>;
  })}</fieldset>{message && <p role="alert" className={`rounded-xl p-3 text-sm ${failed ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{message}</p>}<Button disabled={!isReady || isSubmitting}>{isSubmitting ? "กำลังบันทึก…" : submitLabel}</Button></form>;
}
