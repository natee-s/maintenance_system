import { read,mutation } from "@/lib/http";
import { assetDto,getAsset,saveAsset } from "@/modules/assets/service";
export async function GET(_request: Request,{params}:{params:Promise<{id:string}>}) { const {id}=await params; return read(async actor=>assetDto(actor,await getAsset(actor,id))); }
export async function PATCH(request: Request,{params}:{params:Promise<{id:string}>}) {const {id}=await params;return mutation((actor,data)=>saveAsset(actor,{...(data as object),id}))(request);}
