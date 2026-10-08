-- CreateEnum
CREATE TYPE "MasterKind" AS ENUM ('ASSET_CATEGORY', 'ASSET_CRITICALITY', 'WORK_PRIORITY', 'FAILURE_CATEGORY', 'WORK_TYPE', 'PART_CATEGORY', 'UOM', 'TEAM');

-- CreateTable
CREATE TABLE "MasterData" (
    "id" TEXT NOT NULL,
    "kind" "MasterKind" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "allowsDecimal" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MasterData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MasterData_kind_isActive_idx" ON "MasterData"("kind", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MasterData_kind_code_key" ON "MasterData"("kind", "code");
