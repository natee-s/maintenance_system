-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('ACTIVE', 'PARTIALLY_ISSUED', 'FULFILLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "PartReservation" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "issuedQuantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "status" "ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PartReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderPartUsage" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "issuedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "returnedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "unitCostSnapshot" DECIMAL(18,2),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "WorkOrderPartUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartReservation_workOrderId_status_idx" ON "PartReservation"("workOrderId", "status");

-- CreateIndex
CREATE INDEX "PartReservation_partId_warehouseId_status_idx" ON "PartReservation"("partId", "warehouseId", "status");

-- CreateIndex
CREATE INDEX "WorkOrderPartUsage_partId_createdAt_idx" ON "WorkOrderPartUsage"("partId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrderPartUsage_workOrderId_partId_warehouseId_key" ON "WorkOrderPartUsage"("workOrderId", "partId", "warehouseId");

-- AddForeignKey
ALTER TABLE "PartReservation" ADD CONSTRAINT "PartReservation_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReservation" ADD CONSTRAINT "PartReservation_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReservation" ADD CONSTRAINT "PartReservation_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartReservation" ADD CONSTRAINT "PartReservation_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderPartUsage" ADD CONSTRAINT "WorkOrderPartUsage_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderPartUsage" ADD CONSTRAINT "WorkOrderPartUsage_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderPartUsage" ADD CONSTRAINT "WorkOrderPartUsage_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PartReservation" ADD CONSTRAINT "reservation_quantity_check" CHECK ("quantity" > 0 AND "issuedQuantity" >= 0 AND "issuedQuantity" <= "quantity");
ALTER TABLE "WorkOrderPartUsage" ADD CONSTRAINT "usage_quantity_check" CHECK ("issuedQty" >= 0 AND "returnedQty" >= 0 AND "returnedQty" <= "issuedQty");
