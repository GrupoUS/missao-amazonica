---
description: Capture learnings after successful tasks. Updates skills and project AGENTS.md to prevent recurring errors.
workflow_type: prompt-chaining
---

# /evolve — Learning Capture

**ARGUMENTS**: $ARGUMENTS

---

## 0. Mode detection

| Token in `$ARGUMENTS` | Behavior |
|---|---|
| (none) | Manual capture flow (§ 1-5) |
| `auto` | Skip § 1-5, run AutoResearch Loop per `_shared.md` § 10. Target skill is second arg (e.g. `/evolve auto debugger`). Default: all skills with `evals.json`. |
| `handoff` | Write session state per `.claude/templates/handoff-template.md` |

---

## 1. First action

```typescript
Skill("evolution-core"); // Persistent memory + CLI
```

---

## 2. Capture flow

### 2.1 Gather session context

Analyze the current conversation to identify:

```markdown
## Session Context

### Task completed
[brief description]

### Problem found
[bug/error/issue]

### Root cause
[identified root cause]

### Solution applied
[code or specific changes]

### Validation
[commands run: type-check, lint, test, etc.]
```

### 2.2 Persist to evolution-core

```bash
python .claude/skills/evolution-core/scripts/memory_manager.py capture \
  "[learning description]" \
  -t bug_fix \
  --files "[modified files]" \
  --root-cause "[root cause]"
```

---

## 3. Skill selection

Based on modified file paths + `_shared.md` § 6 (Skill-to-Domain Matrix), identify affected skills.

Generic mapping (override via `${overlay}/routing-supplements.md` if present):

- `${paths.backendRoot}` → `debugger`
- `${paths.schemaRoot}` → `debugger` + (Postgres-only) `supabase-postgres-best-practices`
- `${paths.frontendRoot}` → `debugger` + `ui-ux-pro-max` (if styling/design)
- Performance changes → `performance-optimization`
- Skill files themselves → `skill-creator`
- Memory infrastructure → `evolution-core`

Ask user which skills to update if multiple are relevant and not obvious.

---

## 4. Improve skills

For each selected skill, add to `references/` or the relevant SKILL.md section:

```markdown
## Case: [Bug/Problem Name]

**Symptom:** [user-perceived]
**Root cause:** [technical]
**Fix:** [solution applied]
**Files:** [file list]
**Validation:** [gates run]

### Anti-pattern discovered

// ❌ WRONG
[problematic code]

// ✅ CORRECT
[correct code]
```

Categorize:

| Type | Where | When |
|---|---|---|
| Stability rule | dedicated section | Rules to prevent crashes |
| Anti-pattern | existing section | Problematic patterns |
| Known case | `references/` | Complex documented cases |
| Quick reference | existing table | Quick tips |

---

## 5. Improve AGENTS.md (project-level)

Identify the target AGENTS.md from the modified file path:

- Edits in `${paths.backendRoot}/**` → backend AGENTS.md if it exists
- Edits in `${paths.frontendRoot}/**` → frontend AGENTS.md if it exists
- Edits in `${paths.schemaRoot}/**` → schema AGENTS.md if it exists
- Otherwise → root `AGENTS.md`

Add a new section:

```markdown
### [YYYY-MM-DD] [Learning Title]

> Added after bug fix in `[file]`.

**Problem:** [description]
**Cause:** [root cause]
**Solution:** [fix applied]
```

---

## 6. Summary

```
Learning captured successfully.

Memory: evolution-core updated
Skills improved: [list]
AGENTS.md updated: [list]
```

---

## References

- `evolution-core` skill: `.claude/skills/evolution-core/SKILL.md`
- `skill-creator` skill: `.claude/skills/skill-creator/SKILL.md`
- AutoResearch Loop: `_shared.md` § 10
- Handoff template: `.claude/templates/handoff-template.md`
