# Project Snapshot — Missão Amazônica · Sal da Terra

> Project orientation. Loaded on demand when an agent needs architecture map, commands table, or detailed data model.

---

## Identity

| Field | Value |
|---|---|
| Type | Public donation platform (CNPJ church mission) |
| Mission | Missão Amazônica – Sal da Terra (Rio Negro communities, every April for one week) |
| Stack | Astro 6 hybrid · Bun · TypeScript (strict) · Tailwind CSS v4 · React 19 (islands only) |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Payments | Pix BR-Code (item-specific TXID) via provider abstraction |
| Email | Resend (graceful no-op when key missing) |
| Monitoring | `@sentry/astro` (optional, init on `SENTRY_DSN`) |
| Deploy | Vercel (`@astrojs/vercel`) |
| Locale / currency | pt-BR · BRL stored as integer cents |
| Icons | Lucide (no emoji, no Material Symbols) |
| Fonts | Inter (UI), Literata (wordmark), Nunito Sans (nav) |

---

## Architecture Map

```text
missao-amazonica/
├── src/
│   ├── pages/
│   │   ├── index.astro                       # Landing
│   │   ├── doar/
│   │   │   ├── index.astro                   # Listing (filters)
│   │   │   └── [slug].astro                  # Detail (SSR)
│   │   ├── prestacao-de-contas.astro         # Public accountability
│   │   ├── admin/
│   │   │   ├── login.astro
│   │   │   ├── logout.ts
│   │   │   ├── index.astro                   # Dashboard
│   │   │   ├── items/{index,new,[id]/edit}.astro
│   │   │   ├── donations/index.astro
│   │   │   ├── accountability/{index,new,[id]/edit}.astro
│   │   │   └── settings.astro
│   │   └── api/
│   │       ├── donations/{create,status}.ts
│   │       ├── webhooks/bank-pix.ts
│   │       └── admin/{manual-confirm,donations/export}.ts
│   ├── layouts/{PublicLayout,AdminLayout}.astro
│   ├── components/
│   │   ├── ui/                               # shadcn-style + Icon adapter
│   │   ├── donation/                         # ItemCard, DonationForm, PixPanel, RecentDonors
│   │   ├── accountability/                   # AccountabilityCard, Timeline
│   │   └── admin/                            # MetricCard, ItemsTable, LogsFeed, FileUpload
│   ├── lib/
│   │   ├── supabase/{server,browser,admin,types}.ts
│   │   ├── auth/admin-guard.ts
│   │   ├── payments/
│   │   │   ├── pix.ts                        # BR-Code EMV + QR
│   │   │   ├── registry.ts
│   │   │   └── providers/{types,bank-pix-provider,manual-provider,
│   │   │                  mercado-pago-provider.disabled,asaas-provider.disabled}.ts
│   │   ├── validators/donation.ts            # Zod
│   │   ├── email/{resend,templates/}
│   │   ├── monitoring/sentry.ts
│   │   ├── audit/log.ts
│   │   ├── icons.tsx + Icon component
│   │   └── format/{currency,date}.ts
│   ├── styles/global.css                     # Tailwind v4 @theme tokens
│   ├── middleware.ts                         # admin guard + Supabase session hydration
│   └── env.d.ts
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 0001_init.sql
│   │   ├── 0002_admin_users.sql
│   │   ├── 0003_views_fns.sql
│   │   ├── 0004_rls.sql
│   │   └── 0005_audit.sql
│   └── seed.sql
├── docs/
│   ├── PROMPT.md                             # Canonical product spec
│   ├── stitch-design/                        # 5 desktop mockups + DESIGN.md
│   └── e-design-execute-o-glowing-crystal.md # Implementation plan
├── astro.config.mjs                          # output: 'hybrid', adapter: vercel, integrations: [react, sentry]
├── tsconfig.json                             # strict, paths "@/*" → "./src/*"
├── package.json
├── .env.example
└── .gitignore
```

---

## Commands

| Task | Command |
|---|---|
| Install deps | `bun install` |
| Dev server | `bun run dev` |
| Build | `bun run build` |
| Preview | `bun run preview` |
| Type check | `bunx astro check` |
| Lint (Biome) | `bunx biome check --write` |
| Apply Supabase migrations | `bunx supabase db push` |
| Generate Supabase types | `bunx supabase gen types typescript --linked > src/lib/supabase/types.ts` |
| Lint SQL | `bunx supabase db lint` |
| Set Vercel env | `bunx vercel env add <KEY> production` |
| Deploy | `bunx vercel deploy --prod` |

---

## Data Model & Security Boundaries

Tables (full DDL in `supabase/migrations/0001_init.sql`):

`missions · categories · donation_items · donation_intents · payment_events · global_reserve_entries · accountability_entries · audit_logs · settings · admin_users`

**Auth model:**
- Public reads via RLS-enabled tables (`donation_items where status='published'`, `accountability_entries where is_public`) and curated views (`public_donor_list`, `landing_stats`, `global_reserve_total`)
- Admins are members of `admin_users(user_id references auth.users(id))`. Helper: `is_admin(uid)` plpgsql function
- Service-role client (`src/lib/supabase/admin.ts`) is **server-only**; throws if imported in a browser context

