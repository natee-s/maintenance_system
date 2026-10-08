import { compare, hash } from "bcryptjs";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { z } from "zod";
export const credentialsSchema = z.object({ login: z.string().trim().min(1).max(254), password: z.string().min(1).refine(value=>Buffer.byteLength(value,"utf8") <= 72) });
export const passwordSchema = z.string().min(10, "รหัสผ่านอย่างน้อย 10 ตัวอักษร").refine(value=>Buffer.byteLength(value,"utf8") <= 72,"รหัสผ่านต้องไม่เกิน 72 ไบต์ UTF-8");
export function hashPassword(password: string) { return hash(passwordSchema.parse(password), 12); }
export async function verifyCredentials(input: unknown) {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) return null;
  const { login, password } = parsed.data;
  const key = createHash("sha256").update(login.toLowerCase()).digest("hex");
  const now = new Date();
  const windowStart = new Date(now.getTime() - 15 * 60 * 1000);
  const attempt = await db.loginAttempt.findUnique({ where: { key } });
  if (attempt && attempt.windowStart > windowStart && attempt.failures >= 8) return null;
  const user = await db.user.findFirst({ where: { OR: [{ username: login.toLowerCase() }, { email: login.toLowerCase() }] } });
  // A fixed dummy hash keeps unknown-account password verification on the same path.
  const valid = await compare(password, user?.passwordHash ?? "$2b$12$C6UzMDM.H6dfI/f/IKcEe.2NQWdLsKvYeHWYEqwxIQw6yJ.oH0yma");
  if (!user?.isActive || !valid) {
    await db.loginAttempt.upsert({ where: { key }, create: { key, failures: 1 }, update: attempt && attempt.windowStart > windowStart ? { failures: { increment: 1 } } : { failures: 1, windowStart: now } });
    return null;
  }
  await db.loginAttempt.deleteMany({ where: { key } });
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: now } });
  return { id: user.id, name: user.name, email: user.email };
}
