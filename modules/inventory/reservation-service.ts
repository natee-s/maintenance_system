import type { Tx } from "@/lib/db";
import type { Actor } from "@/lib/permissions";
import { audit } from "@/modules/audit/service";
import { activity } from "@/modules/work-orders/activity";
export async function releaseReservations(tx:Tx,actor:Actor,workOrderId:string){const rows=await tx.partReservation.findMany({where:{workOrderId,status:{in:["ACTIVE","PARTIALLY_ISSUED"]}}});for(const row of rows){const remaining=row.quantity.sub(row.issuedQuantity);await tx.stockBalance.update({where:{partId_warehouseId:{partId:row.partId,warehouseId:row.warehouseId}},data:{reservedQty:{decrement:remaining}}});await tx.partReservation.update({where:{id:row.id},data:{status:"CANCELLED"}});await audit(tx,actor.id,"RESERVATION_RELEASE","PartReservation",row.id,row,{status:"CANCELLED"});}if(rows.length)await activity(tx,actor.id,workOrderId,"RESERVATIONS_RELEASED",`คืนยอดจองที่เหลือ ${rows.length} รายการ`);}
