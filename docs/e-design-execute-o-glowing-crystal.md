# Plan: Missão Amazônica — Sal da Terra (full donation platform)

## Context

Empty repo (only `AGENTS.md`, `.claude/`, `.git/`, `docs/`). User wants a one-shot bootstrap of the full donation platform per `docs/PROMPT.md`, styled per `docs/stitch-design/` (5 desktop mockups + Material-3-style design system in `miss_o_amaz_nica_design_system/DESIGN.md`), with all dependencies installed and platforms configured via CLI.

The platform supports public donations by item with item-specific Pix TXID, public accountability, admin management, donor consent, audit logs, RLS, Supabase Auth/Storage/Realtime, Resend email, Sentry-ready monitoring, deployed to Vercel.

**Complexity:** **L7 Complex** — schema + RLS + auth + 4 public pages + 6 admin pages + Pix payload generator + idempotent webhook + storage + realtime + email + monitoring + provider abstraction.

---

## Stack reconciliation (resolves project AGENTS.md vs PROMPT.md)

| Conflict | Resolution |
|---|---|
| AGENTS.md "NEVER SPA. MUST be statically generated via Astro" vs PROMPT.md "Astro SSR/Hybrid" with admin + `/api/webhooks/*` | **Astro hybrid mode**. Public pages `export const prerender = true` (static HTML). `/admin/**` + `/api/**` SSR via Vercel adapter. Hybrid is NOT SPA. |
| AGENTS.md "NEVER use emojis as UI icons. Lucide React SVG only" vs mockups using Material Symbols Outlined | Drop Material Symbols font. Replace 1:1 with **Lucide React** via `<Icon />` Astro wrapper + a fixed mapping table (Phase 2). |
| AGENTS.md GPUS deploy = Railway vs PROMPT.md Vercel | **Vercel** wins (PROMPT.md is the canonical spec for THIS project; AGENTS.md GPUS lines are from a sibling project). |
| Bun-only (AGENTS.md cardinal) | Keep — `bun` for install/runtime, `bunx` for one-off CLIs. |
| Tailwind v4 (AGENTS.md) + shadcn/ui (PROMPT.md) | Tailwind v4 with `@theme` directive. shadcn/ui v4-compatible components copied into `src/components/ui/` selectively (Button, Input, Select, Dialog, Badge, Toast). |
| Cardinal "NEVER assume correctness" + "Always debug after changes" | Each phase has a verify step. Final phase = end-to-end smoke + Vercel deploy. |

**Final stack:** Astro 6 hybrid · Bun · Tailwind CSS v4 · React 19 (islands only where needed) · Lucide React · Supabase (Postgres + Auth + Storage + Realtime) · Zod · Resend · Sentry · Pix BR-Code generator (`qrcode` npm) · Vercel adapter.

---

## Layer order (execution sequence)

```
Rewrite AGENTS.md / CLAUDE.md / .claude/rules → Bootstrap
  → Tokens/Fonts/Lucide → Supabase schema+RLS → Storage buckets
  → Auth + admin guard middleware
  → Reusable UI components
  → Public pages (/, /doar, /doar/[slug], /prestacao-de-contas)
  → Pix provider abstraction + donation API endpoints
  → Webhook + confirmation + excess→reserve logic
  → Admin pages (login, dashboard, items, donations, accountability, settings)
  → Realtime + Resend email + Sentry-ready
  → Validation + Vercel deploy
```

---

## Pre-flight (user runs interactively before /implement)

```bash
# 1. Auth Supabase
bunx supabase login

# 2. Auth Vercel
bunx vercel login

# 3. (later) Resend account + create API key at https://resend.com/api-keys
# 4. (optional) Sentry project — copy DSN
```

These cannot run from inside `/implement` (interactive auth). Plan documents them; user supplies session.

---

## Phase 0 — Rewrite agent rule files for THIS project [SEQUENTIAL, FIRST]

Both `AGENTS.md` and `.claude/CLAUDE.md` (+ all `.claude/rules/*.md`) were copied from sibling projects (GPUS institutional Astro site + NeonDash tRPC/Drizzle/Clerk/Neon). Their stack details misguide implementation. Rewrite to reflect Missão Amazônica's actual stack.

**Preserve from current files (universal):**
- Cardinal rules: never assume correctness, always debug after changes, no emojis as UI icons
- D.R.P.I.V mantra (Discover → Research → Plan → Implement → Validate)
- KISS / YAGNI / Chain-of-Thought principles
- "Implement directly, don't just suggest"
- Bun-only, never npm/yarn/pnpm
- Conventional Commits

**Drop from current files (project-irrelevant):**
- NeonDash references: `apps/api/`, `apps/web/`, Drizzle schema, tRPC procedures, Clerk auth, Neon DB, multi-tenant mentorado/admin procedure hierarchy, Baileys/WhatsApp/Instagram/Meta/Stripe integrations, `_core/` singletons, `bun run db:push` referring to Drizzle
- GPUS references: Railway deploy, GPUS theme (Navy/Gold), Playfair/Inter only, "intentional minimalism" Avant-Garde positioning, OTB Dubai/Na Mesa Certa product collections, Cursor MCP server matrix (Tavily/Context7/shadcn/etc — those are user-configured tooling, not project tooling), the entire "Learnings log (evolve)" section with sibling-project run records
- Tier 2/3 doc pointers to files that don't exist in this repo (`.claude/docs/architecture/*`, `.claude/docs/design-specs/*`, `apps/api/drizzle/AGENTS.md`)

