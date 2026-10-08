import { pageActor } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { db } from "@/lib/db";
import { pagination,value,type Query } from "@/lib/lists";
import { PageHeader } from "@/components/ui/page-header";
import { Filters } from "@/components/forms/filters";
import { Pagination } from "@/components/tables/pagination";
import { formatDate } from "@/lib/dates";
export default async function Audit({searchParams}:{searchParams:Promise<Query>}){requirePermission(await pageActor(),"user.manage");const query=await searchParams,page=pagination(query),where={entityType:value(query,"entityType"),action:value(query,"action")},[rows,total]=await Promise.all([db.auditLog.findMany({where,include:{actor:{select:{name:true}}},orderBy:{createdAt:"desc"},skip:page.skip,take:page.take}),db.auditLog.count({where})]);return <><PageHeader title="Audit log" description="ประวัติผู้ทำรายการและข้อมูลก่อน / หลังที่ตัดข้อมูลลับแล้ว"/><Filters query={query} fields={[{name:"entityType",label:"ประเภทข้อมูล"},{name:"action",label:"การกระทำ"}]}/><div className="space-y-4">{rows.map(row=><details className="panel" key={row.id}><summary className="cursor-pointer text-sm">{row.action} · {row.entityType} · {row.actor?.name ?? "ระบบ"} · {formatDate(row.createdAt,true)}</summary><p className="my-3 text-xs">{row.entityId}</p><pre className="overflow-x-auto text-xs">{JSON.stringify({before:row.before,after:row.after},null,2)}</pre></details>)}</div>{!rows.length && <p className="panel">ไม่พบประวัติตามเงื่อนไข</p>}<Pagination {...page} total={total} base="/admin/audit" query={query}/></>;}

