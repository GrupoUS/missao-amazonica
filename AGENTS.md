# AGENTS.md — Agent Rules

> Generic agent behavior + execution best practices. Auto-loaded by SessionStart in every session.
> Project-specific identity, stack snapshot, architecture, and data invariants live in `${overlay}/CLAUDE-overlay.md` and `${overlay}/rules/*.md`.
> Tier 1 companion: `.claude/CLAUDE.md`.

---

## Cardinal Rules (universal, non-negotiable)

> [!CAUTION]
> Apply to every interaction, regardless of phase or domain.

1. **Never assume correctness.** Verify against official docs, runtime tests, or DB inspection before applying changes.
2. **Always debug after changes.** Every modification ends with a verification step. Never mark a task done without evidence it works.
3. **No fix without root cause.** Understand WHY before changing code. Symptom-only fixes regress.
4. **No "fixed" claim without evidence.** Quality gates must pass; tests/screenshots/queries must confirm.
5. **No scope expansion mid-task.** Log new issues for later; finish the current scope first.
6. **Project cardinal rules** (icon library, render mode, auth model, derived totals, PII privacy, idempotency) live in `${overlay}/CLAUDE-overlay.md`. Read those before any task touching that domain.

---

## Behavior

- **Implement directly, don't just suggest.** Code-first responses.
- **One package manager per project.** Read `${tooling.packageManager}` from `.claude/config.json` and stick to it. Never mix `npm` / `pnpm` / `yarn` / `bun`.
- **POSIX shell + forward slashes** in paths, even on Windows. Never wrap in `wsl -e`, `cmd /c`, or other launchers.
- **Always run shell commands with a timeout.** Prefer non-interactive, self-terminating invocations.
- **Reference applied rules** when relevant (e.g., "per `.claude/rules/database.md` every FK needs an index"). Rule path resolves overlay-first per `_shared.md § 0`.
- **Conventional Commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `perf:`, `test:`.
- **Never silently swallow errors.** Always log structured context + surface to user / monitoring.

---

## Operational Mantra

```
Discover → Research → Plan → Implement → Validate
```

Principles:
- **KISS** — simplest solution that meets requirements
- **YAGNI** — build only what the current spec demands; no speculative "just in case" features
- **Chain of Thought** — decompose into atomic, sequentially verifiable steps
- **LEVER** — extend existing code before creating new abstractions; three similar lines beats premature abstraction
- **Evidence over intuition** — measure perf, profile bottlenecks, query the DB; don't guess

---

## Execution Best Practices

### Before acting

1. Classify intent (L1-L5 per CLAUDE.md). Trivial → direct fix. Open-ended → `/plan` first.
2. Load minimum-viable context per `/prime`. Never eager-load all rules + docs.
3. Invoke relevant skills BEFORE acting (1% chance applies → invoke).
4. For L4+ multi-domain or ambiguous requests → `mcp__sequential-thinking__sequentialthinking` first.
5. For external library questions → `mcp__claude_ai_Context7__*` (preferred over training data, even for "well-known" libs).

### While working

- One change at a time when in same flow. Parallel agents only for independent work in distinct files.
- Run quality gates after each task: type-check after task, +lint after phase, +tests at finish.
- Stop after 3 failed fix attempts on same hypothesis → `/debug recover`.
- Stop after 5 agent spawns per request → checkpoint with user.
- Stop on confidence < 3 on critical finding → flag + ask.
- Stop on scope drift → confirm before proceeding.

### Tool usage

- Prefer dedicated tools over Bash where one fits: `Read`, `Edit`, `Write`, `Glob`, `Grep`.
- Background read-only agents (`explorer`, `librarian`) MUST use `run_in_background: true`.
- Foreground only when agent must write/edit (`frontend-specialist`, `debugger` in fix mode).
- Multiple skills can load — process skills (planning, debugging) before implementation skills.
- Never `Read` skill files directly — use `Skill` tool.

### After acting

- Verification step ends every modification — gates pass + evidence captured.
- Sensitive fixes (auth / payments / PII / schema) → run codex adversarial review before close.
- Capture learnings via `/evolve` when a non-obvious pattern was discovered.
- For long sessions → `/evolve handoff` to externalize state before context degrades.

---

## Debugging Protocol

When an error or unexpected result occurs:

1. **PAUSE** — do not retry blindly.
2. **THINK** — Root Cause Analysis: what happened, why (5 Whys), 3 candidate fixes with tradeoffs.
3. **HYPOTHESIZE** — pick one, write it down with a falsifiable validation plan.
4. **EXECUTE** — apply the fix.
5. **VERIFY** — confirm fix works; check no regression in adjacent flows.

After **2 failed attempts on the same hypothesis**, escalate via `evaluator` agent (Mode 3) or `/debug recover`. Don't loop.

---

## Quality Gates

