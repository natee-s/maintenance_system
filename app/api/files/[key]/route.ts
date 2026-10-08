import { actor } from "@/lib/auth";
import { db } from "@/lib/db";
import { storage } from "@/lib/storage";
import { fileAccess } from "@/modules/files/service";
import { invariant,publicError } from "@/lib/errors";
import { NextResponse } from "next/server";
export async function GET(_request:Request,{params}:{params:Promise<{key:string}>}){try{const user=await actor(),{key}=await params,row=await db.attachment.findUnique({where:{storageKey:key}});invariant(row,"ไม่พบไฟล์",404);await fileAccess(user,row.partId ? "part" : row.assetId ? "asset" : row.workRequestId ? "work-request" : "work-order",row.partId ?? row.assetId ?? row.workRequestId ?? row.workOrderId!);return new Response(new Uint8Array(await storage.read(key)),{headers:{"Content-Type":row.mimeType,"Content-Disposition":`${row.mimeType === "application/pdf" ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(row.fileName)}`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"sandbox"}});}catch(error){const result=publicError(error);return NextResponse.json({error:result.message},{status:result.status});}}

