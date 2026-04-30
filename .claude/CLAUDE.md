# Claude Code Behavioral Config

> Tier 1 — always loaded. Generic across projects. Combined with root `AGENTS.md` + `${overlay}/CLAUDE-overlay.md` (if present) must stay **< 500 lines total**.
> Read root `AGENTS.md` first: @../AGENTS.md
> Then if `.claude/config.json::overlay` is set and `${overlay}/CLAUDE-overlay.md` exists, read that next.
> Subdirectory `AGENTS.md` files are read **only when editing files in that subdirectory**.

---

## Project identity

Project metadata lives in `.claude/config.json` (`project.name`, `project.stack`, `project.locale`, etc.) and the project overlay at `${overlay}/CLAUDE-overlay.md` (if present). Read both before acting on project-specific tasks.

---

## Behavior

These are non-default behaviors. Standard coding conventions are not listed because Claude already applies them.

- **Implement directly, don't just suggest.** Code-first responses.
- **Run terminal commands directly in the provided shell.** Never wrap in `wsl`, `cmd /c`, or any OS-specific launcher. The shell is bash regardless of OS.
- **Always use POSIX shell syntax and forward slashes** in paths, even on Windows.
- **Always run commands with a timeout** to avoid hanging on stuck processes.
- **Prefer non-interactive, self-terminating commands.** Don't wait for further output after a shell command.
- **One package manager per project.** Read `${tooling.packageManager}` from `.claude/config.json` and stick to it. Never mix.
- **Reference applied rules** when relevant (e.g., "per `.claude/rules/database.md` every FK needs an index").

---

## Skill invocation

- **Invoke relevant skills BEFORE any response or action.** Even a 1% chance a skill applies → invoke it first.
- **Process skills first** (planning, debugging), **implementation skills second**.
- **Use the `Skill` tool** — never `Read` skill files directly with the `Read` tool.

---

## Intent classification

Classify the request before acting:

| Type | Indicators | Action |
|---|---|---|
| **Trivial** (L1-L2) | Single file, known pattern | Direct fix — no planning |
| **Explicit** (L3) | Well-scoped, clear requirements | Light planning → execute |
| **Exploratory** (L4) | Ambiguous scope, multiple valid approaches | Discover → research → plan |
| **Open-ended** (L5+) | Vague, requires decomposition | Full D.R.P.I.V via `/plan` |

**Autonomy:** proceed without asking when changes are **local + reversible + evidence-supported + within existing architecture**. State assumptions briefly and continue.

**Ask first only for:**
- Destructive operations (file deletion, branch deletion, hard reset)
- Shared-system or production-impacting config changes
- Schema changes with irreversible consequences (drops, type narrowing on populated columns)
- Auth, payment, or PII-sensitive changes
- External actions visible to other people (commits, pushes, PRs, messages, deploys)

---

## Routing matrix (generic)

| Task touches | Load these | Then implement in |
|---|---|---|
| New API endpoint | `.claude/rules/backend.md` | `${paths.backendRoot}/...` |
| Schema / migration | `.claude/rules/database.md` | `${paths.schemaRoot}/...` + RLS in same or next migration |
| New page / component | `.claude/rules/frontend.md` | `${paths.frontendRoot}/...`, `${paths.componentsRoot}/...`, semantic tokens |
| External provider | `.claude/rules/integrations.md` | `${paths.libRoot}/<provider>/...` |
| Webhook | backend + integrations | `${paths.backendRoot}/webhooks/...` (idempotency mandatory) |
| Pure styling | frontend + DESIGN | `${paths.stylesRoot}/global.css` token block — no hardcoded hex |
| Anywhere | `.claude/rules/stability.md` | universal checklist |

If `${overlay}/routing-supplements.md` exists, also load project-specific routing rows (e.g., domain flows, payment providers, custom paths).

`.claude/rules/*.md` are generic templates. Project authority lives in `${overlay}/rules/*.md` when present — load overlay first, fall back to generic.

---

## Sequential thinking

Invoke `mcp__sequential-thinking__sequentialthinking` **before** acting (not after) when any of these apply:

| Trigger | Example |
|---|---|
| Request is L4+ (multi-domain, cross-layer) | Feature touching schema + API + UI |
| Ambiguous requirements with 2+ valid approaches | "improve performance" with no metric |
| Error spans 3+ files or services | Cascade failure after deploy |
| Architecture decision with irreversible consequences | New table, new dependency, auth model change |
| Plan has 3+ sequential phases with dependencies | Sprint with schema → API → UI gates |
| Confidence < 4 on root cause after initial investigation | Bug with no clear reproduction path |

**Never invoke for:** L1-L2 fixes, known patterns, direct style/lint/type changes.

---

## Research tools

| Question | Tool |
|---|---|
| Library/framework API, config, version, migration | `mcp__claude_ai_Context7__resolve-library-id` → `mcp__claude_ai_Context7__query-docs` |
| Current best practices, CVEs, ecosystem news, external APIs | `mcp__tavily__search` (add year + version to query) |
| Both needed | Run both in parallel in the same message |

Codebase search (`Grep` / `Read` / `Glob`) is the **fallback for internal questions, never the first step for external knowledge.** Use even for well-known libraries — training data may be stale.

---

## Stopping conditions (hard limits)

- **Max 3 fix attempts** on the same hypothesis → escalate to `evaluator` (Mode 3: Architecture Analysis)
- **Max 5 agent spawns** per user request → pause and checkpoint with the user
- **Confidence < 3** on a critical finding → flag as assumption and ask the user
- **Scope expands** beyond the original request → STOP and confirm
- **Quality gate fails 2× consecutively** → invoke `/debug recover`

---

## Decision authority

| Action | Authority |
|---|---|
| L1-L2 fixes, style/lint/type fixes | Autonomous |
| Schema additions, new dependencies, file deletion, auth changes | **Confirm first** |
| Payments, PII, production config, destructive DB operations, deploy to prod | **Always ask** |

---

## Project-specific guards

Project-specific guards (cardinal rules unique to this codebase — render mode, icon library, donation flow rules, idempotency contracts, etc.) live in `${overlay}/CLAUDE-overlay.md`. Read it before any task that touches those domains.

If no overlay file exists, fall back to the universal stability checklist (`.claude/rules/stability.md`) only.

---

## Pointers (Tier 3 — read on demand)

- `.claude/rules/{backend, database, frontend, integrations, stability, DESIGN}.md` — domain-scoped Tier 2 rules (generic templates)
- `${overlay}/rules/*.md` — project-specific authoritative versions (when present)
- `${overlay}/CLAUDE-overlay.md` — project identity + project-specific guards
- `${overlay}/anti-patterns.md` — project-specific bug catalog (loaded by `/debug` and `debugger` skill)
- `${overlay}/routing-supplements.md` — extra routing matrix rows
- `${overlay}/verify-supplements.md` — extra smoke tests for `/verify`
- `${overlay}/layer-map.md` — project layer stack (loaded by `planning` skill)
- `${overlay}/seo-supplement.md` — project SEO/locale specifics (loaded by `performance-optimization` skill)
- `docs/` — product specs, design canon, implementation plans (project-dependent)
