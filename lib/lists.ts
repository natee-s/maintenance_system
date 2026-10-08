import { z } from "zod";
export type Query = Record<string, string | string[] | undefined>;
export function value(query: Query, key: string) { const item = query[key]; return typeof item === "string" ? item : undefined; }
export function pagination(query: Query) {
  const parse = (key: string, fallback: number, max: number) => { const number = Number(value(query,key) ?? fallback); return Number.isInteger(number) && number >= 1 ? Math.min(number,max) : fallback; };
  const page = parse("page",1,1000000); const pageSize = parse("pageSize",25,100);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}
export const optionalText = z.string().trim().max(2000).optional().transform(value=>value || null);
export const optionalId = z.string().optional().transform(value=>value || null);
export const optionalDate = z.string().optional().transform(value=>value ? new Date(value.length === 16 ? `${value}:00+07:00` : value) : null).refine(value=>!value || !Number.isNaN(value.getTime()), "วันที่ไม่ถูกต้อง");