**Add for THIS project:**
- Stack snapshot: Astro 6 hybrid + Bun + Tailwind v4 + React 19 islands (only when needed) + Lucide React/SVG + Supabase (Postgres/Auth/Storage/Realtime) + Zod + Resend + Sentry-ready + Pix BR-Code via `qrcode` + Vercel adapter
- Project type: Public donation platform (CNPJ church mission) — donors + admins
- Architecture map: `src/pages/{index,doar/[slug],prestacao-de-contas,admin/**,api/**}`, `src/components/{ui,donation,accountability,admin}`, `src/layouts/{PublicLayout,AdminLayout}.astro`, `src/lib/{supabase,payments,validators,email,monitoring,auth}`, `supabase/{migrations,seed.sql}`
- Pix provider abstraction: `bank-pix-provider` (default with HMAC webhook), `manual-provider` (fallback), Mercado Pago/Asaas as `.disabled.ts` stubs
- RLS-first security model: public reads via views (`public_donor_list`, `landing_stats`); donor PII never publicly readable; service-role client server-only; admin-only via `admin_users` table + `is_admin(uid)` helper
- Hybrid mode rules: public pages `export const prerender = true`; `/admin/**` + `/api/**` SSR only; **never SPA approach** (per cardinal rule), Astro hybrid satisfies it
- Lucide rule: replace any Material Symbols / emoji icon with Lucide via `<Icon name="…" />` adapter (`src/components/ui/Icon.astro`); maintain mapping in `src/lib/icons.tsx`
- pt-BR locale, BRL currency stored in cents (integer), R$ formatting via `Intl.NumberFormat`
- Performance gates: Lighthouse ≥95 on /, /doar, /prestacao-de-contas; LCP < 2.5s; CLS = 0; initial JS < 50KB on prerendered pages
- Accessibility: WCAG AA contrast, `prefers-reduced-motion`, skip link, semantic headings, focus rings on all interactive elements
- Stability checklist (kept from stability.md, paths swapped for Astro):
  - Wrap `mutateAsync`/fetch errors in try/catch with user-facing toast
  - Never use `href="#"`; `<button>` for actions
  - No `console.log` in production — use Sentry or structured logger
  - No `as any` / non-null `!` assertions on optional data
  - Always guard Supabase `.select()`/`.insert().select()` array results before destructuring
  - Idempotency on `payment_events(provider, bank_end_to_end_id)` is mandatory
  - Webhooks acknowledge quickly, ID-check before processing
  - All FKs need an index in migrations
  - Public env reads use `PUBLIC_` prefix; service-role only via server module that throws if `import.meta.env.SSR === false`

**Files to write:**

- [ ] `AGENTS.md` (root) — full rewrite: Cardinal Rules → Behavior → Stack → Architecture map → Commands (`bun run dev|build|preview|astro check`, `bunx supabase db push`, `bunx supabase gen types`, `bunx vercel deploy`) → Design system (link to `docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md`) → RLS / Pix / Auth boundaries → Performance gates → Accessibility → Pre-delivery checklist (Lighthouse, build, typecheck, manual smoke). Keep under ~350 lines.
- [ ] `.claude/CLAUDE.md` — full rewrite: Tier 1 always-loaded; reads root `AGENTS.md` first; classifies intent L1–L5; routing matrix (frontend → component, API → endpoint + Zod, schema → migration + RLS); invoke `planning` skill before any L4+ work; sequential-thinking trigger only for genuine multi-domain decisions; stopping conditions (max 3 fix attempts, max 5 agent spawns, scope creep → ask). Under ~200 lines.
- [ ] `.claude/rules/backend.md` — replace NeonDash content. Cover: Astro API routes (`src/pages/api/**`, `export const prerender = false`, `APIRoute` typing), Zod validation at module scope, Supabase server client via `@supabase/ssr` reading `Astro.cookies`, RLS as primary auth (no manual role guards inside endpoints — RLS enforces), service-role only inside `/api/webhooks/**` and admin-action endpoints, idempotent webhook patterns, structured error responses `{ error, code }`, Resend wrapper graceful no-op without key.
- [ ] `.claude/rules/database.md` — replace Drizzle content. Cover: Supabase migrations under `supabase/migrations/NNNN_name.sql`; one logical change per file; `bunx supabase db push` to apply; `bunx supabase gen types --linked > src/lib/supabase/types.ts` after schema change; every FK gets an index; check constraints for enum-style text columns; RLS enabled on every table; deny-by-default; views with `security_invoker=on`; `is_admin(uid)` helper; never expose `donation_intents.donor_email/donor_phone` via RLS — use `public_donor_list` view; column-level grants to keep `confirmed_amount_cents` immutable from admin UI.
- [ ] `.claude/rules/frontend.md` — replace shadcn/Tanstack Query content. Cover: Astro components default (`.astro`); React island only when interactivity required (DonationForm, PixPanel, ItemsTable, Toast, FileUpload); `client:visible` / `client:idle` (never `client:load` for non-LCP); semantic Tailwind tokens via `@theme` (no hardcoded hex); shadcn/ui ported into `src/components/ui/` selectively (Button, Input, Select, Dialog, Badge, Toast); Lucide via `<Icon />` Astro wrapper for SSR; mobile-first; sticky mobile CTA on `/doar/[slug]`; `prefers-reduced-motion` respected; image `width`/`height` always set (CLS=0).
- [ ] `.claude/rules/integrations.md` — replace Meta/WhatsApp/Stripe etc. with project-relevant: Supabase (Auth flows, Storage signed URLs, Realtime channels), Pix providers (bank_pix HMAC verification, manual fallback, idempotency on payment_events), Resend (graceful no-op, retry on 5xx), Sentry (`@sentry/astro`), Vercel (env management via `bunx vercel env add`, ISR/edge runtime considerations).
- [ ] `.claude/rules/stability.md` — keep skeleton; swap paths from `apps/api/`, `apps/web/` to Astro layout; remove tRPC procedure hierarchy; keep idempotency/CORS/console-log/`!`-assertion/auth-procedure-equivalent (replaced by RLS) bullets.
- [ ] **Delete** any rule files that reference apps/, drizzle, clerk, baileys, etc. — confirm none remain after rewrite.
- [ ] **Verify**: `grep -ri "drizzle\|clerk\|baileys\|neondash\|GPUS\|Railway\|wsl -e bash" .claude/ AGENTS.md` returns 0 hits.

