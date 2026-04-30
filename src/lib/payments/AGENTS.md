# `src/lib/payments/` — Agent Rules (Tier 2)

> Pix BR-Code generator + provider abstraction. **Idempotency + HMAC are non-negotiable.**

## Inventory

| File | Purpose |
|---|---|
| `pix.ts` | Pure function: build EMV BR-Code + QR data URL. CRC16/CCITT-FALSE. |
| `registry.ts` | `getProvider(supabase)` — selects provider per `settings.bank_status`. |
| `providers/types.ts` | `PixProvider` interface (closed union of provider IDs). |
| `providers/bank-pix-provider.ts` | Default provider. HMAC-SHA256 webhook verify. |
| `providers/manual-provider.ts` | Fallback. Webhook returns 501. Admin manual confirm. |
| `providers/mercado-pago-provider.disabled.ts` | Stub — throws `not_implemented`. |
| `providers/asaas-provider.disabled.ts` | Stub — throws `not_implemented`. |

## Provider Contract

```ts
export interface PixProvider {
  id: 'bank_pix' | 'manual' | 'mercado_pago' | 'asaas';
  createIntent(args: CreateIntentArgs): Promise<{
    payload: string;       // EMV BR-Code text
    qrDataUrl: string;     // base64 image/png
    txid: string;          // 1-25 chars [A-Z0-9]
    expiresAt: string;     // ISO timestamp
  }>;
  verifyWebhook?(req: Request): Promise<{ valid: boolean; event?: ParsedEvent }>;
  queryStatus?(txid: string): Promise<'pending' | 'confirmed' | 'failed'>;
}
```

The provider type union is **closed**. Never widen to `string`. Adding a new provider = new file in `providers/`, register in `registry.ts`, type union grows.

## Idempotency

- `payment_events` is unique on `(provider, bank_end_to_end_id)`.
- Insert with `on conflict (provider, bank_end_to_end_id) do nothing returning id`.
- If returned `id` is null → already processed → ack 200, skip downstream.
- Manual confirm uses `provider='manual'` + `bank_end_to_end_id='MAN-' || intent_id` for guaranteed uniqueness vs future bank events.
- **Never bypass this.** Replay attacks + double-charge bugs come from skipping the unique check.

## HMAC Verification (Bank Pix)

- Algorithm: HMAC-SHA256 over the raw request body using `PIX_BANK_WEBHOOK_SECRET`.
- Compare against `x-signature` header in **constant time** via `crypto.timingSafeEqual`. Never use `===`.
- If `PIX_BANK_WEBHOOK_SECRET` is undefined → return `{ error, code: 'webhook_disabled' }` 501. Don't crash.
- If signature invalid → return `{ error, code: 'webhook_invalid_signature' }` 401.

## BR-Code (EMV) Builder

- Pure function. No I/O beyond `qrcode.toDataURL`.
- TXID format: `MIS<itemSlug8><ulidSuffix12>` (1-25 chars, `[A-Z0-9]`).
- Merchant name max 25 chars, city max 15 chars, both ASCII (strip diacritics via `.normalize('NFD').replace(/\p{Diacritic}/gu, '')`).
- CRC16/CCITT-FALSE on full string + literal `"6304"`. 4-hex appended uppercase.
- QR options: `errorCorrectionLevel: 'M'`, `margin: 1`, `width: 192`.

## confirm_donation Flow

```
webhook → HMAC verify → insert payment_events (idempotent) →
  on new row → call confirm_donation(intent_id, event_id, amount) plpgsql →
    function locks intent FOR UPDATE → transitions to 'confirmed' →
    if amount > target_remaining → insert global_reserve_entries row →
  trigger Resend (donor + admin), non-blocking
```

JS never sets `donation_intents.status = 'confirmed'` directly. Always via the function.

## Don'ts

- ❌ Read body twice. `req.body` is a stream. Cache the raw text once for HMAC + parsing.
- ❌ String-equality on signatures. Constant-time compare.
- ❌ Set HTTP timeouts > 5 s on synchronous webhook acks. Bank retries on 5xx.
- ❌ Re-enable the `*.disabled.ts` providers without re-implementing the full provider contract.
- ❌ Generate TXID from `Date.now()` alone. Use `ulid()` for monotonic uniqueness.

## Verification

After changing payment code:

```bash
bunx astro check
# Webhook idempotency smoke (curl twice — second must be no-op):
curl -X POST http://localhost:4321/api/webhooks/bank-pix -d '<body>' -H "x-signature: <hmac>"
curl -X POST http://localhost:4321/api/webhooks/bank-pix -d '<body>' -H "x-signature: <hmac>"
# Inspect DB: payment_events should have 1 row, audit_logs 1 confirm entry, donor 1 email.
```

## See Also

- [`.claude/rules/integrations.md`](../../../.claude/rules/integrations.md) — provider abstraction full spec
- [`.claude/rules/backend.md`](../../../.claude/rules/backend.md) — webhook handler patterns
- [`.claude/rules/database.md`](../../../.claude/rules/database.md) — `confirm_donation` + `payment_events` schema
