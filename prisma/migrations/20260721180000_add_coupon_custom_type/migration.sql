-- AlterEnum
ALTER TYPE "CouponDiscountType" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN "customPrize" TEXT;
