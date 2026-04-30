# 11 — Runtime Environment & Operational Reference

> Tier 3 architecture reference for runtime configuration, environment variables, data dependencies, and backend learnings.
> This document consolidates the former root reference docs into the architecture set so backend and infrastructure context can be loaded on demand instead of eagerly.

## Purpose

This reference exists to support architecture, backend, integration, and operations tasks that need:

- runtime and deployment configuration awareness
- environment variable inventory
- database domain overview
- backend bug-fix learnings and stability patterns
- selective context loading with lower token cost

Use this document as an **index plus high-signal summary**. For implementation, always verify against the source code in `apps/api/`, `packages/`, and runtime config files.

---

## 1. Runtime Profile

| Area | Current Standard |
|------|------------------|
| Runtime | **Bun** |
| Package manager | **Bun only** |
| Frontend | React 19 + Vite 7 |
| Backend | Hono + tRPC 11 |
| ORM | Drizzle ORM |
| Database | Neon PostgreSQL |
| Auth | Clerk |
| AI | Google Gemini via `@google/genai` + Vercel AI SDK |
| Email | Resend |
| Payments | Stripe + ASAAS + Kiwify/Hubla integrations |
| Type checking | `tsgo` via `bun run type-check` |
| Formatting/linting | Biome + OXLint |
| Tests | Vitest |
| Default QA target | `https://staging.neondash.com.br` |

### Non-Negotiable Runtime Rules

- Always use `bun`, never `npm`, `yarn`, or `pnpm`.
- Never use `tsc --noEmit`; use `bun run type-check`.
- Shell automation is forbidden in-project; scripts must be Python 3.
- Every change must be followed by validation.

---

## 2. Environment Variable Reference

The table below consolidates the current known environment variables referenced by the project guidance.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection |
| `CLERK_SECRET_KEY` | Yes | Clerk backend authentication |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend authentication |
| `STRIPE_SECRET_KEY` | Yes | Stripe server API |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signature verification |
| `GEMINI_API_KEY` | Yes | Google Gemini access |
| `RESEND_API_KEY` | No | Email sending via Resend |
| `RESEND_FROM_EMAIL` | No | Sender address |
| `GOOGLE_CLIENT_ID` | No | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth |
| `GOOGLE_REDIRECT_URI` | No | Google OAuth callback |
| `INSTAGRAM_APP_ID` | No | Instagram Business integration |
| `INSTAGRAM_APP_SECRET` | No | Instagram Business integration |
| `INSTAGRAM_REDIRECT_URI` | No | Instagram callback |
| `META_APP_ID` | No | Meta platform apps |
| `META_APP_SECRET` | No | Meta platform apps |
| `META_WEBHOOK_VERIFY_TOKEN` | No | Webhook verification for Meta |
| `META_SYSTEM_USER_ACCESS_TOKEN` | No | WhatsApp Cloud API access |
| `BAILEYS_SESSION_DIR` | No | Baileys local session storage path |
| `NODE_ENV` | No | Runtime environment flag |

### Environment Architecture Rules

- Never read secrets ad hoc across the codebase when an env/config module exists.
- Never default production-required values to localhost.
- Fail fast in production if a required variable is absent.
- Separate sandbox and production credentials for payment/fiscal providers.
- Treat token expiry as part of runtime state, not just static configuration.

### Operational Implications

#### Auth and Identity
- Clerk is the identity provider.
- Frontend publishable key and backend secret key are both required for normal auth flows.
- Organization and role resolution influence tenant scoping.

#### Data Access
- `DATABASE_URL` is the primary serverless Postgres entrypoint.
- Data isolation revolves around mentorado/org resolution and specialized contexts.

#### AI Runtime
- Gemini access is runtime-bound to `GEMINI_API_KEY`.
- AI features should degrade explicitly when credentials are unavailable.

