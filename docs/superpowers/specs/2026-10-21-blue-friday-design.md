# Blue Friday — design

Data: 2026-10-21 · Status: aprovado em conversa, aguardando revisão da spec

## Objetivo

Campanha "Blue Friday" antes da Black Friday. O cliente se cadastra no site, recebe um
**Passaporte Blue** e entra no grupo VIP do WhatsApp. A equipe usa os pedidos
(destino, datas, pessoas, orçamento) para montar ofertas, que são liberadas ao vivo na
**Blue Live** (YouTube) como pacotes do site. Um ranking público dos destinos mais
pedidos gera engajamento e divulgação.

Também nesta entrega (independentes do Blue Friday):

- **Centavos** — já feito: `formatPackagePrice` mostra 2 casas quando há centavos
  (`R$ 123,60`) e a migration `20261021120000_fix_installment_text_cents` corrige os
  textos de parcelamento já salvos (exceto tipo `CUSTOM`).
- **"Publicado há X dias"** nos cards de pacote (seção 6).

## Fora de escopo

- E-mail (para o cliente ou para a equipe). O passaporte é exibido na tela.
- Excluir/editar pedidos no admin.
- Contagem regressiva da live.
- Generalizar o módulo Rei da Copa em "campanhas".

## 1. Configuração — `config/blue-friday-campaign.ts`

Mesmo padrão de `config/rei-da-copa-campaign.ts`:

- `BLUE_FRIDAY_CAMPAIGN_ENABLED` (boolean, começa `false`). Quando `false`: página
  `/blue-friday` responde 404, some do menu, do sitemap e do CTA da home; API recusa
  cadastros. Admin continua acessível.
- `blueFridayCampaign`:
  - `signupStartDate`, `signupEndDate` (`YYYY-MM-DD`, fuso São Paulo) — janela de
    inscrições; checada com `isCampaignOpen` de `lib/rei-da-copa/campaign-window.ts`.
  - `liveAt` (ISO com `-03:00`) e `youtubeUrl` — exibidos no hero.
  - `whatsappGroupUrl` — botão "Entrar no grupo VIP".
  - `destinations: string[]` — lista pré-definida (rótulos de exibição).
  - `flexiblePeriods: string[]` — ex.: "Ainda em 2026", "1º semestre de 2027",
    "2º semestre de 2027".
  - `budgetRanges: string[]` — ex.: "Até R$ 3 mil", "R$ 3 a 6 mil", "R$ 6 a 10 mil",
    "R$ 10 a 20 mil", "Acima de R$ 20 mil".
- `getHomeHeroPrimaryCta` passa a priorizar o CTA Blue Friday quando habilitado.

Valores que dependem do Cris (lista de destinos, links, datas, faixas) entram como
placeholders e são substituídos antes de ligar a flag.

## 2. Dados — Prisma

```prisma
enum BlueFridayDateMode { SPECIFIC FLEXIBLE }
enum BlueFridayPaymentPreference { PIX CREDIT_CARD BOLETO }

model BlueFridayPassport {
  id        String   @id @default(cuid())
  number    Int      @unique @default(autoincrement())
  name      String
  phone     String   @unique          // só dígitos, celular BR (11 dígitos)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  requests  BlueFridayRequest[]
  @@map("blue_friday_passports")
}

model BlueFridayRequest {
  id                 String   @id @default(cuid())
  passportId         String
  destination        String   // rótulo como exibido/digitado
  destinationKey     String   // normalizado: sem acento, minúsculo, espaços colapsados
  departureCity      String
  dateMode           BlueFridayDateMode
  option1Departure   DateTime? @db.Date
  option1Return      DateTime? @db.Date
  option2Departure   DateTime? @db.Date
  option2Return      DateTime? @db.Date
  flexiblePeriod     String?
  tripDays           Int?
  adults             Int
  childrenAges       Int[]    @default([])
  budgetRange        String
  paymentPreference  BlueFridayPaymentPreference
  targetPrice        Decimal? @db.Decimal(10, 2)
  createdAt          DateTime @default(now())
  passport BlueFridayPassport @relation(fields: [passportId], references: [id], onDelete: Cascade)
  @@index([passportId])
  @@index([destinationKey])
  @@index([createdAt])
  @@map("blue_friday_requests")
}
```

`Package` ganha `blueFriday Boolean @default(false)`.

## 3. Cadastro

**Formulário** (cliente, react-hook-form + zod; mesmo schema no servidor):

| Campo | Regra |
|---|---|
| Nome | 3–120 caracteres (regras de `participantNameSchema`) |
| WhatsApp | celular BR `(DD) 9XXXX-XXXX` (reusa `BrazilianMobilePhoneInput`, `isValidBrazilianMobilePhone`) |
| Cidade/aeroporto de saída | 2–80 caracteres |
| Destino | um da lista ou "Outro" + texto (2–80) |
| Quando | `SPECIFIC`: opção 1 ida/volta obrigatória, opção 2 opcional (ambas ou nenhuma); ida ≥ hoje (SP), volta ≥ ida. `FLEXIBLE`: período da lista + dias (1–60) |
| Adultos | 1–20 |
| Crianças | 0–10, cada uma com idade 0–17 |
| Orçamento | uma das faixas |
| Pagamento | Pix, cartão ou boleto (uma opção) |
| "Qual valor faria você comprar essa viagem?" | opcional, > 0 e ≤ 1.000.000 |

