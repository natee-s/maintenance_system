import { read } from "@/lib/http";
import { getRequest } from "@/modules/work-requests/service";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;return read(actor=>getRequest(actor,id));}
