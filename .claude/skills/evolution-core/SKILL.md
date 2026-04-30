---
name: evolution-core
description: Use when starting sessions to load historical context, or after fixing errors to capture learnings for future reference. Provides persistent SQLite-based memory across sessions.
---

# Evolution Core

Minimalist persistent memory system across Claude Code sessions.

## How It Works

**Python hooks** (in `.claude/hooks/`) capture events automatically:
- `session_context.py` → loads historical context on SessionStart
- `task_completed.py` → records completions on PostToolUse
- `subagent_log.py` → logs sub-agents on Stop

> All hooks are `.py` — shell scripts (`.sh`) are intentionally not used here for portability across Windows / macOS / Linux.

**CLI** (`memory_manager.py`) for manual SQLite queries.

## Generated Files

```
.claude/docs/evolution/
├── errors.jsonl     # Errors captured by hooks
├── sessions.jsonl   # Session logs
└── memory.db        # SQLite DB (via CLI)
```

## CLI Commands

```bash
# Initialize database
python .claude/skills/evolution-core/scripts/memory_manager.py init

# Manage sessions
python .claude/skills/evolution-core/scripts/memory_manager.py session start -t "task"
python .claude/skills/evolution-core/scripts/memory_manager.py capture "observation"
python .claude/skills/evolution-core/scripts/memory_manager.py session end -s "summary"

# Load context
python .claude/skills/evolution-core/scripts/memory_manager.py load_context --project "$PWD"

# Stats
python .claude/skills/evolution-core/scripts/memory_manager.py stats
```

---

## Learning Capture (/evolve)

### Capture Template

```bash
# CLI already supports observation capture
python .claude/skills/evolution-core/scripts/memory_manager.py capture \
  "Problem: [description] | Root: [cause] | Fix: [solution]" \
  -t bug_fix
```

### Available Commands

| Command | Description |
|---|---|
| `capture "desc" -t "tool"` | Capture observation |
| `session start -t "task"` | Start session |
| `session end -s "summary"` | End session |
| `load_context --project PATH` | Load historical context |
| `stats` | Database statistics |

### Integration with `/evolve`

The `/evolve` command uses this CLI to:
1. Persist learnings automatically
2. Suggest improvements to skills
3. Update subdirectory `AGENTS.md` files

## Configuration

This skill is **fully generic** — no project-specific configuration required. Database paths are relative to the project root; sessions are scoped per project automatically via the `--project` flag.

To use in a different project: copy `.claude/skills/evolution-core/` and `.claude/hooks/{session_context,task_completed,subagent_log}.py` to the new project. The hooks are wired in `.claude/settings.json` — copy those entries too.
