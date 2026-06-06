-- CreateEnum
CREATE TYPE "PackagePriceScope" AS ENUM ('PER_PERSON', 'COUPLE', 'FAMILY');

-- AlterTable
ALTER TABLE "Package" ADD COLUMN "priceScope" "PackagePriceScope";
