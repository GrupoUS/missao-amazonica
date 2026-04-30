---
description: "Post-implementation verification gate. Runs gates → /debug → /perf → E2E browser → spec → /codex:review → /codex:adversarial-review → evaluator Mode 3 → report → /evolve. Modes: full (default), quick, spec-only, paranoid. Use after closing any implementation task."
workflow_type: prompt-chaining
---

## Stopping Conditions

- STOP if Phase 0 gates fail → fix gates first, do not proceed to later phases
- STOP after `/debug` returns unresolved findings → invoke `/recover`
- STOP after `/perf` regresses past WARN threshold → invoke `/recover`
- STOP if Phase 3.5 E2E browser test surfaces JS console errors or critical network failures → invoke `/debug-frontend`
- STOP if Phase 5 `/codex:review` returns P0/P1 findings → present to user via `codex:codex-result-handling`, ask which to fix before proceeding
- STOP if Phase 6 `/codex:adversarial-review` returns P0/P1 design challenges → present, ask user before Phase 7
- STOP if Phase 7 `evaluator` Mode 3 returns `REVISION_REQUIRED` → invoke `/recover`
- STOP and ASK user if Phase 1 cannot locate a plan file and no `$ARGUMENTS` given
- STOP after 2 consecutive verify failures on same diff → reactive escalation to `evaluator` Mode 3 (preserves prior behavior; Phase 7 proactive should usually catch first)
- STOP if scope drift introduces auth, payment, PII, or schema changes not in the plan → confirm with user before marking VERIFIED
- Phase 9 `/evolve` only runs if final verdict is `VERIFIED` or `VERIFIED-WITH-NOTES` (skip on `NEEDS-WORK`/`FAILED`)

---

# /verify — Post-Implementation Verification Gate

**ARGUMENTS**: $ARGUMENTS

> Sequential verification pipeline. Each phase gates the next. Failure escalates per `_shared.md` and `debug.md` Section 10.

---

## 0. MODE SELECTION

| Mode | Aliases | When |
|------|---------|------|
| `full` (default) | — | All 10 phases — proactive Codex review + adversarial + evaluator Mode 3 + E2E (if UI) + evolve. Smart gating skips irrelevant phases by touched-surface signals. |
| `quick` | `q`, `fast` | Skip Phases 3, 3.5, 5, 6, 7, 9 — fast iteration loop (gates + /debug + spec only) |
| `spec-only` | `spec`, `compliance` | Phase 1 + Phase 4 + Phase 5 (codex review) — plan compliance + read-only review, no /debug, no /perf |
| `paranoid` | `release`, `pre-pr` | Force ALL 10 phases on regardless of touched surface (E2E + adversarial + evaluator + evolve always run) |

`$ARGUMENTS` also accepts:

| Arg shape | Meaning |
|-----------|---------|
| `<path>` ending in `.md` | Use that file as the plan |
| `latest` | Pick newest `.md` under `docs/` (default if no arg) |
| `quick` / `q` / `fast` | Mode override |
| `spec-only` / `spec` / `compliance` | Mode override |
| `paranoid` / `release` / `pre-pr` | Mode override |
| `+codex` | Force Phase 5 even in `quick` |
| `+adversarial` | Force Phase 6 even in `quick`/`spec-only` |
| `+evaluator` | Force Phase 7 even in `quick`/`spec-only` |
| `+e2e` | Force Phase 3.5 even when no `apps/web/**` change detected |
| `--no-evolve` | Skip Phase 9 (override default in `full`/`paranoid`) |

If both a path and a mode are given, both apply (e.g., `/verify docs/foo.md quick +codex`).

---

## IRON LAW

```
NO "VERIFIED" VERDICT WITHOUT EVIDENCE FOR EVERY PHASE THAT RAN.
SCOPE DRIFT MUST BE REPORTED, NOT HIDDEN.
PHASE 9 (/evolve) NEVER RUNS ON NEEDS-WORK / FAILED.
```

If any phase did not produce a checkable artifact when it was supposed to run, the verdict is `NEEDS-WORK` — never assume green.

---

## 1. FIRST ACTION: Context + Skills + Gates

### 1.0 Context Load (WISC)

