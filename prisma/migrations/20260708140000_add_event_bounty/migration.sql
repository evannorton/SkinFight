-- CreateTable
CREATE TABLE "EventBounty" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventBounty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventBounty_eventId_idx" ON "EventBounty"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventBounty_eventId_userId_key" ON "EventBounty"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "EventBounty" ADD CONSTRAINT "EventBounty_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventBounty" ADD CONSTRAINT "EventBounty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
