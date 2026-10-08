"use client";
import { useActionState } from "react";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
export function LoginForm({callbackUrl="/"}:{callbackUrl?:string}) {
  const [error, action, pending] = useActionState(loginAction, "");
  return <form action={action} className="space-y-5"><input type="hidden" name="callbackUrl" value={callbackUrl}/><label>ชื่อผู้ใช้ / อีเมล<input name="login" required autoComplete="username" /></label><label>รหัสผ่าน<input name="password" type="password" required autoComplete="current-password" /></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button className="w-full" disabled={pending}>{pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}</Button></form>;
}