Per `_shared.md` Section 4. Auto-detect from changed file paths:
- `apps/web/**` only → `/prime-frontend`
- `apps/api/**` only → `/prime-backend`
- Multi-layer → `/prime`

```typescript
Skill("debugger");          // for Phase 2
Skill("evolve");            // for Phase 9
// Phases 5 + 6 use the codex-plugin-cc slash commands directly (`/codex:review`,
// `/codex:adversarial-review`). Do NOT preload `Skill("codex:rescue")` from
// /verify — that path forces routing through the `codex:codex-rescue` subagent
// and the slash commands already do the right thing on their own.
```

### 1.1 Quality Gates (canonical)

Per `_shared.md` Section 1.

```bash
bun run type-check 2>&1 | tail -30
bun run lint:oxlint:check 2>&1 | tail -20
```

**These are Phase 0.** Failure here blocks all further phases.

---

## 2. PHASE 0 — Context + Gates Baseline

| Check | Command | Pass condition |
|-------|---------|----------------|
| TypeScript | `bun run type-check` | exit 0, 0 errors |
| Lint | `bun run lint:oxlint:check` | exit 0 |
| Biome (touched files) | `bunx biome check <touched-files>` | exit 0 |

If FAIL → STOP. Surface the exact error. Do NOT continue. Suggest the user fix gates first.

In `spec-only` mode, skip this entire phase.

---

## 3. PHASE 1 — Resolve Inputs

### 3.1 Locate the plan

```bash
# Explicit arg path
test -f "$ARG_PATH" && PLAN="$ARG_PATH"

# Or "latest" → newest plan-style file under docs/
[ -z "$PLAN" ] && PLAN=$(ls -t docs/*.md 2>/dev/null | head -1)
```

If still no plan → ASK the user (do not silently fall back to prompt-only). Per Stopping Conditions.

### 3.2 Extract requirements

Read the plan file. Pull:
- **Context** section — what problem is being solved
- **Approach / Critical Files** — what was supposed to change
- **Verification** section — how the change should be tested
- Any explicit acceptance criteria, checklists, or numbered requirements

Read the **original user prompt** from the current conversation. Combine with plan extracts to build the compliance checklist:

```
[ ] R1 — <requirement, paraphrased exactly from source>
[ ] R2 — ...
```

### 3.3 Enumerate actual changes + risk signals

```bash
git diff main...HEAD --stat
git log main..HEAD --oneline
git diff main...HEAD --name-only

# Risk signals — feed Phase 3.5 / 6 / 7 routing
TOUCHED_WEB=$(git diff main...HEAD --name-only | grep -c '^apps/web/' || echo 0)
TOUCHED_API=$(git diff main...HEAD --name-only | grep -c '^apps/api/src/' || echo 0)
TOUCHED_SCHEMA=$(git diff main...HEAD --name-only | grep -c '^apps/api/drizzle/' || echo 0)
TOUCHED_AUTH=$(git diff main...HEAD --name-only | grep -E '(auth|clerk|session|webhook)' | wc -l)
TOUCHED_PAYMENT=$(git diff main...HEAD --name-only | grep -E '(stripe|asaas|kiwify|hubla|billing)' | wc -l)
TOTAL_LINES=$(git diff main...HEAD --stat | tail -1 | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo 0)
TOTAL_FILES=$(git diff main...HEAD --name-only | wc -l)
```

Cache the file list and counters — used by Phases 2, 3, 3.5, 4, 6, 7 for routing and evidence-gathering.

---

## 4. PHASE 2 — /debug (sequential)

> Skip in `spec-only` mode.

**Agent:** `debugger` (canonical: `.claude/agents/debugger.md`, `model: opus`, `role_type: worker`).
**Skill:** `debugger` (loaded in 1.0). `/debug` itself spawns the `debugger` agent — do not double-spawn from here.

Auto-pick the `/debug` mode based on changed file paths (per `debug.md` Section 0):

| Changed surface | Mode | Agent path |
|-----------------|------|------------|
| `apps/web/**` only | `/debug-frontend` | `debugger` (foreground, write-capable) |
| `apps/api/**` (no schema) | `backend-debug` | `debugger` (foreground) |
| `apps/api/drizzle/**`, auth, tenant | `auth-db-debug` | `debugger` + `db-state-inspector` (per debug.md L6+) |
| Mixed | default `debug` | per `debug.md § 4` complexity routing |

