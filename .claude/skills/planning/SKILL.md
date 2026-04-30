---
name: planning
description: Use when /plan is executed, when tasks touch multiple NeonDash layers (schema/API/UI), when third-party integrations need design before code, when a new feature spans multiple files, when "how should we build X?" requires an answer, when implementation order is unclear, or when architecture trade-offs need evaluation. Skip for single-file bug fixes with known root cause.
---

# Planning Skill — NeonDash

## Purpose

Produce implementation-ready plans before any code is written.
Plans are grounded in the NeonDash layer stack and existing repo conventions.

---

## Hard Rule

Do not write code until the plan is presented and the user approves.
This applies regardless of complexity. State assumptions explicitly — never guess silently.

---

## Step 1: Classify

Classify before planning. Classification determines depth.

| Class | Indicators | NeonDash Examples |
|-------|-----------|-------------------|
| **Simple** (L1-L3) | Single layer, known pattern | Add a column, fix a Zod schema, add a route file |
| **Medium** (L4-L5) | 2-3 layers, new domain behavior | New tRPC procedure + query hook + UI section |
| **Complex** (L6+) | Architecture, integration, new service | New integration (Meta, Asaas), auth change, multi-tenant feature |

---

## Step 2: Layer Map

Every plan identifies which layers are touched, in this order:

```
Drizzle Schema → DB Migration (db:push) → tRPC Procedure → Hono Router Registration
  → TanStack Query Hook → React Component → Route File
```

Plan phases follow this order. Never plan UI before the API is designed.

Auth layer — identify the required procedure level before any other step:

```
publicProcedure    → health checks only
protectedProcedure → Clerk auth required
adminProcedure     → admin role required
mentoradoProcedure → mentorado lookup required
```

---

## Step 3: Research (Medium and Complex)

**Codebase first, web second.**

Before planning any new pattern, grep for what already exists:

- Existing router for the domain → check if extension is viable (LEVER)
- Existing Zod schemas → reuse `.extend()` / `.pick()` / `.omit()`
- Existing query hooks → check naming convention (`useXxxQuery`, `useXxxMutation`)
- Existing DB tables → check if a new column solves it vs a new table

Research cascade (stop when confidence ≥ 4):

| Source | Confidence |
|--------|-----------|
| Codebase (Grep / Glob / Read) | 5 |
| Official docs (Context7 / Tavily) | 4-5 |
| Community patterns (Tavily) | 3-4 |

Mark inferred constraints without direct evidence as `[ASSUMED]`.
Mark any finding without a source as `[UNVERIFIED]`.
Findings ≤ 2 confidence must be flagged — do not plan on them.

---

## Simple Plan Output (L1-L3)

```markdown
**Task:** [one line]
**Layer:** [which layer]
**File:** `apps/...`
**Steps:**
1. [atomic action — exact what, not vague how]
2. [atomic action]
**Verify:** `bun run type-check` → no errors
```

No discovery, no research cascade, no contracts needed.

---

## Medium Plan Output (L4-L5)

```markdown
## Plan: [Feature Name]

**Complexity:** L[N]
**Layers:** [e.g., Schema → tRPC → UI]
**Assumptions:** [ASSUMED: auth level is protectedProcedure]

### Phase 1: Schema [SEQUENTIAL]
- [ ] `apps/api/drizzle/schema.ts` — add column `[name]` to `[table]` — verify: `bun run db:push`

### Phase 2: API [SEQUENTIAL]
- [ ] `apps/api/src/routers/[domain].ts` — add procedure `[name]` with Zod input `[schema]`
- [ ] `apps/api/src/_core/index.ts` — register if new domain

### Phase 3: UI [PARALLEL if multiple components]
- [ ] `apps/web/src/hooks/use[Domain].ts` — add query/mutation hook
- [ ] `apps/web/src/pages/[Page].tsx` — wire hook, render result

**Verify:** `bun run type-check && bunx biome check`

**Risks:** [non-obvious risks with mitigations, if any]
```

---

## Complex Plan Output (L6+)

Full D.R.P.I.V protocol:

```
DISCOVER → RESEARCH → PLAN → SPRINT CONTRACTS → EVALUATOR GATE
```

**Discovery:** One question at a time. Present 2-3 approaches with trade-offs. Lead with recommendation.
Write design doc to `docs/plans/YYYY-MM-DD-<topic>.md` before proceeding.

**Research:** Full cascade per section above. List findings with confidence scores.
Minimum 5 edge cases identified for L4+.

**Sprint Contracts (mandatory for L6+):**

```markdown
**Sprint N — [Name]**
Scope: [what gets built in this sprint]
Done when:
  - [ ] [testable criterion — verifiable by command or Playwright]
  - [ ] [edge case handled: what happens on error/empty/unauthorized]
Out of scope: [explicit deferrals — prevents scope creep]
```

Full contract format with Playwright test plan → `references/04-harness-patterns.md`

**Evaluator Gate (mandatory for L6+):** Spawn separate `evaluator` agent with the plan.

| Dimension | Threshold | What it checks |
|-----------|-----------|----------------|
| Completeness | ≥ 8 | Every requirement has a corresponding task |
| Atomicity | ≥ 7 | Each step is 2-5 min of work |
| Risk Coverage | ≥ 7 | Top risks identified with mitigations |
| Dependency Order | ≥ 8 | Tasks execute in sequence without backtracking |

Below any threshold → evaluator returns specific failures (not vague feedback) → revise plan.
Max 3 revision iterations before escalating to user.

Evaluator calibration (few-shot skeptical examples) → `references/04-harness-patterns.md`

---

## Self-Review Checklist (every plan before presenting)

- [ ] Affected layers identified and ordered correctly (schema before API before UI)
- [ ] New tRPC procedures use the correct `*Procedure` level
- [ ] New DB tables/columns: FK indexes specified
- [ ] Zod schemas placed at module level (not inside handlers)
- [ ] New routers registered in `apps/api/src/_core/index.ts`
- [ ] Verify command specified for each phase
- [ ] No hardcoded hex colors in UI tasks (semantic tokens only)
- [ ] All assumptions labeled `[ASSUMED]`

---

## Anti-Patterns

| Bad | Good |
|-----|------|
| "Implement auth" as a step | `apps/web/src/features/auth/schema.ts` — define Zod LoginSchema with `.email()`, `.min(8)` |
| "Add validation" | Exact Zod fields with `.max()` on all user inputs |
| Research skipped for Medium+ | Grep existing routers/schemas before planning |
| UI planned before API | Layer order: schema → API → UI — always |
| Assumption not labeled | Mark every inferred constraint `[ASSUMED]` |
| Full contracts for L3-L5 | Mini-contract or verify command is sufficient |
| Planner specifies HOW | Planner names files and effects; generator defines implementation |
| 5 questions at once | One question at a time |

---

## Red Flags — Stop

| Red Flag | Action |
|----------|--------|
| Coding before plan approved | Stop. Present plan first. |
| Plan has "TBD" | Research the unknown before presenting. |
| Finding with confidence ≤ 2 | Find better sources or label `[UNVERIFIED]`. |
| L6+ sprint without contract | Write contract before any sprint begins. |
| L6+ plan without evaluator gate | Spawn evaluator — self-review is not enough at this complexity. |
| Assumption silently baked in | Label it `[ASSUMED]` so the implementing agent can validate. |

---

## References

- `references/01-discover.md` — Discovery protocol for complex tasks
- `references/02-plan.md` — Full plan template with sprint sections
- `references/04-harness-patterns.md` — Sprint contracts, evaluator calibration, GAN harness, context management (Sonnet vs Opus)
