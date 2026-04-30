# Agent Quality Checklist

> Tier 3 doc. Read on demand when creating, modifying, or reviewing agent
> configurations under `.claude/agents/`.

---

## Pre-Deploy Verification

Before deploying any agent configuration change (new agent, frontmatter edit, prompt
rewrite), verify all of the following:

- [ ] **Workflow type labeled** in frontmatter (`workflow_type` field present and
      accurate)
- [ ] **Stopping conditions defined** — explicit max iterations, error threshold, and
      human checkpoint triggers
- [ ] **No content duplication** across Tier 1 files (`AGENTS.md` + `.claude/CLAUDE.md`)
      — agent prompts may reference rules, but never re-state them
- [ ] **Tier 1 budget** — combined `AGENTS.md` + `CLAUDE.md` stays under 500 lines
      (per WISC 3-Tier from `AGENTS.md`)
- [ ] **Tool ACI coverage** — every tool the agent invokes has an ACI entry in
      `_shared.md` Section 6
- [ ] **Simplest viable pattern** — no unnecessary orchestration, no parallel spawns
      where sequential is fine, no agent-of-agents where one agent suffices
- [ ] **NeonDash guardrails respected** — stability checklist (A–L), GPUS semantic
      tokens, FK indexes for any DB-touching agent

---

## Spawn Budget Check

NeonDash enforces a **Max 5 agent spawns per user request** ceiling
(`CLAUDE.md § Stopping Conditions`). When designing an agent that spawns sub-agents,
verify the worst-case spawn count fits inside that ceiling. If it does not, the agent
must include an explicit checkpoint step that asks the user before continuing past
the 5th spawn.

---

## Read-Only Agent Convention

Agents that never write files (currently `explorer`, `explorer-agent`, `librarian`)
are enforced by `task_routing_guard.py` to use `run_in_background: true`. When adding
a new read-only agent, register it in the `MUST_BACKGROUND` set in
`task_routing_guard.py` to keep this guarantee.

---

## Context Handoff Format

Every agent prompt should end with the standard handoff section:

```
## Context Handoff
Status:    <success | partial | failed>
Artifacts: <list of file paths>
Gates:     <which quality gates ran and their results>
Next:      <what the parent agent should do next>
```

The `subagent_log.py` hook reads transcript line counts from this section to keep
log entries useful. Skipping the handoff section degrades observability.

---

## Sub-agent Return Budget

`AGENTS.md:21` is binding: **sub-agents MUST return < 2000 tokens to main context.**
If your agent's structured output exceeds this, restructure to write detail to
`.claude/agent-memory/<agent>/` and return only the summary index.

---

## See also

- `AGENTS.md § WISC 3-Tier Loading Protocol` — the Tier 1 budget rule.
- `CLAUDE.md § Stopping Conditions` — the 5-spawn ceiling.
- `.claude/docs/hooks-guide.md` — how `subagent_start.py` and `task_routing_guard.py`
  enforce handoff and background-mode contracts.
- `.claude/docs/session-patterns.md § Pattern 4` — background agent coordination
  protocol.
