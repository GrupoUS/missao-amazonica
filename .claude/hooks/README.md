# Claude Code Hooks

## Overview

Hooks increase agent autonomy while keeping safety guardrails. All hooks are **Python 3** (`.py`) — shell scripts intentionally avoided for portability across Windows / macOS / Linux.

Project-specific values (project name, package manager, protected paths) come from `.claude/config.json` and `${overlay}/...`. Hooks read these at runtime — no per-project edits needed.

## Configured hooks

### SessionStart
- **session_context.py** — loads `AGENTS.md` via `additionalContext` (cross-platform standard) + project tag (from `config.json::project.name` + `tooling.packageManager`) + git branch.

### PreToolUse
- **smart_bash_approver.py** — auto-approves safe commands (read-only git, bun/npm/pnpm/yarn build/test/lint, version checks, common DB CLIs); blocks dangerous patterns (`rm -rf /`, `DROP DATABASE`, force-push to main); asks on cleanup operations.
- **protect_files.py** — blocks edits to sensitive files. Generic defaults: `.env*`, lockfiles, `.git/`. Per-project additions read from `config.json::protectedFiles` + `${overlay}/protected-files.json`.
- **task_routing_guard.py** — validates subagent name + enforces `run_in_background` when runtime exposes the field.

### PostToolUse
- **ultracite_fix.py** — runs project formatter/linter after edit (Biome / Prettier / equivalent — read from config).

### Stop
- **ultracite_check.py** — verifies lint before stopping; blocks on errors.
- **background_cleanup.py** — logs stop event for observability.

### SubagentStart
- **subagent_start.py** — injects context when subagents launch.

### SubagentStop
- **subagent_log.py** — logs subagent events to `.claude/logs/subagent-events.jsonl`.
- **evaluator_escalation.py** — flags escalation to evaluator (Mode 3) on repeated failures.

### TaskCompleted
- **task_completed.py** — logs team task completions.

### Notification
- **notify.py** — desktop notifications (WSL / Linux / macOS).

---

## Auto-approved commands (examples)

```bash
# Git read-only
git status, git diff, git log, git branch, git fetch, git show

# Filesystem read
ls, cat, head, tail, grep, rg, find, which, pwd, echo, tree, stat, wc

# Package managers (any of: bun / npm / pnpm / yarn)
<pm> install, <pm> run test, <pm> run lint, <pm> run build, <pm> run dev
bunx / npx / pnpm dlx / yarn dlx

# Type checkers
tsc, tsgo

# Database / cloud CLIs (read-only introspection)
neonctl, supabase, fly, vercel, railway, wrangler
psql, mysql, sqlite3

# Version checks
python --version, node --version, bun --version, etc.
```

---

## Always-blocked commands

```bash
# Destructive
rm -rf /, rm -rf ~, rm -rf $HOME

# Database
DROP DATABASE, DROP TABLE, TRUNCATE

# Git dangerous
git push --force main, git push --force master, git reset --hard HEAD~

# System
chmod -R 777 /, dd if=... of=/dev/, :(){ :|:& };:
sudo rm, truncate -s 0, mkfs
```

---

## Protected files

Defaults (every project):

| Pattern | Reason |
|---|---|
| `.env*` | Credentials |
| `credentials/`, `secrets/`, `api-keys/` | Sensitive data |
| `.git/` | Repository state |
| `bun.lockb`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` | Lockfiles |

Add per-project entries via `.claude/config.json::protectedFiles` or `${overlay}/protected-files.json` (e.g., migration directories, infra config).

---

## Testing hooks

```bash
# Test safe command approval
echo '{"tool_input":{"command":"bun test"}}' | python3 .claude/hooks/smart_bash_approver.py
# Expected: {"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}

# Test dangerous command block
echo '{"tool_input":{"command":"rm -rf /"}}' | python3 .claude/hooks/smart_bash_approver.py
# Expected: deny

# Test file protection
echo '{"tool_input":{"file_path":"./.env"}}' | python3 .claude/hooks/protect_files.py
# Expected: deny
```

---

## Logs

```
.claude/logs/subagent-events.jsonl
.claude/logs/evaluator-escalation.jsonl
.claude/logs/evaluator-failure-count.txt
```

Format example:
```json
{"timestamp": "2026-04-30T12:00:00Z", "agent": "debugger", "status": "completed", "duration_ms": 5000}
```

---

## Debug

```bash
/hooks                # show active hooks in Claude Code
claude --debug        # debug mode (hook execution trace)
Ctrl+O                # verbose mode in transcript
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      HOOK FLOW                                │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  SessionStart ───► session_context.py ──► AGENTS.md + tag     │
│                                                                │
│  PreToolUse ─────► smart_bash_approver.py (Bash)              │
│               ├──► protect_files.py (Edit / Write)            │
│               └──► task_routing_guard.py (Agent)              │
│                        │                                       │
│                        ▼                                       │
│               ┌─────────────────┐                              │
│               │ ALLOW / DENY /  │                              │
│               │ ASK             │                              │
│               └─────────────────┘                              │
│                                                                │
│  PostToolUse ────► ultracite_fix.py (formatter + lint fix)    │
│                                                                │
│  SubagentStart ──► subagent_start.py (context injection)      │
│  SubagentStop ───► evaluator_escalation.py + subagent_log.py  │
│                                                                │
│  TaskCompleted ──► task_completed.py (team event log)         │
│                                                                │
│  Stop ───────────► ultracite_check.py + background_cleanup.py │
│                                                                │
│  Notification ───► notify.py (desktop toast)                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Rollback

If hooks cause problems:

```bash
# Quick disable: remove "hooks" section from settings.json

# Full rollback:
git checkout .claude/settings.json
rm .claude/hooks/*.py
rm -rf .claude/logs
```
