-- "Sem juros" ao lado das parcelas no card. Padrão ligado: é como a agência vende.
ALTER TABLE "Package" ADD COLUMN "interestFree" BOOLEAN NOT NULL DEFAULT true;
