#!/usr/bin/env python3
"""session_context.py - Session context injection with AGENTS.md auto-loading.
Outputs structured JSON with additionalContext for cross-platform AGENTS.md compatibility.
Trigger: SessionStart
"""
import json
import os
import subprocess
import sys
import typing

from pathlib import Path


def read_input() -> dict[str, object]:
    try:
        import select
        if select.select([sys.stdin], [], [], 0.2)[0]:
            raw = sys.stdin.read()
            return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        pass
    return {}


def get_git_branch(project_dir: str) -> str:
    try:
        result = _ = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=3, cwd=project_dir,
        )
        return result.stdout.strip() or "unknown"
    except Exception:
        return "unknown"


def get_project_dir() -> str:
    if d := os.environ.get("CLAUDE_PROJECT_DIR"):
        return d
    try:
        result = _ = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, timeout=3,
        )
        return result.stdout.strip() or os.getcwd()
    except Exception:
        return os.getcwd()


def main() -> None:
    data: dict[str, object] = read_input()
    source = str(data.get("source", "startup"))

    project_dir = get_project_dir()
    branch = get_git_branch(project_dir)

    # Build context prefix based on session event source
    prefixes = {
        "startup": f"[NEONDASH] Bun | branch:{branch} | gates: check+lint+test | db:push",
        "compact": f"[NEONDASH] Bun, check, lint:check, test, db:push | branch:{branch}",
        "resume": f"[NEONDASH] Resumed | branch:{branch}",
    }
    context_prefix = prefixes.get(source, f"[NEONDASH] branch:{branch}")

    # Load AGENTS.md content
    agents_content = ""
    agents_file = Path(project_dir) / "AGENTS.md"
    if agents_file.is_file():
        try:
            agents_content = agents_file.read_text(errors="replace")
        except Exception:
            pass

    if agents_content:
        additional_context = (
            f"{context_prefix}\n\n"
            "--- AGENTS.md (auto-loaded by SessionStart hook) ---\n"
            f"{agents_content}"
        )
    else:
        additional_context = context_prefix

    output = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": additional_context,
        }
    }
    print(json.dumps(output))


if __name__ == "__main__":
    main()
    sys.exit(0)
