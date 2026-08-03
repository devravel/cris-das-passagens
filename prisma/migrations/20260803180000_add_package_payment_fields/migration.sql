-- CreateEnum
CREATE TYPE "PackageInstallmentKind" AS ENUM ('NONE', 'INSTALLMENTS', 'DOWN_PAYMENT', 'PIX_CASH', 'CUSTOM');

-- AlterTable
ALTER TABLE "Package"
ADD COLUMN "installmentKind" "PackageInstallmentKind" NOT NULL DEFAULT 'CUSTOM',
ADD COLUMN "installmentCount" INTEGER,
ADD COLUMN "installmentAmount" DECIMAL(10,2),
ADD COLUMN "downPaymentAmount" DECIMAL(10,2),
ADD COLUMN "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[];
