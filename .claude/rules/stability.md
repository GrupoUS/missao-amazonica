# Stability Audit Checklist (Tier 2 — Generic Template)

> Universal stability guardrails. Applies to any code change in any project.
> Override / extend via `${overlay}/rules/stability.md`.

## Purpose

Provide the minimum always-useful stability checks for any change, plus pointers to deeper references.

---

## Core checklist (A–L)

- **A — Barrel exports.** When adding to a `<domain>/index.ts`, confirm every new export is re-exported. Missing re-exports cause runtime failures inside dynamic imports.
- **B — No `!` assertions.** Never use a non-null assertion on optional results, env vars, or query results. Use `??`, type guards, or early returns.
- **C — Array / result guards.** Always guard data access against empty / error before destructuring. With `.single()` / first-row APIs, check `error` and `data` separately.
- **D — Render mode.** Every page declares its render mode correctly (per framework). API/server routes are always SSR; static content is always prerendered when possible.
- **E — Error handlers.** Server entry points wrap top-level work in try/catch + structured logging. Process-level handlers configured per framework.
- **F — Env config.** Never default a production-required variable to localhost or a fake value. Fail fast with a clear error on first read in production.
- **G — CORS.** API routes return only the headers they need. No wildcard `Access-Control-Allow-Origin`. Authenticate webhooks by signature, not CORS.
- **H — No `console.log`.** Use structured logger (`captureException` / `captureMessage` / `logger.info`). Allow `console.warn` only inside no-op fallbacks where the wrapper purposefully degrades.
- **I — No `as any`.** Generate types from schema. Use `unknown` + schema parse at boundaries.
- **J — Mutation errors.** Every form / mutation call wraps in try/catch with a user-facing toast / error message. Never silently swallow.
- **K — No dead anchors.** Never `href="#"`. Use `<button>` for actions, real `<a href="…">` for navigation.
- **L — Error boundaries.** Production UI never exposes a stack trace. The 500 page shows generic copy and a contact CTA.

---

## Idempotency

| Surface | Pattern |
|---|---|
| Webhook ingestion | Events table unique on `(provider, external_id)`; insert `on conflict do nothing returning id`; skip downstream when no row |
| Manual confirm | Synthetic `external_id = 'MAN-<intent_id>'`; same uniqueness path |
| Admin re-publish | No state machine regression — transitions logged in audit_logs |

---

## Performance gates

Read thresholds from `.claude/config.json::gates`:

| Layer | Threshold |
|---|---|
| Lighthouse Perf / A11y / BP / SEO | per `gates.lighthouse.*` |
| LCP | per `gates.lcp` |
| CLS | per `gates.cls` |
| INP | per `gates.inp` |
| Initial JS on prerendered pages | per `gates.initialJsKb` |

---

## Verification after changes

| Surface changed | Verification |
|---|---|
| API routes / handlers | type-check + curl smoke + monitoring sees the request |
| Public pages | dev server + visual smoke + mobile breakpoints |
| Schema migrations | DB lint + apply + regenerate types + smoke that RLS denies anon |
| Components | type-check + visual smoke + icon-library rule grep |
| Styles / tokens | build succeeds + visual diff vs design |
| Webhook | curl twice → only one confirmation; overage curl → reserve-row written |
| Admin mutation | audit log row appears |

---

## Escalation triggers

Load deeper context **before** changing code when any of these are true:

- Root cause unclear after initial inspection
- Bug spans multiple layers (API + UI + schema)
- Change affects auth, RLS, or PII
- Change affects schema, FKs, or RLS policies
- Issue involves polling / real-time / webhooks / idempotency
- Two consecutive fix attempts on the same hypothesis failed

For those cases: read the appropriate domain rule + project specs before editing. Or invoke `/debug recover`.

---

## File design

This file stays short, operational, broadly applicable. Detail lives in:

- `backend.md` — server-side specifics
- `database.md` — schema specifics
- `frontend.md` — UI specifics
- `integrations.md` — provider specifics
- `${overlay}/rules/*.md` — project-specific authoritative versions of the above

---

## Project-specific authority

If `${overlay}/rules/stability.md` exists, prefer it — it captures project-specific gates (e.g., webhook idempotency contract, RLS anon deny tests, donation-excess routing).
