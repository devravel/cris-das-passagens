-- CreateTable
CREATE TABLE "rei_da_copa_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "startDate" DATE,
    "endDate" DATE,
    "firstPlacePrize" TEXT,
    "secondPlacePrize" TEXT,
    "thirdPlacePrize" TEXT,
    "regulation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rei_da_copa_settings_pkey" PRIMARY KEY ("id")
);
