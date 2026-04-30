---
description: Execute implementation plans. Parses plan for phase structure and agent assignments, loads domain skills, spawns correct specialists, orchestrates parallel/sequential execution with sprint contract gates.
workflow_type: orchestrator-workers
---

# /implement

**ARGUMENTS**: $ARGUMENTS

> **Plans come from:** `/plan` — format defined in `.claude/skills/planning/SKILL.md`
> **Plan files:** `docs/plans/YYYY-MM-DD-<feature>.md` or active conversation context

---

## 0. Pre-flight

```bash
ls docs/plans/*.md 2>/dev/null
```

| Source | Action |
|--------|--------|
| Plan file exists | Load from file |
| Plan in chat context | Extract phases and tasks from conversation |
| No plan found | Run `/plan` first — never implement without a plan |

Parse from plan: **Complexity**, **Layers**, phase markers (`[SEQUENTIAL]`/`[PARALLEL]`), task list (`- [ ]`), verify commands, sprint contracts, and `[ASSUMED]` items to validate before starting.

**Flags:**

| Flag | Effect |
|------|--------|
| `--codex` | Delegate L5+ phases to `codex:rescue` skill |
| `--sprint=N` | Execute only sprint N of a multi-sprint plan |
| `--dry-run` | Parse and display task/agent assignments without executing |
| `--model=opus` | Force Opus 4.6+ — continuous session, no context resets |

---

## 1. Skill Routing

Load the skill matching the task domain **before spawning any agent for that phase**.

| Domain / Layer | Skill |
|----------------|-------|
| Drizzle schema, tRPC procedures, Clerk auth, FK indexes | `drizzle-neon-clerk-auth` |
| React components, pages, hooks, Tailwind, shadcn/ui | `ui-ux-pro-max` |
| Meta / WhatsApp Cloud API / Instagram Graph | `meta-api-integration` |
| Baileys / WhatsApp local session | `baileys-integration` |
| Asaas / Kiwify / Hubla / Nuvem Fiscal | `payments-integrations-br` |
| Google Gemini / AI features / Vercel AI SDK | `google-ai-sdk` |
| Performance, bundle size, SEO, LCP/INP | `performance-optimization` |
| Deploy, Coolify, Vultr, Traefik | `coolify-vultr` |
| Design tokens, GPUS palette, dark mode | `gpus-theme` |
| Debugging, errors, tRPC failures, regressions | `debugger` |

---

## 2. Agent Assignment

If the plan doesn't specify `**Agent:**`, assign by domain detection:

| File Path Pattern | Agent |
|------------------|-------|
| `apps/api/drizzle/` | `debugger` |
| `apps/api/src/routers/` | `debugger` |
| `apps/api/src/services/` | `debugger` |
| `apps/api/src/_core/` | `debugger` |
| `apps/web/src/` | `frontend-specialist` |
| `packages/ai-gateway/` | `debugger` |
| `packages/shared/` | `debugger` |
| Cross-domain (3+ layers) | `project-planner` as coordinator |
| Any failing task | `debugger` |

Background agents (always `run_in_background: true`, read-only):

| When | Agent |
|------|-------|
| Before any phase — grep existing patterns | `explorer` |
| External API docs, package versions | `librarian` |

---

## 3. Execution Mode

| Complexity | Mode |
|------------|------|
| L1-L2 | DIRECT — main agent executes |
| L3-L5 | SUBAGENTS — `Agent()` per task/phase |
| L6+ | AGENT TEAMS — `TeamCreate` + coordinator + `TaskCreate` |

---

## 4. Mode A: DIRECT (L1-L2)

1. Load skill for the task domain
2. Execute task directly in main agent
3. Run verify command
4. Gate: `bun run type-check`

---

## 5. Mode B: SUBAGENTS (L3-L5)

### Before any phase

Spawn `explorer` in background to grep existing patterns relevant to this phase:

```typescript
Agent({
  subagent_type: "explorer",
  prompt: "Grep [domain] patterns in [paths]. Report file:line for reuse.",
  run_in_background: true
});
```

### Sequential Phase

```
Load domain skill
→ Spawn agent for task 1 → wait → run verify command → type-check gate
→ Spawn agent for task 2 → wait → run verify command → type-check gate
→ ...
```

### Parallel Phase

Spawn all independent tasks in a **single message** (one `Agent()` per task):

```typescript
// Write-capable → foreground:
Agent({ subagent_type: "frontend-specialist", prompt: "..." })
Agent({ subagent_type: "debugger", prompt: "..." })
// Read-only → background:
Agent({ subagent_type: "explorer", prompt: "...", run_in_background: true })
```

