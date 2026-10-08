import { mutation } from "@/lib/http";
import { markRead } from "@/modules/notifications/service";
import { z } from "zod";
export const POST=mutation((actor,input)=>markRead(actor,z.object({id:z.string().min(1)}).parse(input).id));