**Verify:** Spawn one fresh `Explore` agent with prompt "What stack does this project use? Cite AGENTS.md sections." Should answer Astro hybrid + Supabase + Vercel + Bun + Tailwind v4 + Pix abstraction. No mention of NeonDash/GPUS/Drizzle/Clerk.

---

## Phase 1 — Bootstrap [SEQUENTIAL]

Cannot use `bunx create astro` directly: working dir is non-empty (`AGENTS.md`, `.claude/`, `docs/`). Manually scaffold instead.

- [ ] `package.json` — name, scripts: `dev`, `build`, `preview`, `astro`, `lint`, `typecheck`, `db:push`, `db:gen-types`
- [ ] `bun add astro @astrojs/vercel @astrojs/react react react-dom @astrojs/check typescript`
- [ ] `bun add -D tailwindcss @tailwindcss/vite @types/react @types/react-dom @types/node`
- [ ] `bun add @supabase/supabase-js @supabase/ssr zod lucide-react clsx tailwind-merge qrcode resend @sentry/astro ulid`
- [ ] `bun add -D @types/qrcode supabase`
- [ ] `astro.config.mjs` — `output: 'hybrid'`, `adapter: vercel({ webAnalytics: { enabled: false } })`, `integrations: [react(), sentry()]`, `vite: { plugins: [tailwindcss()] }`
- [ ] `tsconfig.json` — extends `astro/tsconfigs/strict`, paths `@/*` → `./src/*`
- [ ] `.env.example` — full set per PROMPT.md §Environment Variables
- [ ] `.env` — placeholder local values (NOT committed)
- [ ] `.gitignore` — `.env`, `dist/`, `.vercel/`, `.astro/`, `node_modules/`, `supabase/.temp`
- [ ] `src/env.d.ts` — declare `ImportMetaEnv` for Supabase keys

**Verify:** `bunx astro check` passes (empty src), `bun run build` succeeds with placeholder env.

---

## Phase 2 — Design tokens, fonts, Lucide adapter [SEQUENTIAL]

- [ ] `src/styles/global.css`:
  - `@import "tailwindcss";`
  - `@theme { /* color tokens from DESIGN.md exact hex */ --color-primary: #012d1d; --color-primary-container: #1b4332; --color-on-primary: #ffffff; --color-on-primary-container: #86af99; --color-secondary: #2c694e; --color-secondary-container: #aeeecb; --color-on-secondary-container: #316e52; --color-tertiary: #401b1b; --color-tertiary-container: #5a302f; --color-error: #ba1a1a; --color-error-container: #ffdad6; --color-on-error-container: #93000a; --color-surface: #f9faf6; --color-background: #f9faf6; --color-surface-container-lowest: #ffffff; --color-surface-container-low: #f3f4f1; --color-surface-container: #eeeeeb; --color-surface-container-high: #e8e8e5; --color-surface-container-highest: #e2e3e0; --color-surface-variant: #e2e3e0; --color-surface-tint: #3f6653; --color-surface-bright: #f9faf6; --color-on-surface: #1a1c1a; --color-on-surface-variant: #414844; --color-outline: #717973; --color-outline-variant: #c1c8c2; --color-tertiary-fixed: #ffdad8; --color-on-tertiary-fixed: #331111; --color-on-tertiary-fixed-variant: #673a39; --color-secondary-container-fix: #b1f0ce; (full list); --font-sans: "Inter", system-ui, sans-serif; --font-display: "Literata", serif; --font-nav: "Nunito Sans", sans-serif; --spacing-xs: 4px; --spacing-sm: 8px; --spacing-md: 16px; --spacing-lg: 24px; --spacing-xl: 32px; --spacing-xxl: 48px; --spacing-huge: 64px; --radius: 0.25rem; --radius-lg: 0.5rem; --radius-xl: 0.75rem; --radius-2xl: 1rem; --radius-3xl: 1.5rem; --radius-full: 9999px; }`
  - Google Fonts `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Literata:wght@600;700&family=Nunito+Sans:wght@400;500;600;700&display=swap');`
  - Custom utilities: `.glass-card { … }`, `.bg-mesh { … }` skipped (not in mockups), instead use Level 1 shadow class `.shadow-card { box-shadow: 0 4px 12px rgba(0,0,0,0.02); }`, `.shadow-card-hover { 0 12px 24px rgba(0,0,0,0.05); }`, `.shadow-modal { 0 12px 24px rgba(0,0,0,0.04); }`
  - Skip link `.skip-link` (a11y)