Run the command **inline in this session** — do not background. Block until it returns. Agent foreground because `debugger` writes fixes (per `_shared.md § 3`).

### Pass condition

- All Quality Gates re-run by `/debug` are green
- No unresolved findings in the `/debug` Findings Table
- All fixes applied during `/debug` themselves passed gates

### Fail handling

If `/debug` reports unresolved root cause OR applied fixes failed gates 2× → STOP → invoke `/recover` per `debug.md` Section 10. Do NOT proceed.

Capture for the report:
- Mode used
- Fixes applied (if any), with file:line
- Final gate output

---

## 5. PHASE 3 — /perf (sequential)

> Skip in `spec-only` and `quick` modes.

**Agent:** `performance-optimizer` (canonical: `.claude/agents/performance-optimizer.md`, `model: opus`, `role_type: worker`).
**Skill:** `performance-optimization`. `/perf` spawns one `performance-optimizer` agent per failing route (per `perf.md § FIX`) — do not double-spawn from here. Agent runs foreground (write-capable for auto-fixes; uses `isolation: "worktree"` per `perf.md`).

Auto-pick `/perf` mode by changed surface:

| Changed surface | `/perf` mode | Threshold |
|-----------------|--------------|-----------|
| Frontend route under `apps/web/src/routes/**` | runtime PSI on staging URL | Performance ≥ 90 |
| Backend / Drizzle queries | `db` (N+1, FK index, SELECT *) | No new N+1, no missing FK index, no new SELECT * |
| `vite.config.ts`, `package.json` deps, `tsconfig.json` | `build` | Build time ≤ baseline + 10%, total JS ≤ baseline |
| Mixed | runtime + db | Both must pass |

### Thresholds (from `perf.md`)

```yaml
performance:    pass: 90, warn: 50
accessibility:  pass: 90, warn: 70
best-practices: pass: 90, warn: 70
seo:            pass: 95, warn: 80
CWV:            LCP 2.5s | FCP 1.8s | CLS 0.1 | TBT 200ms
```

### Fail handling

Score below WARN OR new N+1 introduced OR FK index missing → STOP → invoke `/recover`.

Score in WARN band → record as `WARN` and continue, but flag in the final report.

---

## 6. PHASE 3.5 — E2E browser (verification-agent)

> Skip in `quick` and `spec-only` modes.
> In `full`: only when `TOUCHED_WEB > 0` (or `+e2e` flag passed).
> In `paranoid`: always run.

**Agent:** `verification-agent` (canonical: `.claude/agents/verification-agent.md`).
**Tools:** Playwright MCP (`browser_navigate`, `browser_snapshot`, `browser_console_messages`, `browser_network_requests`, `browser_take_screenshot`, `browser_click`, `browser_fill_form`).
**Foreground.** Block until returns.

### Invocation pattern

```typescript
Agent({
  description: "E2E verify on staging",
  subagent_type: "verification-agent",
  prompt: `Verify the user flow affected by the diff on https://staging.neondash.com.br.

Diff summary: <N files in apps/web/, key routes from Phase 1.3>
Plan acceptance criteria: <copy from Phase 1.2 checklist>

For each affected route:
1. Navigate to the route
2. Capture browser_snapshot + browser_take_screenshot
3. Capture browser_console_messages — flag any error/warning
4. Capture browser_network_requests — flag any 4xx/5xx on tRPC/XHR
5. Run the golden-path interaction described in the plan
6. Run one realistic edge case (empty state, permission denial, network slow)

Return: PASS/FAIL per route + screenshot path + console.errors[] + network.failures[]. Under 800 tokens.`
});
```

### Pass condition

- No JS console errors
- No 4xx/5xx on critical XHR / tRPC calls
- Screenshot matches expected layout (no broken design tokens, no missing dark-mode variants)

### Fail handling

JS console error OR critical network failure → STOP → invoke `/debug-frontend` with captured evidence (screenshot, console output, network log). Do NOT proceed to Phase 4.

---

## 7. PHASE 4 — Spec Compliance + Scope Drift

Walk the compliance checklist from Phase 1.3. For each requirement, search the diff for evidence:

```bash
git diff main...HEAD -- <plan-cited-file> | grep -n "<expected-symbol>"
```

