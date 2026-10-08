import Link from "next/link";
import { Factory, CalendarCheck, ClipboardList, Timer, AlertTriangle, CheckCircle2, Wrench, Inbox } from "lucide-react";
const icons = { assets: Factory, pm: CalendarCheck, work: ClipboardList, downtime: Timer, alert: AlertTriangle, completed: CheckCircle2, progress: Wrench, request: Inbox };
export function MetricCard({ label, value, href, icon, tone = "orange", hint }: { label: string; value: string | number; href: string; icon: keyof typeof icons; tone?: "orange" | "green" | "red" | "blue"; hint?: string }) {
  const Icon = icons[icon];
  const colors = { orange: "bg-orange-50 text-brand-dark", green: "bg-emerald-50 text-emerald-700", red: "bg-red-50 text-red-700", blue: "bg-blue-50 text-blue-700" };
  return <Link href={href} className="panel group flex items-start gap-3 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"><span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${colors[tone]}`}><Icon size={20}/></span><div className="min-w-0"><p className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">{value}</p><p className="mt-1 text-xs leading-relaxed text-slate-600">{label}</p>{hint && <p className="mt-1 text-[10px] text-slate-400">{hint}</p>}</div></Link>;
}
