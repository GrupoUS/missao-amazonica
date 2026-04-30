# Hooks Guide — Inventory + Proposed Context-Hygiene Enhancements

> Tier 3 doc. Read on demand by subagents. Never auto-loaded.
>
> **Thinking and background tasks remain ENABLED.** Every enhancement in this guide is an
> **addition** to existing hooks, not a replacement. None of them suppress thinking,
> background tasks, or subagents — they only reduce noise that *would* enter the context
> window if a future change wired the hook to inject content.
>
> All Python snippets use **stdlib only** (`json`, `pathlib`, `subprocess`, `re`, `time`,
> `datetime`, `argparse`) and follow the Python-only-scripts convention from `AGENTS.md
> § Scripts (Python-only)`.

---

## 1. Current Hooks Inventory

The repo ships **12 Python hook files** under `.claude/hooks/`. Of those, **11 are
currently registered** in `.claude/settings.json`. One file (`background_cleanup.py`)
exists but is not wired to any event yet — see footnote.

| # | File | Hook event (registered in settings.json) | Current actual purpose |
|---|------|------------------------------------------|------------------------|
| 1 | `session_context.py` | `SessionStart` (matchers: `startup\|resume\|compact`) | Reads root `AGENTS.md` from disk and emits `hookSpecificOutput.additionalContext` containing a branch prefix plus the **entire AGENTS.md body verbatim**. This is the *only* place context is injected at session boot. |
| 2 | `smart_bash_approver.py` | `PreToolUse` (matcher: `Bash`) | Auto-approves safe Bash patterns (`git status`, `bun run *`, `bunx oxlint`, `python .claude/*.py`, etc.), blocks dangerous patterns (`rm -rf /`, `DROP DATABASE`, force-push to main, etc.), asks for cleanup patterns (`__pycache__`, `node_modules/.cache`, etc.). |
| 3 | `protect_files.py` | `PreToolUse` (matcher: `Edit\|Write`) | Blocks edits to `.env*`, `bun.lock*`, `credentials/`, `secrets/`, `api-keys/`, `.git/`, `drizzle/migrations/`. Returns `permissionDecision: deny` with reason. |
| 4 | `task_routing_guard.py` | `PreToolUse` (matcher: `Agent`) | Validates `subagent_type` against the known list of project agents. Forces `run_in_background: true` for read-only agents (`explorer`, `explorer-agent`, `librarian`) when the runtime exposes the flag. |
| 5 | `ultracite_fix.py` | `PostToolUse` (matcher: `Write\|Edit`) | Runs `bunx biome format <file> --write` after each file write. **Format-only** — never invokes the linter or assists, because lint auto-fix can delete imports mid-edit. |
| 6 | `notify.py` | `Notification` (matchers: `permission_prompt\|idle_prompt`) | Cross-platform desktop notification: WSL2 → PowerShell toast; Linux → `notify-send`; macOS → `osascript`; fallback → terminal bell. |
| 7 | `ultracite_check.py` | `Stop` | On Stop, runs `bunx oxlint` against modified `*.ts/.tsx/.js/.jsx` files (max 20 via `git diff --name-only --diff-filter=ACM`). If `error_count > 0`, emits `decision: block` with the **last 30 lines of output truncated to 2000 chars** as the block reason. Warnings never block. |
| 8 | `subagent_start.py` | `SubagentStart` (matcher list of known agents) | Looks up `agent_type` in a hardcoded `AGENT_CONTEXT` dict and emits a one-line context hint as `additionalContext`. Each hint is a single string ≤ 160 chars. |
| 9 | `task_completed.py` | `TaskCompleted` | Appends one JSON line to `.claude/logs/team-events.jsonl` containing `{timestamp, event, teammate, task_id, subject}`. **Pure observability — never injects into context.** |
| 10 | `evaluator_escalation.py` | `SubagentStop` | Reads the subagent transcript file, greps for `fail/failed/error/exception/traceback/panic`. On match, increments `.claude/logs/evaluator-failure-count.txt`. After 2 hits in a row, prints an escalation message to stderr and resets the counter. |
| 11 | `subagent_log.py` | `SubagentStop` | Counts lines in the subagent transcript file. If `transcript_lines >= 20` and `agent_type not in {Explore, general-purpose, Bash}`, appends one JSON line to `.claude/logs/subagent-events.jsonl`. **Pure observability — never injects into context.** |
| 12 | `background_cleanup.py` | **Not currently registered** ⚠ | File exists; appends `[timestamp] Session stopped.` to `.claude/logs/background-cleanup.log` if invoked. Not wired to any event in `settings.json`. To activate, register under `Stop` alongside `ultracite_check.py`. Listed here for completeness because H4 below proposes giving it a real job. |

