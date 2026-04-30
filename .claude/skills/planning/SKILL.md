---
name: planning
description: Use when /plan is executed, when tasks span multiple architectural layers (schema/API/UI), when third-party integrations need design before code, when a new feature spans multiple files, when "how should we build X?" requires an answer, when implementation order is unclear, or when architecture trade-offs need evaluation. Skip for single-file bug fixes with known root cause.
---

# Planning Skill

## Purpose

Produce **implementation-ready plans** before any code is written. Plans are grounded in the project's layer stack and existing repo conventions.

> Project-specific layer map and verification commands are loaded from `${overlay}/layer-map.md` (path resolved from `.claude/config.json::overlay`). If the overlay file is missing, the skill uses the generic layer template below.

---

## Hard Rule

Do not write code until the plan is presented and the user approves. This applies regardless of complexity. State assumptions explicitly — never guess silently.

---

## Step 1 — Classify

Classification determines depth.

| Class | Indicators | Examples |
|---|---|---|
| **Simple** (L1-L3) | Single layer, known pattern | Add a column, fix a schema, add a route file |
| **Medium** (L4-L5) | 2-3 layers, new domain behavior | New API handler + query hook + UI section |
| **Complex** (L6+) | Architecture, integration, new service | New external integration, auth model change, multi-tenant feature |

---

## Step 2 — Layer Map

Every plan identifies which layers are touched, in dependency order. Use the project-specific layer map from `${overlay}/layer-map.md` if present; otherwise use this generic template:

```
DB Schema → Migration → API Handler/Procedure → Router/Routes Registration
  → Client Query/Hook → UI Component → Page/Route File
```

Plan phases follow this order. Never plan UI before the API is designed.

**Auth layer** — identify the required auth scope before any other step. Project-specific procedure levels (e.g., `publicProcedure`, `protectedProcedure`, `adminProcedure`) live in the overlay's layer map. Generic guidance:

| Scope | When |
|---|---|
| Public (anon) | Health checks, public reads |
| Authenticated | User-bound actions |
| Admin / role-elevated | Privileged ops, settings, dashboards |
| Tenant-scoped | Multi-tenant data — must filter by tenant ID |

---

## Step 3 — Research (Medium and Complex)

**Codebase first, web second.**

Before planning any new pattern, grep for what already exists:
- Existing handler/router for the domain — extension viable? (LEVER principle)
- Existing schemas — reuse `.extend()` / `.pick()` / `.omit()`
- Existing query hooks — naming convention (`useXxxQuery`, `useXxxMutation`, etc.)
- Existing tables — does a new column solve it vs. a new table?

**Research cascade** (stop when confidence ≥ 4):

| Source | Confidence |
|---|---|
| Codebase (Grep / Glob / Read) | 5 |
| Official docs (Context7) | 4-5 |
| Community patterns (Tavily) | 3-4 |

Mark inferred constraints without direct evidence as `[ASSUMED]`. Mark any finding without a source as `[UNVERIFIED]`. Findings ≤ 2 confidence must be flagged — do not plan on them.

---

## Simple Plan Output (L1-L3)

```markdown
**Task:** [one line]
**Layer:** [which layer]
**File:** `path/to/file`
**Steps:**
1. [atomic action — exact what, not vague how]
2. [atomic action]
**Verify:** `${tooling.packageManager} run ${tooling.typeChecker}` → no errors
```

No discovery, no research cascade, no contracts.

---

## Medium Plan Output (L4-L5)

```markdown
## Plan: [Feature Name]

**Complexity:** L[N]
**Layers:** [e.g., Schema → API → UI]
**Assumptions:** [ASSUMED: auth level is authenticated]

### Phase 1: Schema [SEQUENTIAL]
- [ ] `${paths.schemaRoot}/...` — add column `[name]` to `[table]` — verify: schema migration command per overlay

### Phase 2: API [SEQUENTIAL]
- [ ] `${paths.backendRoot}/[domain]` — add handler `[name]` with input validator `[schema]`
- [ ] Register in router/index if new domain

### Phase 3: UI [PARALLEL if multiple components]
- [ ] `${paths.frontendRoot}/hooks/use[Domain]` — add query/mutation hook
- [ ] `${paths.frontendRoot}/pages/[Page]` — wire hook, render result

**Verify:** type-check + lint commands from `_shared.md` § 1

**Risks:** [non-obvious risks with mitigations]
```