- [ ] `src/lib/icons.tsx` — `<Icon name="…" size={20} />` React island that maps Material-Symbols names to Lucide imports. Mapping (locked from mockup audit):

  | Material name | Lucide |
  |---|---|
  | account_circle | CircleUser |
  | volunteer_activism | HandHeart |
  | verified | BadgeCheck |
  | monitor_heart | HeartPulse |
  | handshake | Handshake |
  | arrow_forward | ArrowRight |
  | priority_high | AlertTriangle |
  | check_circle | CircleCheck |
  | local_shipping | Truck |
  | shopping_cart | ShoppingCart |
  | picture_as_pdf | FileText |
  | download | Download |
  | dashboard | LayoutDashboard |
  | forest | TreePine |
  | receipt_long | ReceiptText |
  | settings | Settings |
  | payments | Banknote |
  | inventory_2 | Package |
  | diversity_3 | Users |
  | trending_up | TrendingUp |
  | pending_actions | TimerReset |
  | flag | Flag |
  | add_circle | CirclePlus |
  | add | Plus |
  | search | Search |
  | expand_more | ChevronDown |
  | filter_list | ListFilter |
  | content_copy | Copy |
  | person_off | UserX |
  | water_drop | Droplets |
  | eco | Leaf |
  | savings | PiggyBank |
  | chevron_left/right | ChevronLeft/Right |
  | edit | Pencil |
  | delete | Trash2 |
  | visibility | Eye |
  | history | History |
  | receipt | Receipt |
  | edit_note | NotebookPen |
  | location_on | MapPin |
  | medical_services | Stethoscope |
  | favorite | Heart |
  | groups | Users2 |
  | photo_camera | Camera |

- [ ] `src/components/ui/Icon.astro` — Astro-native variant for static SSR (avoids hydration cost on every icon). Uses Lucide static SVG strings (`lucide` package, NOT `lucide-react`, for SSR-safe SVG output).
- [ ] `bun add lucide` — vanilla SVG strings for SSR.

**Verify:** `bun run build`; create scratch page rendering all token swatches + 5 sample icons; visual diff acceptable.

---

## Phase 3 — Supabase schema, RLS, storage [SEQUENTIAL]

User pre-flight (already done above): `supabase login`. New steps in `/implement`:

```bash
bunx supabase init                         # creates supabase/ dir + config.toml
# user picks/creates project ref:
bunx supabase link --project-ref <REF>     # interactive auth password
```

Migrations (apply in order with `bunx supabase db push`):

- [ ] `supabase/migrations/0001_init.sql` — every table per PROMPT.md §Data Model, columns + types verbatim. **All FKs get an index** (`create index on donation_items(mission_id);` etc.). Unique on `donation_items.slug`, `donation_items.pix_txid`, `donation_intents.pix_txid`, `payment_events(provider, bank_end_to_end_id)`. Check constraints on enum-style text columns (`urgency in ('low','medium','high','urgent')`, `status` enums, `image_type in ('real','illustrative')`).
- [ ] `supabase/migrations/0002_admin_users.sql` — `admin_users(user_id uuid pk references auth.users(id) on delete cascade, email text not null, created_at timestamptz default now())`. Function `public.is_admin(uid uuid) returns boolean language sql security definer stable as $$ select exists(select 1 from admin_users where user_id = uid) $$;`. Grant execute to authenticated.
- [ ] `supabase/migrations/0003_views_fns.sql`:
  - View `confirmed_amount_by_item` — `select item_id, sum(amount_cents) where status='confirmed'` from `donation_intents`
  - View `public_donor_list` — `select item_id, donor_name, amount_cents, confirmed_at from donation_intents where status='confirmed' and is_anonymous=false and display_name_publicly=true`
  - View `global_reserve_total` — `select coalesce(sum(amount_cents),0) total from global_reserve_entries`
  - View `landing_stats` — totals (raised, projects active, items completed, reserve)
  - Function `confirm_donation(p_intent_id uuid, p_event_id uuid, p_amount integer)` — locks intent row, transitions pending→confirmed, computes excess vs target_amount_cents, inserts global_reserve_entries when excess > 0
- [ ] `supabase/migrations/0004_rls.sql`:
  - Enable RLS on all tables.
  - **missions, categories**: select for `anon` where `is_active=true`; all for `authenticated` where `is_admin(auth.uid())`.
  - **donation_items**: select for `anon` where `status='published'`; all for admin.
  - **donation_intents**: insert for `anon` (only allowed cols, no status forging — column-level grants); select admin only (donor reads via `public_donor_list` view).
  - **payment_events**, **audit_logs**, **global_reserve_entries**: admin only.
  - **accountability_entries**: select for `anon` where `is_public=true`; all for admin.
  - **settings**: select for `anon` only `key in ('site_name','contact_email','social_links','mission_text')`; full for admin.
  - **admin_users**: read self + admin; no public read.
  - Views inherit RLS from base tables; mark `public_donor_list` as `security_invoker=on`.
- [ ] `supabase/migrations/0005_audit.sql` — trigger `audit_admin_changes()` on update/delete of donation_items, accountability_entries, settings → insert into audit_logs.
- [ ] `supabase/seed.sql` — 1 mission row, 6 categories (Saúde, Alimentação, Educação, Infraestrutura, Logística, Espiritualidade), 3 sample items (filtros, cestas, kits escolares matching mockup data), settings keys `pix_key`, `pix_merchant_name`, `pix_merchant_city`, `bank_status='not_configured'`, `mission_text` (placeholder pt-BR).
- [ ] Storage buckets (created via `supabase/config.toml` storage section + SQL):
  - `item-images` — public read, admin write (RLS via storage policies)
  - `accountability-proofs` — public read, admin write
  - `donor-uploads` — admin read+write only

```bash
bunx supabase db push
bunx supabase gen types typescript --linked > src/lib/supabase/types.ts
```

**Verify:** `bunx supabase db lint` clean; types file generated with all tables; sample query from psql confirms RLS blocks `select` on `donation_intents` from `anon` JWT.

---

## Phase 4 — Supabase clients + auth middleware [SEQUENTIAL]

