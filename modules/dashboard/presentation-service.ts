import { db } from "@/lib/db";
import { requirePermission, type Actor } from "@/lib/permissions";
import { bangkokDay } from "@/lib/dates";
import { value, type Query } from "@/lib/lists";
import { reportRange } from "./service";
export async function dashboardPresentation(actor: Actor, query: Query) {
  requirePermission(actor, "dashboard.read");
  const today = new Date(bangkokDay());
  const asset = { siteId: value(query,"siteId"), areaId: value(query,"areaId"), categoryId: value(query,"categoryId") };
  const assignedToId = actor.role === "TECHNICIAN" ? actor.id : undefined;
  const { from, to } = reportRange(query);
  const [workToday, plansToday, recent] = await Promise.all([
    db.workOrder.findMany({ where: { type: "PREVENTIVE", scheduledDueDate: today, status: { notIn: ["COMPLETED","CLOSED","CANCELLED"] }, assignedToId, asset }, select: { pmPlanId: true } }),
    db.pmPlan.findMany({ where: { isActive: true, nextDueDate: today, assignedToId, template: { isActive: true }, asset: { ...asset, isActive: true } }, select: { id: true, workOrders: { where: { scheduledDueDate: today }, select: { id: true } } } }),
    db.workOrderActivity.findMany({ where: { createdAt: { gte: from, lte: to }, workOrder: { assignedToId, asset } }, include: { actor: { select: { name: true } }, workOrder: { select: { id: true, workOrderCode: true, title: true, status: true, asset: { select: { assetCode: true } } } } }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  return { pmToday: workToday.length + plansToday.filter(plan => plan.workOrders.length === 0).length, recent };
}
