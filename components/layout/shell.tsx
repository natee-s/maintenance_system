import Link from "next/link";
import { Wrench, LogOut, Bell, QrCode, ShieldCheck } from "lucide-react";
import { signOut } from "@/auth";
import { can, type Actor } from "@/lib/permissions";
import { Navigation, type NavigationItem } from "./navigation";
export function Shell({ user, children }: { user: Actor; children: React.ReactNode }) {
  const home = can(user.role, "dashboard.read") ? "/" : "/work-requests";
  const links: (NavigationItem & { show: boolean })[] = [
    { href: "/", label: "หน้าแรก", icon: "home", show: can(user.role, "dashboard.read") },
    { href: "/assets", label: "เครื่องจักร", icon: "assets", show: true },
    { href: "/work-requests", label: "ใบแจ้งซ่อม", icon: "requests", show: user.role !== "STOREKEEPER" },
    { href: "/work-orders", label: user.role === "TECHNICIAN" ? "งานของฉัน" : "ใบงานซ่อม", icon: "work", show: user.role !== "REQUESTER" },
    { href: "/pm", label: "บำรุงรักษา PM", icon: "pm", show: !["REQUESTER", "STOREKEEPER"].includes(user.role) },
    { href: "/inventory", label: "คลังอะไหล่", icon: "inventory", show: can(user.role, "inventory.read") },
    { href: "/scan", label: "สแกน QR", icon: "scan", show: true },
    { href: "/notifications", label: "การแจ้งเตือน", icon: "notifications", show: true },
    { href: "/admin/audit", label: "Audit log", icon: "audit", show: can(user.role, "user.manage") },
    { href: "/admin/users", label: "ผู้ใช้งาน", icon: "users", show: can(user.role, "user.manage") },
    { href: "/admin/masters", label: "ข้อมูลหลัก", icon: "masters", show: can(user.role, "location.manage") },
    { href: "/profile", label: "โปรไฟล์", icon: "profile", show: true },
  ];
  const mobileLinks: NavigationItem[] = [
    { href: "/", label: "หน้าแรก", icon: "home" },
    { href: "/assets", label: "อุปกรณ์", icon: "assets" },
    { href: user.role === "REQUESTER" ? "/work-requests" : "/work-orders", label: "ใบงาน", icon: "work" },
    can(user.role, "inventory.read") ? { href: "/inventory", label: "อะไหล่", icon: "inventory" } : { href: "/scan", label: "สแกน QR", icon: "scan" },
    { href: "/profile", label: "โปรไฟล์", icon: "profile" },
  ];
  return <div className="min-h-screen bg-canvas">
    <a href="#main-content" className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-xl focus:bg-white focus:p-4">ข้ามไปยังเนื้อหา</a>
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy text-white lg:flex">
      <Link href={home} className="flex items-center gap-3 px-7 py-8"><span className="rounded-2xl bg-brand p-2.5 text-navy"><Wrench size={24} /></span><span><strong className="block text-xl tracking-tight">PlantCare<span className="text-brand">.</span></strong><small className="text-slate-400">Maintenance workspace</small></span></Link>
      <p className="mb-3 px-8 text-[10px] font-semibold tracking-[.16em] text-slate-400">พื้นที่ปฏิบัติงาน</p>
      <Navigation links={links.filter(link => link.show)} />
      <div className="m-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300"><ShieldCheck className="mb-2 text-brand" size={20} />ดูแลเครื่องจักร ให้งานเดินหน้า</div>
    </aside>
    <div className="lg:ml-64"><header className="sticky top-0 z-20 flex min-h-18 items-center justify-between gap-2 border-b border-slate-200/70 bg-white/95 px-4 backdrop-blur-lg lg:px-9">
      <Link href={home} className="flex items-center gap-2 font-bold text-navy lg:hidden"><span className="rounded-lg bg-brand p-1.5"><Wrench size={17} /></span>PlantCare<span className="text-brand">.</span></Link>
      <span className="hidden text-sm text-slate-500 lg:block">โรงงานที่พร้อมเดินหน้า <span className="mx-2 text-slate-300">/</span><strong className="font-medium text-navy">Maintenance workspace</strong></span>
      <div className="flex items-center gap-1 sm:gap-3"><Link href="/scan" aria-label="สแกน QR" className="rounded-xl p-2.5 text-slate-500 hover:bg-orange-50"><QrCode size={20} /></Link><Link href="/notifications" aria-label="การแจ้งเตือน" className="rounded-xl p-2.5 text-slate-500 hover:bg-orange-50"><Bell size={20} /></Link><Link href="/profile" className="flex items-center gap-3"><span className="hidden text-right sm:block"><strong className="block text-sm">{user.name}</strong><span className="text-[10px] text-slate-500">{user.role}</span></span><span className="flex size-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-brand-dark">{user.name.slice(0,1)}</span></Link><form className="hidden lg:block" action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}><button aria-label="ออกจากระบบ" className="rounded-xl p-3 text-slate-500 hover:bg-slate-100"><LogOut size={18} /></button></form></div>
    </header><main id="main-content" className="mx-auto max-w-[1500px] p-4 pb-[calc(100px+env(safe-area-inset-bottom))] sm:p-6 sm:pb-28 lg:p-9">{children}</main></div>
    <Navigation links={mobileLinks} mobile />
  </div>;
}
