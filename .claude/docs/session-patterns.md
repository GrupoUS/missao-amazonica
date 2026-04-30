# Session Patterns — Copy-Paste Interaction Recipes

> Tier 3 doc. Read on demand by subagents. Never auto-loaded.
>
> Practical interaction patterns for long coding sessions with agents and subagents in
> background. Each pattern is a numbered checklist ready to follow. For the full
> strategy behind these patterns, see `.claude/docs/token-budget.md`. For the hook
> behaviors referenced below, see `.claude/docs/hooks-guide.md`.

---

## Pattern 1 — Standard Feature Implementation (L3)

**Use for:** single domain, clear requirements, well-known pattern in the repo.

1. State the goal in 1–3 sentences plus the relevant paths. Example: *"Add a `notes`
   field to the `mentorados` table and surface it in the mentor profile drawer.
   Touches `apps/api/drizzle/schema.ts`, `apps/api/src/routers/mentorados.ts`,
   `apps/web/src/components/mentor/profile-drawer.tsx`."*
2. Wait for Claude to classify intent. For an L3 you should see an **Explicit**
   classification — well-scoped, clear requirements.
3. A light plan is proposed → confirm → execute. No `/plan` is needed for L3.
4. **Load only path-scoped `AGENTS.md`** for the touched directories, plus 1–2 matching
   skills max (see `token-budget.md § 8`).
5. Implement step by step, **one file per message**. Do not bundle the schema change,
   the router change, and the UI change into a single tool call dump.
6. After each file: validate with `bun run type-check && bunx biome check --write
   <file>`.
7. At phase end (e.g., schema + API done, now starting UI): `/compact`.

---

## Pattern 2 — Cross-Service Feature (L4+)

**Use for:** schema + API + UI in the same task, or any feature that crosses 2+ domains.

1. **Invoke `mcp__sequential-thinking__sequentialthinking` first** with the full goal
   plus all known constraints. Do this *before* loading any context — the
   decomposition tells you what to load.
2. Receive the decomposed numbered steps with explicit phase gates (e.g., "Phase 1:
   schema → Phase 2: tRPC procedure → Phase 3: query hook → Phase 4: UI component").
3. For each phase:
   - **(a)** Load only the `AGENTS.md` for that phase's path scope (see
     `token-budget.md § 3`).
   - **(b)** Load matching skills for that domain (see `token-budget.md § 8`). Do not
     load skills from other phases.
   - **(c)** Implement and validate: `bun run type-check && bunx biome check --write
     && bun run lint:oxlint:check`.
   - **(d)** `/compact` before the next phase. This preserves the prior phase's
     decisions in `agent-memory/` while freeing room for the next.
4. **Hard ceiling:** max **5 subagent spawns per user request**. If the work requires
   more, **checkpoint with the user** before continuing. This is the
   `Max 5 agent spawns per user request → pause and checkpoint with user` rule from
   `CLAUDE.md:124`.

---

## Pattern 3 — Debugging Cascade Failure

**Use for:** errors spanning 3+ files or services, hydration mismatches that surface in
unexpected places, race conditions that change shape between runs.

1. **PAUSE.** Do not retry the failing command immediately. Retry without analysis is
   how you burn an hour discovering nothing.
2. Spawn the `explorer` subagent (with `run_in_background: true` — enforced by
   `task_routing_guard.py`) with:
   - **goal:** one sentence describing the symptom
   - **paths:** the file the error originated in, plus its 2 nearest import levels
     (≤ 8 paths total)
   - **stopping_condition:** `confidence ≥ 4 on root cause`
3. Receive a **structured summary** following the H3 contract from
   `hooks-guide.md § 4`: 5 fields (`agent`, `status`, `summary`, `artifacts`,
   `duration_ms`). **Discard the raw transcript** — do not paste it back into context.
4. `think hard` and invoke `mcp__sequential-thinking__sequentialthinking` with the
   root-cause hypothesis from step 3. Get an explicit fix plan with verification steps.
5. Apply the fix to **one layer at a time**. After each layer, run the verification
   command from step 4 before touching the next layer.
6. **If the same hypothesis fails 3× in a row**: the hypothesis is wrong. Escalate to
   the `evaluator` agent in **Mode 3 (Architecture Analysis)** per
   `evaluator_escalation.py`. Do not try a 4th variation of the same fix.

