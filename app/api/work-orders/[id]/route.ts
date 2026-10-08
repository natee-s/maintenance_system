import { read } from "@/lib/http";
import { getWork } from "@/modules/work-orders/service";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;return read(actor=>getWork(actor,id));}
