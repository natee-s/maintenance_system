import { mutation } from "@/lib/http";
import { respond } from "@/modules/pm/execution-service";
export async function POST(request:Request,{params}:{params:Promise<{id:string;itemId:string}>}){const {id,itemId}=await params;return mutation((actor,data)=>respond(actor,id,itemId,data))(request);}