---

## Complex Plan Output (L6+)

Full D.R.P.I.V protocol:

```
DISCOVER → RESEARCH → PLAN → SPRINT CONTRACTS → EVALUATOR GATE
```

**Discovery:** one question at a time. Present 2-3 approaches with trade-offs. Lead with recommendation. Write design doc to `docs/plans/YYYY-MM-DD-<topic>.md` before proceeding.

**Research:** full cascade. Findings with confidence scores. Minimum 5 edge cases for L4+.

**Sprint contracts (mandatory L6+):**

```markdown
**Sprint N — [Name]**
Scope: [what gets built in this sprint]
Done when:
  - [ ] [testable criterion — verifiable by command or Playwright]
  - [ ] [edge case handled: what happens on error / empty / unauthorized]
Out of scope: [explicit deferrals — prevents scope creep]
```

Full contract format with Playwright test plan → `references/04-harness-patterns.md`.

**Evaluator gate (mandatory L6+):** spawn `evaluator` agent with the plan.

| Dimension | Threshold | Checks |
|---|---|---|
| Completeness | ≥ 8 | Every requirement has a corresponding task |
| Atomicity | ≥ 7 | Each step is 2-5 min of work |
| Risk coverage | ≥ 7 | Top risks identified with mitigations |
| Dependency order | ≥ 8 | Tasks execute without backtracking |

Below any threshold → evaluator returns specific failures (not vague feedback) → revise. Max 3 revision iterations before escalating to user.

Evaluator calibration → `references/04-harness-patterns.md`.

---

## Self-Review Checklist (every plan before presenting)

- [ ] Affected layers identified and ordered correctly (data → API → UI)
- [ ] Auth/permission level chosen for each new endpoint
- [ ] DB tables/columns: FK indexes specified per `.claude/rules/database.md` (or project equivalent)
- [ ] Validation schemas placed at module level (not inside handlers)
- [ ] New routers/handlers registered in entry index
- [ ] Verify command specified for each phase
- [ ] No hardcoded hex colors in UI tasks (semantic tokens only — see `.claude/rules/DESIGN.md` if applicable)
- [ ] All assumptions labeled `[ASSUMED]`

---

## Anti-Patterns

| Bad | Good |
|---|---|
| "Implement auth" as a step | `${paths.frontendRoot}/features/auth/schema.ts` — define LoginSchema with `.email()`, `.min(8)` |
| "Add validation" | Exact validation fields with `.max()` on all user inputs |
| Research skipped for Medium+ | Grep existing patterns before planning |
| UI planned before API | Layer order: data → API → UI — always |
| Assumption not labeled | Mark every inferred constraint `[ASSUMED]` |
| Full contracts for L3-L5 | Mini-contract or verify command is sufficient |
| Planner specifies HOW | Planner names files + effects; generator defines implementation |
| 5 questions at once | One question at a time |

---

## Red Flags — Stop

| Red flag | Action |
|---|---|
| Coding before plan approved | Stop. Present plan first. |
| Plan has "TBD" | Research the unknown before presenting. |
| Finding with confidence ≤ 2 | Find better sources or label `[UNVERIFIED]`. |
| L6+ sprint without contract | Write contract before any sprint begins. |
| L6+ plan without evaluator gate | Spawn evaluator — self-review is not enough at this complexity. |
| Assumption silently baked in | Label it `[ASSUMED]`. |

---

## Configuration

This skill reads `.claude/config.json` for:
- `${paths.*}` — file path scaffolding in generated plans
- `${tooling.*}` — verify commands
- `${overlay}` — project-specific layer map at `${overlay}/layer-map.md` (optional)

To use in a different project: copy `.claude/skills/planning/`, optionally write `${overlay}/layer-map.md` documenting the project's layers + verify commands.

---

## References

- `references/01-discover.md` — Discovery protocol for complex tasks
- `references/02-plan.md` — Full plan template with sprint sections
- `references/03-risk.md` — Risk assessment patterns
- `references/04-harness-patterns.md` — Sprint contracts, evaluator calibration, GAN harness, context management
- `references/optional-tools.md` — Optional tooling (web crawling for research, etc.)
- `${overlay}/layer-map.md` — **Project-specific** layer stack (loaded if overlay configured)