- [ ] `src/lib/supabase/server.ts` — `createServerClient` from `@supabase/ssr` reading cookies from `Astro.cookies` (helper takes `Astro` context).
- [ ] `src/lib/supabase/browser.ts` — `createBrowserClient` for React islands.
- [ ] `src/lib/supabase/admin.ts` — service-role client; **server-only** (throw if `import.meta.env.SSR === false`).
- [ ] `src/middleware.ts` — Astro middleware: on every request, hydrate Supabase session into `context.locals.supabase` + `context.locals.user`. For `/admin/**` (except `/admin/login`): redirect to `/admin/login` if no session; redirect to `/admin/login?error=not_admin` if session but `is_admin` returns false.
- [ ] `src/lib/auth/admin-guard.ts` — `requireAdmin(Astro)` SSR helper for individual admin pages (defense in depth).
- [ ] `src/env.d.ts` — extend `App.Locals` typing.

**Verify:** anonymous `curl /admin` → 302 to `/admin/login`; with non-admin session → 302 with `?error=not_admin`.

---

## Phase 5 — Layouts + reusable UI [SEQUENTIAL → PARALLEL within layer]

- [ ] `src/layouts/PublicLayout.astro` — html shell, fonts preconnect, skip link, header (Literata wordmark + nav: Missão, Projetos, Transparência, Impacto, login, "Contribuir" CTA), footer (CNPJ block + links). Match landing/listing/detail/accountability mockups verbatim.
- [ ] `src/layouts/AdminLayout.astro` — sidebar (`w-64 fixed left-0`) with admin profile + nav (Painel, Doações, Projetos, Logs, Configurações) + "Novo Projeto" CTA at bottom; main content `ml-64 max-w-[1280px] px-lg py-xl`.
- [ ] UI primitives in `src/components/ui/`:
  - `Button.astro` — variants `primary` (bg-primary-container text-on-primary), `secondary` (border-secondary text-secondary), `ghost`, `destructive`. Slots for left/right icons.
  - `Card.astro` — variants `default`, `metric` (with left-border accent prop), `accountability` (status-color left-border).
  - `Badge.astro` — variants `category` (bg-surface-container-lowest/90 backdrop-blur), `urgency` (urgent=error-container, high=tertiary-fixed, medium=secondary-container, low=surface-container), `status` (planned/purchased/delivered/completed).
  - `ProgressBar.astro` — props `pct`, `exceeded`. Track h-2 bg-surface-container-high, fill bg-primary-container; if exceeded, fill bg-secondary + small "+X% excedente" caption.
  - `Input.astro`, `Select.astro`, `Textarea.astro` — Tailwind forms plugin, focus:border-secondary.
  - `Modal.astro` — `<dialog>` element + close on backdrop.
  - `Toast.tsx` — react island, Sonner-style.
  - `EmptyState.astro`, `LoadingState.astro`, `ErrorState.astro`.
- [ ] `src/components/donation/`:
  - `ItemCard.astro` — image with urgency badge top-right + category badge top-left, title, desc, progress, CTA "Doar Agora" (matches `donation_items_list_desktop`).
  - `DonationForm.tsx` (react island) — Zod-validated form: amount (R$ input with cents), name (optional), email (optional), phone (optional), `is_anonymous` checkbox, `display_name_publicly` checkbox + clear LGPD consent text. Submit → POST `/api/donations/create` → on success show `<PixPanel>`.
  - `PixPanel.tsx` (react island) — QR (data URL from response), copy-paste code button, status text polling `/api/donations/status?intentId=…` every 5s, transitions pending→confirmed.
  - `RecentDonors.astro` — fetches from `public_donor_list` view, shows initials avatar + name + amount + relative time.
- [ ] `src/components/accountability/AccountabilityCard.astro` — status badge top-right, status-colored left-border, links to proof + photos (per `accountability_transparency_desktop`).
- [ ] `src/components/admin/`:
  - `MetricCard.astro` (per dashboard mockup)
  - `ItemsTable.tsx` (react island) — sortable, search, hover-action buttons (edit/delete)
  - `LogsFeed.astro` (timeline rendering of `audit_logs`)
  - `FileUpload.tsx` — uploads to Supabase Storage via signed URL
  - `Timeline.astro` (accountability + project updates)

**Verify:** `bun run dev` → manual visit to `/_dev/components` (temp scratch route, removed in Phase 11) renders all primitives.

---

## Phase 6 — Public pages [PARALLEL after Phase 5]

Each prerendered (`export const prerender = true`) at build, refreshed on rebuild + ISR via Vercel where applicable. Fetch from Supabase via `server.ts` client at request time when prerender=false (item detail).

- [ ] `src/pages/index.astro` (prerender=true) — Hero (image bg `from-background/90 via-background/60 to-transparent` overlay), Trust bar (3 indicators), "Nossa Missão" 2-col with photo, "Impacto em Números" bento (3 stat cards from `landing_stats` view), "Itens Urgentes" 3-col grid (top 3 items by urgency desc), Footer.
- [ ] `src/pages/doar/index.astro` (prerender=true) — header with title + subtitle, filter bar (category select, urgency select, search input), 3-col grid card list. Filters apply client-side over hydrated payload (small N, OK).
- [ ] `src/pages/doar/[slug].astro` (prerender=false, SSR) — `getStaticPaths` skipped (SSR); fetch item by slug → 8-col left (gallery, title, description prose, "Atualizações do Projeto" timeline) + 4-col right sticky sidebar (PixPanel placeholder until form submitted, RecentDonors, "Outras Formas de Doar" CTA).
- [ ] `src/pages/prestacao-de-contas.astro` (prerender=true; rebuild every 10min via Vercel ISR or refresh on admin write later) — Header, "Relatório de Prestação de Contas" 3-col bento of accountability cards, "Reserva Global" 2-col bottom (left = explanation + balance from `global_reserve_total`, right = report download list).

