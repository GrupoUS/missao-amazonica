# `src/pages/api/` — Agent Rules (Tier 2)

> SSR API endpoints. **Every file declares `prerender = false`.** Critical surface for auth, idempotency, donor PII.

## Inventory

| Path | Method | Auth | Purpose |
|---|---|---|---|
| `donations/create.ts` | POST | anon (RLS-checked) | Create donation intent + Pix QR |
| `donations/status.ts` | GET | anon (RLS) | Poll intent status |
| `webhooks/bank-pix.ts` | POST | HMAC | Bank Pix confirmation webhook |
| `admin/manual-confirm.ts` | POST | admin guard | Manual donation confirm |
| `admin/donations/export.ts` | GET | admin guard | Donations export (CSV) |

## Mandatory Skeleton

```ts
// src/pages/api/<domain>/<route>.ts
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { Sentry } from '@/lib/monitoring/sentry';

export const prerender = false;  // mandatory

const PayloadSchema = z.object({ … });

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const parsed = PayloadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: 'Dados inválidos', code: 'validation_failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // 1. auth (RLS via locals.supabase, OR requireAdmin, OR HMAC)
    // 2. business logic
    // 3. response

    return Response.json({ data: result }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    Sentry.captureException(err, { tags: { route: '/api/<domain>/<route>' } });
    return Response.json({ error: 'Erro interno', code: 'internal_error' }, { status: 500 });
  }
};
```

## Iron Rules

1. **`prerender = false`** at top of every file.
2. **`APIRoute` typed export** for each method (`GET`, `POST`, `PATCH`, `DELETE`).
3. **Zod-validate every body.** Schema imported from `@/lib/validators/<domain>.ts` (shared with islands).
4. **Error contract.** `Response.json({ error, code }, { status })` — never `throw`. Standard codes: `validation_failed` (400), `unauthenticated` (401), `forbidden` (403), `not_found` (404), `webhook_invalid_signature` (401), `webhook_disabled` (501), `rate_limited` (429), `internal_error` (500).
5. **Cache-Control: `no-store`** on any endpoint that touches user state or returns donor data.
6. **Sentry on the error path.** Tag with `{ route, provider, intent_id }`. Never include donor PII in tag values.
7. **Never `throw` raw Errors** — always JSON response. Stack traces = info disclosure.

## Auth Per Endpoint

| Endpoint | Auth | Pattern |
|---|---|---|
| Public POST (`donations/create`) | RLS via `locals.supabase` | use the per-request server client; RLS denies unauthorized writes |
| Public GET (`donations/status`) | RLS | same |
| Webhook (`webhooks/bank-pix`) | HMAC | `crypto.timingSafeEqual` on `x-signature` vs HMAC-SHA256 of raw body. See `@/lib/payments/AGENTS.md`. |
| Admin (`admin/**`) | session + role | `await requireAdmin(Astro)` — fails 403 if not in `admin_users` |

## Idempotency

Every webhook insert into `payment_events` uses:

```ts
const { data: inserted } = await admin
  .from('payment_events')
  .insert({ provider, bank_end_to_end_id, payload_json: parsed })
  .select('id')
  .maybeSingle();
// On conflict do nothing → returns null → ack 200, skip downstream.
```

Manual confirm uses `bank_end_to_end_id = 'MAN-' || intent_id` for guaranteed uniqueness.

## Don'ts

- ❌ `console.log` — use Sentry.
- ❌ Read `request.body` twice. Cache raw text for HMAC + parse.
- ❌ Forget `Cache-Control: no-store` on dynamic responses (CDN may cache donor data).
- ❌ Return raw SQL error messages to the client.
- ❌ Wildcard CORS. Webhook is HMAC-verified, not CORS-protected.
- ❌ Use `locals.supabase` from a webhook handler (no session there). Use `getSupabaseAdmin()` after HMAC verifies.
- ❌ `setTimeout` / long-running promises. Total endpoint time ≤ 5 s sync. Background work goes to a queue (out of scope MVP).

## Verification

```bash
bunx astro check
# Smoke each new route:
curl -i -X POST http://localhost:4321/api/<route> -d '<body>' -H 'Content-Type: application/json'
# Webhook idempotency: curl twice → second is no-op (audit_logs has only 1 confirm).
```

## See Also

- [`.claude/rules/backend.md`](../../../.claude/rules/backend.md) — full server patterns
- [`.claude/rules/integrations.md`](../../../.claude/rules/integrations.md) — webhook + provider rules
- [`@/lib/validators/AGENTS.md`](../../lib/validators/AGENTS.md) — Zod schemas
- [`@/lib/payments/AGENTS.md`](../../lib/payments/AGENTS.md) — Pix + HMAC
