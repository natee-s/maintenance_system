import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Field } from "./record-form";
import type { Query } from "@/lib/lists";
export function Filters({ fields, query, compact = fields.length > 4 }: { fields: Field[]; query: Query; compact?: boolean }) {
  function control(field: Field) {
    return <label key={field.name} className="min-w-0 flex-1 text-slate-600">{field.label}{field.type==="select" ? <select name={field.name} defaultValue={typeof query[field.name]==="string" ? query[field.name] : ""}><option value="">ทั้งหมด</option>{field.options?.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input name={field.name} type={field.type ?? "text"} placeholder={field.name==="search" ? "ค้นหารหัส ชื่อ หรือรายละเอียด…" : undefined} defaultValue={typeof query[field.name]==="string" ? query[field.name] : ""}/>}</label>;
  }
  const search=fields.find(field=>field.name==="search");
  const advanced=fields.filter(field=>field!==search);
  const active=advanced.filter(field=>typeof query[field.name]==="string" && query[field.name]).length;
  return <form className="mb-5">{compact ? <div className="panel space-y-4">{search && <div className="flex items-end gap-3">{control(search)}<Button variant="secondary" aria-label="ค้นหา"><Search size={19}/><span className="hidden sm:inline">ค้นหา</span></Button></div>}<details><summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"><SlidersHorizontal size={17}/>ตัวกรอง{active>0 && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-brand-dark">{active}</span>}<span className="ml-auto text-xs font-normal text-slate-500">กดเพื่อเลือกเงื่อนไข</span></summary><div className="field-grid pt-4">{advanced.map(control)}</div><Button className="mt-4" variant="secondary">ค้นหา / กรอง</Button></details></div> : <div className="panel flex flex-wrap items-end gap-3">{fields.map(field=><div className="min-w-36 flex-1" key={field.name}>{control(field)}</div>)}<Button variant="secondary"><Search size={17}/>ค้นหา / กรอง</Button></div>}</form>;
}
