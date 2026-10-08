import { mutation } from "@/lib/http";
import { saveLocation } from "@/modules/locations/service";
export const POST = mutation(saveLocation);
