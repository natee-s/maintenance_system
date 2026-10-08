import { read } from "@/lib/http";
import { checklist } from "@/modules/pm/execution-service";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;return read(actor=>checklist(actor,id));}
