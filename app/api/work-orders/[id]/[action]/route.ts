import { mutation } from "@/lib/http";
import { operateWork,workActions } from "@/modules/work-orders/service";
import { z } from "zod";
export async function POST(request:Request,{params}:{params:Promise<{id:string;action:string}>}){const {id,action}=await params;return mutation((actor,data)=>operateWork(actor,id,z.enum(workActions).parse(action),data))(request);}
