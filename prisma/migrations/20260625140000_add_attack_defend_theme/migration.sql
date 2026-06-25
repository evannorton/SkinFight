-- AlterTable
ALTER TABLE "Attack" ADD COLUMN "themeId" TEXT;

-- AlterTable
ALTER TABLE "Defend" ADD COLUMN "themeId" TEXT;

-- CreateIndex
CREATE INDEX "Attack_themeId_idx" ON "Attack"("themeId");

-- CreateIndex
CREATE INDEX "Defend_themeId_idx" ON "Defend"("themeId");

-- AddForeignKey
ALTER TABLE "Attack" ADD CONSTRAINT "Attack_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Defend" ADD CONSTRAINT "Defend_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE SET NULL ON UPDATE CASCADE;
