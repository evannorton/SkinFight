-- AlterTable
ALTER TABLE "Event" ADD COLUMN "endDate" TIMESTAMP(3);

-- Backfill: end one hour after start for existing rows
UPDATE "Event" SET "endDate" = "date" + INTERVAL '1 hour' WHERE "endDate" IS NULL;

ALTER TABLE "Event" ALTER COLUMN "endDate" SET NOT NULL;
