# NeonDash Design Specifications

> Intelligent loading map for UI, layout, component, and interaction references.
> This directory is **Tier 3** reference context: load only what the task actually needs.

This folder contains the design and frontend reference material for NeonDash. Its purpose is to support **selective context engineering**:

- keep always-loaded rules compact
- keep deep design knowledge modular
- route agents and humans to the smallest useful document
- avoid loading the full design corpus for simple tasks

---

## How to Use This Folder

Use this directory when the task involves:

- UI creation
- layout redesign
- page structure
- styling and tokens
- component interaction patterns
- design review
- frontend implementation handoff
- historical frontend bug patterns
- extend-vs-create design decisions

Do **not** load this whole folder by default.

---

## Intelligent Loading Map

### 1. Start Here by Task Type

| Task Type | Load First | Load Next Only If Needed |
|---|---|---|
| Small UI fix | `.claude/rules/frontend.md` | specific feature spec only |
| New component/page | `00-design-system-foundation.md` | relevant feature spec, then `00-lever-philosophy.md` if structure is unclear |
| Layout/navigation work | `global-layout-navigation.md` | `00-design-system-foundation.md` |
| Styling/token alignment | `00-design-system-foundation.md` | feature spec if the surface is complex |
| Frontend performance/debugging | `00-frontend-learnings.md` | relevant feature spec or `apps/web/src/AGENTS.md` if editing |
| Extend vs create decision | `00-lever-philosophy.md` | `00-design-system-foundation.md` |
| Implement from an approved spec | `IMPLEMENTATION-GUIDE.md` | exact feature spec |
| Activity sheet work | `activity-detail-sheet-design-spec.md` | `ACTIVITY-SHEET-QUICK-REFERENCE.md` |
| Automation toolbar/modal work | relevant automation spec | related quick reference |
| Full frontend implementation in code | `.claude/rules/frontend.md` | `apps/web/src/AGENTS.md` only when editing in that domain |

---

## Recommended Load Order

Prefer this progression:

1. compact frontend rule
2. one foundational doc if needed
3. one feature-specific spec if needed
4. canonical frontend authority only when implementation enters `apps/web/src/**`

In practice:

```/dev/null/design-specs-load-order.txt#L1-5
frontend rule
→ foundation doc
→ feature spec
→ frontend learnings (only for debugging/perf)
→ apps/web/src/AGENTS.md (only when editing there)
```

---

## Foundational Documents

These files define the shared design language and decision model for the whole directory.

### `00-design-system-foundation.md`
Load for:
- GPUS visual language
- color/token rules
- layout philosophy
- typography direction
- component composition
- accessibility baseline
- motion rules

Use this when the task is about **how the UI should feel or be structured**.

### `00-lever-philosophy.md`
Load for:
- extend-vs-create decisions
- doc organization decisions
- component/spec placement
- reducing duplication
- keeping context loading efficient

Use this when the task is about **whether to adapt an existing pattern or create a new one**.

### `00-frontend-learnings.md`
Load for:
- rerender bugs
- polling/SSE/realtime issues
- memoization problems
- virtualized list behavior
- mutation UX edge cases
- sanitization/HTML rendering
- camera/media/browser API issues
- tabs/panels/scroll ownership bugs

Use this when the task is about **historical frontend pitfalls or non-obvious bugs**.

---

## Core Layout Reference

### `global-layout-navigation.md`
Load for:
- dashboard shell
- sidebar behavior
- page container rules
- scroll ownership
- responsive layout structure
- global navigation design

Use this when the task touches the **application shell**, not just a local component.

---

## Implementation Bridge

### `IMPLEMENTATION-GUIDE.md`
Load for:
- converting approved design specs into implementation work
- handoff from design to execution
- identifying required mutations, state, and interaction details

Use this after the spec is already chosen and the task is moving toward implementation.

---

## Feature Specs

These files describe concrete UI surfaces or workflows. Load only the ones directly related to the task.

| File | Use When |
|---|---|
| `activity-detail-sheet-design-spec.md` | implementing or refining the activity detail sheet |
| `ACTIVITY-SHEET-QUICK-REFERENCE.md` | fast lookup for activity sheet decisions |
| `activity-detail-sheet.md` | broader activity sheet context/reference |
| `automation-actions-toolbar-design-spec.md` | implementing/refining automation toolbar behavior |
| `AUTOMATION-TOOLBAR-QUICK-REFERENCE.md` | fast lookup for automation toolbar decisions |
| `AUTOMATION-MODAL-LAYOUTS.md` | modal layout patterns for automation flows |
| `automation-actions-toolbar.md` | broader toolbar context/reference |
| `chat-whatsapp.md` | WhatsApp/chat-specific UI behavior |
| `clientes.md` | client-facing CRM/clients UI surface |
| `crm-leads.md` | lead management UI surface |
| `financeiro.md` | finance UI surface |
| `meu-dashboard.md` | personal dashboard UI surface |

---

## Quick Routing Examples

### Example: “ajuste visual simples num card”
Load:
- `.claude/rules/frontend.md`

Maybe load:
- exact feature spec only if the card belongs to a documented surface

Do not load:
- all foundations
- all feature specs
- frontend AGENTS unless implementation gets complex

### Example: “criar nova página no dashboard”
Load:
- `00-design-system-foundation.md`
- `global-layout-navigation.md`

Then load:
- exact feature spec if it already exists
- `00-lever-philosophy.md` if deciding whether to extend an existing pattern

### Example: “bug de rerender em lista com polling”
Load:
- `00-frontend-learnings.md`

Then load:
- relevant feature spec
- `apps/web/src/AGENTS.md` only if editing frontend implementation files

### Example: “refatorar layout global”
Load:
- `global-layout-navigation.md`
- `00-design-system-foundation.md`

Then load:
- `00-lever-philosophy.md` if the task involves structural decisions

---

## What Not to Do

- Do not load this entire directory for every frontend task.
- Do not treat foundational docs as always-required.
- Do not load historical learnings unless debugging/performance/history-sensitive work is involved.
- Do not duplicate the same guidance into rules, commands, and feature specs.
- Do not create new design docs until checking whether an existing spec can be extended.

---

## Relationship to Other Context Layers

### `.claude/rules/frontend.md`
This is the compact, auto-load-friendly guardrail layer.

### `.claude/commands/prime-frontend.md`
This is the staged loading strategy.

### `apps/web/src/AGENTS.md`
This is the canonical implementation authority when editing frontend code.

### This directory
This is the deep reference layer for:
- design intent
- layout decisions
- feature specs
- frontend historical learnings

---

## Naming Convention

This folder uses intentional naming to improve selective loading:

- `00-*` → foundations and shared decision models
- named feature files → exact UI surface references
- `*-QUICK-REFERENCE.md` → fast lookup cards
- `IMPLEMENTATION-GUIDE.md` → design-to-build bridge

---

## Maintenance Rules

When updating this folder:

- prefer extending an existing spec before creating a new file
- keep shared principles in `00-*` docs
- keep feature-specific decisions in feature files
- keep quick references short and execution-oriented
- update command/rule references if paths or roles change
- remove duplicated guidance when a better canonical home exists

---

## Summary

This folder should help NeonDash load design context like this:

```/dev/null/design-specs-summary.txt#L1-6
simple UI tweak      → frontend rule only
new UI surface       → foundation + exact feature spec
layout work          → global layout + foundation
perf/debugging issue → frontend learnings
extend/create choice → lever philosophy
implementation       → implementation guide + exact spec
```

If a task only needs one file from this directory, load one file.
If a task needs none, skip the directory entirely.
