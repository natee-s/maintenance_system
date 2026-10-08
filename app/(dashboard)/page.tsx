import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, QrCode, Plus, CalendarDays, Activity, ChevronRight, ShieldCheck } from "lucide-react";
import { pageActor } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { dashboard } from "@/modules/dashboard/service";
import { dashboardPresentation } from "@/modules/dashboard/presentation-service";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filters } from "@/components/forms/filters";
import { OperationalCharts } from "@/components/charts/operational-charts";
import { PmSummary } from "@/components/maintenance/pm-summary";
import { InventorySummary } from "@/components/maintenance/inventory-summary";
import { formatDate } from "@/lib/dates";
import type { Query } from "@/lib/lists";
export default async function Home({searchParams}:{searchParams:Promise<Query>}) {
  const actor=await pageActor(); if(actor.role==="REQUESTER")redirect("/work-requests");
  const query=await searchParams;
  if(actor.role==="STOREKEEPER")return <><PageHeader title="ภาพรวมคลังอะไหล่"/><Filters query={query} fields={[{name:"dateFrom",label:"ตั้งแต่",type:"date"},{name:"dateTo",label:"ถึง",type:"date"}]}/><InventorySummary actor={actor} query={query}/></>;
  const [data, presentation, sites, areas, categories] = await Promise.all([
    dashboard(actor,query), dashboardPresentation(actor,query),
    db.site.findMany({where:{isActive:true}}), db.area.findMany({where:{isActive:true}}), db.masterData.findMany({where:{kind:"ASSET_CATEGORY",isActive:true}})
  ]);
  return <>
    <PageHeader title="ภาพรวมงานซ่อมบำรุง" description={`สวัสดี ${actor.name} · พร้อมดูแลเครื่องจักรวันนี้`}>
      <Button asChild className="hidden sm:inline-flex" variant="outline"><Link href="/pm/calendar"><CalendarDays size={17}/>ปฏิทิน PM</Link></Button>
    </PageHeader>
    <section className="hero-pattern relative mb-5 overflow-hidden rounded-2xl p-5 text-white sm:p-8">
      <div className="relative z-10 max-w-xl"><p className="flex items-center gap-2 text-xs font-semibold text-orange-300"><ShieldCheck size={16}/>PLANTCARE MAINTENANCE</p><h2 className="mt-3 text-xl font-bold leading-snug sm:text-3xl">เครื่องจักรพร้อมใช้<br/>ทีมงานพร้อมเดินหน้า</h2><p className="mt-3 hidden max-w-sm text-sm leading-relaxed text-slate-300 sm:block">เริ่มจากสแกนเครื่องจักร แจ้งปัญหา และติดตามทุกงานในที่เดียว</p><div className="mt-5 flex flex-wrap gap-3"><Button asChild><Link href="/scan"><QrCode size={18}/>สแกนเครื่องจักร</Link></Button>{can(actor.role,"work_request.create") && <Button asChild className="border-white/20 bg-white/10 text-white hover:bg-white/20" variant="outline"><Link href="/work-requests/new"><Plus size={18}/>แจ้งซ่อม</Link></Button>}</div></div>
      <Activity className="absolute -right-7 top-10 size-52 text-white/5 sm:right-12" strokeWidth={1}/>
      <span className="absolute right-7 top-7 hidden rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-300 sm:inline-flex">Operational overview <ArrowUpRight size={14} className="ml-2"/></span>
    </section>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><MetricCard label="เครื่องจักรทั้งหมด" value={data.assets} href="/assets" icon="assets" tone="blue"/><MetricCard label="PM ครบกำหนดวันนี้" value={presentation.pmToday} href="/pm/calendar" icon="pm"/><MetricCard label="ใบงานที่ยังเปิด" value={data.open} href="/work-orders" icon="work"/><MetricCard label="Downtime (นาที)" hint="รวมช่วงเวลาที่เลือก" value={(data.downtime.closed+data.downtime.ongoing).toFixed(1)} href="/work-orders" icon="downtime" tone="red"/></div>
    <div className="mt-5"><Filters compact query={query} fields={[{name:"dateFrom",label:"ตั้งแต่",type:"date"},{name:"dateTo",label:"ถึง",type:"date"},{name:"siteId",label:"โรงงาน",type:"select",options:sites.map(x=>({value:x.id,label:x.name}))},{name:"areaId",label:"พื้นที่",type:"select",options:areas.map(x=>({value:x.id,label:x.name}))},{name:"grain",label:"แนวโน้ม",type:"select",options:[{value:"day",label:"รายวัน"},{value:"week",label:"รายสัปดาห์"},{value:"month",label:"รายเดือน"}]},{name:"categoryId",label:"ประเภทเครื่องจักร",type:"select",options:categories.map(x=>({value:x.id,label:x.name}))}]}/></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_1fr]">
      <section className="panel"><div className="mb-3 flex items-center justify-between"><h2 className="section-title">กิจกรรมล่าสุด</h2><Link href="/work-orders" className="flex min-h-11 items-center gap-1 text-xs font-semibold text-brand-dark">ดูใบงาน<ChevronRight size={15}/></Link></div><div className="divide-y divide-slate-100">{presentation.recent.map(event=><Link key={event.id} href={`/work-orders/${event.workOrder.id}`} className="flex items-center gap-3 py-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-brand-dark"><Activity size={18}/></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{event.workOrder.asset.assetCode} · {event.workOrder.title}</p><p className="mt-1 truncate text-xs text-slate-500">{event.message} · {event.actor?.name ?? "ระบบ"}</p><p className="mt-1 text-[10px] text-slate-400">{formatDate(event.createdAt,true)}</p></div><ChevronRight size={17} className="shrink-0 text-slate-400"/></Link>)}{!presentation.recent.length && <p className="py-8 text-center text-sm text-slate-500">ยังไม่มีกิจกรรมในช่วงวันที่เลือก</p>}</div></section>
      <section className="panel"><h2 className="section-title mb-5">สถานะการปฏิบัติงาน</h2><div className="grid grid-cols-2 gap-4">{[{label:"ใบแจ้งรอตรวจสอบ",value:data.requests,href:"/work-requests?status=OPEN"},{label:"เครื่องกำลังซ่อม",value:data.underMaintenance,href:"/assets?status=UNDER_MAINTENANCE"},{label:"กำลังดำเนินการ",value:data.inProgress,href:"/work-orders?status=IN_PROGRESS"},{label:"เสร็จในช่วงที่เลือก",value:data.completed,href:"/work-orders?status=COMPLETED"},{label:"งานเกินกำหนด",value:data.overdue,href:"/work-orders?overdue=true"},{label:"Downtime ยังหยุด (นาที)",value:data.downtime.ongoing.toFixed(1),href:"/work-orders"}].map(card=><Link key={card.label} href={card.href} className="rounded-xl bg-slate-50 p-4 hover:bg-orange-50"><p className="text-xl font-bold">{card.value}</p><p className="mt-1 text-xs text-slate-500">{card.label}</p></Link>)}</div><div className="mt-5"><Badge value={data.overdue ? "URGENT" : "ACTIVE"}/><span className="ml-2 text-xs text-slate-500">{data.overdue ? "มีงานที่ต้องติดตามกำหนดเสร็จ" : "ตรวจสอบงานตามกำหนดได้จากใบงาน"}</span></div></section>
    </div>
    <PmSummary actor={actor} query={query}/><OperationalCharts charts={data.charts}/><InventorySummary actor={actor} query={query}/>
  </>;
}
