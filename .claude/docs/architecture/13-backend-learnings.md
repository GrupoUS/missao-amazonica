<!-- Agent instruction: Append a new entry whenever you fix a non-obvious bug
or discover a backend pattern. Format: ## YYYY-MM-DD — [short title]
Describe: what happened, root cause, fix applied, how to avoid. -->

# Backend Learnings — Architecture Reference

> Consolidated reference extracted from historical backend fixes and architecture rules.
> Load this file only when working on backend debugging, tRPC procedure design, Drizzle persistence, multi-tenant resolution, or integration-heavy API behavior.

## Purpose

This document captures backend-specific production learnings that should not stay in always-loaded context. It complements:

- `.claude/rules/backend.md` — compact operational rules
- `.claude/rules/database.md` — compact schema guardrails
- `.claude/docs/architecture/03-backend-components.md` — backend structure
- `.claude/docs/architecture/06-data-architecture.md` — persistence architecture
- `apps/api/src/AGENTS.md` — canonical backend authority when editing backend files

Use this reference when the task involves non-obvious historical pitfalls, especially where the correct solution depends on prior bugs already fixed in production.

---

## When to Load

Load this document on demand for tasks involving:

- Multi-tenant resolution or Clerk organization membership
- Metrics aggregation across providers
- Bulk import schema alignment with Drizzle enums
- Financial date filtering and timezone correctness
- tRPC error normalization
- AI gateway tool declaration parity
- WhatsApp pagination transforms between API and frontend consumers

Do **not** preload this file for routine backend work.

---

## 1. Multi-tenant Resolution Priority

> Added after a bug where an org-invited user saw their own empty data instead of the organization data.

### Root Cause

`resolveMentoradoForUser` previously prioritized owner lookup before team membership resolution. Users who registered before accepting an organization invitation could end up with an auto-created personal `mentorado`, causing tenant resolution to stop early and ignore the actual team relationship.

### Correct Resolution Order

```neondash/.claude/docs/architecture/13-backend-learnings.md#L33-42
// ✅ Correct priority
// 1. findTeamMembershipByUserId
// 2. findTeamMembershipByEmail
// 3. owner lookup (mentorados WHERE user_id = ...)
// 4. admin/mentor bypass
// 5. legacy auto-link
// 6. clinica_staff guard
// 7. auto-create
```

### Wrong Resolution Order

```neondash/.claude/docs/architecture/13-backend-learnings.md#L46-51
// ❌ Do not revert to this
// 1. owner lookup
// 2. admin/mentor
// 3. findTeamMembershipByUserId
// 4. findTeamMembershipByEmail
```

### Operational Recovery Pattern

If a user has both:
- an auto-created personal `mentorado`, and
- an active team membership

then detach the spurious personal record so membership resolution wins.

Key rule: **team membership must always outrank personal ownership lookup**.

---

## 2. Metrics Aggregation Rules

> Added after critical fixes in ads aggregation logic.

When combining metrics from multiple providers, derived metrics must be recalculated from raw totals. Never combine or reuse already-derived ratios from one provider to represent a cross-provider aggregate.

### Conversion Value vs Conversion Count

Do not mix:
- **count metrics** like `conversions`
- **monetary metrics** like `conversionValue`

If one provider does not expose a compatible monetary value, use `0` or explicitly mark the field unsupported. Never substitute a count for currency.

### Cost per Conversion

Always compute cost-per-conversion from:

- total spend
- total conversions

Never divide one provider’s precomputed `costPerConversion` by a combined conversion total.

### Architectural Rule

For any aggregated dashboard/service metric:

1. Gather raw source metrics
2. Normalize units
3. Sum totals
4. Recompute derived metrics from totals

This avoids silent math corruption.

---

## 3. Bulk Import Schema Rules

> Added after type failures in bulk insert flows.

### DB Enum Inputs Must Match Zod Enum Inputs

When a Drizzle column is backed by `pgEnum`, the tRPC/Zod input schema must use the exact enum values. Avoid permissive `z.string()` schemas for enum-backed DB fields.

### Numeric Columns Must Stay Numeric

Never wrap integer/numeric DB values in `String()` before insert or update. Persist numbers as numbers.

### mentoradoProcedure Context Ownership

For `mentoradoProcedure`, `mentoradoId` belongs to authenticated context and should be resolved server-side via `ctx.mentorado.id`.

Do not require the frontend to pass `mentoradoId` for procedures that already derive it from auth context.

### Architectural Rule

Auth-scoped procedures should derive tenant identity from context, not user input.

---

## 4. Financeiro Date and Type Patterns

> Added after systematic audit of financial router logic.

### Exclusive Upper Bound for Date Ranges

If `dataFim` represents the first instant/day of the next period, use an exclusive upper bound comparison.

- Wrong mental model: `lte(dataFim)`
- Correct mental model: `lt(dataFim)`

