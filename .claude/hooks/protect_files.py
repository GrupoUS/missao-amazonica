#!/usr/bin/env python3
"""protect_files.py - Block modifications to sensitive files.
Trigger: PreToolUse (Edit|Write)
"""
import json
import sys
import typing

from pathlib import PurePath

# Exact filename matches — prevent false positives from substring matching
# e.g. ".env" should not block "environment.ts"
PROTECTED_EXACT = {
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    "bun.lockb",
    "bun.lock",
}

# Path segment patterns — matched against individual path components only,
# so "credentials" blocks "credentials/secret.json" but NOT "credentials-form.tsx"
PROTECTED_SEGMENTS = {"credentials", "secrets", "api-keys"}

# Directory/path containment — patterns with separators are safe for substring
# matching (e.g. ".git/" is distinct from ".github/")
PROTECTED_CONTAINS = [
    ".git/",
    ".git\\",
    "drizzle/migrations/",
]


def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


def deny(reason: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))


def allow() -> None:
    sys.exit(0)


def main() -> None:
    data: dict[str, object] = read_input()
    # Support both top-level and nested tool_input
    file_path = str(
        data.get("file_path")
        or typing.cast(dict[str, object], data.get("tool_input", {})).get("file_path", "")
    )

    if not file_path:
        allow()
        return

    # Exact filename check (avoids false positives like ".env" matching "environment.ts")
    if PurePath(str(file_path)).name in PROTECTED_EXACT:
        deny(f"BLOCKED: '{file_path}' is a protected file")
        return

    path_parts = set(PurePath(str(file_path)).parts)
    for segment in PROTECTED_SEGMENTS:
        if segment in path_parts:
            deny(f"BLOCKED: '{file_path}' contains protected path segment '{segment}'")
            return

    # Directory containment check for patterns that include separators
    for pattern in PROTECTED_CONTAINS:
        if pattern in file_path:
            deny(f"BLOCKED: '{file_path}' matches protected pattern '{pattern}'")
            return

    allow()


if __name__ == "__main__":
    main()
    sys.exit(0)
