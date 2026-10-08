import { describe, it, expect } from "vitest";
import { can, requirePermission, type Actor } from "@/lib/permissions";
import { validateUpload } from "@/modules/files/validation";
describe("server permission policy", () => {
  const requester: Actor = { id: "r", name: "r", role: "REQUESTER", siteId: null };
  it("requester cannot close or administrate", () => { expect(() => requirePermission(requester, "work_order.verify_close")).toThrow(); expect(can("TECHNICIAN", "user.manage")).toBe(false); });
  it("storekeeper handles inventory without maintenance approval", () => { expect(can("STOREKEEPER", "inventory.adjust")).toBe(true); expect(can("STOREKEEPER", "work_order.verify_close")).toBe(false); });
  it("manager is read only", () => { expect(can("MANAGER_VIEWER", "dashboard.read")).toBe(true); expect(can("MANAGER_VIEWER", "inventory.issue_return")).toBe(false); expect(can("MANAGER_VIEWER", "work_request.create")).toBe(false); });
});
describe("upload boundary", () => {
  it("accepts matching PDF and rejects renamed executable", () => { expect(validateUpload("manual.pdf", "application/pdf", Buffer.from("%PDF-test"))).toBe("pdf"); expect(() => validateUpload("manual.pdf", "application/pdf", Buffer.from("MZ123456"))).toThrow(); });
  it("rejects extensions, MIME mismatch, empty and oversized files", () => { expect(() => validateUpload("x.exe", "application/pdf", Buffer.from("%PDF-test"))).toThrow(); expect(() => validateUpload("x.png", "application/pdf", Buffer.from("%PDF-test"))).toThrow(); expect(() => validateUpload("x.pdf", "application/pdf", Buffer.alloc(0))).toThrow(); expect(() => validateUpload("x.pdf", "application/pdf", Buffer.alloc(100), 0.00001)).toThrow(); });
});
