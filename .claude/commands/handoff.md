---
description: Write session state for continuation in a new conversation
workflow_type: prompt-chaining
---

# /handoff — Session State Handoff

Write the current session state to a structured file so a new conversation can pick up where this one left off.

## Instructions

1. Gather current state:
   - What task was being worked on
   - What files were modified (from `git diff --name-only`)
   - Key decisions made and why
   - Dead ends tried (and why they failed)
   - What's left to do
2. Write to `.claude/docs/evolution/HANDOFF.md` with this structure:

```markdown
# Handoff — {date}

## Task
{What was being done}

## Status
{In progress / Blocked / Nearly complete}

## Files Changed
{List from git diff}

## Decisions Made
{Key choices and rationale}

## Dead Ends
{What was tried and failed, so the next session doesn't repeat}

## Next Steps
{Exactly what to do next, in priority order}

## Context to Load
{Which /prime variant or specific files the next session should read}
```

3. Confirm the handoff was written and show the "Next Steps" section.

> **WISC Compress**: This is the "C" in WISC — when a session gets long, externalize state before context degrades.