Mark each:

| Symbol | Meaning |
|--------|---------|
| ☑ | Implemented — evidence at `path:line` |
| ☐ MISSING | No evidence in diff — requirement not met |
| ⚠ PARTIAL | Some evidence but not complete |

### Plan-Verification cross-check

If the plan file has a `## Verification` section listing test steps, walk each step. Mark whether it was actually executable (file exists, command runs) — flag any that reference files/commands that don't exist post-diff.

### Scope drift detection

```
DRIFT = files in `git diff --name-only` NOT cited in plan AND NOT cited in original prompt
```

Classify drift risk:

```
SET DRIFT_RISK =
  "auth"    if any drift file matches /(auth|clerk|session|webhook)/
  "payment" if matches /(stripe|asaas|kiwify|hubla|billing)/
  "PII"     if matches /(pacientes|users|leads|mentorados).*\.ts/ AND new fields added
  "schema"  if any drift file under apps/api/drizzle/
  "env"     if any drift file matches /\.env|env\.ts|config\.ts/
  "ci"      if any drift file under .github/workflows/
  "none"    otherwise
```

`DRIFT_RISK ≠ none` feeds Phase 6 (focus) and Phase 7 (gating). Surface drift in the report regardless of risk level. If drift includes any of: schema, auth, payment/billing, env, CI configs → escalate per Stopping Conditions (confirm with user before VERIFIED).

---

## 8. PHASE 5 — /codex:review

> Skip in `quick` mode (override with `+codex`).
> In `spec-only`: run.
> In `full` / `paranoid`: always run.

**Runtime:** codex-plugin-cc slash command `/codex:review` (calls
`node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" review …` under the
hood). Do **not** spawn the `codex:codex-rescue` subagent or load
`Skill("codex:rescue")` from /verify — both routes hit the task-routing guard
and the slash command already does the right thing.

### Pattern

```bash
# Background by default — non-blocking. Result picked up before Phase 8 report.
/codex:review --base main --background
# Capture session ID for later /codex:result lookup
```

In `full` mode, allow Phase 6 + Phase 7 to run while Codex review is in flight. Collect result via `/codex:result <session-id>` before Phase 8 synthesis.

### Direct-Bash fallback (when slash command is unavailable)

If the Codex plugin slash command does not register (corporate sandbox, plugin
not loaded, …), invoke the companion script directly:

```bash
# Discover plugin root (version-agnostic)
PLUGIN_ROOT=$(ls -dt "$HOME/.claude/plugins/cache/openai-codex/codex/"*/ 2>/dev/null | head -1)
node "${PLUGIN_ROOT}scripts/codex-companion.mjs" review --base main --background
```

### Windows pwsh sandbox quirk (Codex 0.125+)

On Windows, Codex's sandbox shells through MS-Store `pwsh.exe` and intermittently
returns `exit -1` for routine command lookups. The companion still produces a
useful review by reasoning over the prompt text, but **file-grounded checks
fail silently**. Mitigation: when invoking review/adversarial review from
/verify on Windows, always pre-paste the relevant diff hunks or file excerpts
into the focus text so Codex does not have to shell out to inspect them.

### Findings classification

| Severity Codex | Internal mapping | Verdict effect |
|----------------|------------------|----------------|
| P0 (critical) | `NEEDS-WORK` | STOP, ask user which to fix |
| P1 (important) | `NEEDS-WORK` | STOP, ask user |
| P2 (moderate) | `VERIFIED-WITH-NOTES` | Continue, log in report |
| P3 (minor) | `VERIFIED-WITH-NOTES` | Continue, log in report |
| no findings | `VERIFIED` | Continue clean |

Present findings via protocol `codex:codex-result-handling` — do NOT auto-fix. User decides scope of remediation.

---

## 9. PHASE 6 — /codex:adversarial-review

> Skip in `quick` and `spec-only` (override with `+adversarial`).
> In `full` / `paranoid`: always run.

**Runtime:** codex-plugin-cc slash command `/codex:adversarial-review`. Same
direct-Bash fallback and Windows-pwsh quirk as Phase 5 — see Phase 5 for the
fallback snippet and the mitigation rule (always pre-paste relevant diff/file
text into the focus argument so file-grounded checks survive a sandbox shell
failure).

