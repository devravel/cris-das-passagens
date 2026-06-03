-- AlterTable (idempotent: column may already exist in some environments)
ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "departureCity" TEXT;
