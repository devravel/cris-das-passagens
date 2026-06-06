-- CreateTable
CREATE TABLE "rei_da_copa_keywords" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rei_da_copa_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rei_da_copa_keywords_value_key" ON "rei_da_copa_keywords"("value");

-- CreateIndex
CREATE INDEX "rei_da_copa_keywords_isActive_idx" ON "rei_da_copa_keywords"("isActive");
