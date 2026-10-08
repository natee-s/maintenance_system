import Link from "next/link";
import { pageActor } from "@/lib/auth";
import { notifications } from "@/modules/notifications/service";
import { PageHeader } from "@/components/ui/page-header";
import { RecordForm } from "@/components/forms/record-form";
import { Pagination } from "@/components/tables/pagination";
import { formatDate } from "@/lib/dates";
import type { Query } from "@/lib/lists";
export default async function Notifications({searchParams}:{searchParams:Promise<Query>}){const query=await searchParams,data=await notifications(await pageActor(),query);return <><PageHeader title="การแจ้งเตือน" description={`ยังไม่อ่าน ${data.unread} รายการ`}/><div className="space-y-4">{data.rows.map(row=><section key={row.id} className="panel"><Link className="font-bold text-blue-700" href={row.link}>{row.title}</Link><p className="my-3 text-sm">{row.message}</p><p className="mb-3 text-xs text-slate-500">{formatDate(row.createdAt,true)} · {row.readAt ? "อ่านแล้ว" : "ยังไม่อ่าน"}</p>{!row.readAt && <RecordForm endpoint="/api/notifications/read" fields={[]} initial={{id:row.id}} submitLabel="ทำเครื่องหมายว่าอ่านแล้ว"/>}</section>)}</div>{!data.rows.length && <p className="panel">ยังไม่มีการแจ้งเตือน</p>}<div className="mt-4"><Pagination {...data} base="/notifications" query={query}/></div></>;}

