import { mutation,read } from "@/lib/http";
import { savePart,listParts } from "@/modules/inventory/master-service";
export const POST=mutation(savePart);
export function GET(request:Request){return read(actor=>listParts(actor,Object.fromEntries(new URL(request.url).searchParams)));}
