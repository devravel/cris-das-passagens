-- AlterEnum
ALTER TYPE "PackageType" ADD VALUE 'CIRCUIT';

-- AlterTable
ALTER TABLE "Package" ADD COLUMN "circuitStartDay" TEXT;
ALTER TABLE "Package" ADD COLUMN "circuitDuration" TEXT;
