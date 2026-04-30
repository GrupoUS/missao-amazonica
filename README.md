# Missão Amazônica — Sal da Terra

Plataforma pública de doações da **Missão Amazônica – Sal da Terra**, missão anual da igreja (CNPJ) que atende comunidades ribeirinhas do Rio Negro durante uma semana em abril.

Site: <https://missao-amazonica.vercel.app>

## O que faz

- Página institucional (missão, projetos, transparência, impacto).
- Portal de doações com Pix (BR-Code + QR), confirmação automática via webhook bancário e fallback manual.
- Painel administrativo (`/admin`) para confirmar doações, publicar prestação de contas e administrar conteúdo.
- Relatórios públicos de prestação de contas com comprovantes e mídia, somando totais arrecadados, usados e reserva global.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Astro 5 (modo híbrido — SSG público + SSR para `/admin/**` e `/api/**`) |
| UI | React 19 (ilhas), Tailwind CSS v4 com design tokens Material 3, Lucide icons |
| Backend | Astro API routes + Supabase (Postgres, Auth, Storage, Realtime) |
| Pagamentos | Pix BR-Code (provedor bancário + confirmação manual) |
| Email | Resend |
| Observabilidade | Sentry |
| Deploy | Vercel |
| Locale / Moeda | pt-BR / BRL (inteiros em centavos) |
| Gerenciador de pacotes | **Bun** (exclusivo) |

## Pré-requisitos

- Node ≥ 20.18
- Bun ≥ 1.1.40
- Conta Supabase (projeto vinculado via CLI)
- Conta Vercel (para deploy)

## Setup local

```bash
bun install
cp .env.example .env.local   # preencher chaves Supabase, Sentry, Resend, Pix
bun run setup:supabase       # vincula projeto + migra schema + seed
bun run dev                  # http://localhost:4321
```

Variáveis principais (`.env.local`):

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PUBLIC_SITE_URL=http://localhost:4321
SENTRY_DSN=
RESEND_API_KEY=
PIX_PROVIDER=
```

## Scripts

| Comando | Função |
|---|---|
| `bun run dev` | servidor de desenvolvimento |
| `bun run build` | build de produção |
| `bun run preview` | preview do build |
| `bun run check` / `typecheck` | `astro check` (type-check) |
| `bun run db:push` | aplica migrações Supabase |
| `bun run db:gen-types` | regenera tipos TypeScript do schema |
| `bun run db:lint` | lint do schema |
| `bun run db:reset` | reseta DB vinculado |
| `bun run deploy` | deploy de produção na Vercel |

## Estrutura

```
src/
├── pages/              # rotas Astro (público prerender; admin/api SSR)
│   ├── api/            # endpoints + webhooks
│   └── admin/          # painel restrito
├── layouts/            # PublicLayout, AdminLayout
├── components/
│   ├── ui/             # primitivas (Card, Badge, Icon, EmptyState…)
│   └── <feature>/      # composições por domínio
├── lib/
│   ├── supabase/       # clientes (anon, ssr, admin)
│   ├── payments/       # provedores Pix
│   ├── email/          # Resend + templates
│   └── format/         # currency, date helpers
└── styles/global.css   # tokens Material 3 (@theme)

supabase/
└── migrations/         # NNNN_descricao.sql (RLS na mesma migration que o FK)

docs/                   # PROMPT.md (spec), DESIGN.md, planos de implementação
```

## Regras invioláveis do projeto

1. **Astro híbrido**: público prerender, `/admin/**` e `/api/**` SSR. Nunca SPA.
2. **Bun exclusivo**: nunca `npm` / `yarn` / `pnpm`.
3. **Ícones via `<Icon />`** (Lucide). Sem emojis na UI, sem Material Symbols.
4. **PII de doadores é privada**: `donor_email` / `donor_phone` admin-only via RLS. Leitura pública passa pela view `public_donor_list`.
5. **Totais derivados**: nunca editar somas manualmente — derivam de `donation_intents` confirmados via views/`confirm_donation()`.
6. **Webhooks idempotentes**: `payment_events` insere com `on conflict (provider, bank_end_to_end_id) do nothing returning id`.
7. **Dinheiro em centavos inteiros** (`*_cents`), nunca float.
8. **Todo FK tem índice na mesma migration**.
9. **Tokens semânticos** apenas em componentes (sem hex hardcoded fora de `global.css`).

Ver `.claude/overlay/missao-amazonica/CLAUDE-overlay.md` e `docs/PROMPT.md` para spec completa.

## Commits

Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `perf:`, `test:`.

## Licença

Privado — uso restrito da Missão Amazônica · Sal da Terra.
