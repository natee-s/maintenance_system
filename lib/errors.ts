import { ZodError } from "zod";
export class DomainError extends Error {
  constructor(message: string, public readonly status = 400) { super(message); }
}
export function invariant(condition: unknown, message: string, status = 400): asserts condition {
  if (!condition) throw new DomainError(message, status);
}
export function publicError(error: unknown): { message: string; status: number } {
  if (error instanceof DomainError) return { message: error.message, status: error.status };
  if (error instanceof ZodError) return { message: error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "), status: 400 };
  const code = typeof error === "object" && error && "code" in error ? error.code : undefined;
  if (code === "P2002") return { message: "ข้อมูลซ้ำ กรุณาตรวจสอบรหัสหรือรายการที่มีอยู่แล้ว", status: 409 };
  if (code === "P2025") return { message: "ไม่พบข้อมูลที่ต้องการ", status: 404 };
  if (code === "P2003") return { message: "ข้อมูลอ้างอิงไม่ถูกต้องหรือมีประวัติการใช้งาน", status: 400 };
  console.error(JSON.stringify({ event: "request_failed", code: code ?? "unknown", error: error instanceof Error ? error.name : "unknown" }));
  return { message: "ไม่สามารถบันทึกได้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง", status: 500 };
}
