# Layer Map — Missão Amazônica

> Loaded by the `planning` skill when generating plans for this project.

## Stack

Astro 6 hybrid · Bun · Supabase · React 19 islands · Tailwind v4 · Vercel.

## Layer order (dependency-respecting)

```
Migration (supabase/migrations) → RLS Policy → DB View/Function (if needed)
  → Generated Types (src/lib/supabase/types.ts) → Validator (src/lib/validators)
  → API Route (src/pages/api) → Astro Page or React Island → Test
```

## File-path scaffolding

| Layer | Path |
|---|---|
| DB schema / migration | `supabase/migrations/NNNN_<short-description>.sql` |
| RLS policy | Same migration file as the table, or next migration |
| Generated types | `src/lib/supabase/types.ts` (regenerate after every schema change) |
| Server client | `src/lib/supabase/server.ts` (per-request, RLS) |
| Browser client | `src/lib/supabase/browser.ts` (anon, public) |
| Service-role client | `src/lib/supabase/admin.ts` (server-only, bypasses RLS) |
| Validators (Zod) | `src/lib/validators/<domain>.ts` |
| API routes | `src/pages/api/**.ts` (always `export const prerender = false`) |
| Webhook handlers | `src/pages/api/webhooks/<provider>.ts` |
| Admin guard | `src/lib/auth/admin-guard.ts` (`requireAdmin(Astro)`) |
| Audit log | `src/lib/audit/log.ts` (`logAudit({ … })`) |
| Public pages | `src/pages/**.astro` (always `export const prerender = true`) |
| Admin pages | `src/pages/admin/**.astro` (always `export const prerender = false`) |
| Components (UI primitives) | `src/components/ui/` |
| Components (donation flow) | `src/components/donation/` |
| Components (accountability) | `src/components/accountability/` |
| Components (admin dashboard) | `src/components/admin/` |
| Layouts | `src/layouts/{PublicLayout,AdminLayout}.astro` |
| Styles / design tokens | `src/styles/global.css` (`@theme` block) |
| Icons | `src/components/ui/Icon.astro` + `src/lib/icons.tsx` (Lucide map) |
| Email templates | `src/lib/email/templates/*.tsx` (React → HTML) |
| Pix providers | `src/lib/payments/providers/*.ts` |
| Pix EMV / QR | `src/lib/payments/pix.ts` |

## Auth procedure levels (this project)

Auth is enforced via Supabase RLS + admin-users table. Helper functions:

| Scope | Pattern | Where |
|---|---|---|
| Public (anon) | RLS allows `select` on `donation_items where status='published'` etc. | Per-table RLS policies in `0004_rls.sql` |
| Authenticated user | Cookie session via `@supabase/ssr` | `src/middleware.ts` hydrates `locals.supabase` + `locals.user` |
| Admin | `await requireAdmin(Astro)` calls `is_admin(auth.uid())` plpgsql | `src/lib/auth/admin-guard.ts` |
| Service-role | Direct service-role client | `src/lib/supabase/admin.ts` (server-only) |

## Verification commands

```bash
# Type check
bunx astro check

# Lint
bunx biome check --write

# Schema migration apply
bunx supabase db push

# Regenerate types after schema changes
bunx supabase gen types typescript --linked > src/lib/supabase/types.ts

# Lint SQL
bunx supabase db lint

# Dev
bun run dev

# Build
bun run build
```

## Key invariants

1. **Hybrid render mode mandatory.** `/api/**` and `/admin/**` → `prerender = false`. Public pages → `prerender = true`. Never SPA.
2. **Donor PII is private.** `donor_email` / `donor_phone` admin-only via RLS. Public reads through `public_donor_list` view (`security_invoker = on`).
3. **Donation totals are derived.** Read from `confirmed_amount_by_item` view. Never store/mutate "collected_amount" column.
4. **Webhook idempotency.** `payment_events` unique on `(provider, bank_end_to_end_id)`. Insert `on conflict do nothing returning id`.
5. **Confirm donation only via plpgsql.** Use `confirm_donation(intent_id, event_id, amount)` — never bypass from JS.
6. **Service-role client server-only.** Throws if imported in browser context.
7. **Lucide icons only.** No emoji, no Material Symbols, no Font Awesome.
8. **No hardcoded hex outside `@theme`.** Use semantic Material 3 tokens.
9. **Every FK gets an index** in the same migration.
10. **All money is integer cents.** Column suffix `_cents`.
