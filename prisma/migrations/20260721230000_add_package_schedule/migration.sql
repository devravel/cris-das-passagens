-- AlterTable
ALTER TABLE "Package" ADD COLUMN "activatesAt" TIMESTAMP(3),
ADD COLUMN "deactivatesAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Package_activatesAt_idx" ON "Package"("activatesAt");

-- CreateIndex
CREATE INDEX "Package_deactivatesAt_idx" ON "Package"("deactivatesAt");
