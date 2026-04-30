---
name: debugger
description: Use for systematic bug diagnosis, failing tests, runtime errors, regressions, frontend or backend debugging, and root-cause verification.
---

# Debugger

Production-grade debugging skill for NeonDash — combines root-cause rigor, parallel sub-agent research, agent-browser CLI evidence, and database validation into a single canonical workflow.

---

## Iron Law

1. **No fix without root cause.** Understand WHY before changing code.
2. **No "fixed" claim without fresh evidence.** Gates must pass, screenshots must confirm.
3. **No scope expansion during incident handling.** Log new issues, fix them later.

---

## When to Use

- Runtime errors, failed tests, unstable UI behavior
- API/procedure failures, auth or permission mismatches
- Tenant isolation or schema consistency doubts
- Broad post-change audit or release hardening checks

Use `performance-optimization` for speed/security/SEO optimization campaigns.

---

## Pack Selector

| Pack | Scope | Browser Evidence | DB Validation | Sub-agents |
|------|-------|:---:|:---:|:---:|
| `frontend-debug` | React/UI regressions, hydration, interaction issues | **YES** | — | 3 parallel |
| `backend-debug` | Hono/tRPC/service failures | — | **YES** | 2 parallel |
| `auth-db-debug` | Clerk/Neon role, tenant, sync drift | — | **YES** | 2 parallel |
| `systematic-audit` | Full cross-layer stability sweep | **YES** | **YES** | 4 parallel |

**Pack selection logic:**
1. If input names a pack explicitly → use it
2. If symptom is visual/UI/React → `frontend-debug`
3. If symptom is 500/procedure/mutation → `backend-debug`
4. If symptom is auth/role/tenant/permissions → `auth-db-debug`
5. If input says "audit" or scope is unclear → `systematic-audit`
6. If ambiguous → ask ONE clarifying question (multiple choice preferred)

---

## Live Docs Lookup (Context7)

When debugging specific library issues, fetch live docs first:
- `drizzle-orm` → resolve library ID, query for `.returning()`, Neon HTTP driver patterns, batch operations
- `@clerk/clerk-react` → resolve for auth middleware, session handling patterns
- `@tanstack/react-query` → resolve for cache invalidation, mutation, `staleTime`/`gcTime` patterns

---

## Phase Overview

- **Phase 0: Pre-flight** — Run `bun run type-check`, `bun run lint:oxlint:check`, `bunx biome check`, `bun run test` as baseline. For `frontend-debug`/`systematic-audit`, also verify `agent-browser --version`. Browser mode selection: see `references/browser-setup.md`.
- **Phase 1: Parallel Research** — Launch all sub-agents simultaneously (background). Templates in `references/subagent-templates.md`. All packs use Code Archaeologist + Regression Hunter. `frontend-debug`/`systematic-audit` add Evidence Collector; `backend-debug`/`auth-db-debug` add DB State Inspector.
- **Phase 2: Hypothesis Selection** — Merge sub-agent findings. Rank by evidence count (2+ sources = HIGH). Document selected hypothesis: statement, evidence, counter-evidence, fix target (file:line).
- **Phase 3: Minimal Fix** — ONE change at a time. Read target file first. Apply smallest possible change. Verify with `bun run type-check`. Revert immediately if new errors appear.
- **Phase 4: Verification Gate** — Run `bun run type-check` → `bun run lint:oxlint:check` → `bun test` → (release only) `bun run build`. ALL must exit 0.
- **Phase 5: Evidence Confirmation** — `frontend-debug`: browser screenshots (headless or CDP). `backend-debug`/`auth-db-debug`: psql validation queries. `systematic-audit`: both. HARD CONSTRAINT: never use `db.transaction()` with Neon HTTP driver.
- **Phase 6: Report** — Structured report with pack, root cause, fix applied, evidence paths, verification exit codes, remaining risks. Offer to save to `debug-reports/YYYY-MM-DD-<slug>.md`.

Pack-specific execution flows and key rules: see `references/pack-guides.md`.

---

## Common Root Causes Catalog

Quick lookup for frequently encountered issues. See `references/consolidated-domain-rules.md` for full patterns.

### Core Patterns

| Symptom | Root Cause | Fix Guidance |
|---------|------------|--------------|
| `Select is changing from uncontrolled to controlled` | `value={undefined}` transitioning to string | Use `value={val ?? ""}` to keep controlled |
| `No transactions support in neon-http driver` | HTTP driver doesn't support `db.transaction()` | Use `db.batch()` or sequential `await` |
| `Cannot read properties of undefined` after insert | `.returning()[0]` on empty array | Guard: `if (!inserted) throw new TRPCError(...)` |
| HTTP 500 on mutation with transaction | Neon HTTP driver + `db.transaction()` | Same as above — use batch/sequential |
| Incorrect ROAS/revenue in aggregated metrics | Using `conversions` (count) instead of `conversionValue` (money) | Use `conversionValue` for monetary calculations |
| Wrong cost per conversion in combined metrics | Dividing one platform's ratio by combined totals | Recalculate from raw values per platform |

