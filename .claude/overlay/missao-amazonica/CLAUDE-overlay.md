# Project Overlay — Missão Amazônica · Sal da Terra

> Project-specific Tier 1 supplement. Loaded by `.claude/CLAUDE.md` after the generic behavioral framework.
> If using a different project, replace this file or delete the overlay.

---

## Project identity

**Missão Amazônica – Sal da Terra** — public donation platform (CNPJ church mission, Rio Negro communities). Annual mission every April for one week.

Stack at a glance: **Astro 6 hybrid** · **Bun** · Tailwind v4 · React 19 islands · **Supabase** (Postgres + Auth + Storage + Realtime) · Vercel · **Pix BR-Code** · Resend · Sentry · pt-BR · BRL (integer cents).

Full snapshot in root `AGENTS.md`.

---

## Behavior overrides (project-specific)

- **Bun-only.** Never `npm` / `yarn` / `pnpm`.
- **Astro hybrid mandatory.** Public pages prerender to static HTML; only `/admin/**` and `/api/**` run SSR. Never SPA.
- **No emoji / Material Symbols.** Use `<Icon name="…" />` (`src/components/ui/Icon.astro`). Mapping in `src/lib/icons.tsx`.
- **Conventional Commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `perf:`, `test:`.

---

## Routing matrix (project supplements)

These rows extend the generic routing matrix in `.claude/CLAUDE.md`:

| Task touches | Load these | Then implement in |
|---|---|---|
| New API endpoint | `.claude/overlay/missao-amazonica/rules/backend.md` | `src/pages/api/**/*.ts` (`prerender = false`, `APIRoute`, Zod) |
| Schema / migration | `.claude/overlay/missao-amazonica/rules/database.md` | `supabase/migrations/NNNN_name.sql` + RLS in same/next migration |
| New page / component | `.claude/overlay/missao-amazonica/rules/frontend.md` | `src/pages/**`, `src/components/**`, semantic Tailwind tokens |
| External provider | `.claude/overlay/missao-amazonica/rules/integrations.md` | `src/lib/payments/`, `src/lib/email/`, `src/lib/monitoring/` |
| Webhook | backend + integrations | `src/pages/api/webhooks/*.ts` (idempotent on `payment_events.unique`) |
| Pure styling | `.claude/overlay/missao-amazonica/rules/DESIGN.md` | `src/styles/global.css` `@theme` only — no hardcoded hex |
| Donation flow | backend + database + integrations | `src/pages/api/donations/*`, `src/lib/payments/*`, `confirm_donation()` plpgsql |

See also `.claude/overlay/missao-amazonica/routing-supplements.md` for full domain mapping.

---

## Cardinal rules (non-negotiable for this project)

1. **Never assume correctness.** Verify against official docs, runtime tests, or DB inspection before applying changes.
2. **Always debug after changes.** Every modification ends with verification. Never mark a task done without evidence.
3. **NEVER use emojis as UI icons.** Lucide via `<Icon name="…" />` only.
4. **NEVER use SPA approach.** Astro hybrid only.
5. **NEVER manually edit collected donation totals.** Totals derive from confirmed `donation_intents` via DB views. Excess goes to global reserve via `confirm_donation()` plpgsql.
6. **NEVER expose donor PII publicly.** `donor_email`, `donor_phone` are admin-only via RLS. Public reads through `public_donor_list` view.

---

## Project-specific guards

- **Hybrid mode.** Every page declares its render mode. Public → `export const prerender = true`. `/admin/**` + `/api/**` → `export const prerender = false`.
- **Donor PII is private.** Any query joining `donation_intents` must drop `donor_email` / `donor_phone` columns or RLS-block the path.
- **Webhook idempotency.** `payment_events` insert uses `on conflict (provider, bank_end_to_end_id) do nothing returning id`. Skip downstream when no row returned.
- **Donation confirm only via plpgsql.** `confirm_donation(intent_id, event_id, amount)` — never bypass from JS.
- **Service-role client.** Import `src/lib/supabase/admin.ts` only from server-only modules (`/api/**`, middleware, server actions). Never from a `.tsx` client island.
- **Manual confirm path.** Synthetic `bank_end_to_end_id = 'MAN-' || intent_id` for admin-confirmed donations.
- **All money is integer cents.** Column suffix `_cents`. Never floating-point currency.
- **Every FK gets an index** in the same migration that creates the FK.

---

## Tier 3 pointers (project-specific)

- `docs/PROMPT.md` — canonical product spec
- `docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md` — design tokens + brand canon
- `docs/e-design-execute-o-glowing-crystal.md` — implementation plan
- `.claude/overlay/missao-amazonica/anti-patterns.md` — Pix idempotency, donor PII, derived totals, SPA ban
- `.claude/overlay/missao-amazonica/layer-map.md` — Astro+Supabase layer stack
- `.claude/overlay/missao-amazonica/seo-supplement.md` — pt-BR locale, sitemap, OG tags
- `.claude/overlay/missao-amazonica/verify-supplements.md` — webhook idempotency, RLS anon deny, public_donor_list privacy

---

## Removing or replacing this overlay

To use the generic framework in a different project:
1. Delete this file (`.claude/overlay/missao-amazonica/`) or rename the directory.
2. Update `.claude/config.json::overlay` to point at your project's overlay or to `null`.
3. Either create your own overlay at `.claude/overlay/<your-project>/` (mirroring this structure) or rely on the generic templates only.
