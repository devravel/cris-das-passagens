# Blue Friday — design

Data: 2026-10-21 · Status: revisado sobre `origin/main` (665b9c2), aguardando revisão

## Objetivo

Campanha "Blue Friday" antes da Black Friday. O cliente se cadastra no site, recebe um
**Passaporte Blue** e entra no grupo VIP do WhatsApp. A equipe usa os pedidos
(destino, datas, pessoas, orçamento) para montar ofertas, liberadas ao vivo na
**Blue Live** (YouTube) como pacotes de uma **promoção** do site. Um ranking público dos
destinos mais pedidos gera engajamento e divulgação.

Também nesta entrega: **"Publicado há X dias"** em todos os cards de pacote (seção 6).

Já resolvido em produção (fora desta entrega): centavos com 2 casas (`a24e3d6`).

## Fora de escopo

- E-mail (para o cliente ou para a equipe). O passaporte é exibido na tela.
- Excluir/editar pedidos no admin.
- Contagem regressiva da live.
- Generalizar Rei da Copa/roteiros em um módulo de "campanhas".

## O que já existe e será reaproveitado

- **Promoções** (`Promotion`, `/promocoes/<slug>`, pop-up, menu "Ofertas especiais",
  campo "Promoção" no pacote): as ofertas da live são uma promoção comum. Nada novo em
  `Package`.
- **Formulário de cotação de roteiros** (`components/itineraries/itinerary-quote-form.tsx`
  e `app/api/roteiros/cotacao/route.ts`): padrão de formulário (estado local, botões
  "pill", contadores de passageiros, honeypot, "Não sou um robô") e de API (zod, rate
  limit por IP em memória).
- `components/ui/date-picker.tsx` e `components/ui/select.tsx` (tema do site).
- `normalizeParticipantPhone` / `isValidBrazilianMobilePhone` / `BrazilianMobilePhoneInput`
  do Rei da Copa (telefone vira chave do passaporte, precisa ser normalizado).
- Padrão de teste `node lib/money.test.mjs` (assert, sem framework).

## 1. Configuração — `config/blue-friday-campaign.ts`

- `BLUE_FRIDAY_CAMPAIGN_ENABLED` (começa `false`). Desligado: `/blue-friday` responde 404,
  some do menu, do sitemap e do CTA da home; a API recusa cadastros. Admin continua
  acessível.
- `blueFridayCampaign`:
  - `signupStartDate`, `signupEndDate` (`YYYY-MM-DD`, São Paulo) — janela de inscrições,
    checada com `isCampaignOpen` (`lib/rei-da-copa/campaign-window.ts`).
  - `liveAt` (ISO `-03:00`) e `youtubeUrl` — no hero.
  - `whatsappGroupUrl` — botão "Entrar no grupo VIP".
  - `promotionSlug` — slug da promoção cujos pacotes aparecem como "Ofertas da Blue Live".
  - `destinations: string[]` — lista pré-definida.
  - `flexiblePeriods: string[]` — "Ainda em 2026", "1º semestre de 2027",
    "2º semestre de 2027".
  - `budgetRanges: string[]` — "Até R$ 3 mil", "R$ 3 a 6 mil", "R$ 6 a 10 mil",
    "R$ 10 a 20 mil", "Acima de R$ 20 mil".
- CTA da home: Blue Friday tem prioridade quando habilitado (mesmo mecanismo de
  `getHomeHeroPrimaryCta`).

Valores que dependem do Cris entram como placeholders e são trocados antes de ligar a flag.

## 2. Dados — Prisma (1 migration)

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
  destinationKey     String   // sem acento, minúsculo, espaços colapsados
  departureCity      String
  dateMode           BlueFridayDateMode
  option1Departure   DateTime? @db.Date
  option1Return      DateTime? @db.Date
  option2Departure   DateTime? @db.Date
  option2Return      DateTime? @db.Date
  flexiblePeriod     String?
  tripDays           Int?
  adults             Int
  childrenAges       Int[]    @default([])   // 2–17, uma por criança
  babies             Int      @default(0)    // até 24 meses
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

## 3. Cadastro

**Formulário** (mesmo estilo do formulário de cotação de roteiros, no tema Blue Friday):

| Campo | Regra |
|---|---|
| Nome | 3–120 caracteres |
| WhatsApp | celular BR `(DD) 9XXXX-XXXX` |
| Saída de (cidade/aeroporto) | 2–80 caracteres |
| Destino | botão/select da lista ou "Outro" + texto (2–80) |
| Quando | "Tenho datas": opção 1 ida/volta obrigatória, opção 2 opcional (as duas datas ou nenhuma); ida ≥ hoje (SP), volta ≥ ida. "Sou flexível": período da lista + dias (1–60) |
| Passageiros | contadores: adultos 1–9, crianças 0–9 (idade de cada uma, 2–17), bebês 0–9 |
| Orçamento | uma das faixas |
| Pagamento | Pix, cartão ou boleto |
| "Qual valor faria você comprar essa viagem?" | opcional, > 0 e ≤ 1.000.000 (`money-input`) |
| Honeypot + "Não sou um robô" | igual ao de roteiros |

