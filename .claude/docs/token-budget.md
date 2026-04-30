# Token Budget & Context Hygiene Strategy

> Tier 3 doc. Read on demand by subagents. Never auto-loaded.
>
> **Companion docs:**
> - `.claude/docs/hooks-guide.md` — full inventory of the 12 hooks and proposed
>   enhancements referenced in § 7 below.
> - `.claude/docs/session-patterns.md` — copy-paste interaction patterns that put this
>   strategy into practice.

---

## 1. Core Principle

**Thinking, background tasks, and subagents stay ON.** This document does not advocate
disabling any of them. Disabling thinking degrades reasoning quality on L3+ tasks;
disabling background tasks breaks parallel exploration; disabling subagents collapses
the multi-agent system into a single sequential agent. None of those are acceptable
trade-offs.

Token budget control comes from **four levers**, in order of impact:

1. **Volume of context injected per task** — load only the AGENTS.md and rule files for
   the path scope being touched, not the whole repo.
2. **Precision of what is loaded** — progressive, path-scoped loading via the WISC
   3-Tier protocol (`AGENTS.md § Context Loading Protocol`).
3. **Hook pre-filtering of noisy outputs** — see `hooks-guide.md` for the full
   inventory and proposed H1–H5 enhancements.
4. **`/compact` at phase boundaries (not `/clear`)** — `/compact` summarizes context
   while preserving subagent memory summaries in `agent-memory/`. `/clear` discards
   that state and forces fresh subagent spawns to rediscover everything.

> **Baseline cost callout (D4):** `session_context.py` injects the **entire root
> `AGENTS.md` body verbatim** on every `SessionStart` (matchers: `startup | resume |
> compact`). That file is the unavoidable floor of every session's token budget.
> Progressive loading is layered *on top of* this baseline — it does not reduce the
> baseline. If the baseline grows past ~500 lines (Tier 1 budget per `AGENTS.md`), the
> right fix is to trim `AGENTS.md` itself, not to add more hooks.

---

## 2. Session Hygiene (Multi-Agent Mode)

| Trigger | Action | Rationale |
|---|---|---|
| Phase boundary reached (e.g., schema work done, now starting API work) | `/compact` | Summarizes accumulated context into a compact form, **keeps** subagent memory summaries in `agent-memory/`, frees room for the next phase without losing prior decisions. |
| New unrelated task | New session | Avoids cross-contamination between unrelated goals. A session built around "fix Baileys reconnect loop" should not also carry context for "redesign the patient profile page". |
| Bad output from a subagent or the main agent | Rewind to last good checkpoint (Esc ×2 or `/rewind`) | Do **not** layer corrective messages ("actually, ignore that") on top of bad output — the bad output stays in context and compounds noise. Rewind eliminates it from the transcript entirely. See `session-patterns.md § Rewind Protocol`. |
| Side question not in current task scope | `@btw` annotation **or** open a separate conversation | Mid-task curiosity does not pollute the main task context. The answer lives outside the working thread. |

**Rule:** Never keep a multi-topic thread running for active coding. **One goal per
session.** If the goal changes, start a new session — it costs less than letting two
goals share one context window.

---

## 3. Progressive Context Loading

Path-scope your AGENTS.md loads. When editing files in a subdirectory, **load only that
subdirectory's `AGENTS.md`**, plus the root `AGENTS.md` (already auto-loaded by
`session_context.py`).

| Path scope being touched | Load this AGENTS.md (in addition to root) |
|---|---|
| `apps/api/src/**` | `apps/api/src/AGENTS.md` |
| `apps/api/drizzle/**` | `apps/api/drizzle/AGENTS.md` |
| `apps/api/src/services/**` | `apps/api/src/services/AGENTS.md` (and `apps/api/src/AGENTS.md` only if the change spans more than just services) |
| `apps/api/src/_core/**` | `apps/api/src/_core/AGENTS.md` |
| `apps/api/src/routers/**` | `apps/api/src/routers/AGENTS.md` |
| `apps/api/src/webhooks/**` | `apps/api/src/webhooks/AGENTS.md` |
| `apps/api/src/lib/**` | `apps/api/src/lib/AGENTS.md` |
| `apps/web/src/**` | `apps/web/src/AGENTS.md` |
| `packages/ai-gateway/**` | `packages/ai-gateway/AGENTS.md` |
| `packages/shared/**` | `packages/shared/AGENTS.md` |
| `packages/config/**` | `packages/config/AGENTS.md` |
| `scripts/**` | `scripts/AGENTS.md` |
| Cross-domain (schema + API + UI in the same task) | All relevant AGENTS.md **+ invoke `mcp__sequential-thinking__sequentialthinking` first** to decompose into per-phase subgoals |

> **Anti-pattern:** Never ask Claude to "scan the whole project" or "look at every file".
> Always scope to the touched paths. The auto-loaded Tier 2 rules (`.claude/rules/*.md`)
> already match by glob, so the right files are loaded automatically when you start
> editing.

---

## 4. Subagent Context Handoff Protocol

