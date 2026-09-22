-- AlterTable
ALTER TABLE "Itinerary" ADD COLUMN "includedItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "videoUrl" TEXT,
ADD COLUMN "mapUrl" TEXT;
