import { mutation } from "@/lib/http";
import { saveWarehouse } from "@/modules/inventory/master-service";
export const POST=mutation(saveWarehouse);
