#!/usr/bin/env python3
"""evaluator_escalation.py - Detects repeated subagent failures and escalates.
Trigger: SubagentStop
"""
import json
import os
import re
import sys
import typing

from datetime import datetime, timezone
from pathlib import Path

# Agents monitored for failure signals (evaluator excluded to prevent self-escalation)
KNOWN_AGENTS = {
    "orchestrator", "debugger", "frontend-specialist",
    "performance-optimizer", "mobile-developer", "project-planner",
    "explorer-agent", "explorer", "librarian",
}

FAIL_PATTERN = re.compile(r"\b(fail|failed|error|exception|traceback|panic)\b", re.IGNORECASE)


def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


def main() -> None:
    data: dict[str, object] = read_input()
    agent_type = str(data.get("agent_type", "unknown"))
    transcript_path = str(data.get("agent_transcript_path", ""))

    if agent_type not in KNOWN_AGENTS:
        sys.exit(0)

    fail_signal = False
    if transcript_path and Path(transcript_path).is_file():
        content = Path(transcript_path).read_text(errors="replace")
        if FAIL_PATTERN.search(content):
            fail_signal = True

    if not fail_signal:
        sys.exit(0)

    project_dir = os.environ.get("CLAUDE_PROJECT_DIR") or str(Path(__file__).parent.parent.parent)
    log_dir = Path(project_dir) / ".claude" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)

    counter_file = log_dir / "evaluator-failure-count.txt"
    log_file = log_dir / "evaluator-escalation.jsonl"

    try:
        count = int(counter_file.read_text().strip())
    except Exception:
        count = 0
    count += 1
    counter_file.write_text(str(count))

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    entry = json.dumps({"timestamp": ts, "agent": agent_type, "count": count})
    with log_file.open("a") as f:
        _ = f.write(entry + "\n")

    if count >= 2:
        print(f"EVALUATOR ESCALATION: repeated failure signals detected ({count}).", file=sys.stderr)
        print("Action: delegate analysis to evaluator (Mode 3: Architecture Analysis), then resume implementation with evidence.", file=sys.stderr)
        counter_file.write_text("0")


if __name__ == "__main__":
    main()
    sys.exit(0)
