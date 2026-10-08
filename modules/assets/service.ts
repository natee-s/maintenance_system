import { db, transaction, type Tx } from "@/lib/db";
import { Prisma, AssetStatus, Criticality } from "@/generated/prisma/client";
import { z } from "zod";
import { requirePermission, type Actor } from "@/lib/permissions";
import { invariant } from "@/lib/errors";
import { nextCode } from "@/lib/codes";
import { audit } from "@/modules/audit/service";
import { optionalText, optionalId, optionalDate, pagination, value, type Query } from "@/lib/lists";
export const assetSchema = z.object({ id:z.string().optional(),name:z.string().trim().min(1).max(200),categoryId:z.string().min(1),siteId:z.string().min(1),areaId:optionalId,locationId:optionalId,criticality:z.enum(Criticality),status:z.enum(AssetStatus),manufacturer:optionalText,model:optionalText,serialNumber:optionalText,installDate:optionalDate,description:optionalText,isActive:z.boolean().default(true) });
export const assetInclude = { site:{include:{organization:true}},area:true,location:true,category:true } as const;
export async function activeAsset(tx: Tx, id: string) { const asset = await tx.asset.findUnique({where:{id}}); invariant(asset?.isActive && asset.status !== "INACTIVE" && asset.status !== "OUT_OF_SERVICE","เครื่องจักรไม่พร้อมสำหรับรายการใหม่"); return asset; }
export async function saveAsset(actor: Actor, input: unknown) {
  requirePermission(actor,"asset.create");
  const data = assetSchema.parse(input); requirePermission(actor,data.id ? "asset.update" : "asset.create");
  return transaction(async(tx)=>{
    const before = data.id ? await tx.asset.findUniqueOrThrow({where:{id:data.id}}) : undefined;
    invariant((await tx.site.findUnique({where:{id:data.siteId}}))?.isActive,"โรงงานไม่พร้อมใช้งาน");
    const category = await tx.masterData.findUnique({where:{id:data.categoryId}}); invariant(category?.kind === "ASSET_CATEGORY" && category.isActive,"ประเภทเครื่องจักรไม่พร้อมใช้งาน");
    if(data.areaId){const area = await tx.area.findUnique({where:{id:data.areaId}}); invariant(area?.isActive && area.siteId === data.siteId,"พื้นที่ไม่ตรงกับโรงงาน");}
    if(data.locationId){const location = await tx.location.findUnique({where:{id:data.locationId}}); invariant(location?.isActive && location.siteId === data.siteId && (!data.areaId || location.areaId === data.areaId),"สถานที่ไม่ตรงกับพื้นที่หรือโรงงาน");}
    const {id,...values} = data;
    const saved = id ? await tx.asset.update({where:{id},data:{...values,updatedBy:actor.id,archivedAt: data.isActive ? null : new Date()}}) : await tx.asset.create({data:{...values,assetCode:await nextCode(tx,"AST"),createdBy:actor.id,updatedBy:actor.id}});
    await audit(tx,actor.id,before ? "ASSET_UPDATE" : "ASSET_CREATE","Asset",saved.id,before,saved); return saved;
  });
}
export async function listAssets(actor: Actor,query: Query) {
  requirePermission(actor,"asset.read"); const page = pagination(query); const search=value(query,"search");
  const where: Prisma.AssetWhereInput = { ...(search ? {OR:[{assetCode:{contains:search,mode:"insensitive"}},{name:{contains:search,mode:"insensitive"}},...(actor.role !== "REQUESTER" ? [{serialNumber:{contains:search,mode:Prisma.QueryMode.insensitive}}] : [])]} : {}), siteId:value(query,"siteId") || undefined,areaId:value(query,"areaId") || undefined,locationId:value(query,"locationId") || undefined,categoryId:value(query,"categoryId") || undefined,status:AssetStatus[value(query,"status") as keyof typeof AssetStatus],criticality:Criticality[value(query,"criticality") as keyof typeof Criticality],...(actor.role === "REQUESTER" ? {isActive:true} : {}) };
  const sort = ["name","assetCode","createdAt"].includes(value(query,"sort") ?? "") ? value(query,"sort")! : "assetCode";
  const [rows,total] = await Promise.all([db.asset.findMany({where,include:assetInclude,skip:page.skip,take:page.take,orderBy:{[sort]:value(query,"order") === "desc" ? "desc" : "asc"}}),db.asset.count({where})]);
  return {...page,rows,total};
}
export async function getAsset(actor: Actor,id: string) { requirePermission(actor,"asset.read"); const asset = await db.asset.findUniqueOrThrow({where:{id},include:assetInclude}); invariant(actor.role !== "REQUESTER" || asset.isActive,"ไม่พบเครื่องจักร",404); return asset; }
export async function qrAsset(actor: Actor,token: string) { requirePermission(actor,"asset.read"); const asset=await db.asset.findUnique({where:{qrToken:token},include:assetInclude}); invariant(asset?.isActive && asset.status !== "INACTIVE","QR ไม่ถูกต้องหรือเครื่องจักรไม่พร้อมใช้งาน",404); return asset; }
export function assetDto(actor: Actor,asset: Awaited<ReturnType<typeof getAsset>>) { return actor.role === "REQUESTER" ? {id:asset.id,assetCode:asset.assetCode,name:asset.name,status:asset.status,site:asset.site.name,area:asset.area?.name,location:asset.location?.name} : asset; }
