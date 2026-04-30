#!/usr/bin/env python3
"""ultracite_fix.py - PostToolUse hook: FORMAT-ONLY (no lint auto-fix).

Architecture:
  - PostToolUse (this file): `biome format --write` = cosmetic formatting ONLY
  - Stop hook (ultracite_check.py): lint checking (read-only, no auto-fix)
  - Manual: `bunx biome check --write` when developer is ready

WHY format-only?
  `biome check --write` runs formatter + linter + assists with auto-fix.
  The linter's `noUnusedImports` rule (level: "error", fix: "safe") AUTO-DELETES
  imports it considers unused. During multi-step edits, an import added in step N
  may not have its usage code written until step N+1. Biome fires between steps
  and removes the "unused" import — causing cascading errors.

  `biome format --write` ONLY touches whitespace, indentation, quotes, semicolons,
  trailing commas, and line width. It NEVER removes imports, variables, or code.

  OXLint `--fix` was also removed from PostToolUse for the same reason: auto-fix
  rules can delete or rewrite code that is still being constructed across edits.

Trigger: PostToolUse (Write|Edit)
"""
import json
import subprocess
import sys
import typing
from pathlib import Path

TS_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".json"}


def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


def main() -> None:
    data: dict[str, object] = read_input()
    file_path: str = str(
        data.get("file_path")
        or typing.cast(dict[str, object], data.get("tool_input", {})).get(
            "file_path", ""
        )
    )

    if not file_path:
        sys.exit(0)

    suffix = Path(file_path).suffix.lower()
    if suffix not in TS_EXTENSIONS:
        sys.exit(0)

    # FORMAT-ONLY: `biome format --write` applies cosmetic formatting without
    # running the linter or assists. This preserves all imports and code
    # structure while keeping formatting consistent.
    #
    # DO NOT change this to `biome check --write` — that enables linter auto-fix
    # which deletes imports mid-edit (noUnusedImports, organizeImports, etc.)
    try:
        subprocess.run(
            ["bunx", "biome", "format", file_path, "--write"],
            capture_output=True,
            timeout=30,
        )
    except Exception:
        pass

    # NOTE: OXLint auto-fix intentionally removed from PostToolUse.
    # Lint fixes (both Biome and OXLint) should only run:
    #   1. At the Stop hook (ultracite_check.py) — read-only check
    #   2. Manually via `bunx biome check --write && bun run lint:oxlint`
    # This prevents auto-fix rules from deleting or rewriting code
    # that is still being constructed across multi-step edits.


if __name__ == "__main__":
    main()
    sys.exit(0)
