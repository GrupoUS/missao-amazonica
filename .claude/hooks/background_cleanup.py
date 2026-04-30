#!/usr/bin/env python3
"""background_cleanup.py - Log Stop events (silent, no context noise)
Trigger: Stop
"""
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

project_dir = os.environ.get("CLAUDE_PROJECT_DIR", "")
if not project_dir:
    # Fallback: 3 levels up from this file (.claude/hooks/background_cleanup.py)
    project_dir = str(Path(__file__).parent.parent.parent)

log_dir = Path(project_dir) / ".claude" / "logs"
log_dir.mkdir(parents=True, exist_ok=True)

ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
log_file = log_dir / "background-cleanup.log"
with log_file.open("a") as f:
    _ = f.write(f"[{ts}] Session stopped.\n")

sys.exit(0)
