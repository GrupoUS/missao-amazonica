---
description: Prime project context selectively for cross-domain work
workflow_type: augmented-llm
---

# /prime — Intelligent Cross-Domain Context Prime

Load only the minimum project context required for the current task.

## Goal

This command is for **multi-domain** tasks that may touch more than one subsystem, but it must still avoid expensive “load everything” behavior.

Use `/prime` to identify the task shape, load the right compact rules first, then load deeper references **only when justified**.

---

## Instructions

1. Read the root `AGENTS.md` (Tier 1, already loaded at session start).
2. Run:
   - `git status`
   - `git log --oneline -10`
3. Classify the task intent before loading more context:

| Intent | Load Immediately | Load Only If Needed |
|--------|------------------|---------------------|
| Frontend-heavy | `.claude/rules/frontend.md`, `.claude/rules/stability.md` | `.claude/docs/design-specs/00-design-system-foundation.md`, `.claude/docs/design-specs/00-frontend-learnings.md`, specific feature spec in `.claude/docs/design-specs/` |
| Backend-heavy | `.claude/rules/backend.md`, `.claude/rules/database.md`, `.claude/rules/stability.md` | `.claude/docs/architecture/11-runtime-environment.md`, `.claude/docs/architecture/12-database-schema-reference.md`, `.claude/docs/architecture/13-backend-learnings.md` |
| Integration-heavy | `.claude/rules/backend.md`, `.claude/rules/integrations.md`, `.claude/rules/stability.md` | `.claude/docs/architecture/09-integration-map.md`, `.claude/docs/architecture/11-runtime-environment.md`, `.claude/docs/architecture/13-backend-learnings.md` |
| UI + architecture | `.claude/rules/frontend.md`, `.claude/rules/backend.md`, `.claude/rules/stability.md` | `.claude/docs/design-specs/00-design-system-foundation.md`, `.claude/docs/architecture/README.md`, targeted architecture/design docs |
| Schema + API + UI | `.claude/rules/frontend.md`, `.claude/rules/backend.md`, `.claude/rules/database.md`, `.claude/rules/stability.md` | only the exact architecture/design references needed for the current phase |

4. Do **not** automatically read all Tier 2 rules.
5. Do **not** automatically read all Tier 3 docs.
6. Do **not** read subdirectory `AGENTS.md` files unless the task is actually moving into implementation within that directory.
7. Prefer this load order:
   1. compact rules
   2. task-specific reference docs
   3. subdirectory `AGENTS.md` only when editing in that domain
8. If the task is still vague after git/context review, summarize what should be loaded next instead of loading everything eagerly.

---

## Loading Heuristics

### Always Safe to Load
- root `AGENTS.md`
- `git status`
- `git log --oneline -10`

### Load Tier 2 Rules by Need
- `.claude/rules/frontend.md` for React, UI, layout, styling
- `.claude/rules/backend.md` for tRPC, Hono, auth, service logic
- `.claude/rules/database.md` for schema, Drizzle, migrations, FK/index concerns
- `.claude/rules/integrations.md` for external APIs, webhooks, provider logic
- `.claude/rules/stability.md` for any `apps/**` implementation work

### Load Tier 3 References by Need
- `.claude/docs/design-specs/00-design-system-foundation.md` for visual language, layout, component styling
- `.claude/docs/design-specs/00-lever-philosophy.md` for extend-vs-create decisions and doc/context structure
- `.claude/docs/design-specs/00-frontend-learnings.md` for frontend bug patterns, rendering pitfalls, polling/realtime issues
- `.claude/docs/design-specs/global-layout-navigation.md` for dashboard layout/navigation work
- specific feature docs in `.claude/docs/design-specs/` for concrete UI flows
- `.claude/docs/architecture/README.md` for architecture map and doc routing
- `.claude/docs/architecture/11-runtime-environment.md` for env/runtime/backend operational context
- `.claude/docs/architecture/12-database-schema-reference.md` for domain/table orientation
- `.claude/docs/architecture/13-backend-learnings.md` for historical backend bug patterns
- `.claude/docs/architecture/09-integration-map.md` for integration topology

---

## Anti-Bloat Rules

- Never use `/prime` as “read every rule and every reference.”
- Never load both full architecture and full design-spec sets unless the task truly spans both and needs both.
- Never preload historical learnings unless the task suggests debugging, performance, edge cases, or prior-bug-sensitive areas.
- Prefer one targeted reference over multiple broad references.
- If unsure, load the index/readme first, not every child doc.

---

## Suggested Routing

```/dev/null/prime-routing.txt#L1-7
Single-domain frontend task   → use /prime-frontend
Single-domain backend task    → use /prime-backend
Cross-domain implementation   → use /prime
Architecture/planning work    → use /prime
Vague exploratory task        → use /prime, then recommend next targeted reads
```

---

## Output Format

```/dev/null/prime-output.txt#L1-5
Project: Neondash | Branch: {branch}
Intent: {frontend-heavy | backend-heavy | integration-heavy | hybrid}
Loaded: {compact rules/docs actually loaded}
Next on demand: {only the most relevant additional files}
Ready for: {task description or "awaiting task"}
```

---

## Example Behavior

### Good
- Load `frontend.md` + `stability.md` for a UI bug
- Then load `00-design-system-foundation.md` only if the task involves layout/styling
- Then load a specific feature spec only if implementation needs it

### Bad
- Load all rules plus all docs plus all subdirectory `AGENTS.md` files before knowing the task

---

## Success Criteria

A good `/prime` run should:
- identify the likely task domain quickly
- load only the smallest useful context set
- point to the next best references
- reduce token waste
- preserve enough context to start work safely
