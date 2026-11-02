-- CreateTable
CREATE TABLE "LiveblocksRoomCleanup" (
    "roomId" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveblocksRoomCleanup_pkey" PRIMARY KEY ("roomId")
);

-- CreateIndex
CREATE INDEX "LiveblocksRoomCleanup_nextAttemptAt_idx" ON "LiveblocksRoomCleanup"("nextAttemptAt");
