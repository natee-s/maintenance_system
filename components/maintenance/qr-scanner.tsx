"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, QrCode, ScanLine, StopCircle } from "lucide-react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/button";
type ScanState="idle" | "requesting" | "scanning" | "invalid" | "denied" | "found";
export function QrScanner() {
  const video=useRef<HTMLVideoElement>(null),controls=useRef<IScannerControls|null>(null),alive=useRef(true),starting=useRef(false);
  const [state,setState]=useState<ScanState>("idle"),[message,setMessage]=useState("กดเปิดกล้องและอนุญาตการเข้าถึงกล้อง"),[token,setToken]=useState("");
  const router=useRouter();
  useEffect(()=>{alive.current=true;return ()=>{alive.current=false;controls.current?.stop();};},[]);
  function go(text:string) {
    const match=text.trim().match(/(?:\/qr\/)?([a-f0-9-]{36})$/i);
    if(!match){setState("invalid");setMessage("QR ไม่ถูกต้อง กรุณาสแกน QR ของ PlantCare");return;}
    controls.current?.stop();setState("found");setMessage("พบ QR แล้ว กำลังเปิดข้อมูลเครื่องจักร…");router.push(`/qr/${match[1]}`);
  }
  async function start() {
    if(!video.current || starting.current || controls.current)return;
    starting.current=true;setState("requesting");setMessage("กำลังขออนุญาตกล้อง…");
    try {
      const scannerControls=await new BrowserQRCodeReader().decodeFromVideoDevice(undefined,video.current,(result,_error,scanner)=>{
        if(result && alive.current){const text=result.getText();if(/(?:\/qr\/)?([a-f0-9-]{36})$/i.test(text.trim()))scanner.stop();go(text);}
      });
      if(!alive.current){scannerControls.stop();return;}
      controls.current=scannerControls;setState("scanning");setMessage("วาง QR ของเครื่องจักรไว้ในกรอบ");
    }catch(error){if(alive.current){setState("denied");setMessage(error instanceof Error && error.name==="NotAllowedError" ? "ยังไม่ได้รับอนุญาตกล้อง กรุณาอนุญาตในเบราว์เซอร์แล้วลองใหม่" : "เปิดกล้องไม่ได้ กรุณาตรวจสอบกล้อง หรือกรอกลิงก์ QR ด้านล่าง");}}
    finally{starting.current=false;}
  }
  function stop(){controls.current?.stop();controls.current=null;setState("idle");setMessage("หยุดสแกนแล้ว กดเปิดกล้องเพื่อสแกนอีกครั้ง");}
  const busy=state==="requesting" || state==="scanning" || state==="found";
  return <div className="mx-auto max-w-lg space-y-5"><section className="overflow-hidden rounded-2xl bg-navy text-white shadow-lg"><div className="flex items-center gap-2 px-5 py-4 text-sm font-semibold"><ScanLine size={19} className="text-brand"/>สแกนป้าย Asset Tag</div><div className="relative aspect-[4/5] overflow-hidden bg-slate-950"><video ref={video} className="absolute inset-0 size-full object-cover" muted playsInline/>{!busy && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400"><QrCode size={56} strokeWidth={1}/><span className="text-xs">กล้องพร้อมเมื่อคุณกดเปิดสแกน</span></div>}<div aria-hidden="true" className="pointer-events-none absolute inset-x-[15%] top-[20%] aspect-square rounded-xl shadow-[0_0_0_1000px_#00000045]"><span className="scan-corner left-0 top-0 rounded-tl-xl border-l-4 border-t-4"/><span className="scan-corner right-0 top-0 rounded-tr-xl border-r-4 border-t-4"/><span className="scan-corner bottom-0 left-0 rounded-bl-xl border-b-4 border-l-4"/><span className="scan-corner bottom-0 right-0 rounded-br-xl border-b-4 border-r-4"/>{state==="scanning" && <span className="absolute inset-x-3 top-1/2 h-0.5 bg-brand shadow-[0_0_12px_#ff6b00]"/>}</div><p role="status" className="absolute inset-x-5 bottom-5 rounded-xl bg-black/60 p-3 text-center text-xs leading-relaxed">{message}</p></div></section>
    <div className="flex gap-3"><Button className="flex-1" disabled={busy} onClick={start}><Camera size={18}/>{state==="requesting" ? "กำลังเปิดกล้อง…" : "เปิดกล้องสแกน QR"}</Button>{(state==="scanning" || state==="invalid") && <Button variant="outline" onClick={stop}><StopCircle size={18}/>หยุด</Button>}</div>
    <section className="panel"><h2 className="section-title">เปิดด้วยลิงก์ QR</h2><p className="mb-4 mt-2 text-xs text-slate-500">ใช้เมื่อกล้องไม่พร้อม หรือมีลิงก์ QR ของเครื่องจักร</p><label>QR token / ลิงก์<input value={token} onChange={event=>setToken(event.target.value)} placeholder="วางลิงก์หรือ token ของ PlantCare"/></label><Button className="mt-4 w-full" variant="secondary" onClick={()=>go(token)}>เปิด QR</Button></section>
  </div>;
}
