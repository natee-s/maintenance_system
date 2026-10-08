import type { Tx } from "@/lib/db";
export function activity(tx:Tx,actorId:string,workOrderId:string,eventType:string,message:string) {return tx.workOrderActivity.create({data:{actorId,workOrderId,eventType,message}});}
