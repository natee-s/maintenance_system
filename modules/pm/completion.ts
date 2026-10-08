import type { Tx } from "@/lib/db";
import { invariant } from "@/lib/errors";
import { validateChecklistItem } from "./checklist-rules";
export async function validatePmCompletion(tx:Tx,id:string){const items=await tx.pmExecutionItem.findMany({where:{workOrderId:id},include:{attachments:{where:{mimeType:{startsWith:"image/"}}}},orderBy:{sequence:"asc"}});invariant(items.length,"PM ไม่มีรายการตรวจสอบ");for(const item of items)validateChecklistItem(item,item.attachments.length > 0);}
