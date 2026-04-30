# Asaas — Integration Reference

> Source: https://docs.asaas.com — researched 2026-04-01

## Authentication

```typescript
// All requests
headers: { 'Authorization': `Bearer ${env.ASAAS_API_KEY}` }
```

- Env vars: `ASAAS_API_KEY` (production) + `ASAAS_API_KEY_SANDBOX`
- Base URL production: `https://api.asaas.com/v3`
- Base URL sandbox: `https://sandbox.asaas.com/api/v3`
- Read from env config module — never `process.env` directly in service code

## Webhook Security

Asaas does NOT provide HMAC signature verification. Security relies on:
- HTTPS transport
- Bearer token in your API calls (not inbound webhooks)
- Idempotency guard (see below)

**Do not trust IP-based filtering** — Asaas IPs are not published as stable.

## Idempotency (Mandatory)

Every webhook delivery carries a unique `event.id` (UUID). Store it with a UNIQUE constraint:

```sql
-- Required table
CREATE TABLE asaas_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now()
);
```

```typescript
// Handler pattern
async function handleAsaasWebhook(payload: AsaasWebhookPayload) {
  // 1. Acknowledge immediately
  // (return 200 before this function — process async)

  // 2. Idempotency check
  const inserted = await db.insert(asaasWebhookEvents)
    .values({ eventId: payload.event, eventType: payload.payment?.billingType ?? 'unknown' })
    .onConflictDoNothing()
    .returning();

  if (inserted.length === 0) return; // duplicate — skip

  // 3. Process
  await processPaymentEvent(payload);
}
```

## Rate Limits

| Limit | Value |
|-------|-------|
| Quota | 25,000 requests per 12-hour window |
| Per-endpoint | Sub-limits apply (not fully documented) |
| Error code | `429 Too Many Requests` |

**Retry policy on 429:**
```typescript
const delays = [250, 500, 1000]; // ms
for (const delay of delays) {
  await sleep(delay);
  const res = await tryAsaasRequest();
  if (res.ok) break;
}
```

## Webhook Response Contract

- Respond with HTTP 200 within **10 seconds**
- Timeout = failure; Asaas will retry
- Webhook queue pauses after repeated failures — reactivate in dashboard: Configurações → Webhooks

## Key Event Types

| Event | Trigger | Action |
|-------|---------|--------|
| `PAYMENT_RECEIVED` | Payment confirmed (PIX/boleto) | Grant access / update subscription |
| `PAYMENT_CONFIRMED` | Card payment confirmed | Grant access |
| `PAYMENT_OVERDUE` | Payment past due date | Trigger dunning flow |
| `PAYMENT_REFUNDED` | Refund issued | Revoke access |
| `PAYMENT_DELETED` | Payment cancelled | Revoke if no other active payment |
| `SUBSCRIPTION_DELETED` | Subscription cancelled | Revoke access |

## Sandbox

- Sandbox API uses separate base URL and separate API key
- PIX and boleto can be simulated via dashboard
- Subscription lifecycle can be tested end-to-end in sandbox
