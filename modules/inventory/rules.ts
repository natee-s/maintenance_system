import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { invariant } from "@/lib/errors";
export const quantitySchema=z.union([z.string(),z.number()]).transform(value=>String(value)).refine(value=>/^\d{1,14}(\.\d{1,4})?$/.test(value),"จำนวนต้องไม่ติดลบและมีทศนิยมไม่เกิน 4 ตำแหน่ง").transform(value=>new Prisma.Decimal(value));
export function available(onHand:Prisma.Decimal,reserved:Prisma.Decimal){return onHand.sub(reserved);}
export function positive(quantity:Prisma.Decimal,allowsDecimal=true){invariant(quantity.gt(0),"จำนวนต้องมากกว่า 0");invariant(allowsDecimal || quantity.isInteger(),"หน่วยนี้ไม่รองรับทศนิยม");}
export function validateIssue(quantity:Prisma.Decimal,stock:Prisma.Decimal){invariant(quantity.lte(stock),`เบิกไม่ได้ คงเหลือพร้อมใช้ ${stock.toString()} แต่ต้องการ ${quantity.toString()}`);}
export function validateReturn(quantity:Prisma.Decimal,netIssued:Prisma.Decimal){invariant(quantity.lte(netIssued),`คืนไม่ได้ ยอดค้างเบิกเหลือ ${netIssued.toString()}`);}
export function lowStock(onHand:Prisma.Decimal,reserved:Prisma.Decimal,reorder:Prisma.Decimal){return available(onHand,reserved).lte(reorder);}
