---
description: Capture learnings after successful tasks, improve skills and AGENTS.md to prevent recurring errors.
workflow_type: prompt-chaining
---

# /evolve — Learning Capture

**ARGUMENTS**: $ARGUMENTS

---

## 0. MODE DETECTION

If `$ARGUMENTS` contains `auto`:
1. Skip Sections 1-5 (manual capture)
2. Execute AutoResearch Loop per `_shared.md` Section 5
3. Target skill: second arg after `auto` (e.g. `/evolve auto meta-api-integration`)
4. No skill specified: find all skills with `evals.json` and run sequentially

---

## 1. FIRST ACTION

```typescript
Skill("evolution-core"); // Persistent memory + CLI
```

---

## 2. CAPTURE FLOW

### 2.1 Gather Session Context

Analyze the current conversation to identify:

```markdown
## Session Context

### Task Completed
[Brief description of what was done]

### Problem Found
[Bug/error/issue description]

### Root Cause
[Identified root cause]

### Solution Applied
[Code or specific changes]

### Validation
[Commands run: type-check, lint, test, etc.]
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

## 3. SKILL SELECTION

Based on modified file paths, identify affected skills:

- `apps/api/src/routers/` → `debugger`
- `apps/api/drizzle/` → `debugger`
- `apps/web/src/` → `debugger`
- `apps/api/src/services/` → `meta-api-integration` (if Meta/WhatsApp)
- Performance changes → `performance-optimization`
- Skill files themselves → `skill-creator`

Ask the user which skills to update if multiple are relevant.

---

## 4. IMPROVE SKILLS

For each selected skill, add to its `references/` or relevant SKILL.md section:

```markdown
## Case: [Bug/Problem Name]

**Symptom:** [What the user perceives]
**Root Cause:** [Technical cause]
**Fix:** [Solution applied]
**Files:** [file list]
**Validation:** [gates run]

### Anti-Pattern Discovered

// ❌ WRONG
[problematic code]

// ✅ CORRECT
[correct code]
```

Update type based on finding:

| Type | Where | When |
|------|-------|------|
| Stability Rule | Dedicated section | Rules to prevent crashes |
| Anti-Pattern | Existing section | Problematic patterns |
| Known Case | `references/` | Complex documented cases |
| Quick Reference | Existing table | Quick tips |

---

## 5. IMPROVE AGENTS.MD

Based on modified files, identify target AGENTS.md:

| Modified File | Target AGENTS.md |
|---------------|-----------------|
| `apps/api/src/routers/*.ts` | `apps/api/src/AGENTS.md` |
| `apps/api/drizzle/schema.ts` | `apps/api/drizzle/AGENTS.md` |
| `apps/web/src/components/*.tsx` | `apps/web/src/AGENTS.md` |
| `packages/ai-gateway/*` | `packages/ai-gateway/AGENTS.md` |

Add a new section:

```markdown
### [YYYY-MM-DD] [Learning Title]

> Added after bug fix in `[file]`.

**Problem:** [Description]
**Cause:** [Root cause]
**Solution:** [Fix applied]
```

---

## 6. SUMMARY

```
✅ Learning captured successfully!

Memory: evolution-core updated
Skills improved: [list]
AGENTS.md updated: [list]
```

---

## References

- **evolution-core**: `.claude/skills/evolution-core/SKILL.md`
- **skill-creator**: `.claude/skills/skill-creator/SKILL.md`
- **run_evals.py**: `.claude/skills/skill-creator/scripts/run_evals.py`
- **AutoResearch Loop**: `_shared.md` Section 5
