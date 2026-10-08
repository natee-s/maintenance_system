import Link from "next/link";

import { pageActor } from "@/lib/auth";
import { can } from "@/lib/permissions";

import { pmOptions } from "@/modules/pm/master-service";
import { planFields } from "@/modules/pm/fields";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { RecordForm } from "@/components/forms/record-form";
import { formatDate,bangkokDay } from "@/lib/dates";
import { listPlans } from "@/modules/pm/query-service";
import type { Query } from "@/lib/lists";
import { Filters } from "@/components/forms/filters";
import { Pagination } from "@/components/tables/pagination";
export default async function PmPage({searchParams}:{searchParams:Promise<Query>}){const actor=await pageActor(),query=await searchParams,data=await listPlans(actor,query),rows=data.rows;return <><PageHeader title="บำรุงรักษาเชิงป้องกัน" description="แผน PM ตามรอบปฏิทิน">{can(actor.role,"pm.manage") && <Button asChild variant="secondary"><Link href="/pm/templates">แบบ PM / Checklist</Link></Button>}<Button asChild variant="outline"><Link href="/pm/calendar">ปฏิทิน PM</Link></Button></PageHeader>{can(actor.role,"pm.manage") && <div className="mb-6"><RecordForm endpoint="/api/pm/generate-due" fields={[]} submitLabel="สร้างงาน PM ที่ถึงกำหนด"/></div>}<Filters query={query} fields={[{name:"search",label:"ชื่อ / รหัสแผน"},{name:"assetId",label:"เครื่องจักร",type:"select",options:(await pmOptions())[1].map(x=>({value:x.id,label:`${x.assetCode} · ${x.name}`}))},{name:"active",label:"การใช้งาน",type:"select",options:[{value:"true",label:"ใช้งาน"},{value:"false",label:"ปิดใช้งาน"}]},{name:"overdue",label:"กำหนด",type:"select",options:[{value:"true",label:"เกินกำหนด"}]}]}/><div className="grid gap-4 md:grid-cols-2">{rows.map(row=><Link href={`/pm/plans/${row.id}`} key={row.id} className="panel"><p className="text-xs font-semibold text-blue-700">{row.pmPlanCode} · {row.frequencyType}</p><h2 className="my-2 font-bold">{row.name}</h2><p className="text-sm">{row.asset.assetCode} · {row.asset.name}</p><p className="mt-3 text-sm text-slate-500">กำหนด {formatDate(row.nextDueDate)} · {row.assignedTo?.name ?? "ยังไม่มอบหมาย"} · {row.isActive ? "ใช้งาน" : "ปิดใช้งาน"}</p></Link>)}</div>{!rows.length && <p className="panel">ยังไม่มีแผน PM</p>}<Pagination {...data} base="/pm" query={query}/>{can(actor.role,"pm.manage") && <div className="mt-6"><RecordForm title="เพิ่มแผน PM" endpoint="/api/pm/plans" fields={planFields(await pmOptions())} initial={{frequencyType:"MONTHLY",intervalValue:1,startDate:bangkokDay(),nextDueDate:bangkokDay(),leadDays:0,isActive:true}} redirectTo="/pm/plans/:id" /></div>}</>;}

