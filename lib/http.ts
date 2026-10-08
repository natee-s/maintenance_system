import { NextResponse } from "next/server";
import { actor } from "@/lib/auth";
import { invariant, publicError } from "@/lib/errors";
import type { Actor } from "@/lib/permissions";
export function mutation(operation: (actor: Actor, data: unknown, request: Request) => Promise<unknown>) {
  return async (request: Request) => {
    try {
      const origin = request.headers.get("origin");
      invariant(origin && origin === new URL(process.env.APP_URL ?? request.url).origin, "คำขอไม่ถูกต้อง กรุณาเปิดผ่านเว็บไซต์หลัก", 403);
      const user = await actor();
      const data: unknown = await request.json();
      return NextResponse.json(await operation(user, data, request));
    } catch (error) { const result = publicError(error); return NextResponse.json({ error: result.message }, { status: result.status }); }
  };
}
export async function read(operation: (actor: Actor) => Promise<unknown>) {
  try { return NextResponse.json(await operation(await actor())); }
  catch (error) { const result = publicError(error); return NextResponse.json({ error: result.message }, { status: result.status }); }
}
