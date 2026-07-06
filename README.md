# Cris das Passagens

## Visão Geral

Site institucional e comercial da agência de turismo **Cris das Passagens** (Osório — RS). O projeto combina uma landing page otimizada para conversão via WhatsApp, catálogo público de pacotes, blog com SEO, campanha promocional **Rei da Copa**, sistema de cupons de desconto e painel administrativo para gestão de conteúdo.

O atendimento ao visitante ocorre principalmente por **links de WhatsApp** — não há formulário de contato com envio de dados ao servidor. A única coleta estruturada de dados pessoais de visitantes ocorre na **campanha Rei da Copa** (nome, telefone, Instagram).

**Política de Privacidade:** [/politica-de-privacidade](https://crisdaspassagens.com.br/politica-de-privacidade)

---

## Stack

### Frontend

| Tecnologia | Uso |
|------------|-----|
| [Next.js 16](https://nextjs.org/) (App Router) | Rotas, SSR, ISR, API Routes |
| React 19 | Interface |
| TypeScript | Tipagem |
| Tailwind CSS v4 | Estilos |
| shadcn/ui + Radix UI | Componentes |
| Framer Motion | Animações |
| React Hook Form + Zod | Formulários e validação |
| Tiptap | Editor rich text (admin) |

### Backend

| Tecnologia | Uso |
|------------|-----|
| Next.js API Routes | Endpoints REST (`/api/*`) |
| Server Actions | Mutações do painel admin |
| jose + bcrypt | Sessão JWT e hash de senhas admin |
| Resend | E-mails internos (inscrições Rei da Copa) |

### Banco de Dados

| Tecnologia | Uso |
|------------|-----|
| PostgreSQL (Supabase) | Dados relacionais |
| Prisma 7 | ORM e migrações |

### Infraestrutura

| Serviço | Uso |
|---------|-----|
| [Vercel](https://vercel.com/) | Hospedagem e deploy |
| Supabase | Postgres + Storage |
| Meta Pixel | Rastreamento de conversões (opcional) |
| Google Places API | Galeria de destinos (opcional) |

---

## Funcionalidades

### Landing Page

Homepage com seções de hero, pacotes em destaque, promoções, depoimentos, FAQ, blog preview e CTAs de WhatsApp. Server Components com ISR (`revalidate = 3600`).

### Pacotes

Catálogo público em `/pacotes` com filtros por tipo (pacote completo, voo, hotel, ingresso, cruzeiro), categoria (nacional/internacional) e cards com CTA de WhatsApp pré-preenchido com o título do pacote.

### Blog

Listagem e posts individuais com SEO (metadata, JSON-LD Article, breadcrumbs), tags, curtidas pseudônimas (UUID em `localStorage`) e compartilhamento social.

### Área Administrativa

Painel em `/admin` protegido por middleware e cookie JWT (`admin_session`, 8 horas). Gestão de:

- Pacotes (CRUD, upload de imagens)
- Posts do blog (CRUD, upload de capa e conteúdo)
- Cupons de desconto
- Campanha Rei da Copa (inscrições, palavras-chave, ranking, configurações, exportação)

### Sistema de Cupons

Validação pública via `POST /api/coupons/validate`. Cupom aplicado fica em `localStorage` por 24 horas e pode ser incluído na mensagem de WhatsApp ao solicitar um pacote.

### Meta Pixel

Rastreamento opcional via `NEXT_PUBLIC_META_PIXEL_ID`. Eventos: `PageView`, `Lead` (cliques WhatsApp), `ViewContent` (pacotes). Excluído em `/admin/*`. Meta Pixel e widget Elfsight só carregam após consentimento explícito (opt-in) nas preferências de cookies.

### Campanha Rei da Copa

Landing em `/rei-da-copa` com:

- Cadastro de participantes (nome, telefone, Instagram) → Postgres
- Envio diário de palavra-chave
- Ranking público (nome, Instagram, pontos)
- Notificação interna por e-mail (Resend) a cada inscrição
- Painel admin completo

### Uploads

Imagens administrativas enviadas ao Supabase Storage:

| Bucket | Conteúdo |
|--------|----------|
| `package-images` | Imagens de pacotes |
| `promotion-images` | Imagens promocionais |
| `blog-covers` | Capas e imagens de posts |

Proxy opcional: `GET /api/media/[bucket]/[...path]`.

### SEO

Metadata por página, canonical URLs, Open Graph, Twitter Cards, JSON-LD (Organization, WebSite, FAQ, Article, Breadcrumb), sitemap dinâmico e `robots.txt` com bloqueio de `/admin` e `/api`.

---

## Arquitetura

```
app/
├── page.tsx                         # Homepage
├── pacotes/                         # Catálogo de pacotes
├── blog/                            # Blog público
├── contato/                         # Informações + link WhatsApp (sem formulário)
├── sobre/                           # Página institucional
├── rei-da-copa/                     # Campanha promocional
├── politica-de-privacidade/         # Política de Privacidade (LGPD)
├── destinos/                        # Galeria (oculta na navegação)
├── api/
│   ├── admin/auth/                  # Login, logout, session
│   ├── coupons/                     # Validação e resgate de cupons
│   ├── rei-da-copa/                 # Participantes, palavra-chave, ranking
│   └── media/                       # Proxy de imagens Supabase
├── admin/
│   ├── (public)/login/
│   └── (protected)/               # Dashboard, pacotes, blogs, cupons, rei-da-copa
├── layout.tsx                       # Layout global + Meta Pixel + JSON-LD
├── sitemap.ts                       # Sitemap dinâmico
└── robots.ts                        # Regras de indexação

components/
├── layout/                          # Navbar, footer, sections
├── sections/                          # Hero, FAQ, pacotes, depoimentos…
├── rei-da-copa/                     # Formulários e UI da campanha
├── analytics/                       # Meta Pixel e MetaLeadAnchor
├── admin/                           # Formulários e tabelas do painel
├── seo/                             # JSON-LD
└── ui/                              # Design system (shadcn)

lib/
├── auth/                            # JWT, sessão, rate limit de login
├── blog/                            # Queries, schemas, storage
├── package/                         # Queries, schemas, storage
├── coupon/                          # Validação, localStorage, WhatsApp
├── rei-da-copa/                     # Serviços, schemas, rate limit, e-mail
├── meta-pixel/                      # Rastreamento e consentimento
├── seo/                             # Metadata, canonical, JSON-LD
├── email/                           # Envio via Resend
└── prisma.ts                        # Cliente Prisma (adapter PG)

prisma/
├── schema.prisma                    # Modelos: Post, Package, Coupon, ReiDaCopa…
└── migrations/                      # Migrações versionadas

config/
├── content.ts                       # Conteúdo estático e contatos
├── site.ts                          # Configuração do site
├── navigation.ts                    # Links de navegação e footer
└── rei-da-copa-landing.ts           # Conteúdo da campanha
```

### Padrões adotados

- **Server Components por padrão** — dados do banco e SEO no servidor; `"use client"` apenas para interatividade.
- **Modular por domínio** — `lib/blog`, `lib/package`, `lib/rei-da-copa`, `lib/auth`.
- **Server Actions** — mutações do admin com `revalidatePath`.
- **ISR** — páginas públicas com `revalidate = 3600` + revalidação on-demand após CRUD.
- **Segurança** — middleware em `/admin/*`, cookies httpOnly, rate limiting, service role apenas no servidor.

---

## Variáveis de Ambiente

Copie `.env.example` para `.env`. **Nunca commite o arquivo `.env`.**

| Variável | Obrigatória | Finalidade |
|----------|-------------|------------|
| `DATABASE_URL` | **Sim** | Connection string PostgreSQL (pooler Supabase) para o app |
| `DIRECT_URL` | Migrações | Connection string direta (porta 5432) para `prisma migrate` |
| `NEXT_PUBLIC_SUPABASE_URL` | **Sim** | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Sim** | Chave anon/publishable do Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Alternativa | Alias aceito no lugar da anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Sim** | Service role — uploads administrativos (somente servidor) |
| `JWT_SECRET` | **Sim** | Segredo para assinar sessões admin (mín. 32 caracteres) |
| `NEXT_PUBLIC_SITE_URL` | **Sim** | URL canônica do site em produção (sem barra final) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Não | ID do Meta Pixel para remarketing e conversões |
| `RESEND_API_KEY` | Rei da Copa | API key Resend — avisos de inscrição à equipe |
| `RESEND_FROM_EMAIL` | Não | Remetente dos e-mails (padrão: `onboarding@resend.dev`) |
| `GOOGLE_PLACES_API_KEY` | Não | Fotos da galeria `/destinos` |
| `GOOGLE_BUSINESS_PLACE_ID` | Não | ID do negócio no Google Places |
| `NODE_ENV` | Automática | `production` ativa cookie `secure` e reduz logs Prisma |

---

## Instalação

### Pré-requisitos

- Node.js 20+
- Conta [Supabase](https://supabase.com/) (Postgres + Storage)
- Git

### Passo a passo

```bash
# 1. Clonar e instalar dependências
git clone https://github.com/SEU_USUARIO/cris-das-passagens.git
cd cris-das-passagens
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com os valores do seu projeto Supabase

# 3. Aplicar migrações do banco
npm run db:migrate:dev    # desenvolvimento
# ou
npm run db:migrate        # produção / CI

# 4. Criar buckets no Supabase Storage (leitura pública)
#    - package-images
#    - promotion-images
#    - blog-covers

# 5. Criar usuário administrativo
npm run admin:create -- seu-email@dominio.com "SenhaSegura123"

# 6. Iniciar servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Painel admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

---

## Desenvolvimento

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento (gera Prisma Client) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificação TypeScript (`tsc --noEmit`) |
| `npm run db:generate` | Gera Prisma Client |
| `npm run db:migrate` | Aplica migrações (produção) |
| `npm run db:migrate:dev` | Migrações em desenvolvimento |
| `npm run db:migrate:deploy` | `prisma migrate deploy` direto |
| `npm run admin:create` | Cria usuário admin |
| `npm run admin:change-password` | Altera senha de admin existente |

---

## Produção

### Checklist de deploy

1. Conectar repositório GitHub à [Vercel](https://vercel.com/)
2. Configurar **todas** as variáveis obrigatórias de `.env.example` no painel da Vercel
3. Definir `NEXT_PUBLIC_SITE_URL` com o domínio final (ex.: `https://crisdaspassagens.com.br`)
4. Em **Vercel → Domains**, definir `crisdaspassagens.com.br` como domínio **primário** (não redirecionar o apex para `www`). O Safari e outros navegadores buscam `/favicon.ico` no domínio exibido; se o apex responder só com redirect 308, o ícone padrão da Vercel aparece nas sugestões e favoritos.
5. Usar connection string do **pooler** Supabase em `DATABASE_URL`
6. Executar migrações: `npm run db:migrate` (ou incluir no pipeline de deploy)
7. Criar buckets no Supabase Storage com leitura pública
8. Criar usuário admin: `npm run admin:create`
9. Configurar `NEXT_PUBLIC_META_PIXEL_ID` se desejar rastreamento
10. Configurar `RESEND_API_KEY` para notificações da campanha Rei da Copa
11. Validar SEO: `/sitemap.xml`, `/robots.txt`, [Rich Results Test](https://search.google.com/test/rich-results)
12. Verificar Política de Privacidade em `/politica-de-privacidade`

### Build local

```bash
npm run build
npm run start
```

O script `build` executa `prisma generate` automaticamente.

---

## Integrações

### WhatsApp

Canal principal de cotação e atendimento. Links `wa.me/5551992519187` com mensagens pré-preenchidas. Nenhum dado pessoal é enviado ao servidor do site — a conversa ocorre no aplicativo WhatsApp. Cliques disparam evento `Lead` no Meta Pixel (quando ativo).

### Resend

Envio de e-mail interno à equipe (`reidacopacrisdaspassagens@gmail.com`) quando um novo participante se inscreve na campanha Rei da Copa. Requer `RESEND_API_KEY`.

### Meta Pixel

Script `fbevents.js` carregado em páginas públicas (exceto `/admin`) somente após aceite de cookies de marketing. Eventos: `PageView`, `Lead`, `ViewContent`. Ativado por `NEXT_PUBLIC_META_PIXEL_ID`. Consentimento padrão: recusado até escolha do visitante (`lib/consent/storage.ts`).

### Supabase

- **PostgreSQL** — banco de dados via Prisma
- **Storage** — imagens administrativas (pacotes, blog, promoções)
- Service role (`SUPABASE_SERVICE_ROLE_KEY`) usada apenas no servidor para uploads

### Vercel

Hospedagem recomendada. Logs de servidor (incluindo IPs em rate limiting) ficam sob responsabilidade da plataforma.

### Google Search Console

Submeta `https://seu-dominio.com.br/sitemap.xml` após o deploy. O `robots.txt` permite indexação de páginas públicas e bloqueia `/admin/` e `/api/`.

---

## Segurança

### Autenticação

- Login admin via e-mail e senha (bcrypt)
- Sessão JWT em cookie `admin_session` (httpOnly, sameSite lax, secure em produção, 8 horas)
- Middleware redireciona visitantes não autenticados em `/admin/*`

### Proteções existentes

- `robots.txt` bloqueia `/admin/` e `/api/` para crawlers
- Chaves secretas (`JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) apenas no servidor
- Uploads restritos a usuários admin autenticados
- Hash de senha com bcrypt — senha em texto claro nunca armazenada

### Rate limiting

| Endpoint | Limite |
|----------|--------|
| Login admin | 5 tentativas falhas / 15 min / IP |
| Inscrição Rei da Copa | 3 requisições / 30 min / IP |
| Palavra-chave Rei da Copa | 10 requisições / 30 min / IP |

Limites em memória do processo (não persistidos no banco).

### Validações

- Zod em todos os formulários e APIs públicas
- Sanitização de redirect no login admin
- Telefone e Instagram normalizados na campanha Rei da Copa
- Escape HTML em e-mails de notificação

---

## SEO

Implementado no projeto:

- `metadataBase` e URLs canônicas via `NEXT_PUBLIC_SITE_URL`
- Open Graph, Twitter Cards e keywords por página
- JSON-LD: Organization, WebSite, FAQPage, ItemList (blog), Article, Breadcrumb
- Sitemap dinâmico (`/sitemap.xml`) com homepage, pacotes, blog, contato, sobre, rei-da-copa, política de privacidade e posts publicados
- `robots.txt` com sitemap e host
- Admin e API com `noindex`
- ISR com revalidação horária e on-demand após CRUD

---

## LGPD

O site trata dados pessoais de visitantes principalmente na **campanha Rei da Copa** e em interações opcionais (curtidas no blog, Meta Pixel). Não há formulário de contato com envio ao servidor.

A **Política de Privacidade** completa, baseada no funcionamento real do sistema, está em:

**[/politica-de-privacidade](/politica-de-privacidade)**

Contato para solicitações de titulares: **cridaspassagens@gmail.com**

---

## Documentação adicional

- [`docs/branding.md`](docs/branding.md) — identidade visual
- [`docs/project-context.md`](docs/project-context.md) — contexto do produto
- [`README_AGENT.md`](README_AGENT.md) — guia para agentes de IA
- [`AGENTS.md`](AGENTS.md) — regras para desenvolvimento Next.js

## Licença

Projeto privado — todos os direitos reservados.
