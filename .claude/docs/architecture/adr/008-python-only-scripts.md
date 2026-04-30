# ADR-008: All Automation Scripts Must Be Written in Python 3 (Shell Scripts Forbidden)

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

The project runs on Windows (development) and Linux (production/CI). Shell scripts (.sh, .bash) behave differently across platforms -- Windows requires WSL or Git Bash, leading to cross-platform inconsistencies and CI failures. The team needed a consistent scripting language that works identically everywhere.

## Decision

All automation scripts, hooks, and utilities MUST be written in Python 3 using only stdlib (no pip installs). Shell scripts (.sh, .bash, .zsh) are explicitly forbidden. Convention: hooks in `.claude/hooks/*.py`, utilities in `.claude/scripts/*.py`, project scripts in `scripts/*.py`.

## Consequences

**Positive:**
- Cross-platform consistency: same Python script runs on Windows dev and Linux CI
- stdlib-only constraint prevents dependency management issues
- Python is already available in the development environment
- More expressive than shell for JSON parsing, path manipulation, and subprocess management

**Negative / Trade-offs:**
- Python is less ergonomic than bash for simple one-liners
- Developers must know Python for basic automation tasks
- Slightly more verbose than equivalent shell scripts for simple operations

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Shell scripts (.sh/.bash) | Terse, widely known, fast | Platform-dependent (WSL required on Windows dev), CRLF/LF issues in CI | Rejected: cross-platform failures |
| B — Python 3 stdlib only | Cross-platform, expressive, JSON/subprocess/pathlib built-in | More verbose than bash for simple one-liners | **Chosen** |
| C — Node.js/TypeScript scripts | Already in the project's language | Requires bun/node to be available, package.json dependency management | Rejected: adds dependency surface |
| D — Makefile | Standard, declarative | Platform-dependent (make), same Windows compatibility issues as shell | Rejected: platform issues |

## Related ADRs

- [ADR-013](013-wisc-documentation.md) — WISC documentation hooks are implemented as Python scripts in `.claude/hooks/`
