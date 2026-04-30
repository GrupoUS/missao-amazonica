---
description: Debug workflow with intelligent triage, parallel sub-agent investigation, and unified fix protocol. Modes: debug, super-audit, frontend-debug, backend-debug, auth-db-debug.
workflow_type: routing
---

## Stopping Conditions

- STOP proposing fixes before root cause investigation
- STOP after 3 failed fix attempts → invoke `/recover`
- ASK if error affects production data or requires schema migration
- ASK if fix scope expands beyond the originally reported error

---

# /debug — Efficient Debugging with Intelligent Triage

**ARGUMENTS**: $ARGUMENTS

---

## 0. MODE SELECTION

| Mode | Aliases | When |
|------|---------|------|
| `debug` (default) | — | Bug investigation with root cause analysis |
| `super-audit` | `audit`, `full-audit` | Full-stack 7-dimension audit → use `/audit` |
| `frontend-debug` | `frontend`, `ui`, `react` | React/UI + E2E browser testing → use `/debug-frontend` |
| `backend-debug` | `backend`, `api`, `trpc`, `hono` | Hono/tRPC/service failures |
| `auth-db-debug` | `auth`, `db`, `clerk`, `tenant`, `role`, `permission` | Auth, permissions, tenant isolation |
| `auto` | — | Debug + AutoResearch Loop per `_shared.md` Section 5 |

> **audit:** Execute `/audit` command instead.
> **frontend-debug:** Execute `/debug-frontend` command instead.

---

