# Cris das Passagens

Website premium para a agência de turismo **Cris das Passagens**: landing page otimizada para conversão, blog público com SEO, painel administrativo para gestão de conteúdo e promoções.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v4 + shadcn/ui |
| Animações | Framer Motion |
| Banco de dados | PostgreSQL (Supabase) |
| ORM | Prisma 7 |
| Storage | Supabase Storage |
| Autenticação admin | JWT (jose) + bcrypt + cookies httpOnly |
| Formulários | React Hook Form + Zod |
| Editor rich text | Tiptap |

## Arquitetura

```
app/
├── page.tsx                    # Homepage (Server Component)
├── blog/                       # Listagem e posts públicos
├── admin/
│   ├── (public)/login/         # Login sem layout protegido
│   └── (protected)/            # Dashboard, blogs, promoções
├── api/admin/auth/             # Login, logout, session
├── layout.tsx                  # Layout global + JSON-LD
├── sitemap.ts                  # Sitemap dinâmico
└── robots.ts                   # Regras de indexação

components/
├── layout/                     # Navbar, footer, sections
├── sections/                   # Hero, FAQ, blog, promoções…
├── admin/                      # Formulários e tabelas do painel
├── seo/                        # JSON-LD
└── ui/                         # Design system (shadcn)

lib/
├── auth/                       # JWT, sessão, credenciais admin
├── blog/                       # Queries, schemas, destaques
├── promotion/                  # Queries e schemas
├── seo/                        # Metadata, canonical, JSON-LD
├── prisma.ts                   # Cliente Prisma (adapter PG)
└── supabase*.ts                # Clientes Supabase

prisma/
├── schema.prisma               # Post, Promotion, AdminUser
└── migrations/                 # Migrações versionadas

config/
├── content.ts                  # Conteúdo estático da landing
├── site.ts                     # Nome, contatos, URLs
└── navigation.ts               # Links de navegação

docs/
├── branding.md                 # Identidade visual
└── project-context.md          # Contexto do produto
```

### Padrões adotados

- **Server Components por padrão** — dados do banco e SEO no servidor; `"use client"` apenas para interatividade (forms, slideshow, motion).
- **Modular por domínio** — `lib/blog`, `lib/promotion`, `lib/auth`, `lib/seo`.
- **Server Actions** — mutações do admin com revalidação (`revalidatePath`).
- **ISR** — homepage, blog e sitemap com `revalidate = 3600` + revalidação on-demand após CRUD.
- **Segurança** — middleware/proxy em `/admin/*`, cookies seguros em produção, `/admin` e `/api` bloqueados no `robots.txt`, service role apenas no servidor.

## Pré-requisitos

- Node.js 20+
- Conta [Supabase](https://supabase.com/) (Postgres + Storage)
- Git

## Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/SEU_USUARIO/cris-das-passagens.git
cd cris-das-passagens
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Preencha `.env` com os valores do seu projeto Supabase. **Nunca commite o arquivo `.env`.**

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon/publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (somente servidor) |
| `JWT_SECRET` | Segredo para sessões admin (32+ chars) |
| `NEXT_PUBLIC_SITE_URL` | URL canônica do site em produção |

### 3. Banco de dados

```bash
npm run db:migrate:dev   # desenvolvimento (cria/aplica migrações)
# ou em CI/produção:
npm run db:migrate
```

### 4. Supabase Storage

Crie buckets públicos (ou com política de leitura pública):

- `blog-covers` — capas dos posts
- `promotion-images` — imagens das promoções

### 5. Usuário admin inicial

```bash
npm run admin:create -- seu-email@dominio.com "SenhaSegura123"
```

### 6. Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Painel admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verificação TypeScript |
| `npm run db:generate` | Gera Prisma Client |
| `npm run db:migrate` | Aplica migrações (produção) |
| `npm run db:migrate:dev` | Migrações em desenvolvimento |
| `npm run admin:create` | Cria usuário admin |

## Deploy

Recomendado: **[Vercel](https://vercel.com/)** (integração nativa com Next.js).

### Checklist de produção

1. Conectar repositório GitHub à Vercel
2. Configurar **todas** as variáveis de `.env.example` no painel da Vercel
3. Definir `NEXT_PUBLIC_SITE_URL` com o domínio final (ex.: `https://crisdaspassagens.com.br`)
4. Usar connection string do **pooler** Supabase em `DATABASE_URL` quando possível
5. Executar migrações: `npm run db:migrate` (ou via script de build/deploy)
6. Criar buckets no Supabase Storage
7. Criar usuário admin via `npm run admin:create`
8. Validar SEO: `/sitemap.xml`, `/robots.txt`, [Rich Results Test](https://search.google.com/test/rich-results)

### Build

```bash
npm run build
npm run start
```

O script `build` executa `prisma generate` automaticamente.

## SEO

- `metadataBase` e URLs canônicas via `NEXT_PUBLIC_SITE_URL`
- Open Graph, Twitter Cards e keywords por página
- JSON-LD: Organization, WebSite, FAQPage, ItemList (blog destacado), Article, Breadcrumb
- Sitemap dinâmico com posts publicados
- Admin e rotas de API com `noindex`

## Documentação adicional

- [`docs/branding.md`](docs/branding.md) — identidade visual
- [`docs/project-context.md`](docs/project-context.md) — contexto e requisitos
- [`README_AGENT.md`](README_AGENT.md) — guia para agentes de IA

## Licença

Projeto privado — todos os direitos reservados.