**Key observation:** Of these 12 hooks, **only two inject content into the running context
window**: `session_context.py` (the entire AGENTS.md on SessionStart) and
`subagent_start.py` (a one-line hint per agent type). Everything else either gates a
permission decision (`smart_bash_approver`, `protect_files`, `task_routing_guard`),
formats files silently (`ultracite_fix`), blocks Stop with a one-shot reason
(`ultracite_check`), writes to a log file (`subagent_log`, `task_completed`,
`evaluator_escalation`, `background_cleanup`), or fires a desktop notification
(`notify`).

This matters because the H1–H5 enhancements below are sometimes phrased as "filter what
the hook injects". For most of the target hooks **there is currently nothing being
injected to filter** — H1–H5 are net-new logic that would only matter *if and when* a
future change wires those hooks to inject content. Each enhancement section makes that
status explicit.

---

## 2. H1 — `session_context.py`: Filter Test Output Before Injection

**Status:** Proposed. Not yet implemented.
**Hook touched:** `.claude/hooks/session_context.py`
**Current behavior:** Injects only a branch prefix and the entire root `AGENTS.md` body
verbatim. **Does NOT inject test output, lint output, or any tool result.**
**Proposed behavior:** When (and only when) future code adds a path that injects test
runner output into `additionalContext`, filter that output to keep only failure-relevant
lines before injection.
**Why net-new (not a filter on existing behavior):** The hook has no test-output path
today. This enhancement would add a *new* helper function and a *new* call site.
**Settings.json keys consumed:** `test_output_filter` (proposed in § 8).

**Token impact if test injection is later added without this filter:** High. A passing
Vitest run can be 200+ lines. A failing run with stack traces can be 500+. Filtering
typically retains 10–40 lines.

```python
#!/usr/bin/env python3
"""Helper proposed for inclusion in session_context.py.
Filters test runner output to failure-relevant lines only.
Pure stdlib (re).
"""
import re

FAIL_MARKERS = re.compile(
    r"(FAIL|ERROR|AssertionError|Expected|Received|✗|×|\bfailed\b|Traceback)",
    re.IGNORECASE,
)


def filter_test_output(raw_output: str) -> str:
    """Return only failure-relevant lines from a test runner output blob.

    Strategy:
      1. Scan line-by-line for FAIL/ERROR/✗/×/AssertionError/Expected/Received markers.
      2. For each match, capture the surrounding block (2 lines before, 5 lines after).
      3. Deduplicate identical adjacent blocks.
      4. If no matches found at all, return a single line: "All tests passed."
    """
    lines = raw_output.splitlines()
    if not lines:
        return "All tests passed."

    keep: list[str] = []
    last_idx = -10
    for idx, line in enumerate(lines):
        if FAIL_MARKERS.search(line):
            start = max(0, idx - 2, last_idx + 1)
            end = min(len(lines), idx + 6)
            keep.extend(lines[start:end])
            last_idx = end - 1

    if not keep:
        return "All tests passed."

    total = len(lines)
    shown = len(keep)
    suffix = f"\n[Filtered: {total - shown} non-failure lines hidden]"
    return "\n".join(keep) + suffix
```

---

## 3. H2 — `subagent_start.py`: Enforce Minimal Context Handoff

**Status:** Proposed. Not yet implemented.
**Hook touched:** `.claude/hooks/subagent_start.py`
**Current behavior:** Looks up `agent_type` in a hardcoded `AGENT_CONTEXT` dict and
returns a one-line hint (always ≤ 160 chars). **Does NOT receive or pass through any
caller payload** beyond `agent_type`.
**Proposed behavior:** When (and only when) the runtime starts passing a richer payload
to `SubagentStart` (e.g., goal + paths + caller context), validate that payload contains
**only** four keys: `goal` (str, ≤ 3 sentences), `paths` (list of relevant file paths),
`stopping_condition` (str), `relevant_rules` (list of path-scoped `AGENTS.md` paths). Trim
or reject payloads larger than `MAX_SUBAGENT_CONTEXT_CHARS`.
**Why net-new (not a filter on existing behavior):** The current hook has no payload to
trim. This adds a defensive boundary for a future contract.
**Settings.json keys consumed:** `max_subagent_context_chars` (proposed in § 8).

