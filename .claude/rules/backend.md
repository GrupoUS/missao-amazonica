# Backend Rules (Tier 2 — Generic Template)

> Replace placeholders with project specifics, or override entirely via `${overlay}/rules/backend.md`.

## Purpose

Operational guardrails for server-side code: API routes/handlers, middleware, database access, external provider calls, audit logging.

---

## Route / handler structure

Every server route declares:
1. **Entry signature** — typed handler (`APIRoute`, `Handler`, `RequestHandler`, etc.) with explicit input/output types
2. **Input validation** — schema validation library (Zod / Valibot / Yup / equivalent) at module scope, never inside handlers
3. **Auth check** — explicit per-route, not implicit
4. **Action** — interact with data layer (DB, cache, external API)
5. **Response** — structured `{ data }` on success or `{ error, code }` on failure
6. **Logging** — errors → structured logger (Sentry / Datadog / equivalent) with tags

If the framework requires render-mode declarations (e.g., Astro hybrid, Next.js App Router) → declare it on every route.

---

## Database access

Pick one client style per call site:

| Client type | When |
|---|---|
| Per-request (RLS / session-bound) | Pages, API routes, middleware — propagates user identity |
| Anonymous / public | Static pages, public widgets — anon key, no session |
| Service-role / elevated | Webhook handlers, admin ops — bypasses RLS, server-only |

Service-role / elevated clients **must** throw at import time if loaded in browser context. Add a runtime guard.

---

## Auth model

- RLS / row-level security is the **primary** auth layer when the database supports it. Don't re-implement auth in code that the DB already enforces.
- For role-elevated checks (admin, owner), call a single canonical helper (e.g., `requireAdmin`, `is_admin(uid)`). Never re-implement the rule in TypeScript if it lives in the DB.
- Webhooks: use service-role credentials + idempotency, not user-bound auth.

---

## Idempotency (webhooks + admin mutations)

- Every webhook insert into the events log is `INSERT … ON CONFLICT (provider, external_id) DO NOTHING RETURNING id`. If `id` is null → ack 200 + skip downstream effects.
- Every admin mutation that changes financial/sensitive state goes through a single canonical procedure (DB function or service function). Never bypass.
- Manual fallbacks use synthetic IDs that don't collide with future real events.

---

## Error contract

```ts
return Response.json({ error: 'human-readable', code: 'stable_machine_id' }, { status });
```

- `error`: human-readable, in project locale, safe to surface
- `code`: stable machine identifier; clients branch on this, never on `error` substrings
- Server logs the underlying exception with structured context (`route`, `request_id`, relevant ids)
- Never include stack traces, raw SQL, or internal paths in response body

Standard codes: `validation_failed`, `not_found`, `not_authorized`, `rate_limited`, `webhook_invalid_signature`, `internal_error`. Add domain-specific codes as needed.

---

## External provider wrappers

Every external API call has:
- Timeout (default 5s sync, 30s batch)
- Graceful degradation when API key missing (log warn + return `{ skipped: true }` — never throw)
- Errors caught and logged with provider-specific tag
- No raw provider responses in client-facing errors
- No PII in subject lines / logs / non-essential fields

---

## Audit

Every admin POST/PATCH/DELETE writes an audit log entry: actor, action, entity_type, entity_id, before, after. Backstop with DB triggers on sensitive tables.

---

## Stability checklist (backend subset)

- Always guard `.single()` / first-row destructure: check `error` and `data` separately
- Never use `as any`. Generate types from schema; commit them.
- Never use `!` non-null assertion on optional data
- Every external call has a timeout
- No `console.log`. Use structured logger.

---

## When to load more

| Need | Load |
|---|---|
| Schema / migration / RLS / views | `database.md` |
| External provider integration patterns | `integrations.md` |
| Universal stability checklist | `stability.md` |
| Frontend ↔ API contract | `frontend.md` |

---

## Project-specific authority

If `${overlay}/rules/backend.md` exists, prefer it over this template — it captures project stack specifics (Astro / Next.js / Hono / Express / etc., Supabase / Drizzle / Prisma, Pix / Stripe / Asaas, Resend / SendGrid / SES, Sentry / Datadog).