## IRON LAW

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.
```

If investigation is not complete, you CANNOT propose corrections.

---

## 1. FIRST ACTION: Context + Skill + Gather Errors

### 1.0 Context Load (WISC)

Per `_shared.md` Section 4:
- Bug in `apps/web/` → `/prime-frontend`
- Bug in `apps/api/` → `/prime-backend`
- Multi-layer → `/prime`

```typescript
Skill("debugger"); // 4-phase methodology + Iron Law
```

### Quality Gates (canonical)

Per `_shared.md` Section 1. Also check CI:

```bash
gh run list -L 5
gh run view --log-failed
```

---

## 2. QUICK TRIAGE — Classify Before Investigating

> Rule: Do not spawn parallel agents for trivial bugs. Classify first.

### 2.1 Error Signature Detection

Identify the error CATEGORY in <10 seconds:

| Signature | Category | Layer | Quick Action |
|-----------|----------|-------|--------------|
| `TRPCError` / `INTERNAL_SERVER_ERROR` | Backend procedure | API | Read the cited router |
| `TypeError: Cannot read properties of undefined` | Unguarded access | API/Frontend | Find `[0]` without guard |
| `TS2769` / `TS2345` type error | Type mismatch | Build | Check Zod schema vs DB enum |
| `415 Unsupported Media Type` | tRPC v11 Content-Type | API | Verify Content-Type header |
| `CORS error` / `preflight` | Middleware ordering | _core | CORS must come before auth |
| `hydration mismatch` | SSR/CSR divergence | Frontend | Check useEffect vs render |
| `staleTime`/cache stale | TanStack Query config | Frontend | staleTime MUST = refetchInterval |
| `ERR_MODULE_NOT_FOUND` | Import/export | Build | Check barrel file index.ts |
| `FORBIDDEN` / auth error | Procedure level | API | Check admin vs protected procedure |
| `connection timeout` / `ECONNREFUSED` | Infra/DB | DB | Check DATABASE_URL and pool |

### 2.2 Known Pattern Check

Before investigating, check if the error matches a documented rule:

- Stability rules: `.claude/rules/stability.md` (Checklist A-L)
- Domain rules (Tier 2 — auto-loaded): `backend.md`, `frontend.md`, `database.md`, `integrations.md`
- Recent breaking changes: tRPC 11, Hono middleware ordering, React 19 patterns, Zod 3.x coerce pitfall, Drizzle Neon HTTP vs WebSocket

**If the error matches a known pattern** → apply the documented fix directly (L1-L2), no agents needed.

### 2.3 Complexity Classification

Per `_shared.md` Section 2.

---

## 3. MEMORY (Optional — Does Not Block)

Check for relevant prior bug patterns in auto-memory:
- MEMORY.md is auto-injected into context — review it for similar bugs
- `git log -S "$ARGUMENTS" --oneline -10` as fallback

---

## 4. INVESTIGATION BY COMPLEXITY

### L1-L2: Direct Fix

Read the file with the error → identify root cause → apply minimal fix → run quality gates.

### L3: Single Agent

Spawn 1 `debugger` agent (foreground): investigate root cause, return findings table with file:line. DO NOT FIX — report only.

### L4-L5: Parallel Agents (Default)

Spawn 2-3 agents simultaneously in the same message:

**code-archaeologist** (`explorer`, background):
- Find the exact file:line where the flow breaks
- `git log --oneline -10 -- <affected-files>` for recent regressions
- Map dependency chain (component → procedure → query → table)
- Return Findings Table (# | Finding | Confidence 1-5 | Source | Impact). DO NOT FIX.

**regression-hunter** (`explorer`, background):
- Read `.claude/skills/debugger/references/consolidated-domain-rules.md`
- Check stability rules (A-L) and Common Root Causes Catalog
- Compare with similar working implementations
- If MATCH: return pattern + root cause + fix guidance
- If NO MATCH: top-3 hypotheses with evidence for/against. DO NOT FIX.

**Codex escalation (L4-L5 — when agents return contradictory findings):**
If agents disagree or return no definitive file:line → spawn `codex:codex-rescue` (foreground):
```
Prompt: "Diagnose root cause only — do not apply any fixes.
Context: [paste agent findings table]
Error: [paste exact error]
Focus: [file:line range from investigation]"
```
Codex runs in a separate GPT-5.4 thread with full workspace access. Feed its diagnosis into Section 6.

### L6+: Full Investigation

Same as L4-L5 plus:

**db-state-inspector** (`debugger`, background):
- Read schema for structure
- Check FK indexes, type exports, enum matching
- Verify tenant isolation (entity owner in WHERE clauses)
- Check auth procedure levels (admin vs protected)
- Return problematic tables/queries + diagnostic queries. DO NOT FIX.

### Backend-Debug Mode

Spawn `code-archaeologist` + `regression-hunter` (background) with focus on:
- tRPC procedures, Hono middleware, service layer, Zod schemas

### Auth/DB-Debug Mode

Spawn `code-archaeologist` + `regression-hunter` + `db-state-inspector` (background) with focus on:
- Auth middleware, procedure auth levels, tenant WHERE clauses
- User/role records, FK integrity, tenant boundaries (code-archaeologist + regression-hunter)
- Auth patterns: TOCTOU, owner filter, webhook secret mismatch (regression-hunter)

---

## 5. WHILE AGENTS RUN

Do your own parallel investigation:
1. Read the files cited in the error — the stack trace has the answers
2. Grep for suspicious patterns in the affected scope
3. Compare with similar working implementations
4. Form your own hypothesis

---

## 6. CONSOLIDATE HYPOTHESES

When agents complete:

1. Identify convergence — 2+ agents found the same problem → high confidence
2. Form MAIN HYPOTHESIS with file:line
3. List alternatives in case the main hypothesis fails

```markdown
## Main Hypothesis
[Root cause with file:line]

## Evidence
- Agent 1: [finding]
- Agent 2: [finding]
- Own investigation: [finding]

## Alternative Hypotheses
1. [alternative 1]
2. [alternative 2]
```

---

## 7. IMPLEMENT FIX

### Rules

- Fix the SOURCE, not the symptom
- NEVER "while I'm here..." — scope creep kills debugging
- Run quality gates AFTER EACH fix (per `_shared.md` Section 1)

### Sequential Mode (default — issues in same file/flow)

ONE fix at a time. Never multiple simultaneous changes in the same flow.

```
Edit → Quality Gates → Pass? → Next fix
                      → Fail? → Analyze new error → Back to Triage (Section 2)