When spawning a subagent, the brief should contain only what the subagent needs to make
progress. The contract is enforced by the WISC protocol from `AGENTS.md:21`:
**"Sub-agents MUST return <2000 tokens to main context."** Inputs should be smaller than
outputs.

1. **Pass only:** specific file paths under investigation (≤ 8 paths), a goal statement
   (≤ 3 sentences), a stopping condition that defines what "done" looks like.
2. **Do NOT pass:** full conversation history, the entire root `AGENTS.md` (the
   subagent will receive it via its own `SessionStart`/`SubagentStart` hooks), unrelated
   prior decisions, or raw outputs from earlier tool calls.
3. **On return:** receive the subagent's structured output (confidence score + findings
   + next steps). **Discard** any raw intermediate reasoning. The subagent's transcript
   is logged separately by `subagent_log.py` for observability — it does not need to
   re-enter main context.
4. **Persist via `agent-memory/`:** the librarian agent uses `agent-memory/` (subdirs
   `debugger/`, `explorer/`, `frontend-specialist/`, `librarian/`) as the canonical
   handoff store across sessions. When the orchestrator needs prior subagent findings,
   it asks the librarian — **not** the original subagent transcript.

---

## 5. Output Size Control

Match the response size to the task complexity. Multiple focused responses are always
preferable to one massive response.

| Task type | Expected output size | Notes |
|---|---|---|
| Single file fix (L1-L2) | Small — < 100 lines | Direct edit, no preamble, no summary. The diff is the answer. |
| Feature implementation (L3) | Medium — 100–400 lines across messages | Step-by-step, **one file per message**. Validate after each (`bun run type-check && bunx biome check --write`). |
| Cross-service refactor (L4+) | Large — split across multiple messages | Invoke `mcp__sequential-thinking__sequentialthinking` first, execute one phase per response, `/compact` between phases. |
| Architecture decision | Medium **report only** | No code generation until the user has approved the recommended approach. Trade-offs in prose, not in half-implemented code. |

**Rule:** Prefer many short, focused responses over one massive response. A 1500-line
response that touches 8 files is harder to review than 8 sequential responses of 200
lines each, and the latter lets the user catch mistakes after every step.

---

## 6. Thinking Budget Guidance

Thinking is **enabled and useful**. Calibrate, do not disable.

| Task complexity | Thinking hint |
|---|---|
| L1-L2 (trivial fix, known pattern) | `think briefly` or no hint at all — default reasoning is sufficient |
| L3 (feature implementation, single domain) | Default — no hint needed |
| L4+ (architecture decision, cross-service work, irreversible change) | `think deeply` or `think step by step` — engage extended reasoning |
| Debugging cascade failure (errors spanning 3+ files or services) | `think hard` **and** invoke `mcp__sequential-thinking__sequentialthinking` for explicit decomposition |

