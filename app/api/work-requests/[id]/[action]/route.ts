import { mutation } from "@/lib/http";
import { reviewRequest,convertRequest } from "@/modules/work-requests/service";
import { invariant } from "@/lib/errors";
export async function POST(request:Request,{params}:{params:Promise<{id:string;action:string}>}){const {id,action}=await params;return mutation((actor,data)=>{invariant(["review","convert-to-work-order"].includes(action),"ไม่พบการดำเนินการ",404);return action === "review" ? reviewRequest(actor,id,data) : convertRequest(actor,id);})(request);}
