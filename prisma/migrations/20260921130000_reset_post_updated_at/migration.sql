-- Até aqui o contador de visualizações mexia no updatedAt (prisma.update), então
-- a data não representa edição. Zera pra data de publicação; a partir de agora
-- só edição no painel muda o updatedAt. Rodar DEPOIS do deploy do código novo.
UPDATE "Post" SET "updatedAt" = "createdAt";
