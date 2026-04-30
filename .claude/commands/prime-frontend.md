---
description: Prime frontend context with staged selective loading
workflow_type: augmented-llm
---

# /prime-frontend — Staged Frontend Context Load

Load only the frontend context required for the current task. This command is optimized for **context efficiency**, not maximum preload.

## Intent

Use this command for React, UI, layout, styling, component, routing, and frontend performance tasks.

### Goals

- Load the **minimum viable frontend context**
- Keep Tier 2 rules compact and always-relevant
- Pull Tier 3 references **only when the task requires them**
- Avoid loading `apps/web/src/AGENTS.md` unless editing frontend files or the task needs canonical frontend authority

---

## Default Load (always)

1. Root `AGENTS.md` (already Tier 1)
2. `.claude/rules/frontend.md`
3. Recent frontend history:
   - `git log --oneline -5 -- apps/web/`

This is the default baseline for almost all frontend work.

---

## Staged Loading Model

### Stage 1 — Baseline
Use for:
- small UI fixes
- className changes
- simple component edits
- route/page tweaks with known patterns
- light bug fixes

Load:
- `.claude/rules/frontend.md`

Do **not** load:
- `apps/web/src/AGENTS.md`
- design reference docs
- unrelated feature specs

---

### Stage 2 — Design/Foundation Load
Escalate to this stage only if the task involves:
- new UI creation
- layout redesign
- page structure changes
- color/typography decisions
- design review
- interaction design
- design-system alignment

Also load:
- `.claude/docs/design-specs/00-design-system-foundation.md`

Load additionally when the task involves extend-vs-create decisions, spec consolidation, or documentation structure:
- `.claude/docs/design-specs/00-lever-philosophy.md`

---

### Stage 3 — Historical Frontend Patterns
Escalate to this stage only if the task involves:
- rerender/performance regressions
- polling, SSE, or query churn
- virtualized lists
- DnD / kanban / chat surfaces
- mutation UX issues
- sanitization / HTML rendering
- camera/media/browser API flows
- tab/panel scroll bugs

Also load:
- `.claude/docs/design-specs/00-frontend-learnings.md`

---

### Stage 4 — Canonical Frontend Authority
Load this stage only when:
- editing files under `apps/web/src/**`
- the task is complex enough that canonical frontend rules are required
- there is ambiguity between a compact rule and actual domain authority
- the change spans multiple frontend subsystems

Also load:
- `apps/web/src/AGENTS.md`

This is the canonical authority for frontend implementation details.

---

## Feature-Specific Spec Loading

If the task targets a specific UI surface, load only the directly relevant spec(s) from:
- `.claude/docs/design-specs/`

Examples:
- global layout/navigation work → `global-layout-navigation.md`
- implementation handoff → `IMPLEMENTATION-GUIDE.md`
- activity sheet work → `activity-detail-sheet-design-spec.md` and/or `ACTIVITY-SHEET-QUICK-REFERENCE.md`
- automation toolbar work → corresponding automation spec/reference docs

Do **not** load the entire `design-specs/` directory.

---

## Routing Heuristic

### If the task is:
- **Trivial (L1-L2):** Stage 1 only
- **Explicit frontend implementation:** Stage 1 → Stage 2 if structure/design is involved
- **Performance/debugging-heavy:** Stage 1 → Stage 3
- **New page/component architecture:** Stage 1 → Stage 2 → Stage 4
- **Complex frontend refactor:** Stage 1 → Stage 2 or 3 → Stage 4 as needed

---

## Instructions

1. Read the baseline frontend rule:
   - `.claude/rules/frontend.md`
2. Run:
   - `git log --oneline -5 -- apps/web/`
3. Classify the task into one of the four stages above
4. Load only the additional references required by that stage
5. Load feature-specific specs only if the task clearly targets that surface
6. Load `apps/web/src/AGENTS.md` only when Stage 4 is justified
7. Summarize the loaded context in fewer than 120 words

---

## Output Format

```/dev/null/prime-frontend-output.md#L1-3
Frontend primed | Stage: {1|2|3|4} | Branch: {branch}
Loaded: {exact files loaded}
Ready for: {task description or "awaiting task"}
```

---

## Load Discipline

- Prefer **progressive disclosure** over broad preload
- Prefer **one relevant spec** over a whole folder
- Prefer **compact rules first**, references second, canonical AGENTS last
- If unsure, start at Stage 1 and escalate only when the task demands it

---

## Context Engineering Notes

This command intentionally avoids the old eager-loading pattern.

**Do not automatically load:**
- all design specs
- all Tier 3 docs
- `apps/web/src/AGENTS.md` for every frontend task

The objective is to keep frontend priming:
- fast
- selective
- high-signal
- cheap in context usage
