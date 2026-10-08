-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "partId" TEXT;

-- CreateIndex
CREATE INDEX "Attachment_partId_idx" ON "Attachment"("partId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Attachment" DROP CONSTRAINT "attachment_one_parent";
ALTER TABLE "Attachment" ADD CONSTRAINT "attachment_one_parent" CHECK (num_nonnulls("assetId","workRequestId","workOrderId","partId") = 1);
ALTER TABLE "Part" ADD CONSTRAINT "part_nonnegative_reference" CHECK ("minStock" >= 0 AND "reorderPoint" >= 0 AND ("unitCostReference" IS NULL OR "unitCostReference" >= 0));
