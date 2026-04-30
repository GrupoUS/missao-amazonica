#!/usr/bin/env python3
"""ultracite_check.py - Run OXLint check before Claude stops.
Only blocks on critical errors (not style warnings) in modified files.
Trigger: Stop
"""
import json
import re
import subprocess
import sys
import typing



def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


def get_modified_files() -> list[str]:
    """Get list of modified TypeScript/JavaScript files via git diff."""
    try:
        result = _ = subprocess.run(
            ["git", "diff", "--name-only", "--diff-filter=ACM"],
            capture_output=True, text=True, timeout=10,
        )
        files = result.stdout.strip().splitlines()
        ts_files = [
            f for f in files
            if f.endswith((".ts", ".tsx", ".js", ".jsx"))
        ]
        return ts_files[:20]  # limit like original
    except Exception:
        return []


def main() -> None:
    data: dict[str, object] = read_input()

    # Early exit if already in stop hook loop to prevent infinite recursion
    if data.get("stop_hook_active") is True:
        sys.exit(0)

    modified_files = get_modified_files()
    if not modified_files:
        sys.exit(0)

    try:
        result = _ = subprocess.run(
            ["bunx", "oxlint", *modified_files],
            capture_output=True, text=True, timeout=30,
        )
        raw_output = result.stdout + result.stderr
    except Exception:
        # Don't block if oxlint fails to run
        sys.exit(0)

    # Only block on errors, not warnings
    error_match = re.search(r"(\d+) error", raw_output)
    error_count = int(error_match.group(1)) if error_match else 0

    if error_count > 0:
        truncated = "\n".join(raw_output.splitlines()[-30:])[:2000]
        print(json.dumps({
            "decision": "block",
            "reason": f"OXLint found {error_count} error(s). Fix them before stopping:\n\n{truncated}",
        }))
        return

    # No critical errors — allow Claude to stop
    sys.exit(0)


if __name__ == "__main__":
    main()
    sys.exit(0)
