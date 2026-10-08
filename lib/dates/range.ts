import { z } from "zod";
import { invariant } from "@/lib/errors";
import { value,type Query } from "@/lib/lists";
export function dateFilter(query:Query){const from=value(query,"dateFrom"),to=value(query,"dateTo");if(from)z.iso.date().parse(from);if(to)z.iso.date().parse(to);invariant(!from || !to || from <= to,"ช่วงวันที่ไม่ถูกต้อง");return {...(from ? {gte:new Date(`${from}T00:00:00+07:00`)} : {}),...(to ? {lte:new Date(`${to}T23:59:59.999+07:00`)} : {})};}
