# `src/components/donation/` — Agent Rules (Tier 2)

> Public donation flow. **Highest-risk surface for PII + payment idempotency.** Auto-loads when editing files here.

## Inventory

| File | Type | Role |
|---|---|---|
| `ItemCard.astro` | Astro | List item — title, description, image, urgency badge, progress bar, CTA. |
| `DonationForm.tsx` | React island | Form + Zod validation + POST `/api/donations/create`. |
| `PixPanel.tsx` | React island | Pix QR rendering + countdown + copy-to-clipboard + status polling. |
| `RecentDonors.astro` | Astro | Public donor wall. Reads `public_donor_list` view ONLY. |

## Cardinal Discipline

> [!CAUTION]
> 1. **Donor PII is admin-only.** Components in this folder may surface `donor_name` (when consented + non-anonymous) but **never** `donor_email` / `donor_phone`. Read `RecentDonors` from `public_donor_list` view (consent-filtered).
> 2. **Donation totals are derived.** Render `confirmed_amount_cents` from `confirmed_amount_by_item` / `item_progress` views. Never compute or accept "collected" totals from props that originated outside the DB views.
> 3. **Payment intents are pending until webhook.** UI shows "aguardando confirmação" — never claim "donation confirmed" until status === `confirmed` from `/api/donations/status` polling.

## Form / Island Rules

- Validate on the island with the **same** Zod schema the API uses. Re-export from `@/lib/validators/donation.ts` — never duplicate.
- Submit via `fetch('/api/donations/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })`.
- Branch errors on `error.code` (machine-stable), not `error` substring. Standard codes: `validation_failed`, `item_not_found`, `item_not_published`, `rate_limited`, `internal_error`.
- LGPD consent: explicit copy + boolean. Persist as `display_name_publicly` and `is_anonymous` on the intent.
- Loading state via `useTransition` or local `isPending`. No double-submits.

## Pix Panel Specifics

- QR code is a base64 PNG returned by `/api/donations/create` (`qrDataUrl`). Render as `<img>` with explicit `width` + `height` (CLS = 0).
- BR-Code text: copy-to-clipboard via `navigator.clipboard.writeText` with `try/catch` fallback to a `<textarea>` selection trick.
- Countdown: `aria-live="polite"` so screen readers announce. Stop polling at `expires_at`.
- Status polling: `GET /api/donations/status?intentId=…` — backoff (start 3 s, cap 15 s). Stop on terminal states (`confirmed`, `expired`, `failed`, `cancelled`).
- Show toast (`sonner`) for `pix_copied`, `donation_confirmed`, `payment_failed`. Never show donor PII in toasts.

## ItemCard Rules

- Hero image: `<img src={imageUrl} width={400} height={192} loading="lazy" alt={…} />`. Must have explicit dimensions (CLS = 0).
- Urgency → border-l accent + Badge tone via `urgencyToTone()` (`@/components/ui/badge-helpers`).
- Progress: `<ProgressBar currentCents={confirmedCents} targetCents={targetCents} />` — never compute the percent inline.
- CTA: `<a href={`/doar/${slug}`} …>` — full anchor, never `<button>` for navigation.

## Don'ts

- ❌ `donor_email` or `donor_phone` anywhere in this folder's render output, props, or query selects.
- ❌ Direct Supabase admin client import from `.tsx` (use API endpoint).
- ❌ Mutating donation state from the client (server confirms via webhook + RPC).
- ❌ Hardcoded R$ formatting — use `formatBRL` from `@/lib/format/currency`.
- ❌ Polling the status endpoint forever — stop on terminal state.

## Verification

After changing a donation file:

```bash
bunx astro check
bun run build
# Manual: open /doar/<slug>, fill form, watch network tab, confirm:
#   - donor_email NOT in any /api/donations/status response body
#   - QR renders without layout shift (Performance tab → CLS)
#   - polling stops on confirmed / expired
```

## See Also

- [`@/lib/validators/donation.ts`](../../lib/validators/donation.ts) — Zod schemas (shared)
- [`@/lib/payments/AGENTS.md`](../../lib/payments/AGENTS.md) — provider abstraction + HMAC
- [`.claude/rules/integrations.md`](../../../.claude/rules/integrations.md) — Pix flow end-to-end
- [`.claude/rules/database.md`](../../../.claude/rules/database.md) — `public_donor_list` view, RLS
