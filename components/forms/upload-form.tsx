"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileImage, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
export function UploadForm({entity,id,executionItemId}:{entity:string;id:string;executionItemId?:string}) {
  const [message,setMessage]=useState(""),[pending,setPending]=useState(false),[preview,setPreview]=useState(""),[fileName,setFileName]=useState(""),[failed,setFailed]=useState(false);
  const previewUrl=useRef("");const router=useRouter();
  useEffect(()=>()=>{if(previewUrl.current)URL.revokeObjectURL(previewUrl.current);},[]);
  function clearPreview(){if(previewUrl.current)URL.revokeObjectURL(previewUrl.current);previewUrl.current="";setPreview("");setFileName("");}
  return <form className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4" onSubmit={async event=>{
    event.preventDefault();const element=event.currentTarget;setPending(true);setMessage("");
    const form=new FormData(element);form.set("entity",entity);form.set("id",id);if(executionItemId)form.set("executionItemId",executionItemId);
    try{const response=await fetch("/api/files",{method:"POST",body:form});const result=await response.json();setFailed(!response.ok);setMessage(response.ok ? "เพิ่มไฟล์เรียบร้อยแล้ว" : result.error);if(response.ok){element.reset();clearPreview();router.refresh();}}
    catch{setFailed(true);setMessage("เชื่อมต่อไม่ได้ กรุณาลองใหม่");}finally{setPending(false);}
  }}><label><span className="mb-3 flex items-center gap-2 font-semibold"><UploadCloud size={21} className="text-brand-dark"/>{executionItemId ? "เพิ่มรูปภาพหลักฐาน" : "เพิ่มรูปภาพ / เอกสาร"}</span><input aria-label={executionItemId ? "เพิ่มรูปภาพหลักฐาน" : "เพิ่มรูปภาพ / เอกสาร"} name="file" type="file" accept={executionItemId ? ".jpg,.jpeg,.png,.webp" : ".jpg,.jpeg,.png,.webp,.pdf"} required disabled={pending} onChange={event=>{clearPreview();const file=event.target.files?.[0];if(file){setFileName(file.name);if(file.type.startsWith("image/")){previewUrl.current=URL.createObjectURL(file);setPreview(previewUrl.current);}}}}/></label>
    {fileName && <div className="mt-3 flex items-center gap-3">{preview ? <Image unoptimized src={preview} alt="ตัวอย่างรูปภาพที่เลือก" width={64} height={64} className="size-16 rounded-xl object-cover"/> : <FileImage size={24} className="text-slate-400"/>}<p className="truncate text-xs text-slate-600">{fileName}</p></div>}
    <p className="mt-2 text-[11px] text-slate-500">{executionItemId ? "รูปภาพถ่ายหน้างาน · JPG, PNG, WEBP" : "รูปภาพหน้างานหรือเอกสาร · JPG, PNG, WEBP, PDF"}</p><Button className="mt-4" disabled={pending} variant="secondary"><UploadCloud size={16}/>{pending ? "กำลังเพิ่มไฟล์…" : "เพิ่มไฟล์"}</Button>
    {message && <p role="status" className={`mt-3 flex items-center gap-2 text-sm ${failed ? "text-red-700" : "text-emerald-700"}`}>{!failed && <CheckCircle2 size={16}/>} {message}</p>}
  </form>;
}
