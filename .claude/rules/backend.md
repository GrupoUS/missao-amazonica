---
globs: src/pages/api/**, src/middleware.ts, src/lib/supabase/**, src/lib/payments/**, src/lib/email/**, src/lib/audit/**, src/lib/auth/**
---

# Backend Rules (Tier 2 — Auto-loaded)

> Authority: this file + root `AGENTS.md`. There is no separate `apps/api/AGENTS.md` — this is a single Astro app.

## Purpose

Operational guardrails for server-side code: API routes, middleware, Supabase access, Pix providers, Resend email, audit logging.

---

## Astro API Routes

```ts
// src/pages/api/donations/create.ts
import type { APIRoute } from 'astro';

export const prerender = false; // mandatory for /api/**

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  // 1. validate input via Zod (schema imported from src/lib/validators)
  // 2. read authenticated session via locals.supabase
  // 3. perform action through Supabase client (RLS enforces auth)
  // 4. return JSON via new Response or `Response.json(...)`
};
```

Rules:
- Always declare `export const prerender = false` on `src/pages/api/**`. Without it, Astro tries to prerender at build time.
- Type handlers as `APIRoute`. Use `request`, `locals`, `cookies`, `redirect`, `params` from the context.
- Validate every body with **Zod**. Schemas live at module scope in `src/lib/validators/<domain>.ts`.
- Return `Response.json({ data })` or `Response.json({ error, code }, { status })`. Never leak raw exceptions.
- Set `Cache-Control: no-store` on any endpoint that touches per-user state.

---

## Supabase Server Access

Three client types, picked by call site:

| Client | Module | Use from | Auth |
|---|---|---|---|
| Server-side per-request (RLS) | `src/lib/supabase/server.ts` | Astro pages + API routes + middleware | Cookie session via `@supabase/ssr` |
| Browser island | `src/lib/supabase/browser.ts` | React island components only | Anon key, public |
| Service role | `src/lib/supabase/admin.ts` | Webhook handlers + admin-action endpoints only | Service-role key |

`src/lib/supabase/admin.ts` must throw at import time if `import.meta.env.SSR === false`. Never reach for it in a `.tsx` island.

`createServerClient` reads cookies through `Astro.cookies`. The middleware sets cookies and exposes `locals.supabase` + `locals.user` so downstream code does not re-instantiate.

---

## Auth Model

- **RLS is the primary auth layer.** Endpoints typically rely on the per-request server client; RLS blocks cross-tenant or cross-role reads/writes automatically.
- Admin checks: call `is_admin(auth.uid())` via Supabase, or use the helper `await requireAdmin(Astro)` from `src/lib/auth/admin-guard.ts`. Both fail fast with 403.
- Never re-implement `is_admin` in TypeScript — it lives in plpgsql and is the source of truth.
- For routes that must run with elevated rights (webhook → confirm donation), use the service-role client and explicitly enforce idempotency.

---

## Idempotency Rules (Webhooks + Admin Mutations)

- Every webhook insert into `payment_events` is `on conflict (provider, bank_end_to_end_id) do nothing returning id`. If `id` is null → ack 200 and skip.
- Every admin mutation that changes financial state goes through `confirm_donation(intent_id, event_id, amount)` plpgsql function. Never bypass it from JS.
- Manual confirmations use `provider='manual'` and `bank_end_to_end_id='MAN-' || intent_id` — guarantees uniqueness vs future bank events.

---

## Error Contract

```ts
return Response.json({ error: 'Item not found', code: 'item_not_found' }, { status: 404 });
```

- `error`: human-readable, pt-BR, safe to surface to a donor.
- `code`: stable machine identifier; the frontend branches on this, never on `error` substrings.
- Server logs the underlying exception with `Sentry.captureException` plus structured context (`intent_id`, `txid`, `route`).
- Never include stack traces, raw SQL errors, or internal paths in the response body.

Standard codes: `validation_failed`, `item_not_found`, `item_not_published`, `intent_not_found`, `rate_limited`, `webhook_invalid_signature`, `webhook_disabled`, `internal_error`.

---

## Email (Resend) Wrapper

`src/lib/email/resend.ts` exposes `sendEmail({ to, subject, react })`. It must:
- log a structured warn and return `{ skipped: true }` when `RESEND_API_KEY` is undefined — never throw.
- never block the calling endpoint on slow Resend responses (`await` is fine; failures are caught + logged).
- never include donor PII in subject lines.

---

## Audit

`src/lib/audit/log.ts` exposes `logAudit({ actorId, action, entityType, entityId, before, after })`. Every admin POST/PATCH/DELETE calls it. The DB also has a trigger for `donation_items` / `accountability_entries` / `settings` as a backstop.

---

## Stability Checklist (backend subset)

- Always guard `await supabase.from(...).select().single()` results — `.single()` returns `{ data, error }`; check `error` and `data` before using.
- For arrays, check both `error` and `data?.length` before destructuring.
- Never use `as any`. Generate types via `bunx supabase gen types --linked` and import from `src/lib/supabase/types.ts`.
- Never use a non-null assertion (`!`) on Supabase results.
- Every external call (Pix, Resend, Sentry) must have a timeout (default 5s for sync confirm, 30s for batched).
- No `console.log`. Use `Sentry.captureException` for errors and `Sentry.captureMessage` (level=info) for notable events.

---

## When To Load More

| Need | Load |
|---|---|
| Schema / migration / RLS / views | `.claude/rules/database.md` |
| External provider integration patterns | `.claude/rules/integrations.md` |
| Universal stability checklist | `.claude/rules/stability.md` |
| Frontend interaction with API | `.claude/rules/frontend.md` |
