-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('PACKAGE_COMPLETE', 'FLIGHT', 'HOTEL', 'TICKET', 'CRUISE');

-- CreateEnum
CREATE TYPE "PackageCategory" AS ENUM ('NATIONAL', 'INTERNATIONAL');

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "type" "PackageType" NOT NULL,
    "category" "PackageCategory",
    "price" DECIMAL(10,2) NOT NULL,
    "oldPrice" DECIMAL(10,2),
    "installmentText" TEXT,
    "airline" TEXT,
    "hotelName" TEXT,
    "includesTickets" BOOLEAN NOT NULL DEFAULT false,
    "includesHotel" BOOLEAN NOT NULL DEFAULT false,
    "includesFlight" BOOLEAN NOT NULL DEFAULT false,
    "includesCruise" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- Migrate existing promotions when present
DO $$
BEGIN
  IF to_regclass('public."Promotion"') IS NOT NULL THEN
    INSERT INTO "Package" (
        "id",
        "title",
        "slug",
        "shortDescription",
        "destination",
        "image",
        "type",
        "category",
        "price",
        "oldPrice",
        "installmentText",
        "airline",
        "hotelName",
        "includesTickets",
        "includesHotel",
        "includesFlight",
        "includesCruise",
        "active",
        "featured",
        "createdAt",
        "updatedAt"
    )
    SELECT
        "id",
        COALESCE(NULLIF(TRIM("title"), ''), 'Promoção migrada'),
        "id",
        '',
        '',
        "image",
        'PACKAGE_COMPLETE'::"PackageType",
        'NATIONAL'::"PackageCategory",
        0,
        NULL,
        NULL,
        NULL,
        NULL,
        false,
        false,
        false,
        false,
        "active",
        false,
        "createdAt",
        COALESCE("createdAt", CURRENT_TIMESTAMP)
    FROM "Promotion"
    ON CONFLICT ("id") DO NOTHING;

    DROP TABLE "Promotion";
  END IF;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX "Package_slug_key" ON "Package"("slug");

-- CreateIndex
CREATE INDEX "Package_active_createdAt_idx" ON "Package"("active", "createdAt");

-- CreateIndex
CREATE INDEX "Package_featured_active_createdAt_idx" ON "Package"("featured", "active", "createdAt");

-- CreateIndex
CREATE INDEX "Package_type_active_idx" ON "Package"("type", "active");
