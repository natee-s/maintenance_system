import { mutation,read } from "@/lib/http";
import { createRequest,listRequests } from "@/modules/work-requests/service";
export const POST=mutation(createRequest);
export function GET(request:Request){return read(actor=>listRequests(actor,Object.fromEntries(new URL(request.url).searchParams)));}
