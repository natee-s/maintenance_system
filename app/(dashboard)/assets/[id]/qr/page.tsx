import QRCode from "qrcode";
import Image from "next/image";
import { pageActor } from "@/lib/auth";
import { getAsset } from "@/modules/assets/service";
import { PrintButton } from "@/components/ui/print-button";
export default async function AssetQr({params}:{params:Promise<{id:string}>}) {const asset=await getAsset(await pageActor(),(await params).id);const url=`${process.env.APP_URL ?? "http://localhost:3000"}/qr/${asset.qrToken}`;const image=await QRCode.toDataURL(url,{width:320,margin:2});return <section className="panel mx-auto max-w-md text-center"><h1 className="text-2xl font-bold">{asset.assetCode}</h1><p className="mt-2">{asset.name}</p><p className="text-sm text-slate-500">{asset.site.name} / {asset.location?.name}</p><Image unoptimized src={image} alt={`QR สำหรับ ${asset.assetCode}`} width={320} height={320} className="mx-auto my-4" /><p className="mb-5 text-sm">สแกนเพื่อดูเครื่องจักรและแจ้งซ่อม</p><PrintButton /></section>;}
