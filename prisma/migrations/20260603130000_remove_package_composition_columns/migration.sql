-- AlterTable (idempotent: columns may already be absent in some environments)
ALTER TABLE "Package" DROP COLUMN IF EXISTS "includesTickets";
ALTER TABLE "Package" DROP COLUMN IF EXISTS "includesHotel";
ALTER TABLE "Package" DROP COLUMN IF EXISTS "includesFlight";
ALTER TABLE "Package" DROP COLUMN IF EXISTS "includesCruise";
