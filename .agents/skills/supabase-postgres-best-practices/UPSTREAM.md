# Upstream — supabase-postgres-best-practices

## Source

- **Repo:** https://github.com/supabase/agent-skills
- **Path:** `skills/supabase-postgres-best-practices/`
- **License:** MIT (Supabase, official)
- **Install (alternative):** `npx skills add supabase/agent-skills --skill supabase-postgres-best-practices` or Claude Code plugin via `claude plugin marketplace add supabase/agent-skills`

## Last sync

- **Date:** 2026-04-30
- **Upstream commit:** `7a646f8812ec`
- **Commit message:** docs: replace mise references with pnpm commands (#67)
- **Upstream date:** 2026-04-15
- **Skill version:** 1.1.1 (per SKILL.md frontmatter `metadata.version`)

## Sync verification

```
SKILL.md                                        — IDENTICAL to upstream
references/                                     — 34 files, all IDENTICAL to upstream
  ├── _contributing.md / _sections.md / _template.md
  ├── advanced-{full-text-search,jsonb-indexing}.md
  ├── conn-{idle-timeout,limits,pooling,prepared-statements}.md
  ├── data-{batch-inserts,n-plus-one,pagination,upsert}.md
  ├── lock-{advisory,deadlock-prevention,short-transactions,skip-locked}.md
  ├── monitor-{explain-analyze,pg-stat-statements,vacuum-analyze}.md
  ├── query-{composite,covering,partial,missing}-indexes.md / query-index-types.md
  ├── schema-{constraints,data-types,foreign-key-indexes,lowercase-identifiers,partitioning}.md (and more)
  └── security-{privileges,rls-basics,rls-performance}.md
```

## Local customizations

None. Files match upstream verbatim.

## Sync procedure (next time)

```bash
# 1. Diff SKILL.md
curl -sL https://raw.githubusercontent.com/supabase/agent-skills/main/skills/supabase-postgres-best-practices/SKILL.md \
  -o /tmp/upstream-pg-skill.md
diff <(tr -d '\r' < .claude/skills/supabase-postgres-best-practices/SKILL.md) /tmp/upstream-pg-skill.md

# 2. Diff references/ via GitHub API (or clone repo and compare directories)
curl -sL "https://api.github.com/repos/supabase/agent-skills/contents/skills/supabase-postgres-best-practices/references" \
  | python -m json.tool

# 3. For any differing file, fetch + apply via Edit/Write
# 4. Update this UPSTREAM.md (date, commit sha, version)
```

## When to re-sync

- Quarterly check (recommend `/schedule` agent for "remind to check supabase-postgres-best-practices upstream every 3 months")
- When user reports outdated query guidance
- When Postgres major version released (currently Postgres 16; 17+ likely future)
- When new categories added to `_sections.md`

## Reporting issues upstream

Issues → https://github.com/supabase/agent-skills/issues. The skill repo is actively maintained by Supabase staff.