### Focus calculation

Use `DRIFT_RISK` from Phase 4 + risk signals from Phase 1.3:

| Signal | Focus text |
|--------|-----------|
| `DRIFT_RISK = auth` OR `TOUCHED_AUTH > 0` | "security boundary, token lifecycle, session invalidation, data leakage paths" |
| `DRIFT_RISK = payment` OR `TOUCHED_PAYMENT > 0` | "idempotency, webhook replay, double-charge race, refund correctness" |
| `DRIFT_RISK = PII` | "data exposure, query scope, response shape leakage, log redaction" |
| `DRIFT_RISK = schema` OR `TOUCHED_SCHEMA > 0` | "data migration safety, FK invariants, soft-delete consistency, NOT NULL backfill" |
| `DRIFT_RISK = env` OR `ci` | "secret exposure, build determinism, deploy reproducibility" |
| else | "design tradeoffs, alternative approaches, failure modes, race conditions" |

### Pattern

```bash
/codex:adversarial-review --scope working-tree --background "Focus: <focus_text>. Question the chosen implementation. Surface failure modes, race conditions, alternative simpler approaches. Report findings only — do not apply fixes."
```

Reuses the template validated in `.claude/commands/audit.md § 6`.

### Pass condition

Zero P0/P1 design challenges, OR all P0/P1 challenges acknowledged by user as accepted tradeoff.

### Fail handling

P0/P1 challenge → STOP → present full Codex output via `codex:codex-result-handling` → ask user before Phase 7. **NEVER auto-fix from adversarial review** — adversarial output is meant to question decisions, not generate code.

---

## 10. PHASE 7 — evaluator Mode 3 (proactive)

> Skip in `quick` and `spec-only` (override with `+evaluator`).
> In `full`: gated by triggers below.
> In `paranoid`: always run.

### Triggers in `full` mode (any of)

- `TOUCHED_SCHEMA > 0` (any drizzle change)
- `TOUCHED_AUTH > 0`
- `TOUCHED_PAYMENT > 0`
- `DRIFT_RISK ≠ none`
- Phase 5 OR Phase 6 returned P0/P1 findings AND user said "continue"
- `TOTAL_LINES > 500` OR `TOTAL_FILES > 15`

If none of the above, skip Phase 7 in `full` mode.

**Agent:** `evaluator` (canonical: `.claude/agents/evaluator.md`), Mode 3.
**Foreground.** Analysis blocks verdict per `evaluator.md` Stopping Conditions line 26.
**No file writes** (Mode 3 hard constraint).

### Invocation pattern

```typescript
Agent({
  description: "Pre-verdict architecture analysis",
  subagent_type: "evaluator",
  prompt: `Mode 3: Architecture Analysis (proactive pre-verdict consultation).

Diff summary: <Phase 1.3 stat output>
Plan: <plan path or "none">
Risk signals: schema=<bool>, auth=<bool>, payment=<bool>, drift=<DRIFT_RISK>

Codex review findings (Phase 5): <P0/P1/P2 list or "clean">
Codex adversarial findings (Phase 6): <P0/P1 list or "clean">

Tasks:
1. Frame the architectural problem this diff solves (1 paragraph)
2. List 2 alternative approaches that were not taken
3. Multi-lens evaluation (technical / economic / human / systemic / temporal)
4. Adversarial inversion: "what would make this diff a regression in 6mo?"
5. Second-order effects (6mo / 2yr / 10yr)
6. Confidence calibration on the chosen approach
7. Synthesis: APPROVED / REVISION_REQUIRED + 1-line reason

Hard constraint: analysis only, no file writes, no code generation. Under 300 tokens.`
});
```

### Pass condition

`APPROVED` verdict from evaluator.

### Fail handling

`REVISION_REQUIRED` → STOP → invoke `/recover` (which itself loops back to evaluator with full failure report).

---

## 11. PHASE 8 — Verification Report + Verdict

Produce one consolidated report:

```markdown
## /verify Report — <YYYY-MM-DD HH:MM>

### Inputs
- Plan: <path | "(none — prompt only)">
- Original ask: <one-line summary>
- Diff: <N files, +X / -Y lines>
- Mode: full | quick | spec-only | paranoid
- Risk signals: schema=<bool> auth=<bool> payment=<bool> drift=<DRIFT_RISK>

### Phase 0 — Gates
- type-check / lint / biome: PASS / FAIL each

### Phase 2 — /debug
- Mode: <debug | debug-frontend | backend-debug | auth-db-debug | SKIPPED>
- Fixes applied: <count> @ <files>
- Findings open: <count>
- Status: PASS / FAIL / SKIPPED

### Phase 3 — /perf
- Mode: <runtime | db | build | mixed | SKIPPED>
- Scores: Perf XX | A11y XX | BP XX | SEO XX
- CWV: LCP X.Xs | CLS X.XX | TBT Xms | INP Xms
- DB: N+1 <none|found> | FK index gaps <count> | SELECT * <count>
- Status: PASS / WARN / FAIL / SKIPPED

### Phase 3.5 — E2E browser (verification-agent)
- Routes tested: <N>
- Console errors: <count>
- Network failures: <count>
- Screenshots: <paths>
- Status: PASS / FAIL / SKIPPED

### Phase 4 — Spec Compliance
| # | Requirement | Status | Evidence |
|---|-------------|--------|----------|
| 1 | <text>      | ☑      | path:line |
| 2 | <text>      | ☐ MISSING | <reason> |
| 3 | <text>      | ⚠ PARTIAL | <gap> |

- Scope drift: <list of drifted files | "(none)">
- DRIFT_RISK: <auth | payment | PII | schema | env | ci | none>

### Phase 5 — /codex:review
- Findings: P0=<n> P1=<n> P2=<n> P3=<n>
- Session ID: <id>
- Status: PASS / WITH-NOTES / FAIL / SKIPPED

### Phase 6 — /codex:adversarial-review
- Focus: <focus_text>
- P0/P1 challenges: <count + 1-line summaries>
- Session ID: <id>
- Status: PASS / FAIL / SKIPPED

### Phase 7 — evaluator Mode 3
- Triggers fired: <list of trigger names>
- Verdict: APPROVED / REVISION_REQUIRED / SKIPPED
- Key finding: <one-liner>

### Verdict
**VERIFIED** | **VERIFIED-WITH-NOTES** | **NEEDS-WORK** | **FAILED**

### Notes (only if VERIFIED-WITH-NOTES)
- <Codex P2/P3 finding summary>
- <perf WARN band note, if any>
- <evaluator caveat, if any>

### Next
- (NEEDS-WORK) Address: R2, R3, Codex P0/P1 findings — see tables above
- (FAILED) `/recover` invoked — see attached failure report
- (VERIFIED / VERIFIED-WITH-NOTES) Phase 9 (/evolve) running. Pre-commit reminder: `bunx biome check --write <files>`
```

### Verdict matrix

| Phase 0 | 2 | 3 | 3.5 | 4 | 5 | 6 | 7 | Verdict |
|---------|---|---|-----|---|---|---|---|---------|
| PASS | PASS | PASS | PASS/SKIP | All ☑ | clean OR P3 | clean | APPROVED/SKIP | **VERIFIED** |
| PASS | PASS | WARN | PASS/SKIP | All ☑ | P2/P3 only | clean | APPROVED/SKIP | **VERIFIED-WITH-NOTES** |
| PASS | PASS | PASS | PASS/SKIP | Any ☐/⚠ | — | — | — | **NEEDS-WORK** |
| PASS | PASS | PASS | PASS/SKIP | All ☑ | P0/P1 | — | — | **NEEDS-WORK** |
| PASS | PASS | PASS | PASS/SKIP | All ☑ | — | P0/P1 | — | **NEEDS-WORK** |
| PASS | PASS | PASS | PASS/SKIP | All ☑ | — | — | REVISION_REQUIRED | **NEEDS-WORK** |
| PASS | PASS | PASS | FAIL | — | — | — | — | **FAILED** → /debug-frontend |
| Any FAIL | — | — | — | — | — | — | — | **FAILED** → /recover |

---

## 12. PHASE 9 — /evolve (learnings capture)

> Run only if verdict ∈ {`VERIFIED`, `VERIFIED-WITH-NOTES`}.
> Skip if `--no-evolve` arg passed.
> Skip in `quick` and `spec-only` (no learning-worthy artifact in those modes).

**Skill:** `evolve` (loaded in 1.0).

