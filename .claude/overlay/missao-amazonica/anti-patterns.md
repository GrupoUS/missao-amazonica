# Anti-Patterns — Missão Amazônica

> Loaded by `/debug` and the `debugger` skill when investigating bugs in this project.

## Donation flow

- **Never mutate `collected_amount` directly.** Totals derive from `confirmed_amount_by_item` view. UI binds to view, not table column.
- **Excess goes to global reserve.** A confirmed intent exceeding `target_amount_cents` splits: portion up to remaining target stays attributed; excess inserts into `global_reserve_entries`. Performed in `confirm_donation()` plpgsql.
- **Webhook idempotency is mandatory.** `payment_events` unique on `(provider, bank_end_to_end_id)`. Webhook insert uses `on conflict do nothing returning id`. If `id` is null → ack 200 + skip downstream.
- **Manual confirm uses synthetic ID.** `bank_end_to_end_id = 'MAN-' || intent_id` — guarantees uniqueness vs future bank events.
- **TXID format:** `MIS<itemSlug8><ulidSuffix12>` (1–25 chars, alphanumeric uppercase).

## Auth & PII

- **RLS is the auth layer.** Server client uses cookie session via `@supabase/ssr`. Service-role (`src/lib/supabase/admin.ts`) is server-only — throws if `import.meta.env.SSR === false`.
- **Donor PII never public.** `donor_email`, `donor_phone` are admin-only. Public reads go through `public_donor_list` view (`security_invoker = on`, only consented + non-anonymous rows).
- **`is_admin(uid)` is plpgsql.** Never re-implement in TypeScript. Helper `requireAdmin(Astro)` from `src/lib/auth/admin-guard.ts` calls it.

## Render mode

- **Hybrid mandatory.** `src/pages/api/**` and `src/pages/admin/**` always `export const prerender = false`. Public pages always `export const prerender = true`.
- **No SPA.** Astro hybrid only. Next.js / Remix forbidden by cardinal rule #4.

## UI

- **Lucide icons only** via `<Icon name="…" />` (`src/components/ui/Icon.astro`). No emoji. No Material Symbols. No Font Awesome.
- **No hardcoded hex** outside `src/styles/global.css` `@theme`. Use semantic Material 3 tokens (`bg-surface-container-lowest`, `text-on-surface`).
- **No layout property animations** (width, height, top, left, padding, margin). Only `transform` + `opacity`. Accordion expand uses `grid-template-rows: 0fr ↔ 1fr`.
- **CLS = 0.** Every `<img>` carries explicit `width` + `height`.

## Integrations

- **Pix provider abstraction.** Default `bank-pix-provider` (HMAC-SHA256 verify on `x-signature` against `PIX_BANK_WEBHOOK_SECRET`). Fallback `manual-provider` when `settings.bank_status='not_configured'`. Mercado Pago / Asaas: `.disabled.ts` stubs that throw `not_implemented`.
- **Resend graceful degrade.** `sendEmail()` returns `{ skipped: true }` if `RESEND_API_KEY` undefined — never throws.
- **Sentry never logs donor PII.** Strip via `beforeSend` if needed.

## Common bug sources

- Webhook signature in non-constant time → use `crypto.timingSafeEqual`.
- `.single()` not checking `error` and `data` separately → silent null deref.
- Service-role client imported in `.tsx` island → throws at import.
- TXID collision in load tests (CRC16 not appended to full string + `"6304"` literal).
- LGPD consent: anonymous + display-off donations leaking into `public_donor_list` (RLS view filter must check `is_anonymous = false AND display_name_publicly = true`).
- CLS spike from missing `width`/`height` on Supabase Storage URLs.
