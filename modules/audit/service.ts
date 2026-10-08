import type { Prisma } from "@/generated/prisma/client";
import type { Tx } from "@/lib/db";
function sanitize(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return JSON.parse(JSON.stringify(value, (key, item) => /password|secret|token/i.test(key) ? undefined : item)) as Prisma.InputJsonValue;
}
export async function audit(tx: Tx, actorId: string, action: string, entityType: string, entityId: string, before?: unknown, after?: unknown) {
  await tx.auditLog.create({ data: { actorId, action, entityType, entityId, before: sanitize(before), after: sanitize(after) } });
}
