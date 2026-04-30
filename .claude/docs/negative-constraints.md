# Negative Constraints — Quick Reference

> Tier 3 doc. Consolidated "NEVER do" list.
> Each constraint points to its canonical source — this file is a lookup aid, not a source of truth.
> When guidance overlaps, the canonical source wins.

---

## Design / UI

- **NEVER** use hardcoded hex colors → `AGENTS.md § Project Constraints`, `.claude/rules/frontend.md`
- **NEVER** use purple/violet/indigo gradients → `.claude/docs/design-specs/00-design-system-foundation.md`
- **NEVER** center all text by default → `.claude/docs/design-specs/00-design-system-foundation.md`
- **NEVER** use emoji as design elements → `.claude/docs/design-specs/00-design-system-foundation.md`
- **NEVER** exceed `--text-xl` for body text → `.claude/docs/design-specs/00-design-system-foundation.md`
- **NEVER** place custom product composites in `components/ui/` (shadcn primitives only) → `.claude/rules/frontend.md § Component Placement`

---

## Code Quality

- **NEVER** use `tsc --noEmit` / `bunx tsc` / `bun tsc --noEmit` — use `bun run type-check` (tsgo) → `AGENTS.md § Project Constraints`
- **NEVER** use `npm` / `yarn` / `pnpm` — Bun only → `AGENTS.md § Project Constraints`
- **NEVER** create shell scripts (`.sh`/`.bash`/`.zsh`) — Python 3 stdlib only → `AGENTS.md § Cardinal Rule 3`, `.claude/docs/scripts-conventions.md`
- **NEVER** commit without `bunx biome check --write` on edited files → `.claude/docs/quality-gates.md`
- **NEVER** use `localStorage` / `sessionStorage` → `.claude/rules/frontend.md`
- **NEVER** mark a task done without verification evidence → `AGENTS.md § Cardinal Rule 2`
- **NEVER** use `console.log` / `debugger` in production code → `.claude/rules/stability.md § H`
- **NEVER** use `as any` — narrow types or use `unknown` → `.claude/rules/backend.md § Type Safety`
- **NEVER** use non-null assertion `!` on optional data → `.claude/rules/stability.md § B`
- **NEVER** use `href="#"` for actions — use `<button>` → `.claude/rules/stability.md § K`

---

## Architecture

- **NEVER** create new files when enhancing existing ones suffices → LEVER philosophy, `.claude/docs/design-specs/00-lever-philosophy.md`
- **NEVER** add a dependency without checking monorepo first → `AGENTS.md § Project Constraints`
- **NEVER** bypass the WISC 3-Tier loading protocol → `AGENTS.md § WISC`
- **NEVER** write raw SQL outside Drizzle for schema ops → `.claude/rules/database.md`
- **NEVER** add an FK column without a matching index → `.claude/rules/database.md § Core Rules`, `AGENTS.md § Project Constraints`
- **NEVER** invoke `mcp-server-neon` tools — deactivated, use `neonctl` → `AGENTS.md § Project Constraints`
- **NEVER** use `SELECT *` in Drizzle queries — specify columns explicitly → `.claude/rules/backend.md § Data Access`
- **NEVER** hand-roll auth/admin checks when a narrower procedure exists (`adminProcedure`, `mentoradoProcedure`) → `.claude/rules/backend.md § Procedure Hierarchy`

---

## Agents & Workflows

- **NEVER** spawn >5 sub-agents per user request without a checkpoint → `.claude/CLAUDE.md § Stopping Conditions`
- **NEVER** attempt >3 fixes on the same hypothesis — escalate to evaluator → `.claude/CLAUDE.md § Stopping Conditions`
- **NEVER** stack multi-agent patterns without justification → `.claude/CLAUDE.md § Stopping Conditions`
- **NEVER** commit CRLF line endings → `AGENTS.md § Project Constraints`, `.claude/docs/quality-gates.md § Line Endings`
- **NEVER** skip hooks with `--no-verify` / `--no-gpg-sign` unless the user explicitly asks → `.claude/docs/quality-gates.md`
- **NEVER** use destructive git operations (`reset --hard`, `push --force`, branch deletion) without confirmation → `AGENTS.md § Executing actions with care`