This avoids off-by-one inclusion bugs.

### ISO Date-only Strings and Timezones

For strings like `2024-01-15`, JavaScript date parsing can shift the perceived calendar day in UTC-3 and similar zones when using local getters.

Use UTC-safe accessors for date-only strings.

### `z.record(z.unknown())` over `z.record(z.any())`

Use `unknown` for type-safe unstructured objects. Avoid `any` unless there is a truly unavoidable boundary.

### Normalize Raw Errors to `TRPCError`

Do not rethrow raw internal errors from procedure boundaries. Convert them into explicit `TRPCError` values with stable codes and user-safe messages.

### Architectural Rule

Persistence and transport layers must preserve:
- calendar correctness
- type integrity
- error boundary hygiene

---

## 5. AI Gateway Documentation Parity

A historical bug revealed that `tools.md` documented a tool that the corresponding agent implementation did not actually expose.

### Rule

For each AI gateway domain:

- `packages/ai-gateway/src/templates/[domain]/tools.md`
- `[Domain]Agent.ts`

must remain in strict parity.

Whenever a tool is added, removed, or renamed in the implementation, update the markdown contract immediately.

### Why It Matters

Mismatch between implementation and tool documentation creates:
- invalid orchestration assumptions
- runtime tool lookup failures
- misleading prompts and agent behaviors

This is an architecture contract, not just documentation polish.

---

## 6. WhatsApp Paginated Format Transform

Some backend routes return paginated objects like:

- `messages`
- `nextCursor`

When frontend consumers need a flat array, the transform should happen in the query layer via query selection rather than changing backend contract shape casually.

### Rule

Keep the backend response contract stable if it serves pagination correctly. Adapt consumer expectations at the boundary nearest the consumer.

This prevents one screen’s convenience from breaking another screen’s pagination flow.

---

## 7. Cross-cutting Backend Heuristics

Apply these heuristics before changing backend behavior:

1. **Prefer auth context over client input** for tenant identity.
2. **Prefer raw totals over derived ratios** for aggregated metrics.
3. **Prefer exact enums over permissive strings** at API boundaries.
4. **Prefer exclusive upper bounds** for period-end date filtering.
5. **Prefer UTC-safe accessors** for date-only strings.
6. **Prefer explicit transport errors** over leaked internal exceptions.
7. **Prefer contract parity** between AI docs and runtime tool exposure.
8. **Prefer consumer-side adaptation** over destabilizing shared response contracts.

---

## 8. Load-Shedding Guidance for Context Engineering

To avoid excessive context consumption:

- Keep `.claude/rules/backend.md` compact and operational
- Keep this file as historical/reference depth
- Load this file only when the task touches one of its bug families
- Prefer linking to this file from commands and rules instead of copying its content into always-loaded prompts

Recommended references from commands/rules:

- “Load `13-backend-learnings.md` for historical backend bug patterns”
- “Consult this file before changing tenant resolution or cross-provider metrics logic”

---

## 2026-04-28 — Token-refresh failures must distinguish revocation from transient errors

**What happened:** `ensureValidToken` in `apps/api/src/routers/calendar.ts`
deleted the `googleTokens` row on every refresh failure, including transient
network/5xx errors against `oauth2.googleapis.com`. Users hit a single bad
network second and were forced through full re-OAuth.

**Root cause:** Only `GoogleApiError.code === "TOKEN_REVOKED" | "TOKEN_EXPIRED"`
indicates an unrecoverable grant state. Everything else (network errors,
Google 5xx, classification ambiguity) is transient and should be retried on
the next request.

**Fix:** Narrow the deletion path to revoked/expired classifications. For
transient failures, throw `INTERNAL_SERVER_ERROR` with `cause: { code: "REFRESH_TRANSIENT" }`
and leave the row intact.

**Prevent:** When wrapping any external auth provider, always classify
errors before any destructive local action. The default for unclassified
errors should be "preserve state, surface a 5xx, log".

## 2026-04-28 — Expose structured error codes via tRPC errorFormatter

**What happened:** Calendar frontend was branching on substring matches of
localized Portuguese error messages (`reconecte`, `expirada`, `revogado`)
to decide reconnect flow. Every copy edit silently broke recovery.

**Root cause:** Default tRPC error shape strips `error.cause`. Backend was
classifying errors with `GoogleApiError.code` but had no wire path to
deliver the code to the client.

**Fix:** Added `errorFormatter` in `apps/api/src/_core/trpc.ts` that reads
`error.cause.code` and exposes it on `error.data.appCode`. Every
`TRPCError` thrown from `handleGoogleApiError` and `ensureValidToken` now
sets `cause: { code }`.

**Prevent:** When introducing typed error codes server-side, also surface
them through the wire format. Substring matching on user-facing messages
is a bug factory.

---

