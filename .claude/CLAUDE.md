# Claude Code Behavioral Config — Missão Amazônica

> Tier 1 (always loaded). Combined with root `AGENTS.md` must stay **< 500 lines**.
> Read root `AGENTS.md` first: @../AGENTS.md
>
> Subdirectory `AGENTS.md` files are read **only when editing files in that
> subdirectory** (per WISC 3-Tier).

---

## Project Identity

**Missão Amazônica – Sal da Terra** — public donation platform (CNPJ church mission, Rio Negro communities).

Stack at a glance: Astro 6 hybrid · Bun · Tailwind v4 · React 19 islands · Supabase · Vercel · Pix BR-Code · Resend · Sentry. Full snapshot in root `AGENTS.md`.

---

## Behavior (Project-Specific Overrides)

These are non-default behaviors. Standard coding conventions are not listed because Claude already applies them.

- **Implement directly, don't just suggest.** Code-first responses.
- **Run terminal commands directly in the provided shell.** Never wrap in `wsl`, `cmd /c`, or any OS-specific launcher. The shell is bash regardless of OS.
- **Always use POSIX shell syntax and forward slashes** in paths, even on Windows.
- **Always run commands with a timeout** to avoid hanging on stuck processes.
- **Prefer non-interactive, self-terminating commands.** Do not wait for further output after a shell command.
- **Bun-only.** Never `npm` / `yarn` / `pnpm`.
- **Reference applied rules** when relevant (e.g., "per `.claude/rules/database.md` every FK needs an index").

---

## Skill Invocation

- **Invoke relevant skills BEFORE any response or action.** Even a 1% chance a skill applies → invoke it first.
- **Process skills first** (planning, debugging), **implementation skills second**.
- **Use the `Skill` tool — never `Read` skill files directly** with the `Read` tool.

---

## Intent Classification

Classify the request before acting:

| Type | Indicators | Action |
|------|-----------|--------|
| **Trivial** (L1-L2) | Single file, known pattern | Direct fix — no planning |
| **Explicit** (L3) | Well-scoped, clear requirements | Light planning → execute |
| **Exploratory** (L4) | Ambiguous scope, multiple valid approaches | Discover → research → plan |
| **Open-ended** (L5+) | Vague, requires decomposition | Full D.R.P.I.V via `/plan` |

**Autonomy:** proceed without asking when changes are **local + reversible + evidence-supported + within existing architecture**. State assumptions briefly and continue.

**Ask first only for:**
- destructive operations (file deletion, branch deletion, hard reset)
- shared-system or production-impacting config changes
- schema changes with irreversible consequences (drops, type narrowing on populated columns)
- auth, payment, or PII-sensitive changes
- external actions visible to other people (commits, pushes, PRs, messages, deploys)

---

## Routing Matrix

| Task touches | Load these | Then implement in |
|---|---|---|
| New API endpoint | `.claude/rules/backend.md` | `src/pages/api/**/*.ts` (`prerender = false`, `APIRoute`, Zod) |
| Schema / migration | `.claude/rules/database.md` | `supabase/migrations/NNNN_name.sql` + RLS in same or next migration |
| New page / component | `.claude/rules/frontend.md` | `src/pages/**`, `src/components/**`, semantic Tailwind tokens |
| External provider | `.claude/rules/integrations.md` | `src/lib/payments/`, `src/lib/email/`, `src/lib/monitoring/` |
| Webhook | backend + integrations | `src/pages/api/webhooks/*.ts` (idempotent on `payment_events.unique`) |
| Pure styling | frontend | `src/styles/global.css` `@theme` only — no hardcoded hex |
| Anywhere | `.claude/rules/stability.md` | universal checklist |

---

## Sequential Thinking

Invoke `mcp__sequential-thinking__sequentialthinking` **before** acting (not after) when any of these apply:

| Trigger | Example |
|---------|---------|
| Request is L4+ (multi-domain, cross-layer) | Feature touching schema + API + UI |
| Ambiguous requirements with 2+ valid approaches | "improve performance" with no metric |
| Error spans 3+ files or services | Cascade failure after deploy |
| Architecture decision with irreversible consequences | New table, new dependency, auth model change |
| Plan has 3+ sequential phases with dependencies | Sprint with schema → API → UI gates |
| Confidence < 4 on root cause after initial investigation | Bug with no clear reproduction path |

**Never invoke for:** L1-L2 fixes, known patterns, direct style/lint/type changes.

---

## Research Tools

| Question | Tool |
|----------|------|
| Library/framework API, config, version, migration | `mcp__claude_ai_Context7__resolve-library-id` → `mcp__claude_ai_Context7__query-docs` |
| Current best practices, CVEs, ecosystem news, external APIs | `mcp__tavily__search` (add year + version to query) |
| Both needed | Run both in parallel in the same message |

Codebase search (`Grep`/`Read`/`Glob`) is the **fallback for internal questions, never the first step for external knowledge.** Use even for "well-known" libs (Astro, Supabase, Tailwind v4) — training data may be stale.

---

## Stopping Conditions (Hard Limits)

- **Max 3 fix attempts** on the same hypothesis → escalate to `evaluator` (Mode 3: Architecture Analysis)
- **Max 5 agent spawns** per user request → pause and checkpoint with the user
- **Confidence < 3** on a critical finding → flag as assumption and ask the user
- **Scope expands** beyond the original request → STOP and confirm
- **Quality gate fails 2× consecutively** → invoke `/debug recover`

---

## Decision Authority

| Action | Authority |
|--------|-----------|
| L1-L2 fixes, style/lint/type fixes | Autonomous |
| Schema additions, new dependencies, file deletion, auth changes | **Confirm first** |
| Payments, PII, production config, destructive DB operations, deploy to prod | **Always ask** |

---

## Project-Specific Guards

- **Hybrid mode**: every page must declare its render mode. Public pages → `export const prerender = true`. `/admin/**` and `/api/**` → `export const prerender = false`. Never SPA.
- **No emoji / Material Symbols**: use `<Icon name="…" />` (`src/components/ui/Icon.astro`). The mapping table lives in `src/lib/icons.tsx`.
- **Donation totals are derived**: never store, mutate, or display a "collected_amount" column. Always read from `confirmed_amount_by_item` view.
- **Donor PII is private**: any new query that joins `donation_intents` must explicitly drop `donor_email` / `donor_phone` columns or RLS-block the path.
- **Webhook idempotency**: `payment_events` insert uses `on conflict (provider, bank_end_to_end_id) do nothing returning id`. Skip downstream effects when no row returned.
- **Service-role client**: only import `src/lib/supabase/admin.ts` from server-only modules (`/api/**`, middleware, server actions). Never from a `.tsx` client island.

---

## Pointers (Tier 3 — Read on Demand)

- `.claude/rules/{backend,database,frontend,integrations,stability}.md` — domain-scoped Tier 2 rules
- `docs/PROMPT.md` — canonical product spec
- `docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md` — design tokens + brand
- `docs/e-design-execute-o-glowing-crystal.md` — implementation plan