---

## Pattern 4 — Background Agent Coordination

**Use for:** parallel work where two agents can operate on disjoint file scopes
simultaneously (e.g., a backend agent fixing a tRPC procedure while a frontend agent
adjusts the consuming component).

1. Define **non-overlapping file scopes** before spawning anything:
   - Agent A: `apps/api/src/**`
   - Agent B: `apps/web/src/**`
2. Each agent receives **only its scope's `AGENTS.md`**. Agent A does not load
   `apps/web/src/AGENTS.md`, and vice versa.
3. `packages/shared/**` and `packages/config/**` are treated as **read-only by both
   agents**. If either agent thinks it needs to edit a shared package, it must
   checkpoint with the parent first — shared packages are a common source of merge
   conflicts and contract drift.
4. **Sync point:** after both agents complete, the parent agent merges the results via
   a `/compact` summary. The parent reads each agent's structured summary
   (per H3 contract) — never the raw transcripts.
5. **Conflicts in shared files** (`packages/shared`, `packages/config`, root configs):
   **always ask** the user before merging. Never silently pick one side.

---

## Pattern 5 — Side Question (`@btw`)

**Use for:** questions that arise mid-task but are not part of the main task ("by the
way, why does this hook use `subprocess.run` instead of `subprocess.Popen`?").

1. Do **NOT** ask in the main thread. Mid-task questions pollute the main task context
   and the answer becomes interleaved with implementation steps.
2. Annotate with `@btw` prefix **or** open a separate conversation entirely.
3. Consume the answer in isolation. Do not paste it back into the main thread.
4. **If the answer changes the main task plan:** `/compact` the main thread, then
   restate the goal with the updated information. Do not try to retroactively patch
   the existing plan in place.

---

## Rewind Protocol

**When a subagent or main agent produces a wrong answer:**

```
1. Do NOT add "actually, ignore that" or "scratch that, I meant..." on top of the
   bad output. Corrective messages compound context pollution — the bad output is
   still in the transcript and the model will keep weighting it.

2. Use Esc ×2 (or /rewind if the command is available in the current harness) to
   restore the last good checkpoint before the bad output.

3. Edit the original prompt that produced the bad output to add the clarification
   that would have prevented it. Be explicit about what was missing or misread.

4. Re-run from that point. The bad output is now eliminated from context entirely
   — not buried under correction attempts.

Reason: every correction layered on top of bad output costs tokens AND keeps the
bad output in the model's attention window. Rewind is cheaper, cleaner, and
produces better answers. It is the cheapest form of context hygiene available.
```

---

## Skills Loading Quick Reference

A mental checklist (not a table) to run through before any task:

```
Before any task, identify:
  1. Which app layer am I touching?
       → api / web / packages / scripts / drizzle
  2. Which domain?
       → DB schema / messaging / payments / UI / infra / AI gateway / performance
  3. What complexity level?
       → L1 (typo) / L2 (single file fix) / L3 (feature) / L4+ (cross-service)

Then load:
  - planning skill              → only if L3+
  - 1–2 domain skills max       → see token-budget.md § 8 for the full mapping
  - debugger skill              → only if you are in an error/failure state
  - google-ai-sdk skill         → only if touching packages/ai-gateway/
  - senior-prompt-engineer      → only if authoring prompts or skill content
  - skill-creator               → only if creating or editing a skill
  - xlsx skill                  → only if reading/writing .xlsx, .xlsm, .csv, .tsv
                                  (note: lowercase folder name)

NEVER load all skills at session start. Loading is on-demand, not preemptive.
```

For the full task-domain → skills mapping, see `token-budget.md § 8`.

---

## See also

- `.claude/docs/token-budget.md` — the strategy behind these patterns. Read this first
  if any pattern feels arbitrary.
- `.claude/docs/hooks-guide.md` — current hook behaviors and the H3 structured-summary
  contract referenced by Pattern 3 and Pattern 4.
- `AGENTS.md § Context Loading Protocol` — the WISC 3-Tier rules these patterns
  operationalize.
- `CLAUDE.md:124` — the Max 5 spawns rule cited in Pattern 2 and Pattern 4.
- `CLAUDE.md § Sequential Thinking` — when to invoke
  `mcp__sequential-thinking__sequentialthinking`, referenced in Pattern 2 and Pattern 3.
