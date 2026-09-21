-- Nome do vendedor no login do painel (vazio nos usuários já existentes).
ALTER TABLE "AdminUser" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';

-- Vendedor dono do roteiro: só vai no e-mail de cotação, nunca no site.
ALTER TABLE "Itinerary" ADD COLUMN "seller" TEXT;