### Pattern

```typescript
Skill("evolve");
// Then invoke /evolve with the verify report as input
```

`/evolve` orchestrates:
- Captures new patterns from the diff (reusable components, helpers introduced)
- Updates `.claude/docs/design-specs/00-frontend-learnings.md` if a UI bug pattern was detected
- Updates `.claude/docs/architecture/13-backend-learnings.md` if a backend bug pattern was detected
- Updates `.claude/docs/db-learnings.md` if a DB pattern was detected
- Updates `MEMORY.md` if the pattern is cross-session relevant
- **Does NOT modify `AGENTS.md`** without explicit user approval

### Output

List of files updated + 1-line summary per update. Surface in chat — do not silently mutate documentation.

---

## 13. Escalation Map

| Condition | Action |
|-----------|--------|
| Phase 0 gates fail | STOP, surface error, do not run later phases |
| Phase 2 `/debug` unresolved or 2× fix fail | `/recover` (per `debug.md` Section 10) |
| Phase 3 `/perf` below WARN, new N+1, FK index missing | `/recover` |
| Phase 3.5 E2E fail (console errors / network failures) | STOP, invoke `/debug-frontend` |
| Phase 5 codex P0/P1 | STOP, ask user which to fix |
| Phase 6 adversarial P0/P1 | STOP, present, ask user before Phase 7 |
| Phase 7 evaluator REVISION_REQUIRED | `/recover` |
| 2 consecutive `/verify` runs return FAILED on same diff | `evaluator` Mode 3 reactive (preserves prior safety net) |
| Scope drift in auth / payment / PII / schema / env / ci | Already covered by Phase 7 trigger automatic in `full`; in `quick`/`spec-only`, ASK user before final verdict |
| No plan and no `$ARGUMENTS` | ASK user — do not auto-run |

---

## 14. Mode Behavior Matrix

| Mode | 0 | 1 | 2 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8 | 9 |
|------|---|---|---|---|-----|---|---|---|---|---|---|
| `full` | YES | YES | YES | YES | IF UI | YES | YES | YES | IF risk | YES | IF VERIFIED |
| `quick` | YES | YES | YES | SKIP | SKIP | YES | SKIP\* | SKIP\* | SKIP\* | YES | SKIP |
| `spec-only` | SKIP | YES | SKIP | SKIP | SKIP | YES | YES | SKIP | SKIP | YES | SKIP |
| `paranoid` | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES |

\* `+codex` / `+adversarial` / `+evaluator` / `+e2e` flags override the SKIP.

---

## 15. Agent / Skill Matrix

Canonical references — keep this table consistent with `_shared.md § 3` and `debug.md § 9`.

| Phase | Agent (canonical file) | Skill | How invoked | Foreground/Background |
|-------|------------------------|-------|-------------|-----------------------|
| 0 — Gates | none (direct Bash) | — | shell only | — |
| 1 — Resolve Inputs | none (direct Read/Grep) | — | tools only | — |
| 2 — `/debug` | `debugger` (`.claude/agents/debugger.md`) | `debugger` | via `/debug` command — `/debug` spawns the agent per `debug.md § 4` | foreground (write-capable) |
| 2 (sub-agents inside `/debug`) | `code-archaeologist` + `regression-hunter` (subagent_type `explorer`); `db-state-inspector` (subagent_type `debugger`) | — | `/debug` handles internally | `explorer` agents background (mandatory per `_shared.md § 3`) |
| 3 — `/perf` | `performance-optimizer` (`.claude/agents/performance-optimizer.md`) | `performance-optimization` | via `/perf` command — spawns one agent per failing route using `isolation: "worktree"` | foreground (write-capable) |
| **3.5 — E2E browser** | `verification-agent` (`.claude/agents/verification-agent.md`) | — (Playwright MCP tools) | direct `Agent({ subagent_type: "verification-agent" })` from `/verify` | foreground (must capture evidence inline) |
| 4 — Spec Compliance | none (direct Read/Grep on diff) | — | tools only | — |
| **5 — `/codex:review`** | none (slash → codex-plugin-cc runtime, raw `node codex-companion.mjs review …` under the hood) | — (do NOT preload `codex:rescue` from /verify) | slash command `/codex:review --base main --background`, fallback: direct Bash to `codex-companion.mjs` | background, collected via `/codex:result` before Phase 8 |
| **6 — `/codex:adversarial-review`** | none (slash → codex-plugin-cc runtime) | — (do NOT preload `codex:rescue` from /verify) | slash command `/codex:adversarial-review --scope working-tree --background "Focus: …"`, fallback: direct Bash to `codex-companion.mjs` | background, collected via `/codex:result` before Phase 8 |
| **7 — evaluator Mode 3** | `evaluator` (`.claude/agents/evaluator.md`) Mode 3 | — | direct `Agent({ subagent_type: "evaluator" })` | foreground (analysis must block before final verdict) |
| 8 — Report | none (synthesis in main context) | — | — | — |
| **9 — `/evolve`** | none (skill orchestrates docs updates) | `evolve` | slash command `/evolve` after VERIFIED report | foreground (writes to learnings docs + MEMORY.md) |
| Escalation — fix loop fail | `codex-rescue` (subagent_type `codex:codex-rescue`) | `codex:rescue` | only when `/debug` or `/perf` already escalated and still failed | foreground |
| Escalation — 2× FAILED reactive | `evaluator` (`.claude/agents/evaluator.md`) Mode 3 | — | direct `Agent({ subagent_type: "evaluator" })` | foreground |

