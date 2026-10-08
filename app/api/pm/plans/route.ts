import { mutation } from "@/lib/http";
import { savePlan } from "@/modules/pm/master-service";
export const POST=mutation(savePlan);
