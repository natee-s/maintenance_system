"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { safeRedirect } from "@/lib/auth/redirect";
export async function loginAction(_previous: string, form: FormData): Promise<string> {
  try { await signIn("credentials", { login: form.get("login"), password: form.get("password"), redirectTo: safeRedirect(form.get("callbackUrl")) }); }
  catch (error) { if (error instanceof AuthError) return "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง หรือบัญชีไม่พร้อมใช้งาน"; throw error; }
  return "";
}
