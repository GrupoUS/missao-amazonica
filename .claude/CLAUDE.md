# Claude Code Behavioral Config — NeonDash

> Tier 1 (always loaded). Combined with `AGENTS.md` must stay **< 500 lines**.
> Read root `AGENTS.md` first: @../AGENTS.md
>
> Subdirectory `AGENTS.md` files are read **only when editing files in that
> subdirectory** (per WISC 3-Tier in `AGENTS.md`).

---

## Agent Naming (Non-Default — Avoid Confusion)

| Name | What it is |
|------|------------|
| `explorer` / `explorer-agent` | Custom NeonDash codebase researcher (`.claude/agents/explorer-agent.md`). Structured output with confidence scores. |
| `Explore` (capital E) | Claude Code built-in quick search subagent. |

In `/plan`, `/research`, and `/debug` workflows, use `subagent_type: "explorer"`
(lowercase) — not `Explore`.

---

## Behavior (Project-Specific Overrides)

These are non-default behaviors specific to this codebase. Standard coding
conventions are not listed because Claude already applies them.

- **Implement directly, don't just suggest.** Code-first responses.
- **Run terminal commands directly in the provided shell.** Never wrap in `wsl`,
  `cmd /c`, or any OS-specific launcher. The shell is always bash regardless of OS.
- **Always use POSIX shell syntax and forward slashes** in paths, even on Windows.
- **Always run commands with a timeout** to avoid hanging on stuck processes.
- **Prefer non-interactive, self-terminating commands.** Do not wait for further
  output after a shell command.
- **Reference applied rules** when relevant (e.g., "per `.claude/rules/database.md`
  every FK needs an index").

---

## Skill Invocation

- **Invoke relevant skills BEFORE any response or action.** Even a 1% chance a skill
  applies → invoke it first.
- **Process skills first** (planning, debugging), **implementation skills second**.
- **Use the `Skill` tool — never `Read` skill files directly** with the `Read` tool.
- For the full task-domain → skills mapping, see
  `.claude/docs/token-budget.md § 8` (Skills Loading Discipline).

---

## Intent Classification

Classify the request before acting:

| Type | Indicators | Action |
|------|-----------|--------|
| **Trivial** (L1-L2) | Single file, known pattern | Direct fix — no planning |
| **Explicit** (L3) | Well-scoped, clear requirements | Light planning → execute |
| **Exploratory** (L4) | Ambiguous scope, multiple valid approaches | Discover → research → plan |
| **Open-ended** (L5+) | Vague, requires decomposition | Full D.R.P.I.V via `/plan` |

**Autonomy:** proceed without asking when changes are **local + reversible +
evidence-supported + within existing architecture**. State assumptions briefly and
continue.

**Ask first only for:**
- destructive operations (file deletion, branch deletion, hard reset)
- shared-system or production-impacting config changes
- schema changes with irreversible consequences
- auth, payment, or PII-sensitive changes
- external actions visible to other people (commits, pushes, PRs, messages)

---

## Sequential Thinking

Invoke `mcp__sequential-thinking__sequentialthinking` **before** acting (not after)
when any of these apply:

| Trigger | Example |
|---------|---------|
| Request is L4+ (multi-domain, cross-service) | Feature touching schema + API + UI |
| Ambiguous requirements with 2+ valid approaches | "improve performance" with no metric |
| Error spans 3+ files or services | Cascade failure after deploy |
| Architecture decision with irreversible consequences | New table, new dependency, auth change |
| Plan has 3+ sequential phases with dependencies | Sprint with schema → API → UI gates |
| Confidence < 4 on root cause after initial investigation | Bug with no clear reproduction path |

**Never invoke for:** L1-L2 fixes, known patterns, direct style/lint/type changes.

For debugging cascade failures, follow `.claude/docs/session-patterns.md § Pattern 3`.

---

## Research Tools

| Question | Tool |
|----------|------|
| Library/framework API, config, version, migration | `mcp__claude_ai_Context7__resolve-library-id` → `mcp__claude_ai_Context7__query-docs` |
| Current best practices, CVEs, ecosystem news, external APIs | `mcp__tavily__search` (add year + version to query) |
| Both needed | Run both in parallel in the same message |

Codebase search (`Grep`/`Read`/`Glob`) is the **fallback for internal questions, never
the first step for external knowledge.** Use even for "well-known" libs (React,
Drizzle, tRPC) — training data may be stale.

---

## Stopping Conditions (Hard Limits)

- **Max 3 fix attempts** on the same hypothesis → escalate to `evaluator` (Mode 3:
  Architecture Analysis)
- **Max 5 agent spawns** per user request → pause and checkpoint with the user
- **Confidence < 3** on a critical finding → flag as assumption and ask the user
- **Scope expands** beyond the original request → STOP and confirm with the user
- **Quality gate fails 2× consecutively** → invoke `/recover`

---

## Decision Authority

| Action | Authority |
|--------|-----------|
| L1-L2 fixes, style/lint/type fixes | Autonomous |
| Schema changes, new dependencies, file deletion, auth changes | **Confirm first** |
| Payments, PII, production config, destructive DB operations | **Always ask** |

---

## Pointers (Tier 3 — Read on Demand)

- `.claude/docs/token-budget.md` — context budget strategy, progressive loading,
  hook filtering, model selection per workload
- `.claude/docs/session-patterns.md` — 5 copy-paste interaction patterns + Rewind
  protocol + Skills loading checklist
- `.claude/docs/hooks-guide.md` — inventory of all 12 hooks + proposed enhancements
- `.claude/docs/scripts-conventions.md` — Python-only script conventions
- `.claude/docs/quality-gates.md` — full Definition of Done checklist
- `.claude/docs/agent-quality-checklist.md` — pre-deploy checklist for agent config
  changes
