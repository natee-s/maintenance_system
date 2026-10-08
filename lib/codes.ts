import type { Tx } from "@/lib/db";
export async function nextCode(tx: Tx, prefix: "AST" | "WR" | "WO" | "PM" | "PRT" | "PMT" | "ST") {
  const year = new Intl.DateTimeFormat("en", { timeZone: "Asia/Bangkok", year: "numeric" }).format(new Date());
  const key = ["WR", "WO", "ST"].includes(prefix) ? `${prefix}-${year}` : prefix;
  const counter = await tx.businessCounter.upsert({ where: { key }, create: { key, value: 1 }, update: { value: { increment: 1 } } });
  return `${key}-${String(counter.value).padStart(6, "0")}`;
}