**Verify:** all pages render with seeded data; mobile breakpoints 375/768/1024/1440 — no horizontal scroll, sticky sidebar collapses on mobile.

---

## Phase 7 — Pix provider abstraction + donation API [SEQUENTIAL]

- [ ] `src/lib/payments/pix.ts` — Pix BR-Code (EMV) generator. Pure function `buildPixPayload({ pixKey, txid, amountCents, merchantName, merchantCity, description? }) → { payload: string, qrDataUrl: string }`. Payload follows BR EMV: ID 00 (payload format), 26 (merchant account info → GUI br.gov.bcb.pix + key + description), 52 (MCC 0000), 53 (currency 986), 54 (amount), 58 (BR), 59 (merchant name max 25), 60 (city max 15), 62 (additional → TXID under 25 chars), 63 (CRC16/CCITT-FALSE on full string + "6304"). QR via `qrcode.toDataURL(payload, { errorCorrectionLevel: 'M', margin: 1, width: 192 })`.
- [ ] `src/lib/payments/providers/types.ts` — interface `PixProvider { id: 'bank_pix'|'manual'|'mercado_pago'|'asaas'; createIntent(args): Promise<{ payload, qrDataUrl, txid, expiresAt }>; verifyWebhook?(req): Promise<{ valid: boolean; event?: ParsedEvent }>; queryStatus?(txid): Promise<'pending'|'confirmed'|'failed'>; }`.
- [ ] `src/lib/payments/providers/bank-pix-provider.ts` — default; reads `PIX_KEY`, `PIX_MERCHANT_NAME`, `PIX_MERCHANT_CITY` from env. `createIntent` calls `buildPixPayload`. `verifyWebhook` HMAC-SHA256 over body using `PIX_BANK_WEBHOOK_SECRET` against `x-signature` header (constant-time compare). `queryStatus` returns 'pending' (no bank API yet).
- [ ] `src/lib/payments/providers/manual-provider.ts` — `createIntent` identical (still generates QR). `verifyWebhook` always `{ valid: false }`. UI shows note "confirmação manual pelo financeiro".
- [ ] `src/lib/payments/providers/mercado-pago-provider.disabled.ts` — stub throws `not_implemented`.
- [ ] `src/lib/payments/providers/asaas-provider.disabled.ts` — stub throws `not_implemented`.
- [ ] `src/lib/payments/registry.ts` — async `getProvider(supabase)`; reads `settings.bank_status` row → returns `bank-pix-provider` if `'api_configured'|'webhook_configured'`, else `manual-provider`.
- [ ] `src/lib/validators/donation.ts` — `CreateIntentSchema = z.object({ itemId: z.string().uuid(), amountCents: z.number().int().min(100).max(1_000_000_00), donorName: z.string().trim().max(120).optional(), donorEmail: z.string().email().max(254).optional(), donorPhone: z.string().trim().max(20).optional(), isAnonymous: z.boolean().default(false), displayNamePubliclyConsent: z.boolean().default(false) })`.
- [ ] `src/pages/api/donations/create.ts` — `export const prerender = false; export const POST: APIRoute`. Validate via Zod. Fetch item (must be `published`). Generate TXID `MIS${itemId.slice(0,8)}${ulid().slice(-12)}` (uppercase, ≤25 chars). `getProvider(supabase).createIntent(...)`. Insert `donation_intents` (status 'pending', `expires_at = now()+30min`). Return `{ intentId, payload, qrDataUrl, expiresAt }`. On error → `{ error, code }` 400/500.
- [ ] `src/pages/api/donations/status.ts` — `export const GET: APIRoute`. Query `donation_intents` by `intentId`, return `{ status, confirmedAt }`. RLS blocks cross-donor reads (donor included via cookie/session — for simplicity, MVP returns status without auth, indexed by intent UUID = unguessable enough for MVP, documented).

**Verify:** `curl -X POST localhost:4321/api/donations/create -d '{"itemId":"…","amountCents":5000}'` → returns payload, QR base64; row exists in `donation_intents` with status pending; `confirmed_amount_by_item` view unchanged.

---

## Phase 8 — Webhook + confirmation + excess→reserve [SEQUENTIAL]

- [ ] `src/pages/api/webhooks/bank-pix.ts` — `export const prerender = false`. POST handler:
  1. Read body as text + `x-signature`. Get provider via registry. If `verifyWebhook` returns `{ valid: false }` and a secret IS configured → 401. If no secret configured → 501 "bank webhook not configured" (kept disabled in production-safe way per PROMPT.md).
  2. Parse event: extract `txid`, `amount_cents`, `bank_end_to_end_id`, `event_type`.
  3. Idempotent insert into `payment_events` (`on conflict (provider, bank_end_to_end_id) do nothing returning id`). If no row returned → ack 200 (replay).
  4. Match `donation_intents` by `pix_txid = txid` + `amount_cents = amount_cents` + `status = 'pending'`. If none → ack 200 + log warn (orphan event).
  5. Call `confirm_donation(intent_id, event_id, amount)` plpgsql fn (Phase 3 migration). Inside fn: `for update` lock; transition status to `confirmed`; compute excess = `(current_total + amount) - target`; insert `global_reserve_entries` if excess > 0.
  6. Insert `audit_logs` row (`action='donation_confirmed', entity_type='donation_intent', entity_id=…`).
  7. Trigger Resend email (donor + admin) if configured.
  8. Ack 200.
- [ ] `src/pages/api/admin/manual-confirm.ts` — admin-only POST: requires session + `is_admin`; body `{ intentId, adminNotes }`. Generates synthetic `payment_events` with `provider='manual'` + `bank_end_to_end_id='MAN-' + intentId`. Calls `confirm_donation`. Logs audit with `before_data/after_data` JSON.

