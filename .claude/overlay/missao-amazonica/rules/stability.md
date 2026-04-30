---
globs: src/**, supabase/**
---

# Stability Audit Checklist (Tier 2 — Auto-loaded)

> Compact universal stability guardrails. Domain-specific detail lives in domain rule files.

## Purpose

Provide the minimum always-useful stability checks for any change in this repo, plus pointers to deeper references when the issue is non-trivial.

---

## Core Checklist (A–L)

- **A — Barrel exports.** When adding to a `src/lib/<domain>/index.ts`, confirm every new export is re-exported. Missing re-exports cause runtime failures inside dynamic imports.
- **B — No `!` assertions.** Never use a non-null assertion on optional Supabase results, env vars, or query results. Use `??`, type guards, or early returns.
- **C — Array guards.** Always guard `.select()` / `.insert().select().single()` results against empty / error before destructuring. With `.single()`, check `error` and `data` separately. With arrays of objects with optional fields, validate **content**, not just `length`.
- **D — Render mode.** Every `src/pages/**` file declares `export const prerender = true|false` correctly. `/api/**` and `/admin/**` are always `false`. Public pages are `true`.
- **E — Error handlers.** Server entry points (`src/middleware.ts`, webhook handlers) wrap top-level work in try/catch + `Sentry.captureException`. Process-level handlers are configured via `@sentry/astro`.
- **F — Env config.** Never default a production-required variable to localhost or a fake value. Fail fast with a clear error on first read in production.
- **G — CORS.** API routes return only the headers they need. No wildcard `Access-Control-Allow-Origin`. The webhook is unauthenticated by HMAC, not by CORS.
- **H — No `console.log`.** Use `Sentry.captureException` / `captureMessage`. Allow `console.warn` only inside the Resend/Sentry no-op fallbacks where the wrapper purposefully degrades.
- **I — No `as any`.** Generate types via `bunx supabase gen types`. Use `unknown` + Zod parse at boundaries.
- **J — Mutation errors.** Every form island wraps `fetch` in try/catch with a user-facing toast. Never silently swallow.
- **K — No dead anchors.** Never `href="#"`. Use `<button>` for actions. Use real `<a href="...">` for navigation.
- **L — Error boundaries.** Production UI never exposes a stack trace. The 500 page shows generic copy and a contact CTA.

---

## Idempotency

| Surface | Pattern |
|---|---|
| `/api/webhooks/bank-pix.ts` | `payment_events` unique on `(provider, bank_end_to_end_id)`; insert `on conflict do nothing returning id`; skip downstream when no row |
| Manual confirm | Synthetic `bank_end_to_end_id = 'MAN-' || intent_id`; same uniqueness path |
| Admin re-publish | No state machine regression — `donation_items.status` transitions logged in `audit_logs` |

---

## Performance Gates

| Layer | Threshold |
|---|---|
| Lighthouse Perf / A11y / BP / SEO | ≥ 95 on `/`, `/doar`, `/prestacao-de-contas` |
| LCP | < 2.5s |
| CLS | 0 |
| INP | < 100ms |
| Initial JS on prerendered pages | < 50KB |

---

## Verification After Changes

| Surface changed | Verification |
|---|---|
| `src/pages/api/**` | `bunx astro check`; curl smoke; check `Sentry.captureMessage` shows up |
| `src/pages/**` (public) | `bun run dev`; visual smoke + mobile breakpoints |
| `supabase/migrations/**` | `bunx supabase db lint`; `bunx supabase db push`; regenerate types; psql smoke that RLS denies anon |
| `src/components/**` | `bunx astro check`; visual smoke; Lucide rule grep |
| `src/styles/global.css` | `bun run build` succeeds; visual diff vs mockup |
| Webhook | Curl twice → only one confirmation; overage curl → reserve row |
| Admin mutation | `audit_logs` row appears |

---

## Escalation Triggers

Load deeper context **before** changing code when any of these are true:

- Root cause unclear after initial inspection
- Bug spans multiple layers (API + UI + schema)
- Change affects auth, RLS, or PII
- Change affects schema, FKs, or RLS policies
- Issue involves polling / realtime / webhooks / idempotency
- Two consecutive fix attempts on the same hypothesis failed

For those cases, prefer reading the appropriate domain rule + the design / PROMPT specs before editing.

---

## File Design

This file stays short, operational, broadly applicable. Detail lives in:

- `.claude/rules/backend.md`
- `.claude/rules/database.md`
- `.claude/rules/frontend.md`
- `.claude/rules/integrations.md`
- root `AGENTS.md`