Aviso abaixo do botão: ao se cadastrar, a pessoa concorda em ser contatada via WhatsApp,
com link para a Política de Privacidade.

**API** `POST /api/blue-friday/pedidos` (mesmo desenho de `/api/roteiros/cotacao`):

1. Rate limit por IP em memória — 10 envios / 30 min (pessoa pode pedir vários destinos).
2. Flag ligada e `isCampaignOpen` → senão 403 "inscrições encerradas".
3. zod → 400 com a primeira mensagem. Honeypot preenchido → 200 sem gravar.
4. `upsert` do passaporte por `phone` (`update: {}` mantém o nome original; cobre envio
   concorrente) e cria o pedido.
5. `201 { passportNumber, destination }`.

**Sucesso na tela**: cartão **Passaporte Blue** com o nome *digitado agora* (nunca o do
banco — quem digitar o telefone de outra pessoa não descobre o nome dela), nº do
passaporte e destino. Botões: "Entrar no grupo VIP" e "Pedir outro destino" (limpa o
formulário mantendo nome e WhatsApp). Dispara `trackMetaLead` como no formulário de
roteiros.

## 4. Página pública `/blue-friday`

Server component, `revalidate = 60`, identidade do cartaz (azul-marinho, azul neon,
dourado). Seções:

1. **Hero** — "Blue Friday · A Black Friday chegou antes", data/hora da live, link do
   YouTube, CTA "Garantir meu Passaporte Blue" (âncora para o formulário).
2. **Como funciona** — 4 passos: cadastro no site → grupo VIP → Blue Live no YouTube →
   atendimento e vendas.
3. **Formulário** (seção 3).
4. **Ranking** — top 10: `COUNT(DISTINCT "passportId")` por `destinationKey`, só chaves da
   lista pré-definida, rótulo da config. "1º Rio de Janeiro — 235 pedidos". Vazio: "O
   ranking aparece com os primeiros pedidos".
5. **Ofertas da Blue Live** — pacotes da promoção `promotionSlug` (reusa
   `getPromotionPageData` e `PackagesListingSection`). Seção oculta se a promoção não
   existir/não estiver ativa ou não tiver pacotes.

Menu: item "BLUE FRIDAY" e entrada no sitemap quando a flag estiver ligada.

## 5. Admin

- Sidebar: grupo **Blue Friday** com **Pedidos** e **Ranking**.
- **Pedidos** (`/admin/blue-friday`): tabela paginada (20/pág), mais recentes primeiro —
  nº passaporte, nome, WhatsApp (link `wa.me`), destino, datas ou período + dias,
  passageiros (idades), orçamento, pagamento, valor-alvo, data. Busca por nome, telefone
  ou nº; filtro por destino. **Exportar CSV**.
- **Ranking** (`/admin/blue-friday/ranking`): ranking completo, incluindo "Outro"
  (marcados "fora da lista"). Adicionar um "Outro" à lista da config faz os pedidos
  antigos contarem no ranking público (contagem é pela chave normalizada).
- Ofertas: Cris cria a promoção "Blue Friday" no painel de Promoções (slug igual ao da
  config) e marca os pacotes nela, com o agendamento que já existe.
- Acesso: páginas em `app/admin/(protected)` (layout já exige sessão); server actions
  checam `getCurrentAdminSession()`.

## 6. "Publicado há X dias" em todos os cards de pacote

- Vale para todos os cards (home, destaques, `/pacotes`, promoções, Blue Friday).
- `PublicPackage` ganha `publishedAt` = `activatesAt ?? createdAt` (ISO).
- Linha discreta: "Publicado hoje" / "Publicado ontem" / "Publicado há N dias" ·
  "Sujeito a disponibilidade". Dias no calendário de São Paulo; `title` com data e hora.
- Cache público de pacotes revalida em até 1h; erro máximo de 1h no "há N dias". Se a
  chave versionada do cache (`16e2aa8`) exigir, sobe a versão.

## 7. Política de privacidade

Subseção "Campanha Blue Friday" em coleta, finalidade, retenção e formulários: nome,
WhatsApp e preferências de viagem; uso para atendimento e ofertas da campanha; sem
compartilhamento; contato via WhatsApp/grupo VIP.

## 8. Verificação

- `lib/blue-friday/blue-friday.test.mjs` (assert): normalização de destino, ranking (só
  lista + distinct por passaporte), regras do schema (datas, crianças, opção 2
  ambas-ou-nenhuma) e "publicado há X dias".
- `npm run typecheck`, `npm run lint`.
- Navegador (dev): cadastro nos dois modos de data, segundo pedido com o mesmo WhatsApp
  (mesmo nº), ranking, ofertas da promoção, admin + CSV, mobile.

## Ordem de entrega

1. Migration + config + schema/serviço + API.
2. Página pública.
3. Admin.
4. "Publicado há X dias".
5. Política de privacidade, menu/sitemap/CTA, verificação.