## 2026-04-29 — `array.length > 0` is not a content guard

**What happened:** `image-generation.ts` checked
`(options.originalImages?.length ?? 0) > 0` before forcing edit-mode. Calling
code passed `[{ url: undefined }]` (length 1, no real content), so the guard
passed and a text-only request was sent to Gemini, producing a random face
instead of an edit of the patient photo.

**Fix:** Validate CONTENT per element, not just array length:

```ts
// ❌ WRONG — length 1 with empty fields passes
const has = (originalImages?.length ?? 0) > 0;

// ✅ CORRECT — at least one element has real payload
const has = originalImages?.some((img) => Boolean(img.b64Json || img.url)) ?? false;
```

**Prevent:** When an array element has all-optional fields, guards must
inspect the fields themselves. Length checks are only safe when every element
is guaranteed non-empty by construction.

---

## 2026-04-29 — `as string` on possibly-undefined defeats narrowing

**What happened:** `Boolean(latestUserMessage.imagemUrl)` was used to gate a
later `originalImages: [{ url: latestUserMessage.imagemUrl as string }]`. TS
does not propagate the `Boolean()` narrowing across the closure, so the cast
silently allowed `undefined` to flow through and bypass the layered NO_IMAGE
guard.

**Fix:** Capture the narrowed value into a const before use:

```ts
// ❌ WRONG — narrowing lost, undefined possible
const has = Boolean(msg.imagemUrl);
if (has) { use({ url: msg.imagemUrl as string }); }

// ✅ CORRECT — alias narrows for the rest of the scope
const imagemUrl = msg.imagemUrl;
if (!imagemUrl) return;
use({ url: imagemUrl });
```

**Prevent:** Stability rule I (no `as any`) extends to `as string` /
`as number` on values that the type system already says might be undefined.
If a cast is needed, it usually means narrowing was wrong upstream — fix the
narrowing, do not paper over it with a cast.

---

## 2026-04-29 — Reuse `_core` singletons; do not re-instantiate provider clients

**What happened:** `image-generation.ts` had a local `getClient()` that did
`new GoogleGenAI({ apiKey })` per call. Every image generation paid TLS +
handshake setup (~50–200ms) and prevented connection reuse.

**Fix:** Import the already-singleton helper from `_core/ai-provider.ts`:

```ts
// ❌ WRONG — new client per call
function getClient() { return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! }); }

// ✅ CORRECT — reuse the canonical singleton
import { getGeminiClient } from "./ai-provider";
const gemini = getGeminiClient();
```

**Prevent:** Before adding any provider/SDK client construction in
`apps/api/src/`, grep `_core/` for an existing helper. AI provider clients
in particular live exclusively in `apps/api/src/_core/ai-provider.ts`.

---

## 2026-04-29 — Use `createLogger`, never `console.*` in services

**What happened:** New service code used
`console.warn(JSON.stringify({...}))` for "structured" logs, requiring
`biome-ignore` suppressions and missing requestId/service correlation.

**Fix:** Import the structured logger:

```ts
// ❌ WRONG — biome-ignore, no correlation, ad-hoc JSON
console.warn(JSON.stringify({ event: "x", ... }));

// ✅ CORRECT — typed action, automatic correlation
import { createLogger } from "../_core/logger";
const logger = createLogger({ service: "patient-ai" });
logger.warn("image_generation.blocked", undefined, { reason: "NO_IMAGE" });
```

**Prevent:** Stability rule H mandates the project logger. The canonical
factory is `createLogger({ service })` from `apps/api/src/_core/logger.ts`.
Any new service file should declare a module-level `logger` immediately
after imports.

---

## 2026-04-29 — AI image provider is Gemini (Nano Banana Pro), not OpenAI

**What happened:** External context (a /design report) claimed the image
pipeline used OpenAI `gpt-image-2`. The actual stack is
`gemini-3-pro-image-preview` via `@google/genai`. Following the external
context would have produced unusable code.

**Fix:** Confirmed the truth from `apps/api/src/_core/ai-provider.ts`
(`IMAGE_MODEL`) and `apps/api/src/_core/image-generation.ts` (uses
`GoogleGenAI`). No OpenAI image SDK is configured.

**Prevent:** When a user pastes an external plan or report referring to
provider-specific APIs, verify against `_core/ai-provider.ts` BEFORE
designing or coding. The repo is Gemini-first for chat AND image; OpenAI is
only an optional orchestrator fallback for **text** (never image).

---

## Related References

- `.claude/docs/architecture/03-backend-components.md`
- `.claude/docs/architecture/06-data-architecture.md`
- `.claude/docs/architecture/09-integration-map.md`
- `.claude/docs/architecture/12-environment-variables.md`
- `.claude/docs/architecture/14-database-schema-overview.md`
- `apps/api/src/AGENTS.md`
- `apps/api/drizzle/AGENTS.md`
