#!/usr/bin/env python3
"""subagent_log.py - Log subagent completion for observability.
Trigger: SubagentStop
"""
import json
import os
import sys
import typing

from datetime import datetime, timezone
from pathlib import Path

SKIP_TYPES = {"Explore", "general-purpose", "Bash"}


def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


def main() -> None:
    data: dict[str, object] = read_input()
    agent_type = str(data.get("agent_type", "unknown"))
    agent_id = str(data.get("agent_id", "unknown"))
    session_id = str(data.get("session_id", "unknown"))
    transcript_path = str(data.get("agent_transcript_path", ""))
    was_background = str(data.get("background", "unknown"))

    if agent_type in SKIP_TYPES:
        sys.exit(0)

    # Count transcript lines as complexity proxy
    transcript_lines = 0
    if transcript_path and Path(transcript_path).is_file():
        try:
            transcript_lines = Path(transcript_path).read_text(errors="replace").count("\n")
        except Exception:
            pass

    # Skip very small transcripts (quick lookups)
    if transcript_lines < 20:
        sys.exit(0)

    project_dir = os.environ.get("CLAUDE_PROJECT_DIR") or str(Path(__file__).parent.parent.parent)
    log_dir = Path(project_dir) / ".claude" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    entry = json.dumps({
        "timestamp": ts,
        "session_id": session_id,
        "agent_id": agent_id,
        "agent_type": agent_type,
        "transcript_lines": transcript_lines,
        "background": str(was_background),
    })

    with (log_dir / "subagent-events.jsonl").open("a") as f:
        _ = f.write(entry + "\n")


if __name__ == "__main__":
    main()
    sys.exit(0)