#### External Integrations
- Meta, Google, Resend, Stripe, ASAAS, Kiwify, Hubla, and Nuvem Fiscal each require isolated credential handling.
- Webhook verification and timeout behavior are architectural concerns, not implementation details.

---

## 3. Database Domain Overview

This section brings the former schema summary into the architecture set for selective backend loading.

### Core Tables

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `users` | Clerk-backed auth + billing | Stripe fields, role enum |
| `mentorados` | Extended mentee profiles | `users`, integrations |
| `metricas_mensais` | Monthly performance data | `mentorados` |
| `feedbacks` | Mentor feedback per month | `mentorados` |
| `badges` | Achievement definitions | categoria enum |
| `mentorado_badges` | Earned badge tracking | `mentorados`, `badges` |
| `ranking_mensal` | Monthly rankings | `mentorados` |

### CRM Tables

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `leads` | CRM lead management | `mentorados`, status enum |
| `interacoes` | Lead interaction log | `leads`, `mentorados` |
| `crm_column_config` | Custom Kanban columns | `mentorados` |
| `tasks` | Mentorado task checklists | `mentorados` |

### Patient Management Tables

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `pacientes` | Patient records | `mentorados` |
| `pacientes_info_medica` | Medical information | `pacientes` |
| `pacientes_procedimentos` | Treatment records | `pacientes` |
| `pacientes_fotos` | Photo gallery | `pacientes` |
| `pacientes_documentos` | Document management | `pacientes` |
| `pacientes_chat_ia` | AI chat per patient | `pacientes` |
| `planos_tratamento` | Treatment plans | `pacientes` |
| `pacientes_consentimentos` | Consent tracking | `pacientes` |

### Financial Tables

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `categorias_financeiras` | Expense/income categories | `mentorados` |
| `formas_pagamento` | Payment methods | `mentorados` |
| `transacoes` | Financial transactions | `mentorados` |
| `insumos` | Supplies/materials | `mentorados` |
| `procedimentos` | Service catalog | `mentorados` |

### Integration Tables

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `whatsapp_messages` | WhatsApp message history | `mentorados` |
| `whatsapp_contacts` | WhatsApp contacts | `mentorados` |
| `instagram_tokens` | Instagram OAuth tokens | `mentorados` |
| `instagram_sync_log` | Sync audit trail | `mentorados` |
| `facebook_ads_*` | Facebook Ads data | `mentorados` |
| `google_tokens` | Google Calendar OAuth | `users` |

### Database Architecture Rules

- `apps/api/drizzle/schema.ts` remains the source of truth.
- Prefer extending existing tables before creating new ones when the LEVER score supports it.
- Every foreign key requires a matching index.
- Use soft deletes where the domain convention requires `ativo`.
- Export both runtime table objects and associated TypeScript types consistently.
- Use `bun run db:push` for development schema propagation.

---

## 4. Backend Learnings Archive

This section consolidates high-value backend learnings so they can be loaded only for relevant backend work.

## 4.1 Multi-tenant Resolution Priority

### Problem Pattern
Users with both personal and org-linked records could resolve to the wrong tenant if owner lookup runs before team membership lookup.

### Correct Priority
1. Team membership by user ID
2. Team membership by email
3. Owner lookup
4. Admin/mentor bypass
5. Legacy auto-link
6. `clinica_staff` guard
7. Auto-create fallback

### Architectural Rule
**Team membership resolution must win before owner lookup** to avoid routing invited users into empty personal workspaces.

---

## 4.2 Metrics Aggregation Rules

### Rule: Never Aggregate Ratios
When combining cross-platform metrics, aggregate raw values first, then recompute derived metrics.

Use:
- spend totals
- conversion totals
- value totals

Do not combine:
- CPL from platform A with conversions from A+B
- CPC/ROAS/conversion ratios from independent sources without recomputation

### Architectural Impact
Reporting pipelines must preserve raw metrics through the service layer.

---

## 4.3 Bulk Import Schema Alignment