| Timing | Command (resolved from `.claude/config.json::tooling`) |
|---|---|
| After each task | type-check |
| After each phase | type-check + lint |
| Final | type-check + lint + tests |

Pre-commit: run formatter + linter on every manually edited file. Most linters (Biome, ESLint) treat errors as build-breaking.

Performance gates per `.claude/config.json::gates`. Project-specific routes/checklists in `${overlay}/verify-supplements.md`.

---

## Decision Authority

| Action | Authority |
|---|---|
| L1-L2 fixes, style/lint/type fixes | Autonomous |
| Schema additions, new dependencies, file deletion, auth changes | **Confirm first** |
| Payments, PII, production config, destructive DB ops, deploy to prod | **Always ask** |

---

## Negative Constraints (universal)

- No mixing package managers — pick one in config.
- No `console.log` in production code paths — use structured logger / monitoring (`captureException`, etc.).
- No `as any`. No non-null `!` on optional values.
- No `href="#"`. Use `<button>` for actions, real `<a href="…">` for navigation.
- No silent error swallowing — every catch logs + surfaces.
- No layout-property animations (`width`, `height`, `top`, `left`, `padding`, `margin`). Use `transform` + `opacity`. Accordion expand: `grid-template-rows: 0fr ↔ 1fr`.
- No skipping pre-flight checks before debugging.
- No `console.log` / `debugger` left in production after fixing.

Project-specific negative constraints (icon library, render mode, framework choice, hardcoded hex policy) live in `${overlay}/CLAUDE-overlay.md` § Cardinal Rules + `${overlay}/rules/*.md`.

---

## Stopping Conditions (hard limits)

- **Max 3 fix attempts** on same hypothesis → escalate to `evaluator` (Mode 3)
- **Max 5 agent spawns** per user request → pause + checkpoint
- **Confidence < 3** on critical finding → flag as assumption + ask
- **Scope expands** beyond original request → STOP + confirm
- **Quality gate fails 2× consecutively** → invoke `/debug recover`

---

## Research Cascade (external knowledge)

| Question | Tool |
|---|---|
| Library/framework API, config, version, migration | `mcp__claude_ai_Context7__resolve-library-id` → `query-docs` |
| Current best practices, CVEs, ecosystem news, external APIs | `mcp__tavily__search` (add year + version to query) |
| Both needed | Run in parallel, same message |
| Internal codebase | `Grep` / `Read` / `Glob` (fallback for internal Q only — never first step for external) |

Confidence scoring: 1=speculation · 3=community · 5=official docs. Findings ≤ 2 must be flagged, not planned on.

---

## Generic Pre-Delivery Checklist

Project-agnostic items — extend with project specifics in `${overlay}/verify-supplements.md`.

- [ ] Type-check clean (0 errors, 0 warnings)
- [ ] Lint clean
- [ ] Build succeeds with no missing-env warnings
- [ ] Tests pass (if test runner configured)
- [ ] Lighthouse ≥ thresholds in `.claude/config.json::gates.lighthouse` on key routes
- [ ] CLS, LCP, INP within `.claude/config.json::gates`
- [ ] Responsive verified at 375 / 768 / 1024 / 1440 px without horizontal scroll
- [ ] `prefers-reduced-motion` honored (manual test)
- [ ] All FKs have indexes
- [ ] RLS enabled on every table (or project's auth model enforced)
- [ ] Webhook idempotency verified (same body twice → one effect)
- [ ] `.env.example` includes every key referenced in code
- [ ] Production smoke on critical routes
- [ ] No hardcoded hex outside design token block
- [ ] No icon-library mixing

---

## Where things live

| Need | Read |
|---|---|
| Generic Tier 1 behavioral config | `.claude/CLAUDE.md` |
| Project identity + cardinal rules + project guards | `${overlay}/CLAUDE-overlay.md` |
| Domain rules (backend/database/frontend/integrations/stability/DESIGN) | `.claude/rules/<file>.md` (resolves overlay-first via `_shared.md § 0`) |
| Project anti-patterns (concrete bug catalog) | `${overlay}/anti-patterns.md` |
| Project routing supplements | `${overlay}/routing-supplements.md` |
| Project-specific verify smoke tests | `${overlay}/verify-supplements.md` |
| Project layer map (used by `planning` skill) | `${overlay}/layer-map.md` |
| Project SEO/locale specifics | `${overlay}/seo-supplement.md` |
| Project-specific protected files | `${overlay}/protected-files.json` |
| Shared command patterns (gates, agents, resolution recipes) | `.claude/commands/_shared.md` |
| Skill invocation order, tool usage | `.claude/commands/_shared.md` § 5, § 12 |
| External templates (delegation, handoff, recovery, audit prompts, refactor methodology) | `.claude/templates/` |
| Product spec, architecture, design canon (project) | `docs/` (per-project structure) |
