import { describe,it,expect } from "vitest";
import { durationMinutes,overlapMinutes } from "@/modules/downtime/rules";
describe("downtime time boundaries",()=>{it("calculates on server and rejects inverted times",()=>{expect(durationMinutes(new Date("2026-01-01T00:00Z"),new Date("2026-01-01T01:30Z"))).toBe(90);expect(()=>durationMinutes(new Date(1000),new Date(0))).toThrow();});it("clips to reporting period",()=>{expect(overlapMinutes(new Date("2026-01-01T00:00Z"),new Date("2026-01-03T00:00Z"),new Date("2026-01-02T00:00Z"),new Date("2026-01-03T00:00Z"))).toBe(1440);});});
