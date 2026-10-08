import { mutation,read } from "@/lib/http";
import { createWork,listWork } from "@/modules/work-orders/service";
export const POST=mutation(createWork);
export function GET(request:Request){return read(actor=>listWork(actor,Object.fromEntries(new URL(request.url).searchParams)));}
