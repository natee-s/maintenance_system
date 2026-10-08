-- CreateEnum
CREATE TYPE "FrequencyType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'CUSTOM_DAYS');

-- CreateEnum
CREATE TYPE "ChecklistType" AS ENUM ('CHECK', 'TEXT', 'NUMBER', 'PASS_FAIL');

-- CreateTable
CREATE TABLE "PmTemplate" (
    "id" TEXT NOT NULL,
    "templateCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "estimatedDurationMinutes" INTEGER,
    "safetyNote" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PmTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PmTemplateItem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "instruction" TEXT,
    "itemType" "ChecklistType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "unit" TEXT,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "requiresNoteOnFail" BOOLEAN NOT NULL DEFAULT false,
    "requiresPhotoOnFail" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PmTemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PmPlan" (
    "id" TEXT NOT NULL,
    "pmPlanCode" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequencyType" "FrequencyType" NOT NULL,
    "intervalValue" INTEGER NOT NULL DEFAULT 1,
    "startDate" DATE NOT NULL,
    "nextDueDate" DATE NOT NULL,
    "leadDays" INTEGER NOT NULL DEFAULT 0,
    "assignedTeamId" TEXT,
    "assignedToId" TEXT,
    "estimatedDurationMinutes" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastGeneratedAt" TIMESTAMPTZ(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PmPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PmTemplate_templateCode_key" ON "PmTemplate"("templateCode");

-- CreateIndex
CREATE UNIQUE INDEX "PmTemplateItem_templateId_sequence_key" ON "PmTemplateItem"("templateId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "PmPlan_pmPlanCode_key" ON "PmPlan"("pmPlanCode");

-- CreateIndex
CREATE INDEX "PmPlan_isActive_nextDueDate_idx" ON "PmPlan"("isActive", "nextDueDate");

-- CreateIndex
CREATE INDEX "PmPlan_assetId_idx" ON "PmPlan"("assetId");

-- AddForeignKey
ALTER TABLE "PmTemplate" ADD CONSTRAINT "PmTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MasterData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmTemplate" ADD CONSTRAINT "PmTemplate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmTemplateItem" ADD CONSTRAINT "PmTemplateItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PmTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmPlan" ADD CONSTRAINT "PmPlan_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmPlan" ADD CONSTRAINT "PmPlan_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "PmTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmPlan" ADD CONSTRAINT "PmPlan_assignedTeamId_fkey" FOREIGN KEY ("assignedTeamId") REFERENCES "MasterData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmPlan" ADD CONSTRAINT "PmPlan_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PmPlan" ADD CONSTRAINT "PmPlan_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
