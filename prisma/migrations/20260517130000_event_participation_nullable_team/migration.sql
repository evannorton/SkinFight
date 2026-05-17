-- AlterTable
ALTER TABLE "EventParticipation" ALTER COLUMN "teamId" DROP NOT NULL;

-- DropForeignKey
ALTER TABLE "EventParticipation" DROP CONSTRAINT "EventParticipation_teamId_fkey";

-- AddForeignKey
ALTER TABLE "EventParticipation" ADD CONSTRAINT "EventParticipation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