After all complete: parse each agent's `## Context Handoff` block, consolidate changes, run phase gate.

### Sprint Contract Gate

If the plan includes sprint contracts, after completing all tasks in a sprint:

1. Run each `verify:` command listed in the contract's Done Definition
2. All must pass — no partial credit
3. Any failure → fix + re-run before starting next sprint

---

## 6. Mode C: AGENT TEAMS (L6+)

### Setup

```typescript
TeamCreate({ team_name: "[feature-slug]" });
```

### Coordinator Pattern

Create a **coordinator task** assigned to `project-planner`. The coordinator:
- Holds the full plan and sprint contracts
- Delegates domain tasks via `SendMessage`
- Validates `## Context Handoff` from each specialist against the contract
- Gates sprints before advancing
- Reports progress and blockers

```typescript
// Coordinator (foreground — must complete before team cleanup):
TaskCreate({ subject: "Coordinator — [feature]", owner: "project-planner" });

// Domain specialists (spawned by coordinator or in parallel where contracts allow):
TaskCreate({ subject: "Schema + API — Sprint N", owner: "debugger" });
TaskCreate({ subject: "UI Layer — Sprint N", owner: "frontend-specialist", addBlockedBy: ["[schema-task-id]"] });
TaskCreate({ subject: "Integration — Sprint N", owner: "debugger", addBlockedBy: ["[api-task-id]"] });
```

### Coordinator Prompt Template

```
You are the coordinator for implementing [feature].

Plan: [paste plan content or docs/plans/[slug].md]
Sprint contract: [paste Sprint N contract]
Skill loaded: [skill name for this domain]

Responsibilities:
1. Delegate schema/API tasks to debugger agent via SendMessage
2. Delegate UI tasks to frontend-specialist (only after API phase passes gate)
3. Validate each agent's Context Handoff against the contract's Done Definition
4. Run quality gate after each phase: bun run type-check
5. If any criterion fails → return detailed feedback to the responsible agent, not the user
6. Only report to user: SPRINT N COMPLETE (all criteria met) or BLOCKED: [specific failing criterion]

Do not implement yourself. Coordinate, validate, and gate.
```

### Context Management

| Model | Strategy |
|-------|----------|
| Sonnet 4.x | Context reset between sprints — write handoff artifact before each reset |
| Opus 4.6+ | Auto-compaction, continuous session — monitor for context anxiety |

Handoff artifact path: `docs/plans/HANDOFF-[slug]-sprint-N.md`

Handoff contains: completed tasks, verified state, next sprint contract, open issues, key decisions, modified files, resume commands.

Context anxiety symptoms (Sonnet): agent rushing, skipping edge cases, accepting failures. If observed → trigger reset immediately.

---

## 7. --codex Flag (L5+ Delegation)

For implementation phases too large or complex for a standard agent:

Invoke `codex:rescue` skill with:
- Task description from the plan phase
- Sprint contract done criteria
- Relevant file paths and line references
- Verify command

Codex handles implementation. Main agent validates against the sprint contract when done.

---

## 8. Quality Gates

| When | Command |
|------|---------|
| After each task | `bun run type-check` |
| After each phase | `bun run type-check && bun run lint:oxlint:check` |
| After sprint (if contracts) | All `verify:` commands in Done Definition |
| Final | `bun run type-check && bunx biome check && bun run test` |

---

## 9. Failure Handling

| Attempt | Action |
|---------|--------|
| 1st failure | Read error. Retry with error context added to agent prompt |
| 2nd failure | Invoke `debugger` skill. Break task into smaller subtasks |
| 3rd failure | Invoke `recover` skill. Escalate to user with root cause analysis |

Never retry blindly. Never skip a gate because a task "looks correct."

---

## Stopping Conditions

- STOP if no plan exists → run `/plan` first
- STOP after 3rd failure on same task → invoke `/recover`
- STOP if agent team runs 10+ task iterations without sprint completion
- ASK if plan has `[ASSUMED]` items not yet validated
- ASK before destructive operations (schema drops, data deletion)

---

## 10. Cleanup (Agent Teams)

After all sprints complete:

```typescript
// Signal completion, collect final handoffs
TeamDelete({ team_name: "[feature-slug]" });
```

---

## 11. Completion

```
✅ Implementation complete.

Gates passed:
  - Type check: ✓
  - Lint (OXLint + Biome): ✓
  - Tests: ✓
  - Sprint contracts: ✓ (if applicable)

Options:
  1. PR   → git push -u origin [branch] && gh pr create
  2. Keep → branch [name] ready for review
  3. /evolve → capture learnings, update AGENTS.md and docs
```
