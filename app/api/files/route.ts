import { NextResponse } from "next/server";
import { actor } from "@/lib/auth";
import { invariant,publicError } from "@/lib/errors";
import { upload,entitySchema } from "@/modules/files/service";
import { limitedFormData } from "@/lib/http-body";
export async function POST(request:Request){try{invariant(request.headers.get("origin") === new URL(process.env.APP_URL ?? request.url).origin,"คำขอไม่ถูกต้อง",403);const user=await actor();const length=Number(request.headers.get("content-length") ?? 0);invariant(length <= (Number(process.env.MAX_UPLOAD_MB ?? 10)+1)*1024*1024,"ไฟล์ใหญ่เกินกำหนด",413);const form=await limitedFormData(request,(Number(process.env.MAX_UPLOAD_MB ?? 10)+1)*1024*1024);const file=form.get("file");invariant(file instanceof File,"กรุณาเลือกไฟล์");return NextResponse.json(await upload(user,entitySchema.parse(form.get("entity")),String(form.get("id")),file,form.get("executionItemId") ? String(form.get("executionItemId")) : undefined));}catch(error){const result=publicError(error);return NextResponse.json({error:result.message},{status:result.status});}}

