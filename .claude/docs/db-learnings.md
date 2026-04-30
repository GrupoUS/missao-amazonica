# Database Learnings — NeonDash

> Tier 3 doc. Drizzle/Neon-specific patterns and historical bug fixes.
> Load on demand when working on schema, migrations, or DB performance.
> Complements `.claude/rules/database.md` (Tier 2) and `apps/api/drizzle/AGENTS.md` (canonical implementation authority).

<!-- Agent instruction: Append a new entry whenever you fix a non-obvious
database issue or discover a Drizzle/Neon pattern.
Format: ## YYYY-MM-DD — [short title]
Describe: what happened, root cause, fix applied, how to avoid. -->

---

## Template for new entries

```markdown
## YYYY-MM-DD — [short title]

**What happened:** [symptom observed]
**Root cause:** [actual reason, not the symptom]
**Fix:** [specific change, with file path]
**How to avoid:** [rule / pattern / check that prevents recurrence]
```
