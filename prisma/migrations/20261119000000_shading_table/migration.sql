-- CreateTable
CREATE TABLE "Shading" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "pointValue" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Shading_sortOrder_idx" ON "Shading"("sortOrder");

-- Seed legacy A/B/C shading values
INSERT INTO "Shading" ("id", "label", "pointValue", "sortOrder", "createdAt", "updatedAt") VALUES
('shading_legacy_one', 'A', 5, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('shading_legacy_two', 'B', 15, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('shading_legacy_three', 'C', 25, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable Attack
ALTER TABLE "Attack" ADD COLUMN "shadingId" TEXT;

UPDATE "Attack" SET "shadingId" = 'shading_legacy_one' WHERE "shading" = 'ONE';
UPDATE "Attack" SET "shadingId" = 'shading_legacy_two' WHERE "shading" = 'TWO';
UPDATE "Attack" SET "shadingId" = 'shading_legacy_three' WHERE "shading" = 'THREE';

ALTER TABLE "Attack" ALTER COLUMN "shadingId" SET NOT NULL;
ALTER TABLE "Attack" DROP COLUMN "shading";

-- AlterTable Defend
ALTER TABLE "Defend" ADD COLUMN "shadingId" TEXT;

UPDATE "Defend" SET "shadingId" = 'shading_legacy_one' WHERE "shading" = 'ONE';
UPDATE "Defend" SET "shadingId" = 'shading_legacy_two' WHERE "shading" = 'TWO';
UPDATE "Defend" SET "shadingId" = 'shading_legacy_three' WHERE "shading" = 'THREE';

ALTER TABLE "Defend" ALTER COLUMN "shadingId" SET NOT NULL;
ALTER TABLE "Defend" DROP COLUMN "shading";

-- AddForeignKey
ALTER TABLE "Attack" ADD CONSTRAINT "Attack_shadingId_fkey" FOREIGN KEY ("shadingId") REFERENCES "Shading"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Defend" ADD CONSTRAINT "Defend_shadingId_fkey" FOREIGN KEY ("shadingId") REFERENCES "Shading"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Attack_shadingId_idx" ON "Attack"("shadingId");

-- CreateIndex
CREATE INDEX "Defend_shadingId_idx" ON "Defend"("shadingId");

-- DropEnum
DROP TYPE "AttackDefendShading";
