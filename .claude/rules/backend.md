---
globs: apps/api/src/**
---

# Backend Rules (Tier 2 — Auto-loaded)

> Canonical implementation authority: `apps/api/src/AGENTS.md`
> Architecture references: `.claude/docs/architecture/`

## Purpose

This file stays intentionally **slim**.

Use it for:
- immediate backend guardrails
- safe defaults while editing `apps/api/src/**`
- routing to the right deeper reference only when needed

Do **not** turn this file into a handbook. Deep examples, historical bug patterns, and operational background belong in Tier 3 architecture references.

---

## Load Strategy

Load additional context only when the task requires it:

| Need | Load |
|------|------|
| Backend structure, routers, request flow | `.claude/docs/architecture/03-backend-components.md` |
| Data model / persistence architecture | `.claude/docs/architecture/06-data-architecture.md` |
| Security, auth boundaries, webhook verification | `.claude/docs/architecture/07-security-architecture.md` |
| External providers and integration topology | `.claude/docs/architecture/09-integration-map.md` |
| Runtime config / env / backend learnings | `.claude/docs/architecture/11-runtime-environment.md` |
| Schema domain overview | `.claude/docs/architecture/12-database-schema-reference.md` |
| Historical backend bug patterns | `.claude/docs/architecture/13-backend-learnings.md` |
| Full backend coding authority while editing | `apps/api/src/AGENTS.md` |

---

## Procedure Hierarchy

Use the correct procedure level. Never emulate role separation manually inside a broader procedure.

```/dev/null/backend-procedure-hierarchy.txt#L1-4
publicProcedure    → health checks and explicitly public endpoints
protectedProcedure → authenticated user required
adminProcedure     → authenticated + admin authorization
mentoradoProcedure → authenticated + mentorado resolved from context
```

### Rule
- Do not use `protectedProcedure` and then hand-roll admin or mentorado checks if a narrower procedure already exists.
- Tenant identity should come from context, not from redundant client input.

---

## Type Safety

- Prefer `unknown` over `any`
- Prefer type narrowing over unsafe assertions
- Use `as const` for immutable structured values
- Avoid `as any`; if you truly need an escape hatch, isolate it and document why
- Match Zod input types to DB/runtime expectations exactly

### Zod Rules
- Define schemas at module scope
- Prefer `z.unknown()` over `z.any()`
- Use `z.discriminatedUnion()` for unions with 3+ variants
- Import from `'zod'`, not `'zod/v4'`
- Add `.max()` to user-controlled string inputs
- Be careful with `z.coerce.number()` because `Number("") === 0`

---

## Request and Service Shape

```/dev/null/backend-request-lifecycle.txt#L1-6
HTTP → Hono → tRPC Router → Procedure middleware
     → Zod validation → service logic
     → Drizzle query → response mapping
```

### Rules
- Keep business logic out of thin procedure handlers
- Co-locate service functions with routers rather than creating arbitrary service sprawl
- Use composable query/service helpers for repeated backend logic
- Use `Promise.all` for truly independent work

---

## Data Access

- Import the shared `db` singleton from `apps/api/src/db.ts`
- Never use `SELECT *`; specify columns explicitly
- Add `.limit()` to large queries where appropriate
- Guard `.returning()` and `.select()` results before destructuring
- For aggregated metrics, recompute derived values from raw totals

### On-demand references
- Schema shape: `.claude/docs/architecture/12-database-schema-reference.md`
- Historical persistence pitfalls: `.claude/docs/architecture/13-backend-learnings.md`

---

## Error Handling

- Throw `TRPCError` with correct codes at API boundaries
- Do not leak raw internal exceptions directly to clients
- Prefer early returns over deep nesting
- Use descriptive error messages for logs and internal debugging
- Server entrypoints must preserve top-level process error handlers
- When emitting a typed app-level error code, surface it via `cause: { code }` so the tRPC error formatter exposes `error.data.appCode` to the client. Localized human messages must NEVER be the contract — frontend branches on the code, not on substrings.

---

## `_core/` Singletons (Mandatory Reuse)

Before adding any provider/SDK client construction in `apps/api/src/`, grep `_core/` for an existing helper. Re-instantiating clients per request is forbidden (TLS handshake cost + connection pool fragmentation).

| Need | Use this | Do NOT |
|------|----------|--------|
| Gemini chat / image / multimodal | `getGeminiClient()` from `apps/api/src/_core/ai-provider.ts` | `new GoogleGenAI({ apiKey })` in service files |
| AI orchestrator (multi-provider text fallback) | `getOrchestrator()` from `apps/api/src/_core/ai-provider.ts` | direct provider imports |
| Database | shared `db` singleton from `apps/api/src/db.ts` | new Drizzle/Neon connection per file |
| Structured logger | `createLogger({ service })` from `apps/api/src/_core/logger.ts` | `console.warn(JSON.stringify(...))` with `biome-ignore` |

AI **image** generation specifically lives in `apps/api/src/_core/image-generation.ts` and is Gemini-only (`gemini-3-pro-image-preview` / Nano Banana Pro). OpenAI is **never** wired for images, only as an optional text-orchestrator fallback. Verify against `_core/ai-provider.ts` before trusting any external plan that names "OpenAI" or `gpt-image-*`.

---

## Security

- No `console.log` or `debugger` in production backend code
- No wildcard CORS in production
- Never commit secrets
- Use the env/config layer instead of scattered direct secret reads
- Every external API call must have a timeout
- Webhook endpoints should acknowledge quickly and process safely

### On-demand references
- Security architecture: `.claude/docs/architecture/07-security-architecture.md`
- Runtime/env guidance: `.claude/docs/architecture/11-runtime-environment.md`
- Integration-specific behavior: `.claude/rules/integrations.md`

---

## Performance

- Use `Promise.all` for independent DB or provider calls
- Prefer prepared statements on hot paths
- Avoid loading large result sets into memory when SQL aggregation can do the work
- Keep response contracts stable; adapt consumer-specific transforms near the consumer when possible

---

## Stability Checklist (Backend subset)

These are the backend-critical stability reminders. Full cross-app checklist lives in `.claude/rules/stability.md`.

- **A**: Missing barrel re-exports can cause runtime failures
- **B**: Never use non-null assertion `!` on optional data
- **C**: Guard empty `.returning()` / `.select()` arrays
- **D**: Use the correct procedure level for auth scope
- **E**: Preserve `uncaughtException` and `unhandledRejection` handling
- **F**: Do not default required production env vars to localhost
- **G**: Do not use wildcard CORS in production
- **H**: Use structured logging, not `console.log`
- **I**: Avoid `as any`

---

## When to Load More

Load deeper references only if the task touches one of these areas:

| Trigger | Reference |
|--------|-----------|
| tenant resolution, metrics aggregation, date bugs | `.claude/docs/architecture/13-backend-learnings.md` |
| env vars, runtime behavior, provider credentials | `.claude/docs/architecture/11-runtime-environment.md` |
| schema/domain placement questions | `.claude/docs/architecture/12-database-schema-reference.md` |
| system-level backend architecture decisions | `.claude/docs/architecture/03-backend-components.md` |

---

## Summary

This file is the **operational guardrail layer** for backend edits.

- Rules here should stay compact
- Deep detail belongs in architecture references
- Canonical implementation authority remains `apps/api/src/AGENTS.md`
- Load more only when the current task actually needs it
