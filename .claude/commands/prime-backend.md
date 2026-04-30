---
description: Load backend context with staged selective retrieval
workflow_type: augmented-llm
---

# /prime-backend — Backend Context Load

Prime backend context with **minimum necessary loading first**, then expand only if the task requires deeper detail.

## Goal

Prepare enough backend context for API/database/integration work **without** eagerly loading every backend reference file.

This command should optimize for:

- low context cost
- fast orientation
- correct domain routing
- on-demand deep loading only when justified

---

## Stage 0 — Base Context

1. Root `AGENTS.md` is already Tier 1 context
2. Read only the compact backend guardrails first:
   - `.claude/rules/backend.md`
   - `.claude/rules/database.md`
   - `.claude/rules/stability.md`
3. Run:
   - `git status --short`
   - `git log --oneline -5 -- apps/api/`
   - `git log --oneline -5 -- packages/`

Do **not** read subdirectory `AGENTS.md` files yet.
Do **not** read deep reference docs yet.

---

## Stage 1 — Classify the Task

Classify the user's backend task before loading anything else.

| Task Shape | Examples | Next Load |
|---|---|---|
| API/router work | tRPC procedure, auth guard, validation, response shape | Load `apps/api/src/AGENTS.md` |
| Schema/data work | Drizzle schema, relations, indexes, enum alignment | Load `apps/api/drizzle/AGENTS.md` |
| Service/integration work | WhatsApp, Meta, Stripe, Asaas, Kiwify, Google, webhooks | Load `.claude/rules/integrations.md` and relevant backend AGENTS if editing there |
| Runtime/env work | env vars, deployment config, provider credentials, runtime behavior | Load `.claude/docs/architecture/11-runtime-environment.md` |
| Data architecture review | table/domain ownership, impact analysis, schema orientation | Load `.claude/docs/architecture/12-database-schema-reference.md` |
| Historical backend bug pattern | tenant resolution, aggregation bug, date boundary, tool parity | Load `.claude/docs/architecture/13-backend-learnings.md` |
| Multi-domain backend task | API + schema + integration | Load only the exact combination required |

If the task is unclear, ask one short clarifying question or load only the smallest likely next file.

---

## Stage 2 — Targeted Deep Loading

Load **only** the files justified by Stage 1.

### A. API / Router / tRPC
Load:
- `apps/api/src/AGENTS.md`

Use when:
- adding or editing procedures
- changing auth scoping
- validating Zod input/output patterns
- adjusting service placement or error handling

### B. Database / Drizzle
Load:
- `apps/api/drizzle/AGENTS.md`

Add if needed:
- `.claude/docs/architecture/12-database-schema-reference.md`

Use when:
- adding columns
- changing enums
- designing relations
- checking FK/index requirements
- reviewing domain ownership

### C. Integrations / Services / Webhooks
Load:
- `.claude/rules/integrations.md`

Also load the relevant subdirectory authority only if editing there:
- `apps/api/src/AGENTS.md`
- `apps/api/src/services/AGENTS.md`
- `apps/api/src/webhooks/AGENTS.md`

Use when:
- touching external APIs
- changing webhook handlers
- modifying timeouts/retry/idempotency logic
- working with provider token lifecycle

### D. Runtime / Environment
Load:
- `.claude/docs/architecture/11-runtime-environment.md`

Use when:
- checking env variables
- validating provider credential needs
- reasoning about runtime behavior or deployment assumptions

### E. Historical Pitfalls / Debugging
Load:
- `.claude/docs/architecture/13-backend-learnings.md`

Use when:
- debugging non-obvious regressions
- modifying multi-tenant resolution
- changing cross-provider metrics aggregation
- fixing date or timezone logic
- checking API contract adaptation patterns

---

## Loading Rules

- **Never** load all backend references by default.
- **Never** load subdirectory `AGENTS.md` files unless the task actually touches that domain.
- Prefer:
  1. Tier 1 root context
  2. compact rules
  3. targeted domain AGENTS
  4. one focused Tier 3 reference
- If one file answers the question, stop loading more.
- If the task expands, continue in stages rather than restarting with a full preload.

---

## Decision Heuristics

### Load `apps/api/src/AGENTS.md` when:
- changing router code
- touching tRPC procedures
- changing auth or error handling
- editing backend files under `apps/api/src/`

### Load `apps/api/drizzle/AGENTS.md` when:
- changing schema
- reviewing FK/index requirements
- modifying enums or persistence contracts
- editing files under `apps/api/drizzle/`

### Load `11-runtime-environment.md` when:
- env/config is part of the question
- external provider setup matters
- runtime behavior depends on deployment/config variables

### Load `12-database-schema-reference.md` when:
- you need schema orientation, not full implementation detail
- planning a schema change
- mapping impacted domains before editing

### Load `13-backend-learnings.md` when:
- the bug resembles a previously fixed production issue
- the task involves subtle architecture/history-sensitive behavior

---

## Output

Summarize in under 120 words.

Output format:

```text
Backend primed | Branch: {branch}
Task class: {api|schema|integration|runtime|debug|hybrid}
Loaded: {exact files loaded}
Recent backend changes: {summary}
Key constraints: {top 3 relevant rules}
Next deep load: {file or "none"}
Ready for: {task description or "awaiting task"}
```

---

## Stop Conditions

- Stop after Stage 0 if the task has not been provided yet.
- Stop after the minimum sufficient Stage 2 load.
- If the task becomes schema-changing, auth-changing, payment-related, or destructive, flag that explicitly before implementation.
- If more than 4 files seem necessary, reassess whether the task classification is too broad.

---

## Intent

This command is a **selective backend loader**, not a full dump.
Its job is to help the agent become accurate quickly while preserving context budget for implementation.