**Donation invariants:**
- `donation_items.target_amount_cents` is the goal; the collected total is **derived**, never stored mutable
- `donation_intents.status ∈ {pending, confirmed, expired, cancelled, failed}`. Only `confirmed` rows count toward totals
- A confirmed intent that exceeds `target_amount_cents` is split: portion up to remaining target stays attributed to the item; excess inserts a row into `global_reserve_entries`
- Idempotency: `payment_events` is unique on `(provider, bank_end_to_end_id)`. Webhook upserts `on conflict do nothing`

**Pix provider abstraction:**
- Default: `bank-pix-provider` (HMAC-SHA256 webhook verify on `x-signature` against `PIX_BANK_WEBHOOK_SECRET`)
- Fallback when `settings.bank_status='not_configured'`: `manual-provider` — webhook returns 501; admin uses `/api/admin/manual-confirm` to confirm and write a synthetic `payment_events` row with `provider='manual'`
- Mercado Pago / Asaas: `*.disabled.ts` stubs that throw `not_implemented`. Re-enable later without rewriting downstream code

---

## Design System (summary)

Authoritative source: [`docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md`](../../../docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md). Full rules: `${overlay}/rules/DESIGN.md`.

- Tokens in `src/styles/global.css` under Tailwind v4 `@theme { … }` (CSS custom properties)
- Brand: **Deep Amazon Green** primary (`#012d1d`), **River Teal** secondary (`#2c694e`), warm earthy neutrals. Dark mode is **not** a goal in MVP — light surfaces only
- Surface tiers: `surface-container-lowest` (cards), `surface` (page bg), `surface-container-low` (alt sections), `surface-container-high` (table headers, dividers)
- Status colors: `error-container` (urgent), `tertiary-fixed` (in transport / high), `secondary-container` (success / medium), `surface-container` (neutral / completed)
- Shadows: Level 1 = `0 4px 12px rgba(0,0,0,0.02)` for cards; Level 2 = `0 12px 24px rgba(0,0,0,0.04)` for modals/donation-box
- Radius: 0.25rem default, 0.5rem (`lg`) buttons/inputs, 0.75rem (`xl`) cards, 1.5rem (`3xl`) media
- Spacing scale: `xs 4` · `sm 8` · `md 16` · `lg 24` · `xl 32` · `xxl 48` · `huge 64` (8px grid, strict)
- Typography: Inter for all UI. Literata for wordmark only (header). Nunito Sans permitted in nav for legacy mockup parity
- Icons: **only** Lucide via `<Icon name="…" />`; mapping in `src/lib/icons.tsx`

Visual direction: trustworthy, calm, Stripe-like minimalism. No aggressive sales styling. Warmth through earthy neutrals, not corporate cold whites.

---

## Performance Gates (project-specific routes)

Generic thresholds in `.claude/config.json::gates`. Project routes:

- **Lighthouse ≥ 95** on `/`, `/doar`, `/prestacao-de-contas` (Performance, Accessibility, Best Practices, SEO)
- **LCP < 2.5s**: Astro `<Image>` for hero with `loading="eager"` + `fetchpriority="high"`; preconnect to fonts
- **CLS = 0**: every `<img>` carries explicit `width` + `height`
- **INP < 100ms**: minimize hydrated islands; use `client:visible` / `client:idle` (never `client:load` for non-LCP)
- **Initial JS < 50KB on prerendered pages**

---

## Pre-Delivery Checklist (project-specific)

Generic items in root `AGENTS.md`. Extends with:

- [ ] `bunx astro check` clean (0 errors, 0 warnings)
- [ ] `bun run build` succeeds with no missing-env warnings
- [ ] Lighthouse ≥ 95 on Performance / Accessibility / Best Practices / SEO for `/`, `/doar`, `/prestacao-de-contas`
- [ ] Lucide-only icons (`grep "material-symbols" src/` returns 0)
- [ ] All FKs have indexes (`grep "create index" supabase/migrations/`)
- [ ] RLS enabled on every table; anonymous psql session cannot select from `donation_intents`, `payment_events`, `audit_logs`
- [ ] Webhook idempotency verified (curl twice with same body → only one confirmation)
- [ ] Excess-to-reserve verified (curl with overage → row in `global_reserve_entries`)
- [ ] Donor consent enforced: anonymous + display-off donations do not appear in `public_donor_list`
- [ ] `.env.example` includes every key referenced in code
- [ ] Vercel env configured for all required keys
- [ ] Production smoke: `/`, `/doar/<slug>`, `/admin/login`

Full smoke test commands in `${overlay}/verify-supplements.md`.

---

## Pointers

- `${overlay}/CLAUDE-overlay.md` — Tier 1 supplement (cardinal rules, identity, routing)
- `${overlay}/rules/*.md` — domain-scoped Tier 2 rules (Astro+Supabase+Pix concrete)
- `${overlay}/anti-patterns.md` — Pix idempotency, donor PII, derived totals, SPA ban
- `${overlay}/routing-supplements.md` — donation flow, Pix providers, webhook routing
- `${overlay}/verify-supplements.md` — webhook idempotency, RLS anon deny, public_donor_list privacy
- `${overlay}/layer-map.md` — Astro+Supabase layer stack (loaded by `planning` skill)
- `${overlay}/seo-supplement.md` — pt-BR locale, sitemap, OG tags, Schema.org
- `${overlay}/debugger-domain-rules.md` — full anti-pattern catalog (loaded by `debugger` skill)
- `docs/PROMPT.md` — canonical product spec (frozen)
- `docs/stitch-design/` — design mockups + tokens
- `docs/e-design-execute-o-glowing-crystal.md` — implementation plan