**Verify:**
```bash
# Simulate webhook locally
curl -X POST localhost:4321/api/webhooks/bank-pix \
  -H "x-signature: $(node -e 'console.log(require("crypto").createHmac("sha256",process.env.PIX_BANK_WEBHOOK_SECRET).update(JSON.stringify({txid:"MIS…",amount_cents:5000,bank_end_to_end_id:"E000001"})).digest("hex"))')" \
  -d '{"txid":"MIS…","amount_cents":5000,"bank_end_to_end_id":"E000001"}'
# → 200; donation_intents.status = 'confirmed'; confirmed_amount_by_item updated.
# Replay same body → 200 (no double-count).
# Send overage event → global_reserve_entries row inserted.
```

---

## Phase 9 — Admin pages [SEQUENTIAL]

- [ ] `src/pages/admin/login.astro` — Supabase Auth email/password form. On submit (form action POST same route handler) → `supabase.auth.signInWithPassword`. On success redirect to `/admin`. Show error if not in `admin_users`.
- [ ] `src/pages/admin/logout.ts` — POST → `supabase.auth.signOut` → redirect `/admin/login`.
- [ ] `src/pages/admin/index.astro` — dashboard per mockup: 3 metric cards (Doações Arrecadadas R$, Itens Ativos, Comunidades Atendidas), 2-col layout (2/3 = ItemsTable with search/pagination, 1/3 = LogsFeed timeline).
- [ ] `src/pages/admin/items/index.astro` — full table view, "Novo Item" CTA.
- [ ] `src/pages/admin/items/new.astro` — form: title (auto-slug), description (textarea), category select, urgency select, target_amount (R$ → cents), image upload (FileUpload to `item-images` bucket via signed URL), image_type radio, status (draft/published) — saves via Astro form action server endpoint.
- [ ] `src/pages/admin/items/[id]/edit.astro` — same form prefilled. **Cannot edit collected total** (no UI field; column-level RLS blocks update).
- [ ] `src/pages/admin/donations/index.astro` — filterable table (status, item, date, donor visibility); CSV export button → `/api/admin/donations/export`.
- [ ] `src/pages/api/admin/donations/export.ts` — streams CSV from query.
- [ ] `src/pages/admin/accountability/index.astro` — list of accountability_entries.
- [ ] `src/pages/admin/accountability/new.astro` + `[id]/edit.astro` — form: link to item OR reserve_entry (radio), title, description, amount_cents, proof file upload (`accountability-proofs` bucket), media URL (video), status select, is_public toggle.
- [ ] `src/pages/admin/settings.astro` — settings table key/value editor: pix_key, pix_merchant_name, pix_merchant_city, bank_status (select: not_configured / manual_verification / api_configured / webhook_configured), contact_email, social_links (JSON textarea), mission_text (textarea).
- [ ] Every admin mutation (POST/PATCH/DELETE) → audit log row via shared `src/lib/audit/log.ts`.

**Verify:** seed admin email/pass via SQL → login → dashboard renders metrics → create item → appears at `/doar` → edit item description → audit log row visible.

---

## Phase 10 — Realtime + Email + Monitoring [PARALLEL after 9]

- [ ] `src/lib/realtime.ts` — Supabase channel helper. Detail page subscribes to `donation_intents` updates filtered by item_id; on `confirmed` event, refresh totals (use Astro view-transitions or simple `fetch('/api/items/{slug}/totals')` + DOM update via small react island).
- [ ] `src/lib/email/resend.ts` — wrapper. `sendEmail({ to, subject, react })` — gracefully no-ops + logs warn when `RESEND_API_KEY` undefined. Functions: `sendDonationIntentCreated` (donor), `sendDonationConfirmed` (donor + admin), `sendAdminPendingReview` (admin when manual provider).
- [ ] `src/lib/email/templates/` — `intent-created.tsx`, `confirmed.tsx`, `admin-review.tsx` — minimal pt-BR HTML/JSX.
- [ ] `src/lib/monitoring/sentry.ts` — Sentry already wired via `@sentry/astro` integration in `astro.config.mjs`. Conditional init when `SENTRY_DSN` set. `captureException` helper for webhook errors.
- [ ] Hook into: `/api/donations/create` (intent created → email donor), webhook confirmation (confirmed → email donor + admin), admin manual confirm (admin email).

**Verify:** With no `RESEND_API_KEY` env → no crash, warn in logs. With key → test send via local resend.

---

## Phase 11 — Validation + Vercel deploy [SEQUENTIAL]

End-to-end smoke (manual + curl):
- [ ] `bun run dev`
- [ ] Visit `/` → landing renders with stats from view + 3 urgent items.
- [ ] `/doar` → 3 seeded items; filters work; card click → `/doar/[slug]`.
- [ ] On detail page: click "Doar Agora" → form modal → submit R$50 anonymous + display_name=false → QR appears, intent in DB pending, `confirmed_amount_by_item` unchanged, donor email/phone NOT visible publicly.
- [ ] Curl webhook with HMAC → 200 → status flips to confirmed → progress bar updates (after page refresh or via Realtime).
- [ ] Curl webhook again same body → 200 + no double-count.
- [ ] Curl with overage → `global_reserve_entries` row appears.
- [ ] `/prestacao-de-contas` → shows accountability cards + reserve total updated.
- [ ] `/admin/login` → admin login → dashboard → create item → published item appears at `/doar`.
- [ ] Admin tries to PATCH `donation_items` collected_amount column → RLS denies (column-level grant excludes it; computed via view anyway).
- [ ] Mobile audit at 375 / 768 / 1024 / 1440 px.
- [ ] `bunx astro check` → 0 errors.
- [ ] `bun run build` → success, no missing-env warnings (using `.env`).
- [ ] Lint via Biome (if installed) or `tsc --noEmit`.