```

### Parallel Mode (INDEPENDENT issues in distinct areas)

When investigation confirmed multiple issues with no dependency between them
(e.g., CRM area + financeiro area, or frontend + backend of unrelated flows):

Spawn one `debugger` agent per area — all in one message. Each agent:
- Gets the confirmed root cause (file:line from Section 6)
- Reads target file before editing
- Applies minimal fix
- Runs: `bun run type-check && bun run lint:oxlint:check`
- Reports: file:line edited + gate output

**Parallelization criteria:**

| Criterion | Parallel OK | Sequential required |
|-----------|-------------|---------------------|
| Different files, no cross-imports | YES | — |
| Same router/component | — | YES |
| Frontend + backend of SAME flow | — | YES (backend first) |
| Completely distinct domains | YES | — |
| Schema change + code that uses schema | — | YES (schema first) |

After all parallel fixes: run full gate suite. If gates fail, one fix conflicted — resolve sequentially.

**If 2+ fixes failed in the same area:** Escalate to `codex:rescue` before stopping.
```
Invoke Skill("codex:rescue") with:
  - confirmed root cause (file:line from Section 6)
  - failed fix attempts (what was tried + error output)
  - "provide a complete fix, do not just diagnose"
```
Codex runs in a fresh GPT-5.4 thread with full workspace access. Do not duplicate its work.
If rescue also fails → STOP. Consult evaluator (Mode 3: Architecture Analysis) or escalate to user with full failure log.

---

## 8. CLEANUP

After fixes are validated:

### Post-Fix Code Review (L4+ or non-trivial fixes)

Before closing, verify the changed code meets quality bar:

| Check | Threshold | Action if Failed |
|-------|-----------|-----------------|
| Cyclomatic complexity | No function > 10 branches | Extract sub-functions |
| Security | No injection points, auth gaps, PII exposure introduced | Fix before closing |
| New dependencies | None added without deliberate choice | Audit or remove |
| Dead code | No commented-out blocks introduced | Remove |
| Root cause test | Fix has a regression test | Add test |

For PRs: provide constructive feedback — specific file:line, explain the why, suggest the alternative, acknowledge what was done well. Prioritize: CRITICAL → blocking, MAJOR → address in same PR, MINOR → suggest for follow-up.

- Save learning to auto-memory if the bug revealed a new pattern
- Use `/evolve` to persist root cause, fix, and validation to evolution-core
- Use `/handoff` if session is long — saves state for next session

**Codex adversarial review (auth/payments/PII fixes — L4+):**
After quality gates pass on sensitive fixes, run an independent Codex pass:
```
Invoke Skill("codex:rescue") with:
  "Run codex adversarial-review --scope working-tree.
   Focus: [security / auth / data integrity].
   Report findings only — do not apply fixes."
```
Present findings per `codex:codex-result-handling`: show issues, STOP, ask user which to fix.

---

## 9. Agent/Mode Matrix

| Bug Type | Mode | Sub-agents | Skill |
|----------|------|------------|-------|
| API/tRPC error | `backend-debug` | code-archaeologist + regression-hunter | `debugger` |
| UI/React | `/debug-frontend` | Per that command | `debugger` |
| Auth/permissions | `auth-db-debug` | code-archaeologist + regression-hunter + db-state-inspector | `debugger` |
| Database | `auth-db-debug` | code-archaeologist + db-state-inspector | `debugger` |
| Performance | `debug` | Handoff to performance-optimizer | `performance-optimization` |
| Meta/WhatsApp | `backend-debug` | code-archaeologist + regression-hunter | `meta-api-integration` |
| Baileys | `backend-debug` | code-archaeologist + regression-hunter | `baileys-integration` |
| AI/Gemini | `backend-debug` | code-archaeologist | `google-ai-sdk` |
| Full audit | `/audit` | 4 parallel (evaluator Mode 3/debugger/debugger/frontend-specialist) | all |

---

## 10. Escalation → Stop Signs

**Before stopping, escalate:**
- 2+ failed fixes in the same area → `codex:rescue` (Section 7)
- Contradictory agent findings → `codex:rescue` diagnosis mode (Section 4)
- Architecture-level blocker → `evaluator` (Mode 3: Architecture Analysis)

**STOP if you:**
- Propose a fix before finding root cause
- Make multiple simultaneous changes
- "Just try this and see"
- Skip quality gate verification
- Ignore evidence contradicting your hypothesis
- Have escalated to both codex:rescue AND evaluator (Mode 3) without resolution → escalate to user

---

## 11. Auto Mode

If `auto` in `$ARGUMENTS`: complete debug normally (Sections 1-8), then execute AutoResearch Loop per `_shared.md` Section 5 on skills used in this session.
