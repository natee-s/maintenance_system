-- CreateEnum
CREATE TYPE "PassFail" AS ENUM ('PASS', 'FAIL');

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "executionItemId" TEXT;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "pmPlanId" TEXT,
ADD COLUMN     "safetyNoteSnapshot" TEXT,
ADD COLUMN     "scheduledDueDate" DATE;

-- CreateTable
CREATE TABLE "PmExecutionItem" (
    "id" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "sourceItemId" TEXT,
    "sequence" INTEGER NOT NULL,
    "titleSnapshot" TEXT NOT NULL,
    "instructionSnapshot" TEXT,
    "itemType" "ChecklistType" NOT NULL,
    "required" BOOLEAN NOT NULL,
    "unit" TEXT,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "requiresNoteOnFail" BOOLEAN NOT NULL,
    "requiresPhotoOnFail" BOOLEAN NOT NULL,
    "responseBoolean" BOOLEAN,
    "responseText" TEXT,
    "responseNumber" DOUBLE PRECISION,
    "passFailResult" "PassFail",
    "note" TEXT,
    "completedBy" TEXT,
    "completedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PmExecutionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PmExecutionItem_workOrderId_sequence_key" ON "PmExecutionItem"("workOrderId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "WorkOrder_pmPlanId_scheduledDueDate_key" ON "WorkOrder"("pmPlanId", "scheduledDueDate");

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_pmPlanId_fkey" FOREIGN KEY ("pmPlanId") REFERENCES "PmPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_executionItemId_fkey" FOREIGN KEY ("executionItemId") REFERENCES "PmExecutionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmExecutionItem" ADD CONSTRAINT "PmExecutionItem_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmExecutionItem" ADD CONSTRAINT "PmExecutionItem_sourceItemId_fkey" FOREIGN KEY ("sourceItemId") REFERENCES "PmTemplateItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmExecutionItem" ADD CONSTRAINT "PmExecutionItem_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
