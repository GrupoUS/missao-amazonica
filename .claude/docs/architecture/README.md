# NeonDash Architecture — Intelligent Loading Index

> Tier 3 architecture reference hub for NeonDash.
> Use this directory for **on-demand deep context**, not default preload.

This folder contains the architecture documentation for NeonDash — a fullstack mentorship performance dashboard built with React 19, Hono, tRPC, Drizzle ORM, Bun, and Neon PostgreSQL.

Its role is to support **selective context engineering**:

- **Rules** stay short and operational
- **Commands** decide what to load
- **Architecture docs** hold deep system context
- **Subdirectory `AGENTS.md` files** remain canonical when editing in-domain code

---

## Why This Folder Exists

Architecture docs should answer questions like:

- How is the system structured?
- Which backend/runtime concerns matter here?
- Which integration boundary is relevant?
- Which persistence domain owns this change?
- What historical backend pitfalls should be loaded before editing?

This folder should **not** be auto-loaded wholesale.

---

## Loading Strategy

### Start Here When
Use this `README.md` first when the task is:

- multi-domain
- architecture-heavy
- backend-heavy but still ambiguous
- integration-heavy
- planning-oriented
- impact-analysis-oriented

### Do Not Start Here When
Skip this folder initially if the task is clearly:

- frontend-only styling/UI work
- simple component tweaks
- trivial route/page edits
- isolated schema edits with known target table
- L1-L2 known-pattern fixes

In those cases, start with the relevant compact rule or subsystem prime command instead.

---

## Recommended Load Order

Use this progression to avoid bloated context:

1. root `AGENTS.md`
2. relevant compact rule(s) in `.claude/rules/`
3. this `README.md` if architecture routing is needed
4. one or two exact architecture docs from this folder
5. subdirectory `AGENTS.md` only when implementation/editing enters that domain

### Anti-Bloat Rule
Do **not** load every file in `architecture/` just because the task touches backend work.

Load only the smallest set that answers the current question.

---

## Quick Routing Map

| If the task is about... | Load first | Then load if needed |
|---|---|---|
| overall system shape | `01-system-context.md` | `02-container-architecture.md` |
| internal app boundaries and protocols | `02-container-architecture.md` | `03-backend-components.md`, `04-frontend-components.md` |
| Hono, tRPC, router/service structure | `03-backend-components.md` | `11-runtime-environment.md`, `13-backend-learnings.md` |
| React app shell in architecture terms | `04-frontend-components.md` | design references under `.claude/docs/design-specs/` |
| AI runtime, agents, memory, pub/sub | `05-ai-gateway.md` | ADRs + package/domain authority |
| data domains, schema placement, DB boundaries | `06-data-architecture.md` | `12-database-schema-reference.md` |
| auth, RBAC, webhooks, trust boundaries | `07-security-architecture.md` | `01-system-context.md`, `11-runtime-environment.md` |
| deployment, VPS, Docker, health checks | `08-deployment.md` | `11-runtime-environment.md` |
| provider topology and integrations | `09-integration-map.md` | `11-runtime-environment.md`, `13-backend-learnings.md` |
| logging, testing, quality, observability | `10-quality-attributes.md` | relevant domain docs |
| env vars, runtime behavior, backend ops | `11-runtime-environment.md` | `03-backend-components.md`, `09-integration-map.md` |
| table/domain orientation | `12-database-schema-reference.md` | `06-data-architecture.md` |
| historical backend bug families | `13-backend-learnings.md` | `03-backend-components.md`, `11-runtime-environment.md` |
| architectural decisions and rationale | `adr/README.md` | specific ADR file |

---

## Document Index

### Core Architecture Set

| # | Document | Use When |
|---|---|---|
| 01 | `01-system-context.md` | You need users, external systems, trust boundaries, and ecosystem context |
| 02 | `02-container-architecture.md` | You need containers, protocols, deployment relationships, and internal boundaries |
| 03 | `03-backend-components.md` | You need backend structure, request flow, router/service/middleware understanding |
| 04 | `04-frontend-components.md` | You need architecture-level frontend structure rather than visual design detail |
| 05 | `05-ai-gateway.md` | You need AI gateway runtime, agent architecture, memory, and orchestration context |
| 06 | `06-data-architecture.md` | You need database architecture, domain modeling, and migration/persistence boundaries |
| 07 | `07-security-architecture.md` | You need auth, RBAC, CORS, webhook verification, and trust/security boundaries |
| 08 | `08-deployment.md` | You need deployment architecture, VPS, containers, health checks, and runtime topology |
| 09 | `09-integration-map.md` | You need provider topology, third-party integration surfaces, and external system mapping |
| 10 | `10-quality-attributes.md` | You need performance, reliability, observability, testing, and maintainability lenses |

