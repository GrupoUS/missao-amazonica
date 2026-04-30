# Overlay — Missão Amazônica · Sal da Terra

Project-specific supplements layered on top of generic `.claude/`. Read `.claude/config.json::overlay` to discover this directory.

To use the framework in a different project:
1. Replace this directory with `.claude/overlay/<your-project>/` (mirror the file structure below) and update `.claude/config.json::overlay`, **or**
2. Delete the overlay entirely — commands fall back to generic defaults.

## Files

| File | Loaded by |
|---|---|
| `CLAUDE-overlay.md` | `session_context.py` hook (SessionStart) — Tier 1 supplement: project identity, cardinal rules, project guards, routing matrix overrides |
| `rules/{backend,database,frontend,integrations,stability,DESIGN}.md` | resolved by `.claude/commands/_shared.md § 0` rule-resolution recipe — overlay-first, generic-fallback. Authoritative project rules for Astro + Supabase + Pix stack. |
| `anti-patterns.md` | `/debug`, `debugger` skill — bug catalog (donor PII, derived totals, webhook idempotency, SPA ban) |
| `debugger-domain-rules.md` | `debugger` skill — extended cross-stack bug patterns |
| `routing-supplements.md` | `/prime`, `/implement` — extra routing matrix rows (donation flow, Pix providers, webhook routing) |
| `verify-supplements.md` | `/verify` — project smoke tests (webhook idempotency curl, RLS anon deny, public_donor_list privacy, donation excess→reserve) |
| `layer-map.md` | `planning` skill — Astro+Supabase layer stack (migrations → RLS → views → validators → API → pages/islands) |
| `seo-supplement.md` | `performance-optimization` skill — pt-BR locale, sitemap routes, OG tags, Schema.org JSON-LD |
| `protected-files.json` | `protect_files.py` hook — extra protected paths (e.g., `supabase/migrations/`) |
| `project-snapshot.md` | on-demand reference — full architecture map, commands table, data model, design system summary, project-specific pre-delivery checklist |

## Source rules

Generic rule templates live in `.claude/rules/*.md` (scaffolds for any project). When the overlay's `rules/*.md` exist, they override the generic templates per the rule-resolution recipe in `.claude/commands/_shared.md § 0`.

Both layers cover the same six domains (`backend`, `database`, `frontend`, `integrations`, `stability`, `DESIGN`) — generic = scaffold with placeholders, overlay = concrete Astro+Supabase+Pix authority.

## Auto-load chain

On SessionStart:
1. Generic Tier 1: `.claude/CLAUDE.md`
2. Root `AGENTS.md` (generic agent rules + execution best practices)
3. `${overlay}/CLAUDE-overlay.md` (project identity + cardinal rules)

Other overlay files load on-demand when a command or skill explicitly references them.
