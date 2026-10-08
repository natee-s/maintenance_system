import Link from "next/link";
import type { Query } from "@/lib/lists";
export function FilterChips({ base, query, name, options, label }: { base: string; query: Query; name: string; options: { value: string; label: string }[]; label: string }) {
  function href(value: string) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key,value])=>{if(typeof value==="string" && key!=="page" && key!==name)params.set(key,value);});
    if(value)params.set(name,value);
    return `${base}?${params}`;
  }
  return <nav aria-label={label} className="mb-5 flex gap-2 overflow-x-auto pb-1">{[{value:"",label:"ทั้งหมด"},...options].map(option=><Link key={option.value} href={href(option.value)} aria-current={(query[name] ?? "")===option.value ? "page" : undefined} className="chip">{option.label}</Link>)}</nav>;
}
