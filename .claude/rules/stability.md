---
globs: apps/**
---

# Stability Audit Checklist (Tier 2 — Auto-loaded)

> Compact stability guardrails for any `apps/` change.
> Keep this file short. Load deeper references only when the task needs them.

## Purpose

This rule exists to provide the **minimum always-useful stability checks** without forcing large historical or domain-specific context into every task.

Use this file as:
- the default safety checklist for app changes
- a routing layer to deeper references when the bug is non-trivial
- a reminder to validate after every modification

Do **not** expand this file into a handbook. Detailed examples and historical bug families belong in domain references.

---

## Core Checklist (A-L)

- **A — Barrel Exports**: Every export must exist in its barrel `index.ts`. Missing re-exports can cause runtime crashes.
- **B — No `!` Assertions**: Never use non-null assertion `!` on optional data. Use `??`, guards, or `?.`.
- **C — Array Guards**: Always guard `.returning()` / `.select()` results against empty arrays before access. For arrays of objects with optional fields (e.g. `Array<{ url?: string }>`), validate the **content** of each element (`some(e => Boolean(e.url || e.b64Json))`), not just `array.length > 0` — `[{ url: undefined }]` has length 1.
- **D — Auth Procedures**: Use the correct procedure level (`adminProcedure`, `mentoradoProcedure`, etc.). Never emulate role checks manually in generic protected flows.
- **E — Error Handlers**: Server entry points must have `uncaughtException` and `unhandledRejection` handling.
- **F — Env Config**: Never default production-required variables to localhost or fake values. Fail fast.
- **G — CORS**: Never use wildcard CORS in production. Use explicit origins with `credentials: true` when required.
- **H — No `console.log`**: Use the project logger in production code. Backend canonical: `createLogger({ service })` from `apps/api/src/_core/logger.ts`. Declare a module-level `logger` immediately after imports in any new service file.
- **I — No `as any` / `as string` / `as number` over possibly-undefined**: Prefer real types, narrowing, or precise assertions. `Boolean(x)` does NOT propagate type narrowing across closures — alias the value into a `const` and guard it (`const v = x; if (!v) return;`) instead of casting downstream.
- **J — Mutation Errors**: Always wrap async mutations in error handling with user-facing feedback where applicable.
- **K — No Dead Anchors**: Never use `href="#"` for actions. Use buttons for actions and real links for navigation.
- **L — Error Boundaries**: Never expose stack traces in production UI. Show safe generic messaging.

---

## Selective Loading Guidance

Load deeper context only when needed:

| Situation | Load Next |
|----------|-----------|
| Backend runtime bug, tRPC issue, service logic, auth flow | `.claude/rules/backend.md` |
| Schema, Drizzle, table design, FK/index questions | `.claude/rules/database.md` |
| Frontend rendering, UI state, React interaction bugs | `.claude/rules/frontend.md` |
| External provider/webhook/integration behavior | `.claude/rules/integrations.md` |
| Multi-domain architecture or operational context | `.claude/docs/architecture/README.md` |
| Backend bug history / tenant resolution / aggregation pitfalls | `.claude/docs/architecture/13-backend-learnings.md` |
| UI foundations / layout / design language | `.claude/docs/design-specs/00-design-system-foundation.md` |
| Frontend bug history / polling / memoization / hot-list patterns | `.claude/docs/design-specs/00-frontend-learnings.md` |

### Load Order

Prefer this progression:

1. Root `AGENTS.md`
2. This compact stability rule
3. Domain rule(s) that match the task
4. Focused Tier 3 reference docs only if the task needs deeper context
5. Subdirectory `AGENTS.md` only when editing in that domain

This keeps context lean while preserving correctness.

---

## Escalation Triggers

Load deeper references before changing code when any of these are true:

- root cause is unclear after initial inspection
- bug spans frontend + backend or multiple services
- change affects auth, tenant resolution, or data isolation
- change affects schema, migrations, or foreign keys
- issue involves polling, virtualization, memoization, or realtime UI
- issue involves webhooks, retries, idempotency, or third-party APIs
- there is a known historical pitfall in the affected domain

---

## Verification Rule

Every change must be followed by validation appropriate to the surface changed.

Minimum expectation:
- type-check relevant changes
- run lint/format checks as needed
- run tests when behavior changed
- verify the actual flow when the bug is runtime or UX related

If the first fix does not hold under verification, revisit the root cause rather than patching symptoms.

---

## File Design Rule

This file should remain:
- short
- operational
- broadly applicable
- reference-oriented, not example-heavy

If you need more than a few lines to explain a pattern, move that detail into the appropriate Tier 3 reference and link it here.
