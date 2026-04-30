# Missão Amazônica — Sal da Terra · Agent Rules

> Single source of truth for AI agent behavior **and** project-level technical context.
> Companion: `.claude/CLAUDE.md` (Tier 1 always-loaded; reads this file first).

---

## Cardinal Rules (Non-Negotiable)

> [!CAUTION]
> These apply to every interaction, regardless of phase or domain.

1. **Never assume correctness.** Verify against official docs, runtime tests, or DB inspection before applying changes.
2. **Always debug after changes.** Every modification ends with a verification step. Never mark a task done without evidence it works.
3. **NEVER use emojis as UI icons.** Use **Lucide** SVG via `<Icon name="…" />` (`src/components/ui/Icon.astro`) only.
4. **NEVER use a SPA approach.** Build with **Astro hybrid** (`output: 'hybrid'`): public pages prerender to static HTML; only `/admin/**` and `/api/**` run SSR. Hybrid is not SPA.
5. **NEVER manually edit collected donation totals.** Totals derive from confirmed `donation_intents` via DB views. Excess goes to global reserve.
6. **NEVER expose donor PII publicly.** `donor_email`, `donor_phone` are admin-only via RLS. Public reads go through the `public_donor_list` view, which only includes consented + non-anonymous rows.

---

## Behavior

- Implement directly, don't just suggest. Code-first.
- Bun-only: `bun add`, `bun run`, `bunx`. Never `npm`/`yarn`/`pnpm`.
- POSIX shell, forward slashes in paths, even on Windows. Run commands in the provided bash; never wrap in `wsl -e`, `cmd /c`, or other launchers.
- Always run shell commands with a timeout; prefer non-interactive, self-terminating invocations.
- Reference applied rules when relevant (e.g., "per `.claude/rules/database.md` every FK needs an index").
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `perf:`, `test:`.

---

## Operational Mantra

```
Discover → Research → Plan → Implement → Validate
```

Principles:
- **KISS**: simplest solution that meets requirements.
- **YAGNI**: build only what the current spec demands; no "just in case" features.
- **Chain of Thought**: decompose into atomic, sequentially verifiable steps.

---

## Project Snapshot

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
| Lint (Biome) | `bunx biome check --write` (if installed) |
| Apply Supabase migrations | `bunx supabase db push` |
| Generate Supabase types | `bunx supabase gen types typescript --linked > src/lib/supabase/types.ts` |
| Lint SQL | `bunx supabase db lint` |
| Set Vercel env | `bunx vercel env add <KEY> production` |
| Deploy | `bunx vercel deploy --prod` |

---

## Design System

Authoritative source: [`docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md`](docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md).

