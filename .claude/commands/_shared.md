---
description: Canonical shared patterns for all commands — Quality Gates, Complexity Routing, Agent Matrix, WISC Load, AutoResearch Loop.
---

# _shared — Canonical Shared Patterns

## Section 1: Quality Gates

| Timing | Gates |
|--------|-------|
| After each task | `bun run type-check` |
| After each phase | `bun run type-check && bun run lint:oxlint:check` |
| Final | `bun run type-check && bun run lint:oxlint:check && bun run test` |

```bash
bun run type-check 2>&1 | tail -30        # TypeScript via tsgo (~4s)
bun run lint:oxlint:check 2>&1 | tail -20 # OXLint (~0.1s)
bunx biome check 2>&1 | tail -20          # Biome format+lint (~1s)
bun run test 2>&1 | tail -30              # Vitest
```

> **Pre-commit:** `bunx biome check --write <file>` on every manually edited file. Biome errors are `error` not `warning` — they break CI immediately.

---

## Section 2: Complexity Routing

| Level | Indicators | Mode |
|-------|-----------|------|
| L1-L2 | Single file, known pattern, trivial | Direct — no agents |
| L3 | Multi-file, single domain | 1 background agent |
| L4-L5 | Multi-domain, parallel changes | 2-3 parallel agents |
| L6+ | Architecture, multi-service | Agent Teams |

---

## Section 3: Agent Assignment Matrix

| Task Type | Agent | Background? |
|-----------|-------|-------------|
| tRPC, Hono, auth, DB, services | `debugger` | No (write-capable) |
| React, components, UI, styling | `frontend-specialist` | No (write-capable) |
| Schema, migrations, indexes | `debugger` | No |
| Tests, QA | `debugger` | No |
| Performance, security, SEO | `performance-optimizer` | No |
| Codebase patterns / files | `explorer` | **YES — mandatory** |
| External docs / packages | `librarian` | **YES — mandatory** |
| Architecture consultation | `evaluator` (Mode 3) | Caller decides — background for non-blocking, foreground when analysis must block |

Read-only agents (`explorer`, `librarian`) **MUST** use `run_in_background: true`.
`evaluator` Mode 3 may be background or foreground depending on context — caller specifies explicitly.

**Explorer vs Librarian:**

| Question | Agent |
|----------|-------|
| What exists in this codebase? | `explorer` |
| How does this library/API work? | `librarian` |
| Both needed? | Spawn both in same message |

> `explorer` = CUSTOM agent (`.claude/agents/explorer-agent.md`), NOT the built-in `Explore`. Use `subagent_type: "explorer"`.

---

## Section 4: WISC Context Load

Before any task, load the right tier:

| Domain | Command | Loads |
|--------|---------|-------|
| Frontend (React, UI) | `/prime-frontend` | frontend.md baseline + staged design/frontend references on demand |
| Backend (tRPC, DB, auth) | `/prime-backend` | backend.md + database.md + stability.md baseline, then targeted backend refs |
| Full-stack / multi-domain | `/prime` | Intent-based Tier 2 loading + exact Tier 3 refs only when needed |
| Continuing prior session | Read `HANDOFF.md` first | — |

**Tier 3 (read on demand only):**
- `.claude/docs/architecture/11-runtime-environment.md` — env/runtime/backend operational context
- `.claude/docs/architecture/12-database-schema-reference.md` — DB domain/table orientation
- `.claude/docs/architecture/13-backend-learnings.md` — backend historical bug patterns
- `.claude/docs/design-specs/00-design-system-foundation.md` — UI/layout/design-language tasks
- `.claude/docs/design-specs/00-lever-philosophy.md` — extend vs create decisions
- `.claude/docs/design-specs/00-frontend-learnings.md` — frontend bug/perf patterns

---

## Section 5: Tool Usage (ACI)

> **ACI = Agent-Computer Interface.** Per Anthropic "Building Effective Agents": good tool documentation is often more important than good prompts.

| Tool | Purpose | When to Use | When NOT to Use | Edge Cases |
|------|---------|-------------|-----------------|------------|
| `Agent()` | Spawn subagent | L3+ tasks needing specialist expertise | L1-L2 (direct fix faster; spawning overhead > value) | Background agents (`run_in_background: true`) cannot Write/Edit |
| `Skill()` | Load domain context | Before any domain-specific action — even 1% match | Never skip | Multiple skills OK; invoke process skills (planning, debug) before implementation skills |
| `TeamCreate/TaskCreate` | Agent teams | L6+ multi-service tasks with true parallelism | Below L6 (coordination overhead exceeds value) | Must `TeamDelete` when done; coordinator must be `project-planner` |
| `mcp__tavily__search` | Web search (current) | Research, /plan, version checks, CVE audits, external API patterns | Known codebase patterns (use Grep instead) | Add year or version to queries to avoid stale results |
| `mcp__claude_ai_Context7__resolve-library-id` + `mcp__claude_ai_Context7__query-docs` | Library/framework docs | ANY library question: API syntax, config, migration, SDK usage | General web research (use Tavily); internal codebase (use Grep) | Always call resolve-library-id first to get the library ID, then query-docs |
| `mcp__stitch__*` | UI prototyping | `/design` Phase 1 — new pages only | Component tweaks, bug fixes, iteration on existing UI | Requires `gpus-theme` skill loaded first for design system IDs |
| `mcp__sequential-thinking__sequentialthinking` | Multi-step reasoning decomposition | L4+ tasks, ambiguous requirements, 3+ file errors, irreversible decisions | L1-L2 fixes, known patterns (full trigger list in CLAUDE.md `## Sequential Thinking`) | Invoke BEFORE acting; re-invoke if new constraints emerge mid-execution |
| `Read/Grep/Glob` | Codebase exploration | Always prefer over bulk file reading | Never use Grep with overly broad patterns (performance) | Grep to pre-filter, then Read for full content |
| `WebFetch` | Fetch web content | Official docs deep-dive, specific page extraction | General research (use Tavily instead) | `librarian` agent only — never in main context |

---

## Section 7: Guardrails Index

> Quick-reference map to where detailed guardrails live. Read the canonical source before applying.

| Guardrail | Canonical Location | Trigger |
|-----------|--------------------|---------|
| Stability Checklist A-L | `.claude/rules/stability.md` | Any `apps/` change |
| GPUS anti-slop (10 Forbidden Defaults, Template Test) | `gpus-theme` skill | Any UI creation or color change |
| DB FK index requirement | `.claude/rules/database.md` | Schema changes |
| Biome pre-commit (must run before every commit) | `AGENTS.md` Quality Gates | Every commit |
| No shell scripts — Python only | `AGENTS.md` Cardinal Rule 3 | Script creation |
| No CRLF line endings | `AGENTS.md` Quality Gates | CI failures after Windows edits |
| Zod 3.x coerce pitfall (`Number("")===0`) | `.claude/rules/backend.md` | Zod schema work |
| tRPC 11 Content-Type header requirement | `.claude/rules/backend.md` | API request errors |
| React 19 patterns (`ref` as prop, `use()` hook) | `.claude/rules/frontend.md` | Frontend component changes |
| Drizzle `.returning()` guard (empty array is truthy) | `apps/api/src/AGENTS.md` | Any Drizzle mutation |
