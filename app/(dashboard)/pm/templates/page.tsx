import Link from "next/link";
import { db } from "@/lib/db";
import { pageActor } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { PageHeader } from "@/components/ui/page-header";
import { ChecklistBuilder } from "@/components/forms/checklist-builder";
import { pagination,value,type Query } from "@/lib/lists";
import { Pagination } from "@/components/tables/pagination";
import { Filters } from "@/components/forms/filters";
export default async function Templates({searchParams}:{searchParams:Promise<Query>}){requirePermission(await pageActor(),"pm.manage");const query=await searchParams,page=pagination(query),search=value(query,"search"),where=search ? {name:{contains:search,mode:"insensitive" as const}} : {},[rows,total]=await Promise.all([db.pmTemplate.findMany({where,orderBy:{name:"asc"},skip:page.skip,take:page.take}),db.pmTemplate.count({where})]);return <><PageHeader title="แบบ PM และรายการตรวจสอบ" /><Filters query={query} fields={[{name:"search",label:"ค้นหาแบบ PM"}]}/><div className="panel mb-6 space-y-3">{rows.map(row=><Link key={row.id} className="block text-blue-700" href={`/pm/templates/${row.id}`}>{row.templateCode} · {row.name} · {row.isActive ? "ใช้งาน" : "ปิดใช้งาน"}</Link>)}{!rows.length && <p>ยังไม่มีแบบ PM</p>}</div><Pagination {...page} total={total} base="/pm/templates" query={query}/><div className="mt-6"><ChecklistBuilder /></div></>;}

