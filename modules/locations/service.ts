import { db, transaction } from "@/lib/db";
import { MasterKind } from "@/generated/prisma/client";
import { requirePermission, type Actor } from "@/lib/permissions";
import { invariant } from "@/lib/errors";
import { audit } from "@/modules/audit/service";
import { z } from "zod";
const schema = z.object({ id: z.string().optional(), entity: z.enum(["organization","site","area","location","master"]), code: z.string().trim().min(1).max(50), name: z.string().trim().min(1).max(150), organizationId: z.string().optional(), siteId: z.string().optional(), areaId: z.string().optional(), kind: z.enum(MasterKind).optional(), description: z.string().max(2000).optional(), isActive: z.boolean().default(true), allowsDecimal: z.boolean().default(false) });
export async function locationOptions() { return Promise.all([db.organization.findMany({ orderBy: { name: "asc" } }), db.site.findMany({ include: { organization: true }, orderBy: { name: "asc" } }), db.area.findMany({ include: { site: true }, orderBy: { name: "asc" } }), db.location.findMany({ include: { site: true, area: true }, orderBy: { name: "asc" } }), db.masterData.findMany({ orderBy: [{kind:"asc"},{name:"asc"}] })]); }
export async function saveLocation(actor: Actor, input: unknown) {
  requirePermission(actor, "location.manage"); const data = schema.parse(input);
  return transaction(async (tx) => {
    const common = { code: data.code, name: data.name, isActive: data.isActive };
    const site = data.siteId ? await tx.site.findUnique({ where: { id: data.siteId } }) : null;
    if (["area","location"].includes(data.entity)) invariant(site?.isActive, "กรุณาเลือกโรงงานที่ใช้งาน");
    if (data.areaId) { const area = await tx.area.findUnique({ where: { id: data.areaId } }); invariant(area?.isActive && area.siteId === data.siteId, "พื้นที่ไม่อยู่ในโรงงานที่เลือกหรือไม่พร้อมใช้งาน"); }
    let row: { id: string }; let before: unknown;
    if(data.id){
      if(data.entity === "site")invariant((await tx.site.findUniqueOrThrow({where:{id:data.id}})).organizationId === data.organizationId,"ไม่สามารถย้ายโรงงานไปองค์กรอื่นได้");
      if(data.entity === "area")invariant((await tx.area.findUniqueOrThrow({where:{id:data.id}})).siteId === data.siteId,"ไม่สามารถย้ายพื้นที่ไปโรงงานอื่นได้");
      if(data.entity === "location"){const current=await tx.location.findUniqueOrThrow({where:{id:data.id}});invariant(current.siteId === data.siteId && current.areaId === (data.areaId || null),"ไม่สามารถย้ายสถานที่ที่มีประวัติได้");}
      if(data.entity === "master"){const current=await tx.masterData.findUniqueOrThrow({where:{id:data.id}});invariant(current.kind === data.kind,"ไม่สามารถเปลี่ยนประเภทข้อมูลหลักได้");if(current.kind === "UOM" && current.allowsDecimal !== data.allowsDecimal)invariant(await tx.stockTransaction.count({where:{part:{uomId:current.id}}}) === 0,"หน่วยที่มี ledger แล้วไม่สามารถเปลี่ยนนโยบายทศนิยมได้");}
    }
    switch (data.entity) {
      case "organization":
        before = data.id ? await tx.organization.findUniqueOrThrow({where:{id:data.id}}) : undefined;
        row = data.id ? await tx.organization.update({where:{id:data.id},data:common}) : await tx.organization.create({data:common}); break;
      case "site": {
        invariant(data.organizationId && (await tx.organization.findUnique({where:{id:data.organizationId}}))?.isActive,"กรุณาเลือกองค์กรที่ใช้งาน");
        const values = {...common, organizationId:data.organizationId}; before = data.id ? await tx.site.findUniqueOrThrow({where:{id:data.id}}) : undefined;
        row = data.id ? await tx.site.update({where:{id:data.id},data:values}) : await tx.site.create({data:values}); break;
      }
      case "area": {
        const values = {...common,siteId:data.siteId!}; before = data.id ? await tx.area.findUniqueOrThrow({where:{id:data.id}}) : undefined;
        row = data.id ? await tx.area.update({where:{id:data.id},data:values}) : await tx.area.create({data:values}); break;
      }
      case "location": {
        const values = {...common,siteId:data.siteId!,areaId:data.areaId || null,description:data.description}; before = data.id ? await tx.location.findUniqueOrThrow({where:{id:data.id}}) : undefined;
        row = data.id ? await tx.location.update({where:{id:data.id},data:values}) : await tx.location.create({data:values}); break;
      }
      case "master": {
        invariant(data.kind,"กรุณาเลือกประเภทข้อมูลหลัก"); const values = {...common,kind:data.kind,description:data.description,allowsDecimal:data.allowsDecimal};
        before = data.id ? await tx.masterData.findUniqueOrThrow({where:{id:data.id}}) : undefined;
        row = data.id ? await tx.masterData.update({where:{id:data.id},data:values}) : await tx.masterData.create({data:values}); break;
      }
    }
    await audit(tx,actor.id,data.id ? "MASTER_UPDATE" : "MASTER_CREATE",data.entity,row.id,before,row); return row;
  });
}
