# Upstream — supabase skill

## Source

- **Repo:** https://github.com/supabase/agent-skills
- **Path:** `skills/supabase/`
- **License:** MIT (Supabase, official)
- **Install (alternative):** `npx skills add supabase/agent-skills --skill supabase` or Claude Code plugin via `claude plugin marketplace add supabase/agent-skills`

## Last sync

- **Date:** 2026-04-30
- **Upstream commit:** `e5f7a7cfd697`
- **Commit message:** fix: update Data API doc link and bump supabase skill to v0.1.1 (#73)
- **Upstream date:** 2026-04-29
- **Skill version:** 0.1.1 (per SKILL.md frontmatter `metadata.version`)

## Sync verification

```
SKILL.md                       — IDENTICAL to upstream (only line-ending diff CRLF↔LF)
references/skill-feedback.md   — IDENTICAL to upstream
```

## Local customizations

None. Files match upstream verbatim.

## Sync procedure (next time)

```bash
# 1. Fetch latest
curl -sL https://raw.githubusercontent.com/supabase/agent-skills/main/skills/supabase/SKILL.md \
  -o /tmp/upstream-supabase-skill.md

# 2. Diff against local (ignoring line endings)
diff <(tr -d '\r' < .claude/skills/supabase/SKILL.md) /tmp/upstream-supabase-skill.md

# 3. If diff is non-empty, review and apply via Edit/Write
# 4. Compare references/ similarly via GitHub API
# 5. Update this UPSTREAM.md (date, commit sha, version)
```

## When to re-sync

- Quarterly check (set a `/schedule` agent if desired)
- When user reports outdated guidance from this skill
- When Supabase announces breaking changes to CLI / MCP / Auth / RLS

## Reporting issues upstream

Skill issues → file at https://github.com/supabase/agent-skills/issues — see `references/skill-feedback.md` for the bug report template.
