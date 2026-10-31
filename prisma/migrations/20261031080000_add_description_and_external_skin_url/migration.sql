-- AlterTable
ALTER TABLE "Character" ADD COLUMN "description" TEXT,
ADD COLUMN "externalSkinUrl" TEXT;

-- AlterTable
ALTER TABLE "Attack" ADD COLUMN "description" TEXT,
ADD COLUMN "externalSkinUrl" TEXT;

-- AlterTable
ALTER TABLE "Defend" ADD COLUMN "description" TEXT,
ADD COLUMN "externalSkinUrl" TEXT;
