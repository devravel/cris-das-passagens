-- Tipo de hospedagem no cadastro Blue Friday (pedidos antigos ficam nulos).
ALTER TABLE "blue_friday_requests" ADD COLUMN "lodging" TEXT;
