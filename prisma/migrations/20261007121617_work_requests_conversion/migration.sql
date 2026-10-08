-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "WorkRequestStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CONVERTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkOrderType" AS ENUM ('CORRECTIVE', 'PREVENTIVE');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PAUSED', 'WAITING_PART', 'COMPLETED', 'CLOSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "WorkRequest" (
    "id" TEXT NOT NULL,
    "requestCode" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problemDescription" TEXT NOT NULL,
    "priorityRequested" "Priority" NOT NULL,
    "priorityApproved" "Priority",
    "reportedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "failureObservedAt" TIMESTAMPTZ(3),
    "machineStopped" BOOLEAN NOT NULL DEFAULT false,
    "status" "WorkRequestStatus" NOT NULL DEFAULT 'OPEN',
    "reporterId" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMPTZ(3),
    "rejectionReason" TEXT,
    "internalNote" TEXT,
    "convertedWorkOrderId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WorkRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "workOrderCode" TEXT NOT NULL,
    "type" "WorkOrderType" NOT NULL DEFAULT 'CORRECTIVE',
    "assetId" TEXT NOT NULL,
    "sourceWorkRequestId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'OPEN',
    "assignedToId" TEXT,
    "plannedStartAt" TIMESTAMPTZ(3),
    "dueAt" TIMESTAMPTZ(3),
    "actualStartAt" TIMESTAMPTZ(3),
    "actualEndAt" TIMESTAMPTZ(3),
    "failureObservedAt" TIMESTAMPTZ(3),
    "failureCategoryId" TEXT,
    "findings" TEXT,
    "causeText" TEXT,
    "actionTaken" TEXT,
    "completionNote" TEXT,
    "createdBy" TEXT NOT NULL,
    "closedBy" TEXT,
    "closedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderActivity" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkRequest_requestCode_key" ON "WorkRequest"("requestCode");

-- CreateIndex
CREATE UNIQUE INDEX "WorkRequest_convertedWorkOrderId_key" ON "WorkRequest"("convertedWorkOrderId");

-- CreateIndex
CREATE INDEX "WorkRequest_assetId_reportedAt_idx" ON "WorkRequest"("assetId", "reportedAt");

-- CreateIndex
CREATE INDEX "WorkRequest_status_reportedAt_idx" ON "WorkRequest"("status", "reportedAt");

-- CreateIndex
CREATE INDEX "WorkRequest_reporterId_reportedAt_idx" ON "WorkRequest"("reporterId", "reportedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_workOrderCode_key" ON "WorkOrder"("workOrderCode");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_sourceWorkRequestId_key" ON "WorkOrder"("sourceWorkRequestId");

-- CreateIndex
CREATE INDEX "WorkOrder_assetId_createdAt_idx" ON "WorkOrder"("assetId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkOrder_status_dueAt_idx" ON "WorkOrder"("status", "dueAt");

-- CreateIndex
CREATE INDEX "WorkOrder_assignedToId_status_idx" ON "WorkOrder"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "WorkOrder_type_createdAt_idx" ON "WorkOrder"("type", "createdAt");

-- CreateIndex
CREATE INDEX "WorkOrderActivity_workOrderId_createdAt_idx" ON "WorkOrderActivity"("workOrderId", "createdAt");

-- AddForeignKey
ALTER TABLE "WorkRequest" ADD CONSTRAINT "WorkRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkRequest" ADD CONSTRAINT "WorkRequest_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkRequest" ADD CONSTRAINT "WorkRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkRequest" ADD CONSTRAINT "WorkRequest_convertedWorkOrderId_fkey" FOREIGN KEY ("convertedWorkOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_sourceWorkRequestId_fkey" FOREIGN KEY ("sourceWorkRequestId") REFERENCES "WorkRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_failureCategoryId_fkey" FOREIGN KEY ("failureCategoryId") REFERENCES "MasterData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderActivity" ADD CONSTRAINT "WorkOrderActivity_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderActivity" ADD CONSTRAINT "WorkOrderActivity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
