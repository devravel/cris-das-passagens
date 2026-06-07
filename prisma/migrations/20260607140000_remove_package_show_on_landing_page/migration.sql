-- DropIndex
DROP INDEX "Package_showOnLandingPage_active_type_idx";

-- AlterTable
ALTER TABLE "Package" DROP COLUMN "showOnLandingPage";
