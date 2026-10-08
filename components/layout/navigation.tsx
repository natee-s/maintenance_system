"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Factory, ClipboardList, Wrench, CalendarDays, Package, Users, Settings, QrCode, Bell, ScrollText, UserRound } from "lucide-react";
const icons = { home: LayoutDashboard, assets: Factory, requests: ClipboardList, work: Wrench, pm: CalendarDays, inventory: Package, scan: QrCode, notifications: Bell, audit: ScrollText, users: Users, masters: Settings, profile: UserRound };
export type NavigationItem = { href: string; label: string; icon: keyof typeof icons };
export function Navigation({ links, mobile = false }: { links: NavigationItem[]; mobile?: boolean }) {
  const pathname = usePathname();
  return <nav aria-label={mobile ? "เมนูหลักบนมือถือ" : "เมนูหลัก"} className={mobile ? "fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden" : "min-h-0 flex-1 space-y-1 overflow-y-auto px-4"}>
    {links.map(({ href, label, icon }) => {
      const Icon = icons[icon];
      const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={mobile
        ? `relative flex min-h-18 flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold ${active ? "text-brand-dark" : "text-slate-500"}`
        : `flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition ${active ? "bg-brand text-navy shadow-sm" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}>
        {mobile && active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-brand" />}
        <Icon size={mobile ? 22 : 19} strokeWidth={active ? 2.5 : 1.8} aria-hidden="true" />{label}
      </Link>;
    })}
  </nav>;
}