### Rules
- Input Zod enums must match DB enums exactly.
- Numeric DB fields must receive numbers, not coerced strings.
- `mentoradoProcedure` should derive tenant identity from auth context, not redundant input.

### Architectural Impact
Schema drift between validation and persistence creates type errors and silent data defects.

---

## 4.4 Date and Timezone Safety

### Rules
- Use exclusive upper bounds for date ranges where appropriate.
- Treat ISO date-only strings carefully; `getUTCDate()` avoids timezone off-by-one behavior.
- Avoid unsafe permissive schemas like `z.any()` when `z.unknown()` is sufficient.

### Architectural Impact
Financial and reporting systems are highly sensitive to subtle boundary bugs.

---

## 4.5 Error Boundary Between Internal and Client Errors

### Rule
Never rethrow raw internal exceptions directly to the client in procedure handlers.

Prefer:
- structured `TRPCError`
- clear user-facing messages
- internal logging with enough context for debugging

### Architectural Impact
This preserves observability without leaking sensitive internal details.

---

## 4.6 AI Gateway Documentation Parity

### Rule
Tool declarations in gateway docs must mirror actual implemented tools.

### Architectural Impact
Agent/tool mismatch creates runtime confusion, invalid prompts, and broken downstream orchestration.

---

## 4.7 Paginated API Format Consistency

### Rule
If backend returns paginated structures, frontend unwrapping should happen explicitly in the query layer when a flat array is required.

### Architectural Impact
Do not change backend response shapes casually to fit one consumer if the paginated contract is already correct.

---

## 5. Stability and Operational Cross-Checks

These rules are especially relevant when using this reference for backend or infra tasks:

- No non-null assertions on optional data.
- Guard empty `.returning()` and `.select()` arrays before access.
- Use the correct procedure type for auth scope.
- Ensure production error handlers exist at the server entrypoint.
- Never use wildcard CORS in production.
- No `console.log` in production server code.
- Avoid `as any`; prefer proper types or narrow assertions.
- Every external API call must use a timeout.
- Webhook handlers should acknowledge quickly and process safely.

---

## 6. Suggested On-Demand Loading Strategy

Use this document selectively:

| Task Type | Read This Doc? | Also Read |
|----------|-----------------|-----------|
| Backend bug fix | Yes | `apps/api/src/AGENTS.md` |
| Schema review | Yes | `apps/api/drizzle/AGENTS.md`, schema source |
| Integration runtime issue | Yes | relevant service rules/docs |
| Frontend-only styling task | No | design references instead |
| Planning multi-domain work | Yes | architecture overview + relevant commands/rules |

This document is intended to replace eager loading of multiple root reference docs when a single consolidated architecture reference is enough.

---

## 7. Source Mapping

This architecture reference incorporates and supersedes the following former Tier 3 root docs:

- `.claude/docs/environment-variables.md`
- `.claude/docs/database-schema.md`
- `.claude/docs/backend-learnings.md`

After migration, those concerns should be referenced through the architecture tree to keep Tier 3 context organized and selectively loadable.

---

## 8. Verification Checklist for Future Updates

When updating this file:

- confirm variable names still match the env config and deployment setup
- confirm schema summaries still reflect `apps/api/drizzle/schema.ts`
- confirm backend learning notes still match resolved production bugs
- update command/rule references if the loading strategy changes
- keep this file concise enough to be selectively loaded without bloating context

---

## Related Architecture Docs

- `README.md`
- `01-system-context.md`
- `02-container-architecture.md`
- `03-backend-components.md`
- `06-data-architecture.md`
- `07-security-architecture.md`
- `09-integration-map.md`
- `10-quality-attributes.md`

## Related Domain Authority

- `apps/api/src/AGENTS.md`
- `apps/api/drizzle/AGENTS.md`
- `.claude/rules/backend.md`
- `.claude/rules/database.md`
- `.claude/rules/integrations.md`
- `.claude/rules/stability.md`
