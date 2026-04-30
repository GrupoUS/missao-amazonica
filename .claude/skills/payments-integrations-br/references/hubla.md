# Hubla — Integration Reference

> Status: PARTIAL — official API docs require Hubla dashboard access.
> Researched: 2026-04-01. Patterns based on industry standard + confirmed webhook support.
> Action: Obtain full docs from Hubla dashboard → Developers/API section, then update this file.

## What Is Confirmed

- Hubla is a Brazilian digital product/course platform (hub.la)
- Webhook delivery confirmed via help portal (help.hub.la/hc/pt-br/webhook-hubla)
- Dashboard provides "Enviar eventos" (test event sender)
- Configuration is done in the Hubla dashboard

## Authentication (Assumed — Verify)

Most Brazilian platforms use:
```typescript
headers: { 'Authorization': `Bearer ${env.HUBLA_API_KEY}` }
```
Obtain `HUBLA_API_KEY` from the Hubla developer dashboard.

## Webhook Signature Verification (Assumed — Verify)

No official docs available publicly. Implement defensive HMAC-SHA256 pattern (industry standard):

```typescript
import { createHmac, timingSafeEqual } from 'node:crypto';

function verifyHublaSignature(
  rawBody: Buffer,
  signatureHeader: string,
  secret: string
): boolean {
  const hmac = createHmac('sha256', secret);
  const computed = 'sha256=' + hmac.update(rawBody).digest('hex');
  try {
    return timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(computed)
    );
  } catch {
    return false;
  }
}

// In webhook handler — check common header names:
// 'x-hub-signature', 'x-hubla-signature', 'x-webhook-signature'
const sig = req.header('x-hub-signature') ?? req.header('x-hubla-signature');
if (!sig || !verifyHublaSignature(rawBody, sig, env.HUBLA_WEBHOOK_SECRET)) {
  throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid Hubla signature' });
}
```

**When you access the official docs, update this section with:**
- Exact header name for signature
- Algorithm (sha256 / sha1 / other)
- Whether raw body or JSON string is signed

## Idempotency

Assume a unique `event.id` per delivery (standard practice). Implement:

```sql
CREATE TABLE hubla_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now()
);
```

## Expected Event Types (Inferred from Platform Type)

Digital product platforms typically emit:

| Event (assumed) | Trigger | Action |
|-----------------|---------|--------|
| `purchase.approved` | Sale confirmed | Grant access |
| `purchase.refunded` | Refund issued | Revoke access |
| `purchase.chargeback` | Chargeback | Revoke + flag |
| `subscription.created` | Subscription started | Grant recurring |
| `subscription.canceled` | Cancelled | Schedule revocation |
| `subscription.expired` | Lapsed | Downgrade |

**Verify exact event names against Hubla dashboard webhook event list.**

## Env Vars

| Var | Required | Notes |
|-----|----------|-------|
| `HUBLA_API_KEY` | Yes | From Hubla developer dashboard |
| `HUBLA_WEBHOOK_SECRET` | Yes | From Hubla webhook configuration |

## Action Items Before Production

1. Access Hubla dashboard → Developers/API section
2. Record: exact auth header, signature header name, algorithm
3. Record: full event type list with payload schema
4. Update this file with official values
5. Replace assumed patterns above with confirmed ones
