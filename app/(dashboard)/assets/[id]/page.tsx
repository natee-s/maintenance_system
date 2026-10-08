import Link from "next/link";
import Image from "next/image";
import { Factory, MapPin, CalendarDays, Hash } from "lucide-react";
import { db } from "@/lib/db";
import { pageActor } from "@/lib/auth";
import { getAsset } from "@/modules/assets/service";
import { can } from "@/lib/permissions";
import { locationOptions } from "@/modules/locations/service";
import { assetFields } from "@/modules/assets/fields";
import { RecordForm } from "@/components/forms/record-form";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate,dateInput } from "@/lib/dates";
import { Attachments } from "@/components/maintenance/attachments";
export default async function AssetDetail({params}:{params:Promise<{id:string}>}) {
  const actor=await pageActor();const asset=await getAsset(actor,(await params).id);
  const image=actor.role==="REQUESTER" ? null : await db.attachment.findFirst({where:{assetId:asset.id,mimeType:{startsWith:"image/"}},orderBy:{createdAt:"desc"},select:{storageKey:true}});
  return <><PageHeader title={asset.name} description={`${asset.assetCode} · ${asset.site.organization.name} / ${asset.site.name} / ${asset.area?.name ?? ""} / ${asset.location?.name ?? ""}`}><Badge value={asset.status} /><Button asChild variant="outline"><Link href={`/assets/${asset.id}/qr`}>QR / พิมพ์</Link></Button>{can(actor.role,"work_request.create") && asset.isActive && <Button asChild><Link href={`/work-requests/new?assetId=${asset.id}`}>แจ้งซ่อม</Link></Button>}</PageHeader>
  <section className="panel mb-5 flex flex-col gap-5 sm:flex-row"><div className="flex aspect-square w-full max-w-40 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">{image ? <Image unoptimized src={`/api/files/${image.storageKey}`} alt={asset.name} width={160} height={160} className="size-full object-cover"/> : <Factory size={64} className="text-slate-400" strokeWidth={1}/>}</div><div className="flex-1"><p className="text-xs font-semibold tracking-wider text-brand-dark">{asset.assetCode}</p><h2 className="mt-2 text-xl font-bold">{asset.name}</h2><p className="mt-1 text-sm text-slate-500">{asset.category.name}</p><div className="mt-3"><Badge value={asset.status}/></div><p className="mt-4 flex items-center gap-2 text-sm text-slate-600"><MapPin size={16}/>{asset.site.name} · {asset.location?.name ?? asset.area?.name ?? "—"}</p>{actor.role!=="REQUESTER" && <><p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={15}/>ติดตั้ง {formatDate(asset.installDate)}</p><p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><Hash size={15}/>{asset.serialNumber ?? "ไม่ระบุ Serial"}</p></>}</div></section>
  {actor.role !== "REQUESTER" && <><nav aria-label="ข้อมูลเครื่องจักร" className="mb-5 flex gap-2 overflow-x-auto pb-1"><a className="chip" aria-current="page" href="#asset-overview">ข้อมูลทั่วไป</a><Link className="chip" href={`/assets/${asset.id}/history`}>ประวัติเครื่องจักร</Link>{actor.role !== "STOREKEEPER" && <Link className="chip" href={`/pm?assetId=${asset.id}`}>แผน PM</Link>}<Link className="chip" href={`/inventory/usage?assetId=${asset.id}`}>อะไหล่ที่ใช้</Link><a className="chip" href="#asset-files">รูปภาพ / เอกสาร</a></nav><div id="asset-overview" className="panel grid scroll-mt-24 gap-5 sm:grid-cols-4">{[["ผู้ผลิต / รุ่น",`${asset.manufacturer ?? "—"} / ${asset.model ?? "—"}`],["Serial",asset.serialNumber ?? "—"],["วันที่ติดตั้ง",formatDate(asset.installDate)],["ความสำคัญ",asset.criticality]].map(([label,text])=><div key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-2 font-semibold">{text}</p></div>)}<p className="col-span-full text-sm leading-relaxed text-slate-600">{asset.description}</p></div></>}
  {can(actor.role,"asset.update") && <details className="mt-6"><summary className="cursor-pointer font-semibold text-blue-800">แก้ไขทะเบียน / ปิดใช้งาน</summary><div className="mt-4"><RecordForm endpoint="/api/assets" fields={assetFields(await locationOptions())} initial={{...asset,installDate:dateInput(asset.installDate)}} /></div></details>}
  {actor.role !== "REQUESTER" && <div id="asset-files" className="scroll-mt-24"><Attachments actor={actor} entity="asset" id={asset.id} editable={can(actor.role,"asset.update")} /></div>}
  </>;
}

