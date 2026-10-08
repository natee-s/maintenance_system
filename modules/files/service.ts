import { db,transaction } from "@/lib/db";
import { z } from "zod";
import { invariant } from "@/lib/errors";
import { requirePermission,type Actor } from "@/lib/permissions";
import { getAsset } from "@/modules/assets/service";
import { getRequest } from "@/modules/work-requests/service";
import { getWork,accessibleWork } from "@/modules/work-orders/service";
import { requireEditable } from "@/modules/work-orders/rules";
import { storage } from "@/lib/storage";
import { validateUpload } from "./validation";
import { audit } from "@/modules/audit/service";
import { activity } from "@/modules/work-orders/activity";
export type FileEntity="asset"|"work-request"|"work-order"|"part";
export const entitySchema=z.enum(["asset","work-request","work-order","part"]);
export function fileWhere(entity:FileEntity,id:string){return entity === "part" ? {partId:id} : entity === "asset" ? {assetId:id} : entity === "work-request" ? {workRequestId:id} : {workOrderId:id};}
export async function fileAccess(actor:Actor,entity:FileEntity,id:string,write=false){
  if(entity === "part"){requirePermission(actor,write ? "inventory.manage_master" : "inventory.read");await db.part.findUniqueOrThrow({where:{id}});return;}
  if(entity === "asset"){invariant(actor.role !== "REQUESTER","ไม่มีสิทธิ์ดูเอกสารเครื่องจักร",403);await getAsset(actor,id);if(write)requirePermission(actor,"asset.update");}
  else if(entity === "work-request"){const request=await getRequest(actor,id);if(write){invariant(["ADMIN","MAINTENANCE_SUPERVISOR","TECHNICIAN","REQUESTER"].includes(actor.role),"ไม่มีสิทธิ์เพิ่มไฟล์",403);invariant(request.reporterId === actor.id || ["ADMIN","MAINTENANCE_SUPERVISOR"].includes(actor.role),"ไม่มีสิทธิ์เพิ่มไฟล์",403);invariant(["OPEN","UNDER_REVIEW","APPROVED"].includes(request.status),"ใบแจ้งนี้ไม่สามารถเพิ่มหลักฐานได้");}}
  else {const wo=await getWork(actor,id);if(write){requirePermission(actor,"work_order.update_execution");requireEditable(wo.status);}}
}
export async function listAttachments(actor:Actor,entity:FileEntity,id:string){await fileAccess(actor,entity,id);return db.attachment.findMany({where:fileWhere(entity,id),orderBy:{createdAt:"asc"}});}
export async function upload(actor:Actor,entity:FileEntity,id:string,file:File,executionItemId?:string){await fileAccess(actor,entity,id,true);const bytes=new Uint8Array(await file.arrayBuffer());const extension=validateUpload(file.name,file.type,bytes,Number(process.env.MAX_UPLOAD_MB ?? 10));const key=await storage.upload(bytes,extension);try{return await transaction(async tx=>{
  // Recheck mutable parent under the same transaction to prevent uploads racing close/conversion.
  if(entity === "work-order")requireEditable((await accessibleWork(tx,actor,id)).status);
  if(entity === "work-request")invariant(["OPEN","UNDER_REVIEW","APPROVED"].includes((await tx.workRequest.findUniqueOrThrow({where:{id}})).status),"ใบแจ้งนี้ไม่สามารถเพิ่มหลักฐานได้");
  if(executionItemId){invariant(entity === "work-order" && file.type.startsWith("image/"),"หลักฐาน Checklist ต้องเป็นรูปภาพของใบงานนี้");invariant(await tx.pmExecutionItem.findFirst({where:{id:executionItemId,workOrderId:id}}),"ข้อ Checklist ไม่อยู่ในใบงานนี้");}
  const row=await tx.attachment.create({data:{...fileWhere(entity,id),executionItemId,fileName:file.name.slice(0,200),mimeType:file.type,fileSize:bytes.length,storageKey:key,uploadedBy:actor.id}});await audit(tx,actor.id,"FILE_UPLOAD","Attachment",row.id,undefined,{entity,id,fileName:row.fileName});if(entity === "work-order")await activity(tx,actor.id,id,"PHOTO_ADDED",row.fileName);return row;
});}catch(error){await storage.delete(key);throw error;}}
