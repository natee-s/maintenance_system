import type { FrequencyType } from "@/generated/prisma/client";
import { nextDue } from "./recurrence";
import { invariant } from "@/lib/errors";
export function projectedDates(next:Date,frequency:FrequencyType,interval:number,from:Date,to:Date){const dates:Date[]=[];let date=new Date(next),steps=0;while(date<to){invariant(steps++<10000,"แผน PM มีรอบค้างมากเกินไป กรุณาตรวจแผนก่อนเปิดปฏิทิน");if(date>=from)dates.push(date);date=nextDue(date,frequency,interval);}return dates;}