### NeonDash-Specific Anti-Patterns

| Symptom | Root Cause | Fix Guidance |
|---------|------------|--------------|
| `Cannot find module '@/...'` after route refactor | tsconfig paths not updated after file move | Update `tsconfig.json` paths + restart TS server |
| Clerk `auth()` returns null in tRPC context | Middleware matcher not covering the route | Add route to Clerk middleware matcher in `middleware.ts` |
| `drizzle-zod` type mismatch on insert | `createInsertSchema` not re-run after schema change | Re-run `bun run db:push` + regenerate Zod schemas |
| tRPC `UNAUTHORIZED` on valid session | `protectedProcedure` context not forwarding `userId` | Check `context.ts:resolveMentoradoForUser` chain |
| Webhook 400 from Clerk | `CLERK_WEBHOOK_SECRET` env mismatch | Compare `.env` local vs production env vars |
| UPDATE without `mentoradoId` filter | TOCTOU ownership gap — any user can modify any resource | Add `eq(table.mentoradoId, ctx.mentorado.id)` to WHERE |
| Cache stale after sync mutation | Only invalidating `getById`, not `list` query | Invalidate BOTH `getById` + `list` + related queries |
| `useMutation` in `useEffect` dep → loading stuck | Mutation changes reference on `isPending` toggle | Use `useRef(mutation.mutateAsync)` pattern |
| Meta OAuth double dialog | `fallback_redirect_uri` + manual redirect race | Remove `fallback_redirect_uri` from `FB.login()` |
| SSE listener leak in notification stream | `addEventListener("abort")` inside while loop | Move listener OUTSIDE loop, cleanup in `finally` |
| `db.transaction()` pends forever on Neon | HTTP driver silently fails transactions | Replace with sequential `await` or `db.batch()` |
| CI `lint:check` fails with 935 Biome format errors on Ubuntu | Windows `core.autocrlf=true` commits CRLF; no `.gitattributes` to enforce LF | `bunx biome check --write` + `git add --renormalize .` + add `.gitattributes` with `* text=auto eol=lf` |
| Biome `$schema` version mismatch warning (e.g. `2.4.0` vs `2.4.10`) | Biome upgraded without running `biome migrate` | `bunx biome check --write` auto-migrates schema refs — no manual edit needed |
| `.returning()` guard never fires even on empty result | Checking `if (!rows)` against raw array — empty `[]` is truthy | Always destructure: `const [row] = await ...returning()` then `if (!row) throw new TRPCError(...)` |

---

## Escalation Rule

- **1-2 fix attempts fail** → restart investigation from Phase 1 with fresh hypothesis
- **3 fix attempts fail** → STOP. Challenge architecture assumptions:
  - Is the design fundamentally flawed?
  - Is the symptom a consequence of a deeper structural issue?
  - Should this be escalated to the `evaluator` (Mode 3: Architecture Analysis) for architectural consultation?

---

## NEVER Constraints

> These constraints are absolute. Violating any of them invalidates the debug session.

1. **NEVER** skip pre-flight checks (Phase 0)
2. **NEVER** run `db.transaction()` with the Neon HTTP driver
3. **NEVER** claim "fixed" before ALL verification gate commands pass AND evidence is captured
4. **NEVER** expand scope during an active debug session — log new issues for later
5. **NEVER** take more than 3 fix attempts on the same hypothesis before escalating
6. **NEVER** hallucinate file paths — always `Read` the actual file before referencing line numbers
7. **NEVER** interact with browser elements without calling `browser_snapshot` first (refs invalidate)
8. **NEVER** leave `console.log` or `debugger` statements in production code after fixing
9. **NEVER** use `as any` to silence type errors introduced by a fix — find the real type

---

## References

| File | Content |
|------|---------|
| `references/browser-setup.md` | Browser mode selection table, Option A (Chrome extension) + Option B (cdp.py) with full commands and key constraints |
| `references/subagent-templates.md` | Full TypeScript prompt templates for all 4 Phase 1 sub-agents (Evidence Collector, Code Archaeologist, Regression Hunter, DB State Inspector) |
| `references/pack-guides.md` | Pack-specific execution flows 8a-8d with key rules and common patterns for each pack |
| `references/methodology.md` | Full 4-phase debugging method, debiasing techniques, 5-step backward trace, git bisect protocol, 5 Whys + Debug Report templates |
| `references/verification.md` | Defense-in-depth (4 layers), regression prevention matrix, fix verification criteria, L6+ postmortem template |
| `references/patterns.md` | Async testing with `waitFor`, testing pyramid, security checklist (OWASP 2025) |
| `references/consolidated-domain-rules.md` | Merged frontend/backend/auth/audit playbook with detailed bug patterns |
| `../../scripts/cdp.py` | Primary CDP tool — controls Chrome via Node.js CDP client (navigate, screenshot, analyze, eval, info, cookies) |
| `../../scripts/cdp-tool.js` | Node.js CDP client used by `cdp.py` |
| `../../scripts/launch_chrome_debug.py` | Launches Chrome with `--remote-debugging-port=9222` (Windows native) |
