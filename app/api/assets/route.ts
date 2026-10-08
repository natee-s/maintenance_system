import { mutation,read } from "@/lib/http";
import { listAssets,saveAsset,assetDto } from "@/modules/assets/service";
export const POST = mutation(saveAsset);
export function GET(request: Request) { return read(async actor=>{const data=await listAssets(actor,Object.fromEntries(new URL(request.url).searchParams));return {...data,rows:data.rows.map(asset=>assetDto(actor,asset))};}); }
