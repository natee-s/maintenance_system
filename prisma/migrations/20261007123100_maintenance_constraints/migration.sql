ALTER TABLE "Attachment" ADD CONSTRAINT "attachment_one_parent" CHECK (num_nonnulls("assetId","workRequestId","workOrderId") = 1);
ALTER TABLE "Attachment" ADD CONSTRAINT "attachment_positive_size" CHECK ("fileSize" > 0);
ALTER TABLE "DowntimeEvent" ADD CONSTRAINT "downtime_valid_range" CHECK ("endedAt" IS NULL OR "endedAt" >= "startedAt");
ALTER TABLE "DowntimeEvent" ADD CONSTRAINT "downtime_nonnegative_duration" CHECK ("durationMinutes" IS NULL OR "durationMinutes" >= 0);
ALTER TABLE "WorkOrder" ADD CONSTRAINT "work_actual_valid_range" CHECK ("actualEndAt" IS NULL OR ("actualStartAt" IS NOT NULL AND "actualEndAt" >= "actualStartAt"));
ALTER TABLE "WorkOrder" ADD CONSTRAINT "work_planned_valid_range" CHECK ("plannedStartAt" IS NULL OR "dueAt" IS NULL OR "dueAt" >= "plannedStartAt");
