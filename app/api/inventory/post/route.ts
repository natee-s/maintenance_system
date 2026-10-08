import { mutation } from "@/lib/http";
import { postStock } from "@/modules/inventory/stock-service";
export const POST=mutation(postStock);
