-- CreateTable
CREATE TABLE "DowntimeEvent" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL,
    "endedAt" TIMESTAMPTZ(3),
    "durationMinutes" DECIMAL(14,2),
    "reason" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DowntimeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DowntimeEvent_workOrderId_key" ON "DowntimeEvent"("workOrderId");

-- CreateIndex
CREATE INDEX "DowntimeEvent_assetId_startedAt_idx" ON "DowntimeEvent"("assetId", "startedAt");

-- CreateIndex
CREATE INDEX "DowntimeEvent_endedAt_idx" ON "DowntimeEvent"("endedAt");

-- AddForeignKey
ALTER TABLE "DowntimeEvent" ADD CONSTRAINT "DowntimeEvent_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DowntimeEvent" ADD CONSTRAINT "DowntimeEvent_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DowntimeEvent" ADD CONSTRAINT "DowntimeEvent_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
