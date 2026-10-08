import { read } from "@/lib/http";
import { dashboard } from "@/modules/dashboard/service";
import { inventoryReport } from "@/modules/inventory/report-service";
export function GET(request:Request){const query=Object.fromEntries(new URL(request.url).searchParams);return read(actor=>actor.role === "STOREKEEPER" ? inventoryReport(actor,query) : dashboard(actor,query));}
