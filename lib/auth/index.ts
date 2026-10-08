import { auth } from "@/auth";
import { db } from "@/lib/db";
import { invariant } from "@/lib/errors";
import type { Actor } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { safeRedirect } from "./redirect";
export async function actor(): Promise<Actor> {
  const session = await auth();
  invariant(session?.user?.id, "กรุณาเข้าสู่ระบบ", 401);
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, role: true, siteId: true, isActive: true } });
  invariant(user?.isActive, "บัญชีไม่พร้อมใช้งาน กรุณาเข้าสู่ระบบ", 401);
  return { id: user.id, name: user.name, role: user.role, siteId: user.siteId };
}
export async function pageActor() {
  try { return await actor(); } catch { const next=safeRedirect((await headers()).get("x-cmms-path"));redirect(`/login?callbackUrl=${encodeURIComponent(next)}`); }
}
