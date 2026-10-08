-- CreateEnum
CREATE TYPE "StockTransactionType" AS ENUM ('INITIAL', 'RECEIPT_MANUAL', 'ISSUE', 'RETURN', 'ADJUST_IN', 'ADJUST_OUT');

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL,
    "partCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "uomId" TEXT NOT NULL,
    "description" TEXT,
    "manufacturer" TEXT,
    "manufacturerPartNo" TEXT,
    "minStock" DECIMAL(18,4) NOT NULL,
    "reorderPoint" DECIMAL(18,4) NOT NULL,
    "unitCostReference" DECIMAL(18,2),
    "isCritical" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockBalance" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "onHandQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "reservedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "binText" TEXT,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "StockBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockTransaction" (
    "id" TEXT NOT NULL,
    "transactionCode" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "type" "StockTransactionType" NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "workOrderId" TEXT,
    "referenceText" TEXT,
    "reason" TEXT,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Part_partCode_key" ON "Part"("partCode");

-- CreateIndex
CREATE INDEX "Part_name_idx" ON "Part"("name");

-- CreateIndex
CREATE INDEX "Part_categoryId_isActive_idx" ON "Part"("categoryId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_siteId_code_key" ON "Warehouse"("siteId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "StockBalance_partId_warehouseId_key" ON "StockBalance"("partId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "StockTransaction_transactionCode_key" ON "StockTransaction"("transactionCode");

-- CreateIndex
CREATE INDEX "StockTransaction_partId_warehouseId_createdAt_idx" ON "StockTransaction"("partId", "warehouseId", "createdAt");

-- CreateIndex
CREATE INDEX "StockTransaction_workOrderId_partId_idx" ON "StockTransaction"("workOrderId", "partId");

-- CreateIndex
CREATE INDEX "StockTransaction_type_createdAt_idx" ON "StockTransaction"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MasterData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "MasterData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBalance" ADD CONSTRAINT "StockBalance_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockBalance" ADD CONSTRAINT "StockBalance_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
