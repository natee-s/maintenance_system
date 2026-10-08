import { mutation } from "@/lib/http";
import { saveDowntime } from "@/modules/downtime/service";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;return mutation((actor,data)=>saveDowntime(actor,id,data))(request);}
