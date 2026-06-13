-- CreateEnum
CREATE TYPE "AttackDefendShading" AS ENUM ('ONE', 'TWO', 'THREE');

-- AlterTable
ALTER TABLE "Attack" ADD COLUMN "shading" "AttackDefendShading";

UPDATE "Attack" SET "shading" = 'ONE' WHERE "shading" IS NULL;

ALTER TABLE "Attack" ALTER COLUMN "shading" SET NOT NULL;

-- AlterTable
ALTER TABLE "Defend" ADD COLUMN "shading" "AttackDefendShading";

UPDATE "Defend" SET "shading" = 'ONE' WHERE "shading" IS NULL;

ALTER TABLE "Defend" ALTER COLUMN "shading" SET NOT NULL;