**Why 4000 chars:** 4000 chars ≈ 1000 tokens, which leaves headroom under the
`AGENTS.md:21` rule that subagents must return **<2000 tokens** to main context. Inputs
should be smaller than outputs.

```python
#!/usr/bin/env python3
"""Helper proposed for inclusion in subagent_start.py.
Enforces a minimal-context handoff contract for future SubagentStart payloads.
Pure stdlib (json).
"""
import json

MAX_SUBAGENT_CONTEXT_CHARS = 4000  # ~1000 tokens; aligns with WISC <2000 token return

ALLOWED_KEYS = frozenset({
    "goal",            # str, ≤ 3 sentences
    "paths",           # list[str], scoped to the task
    "stopping_condition",  # str, ≤ 1 sentence
    "relevant_rules",  # list[str], path-scoped AGENTS.md paths only
})


def enforce_minimal_context(payload: dict) -> dict:
    """Return a trimmed payload containing only ALLOWED_KEYS, capped at the size budget.

    - Drops any key not in ALLOWED_KEYS (notably `history`, `full_context`,
      `parent_transcript`).
    - If the trimmed payload still exceeds MAX_SUBAGENT_CONTEXT_CHARS when serialized
      to JSON, truncates `paths` (most expendable) before any other field.
    - Never raises; returns a best-effort minimal payload.
    """
    trimmed: dict = {k: v for k, v in payload.items() if k in ALLOWED_KEYS}

    serialized = json.dumps(trimmed, ensure_ascii=False)
    if len(serialized) <= MAX_SUBAGENT_CONTEXT_CHARS:
        return trimmed

    # Over budget — drop trailing paths until we fit
    paths = list(trimmed.get("paths", []) or [])
    while paths and len(json.dumps({**trimmed, "paths": paths}, ensure_ascii=False)) > MAX_SUBAGENT_CONTEXT_CHARS:
        paths.pop()
    trimmed["paths"] = paths
    return trimmed
```

---

## 4. H3 — `subagent_log.py`: Structured Summary Instead of Raw Log

**Status:** Proposed. Not yet implemented.
**Hook touched:** `.claude/hooks/subagent_log.py`
**Current behavior:** On `SubagentStop`, counts lines in the agent transcript file. If
`transcript_lines >= 20` and the agent type is not in `{Explore, general-purpose, Bash}`,
appends one JSON line to `.claude/logs/subagent-events.jsonl` containing `{timestamp,
session_id, agent_id, agent_type, transcript_lines, background}`. **Pure observability —
never injects into the running context window.**
**Proposed behavior:** Standardize the log entry shape to a 5-field structured summary
that downstream tools (e.g., `librarian` agent reading `agent-memory/`) can rely on.
**Why net-new (not a filter):** The current entry already has 6 fields, but they are not
the *useful* fields for memory persistence. This is a schema change to what gets logged.
**Settings.json keys consumed:** none — the format is internal to the hook.

**Required summary schema:**

```json
{
  "agent": "debugger",
  "status": "success",
  "summary": "Identified root cause in apps/api/src/services/baileys-service.ts line 412. Patched.",
  "artifacts": [
    "apps/api/src/services/baileys-service.ts",
    "apps/web/src/components/whatsapp/meta-connection-card.tsx"
  ],
  "duration_ms": 18420
}
```

**Field rules:**
- `agent` — exact agent type as registered in `task_routing_guard.py KNOWN_AGENTS`.
- `status` — one of `success | partial | failed`.
- `summary` — ≤ 2 sentences. Never includes raw stack traces or transcript excerpts.
- `artifacts` — list of repo-relative file paths the agent created or modified. Empty
  list if read-only.
- `duration_ms` — integer milliseconds from `SubagentStart` to `SubagentStop`.

