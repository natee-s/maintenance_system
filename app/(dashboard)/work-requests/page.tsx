import Link from "next/link";
import { pageActor } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listRequests } from "@/modules/work-requests/service";
import { WorkRequestStatus } from "@/generated/prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Filters } from "@/components/forms/filters";
import { RecordList } from "@/components/tables/record-list";
import { formatDate } from "@/lib/dates";
import type { Query } from "@/lib/lists";
export default async function RequestsPage({searchParams}:{searchParams:Promise<Query>}){const actor=await pageActor(),query=await searchParams,data=await listRequests(actor,query);return <><PageHeader title="ใบแจ้งซ่อม" description="รายงานปัญหาและติดตามการรับงาน">{can(actor.role,"work_request.create") && <Button asChild><Link href="/work-requests/new">+ แจ้งซ่อม</Link></Button>}</PageHeader><Filters query={query} fields={[{name:"search",label:"ค้นหา"},{name:"status",label:"สถานะ",type:"select",options:Object.values(WorkRequestStatus).map(value=>({value,label:value}))}]} /><RecordList {...data} base="/work-requests" query={query} columns={["รหัส","ปัญหา","เครื่องจักร","ผู้แจ้ง","เวลา"]} rows={data.rows.map(x=>({id:x.id,href:`/work-requests/${x.id}`,cells:[x.requestCode,x.title,x.asset.name,x.reporter.name,formatDate(x.reportedAt,true)],badge:x.status}))} /></>;}
