"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays, List, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Query } from "@/lib/lists";
type CalendarEvent = { id: string; name: string; asset: string; date: string; status: string; href: string };
export function MaintenanceCalendar({ month, events, today, query }: { month: string; events: CalendarEvent[]; today: string; query: Query }) {
  const first = new Date(`${month}-01T00:00:00Z`);
  const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth()+1,0)).getUTCDate();
  const [selected, setSelected] = useState(today.startsWith(month) ? today : events[0]?.date ?? `${month}-01`);
  const [view, setView] = useState(query.view==="list" ? "list" : "month");
  const selectedEvents = events.filter(event=>event.date===selected);
  function monthLink(offset: number) {
    const date = new Date(first); date.setUTCMonth(date.getUTCMonth()+offset);
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key,value])=>{if(typeof value==="string" && key!=="month" && key!=="page")params.set(key,value);});
    params.set("month",date.toISOString().slice(0,7));
    return `/pm/calendar?${params}`;
  }
  function eventCard(event: CalendarEvent) {
    return <Link key={event.id} href={event.href} className="panel flex items-center gap-3 hover:border-orange-200"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-brand-dark"><Wrench size={20}/></span><div className="min-w-0 flex-1"><p className="text-xs font-bold text-navy">{event.asset}</p><p className="mt-1 text-sm font-medium">{event.name}</p><p className="mt-1 text-xs text-slate-500">{new Intl.DateTimeFormat("th-TH",{dateStyle:"medium",timeZone:"UTC"}).format(new Date(event.date))}</p></div><div className="flex flex-col items-end gap-2"><Badge value={event.status}/><ChevronRight size={16} className="text-slate-400"/></div></Link>;
  }
  return <section><div className="mb-4 flex gap-2"><button type="button" className="chip" aria-pressed={view==="month"} onClick={()=>setView("month")}><CalendarDays size={16}/>ปฏิทิน</button><button type="button" className="chip" aria-pressed={view==="list"} onClick={()=>setView("list")}><List size={16}/>รายการทั้งหมด ({events.length})</button></div>
    {view==="month" ? <><div className="panel"><div className="mb-5 flex items-center justify-between"><Link href={monthLink(-1)} aria-label="เดือนก่อนหน้า" className="rounded-xl p-3 hover:bg-slate-100"><ChevronLeft size={20}/></Link><h2 className="text-sm font-bold sm:text-lg">{new Intl.DateTimeFormat("th-TH",{month:"long",year:"numeric",timeZone:"UTC"}).format(first)}</h2><Link href={monthLink(1)} aria-label="เดือนถัดไป" className="rounded-xl p-3 hover:bg-slate-100"><ChevronRight size={20}/></Link></div><div className="grid grid-cols-7 gap-1 sm:gap-2">{["อา","จ","อ","พ","พฤ","ศ","ส"].map(day=><span key={day} className="mb-2 text-center text-xs font-medium text-slate-400">{day}</span>)}{Array.from({length:first.getUTCDay()},(_,i)=><span key={`blank-${i}`}/>)}{Array.from({length:days},(_,i)=>{const date=`${month}-${String(i+1).padStart(2,"0")}`;const daily=events.filter(event=>event.date===date);const active=selected===date;return <button type="button" key={date} aria-label={`${date} · ${daily.length} งาน PM`} aria-pressed={active} onClick={()=>setSelected(date)} className={`flex min-h-11 flex-col items-center justify-center rounded-xl py-2 text-xs font-semibold transition sm:min-h-20 sm:text-sm ${active ? "bg-brand text-navy shadow-sm" : date===today ? "bg-orange-50 text-brand-dark ring-1 ring-inset ring-orange-200" : "hover:bg-slate-100"}`}><span>{i+1}</span><div className="mt-1 flex h-1.5 gap-0.5">{daily.slice(0,3).map(event=><span key={event.id} aria-hidden="true" className={`size-1 rounded-full ${active ? "bg-navy" : event.status==="OVERDUE" ? "bg-red-500" : event.status==="COMPLETED" ? "bg-emerald-500" : "bg-brand"}`}/>)}</div><span className="mt-1 hidden text-[10px] font-normal text-slate-500 sm:inline">{daily.length ? `${daily.length} งาน PM` : ""}</span></button>;})}</div></div><div className="mb-4 mt-6 flex items-center justify-between"><h3 className="section-title">งานวันที่ {new Intl.DateTimeFormat("th-TH",{day:"numeric",month:"short",timeZone:"UTC"}).format(new Date(selected))}</h3><span className="text-xs text-slate-500">{selectedEvents.length} รายการ</span></div><div className="space-y-3">{selectedEvents.map(eventCard)}{!selectedEvents.length && <div className="panel py-8 text-center text-sm text-slate-500">ไม่มีงาน PM ในวันที่เลือก</div>}</div></> : <div className="space-y-3">{events.map(eventCard)}{!events.length && <p className="panel text-center text-sm text-slate-500">ไม่มีรายการ PM ในเดือนที่เลือก</p>}</div>}
  </section>;
}
