import { it,expect } from "vitest";
import { Prisma } from "@/generated/prisma/client";
import { quantitySchema,available,positive,validateIssue,validateReturn,lowStock } from "@/modules/inventory/rules";
const d=(value:string)=>new Prisma.Decimal(value);
it("uses decimal-safe availability and low-stock threshold",()=>{expect(available(d("0.3"),d("0.1")).toString()).toBe("0.2");expect(lowStock(d("3"),d("1"),d("2"))).toBe(true);expect(lowStock(d("3"),d("0"),d("2"))).toBe(false);});
it("blocks excess issue/return and invalid precision/unit quantities",()=>{expect(()=>validateIssue(d("2"),d("1"))).toThrow();expect(()=>validateReturn(d("2"),d("1"))).toThrow();expect(()=>positive(d("0.5"),false)).toThrow();expect(()=>positive(d("0"))).toThrow();expect(()=>quantitySchema.parse("-1")).toThrow();expect(()=>quantitySchema.parse("0.00001")).toThrow();});
