import { db, transaction } from "@/lib/db";
import { Role } from "@/generated/prisma/client";
import { z } from "zod";
import { requirePermission, type Actor } from "@/lib/permissions";
import { hashPassword, passwordSchema } from "@/modules/auth/service";
import { audit } from "@/modules/audit/service";
import { invariant } from "@/lib/errors";
import { pagination,value,type Query } from "@/lib/lists";
const inputSchema = z.object({ id: z.string().optional(), name: z.string().trim().min(1).max(100), username: z.string().trim().toLowerCase().regex(/^[a-z0-9._-]+$/).max(100), email: z.email().toLowerCase(), role: z.enum(Role), siteId: z.string().optional(), employeeCode: z.string().optional(), isActive: z.boolean().default(true), password: z.string().optional() });
export const userProjection = { id: true, name: true, username: true, email: true, role: true, siteId: true, employeeCode: true, isActive: true, createdAt: true } as const;
export async function listUsers(actor: Actor) { requirePermission(actor, "user.manage"); return db.user.findMany({ select: userProjection, orderBy: { name: "asc" } }); }
export async function pagedUsers(actor:Actor,query:Query){requirePermission(actor,"user.manage");const page=pagination(query),search=value(query,"search"),where=search ? {OR:[{name:{contains:search,mode:"insensitive" as const}},{username:{contains:search,mode:"insensitive" as const}}]} : {};const [rows,total]=await Promise.all([db.user.findMany({where,select:userProjection,orderBy:{name:"asc"},skip:page.skip,take:page.take}),db.user.count({where})]);return {...page,rows,total};}
export async function saveUser(actor: Actor, input: unknown) {
  requirePermission(actor, "user.manage"); const data = inputSchema.parse(input);
  const passwordHash = data.password ? await hashPassword(passwordSchema.parse(data.password)) : undefined;
  invariant(data.id || passwordHash, "กรุณากำหนดรหัสผ่านอย่างน้อย 10 ตัวอักษร");
  return transaction(async (tx) => {
    const before = data.id ? await tx.user.findUniqueOrThrow({ where: { id: data.id }, select: userProjection }) : undefined;
    if (before?.role === "ADMIN" && (!data.isActive || data.role !== "ADMIN")) invariant(await tx.user.count({ where: { role: "ADMIN", isActive: true, id: { not: data.id } } }) > 0, "ต้องมีผู้ดูแลระบบที่ใช้งานอย่างน้อยหนึ่งคน");
    if (data.siteId) invariant((await tx.site.findUnique({ where: { id: data.siteId } }))?.isActive, "โรงงานไม่พร้อมใช้งาน");
    const values = { name: data.name, username: data.username, email: data.email, role: data.role, siteId: data.siteId || null, employeeCode: data.employeeCode || null, isActive: data.isActive, ...(passwordHash ? { passwordHash } : {}) };
    const user = data.id ? await tx.user.update({ where: { id: data.id }, data: values, select: userProjection }) : await tx.user.create({ data: { ...values, passwordHash: passwordHash! }, select: userProjection });
    await audit(tx, actor.id, before ? "USER_UPDATE" : "USER_CREATE", "User", user.id, before, user); return user;
  });
}
