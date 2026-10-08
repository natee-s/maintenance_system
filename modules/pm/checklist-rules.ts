import { invariant } from "@/lib/errors";
import type { PmExecutionItem } from "@/generated/prisma/client";
export function answered(item:PmExecutionItem){switch(item.itemType){case "CHECK":return item.responseBoolean !== null;case "TEXT":return Boolean(item.responseText?.trim());case "NUMBER":return item.responseNumber !== null;case "PASS_FAIL":return item.passFailResult !== null;}}
export function validateChecklistItem(item:PmExecutionItem,hasPhoto:boolean,completing=true){
  if(completing && item.required)invariant(answered(item),`กรุณาตอบข้อ ${item.sequence}: ${item.titleSnapshot}`);
  if(item.responseNumber !== null){invariant(Number.isFinite(item.responseNumber),"ค่าที่อ่านต้องเป็นตัวเลข");if(item.minValue !== null)invariant(item.responseNumber >= item.minValue,`ข้อ ${item.sequence}: ค่าต่ำกว่าขั้นต่ำ ${item.minValue}`);if(item.maxValue !== null)invariant(item.responseNumber <= item.maxValue,`ข้อ ${item.sequence}: ค่าสูงกว่าเพดาน ${item.maxValue}`);}
  const failed=item.passFailResult === "FAIL" || (item.itemType === "CHECK" && item.responseBoolean === false);
  if(completing && failed){if(item.requiresNoteOnFail)invariant(item.note?.trim(),`ข้อ ${item.sequence}: FAIL ต้องมีบันทึก`);if(item.requiresPhotoOnFail)invariant(hasPhoto,`ข้อ ${item.sequence}: FAIL ต้องมีรูปภาพ`);}
}
