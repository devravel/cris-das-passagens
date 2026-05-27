-- AlterTable
ALTER TABLE "Package" ALTER COLUMN "shortDescription" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Package"
ADD COLUMN "highlightInstallments" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "includedItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "daysCount" INTEGER,
ADD COLUMN "nightsCount" INTEGER,
ADD COLUMN "showOnLandingPage" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Package_showOnLandingPage_active_type_idx" ON "Package"("showOnLandingPage", "active", "type");
