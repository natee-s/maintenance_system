import { it,expect } from "vitest";
import { nextDue,inLeadWindow } from "@/modules/pm/recurrence";
import { projectedDates } from "@/modules/pm/projection";
it("projects every planned weekly occurrence inside the selected month",()=>{const dates=projectedDates(new Date("2026-09-01"),"WEEKLY",1,new Date("2026-10-01"),new Date("2026-11-01"));expect(dates.map(x=>x.toISOString().slice(0,10))).toEqual(["2026-10-06","2026-10-13","2026-10-20","2026-10-27"]);});
it("clamps month end and leap year without completion-based drift",()=>{expect(nextDue(new Date("2026-01-31"),"MONTHLY").toISOString().slice(0,10)).toBe("2026-02-28");expect(nextDue(new Date("2024-02-29"),"ANNUAL").toISOString().slice(0,10)).toBe("2025-02-28");expect(nextDue(new Date("2026-01-01"),"QUARTERLY").toISOString().slice(0,10)).toBe("2026-04-01");});
it("supports daily/weekly/custom days and validates interval",()=>{expect(nextDue(new Date("2026-01-01"),"WEEKLY").getUTCDate()).toBe(8);expect(nextDue(new Date("2026-01-01"),"CUSTOM_DAYS",14).getUTCDate()).toBe(15);expect(()=>nextDue(new Date(),"CUSTOM_DAYS",0)).toThrow();expect(inLeadWindow(new Date("2026-11-10"),7,new Date("2026-11-03"))).toBe(true);});