### Why these and not others

- `debugger` covers backend, auth, DB, services, tests, frontend regressions. Do not substitute `frontend-specialist` here: that agent is for design/component creation (`/design` workflow), not regression debugging.
- `performance-optimizer` is the only agent with the `performance-optimization` skill bound. `/perf` will not work correctly with any substitute.
- `verification-agent` is the only agent wired to Playwright MCP and the staging URL. Do not substitute with `frontend-specialist` or run Playwright tools directly from main context.
- `/codex:review` and `/codex:adversarial-review` are slash commands provided by the **codex-plugin-cc** plugin. They route to the local Codex CLI runtime — do not spawn the `codex-rescue` agent directly for review work.
- `evaluator` Mode 3 is the canonical architecture escalation path (per `_shared.md § 3` and `debugger.md` Stopping Conditions). Never substitute with `general-purpose`.
- `/evolve` is a skill, not an agent — it orchestrates documentation updates from main context, not via subagent spawn.
- Read-only research agents (`explorer`, `librarian`) are NOT used directly by `/verify`. They are used inside `/debug` if its triage routes there.

### Anti-patterns to reject

- Calling `Skill("debugger")` then also spawning the `debugger` agent for the same investigation → wastes context. The Skill is loaded once at Phase 1.0 to inform main-context reasoning during Phase 4 evidence-gathering.
- Spawning `performance-optimizer` directly from `/verify` → bypasses `/perf` orchestration (route detection, threshold table, multi-mode routing). Always go through `/perf`.
- Spawning `codex-rescue` agent directly for code review → use slash command `/codex:review`, which the codex-plugin-cc plugin handles via the local Codex CLI runtime.
- Auto-fixing findings from `/codex:adversarial-review` → adversarial review is meant to question decisions, not generate code. Present findings, ask the user.
- Running Phase 7 (evaluator Mode 3) when Phase 5 or 6 already STOPPED awaiting user input → wait for user "continue" first; otherwise the evaluator gets stale signals.
- Running Phase 9 (`/evolve`) on `NEEDS-WORK` or `FAILED` verdict → captures wrong learnings from incomplete fixes. Hard constraint.
- Skipping Phase 7 in `full` mode when schema / auth / payment were touched → that is exactly the cenario where 2× FAILED used to surface too late. The proactive trigger gating exists to catch it before failure.
- Using `subagent_type: "Explore"` (capital E, built-in) when `_shared.md § 3` mandates `"explorer"` (lowercase, custom). `/verify` does not need either, but downstream commands must follow the rule.

---

## 16. After VERIFIED

- Phase 9 (`/evolve`) writes any new learnings to docs + `MEMORY.md` (only on `VERIFIED` / `VERIFIED-WITH-NOTES`)
- Suggest pre-commit: `bunx biome check --write <touched-files>` (per `_shared.md` Section 1)
- If session is long → suggest `/handoff`
- If `VERIFIED-WITH-NOTES` → surface the notes section explicitly to the user; do not let warnings die in the report
