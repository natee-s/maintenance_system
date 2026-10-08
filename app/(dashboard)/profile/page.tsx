import Link from "next/link";
import { ChevronRight, ClipboardList, CalendarDays, QrCode, Bell, Users, Settings, ScrollText, LogOut, Package, UserRound } from "lucide-react";
import { pageActor } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { signOut } from "@/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
export default async function Profile() {
  const actor = await pageActor();
  const rows = [
    { href: actor.role === "REQUESTER" ? "/work-requests" : "/work-orders", label: actor.role === "TECHNICIAN" ? "งานที่มอบหมายให้ฉัน" : "รายการงานซ่อม", icon: ClipboardList, show: true },
    { href: "/work-requests", label: "ใบแจ้งซ่อม", icon: ClipboardList, show: actor.role !== "STOREKEEPER" && actor.role !== "REQUESTER" },
    { href: "/pm/calendar", label: "ปฏิทินบำรุงรักษา PM", icon: CalendarDays, show: !["REQUESTER","STOREKEEPER"].includes(actor.role) },
    { href: "/inventory", label: "คลังอะไหล่", icon: Package, show: can(actor.role,"inventory.read") },
    { href: "/scan", label: "สแกน QR เครื่องจักร", icon: QrCode, show: true },
    { href: "/notifications", label: "การแจ้งเตือน", icon: Bell, show: true },
    { href: "/admin/users", label: "จัดการผู้ใช้งาน", icon: Users, show: can(actor.role,"user.manage") },
    { href: "/admin/masters", label: "จัดการข้อมูลหลัก", icon: Settings, show: can(actor.role,"location.manage") },
    { href: "/admin/audit", label: "บันทึกการตรวจสอบ", icon: ScrollText, show: can(actor.role,"user.manage") },
  ].filter(row=>row.show);
  return <div className="mx-auto max-w-2xl"><PageHeader title="โปรไฟล์ของฉัน" description="บัญชีผู้ใช้และเมนูสำหรับการปฏิบัติงาน" />
    <section className="panel text-center"><div className="mx-auto flex size-20 items-center justify-center rounded-full bg-orange-100 text-brand-dark"><UserRound size={36}/></div><h2 className="mt-4 text-xl font-bold">{actor.name}</h2><p className="mt-2 text-xs text-slate-500">{actor.role}</p></section>
    <section className="panel mt-5 divide-y divide-slate-100"><h2 className="section-title pb-4">เมนูของคุณ</h2>{rows.map(({href,label,icon:Icon})=><Link href={href} key={href} className="flex min-h-14 items-center gap-3 py-3 text-sm font-medium"><Icon size={19} className="text-slate-500"/><span className="flex-1">{label}</span><ChevronRight size={17} className="text-slate-400"/></Link>)}</section>
    <form className="mt-6" action={async()=>{"use server";await signOut({redirectTo:"/login"});}}><Button variant="outline" className="w-full border-orange-300 text-brand-dark"><LogOut size={18}/>ออกจากระบบ</Button></form>
  </div>;
}