**Hard rule:** Never inject the full intermediate reasoning of a subagent back into main
context. The orchestrator reads these summaries on demand via the `librarian` agent.

---

## 5. H4 — `background_cleanup.py`: Timestamp-Based Staleness Guard

**Status:** Proposed. Not yet implemented. **Hook is also not currently registered in
`settings.json` at all** — see § 1, row 12.
**Hook touched:** `.claude/hooks/background_cleanup.py`
**Current behavior:** If invoked, appends `[<UTC ISO timestamp>] Session stopped.` to
`.claude/logs/background-cleanup.log`. That is the entire body. **No background output
handling, no TTL, no context injection.**
**Proposed behavior:** Add a TTL helper that future code can use to discard
background-task outputs older than `STALE_THRESHOLD_SECONDS` instead of injecting them
back into context after the user has moved on. Activate by registering this hook under
the `Stop` event alongside `ultracite_check.py`.
**Why net-new (not a filter):** The hook does not currently see background-task outputs
at all. This adds a new capability the current code does not have.
**Settings.json keys consumed:** `stale_background_output_ttl_seconds` (proposed in § 8).

**Why 300 seconds:** A 5-minute TTL is long enough to cover a typical
`run_in_background: true` Explore call (usually completes in 30–120s), but short enough
that an output orphaned by a phase change (e.g., `/compact` between schema and API
phases) does not resurface in an unrelated later context.

```python
#!/usr/bin/env python3
"""Helper proposed for inclusion in background_cleanup.py.
Stale-output guard for background task results.
Pure stdlib (time).
"""
import time

STALE_THRESHOLD_SECONDS = 300  # 5 minutes


def is_stale(task_output: dict) -> bool:
    """Return True if the task output is older than the staleness threshold.

    Expects task_output to contain a `completed_at` field as a Unix epoch float.
    Returns True (stale → discard) if the field is missing, malformed, or older
    than STALE_THRESHOLD_SECONDS. Never raises.
    """
    completed_at = task_output.get("completed_at")
    if not isinstance(completed_at, (int, float)):
        return True
    return (time.time() - float(completed_at)) > STALE_THRESHOLD_SECONDS
```

---

## 6. H5 — `ultracite_check.py`: Inject Only Failures

**Status:** Partially implemented; remaining work proposed.
**Hook touched:** `.claude/hooks/ultracite_check.py`
**Current behavior:** Runs `bunx oxlint` against modified TS/JS files. If
`error_count > 0`, emits `decision: block` with `\n".join(raw_output.splitlines()[-30:])[:2000]`
as the block reason. Warnings never block. **The output is shown to the user once as a
block reason — it is not a continuous injection into the context window.**
**Already done:** errors-only blocking, 30-line × 2000-char truncation.
**Proposed behavior:** When the hook is later extended (e.g., to record lint deltas in
`agent-memory/` or to surface a structured fix list), use the helper below to format each
error as `<error_code> <line>: <message>` and replace passing-file noise with a single
suppressed-count line.
**Why net-new (not a filter):** The current truncation is a positional cut (last 30
lines). This proposed helper is a *semantic* filter that keeps every error and suppresses
every non-error. The two are complementary, not conflicting.
**Settings.json keys consumed:** `lint_output_filter` (proposed in § 8).

```python
#!/usr/bin/env python3
"""Helper proposed for inclusion in ultracite_check.py.
Semantic lint output filter — keep every error, suppress passing/warning noise.
Pure stdlib (re).
"""
import re

# OXLint typical line shape: "  ⚠ rule-name: message" or "  ✘ rule-name: message"
ERROR_LINE = re.compile(r"^\s*(?:✘|×|error)\s*[:\-]?\s*(.+)$", re.IGNORECASE)
WARN_LINE = re.compile(r"^\s*(?:⚠|warning)\s*[:\-]?\s*(.+)$", re.IGNORECASE)
LOCATION_LINE = re.compile(r"^\s*at\s+(.+):(\d+):(\d+)\s*$")


def filter_lint_output(raw: str, strict: bool = False) -> str:
    """Return a compact lint summary keeping only errors (and warnings if strict=True).

    - Errors are always kept, with their immediately following location line.
    - Warnings are kept only when strict=True.
    - All other lines are counted and replaced with a single suppression footer.
    - Returns "No lint errors." if nothing matches.
    """
    lines = raw.splitlines()
    if not lines:
        return "No lint errors."

    kept: list[str] = []
    suppressed = 0
    i = 0
    while i < len(lines):
        line = lines[i]
        if ERROR_LINE.search(line) or (strict and WARN_LINE.search(line)):
            kept.append(line.rstrip())
            # Capture immediately following location line if present
            if i + 1 < len(lines) and LOCATION_LINE.search(lines[i + 1]):
                kept.append(lines[i + 1].rstrip())
                i += 2
                continue
        else:
            suppressed += 1
        i += 1

    if not kept:
        return "No lint errors."

    if suppressed:
        kept.append(f"[{suppressed} non-error lines suppressed]")
    return "\n".join(kept)
```

