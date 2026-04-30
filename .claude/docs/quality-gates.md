# Quality Gates — Definition of Done

> Tier 3 doc. Read on demand before commits, PR creation, or PR merges.
> Authoritative source for the NeonDash DoD checklist.

---

## Pre-Commit (Mandatory)

Run **`bunx biome check --write` on every manually edited file before staging**.
Biome formatter errors are `error` (not `warning`) and break CI immediately on push.

```bash
bunx biome check --write <file> && git add <file>
```

If you forget and CI fails on a bulk format error (typical symptom: hundreds of
formatter errors at once), recover with:

```bash
bunx biome check --write && git add --renormalize .
```

---

## Pre-PR-Merge Checklist

Run all of these before requesting review:

- [ ] `bun run type-check` — no TS errors (uses `tsgo`, ~4s)
- [ ] `bun run lint:oxlint:check` — OXLint passes
- [ ] `bunx biome check` — Biome (format + lint) passes
- [ ] `bun run test` — all tests pass
- [ ] No browser console errors in changed flows (manual or Playwright MCP)
- [ ] Responsive behavior validated for any touched UI surface
- [ ] Dark mode tested (toggle light ↔ dark) for any touched UI surface
- [ ] No hardcoded hex colors — semantic tokens only (`bg-primary`, `text-foreground`,
      `border-border`, etc.)
- [ ] All FK columns have a corresponding index (per `.claude/rules/database.md`)
- [ ] No CRLF line endings — see "Line endings" section below

---

## Toolchain Reference

| Tool | Command | Speed | Purpose |
|------|---------|-------|---------|
| **tsgo** | `bun run type-check` | ~4s full monorepo | Type checking (`@typescript/native-preview`, Go-native) |
| **Biome** | `bunx biome check --write` | ~1s | Format + lint (recommended ruleset) |
| **OXLint** | `bun run lint:oxlint:check` | ~0.1s | Additional Rust-native lint rules |
| **Vitest** | `bun run test` | varies | Unit + integration tests |
| **Drizzle** | `bun run db:push` | varies | Schema propagation to Neon |

> **Forbidden:** `tsc --noEmit`, `bunx tsc`, `bun tsc --noEmit`. All ~75x slower than
> `tsgo` and forbidden by `AGENTS.md § Type checking`. Always use `bun run type-check`.

---

## Line Endings (CRLF Recovery)

This project enforces **LF only** via `.gitattributes`. Windows editors that default to
CRLF can introduce silent breakage that only surfaces on Ubuntu CI as "900+ format
errors at once" — the symptom is overwhelming and looks like a real bug, but it is
purely a line-ending mismatch.

**Recovery:**

```bash
bunx biome check --write && git add --renormalize .
```

**Prevention:** the user's editor must be configured to write LF. Verify with `git
config core.autocrlf input` (Windows) or `false` (Linux/macOS).

---

## Stability Touch Points

When in doubt, also walk the stability checklist from `.claude/rules/stability.md`
(letters A–L). The most commonly missed items in code review:

- **C** — Always guard `.returning()` / `.select()` results against empty arrays before
  destructuring
- **D** — Use the correct procedure level (`adminProcedure`, `mentoradoProcedure`)
  instead of hand-rolling auth checks inside `protectedProcedure`
- **G** — Never use wildcard CORS in production
- **K** — Never use `href="#"` for actions; use `<button>` for actions and real links
  for navigation

---

## Commit Format

Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`,
`perf:`, `style:`, `build:`, `ci:`. Match the verb to the actual change scope —
"add" means a wholly new feature, "update" means an enhancement, "fix" means a bug
fix.

---

## Commit Agent Protocol

Formal ordered sequence invoked when finalizing any change. Each gate runs only if
the previous passed — **never skip gates, never use `--no-verify`**.

1. `bunx biome check --write <edited-files>` — formatter errors are `error`, not warning
2. `bun run type-check` — **must show 0 errors** (tsgo, ~4s)
3. `bun run lint:oxlint:check` — must pass (~0.1s)
4. `bun run test` — Vitest, all tests must pass
5. Grep touched files for hardcoded hex (`#[0-9a-fA-F]{3,8}`) — must be 0 matches in UI code
6. Verify no CRLF line endings (`git ls-files --eol | grep crlf` — must not list touched files)
7. Grep touched production paths for `console.log` / `debugger` — must be 0 matches

### Scopes (for Conventional Commits)

`web`, `api`, `db`, `ai-gateway`, `shared`, `config`, `scripts`.

### On Failure

STOP immediately. Report which gate failed and the exact error output. Do NOT commit.
Fix the underlying issue, re-stage, and **restart from step 1** — never skip gates
or use `--no-verify`. Pre-commit hook failures mean the commit did NOT happen, so
never use `--amend` as a recovery path (it would modify the previous commit).

### After Commit

If this commit completes a tracked phase, update `.claude/docs/progress.md` with the
date and commit SHA.

---

## See also

- `AGENTS.md § Cardinal Rules` — Rule #2 (Always Debug After Changes) is the binding
  rule that this checklist operationalizes.
- `.claude/rules/stability.md` — full stability audit A–L for any `apps/**` change.
- `.claude/docs/scripts-conventions.md` — Python script conventions (separate quality
  surface).
