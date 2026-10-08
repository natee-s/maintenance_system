import { mutation, read } from "@/lib/http";
import { saveUser, listUsers } from "@/modules/users/service";
export const POST = mutation(saveUser);
export function GET() { return read(listUsers); }