---

## 7. Hook Interaction Map

ASCII flow of which hook fires on which event during a typical session.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  SESSION START                                                            │
│  ───────────                                                              │
│  startup | resume | compact                                               │
│         │                                                                 │
│         └─→ session_context.py                                            │
│             └─ injects: branch prefix + entire AGENTS.md verbatim         │
│                                                                            │
│  DURING TASK (per tool call)                                              │
│  ─────────────────────────                                                │
│  Bash command         → smart_bash_approver.py  (allow / deny / ask)      │
│  Edit | Write         → protect_files.py        (deny if protected)       │
│  Edit | Write         → ultracite_fix.py        (POST: format-only)       │
│  Agent (subagent)     → task_routing_guard.py   (validate + force bg)     │
│  permission_prompt    → notify.py               (desktop toast)           │
│  idle_prompt          → notify.py               (desktop toast)           │
│                                                                            │
│  SUBAGENT LIFECYCLE                                                       │
│  ──────────────────                                                       │
│  spawn (matched type) → subagent_start.py       (1-line context hint)     │
│  finish               → evaluator_escalation.py (grep transcript fails)   │
│  finish               → subagent_log.py         (append summary line)     │
│                                                                            │
│  TASK COMPLETED (teammate flow)                                           │
│  ────────────────────────────                                             │
│  TaskCompleted        → task_completed.py       (append team-events line) │
│                                                                            │
│  SESSION STOP                                                             │
│  ────────────                                                             │
│  Stop                 → ultracite_check.py      (block if oxlint errors)  │
│                       (background_cleanup.py NOT currently registered)    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Configuration Reference

This section was reformulated from the original spec. The original asked for top-level
`background_tasks: true`, `thinking: true`, `subagents: true` keys in `settings.json` —
**those keys do not exist** in real Claude Code settings. Documenting them as if they
were real would mislead future readers and contradict `AGENTS.md` Cardinal Rule #1
("Never Assume Correctness"). The user approved the reformulation. See "Spec deviations"
at the end of this section for the override path.

### 8a. Capability Commitments (replaces fake top-level keys)

| Capability | Real control mechanism | Commitment |
|---|---|---|
| **Background tasks** | The `run_in_background: true` parameter on individual `Bash` and `Agent` tool calls. There is no global toggle. | Never strip `run_in_background: true` from a tool call when waiting is acceptable. The `task_routing_guard.py` hook *requires* it for read-only agents (`explorer`, `explorer-agent`, `librarian`). |
| **Extended thinking** | Controlled by model tier and prompt phrasing. There is no `settings.json` key. | Never use phrasing that suppresses reasoning ("skip thinking", "answer immediately", "no need to think"). Calibrate with hints like `think briefly` (L1-L2), default (L3), `think deeply` / `think hard` (L4+). |
| **Subagents** | Always available via the `Agent` / `Task` tool. Gated only by the **Max 5 spawns per user request** rule from `CLAUDE.md:124`. | Never pretend the `Agent` tool is unavailable. When the 5-spawn ceiling is reached, checkpoint with the user instead of suppressing further spawns silently. |

### 8b. Current `.claude/settings.json` Top-Level Shape

Read-only reference. **Do not edit `settings.json` as part of writing this doc.** Real
keys present at the time of writing:

