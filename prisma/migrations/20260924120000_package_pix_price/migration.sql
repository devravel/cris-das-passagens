-- Preço à vista no Pix, quando diferente do parcelado (que fica em "price").
ALTER TABLE "Package" ADD COLUMN "pixPrice" DECIMAL(10,2);