Implementation:
- Tokens live in `src/styles/global.css` under Tailwind v4 `@theme { … }` (CSS custom properties, hex per DESIGN.md).
- Brand: **Deep Amazon Green** primary (#012d1d), **River Teal** secondary (#2c694e), warm earthy neutrals. Dark mode is **not** a goal in MVP — light surfaces only.
- Surface tiers: `surface-container-lowest` (cards), `surface` (page bg), `surface-container-low` (alt sections), `surface-container-high` (table headers, dividers).
- Status colors: `error-container` (urgent), `tertiary-fixed` (in transport / high), `secondary-container` (success / medium), `surface-container` (neutral / completed).
- Shadows: Level 1 = `0 4px 12px rgba(0,0,0,0.02)` for cards; Level 2 = `0 12px 24px rgba(0,0,0,0.04)` for modals/donation-box.
- Radius: 0.25rem default, 0.5rem (`lg`) buttons/inputs, 0.75rem (`xl`) cards, 1.5rem (`3xl`) media.
- Spacing scale: `xs 4` · `sm 8` · `md 16` · `lg 24` · `xl 32` · `xxl 48` · `huge 64` (8px grid, strict).
- Typography: Inter for all UI. Literata for the wordmark only (header). Nunito Sans permitted in nav for legacy mockup parity.
- Icons: **only** Lucide via `<Icon name="…" />`; mapping table maintained in `src/lib/icons.tsx` keyed by Material Symbols name (so 1:1 mockup parity is checkable).

Visual direction: trustworthy, calm, Stripe-like minimalism. No aggressive sales styling. Warmth through earthy neutrals, not corporate cold whites.

---

## Data Model & Security Boundaries

Tables (full DDL in `supabase/migrations/0001_init.sql`):

`missions · categories · donation_items · donation_intents · payment_events · global_reserve_entries · accountability_entries · audit_logs · settings · admin_users`

**Auth model:**
- Public reads via RLS-enabled tables (`donation_items where status='published'`, `accountability_entries where is_public`) and curated views (`public_donor_list`, `landing_stats`, `global_reserve_total`).
- Admins are members of `admin_users(user_id references auth.users(id))`. Helper: `is_admin(uid)` plpgsql function.
- Service-role client (`src/lib/supabase/admin.ts`) is **server-only**; throws if imported in a browser context.

**Donation invariants:**
- `donation_items.target_amount_cents` is the goal; the collected total is **derived**, never stored mutable.
- `donation_intents.status ∈ {pending, confirmed, expired, cancelled, failed}`. Only `confirmed` rows count toward totals.
- A confirmed intent that exceeds `target_amount_cents` is split: portion up to remaining target stays attributed to the item; excess inserts a row into `global_reserve_entries`.
- Idempotency: `payment_events` is unique on `(provider, bank_end_to_end_id)`. Webhook upserts `on conflict do nothing`.

**Pix provider abstraction:**
- Default: `bank-pix-provider` (HMAC-SHA256 webhook verify on `x-signature` against `PIX_BANK_WEBHOOK_SECRET`).
- Fallback when `settings.bank_status='not_configured'`: `manual-provider` — webhook returns 501; admin uses `/api/admin/manual-confirm` to confirm and write a synthetic `payment_events` row with `provider='manual'`.
- Mercado Pago / Asaas: `*.disabled.ts` stubs that throw `not_implemented`. Re-enable later without rewriting downstream code.

---

## Performance Gates

- **Lighthouse ≥ 95** on `/`, `/doar`, `/prestacao-de-contas` (Performance, Accessibility, Best Practices, SEO).
- **LCP < 2.5s**: Astro `<Image>` for hero with `loading="eager"` + `fetchpriority="high"`; preconnect to fonts.
- **CLS = 0**: every `<img>` carries explicit `width` + `height`.
- **INP < 100ms**: minimize hydrated islands; use `client:visible` / `client:idle` (never `client:load` for non-LCP).
- **Initial JS < 50KB on prerendered pages**.
- Tailwind v4 keeps generated CSS small via `@theme` token usage.

---

## Accessibility

- WCAG AA contrast minimum on all text/background pairs.
- `prefers-reduced-motion` respected (no entry animations, no scroll-driven effects).
- Focus rings: `outline: 2px solid var(--color-secondary)` on every interactive element.
- Skip link `.skip-link` jumps to `<main id="conteudo-principal" tabindex="-1">`.
- Semantic HTML: one `<h1>` per page, sectioning by `<section>`/`<article>`/`<nav>`.
- All form fields have associated `<label>`; all icon-only buttons have `aria-label`.
- Keyboard: full FAQ / modal / table navigation.

---

## Negative Constraints

- No `npm`/`yarn`/`pnpm`.
- No `console.log` in production code paths — use `src/lib/monitoring/sentry.ts` `captureException` or structured logger.
- No `as any`, no non-null `!` on optional values.
- No `href="#"`. Use `<button>` for actions and real `<a href="…">` for navigation.
- No emoji in UI; no Material Symbols font; no Font Awesome.
- No hardcoded hex outside `@theme`.
- No animation of `width` / `height` / `top` / `left` — `transform` and `opacity` only. For accordion-style expand/collapse, use CSS grid `grid-template-rows: 0fr ↔ 1fr`.
- No SPA frameworks (Next.js, Remix). Astro hybrid only.
- No direct mutation of derived donation totals from the admin UI.
- No public read access to `donation_intents`, `payment_events`, `audit_logs`.

---

## Pre-Delivery Checklist

- [ ] `bunx astro check` clean (0 errors, 0 warnings)
- [ ] `bun run build` succeeds with no missing-env warnings
- [ ] Lighthouse ≥ 95 on Performance / Accessibility / Best Practices / SEO for `/`, `/doar`, `/prestacao-de-contas`
- [ ] CLS = 0; LCP < 2.5s
- [ ] Responsive at 375 / 768 / 1024 / 1440 px without horizontal scroll
- [ ] Lucide-only icons (grep `material-symbols` in `src/` returns 0)
- [ ] `prefers-reduced-motion` honored (manual test)
- [ ] All FKs have indexes (`grep "create index" supabase/migrations/`)
- [ ] RLS enabled on every table; anonymous psql session cannot select from `donation_intents`, `payment_events`, `audit_logs`
- [ ] Webhook idempotency verified (curl twice with same body → only one confirmation)
- [ ] Excess-to-reserve verified (curl with overage → row in `global_reserve_entries`)
- [ ] Donor consent enforced: anonymous + display-off donations do not appear in `public_donor_list`
- [ ] `.env.example` includes every key referenced in code
- [ ] Vercel env configured for all required keys
- [ ] Production smoke: `/`, `/doar/<slug>`, `/admin/login`

---

## Debugging Protocol

When an error or unexpected result occurs:

1. **PAUSE** — do not retry blindly.
2. **THINK** — Root Cause Analysis: what happened, why (5 Whys), 3 candidate fixes with tradeoffs.
3. **HYPOTHESIZE** — pick one, write it down with a falsifiable validation plan.
4. **EXECUTE** — apply the fix.
5. **VERIFY** — confirm fix works; check no regression in adjacent flows.

After **2 failed attempts on the same hypothesis**, escalate via `evaluator` agent (Mode 3) or `/recover`. Do not loop.

---

## Pointers

- `.claude/CLAUDE.md` — Tier 1 always-loaded behavioral config
- `.claude/rules/backend.md` — Astro API + Supabase server patterns
- `.claude/rules/database.md` — Supabase schema/migration/RLS patterns
- `.claude/rules/frontend.md` — Astro + Tailwind v4 + island patterns
- `.claude/rules/integrations.md` — Pix providers, Resend, Sentry, Vercel
- `.claude/rules/stability.md` — universal stability checklist
- `docs/PROMPT.md` — canonical product spec (frozen)
- `docs/stitch-design/` — design mockups + tokens
- `docs/e-design-execute-o-glowing-crystal.md` — implementation plan
