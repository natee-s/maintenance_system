import type { Role } from "@/generated/prisma/client";
import { invariant } from "@/lib/errors";
export const permissions = ["user.manage", "location.manage", "asset.read", "asset.create", "asset.update", "work_request.create", "work_request.read_all", "work_request.triage", "work_order.create", "work_order.assign", "work_order.start", "work_order.update_execution", "work_order.complete", "work_order.verify_close", "pm.manage", "pm.execute", "inventory.read", "inventory.manage_master", "inventory.reserve", "inventory.issue_return", "inventory.adjust", "dashboard.read"] as const;
export type Permission = typeof permissions[number];
const rolePermissions: Record<Role, readonly Permission[]> = {
  ADMIN: permissions,
  MAINTENANCE_SUPERVISOR: ["asset.read", "asset.create", "asset.update", "work_request.create", "work_request.read_all", "work_request.triage", "work_order.create", "work_order.assign", "work_order.start", "work_order.update_execution", "work_order.complete", "work_order.verify_close", "pm.manage", "pm.execute", "inventory.read", "inventory.reserve", "dashboard.read"],
  TECHNICIAN: ["asset.read", "work_request.create", "work_request.read_all", "work_order.start", "work_order.update_execution", "work_order.complete", "pm.execute", "inventory.read", "dashboard.read"],
  REQUESTER: ["asset.read", "work_request.create"],
  STOREKEEPER: ["asset.read", "inventory.read", "inventory.manage_master", "inventory.reserve", "inventory.issue_return", "inventory.adjust", "dashboard.read"],
  MANAGER_VIEWER: ["asset.read", "work_request.read_all", "inventory.read", "dashboard.read"],
};
export type Actor = { id: string; name: string; role: Role; siteId: string | null };
export function can(role: Role, permission: Permission) { return rolePermissions[role].includes(permission); }
export function requirePermission(actor: Actor, permission: Permission) { invariant(can(actor.role, permission), "ไม่มีสิทธิ์ดำเนินการนี้", 403); }
export function requireAssigned(actor: Actor, assignedToId: string | null) { invariant(actor.role !== "TECHNICIAN" || assignedToId === actor.id, "งานนี้ไม่ได้มอบหมายให้คุณ", 403); }
