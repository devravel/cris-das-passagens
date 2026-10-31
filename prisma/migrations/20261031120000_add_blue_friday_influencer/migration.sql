-- "Cupom do influenciador" (opcional) no cadastro Blue Friday.
ALTER TABLE "blue_friday_requests" ADD COLUMN "influencer" TEXT,
ADD COLUMN "influencerKey" TEXT;