### Consolidated Reference Layer

| # | Document | Role |
|---|---|---|
| 11 | `11-runtime-environment.md` | Consolidated runtime/env/backend operational reference |
| 12 | `12-database-schema-reference.md` | Compact schema/domain/table orientation reference |
| 13 | `13-backend-learnings.md` | Historical backend bug patterns and high-value implementation pitfalls |

### Decision Records

| Path | Role |
|---|---|
| `adr/README.md` | Entry point to architecture decision records |
| `adr/*.md` | Specific irreversible or important architectural decisions |

---

## Task-Oriented Loading Recipes

### 1. Backend Bug With Unclear Root Cause
Load:
- `03-backend-components.md`
- `11-runtime-environment.md`
- `13-backend-learnings.md`

Why:
- structure
- runtime assumptions
- historical pitfalls

### 2. Schema Change Planning
Load:
- `06-data-architecture.md`
- `12-database-schema-reference.md`

Then:
- domain `AGENTS.md` only if implementation begins

### 3. Integration/Webhook Investigation
Load:
- `09-integration-map.md`
- `11-runtime-environment.md`

Add:
- `13-backend-learnings.md` if bug resembles prior edge cases

### 4. Security/Auth Review
Load:
- `01-system-context.md`
- `07-security-architecture.md`

Add:
- `11-runtime-environment.md` if env/config or secret handling matters

### 5. Deployment/Infra Debugging
Load:
- `08-deployment.md`
- `11-runtime-environment.md`

### 6. Architecture Planning / Multi-Domain Work
Load:
- this `README.md`
- `01-system-context.md`
- `02-container-architecture.md`

Then branch into only the domains the plan actually touches.

---

## Relationship to Other Context Layers

### `.claude/rules/*.md`
Use rules for:
- immediate guardrails
- safe defaults
- compact routing

Use architecture docs for:
- deep explanation
- system structure
- impact analysis
- historical/backend reference depth

### `.claude/docs/design-specs/`
Use design-spec docs for:
- UI architecture
- layout systems
- visual language
- feature design details
- frontend historical patterns

Use architecture docs for:
- backend/system/deployment/security/data/integration concerns

### Subdirectory `AGENTS.md`
When editing files in:
- `apps/api/src/**`
- `apps/api/drizzle/**`
- `apps/api/src/services/**`
- package-specific domains

those local `AGENTS.md` files override this folder as canonical implementation authority.

---

## Reading Heuristics

Before loading another architecture file, ask:

1. What exact question am I trying to answer?
2. Which single file is most likely to answer it?
3. Am I loading structural context or implementation authority?
4. Can I stop after one file instead of reading three?

If the answer is “one file is enough,” stop there.

---

## What Changed in This Folder

This folder now also absorbs former root-level deep references that used to live directly under `.claude/docs/`:

- runtime/environment context
- schema reference context
- backend learnings

That consolidation makes backend/architecture loading more predictable and keeps Tier 3 docs grouped by domain.

---

## Maintenance Rules

When updating this folder:

- prefer extending an existing file over creating a new one
- keep filenames durable and domain-specific
- avoid duplicate guidance already present in rules or commands
- keep this `README.md` focused on routing, not implementation detail
- add new files only if they improve selective loading
- update this index whenever a new architecture doc is added, moved, merged, or removed

---

## Summary

Use this directory as a **smart architecture retrieval layer**:

- start narrow
- load intentionally
- prefer one precise doc over many broad docs
- keep rules compact
- keep implementation authority in domain `AGENTS.md`
- keep architecture docs as the deep, selective reference layer

If the task is ambiguous, read this file first.
If the task is clear, skip directly to the exact architecture doc you need.
