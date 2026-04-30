---
globs: src/lib/payments/**, src/lib/email/**, src/lib/monitoring/**, src/pages/api/webhooks/**, src/lib/realtime.ts
---

# Integration Rules (Tier 2 — Auto-loaded)

> Operational guardrails for external providers used by this app.

## Purpose

Compact rules for Pix providers (`bank_pix`, `manual`, future Mercado Pago/Asaas), Resend email, Sentry, Supabase Realtime, Vercel.

---

## Universal Rules

- Every external API call has a timeout. Default 5s for synchronous, 30s for batch.
- Webhooks ack quickly (200) and process side effects safely. Long work goes to a queue (out of scope for MVP — process inline but keep total under 5s).
- Idempotency is mandatory on every webhook ingestion path.
- Treat provider payloads as untrusted. Validate with Zod before downstream use.
- Log integration failures with structured context via `Sentry.captureException` + tags `{ provider, route, txid }`.
- Secrets only via env. Never inline. Never commit a `.env` file.
- No hardcoded provider versions, base URLs, or credentials.

---

## Pix Provider Abstraction

### Interface

```ts
// src/lib/payments/providers/types.ts
export interface PixProvider {
  id: 'bank_pix' | 'manual' | 'mercado_pago' | 'asaas';
  createIntent(args: CreateIntentArgs): Promise<{ payload: string; qrDataUrl: string; txid: string; expiresAt: string }>;
  verifyWebhook?(req: Request): Promise<{ valid: boolean; event?: ParsedEvent }>;
  queryStatus?(txid: string): Promise<'pending' | 'confirmed' | 'failed'>;
}
```

### Selection

`src/lib/payments/registry.ts → getProvider(supabase)`:
- reads `settings.bank_status` from DB (cached per-request)
- returns `bank-pix-provider` when `'api_configured' | 'webhook_configured'`
- returns `manual-provider` otherwise

### Bank Pix

- HMAC-SHA256 over the raw request body using `PIX_BANK_WEBHOOK_SECRET`. Compare against `x-signature` header in constant time (`crypto.timingSafeEqual`).
- If signature invalid → `Response.json({ error, code: 'webhook_invalid_signature' }, { status: 401 })`.
- If secret undefined in env → `Response.json({ error, code: 'webhook_disabled' }, { status: 501 })` (per PROMPT.md production-safe disable).
- Insert into `payment_events` `on conflict (provider, bank_end_to_end_id) do nothing returning id`. Skip downstream when no row.
- Match `donation_intents` by `pix_txid` + `amount_cents` + `status='pending'`. Orphan match → log + ack 200.
- Call `confirm_donation(intent_id, event_id, amount)` plpgsql function. Log audit row.
- Trigger Resend `sendDonationConfirmed` (donor + admin) — non-blocking, errors caught.

### Manual (Fallback)

- `createIntent` still generates the QR + payload (donors can pay; bank does not webhook).
- `verifyWebhook` returns `{ valid: false }` always.
- Admin route `/api/admin/manual-confirm` writes synthetic event with `provider='manual'`, `bank_end_to_end_id='MAN-<intent_id>'`, then calls `confirm_donation`.

### Mercado Pago / Asaas (Disabled Stubs)

- Files end in `.disabled.ts` and throw `not_implemented`. They serve as integration anchors for the future, not callable code.

---

## Pix BR-Code (EMV) Generator

`src/lib/payments/pix.ts → buildPixPayload({ pixKey, txid, amountCents, merchantName, merchantCity, description? })`:

- Pure function, no I/O beyond `qrcode.toDataURL`.
- TXID: 1–25 chars, alphanumeric uppercase. Format `MIS<itemSlug8><ulidSuffix12>`.
- CRC16/CCITT-FALSE on the full string + `"6304"` literal (4 hex chars uppercase appended).
- Merchant name max 25 chars, city max 15 chars, both ASCII (strip diacritics).
- QR options: `errorCorrectionLevel: 'M', margin: 1, width: 192`.

---

## Resend (Email)

- `src/lib/email/resend.ts → sendEmail({ to, subject, react })`.
- Returns `{ skipped: true }` and logs structured warn if `RESEND_API_KEY` is undefined.
- Templates in `src/lib/email/templates/` are React components rendered to HTML.
- Subjects in pt-BR; never include donor PII (no full name, email).
- Treat 5xx as retryable (single retry with backoff); 4xx as terminal (log + skip).
- Donor address comes from the intent (when provided). Admin address comes from `settings.contact_email`.

---

## Sentry

- Configured via `@sentry/astro` integration in `astro.config.mjs`. Init only when `SENTRY_DSN` is set.
- `Sentry.captureException(err, { tags: { route, provider, intent_id } })` for errors.
- `Sentry.captureMessage('donation_confirmed', { level: 'info', extra: { item_id, amount_cents } })` for notable events.
- Never log raw donor PII to Sentry. Strip before send via `beforeSend` if needed.

---

## Supabase Realtime

- `src/lib/realtime.ts` exposes `subscribeToItem(itemId, onConfirmed)` and `subscribeToDonations(onChange)`.
- Use Realtime only on the public detail page (`/doar/[slug]`) and admin dashboard. Public listing/landing rebuild on cron or after admin writes — Realtime there is overkill.
- Always teardown subscriptions on component unmount (`useEffect` return).
- Channel names: `item:<itemId>`, `donations:all` (admin only via authenticated channel).

---

## Vercel

- Env management via `bunx vercel env add <KEY> production`. Never commit env files.
- Adapter `@astrojs/vercel` with `webAnalytics: { enabled: false }` (we use Sentry).
- Cold-start mitigation: keep `/api/donations/create` light (no JIT-heavy libs); inline the QR generation (no fetch).
- Edge runtime is acceptable for the webhook only when bank confirms compatibility; default to Node serverless to avoid Web-only API friction.
- ISR / on-demand revalidation: `/prestacao-de-contas` rebuilds via `bunx vercel deploy --build` triggered from admin "publish" action (out of scope for MVP — manual rebuild OK).

---

## Stability Checklist (integrations subset)

- All webhooks: HMAC verify → idempotent insert → process → 200.
- All external calls: timeout + structured error → Sentry → safe fallback.
- All credentials: env-only; rotate via `bunx vercel env rm` + `bunx vercel env add`.
- Provider type unions stay closed (`'bank_pix' | 'manual' | 'mercado_pago' | 'asaas'`); never widen to `string`.
- Sandbox vs production: distinct env keys (`PIX_BANK_WEBHOOK_SECRET` vs `PIX_BANK_WEBHOOK_SECRET_TEST` if needed later).

---

## When To Load More

| Need | Load |
|---|---|
| Astro API route patterns | `.claude/rules/backend.md` |
| Schema for `payment_events`, `audit_logs` | `.claude/rules/database.md` |
| UI for donation flow / admin confirm | `.claude/rules/frontend.md` |
| Universal stability checklist | `.claude/rules/stability.md` |
