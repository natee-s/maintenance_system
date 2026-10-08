import { it,expect } from "vitest";
import { safeRedirect } from "@/lib/auth/redirect";
import { passwordSchema,credentialsSchema } from "@/modules/auth/service";
it("accepts local QR callback and rejects external or malformed redirects",()=>{expect(safeRedirect("/qr/abc?x=1")).toBe("/qr/abc?x=1");for(const x of ["https://evil.example","//evil.example","/\\evil.example","/login",null])expect(safeRedirect(x)).toBe("/");});
it("rejects passwords beyond bcrypt's UTF-8 byte boundary",()=>{expect(passwordSchema.safeParse("a".repeat(72)).success).toBe(true);expect(passwordSchema.safeParse("ก".repeat(25)).success).toBe(false);expect(credentialsSchema.safeParse({login:"admin",password:"a".repeat(73)}).success).toBe(false);});
