import { db } from "@/lib/db";
import { pageActor } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { PageHeader } from "@/components/ui/page-header";
import { ChecklistBuilder } from "@/components/forms/checklist-builder";
export default async function TemplateDetail({params}:{params:Promise<{id:string}>}){requirePermission(await pageActor(),"pm.manage");const row=await db.pmTemplate.findUniqueOrThrow({where:{id:(await params).id},include:{items:{where:{isActive:true},orderBy:{sequence:"asc"}}}});return <><PageHeader title={row.templateCode} description="การแก้ไขไม่เปลี่ยนหลักฐาน PM ที่สร้างไว้แล้ว"/><ChecklistBuilder initial={row}/></>;}
