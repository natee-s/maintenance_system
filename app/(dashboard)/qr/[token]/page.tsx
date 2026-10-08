import Link from "next/link";
import { pageActor } from "@/lib/auth";
import { qrAsset } from "@/modules/assets/service";
import { can } from "@/lib/permissions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DomainError } from "@/lib/errors";
export default async function QrQuickView({params}:{params:Promise<{token:string}>}) {const actor=await pageActor();let asset;try{asset=await qrAsset(actor,(await params).token);}catch(error){if(!(error instanceof DomainError))throw error;return <section className="panel mx-auto max-w-lg"><h1 className="text-xl font-bold">{error.message}</h1><p className="my-5 text-sm text-slate-500">ตรวจรหัส QR หรือค้นหาเครื่องจักรในทะเบียน</p><Button asChild><Link href="/scan">สแกนอีกครั้ง</Link></Button><Link className="ml-4 text-blue-700 underline" href="/assets">ค้นหาเครื่องจักร</Link></section>;}return <section className="panel mx-auto max-w-lg"><p className="text-sm font-semibold text-orange-600">พบเครื่องจักร</p><h1 className="my-3 text-2xl font-bold">{asset.name}</h1><p className="mb-4 text-slate-500">{asset.assetCode} · {asset.site.name} / {asset.location?.name}</p><Badge value={asset.status} /><div className="mt-7 grid gap-3"><Button asChild variant="secondary"><Link href={`/assets/${asset.id}`}>ดูเครื่องจักร</Link></Button>{can(actor.role,"work_request.create") && <Button asChild><Link href={`/work-requests/new?assetId=${asset.id}`}>แจ้งซ่อม</Link></Button>}</div></section>;}

