import type { WorkOrderStatus } from "@/generated/prisma/client";
import { invariant } from "@/lib/errors";
export const transitions:Record<WorkOrderStatus,readonly WorkOrderStatus[]>={OPEN:["ASSIGNED","CANCELLED"],ASSIGNED:["IN_PROGRESS","OPEN","CANCELLED"],IN_PROGRESS:["PAUSED","WAITING_PART","COMPLETED"],PAUSED:["IN_PROGRESS","CANCELLED"],WAITING_PART:["IN_PROGRESS","CANCELLED"],COMPLETED:["IN_PROGRESS","CLOSED"],CLOSED:[],CANCELLED:[]};
export function validateTransition(from:WorkOrderStatus,to:WorkOrderStatus){invariant(transitions[from].includes(to),`ไม่สามารถเปลี่ยนสถานะ ${from} เป็น ${to}`);}
export function requireEditable(status:WorkOrderStatus){invariant(!["COMPLETED","CLOSED","CANCELLED"].includes(status),"งานเสร็จสิ้นแล้ว ไม่สามารถแก้ไขการปฏิบัติงานได้");}
