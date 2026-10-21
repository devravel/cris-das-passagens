-- Blue Friday: passaportes (1 por WhatsApp) e pedidos de destino.
-- CreateEnum
CREATE TYPE "BlueFridayDateMode" AS ENUM ('SPECIFIC', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "BlueFridayPaymentPreference" AS ENUM ('PIX', 'CREDIT_CARD', 'BOLETO');

-- CreateTable
CREATE TABLE "blue_friday_passports" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blue_friday_passports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blue_friday_requests" (
    "id" TEXT NOT NULL,
    "passportId" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "destinationKey" TEXT NOT NULL,
    "departureCity" TEXT NOT NULL,
    "dateMode" "BlueFridayDateMode" NOT NULL,
    "option1Departure" DATE,
    "option1Return" DATE,
    "option2Departure" DATE,
    "option2Return" DATE,
    "flexiblePeriod" TEXT,
    "tripDays" INTEGER,
    "adults" INTEGER NOT NULL,
    "childrenAges" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "babies" INTEGER NOT NULL DEFAULT 0,
    "budgetRange" TEXT NOT NULL,
    "paymentPreference" "BlueFridayPaymentPreference" NOT NULL,
    "targetPrice" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blue_friday_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blue_friday_passports_number_key" ON "blue_friday_passports"("number");

-- CreateIndex
CREATE UNIQUE INDEX "blue_friday_passports_phone_key" ON "blue_friday_passports"("phone");

-- CreateIndex
CREATE INDEX "blue_friday_requests_passportId_idx" ON "blue_friday_requests"("passportId");

-- CreateIndex
CREATE INDEX "blue_friday_requests_destinationKey_idx" ON "blue_friday_requests"("destinationKey");

-- CreateIndex
CREATE INDEX "blue_friday_requests_createdAt_idx" ON "blue_friday_requests"("createdAt");

-- AddForeignKey
ALTER TABLE "blue_friday_requests" ADD CONSTRAINT "blue_friday_requests_passportId_fkey" FOREIGN KEY ("passportId") REFERENCES "blue_friday_passports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
