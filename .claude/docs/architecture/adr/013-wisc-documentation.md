# ADR-013: WISC 3-Tier AGENTS.md Documentation System

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

Neondash is developed with AI coding assistants (Claude Code, OpenCode) as first-class collaborators. Without structured context management, AI agents either lack critical project knowledge (causing regressions) or consume excessive context window budget (causing truncation and degraded performance).

The challenge: how to make project rules, patterns, and conventions available to AI agents precisely when they are needed, without loading everything upfront.

## Decision

Implement the **WISC (When In Scope Context) 3-Tier loading system** using AGENTS.md files:

| Tier | Location | When Loaded | Budget |
|------|----------|-------------|--------|
| 1 | Root `AGENTS.md` + `.claude/CLAUDE.md` | Always | <500 lines combined |
| 2 | `.claude/rules/*.md` | Auto-loaded by glob pattern when editing matching files | Per-domain |
| 3 | `.claude/docs/*.md` | Never auto-loaded — agents read on demand | Unlimited |

Subdirectory `AGENTS.md` files are loaded as canonical domain authority when editing files in that directory. There are currently 17 AGENTS.md files across the project.

Priority order: Subdirectory `AGENTS.md` > `.claude/rules/` > Root `AGENTS.md` > `.claude/CLAUDE.md` > `.claude/docs/`

## Consequences

**Positive:**
- AI agents have precise context for the domain they are editing without loading unrelated rules
- Critical patterns (auth procedure hierarchy, FK indexing, LGPD consent) are surfaced at the right moment
- Dated rules with origin markers (e.g., "2026-02-27") provide traceability to original bugs
- Tier 3 docs can be arbitrarily large without impacting Tier 1 context budget
- The system is self-documenting: rules live in the codebase, versioned with git

**Negative / Trade-offs:**
- AGENTS.md files require maintenance discipline — outdated rules can mislead AI agents
- The 500-line Tier 1 budget is currently slightly exceeded (273 + 273 = 546 lines)
- New team members must understand the loading hierarchy before modifying AGENTS.md files
- Duplication can occur when rules are added to multiple tiers without cross-checking

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Single root AGENTS.md | Simple, one place to look | Grows unbounded, entire project context loaded for every change — context window bloat | Rejected: token budget violation |
| B — Flat rules directory | Better than single file | No locality — frontend rules load when editing database code | Rejected: no scope filtering |
| C — WISC 3-Tier (always/auto-glob/on-demand) | Precise context delivery, unlimited Tier 3 size, self-documenting | Maintenance discipline required, slight over-budget on Tier 1 (546 vs 500 target) | **Chosen** |

## Related ADRs

- [ADR-008](008-python-only-scripts.md) — WISC hook scripts (subagent_start.py, task_routing_guard.py) are Python
