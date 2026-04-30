# Kiwify — Integration Reference

> Source: https://docs.kiwify.com.br — researched 2026-04-01

## Authentication

OAuth 2.0 — short-lived JWT (24 hours):

```typescript
// Token acquisition
const res = await fetch('https://api.kiwify.com.br/v1/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    client_id: env.KIWIFY_CLIENT_ID,
    client_secret: env.KIWIFY_CLIENT_SECRET,
  }),
  signal: AbortSignal.timeout(10_000),
});
const { access_token, expires_in } = await res.json();
// Store token + expiry (now + expires_in seconds)
```

### Token Refresh Strategy

Kiwify has NO auto-refresh. Implement pre-emptive refresh:

```typescript
function isTokenExpiringSoon(expiresAt: Date): boolean {
  // Refresh when < 60 minutes remaining (token is 24h)
  return expiresAt.getTime() - Date.now() < 60 * 60 * 1000;
}

async function getValidToken(): Promise<string> {
  if (!tokenCache || isTokenExpiringSoon(tokenCache.expiresAt)) {
    tokenCache = await refreshKiwifyToken();
  }
  return tokenCache.accessToken;
}
```

Handle inline 401: detect → re-auth → retry once:
```typescript
if (res.status === 401) {
  tokenCache = null; // invalidate
  const newToken = await getValidToken();
  return retryRequest(newToken);
}
```

## OAuth Scopes

Request all scopes needed upfront:
```
stats products events sales sales_refund financial affiliates webhooks
```

## Webhook Security

**Kiwify does NOT provide HMAC signature verification.** No `X-Signature` or equivalent header.

Defense-in-depth approach:
1. Accept only HTTPS (enforced by infrastructure)
2. Validate payload schema with Zod before processing
3. Use `order.id` for idempotency
4. Consider IP whitelist if Kiwify publishes static outbound IPs

## Idempotency

```sql
CREATE TABLE kiwify_webhook_events (
  order_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (order_id, event_type)
);
```

```typescript
async function handleKiwifyWebhook(payload: KiwifyWebhookPayload) {
  const inserted = await db.insert(kiwifyWebhookEvents)
    .values({ orderId: payload.order_id, eventType: payload.event })
    .onConflictDoNothing()
    .returning();

  if (inserted.length === 0) return; // duplicate

  await processKiwifyEvent(payload);
}
```

## Key Event Types

| Event | Trigger | Action |
|-------|---------|--------|
| `order_approved` | Sale completed | Grant product access |
| `order_refunded` | Refund issued | Revoke access |
| `order_chargeback` | Chargeback received | Revoke access + flag |
| `subscription_created` | Subscription started | Grant recurring access |
| `subscription_expired` | Subscription lapsed | Downgrade account |
| `subscription_canceled` | User cancelled | Schedule access revocation |

## Env Vars

| Var | Required | Notes |
|-----|----------|-------|
| `KIWIFY_CLIENT_ID` | Yes | From Kiwify developer dashboard |
| `KIWIFY_CLIENT_SECRET` | Yes | From Kiwify developer dashboard |

## Sandbox / Testing

- No separate sandbox API documented
- Use "Enviar evento de teste" (Test Webhook) in Kiwify dashboard
- Resend failed webhooks manually via dashboard
