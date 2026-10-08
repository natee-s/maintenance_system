"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
type StockOption={partId:string;warehouseId:string;onHand:string;reserved:string;available:string;issueAvailable:string};
export function PartOperationForm({endpoint,title,parts,warehouses,stock}:{endpoint:string;title:string;parts:{id:string;label:string;unit:string;decimal:boolean}[];warehouses:{id:string;name:string}[];stock:StockOption[]}){
 const [partId,setPartId]=useState(""),[warehouseId,setWarehouseId]=useState(""),[quantity,setQuantity]=useState(""),[message,setMessage]=useState(""),[pending,setPending]=useState(false),router=useRouter();
 const part=parts.find(x=>x.id === partId),balance=stock.find(x=>x.partId === partId && x.warehouseId === warehouseId),issue=endpoint.endsWith("/issue"),limit=issue ? balance?.issueAvailable ?? "0" : balance?.available ?? "0";
 const valid=Number(quantity)>0 && Number(quantity)<=Number(limit) && /^\d+(\.\d{1,4})?$/.test(quantity) && (part?.decimal || Number.isInteger(Number(quantity)));
 return <form className="space-y-4 rounded-xl border border-slate-200 p-4" onSubmit={async event=>{event.preventDefault();if(!valid)return;setPending(true);setMessage("");try{const response=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({partId,warehouseId,quantity})}),data=await response.json();setMessage(response.ok ? "บันทึกเรียบร้อยแล้ว" : data.error);if(response.ok){setQuantity("");router.refresh();}}catch{setMessage("เชื่อมต่อไม่ได้ กรุณาลองใหม่");}finally{setPending(false);}}}>
 <h3 className="font-bold">{title}</h3><label>อะไหล่<select aria-label="อะไหล่" required value={partId} onChange={event=>setPartId(event.target.value)}><option value="">เลือกอะไหล่</option>{parts.map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label><label>คลัง<select aria-label="คลัง" required value={warehouseId} onChange={event=>setWarehouseId(event.target.value)}><option value="">เลือกคลัง</option>{warehouses.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
 {partId && warehouseId && <p className="rounded-xl bg-blue-50 p-3 text-sm" aria-live="polite">คงเหลือ {balance?.onHand ?? "0"} · จองรวม {balance?.reserved ?? "0"} · พร้อมใช้ {balance?.available ?? "0"} {part?.unit}{issue && <> · เบิกให้ใบงานนี้ได้ {limit} (รวมยอดจองของใบงานนี้)</>}</p>}
 <label>จำนวน<input aria-label="จำนวน" required type="number" min="0" step={part?.decimal ? "0.0001" : "1"} value={quantity} onChange={event=>setQuantity(event.target.value)}/></label>{quantity && !valid && <p className="text-sm text-red-700">ตรวจหน่วยและจำนวน ต้องไม่เกินยอดที่ทำรายการได้ {limit}</p>}
 <Button disabled={pending || !valid}>{pending ? "กำลังบันทึก…" : title}</Button>{message && <p role="alert" className="rounded-xl bg-slate-50 p-3 text-sm">{message}</p>}
 </form>;
}

