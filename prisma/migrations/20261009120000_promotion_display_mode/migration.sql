-- Como o pop-up da promoção aparece: NORMAL (padrão) ou INSISTENT.
-- CreateEnum
CREATE TYPE "PromotionDisplayMode" AS ENUM ('NORMAL', 'INSISTENT');

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "displayMode" "PromotionDisplayMode" NOT NULL DEFAULT 'NORMAL';
