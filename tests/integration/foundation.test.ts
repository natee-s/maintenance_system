import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import { db, transaction } from "@/lib/db";
import { nextCode } from "@/lib/codes";
import { verifyCredentials } from "@/modules/auth/service";
import { audit } from "@/modules/audit/service";
afterAll(() => db.$disconnect());
describe("foundation PostgreSQL boundary", () => {
  it("authenticates without exposing password hashes", async () => {
    const user = await verifyCredentials({ login: "admin", password: process.env.SEED_PASSWORD ?? "PilotDemo!2026" });
    expect(user?.email).toBe("admin@demo.local"); expect(user).not.toHaveProperty("passwordHash");
    expect(await verifyCredentials({ login: "admin", password: "wrong" })).toBeNull();
  });
  it("rejects an inactive account", async () => {
    const user = await db.user.findUniqueOrThrow({ where: { username: "manager" } });
    await db.user.update({ where: { id: user.id }, data: { isActive: false } });
    try { expect(await verifyCredentials({ login: "manager", password: process.env.SEED_PASSWORD ?? "PilotDemo!2026" })).toBeNull(); }
    finally { await db.user.update({ where: { id: user.id }, data: { isActive: true } }); }
  });
  it("generates different codes under concurrent transactions", async () => {
    const codes = await Promise.all(Array.from({ length: 4 }, () => transaction((tx) => nextCode(tx, "AST"))));
    expect(new Set(codes).size).toBe(4);
  });
  it("writes audit atomically and redacts secrets", async () => {
    const user = await db.user.findUniqueOrThrow({ where: { username: "admin" } });
    const entityId = `test-${Date.now()}`;
    await transaction((tx) => audit(tx, user.id, "TEST", "Foundation", entityId, undefined, { name: "Safe", passwordHash: "never", qrToken: "never" }));
    const row = await db.auditLog.findFirstOrThrow({ where: { entityId } });
    expect(row.after).toEqual({ name: "Safe" });
  });
});
