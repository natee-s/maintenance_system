import { mutation } from "@/lib/http";
import { generateDue } from "@/modules/pm/generation-service";
import { z } from "zod";
export const POST=mutation((actor,data)=>generateDue(actor,z.object({planId:z.string().optional()}).parse(data).planId));