**Anti-pattern:** Never use phrasing that suppresses reasoning ("don't think", "skip
analysis", "answer immediately"). The goal is calibration, not disabling. Suppressing
thinking on L4+ tasks causes shallow root-cause analyses that fail under verification —
which then costs more tokens to redo.

---

## 7. Hook-Based Context Filtering

This table summarizes the 12 hooks documented in `hooks-guide.md § 1`. The "Token
saving" column reflects current behavior, not the proposed H1–H5 enhancements.

| # | Hook | What it currently filters or contributes | Token saving |
|---|---|---|---|
| 1 | `session_context.py` | **Injects** root `AGENTS.md` verbatim on `SessionStart`. No filtering — that's the baseline cost (see § 1 D4 callout). | N/A — net cost, not saving |
| 2 | `smart_bash_approver.py` | Gates Bash permission decisions. Does not inject context, but blocking dangerous commands prevents tool errors that would otherwise consume retry tokens. | Medium |
| 3 | `protect_files.py` | Gates `Edit\|Write` permission decisions for protected paths. Same indirect savings as #2. | Low |
| 4 | `task_routing_guard.py` | Prevents wrong-agent invocations by validating `subagent_type` against the known list. **High value:** stops oversized agent spawns from happening at all (e.g., `general-purpose` for tasks that should go to `explorer`). | High |
| 5 | `ultracite_fix.py` | Format-only `biome format --write`. No context injection. Keeps files clean so future reads are smaller. | Low |
| 6 | `notify.py` | Desktop notification only — never touches context. | None |
| 7 | `ultracite_check.py` | On `Stop`, runs OXLint on modified files. If errors exist, returns last 30 lines × 2000 chars as block reason. **Already filters** by truncating positionally and by ignoring warnings. H5 in `hooks-guide.md` proposes a complementary semantic filter. | Medium |
| 8 | `subagent_start.py` | Injects a one-line (≤ 160 char) hint per agent type. Effectively a tiny constant cost. | High (vs. injecting full agent prompts) |
| 9 | `task_completed.py` | Logger only — appends one JSON line to `team-events.jsonl`. No context injection. | None (already silent) |
| 10 | `evaluator_escalation.py` | Logger only — increments a counter and prints to stderr after 2 failures. No context injection. | None (already silent) |
| 11 | `subagent_log.py` | Logger only — appends one JSON line to `subagent-events.jsonl`. No context injection. H3 in `hooks-guide.md` proposes a structured summary schema. | None (already silent) |
| 12 | `background_cleanup.py` | **Not currently registered** in `settings.json`. Exists as a file. H4 in `hooks-guide.md` proposes activating it as a TTL guard for background outputs. | N/A (not wired) |

**Cross-link:** For the proposed H1–H5 enhancements that would extend hooks 1, 8, 11,
12, and 7 with context-hygiene logic, see `.claude/docs/hooks-guide.md §§ 2–6`. None of
those enhancements are currently wired.

---

## 8. Skills Loading Discipline

NeonDash ships **15 skills** under `.claude/skills/`. Loading every skill at session
start would balloon the context window before any work begins. Load skills only when
the task domain matches.

**Rules:**

- Load skills only when the task domain matches — never preemptively load all skills.
- Skill loading order: **planning skills first → domain skills → implementation skills**.
- Do not load `ui-ux-pro-max` for backend-only tasks.
- Do not load `baileys-integration` or `evolution-core` for frontend or DB-only tasks.
- `senior-prompt-engineer` and `skill-creator` are meta-skills — load only for prompt
  authoring or skill creation work.
- Use the `Skill` tool to invoke skills, never `Read` directly on a `SKILL.md` file.

| Task domain | Skills to load |
|---|---|
| DB schema change | `drizzle-neon-clerk-auth` |
| WhatsApp / messaging | `baileys-integration`, `evolution-core`, `meta-api-integration` |
| Payments (Asaas, Kiwify, Hubla, Stripe) | `payments-integrations-br` |
| UI component | `ui-ux-pro-max`, `gpus-theme` |
| Performance issue | `performance-optimization`, `debugger` |
| Infra / deploy | `coolify-vultr` |
| Planning a sprint | `planning`, `senior-prompt-engineer` |
| Excel / data export | `xlsx` |
| AI gateway | `google-ai-sdk` |

> Note on case: the filesystem directory is `.claude/skills/xlsx/` (lowercase). Earlier
> drafts of this strategy referred to it as `Xlsx` — that capitalization is incorrect
> for invocation.

---

## 9. Model Selection per Workload

Background agents can run on Haiku for mechanical tasks, preserving Sonnet/Opus budget
for the work that actually needs it.

| Workload | Model |
|---|---|
| Exploration, file reading, grep, glob | Haiku (subagent, `run_in_background: true`) |
| Implementation, feature coding | Sonnet (main agent) |
| Architecture decision, hard debugging, irreversible refactors | Opus (main agent, explicit request only) |
| Test scaffolding, boilerplate generation | Haiku (background) |
| `mcp__sequential-thinking__sequentialthinking` decomposition | Sonnet minimum (Haiku is too shallow for cross-phase reasoning) |

---

## 10. Compact vs Clear Decision Tree

```
End of phase reached?
├── Background agents still running?
│       └─→ /compact   (preserves subagent state in agent-memory/)
├── All agents done, starting an unrelated task?
│       └─→ New session   (clean context, fresh subagent state)
└── Mid-task, context getting long but goal unchanged?
        └─→ /compact + continue

Bad output from agent (subagent or main)?
└── Rewind to last checkpoint (Esc ×2 or /rewind)
    └─→ Edit the original prompt with the clarification
        └─→ Re-run from that point
   Never add "actually, ignore that" corrections on top — they compound noise
   and the bad output stays in context. See session-patterns.md § Rewind Protocol.
```

---

## 11. Anti-Patterns (NeonDash Specific)

- ❌ Loading `AGENTS.md` for ALL subdirectories at session start — defeats the whole
  WISC 3-Tier point. Tier 2 rules auto-load by glob; trust them.
- ❌ Injecting full Drizzle migration history when the task is a UI-only change.
- ❌ Passing the entire `agent-memory/` directory to a focused subagent instead of
  asking the `librarian` agent for the relevant slice.
- ❌ Running `ultracite_check.py` (or any lint/test command) and pasting the **entire**
  output (including passing files) into the context window. The Stop hook already
  truncates to last 30 lines × 2000 chars; for manual runs, do the same.
- ❌ Spawning more than 5 subagents in one user request without a checkpoint. The
  `Max 5 agent spawns per user request → pause and checkpoint with user` rule from
  `CLAUDE.md:124` exists for a reason — silent over-spawning eats budget and produces
  fragmented findings that are hard to merge.
- ❌ Using Opus for L1-L2 fixes or pure formatting tasks. Sonnet (or Haiku for the
  formatting case) is sufficient and preserves Opus budget for irreversible decisions.

---

## See also

- `.claude/docs/hooks-guide.md` — full hook inventory referenced in § 7, including the
  H1–H5 proposed enhancements and the `settings.json` reformulation in § 8 there.
- `.claude/docs/session-patterns.md` — copy-paste interaction patterns built on top of
  this strategy.
- `AGENTS.md § Context Loading Protocol` — the WISC 3-Tier loading rules this doc
  operationalizes.
- `AGENTS.md:21` — the `<2000 tokens` subagent return contract referenced in § 4.
- `CLAUDE.md:124` — the Max 5 spawns rule referenced in § 11.