```jsonc
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "env": { /* CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS, ... */ },
  "permissions": { "allow": [...], "deny": [...] },
  "enableAllProjectMcpServers": true,
  "enabledPlugins": { "playwright": true },
  "statusLine": { "type": "command", "command": "..." },
  "plansDirectory": "./docs",
  "hooks": {
    "SessionStart":   [ /* session_context.py */ ],
    "PreToolUse":     [ /* smart_bash_approver, protect_files, task_routing_guard */ ],
    "PermissionRequest": [ /* inline allow */ ],
    "PostToolUse":    [ /* ultracite_fix.py */ ],
    "Notification":   [ /* notify.py */ ],
    "Stop":           [ /* ultracite_check.py */ ],
    "TeammateIdle":   [ /* exit 0 */ ],
    "SubagentStart":  [ /* subagent_start.py */ ],
    "TaskCompleted":  [ /* task_completed.py */ ],
    "SubagentStop":   [ /* evaluator_escalation.py, subagent_log.py */ ]
  }
}
```

There are **no** top-level keys named `background_tasks`, `thinking`, or `subagents`.
Those capabilities are controlled per-call (background) or by model behavior (thinking),
not by configuration flags.

### 8c. Proposed Net-New Keys (NOT YET WIRED)

These four keys are **proposed** by enhancements H1–H5. None of them currently exist in
`settings.json`, and none of the hooks currently read them. To activate any of them, both
the hook code in §§ 2–6 and the corresponding `hooks` block in `settings.json` would need
to be updated. Listed here so the connection between the H-numbers and the configuration
surface is explicit.

```jsonc
{
  "hooks": {
    /* All proposed values are illustrative defaults. None are currently read. */
    "max_subagent_context_chars":          4000,        // consumed by H2 (subagent_start.py)
    "stale_background_output_ttl_seconds": 300,         // consumed by H4 (background_cleanup.py)
    "test_output_filter":                  "failures_only", // consumed by H1 (session_context.py)
    "lint_output_filter":                  "errors_only"    // consumed by H5 (ultracite_check.py)
  }
}
```

| Key | H-number | Hook file | Default | Effect when read |
|---|---|---|---|---|
| `max_subagent_context_chars` | H2 | `subagent_start.py` | `4000` | Trim subagent payload to ≤ 4000 chars before passing to the subagent |
| `stale_background_output_ttl_seconds` | H4 | `background_cleanup.py` | `300` | Discard background-task outputs older than 5 minutes |
| `test_output_filter` | H1 | `session_context.py` | `"failures_only"` | Strip passing test lines before injecting test output (only relevant *if* test injection is added) |
| `lint_output_filter` | H5 | `ultracite_check.py` | `"errors_only"` | Use semantic error filter on lint output (complements existing positional truncation) |

### 8d. Spec Deviations from Original Prompt

The original prompt for this file asked for a JSON block with three top-level keys
(`background_tasks: true`, `thinking: true`, `subagents: true`) and the comment "keep all
three top-level keys true — never disable". Those keys are not real Claude Code settings.
Writing them as if they were would teach future readers a falsehood and contradict
`AGENTS.md` Cardinal Rule #1 ("Never Assume Correctness").

This section was reformulated as:

1. **8a — Capability Commitments table.** Preserves the user's intent ("never disable
   these capabilities") using the actual control mechanisms (`run_in_background: true`
   per-call, prompt-driven thinking calibration, the 5-spawn ceiling).
2. **8b — Real `settings.json` shape.** Read-only reference so future readers know what
   the file actually looks like.
3. **8c — Proposed net-new keys.** The four nested keys from H1–H5, clearly labeled as
   not yet wired and explicitly tied to the H-numbers that would consume them.

**To override this reformulation** and use the literal spec instead, replace § 8a with
the original JSON block, drop §§ 8b and 8d, and keep § 8c. Readers will then be told the
fake top-level keys are real — that is the trade-off and it should be a deliberate
choice.

---

## See also

- `.claude/docs/token-budget.md` — strategy doc that cites this hooks inventory in its
  § 7 hook-filtering table.
- `.claude/docs/session-patterns.md` — copy-paste interaction patterns; Pattern 3
  references the H3 structured-summary contract.
- `AGENTS.md § Scripts (Python-only)` — Python conventions every snippet here follows.
- `AGENTS.md:21` — the `<2000 tokens` subagent return contract that H2 aligns with.
- `CLAUDE.md:124` — the Max 5 spawns rule referenced by § 8a.
