import { invariant } from "@/lib/errors";
export function durationMinutes(start:Date,end:Date){invariant(Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end >= start,"เวลาสิ้นสุดต้องไม่ก่อนเวลาเริ่ม");return Math.round((end.getTime()-start.getTime())/600)/100;}
export function overlapMinutes(start:Date,end:Date,from:Date,to:Date){return Math.max(0,(Math.min(end.getTime(),to.getTime())-Math.max(start.getTime(),from.getTime()))/60000);}