Vercel deploy:
```bash
bunx vercel link                          # interactive
# Set env per .env.example:
for k in PUBLIC_SUPABASE_URL PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY \
        PUBLIC_SITE_URL PUBLIC_SITE_NAME PIX_KEY PIX_MERCHANT_NAME PIX_MERCHANT_CITY \
        PIX_BANK_WEBHOOK_SECRET RESEND_API_KEY RESEND_FROM_EMAIL SENTRY_DSN; do
  bunx vercel env add $k production
done
bunx vercel deploy --prod
```

- [ ] Smoke production URL: `/`, `/doar`, `/admin/login`.
- [ ] Configure Supabase Auth → Site URL = production URL; Redirect URLs include `https://<domain>/admin/login`.

---

## Critical files

- `astro.config.mjs` — hybrid + Vercel adapter + react + sentry
- `src/styles/global.css` — Tailwind v4 `@theme` tokens
- `src/lib/icons.tsx` + `src/components/ui/Icon.astro` — Lucide adapter
- `src/middleware.ts` — admin guard
- `src/lib/supabase/{server,browser,admin}.ts`
- `src/lib/payments/pix.ts` + `src/lib/payments/providers/*`
- `src/pages/api/donations/{create,status}.ts`
- `src/pages/api/webhooks/bank-pix.ts`
- `supabase/migrations/0001_init.sql` … `0005_audit.sql`
- `supabase/seed.sql`
- `src/layouts/{PublicLayout,AdminLayout}.astro`
- `src/pages/index.astro`, `src/pages/doar/{index,[slug]}.astro`, `src/pages/prestacao-de-contas.astro`
- `src/pages/admin/{index,login,items/...,donations/index,accountability/...,settings}.astro`

---

## Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | Material Symbols Outlined in mockups → Lucide-only rule | Mapping table (Phase 2); `Icon` component centralizes lookup; missing key → typecheck error |
| R2 | AGENTS.md "MUST be statically generated" vs SSR for /admin + /api | Astro `output: 'hybrid'`; per-page `prerender = true` for public; runtime SSR only for `/admin` + `/api`. Hybrid ≠ SPA. |
| R3 | Non-empty repo blocks `create astro` template | Manual scaffold of package.json/astro.config/tsconfig instead of CLI |
| R4 | TXID uniqueness race (2 simultaneous donors) | DB unique on `donation_intents.pix_txid`; `ulid` collision practically impossible; on conflict regenerate |
| R5 | Webhook double-count under retry | `payment_events.unique(provider, bank_end_to_end_id)` + `on conflict do nothing` + early ack |
| R6 | Manual confirm vs future bank webhook for same intent | Manual events use `provider='manual'`; bank events use `provider='bank_pix'`; unique key includes provider |
| R7 | RLS leaks donor email/phone publicly | No public select on `donation_intents`; use `public_donor_list` view that exposes only allowed columns |
| R8 | Astro Image optimization vs Supabase Storage URLs | Use `astro:assets` only for static art; user-uploaded served via Supabase public URL with `<img loading="lazy">` |
| R9 | Bank Pix API not yet selected | Provider abstraction; manual provider default; webhook returns 501 if no `PIX_BANK_WEBHOOK_SECRET` |
| R10 | Donor receipt email reliability without Resend key | Wrapper no-ops + logs warn when key missing; webhook doesn't fail |
| R11 | Vercel SSR cold start on `/api/donations/create` | Acceptable (donor expects 1-2s for QR); use `runtime: 'edge'` later if needed |
| R12 | Admin password reset / signup UX | MVP: admin rows seeded by SQL; user creates via `supabase auth admin` CLI. Public signup disabled in Supabase Auth dashboard. |
| R13 | LGPD: storing donor email/phone | Settings page for retention policy (out of scope); MVP collects optional; explicit consent checkbox copy in form |
| R14 | Long-running migration / db push fails halfway | Each migration independent + idempotent (`if not exists`); rerunnable |

---

## Verification (end-to-end checklist for /implement)

After all phases:

1. `bun run dev` → http://localhost:4321 → landing renders
2. `/doar` → 3 seeded items render; filters work
3. `/doar/<slug>` → detail loads; click "Doar Agora" → submit R$50 anonymous → QR + copy-paste code visible; row exists in `donation_intents` (status pending); `confirmed_amount_by_item` for that item unchanged
4. Curl webhook with HMAC → 200; status pending→confirmed; total +R$50; replay → no change
5. Curl overage → reserve grows; UI shows excess explanation
6. `/prestacao-de-contas` → cards + reserve total
7. `/admin/login` (seeded email/pass) → dashboard; create item → live at `/doar`
8. Audit log shows admin actions
9. `bunx astro check` clean; `bun run build` clean
10. `bunx vercel deploy --prod` returns URL; production smoke passes

---

## Deferred (NOT this plan)

- Real bank Pix API integration — depends on user picking bank
- Mercado Pago / Asaas live (kept as `.disabled.ts` stubs)
- Production copywriting (admin-editable later)
- Donor receipt email rendered in production-grade templates
- Admin analytics dashboard beyond basic metrics
- Multi-language (pt-BR only in MVP)
- PWA / offline support

---

Next: run `/implement` with this file to execute. Pre-flight requires user to be logged into Supabase and Vercel CLIs first. If a bank/credentials are not available, manual provider remains default and webhook returns 501 — no rewrite needed once bank is chosen.
