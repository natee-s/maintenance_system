import { mutation } from "@/lib/http";
import { reservePart,issuePart,returnPart,cancelReservation } from "@/modules/inventory/usage-service";
import { invariant } from "@/lib/errors";
import { z } from "zod";
export async function POST(request:Request,{params}:{params:Promise<{id:string;action:string}>}){const {id,action}=await params;return mutation((actor,data)=>{if(action === "reserve")return reservePart(actor,id,data);if(action === "issue")return issuePart(actor,id,data);if(action === "return")return returnPart(actor,id,data);invariant(action === "cancel-reservation","ไม่พบการดำเนินการ",404);return cancelReservation(actor,id,z.object({reservationId:z.string().min(1)}).parse(data).reservationId);})(request);}
