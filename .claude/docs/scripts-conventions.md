# Scripts Conventions — Python 3 Only

> Tier 3 doc. Read on demand when writing or modifying any automation script.
> Hard rule from `AGENTS.md` Cardinal Rule #3: shell scripts are forbidden.

---

## Hard Rules

- **All automation scripts MUST be Python 3.**
- **Shell scripts (`.sh`, `.bash`, `.zsh`) are FORBIDDEN.** Never create them, never invoke them.
- **Use Python stdlib only** — no `pip install`. Allowed modules: `json`, `subprocess`,
  `pathlib`, `re`, `argparse`, `datetime`, `time`, `os`, `sys`, `typing`.
- **Invocation:** `python script.py`, or use `#!/usr/bin/env python3` shebang on
  executables. Hooks registered in `settings.json` use the form
  `"command": "python \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/<name>.py"`.

---

## Conventions Table

| Aspect | Rule |
|--------|------|
| **Location** | Hooks → `.claude/hooks/*.py` · CLI utilities → `.claude/scripts/*.py` · Project tooling → `scripts/*.py` |
| **Dependencies** | Only Python stdlib (`json`, `subprocess`, `pathlib`, `re`, `argparse`, `datetime`) — never `pip install` |
| **Hook stdin** | `json.loads(sys.stdin.read() or "{}")` — never parse with `grep -oP` or shell tricks |
| **Hook stdout** | `print(json.dumps({...}))` — emit `hookSpecificOutput` shape per Claude Code hook contract |
| **External processes** | `subprocess.run(["bun", ...], capture_output=True, text=True, timeout=N)` — always set a timeout |
| **Filesystem** | `pathlib.Path` — never concatenate strings to build paths |
| **CLI flags / args** | `argparse.ArgumentParser` for any script with parameters |
| **File permissions** | `chmod +x <file>` after creating an executable hook (Unix) |
| **settings.json registration** | Hook commands use `"python \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/<name>.py"` exactly |

---

## Standard Hook Skeleton

Use this skeleton as the starting point for any new hook in `.claude/hooks/`:

```python
#!/usr/bin/env python3
"""<hook_name>.py - <one-line purpose>
Trigger: <SessionStart | PreToolUse | PostToolUse | Stop | SubagentStart | SubagentStop | TaskCompleted | Notification>
"""
import json
import sys
import typing


def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


def main() -> None:
    data: dict[str, object] = read_input()
    # ... hook logic here ...
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "<EventName>",
        # ... event-specific keys ...
    }}))


if __name__ == "__main__":
    main()
    sys.exit(0)
```

---

## See also

- `.claude/docs/hooks-guide.md` — full inventory of the 12 existing hooks and proposed
  enhancements (H1–H5).
- `AGENTS.md § Cardinal Rules` — the binding rule that this doc operationalizes.
