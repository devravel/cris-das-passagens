-- CreateEnum
CREATE TYPE "ReiDaCopaKeywordStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "rei_da_copa_participants" (
    "id" TEXT NOT NULL,
    "registrationNumber" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "instagram" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rei_da_copa_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rei_da_copa_keyword_submissions" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "status" "ReiDaCopaKeywordStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rei_da_copa_keyword_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rei_da_copa_ranking" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rei_da_copa_ranking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rei_da_copa_participants_registrationNumber_key" ON "rei_da_copa_participants"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "rei_da_copa_participants_phone_key" ON "rei_da_copa_participants"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "rei_da_copa_participants_instagram_key" ON "rei_da_copa_participants"("instagram");

-- CreateIndex
CREATE INDEX "rei_da_copa_participants_name_idx" ON "rei_da_copa_participants"("name");

-- CreateIndex
CREATE INDEX "rei_da_copa_participants_createdAt_idx" ON "rei_da_copa_participants"("createdAt");

-- CreateIndex
CREATE INDEX "rei_da_copa_keyword_submissions_participantId_idx" ON "rei_da_copa_keyword_submissions"("participantId");

-- CreateIndex
CREATE INDEX "rei_da_copa_keyword_submissions_status_createdAt_idx" ON "rei_da_copa_keyword_submissions"("status", "createdAt");

-- CreateIndex
CREATE INDEX "rei_da_copa_keyword_submissions_keyword_idx" ON "rei_da_copa_keyword_submissions"("keyword");

-- CreateIndex
CREATE UNIQUE INDEX "rei_da_copa_ranking_participantId_key" ON "rei_da_copa_ranking"("participantId");

-- CreateIndex
CREATE INDEX "rei_da_copa_ranking_position_idx" ON "rei_da_copa_ranking"("position");

-- AddForeignKey
ALTER TABLE "rei_da_copa_keyword_submissions" ADD CONSTRAINT "rei_da_copa_keyword_submissions_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "rei_da_copa_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rei_da_copa_ranking" ADD CONSTRAINT "rei_da_copa_ranking_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "rei_da_copa_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
