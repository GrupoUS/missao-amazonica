#!/usr/bin/env python3
"""subagent_start.py - Inject context when subagents start.
Trigger: SubagentStart
"""
import json
import sys
import typing


AGENT_CONTEXT = {
    "frontend-specialist": (
        "Bun | semantic colors | AGENTS.md | BG: end with ## Context Handoff (Status+Artifacts+Gates+Next)"
    ),
    "debugger": (
        "Debug: systematic | check+test | logs in .claude/logs/ | end with ## Context Handoff"
    ),
    "performance-optimizer": (
        "Perf/Sec/SEO: measure-first | OWASP+CWV+meta | BG: end with ## Context Handoff (Status+Artifacts+Gates+Next)"
    ),
    "explorer-agent": (
        "Codebase-only | Grep+Glob+Read | paths+evidence | Librarian Requests | end with ## Context Handoff"
    ),
    "explorer": (
        "Codebase-only | Grep+Glob+Read | paths+evidence | Librarian Requests | end with ## Context Handoff"
    ),
    "project-planner": (
        "D.R.P.I.V plan | atomic tasks | dependencies | end with ## Context Handoff"
    ),
    "mobile-developer": (
        "Mobile-first | touch+perf+offline | BG: end with ## Context Handoff (Status+Artifacts+Gates+Next)"
    ),
    "orchestrator": (
        "Orchestrate: classify → delegate → verify → close | end with ## Context Handoff"
    ),
    "evaluator": (
        "Adversarial review | Mode1: Plan ambiguity+edges+contracts | Mode2: Sprint bugs+scores | Mode3: Architecture analysis (no file writes) | file:line required | end with ## Context Handoff"
    ),
    "librarian": (
        "External docs only | Tavily+Context7 | never touch filesystem | <2000 tokens | end with ## Context Handoff"
    ),
}


def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


def main() -> None:
    data: dict[str, object] = read_input()
    agent_type = str(data.get("agent_type", ""))

    context = AGENT_CONTEXT.get(agent_type)
    if not context:
        sys.exit(0)

    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "SubagentStart",
            "additionalContext": context,
        }
    }))


if __name__ == "__main__":
    main()
    sys.exit(0)
