import Link from "next/link";
import type { Actor } from "@/lib/permissions";
import type { Query } from "@/lib/lists";
import { pmSummary } from "@/modules/pm/summary-service";
export async function PmSummary({actor,query}:{actor:Actor;query:Query}){const data=await pmSummary(actor,query);return <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["PM ถึงกำหนดสัปดาห์นี้",data.due],["PM เกินกำหนด",data.overdue],["PM เสร็จเดือนนี้",data.completedThisMonth],["อัตราเสร็จ PM",`${data.completionRate.toFixed(1)}%`]].map(([label,count])=><Link href="/pm/calendar" className="panel" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-4 text-3xl font-bold text-blue-950">{count}</p></Link>)}</div>;}