Aviso abaixo do botão: ao se cadastrar, a pessoa concorda em ser contatada via
WhatsApp, com link para a Política de Privacidade.

**API** `POST /api/blue-friday/requests`:

1. Rate limit por IP — novo bucket `blueFriday` (10 envios / 30 min) em
   `lib/rei-da-copa/rate-limit.ts`. Limite é em memória por instância (mesmo teto do
   Rei da Copa).
2. Flag ligada e `isCampaignOpen` → senão 403 com mensagem de campanha fechada.
3. Valida com o schema → 400 com `fieldErrors`.
4. `upsert` do passaporte por `phone` (`update: {}` — mantém o nome original; cobre
   envio concorrente) e cria o pedido.
5. Responde `201 { passportNumber, destination }`.

**Sucesso na tela**: cartão **Passaporte Blue** com o nome *digitado agora* (nunca o do
banco — quem digitar o telefone de outra pessoa não descobre o nome dela), nº do
passaporte e destino. Botões: "Entrar no grupo VIP" (abre `whatsappGroupUrl`) e
"Pedir outro destino" (limpa o formulário mantendo nome e WhatsApp).

## 4. Página pública `/blue-friday`

Server component, `revalidate = 60`, identidade do cartaz (azul-marinho, azul neon,
dourado). Seções, em ordem:

1. **Hero** — "Blue Friday", "A Black Friday chegou antes", data/hora da live, CTA
   "Garantir meu Passaporte Blue" (âncora para o formulário).
2. **Como funciona** — 4 passos: cadastro no site → grupo VIP → Blue Live no YouTube →
   atendimento e vendas.
3. **Formulário** (seção 3).
4. **Ranking** — top 10. `COUNT(DISTINCT passportId)` agrupado por `destinationKey`,
   só chaves que existem na lista pré-definida; rótulo vem da config. Formato
   "1º Rio de Janeiro — 235 pedidos". Estado vazio: "O ranking aparece com os primeiros
   pedidos".
5. **Ofertas da Blue Live** — pacotes ativos (mesmo filtro de agendamento de
   `/pacotes`) com `blueFriday = true`, usando o card público existente. Seção oculta se
   não houver nenhum. Query cacheada com as mesmas tags de pacote, então salvar um
   pacote no admin atualiza a página.

Navegação: item "BLUE FRIDAY" no menu e entrada no sitemap quando a flag estiver ligada;
breadcrumb como em `/rei-da-copa`.

## 5. Admin

- Sidebar: grupo **Blue Friday** com **Pedidos** e **Ranking**.
- **Pedidos** (`/admin/blue-friday`): tabela paginada (20/pág) ordenada por mais
  recentes — nº passaporte, nome, WhatsApp (link `wa.me`), destino, datas ou período +
  dias, adultos/crianças (idades), orçamento, pagamento, valor-alvo, data do pedido.
  Busca por nome, telefone ou nº do passaporte; filtro por destino. Botão **Exportar
  CSV** (todas as linhas; mesmo padrão de exportação do Rei da Copa).
- **Ranking** (`/admin/blue-friday/ranking`): ranking completo, incluindo destinos
  "Outro", marcados como "fora da lista". Se um "Outro" crescer, basta adicioná-lo à
  lista da config: como a contagem é pela chave normalizada, os pedidos antigos passam
  a contar no ranking público.
- **Pacotes**: checkbox "Oferta Blue Friday" no formulário de pacote (schema, action,
  tela de edição e grid de pacotes com um selo).
- Acesso: páginas dentro de `app/admin/(protected)` (layout já exige sessão) e toda
  server action checa `getCurrentAdminSession()` como em `packages/actions.ts`.

## 6. "Publicado há X dias" nos cards de pacote

- `PublicPackage` ganha `publishedAt` = `activatesAt ?? createdAt` (ISO).
- Linha discreta no card (variantes landing e listing): "Publicado hoje" /
  "Publicado ontem" / "Publicado há N dias" · "Sujeito a disponibilidade". Dias
  contados no calendário de São Paulo; `title` com data e hora completas.
- Páginas revalidam a cada hora; o erro máximo do "há N dias" é 1 hora.

## 7. Política de privacidade

Nova subseção "Campanha Blue Friday" nas seções de coleta (2.x), finalidade,
retenção e formulários (9): dados coletados (nome, WhatsApp, preferências de viagem),
uso (atendimento e montagem de ofertas da campanha), compartilhamento (nenhum),
contato via WhatsApp/grupo VIP.

## 8. Verificação

- Script com `assert` (sem framework) cobrindo: normalização de destino, filtro do
  ranking (só lista + distinct por passaporte) e regras do schema (datas, crianças,
  opção 2 ambas-ou-nenhuma).
- `npm run typecheck` e `npm run lint`.
- No navegador (dev): cadastro completo nos dois modos de data, segundo pedido com o
  mesmo WhatsApp (mesmo nº de passaporte), ranking atualizando, oferta marcada aparecendo,
  admin listando e exportando, layout mobile.

## Ordem de entrega

1. Migration + config + schema/serviço + API.
2. Página pública (hero, como funciona, formulário, passaporte, ranking, ofertas).
3. Admin (pedidos, ranking, checkbox de pacote).
4. "Publicado há X dias".
5. Política de privacidade, menu/sitemap/CTA, verificação.
