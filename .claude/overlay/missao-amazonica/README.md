# Overlay — Missão Amazônica · Sal da Terra

Project-specific supplements layered on top of generic `.claude/commands/` and `.claude/skills/`.

Commands and skills read `.claude/config.json::overlay` to discover this directory. If the overlay is missing, commands fall back to generic behavior. To use these commands in a different project, either:

1. Replace this directory with `.claude/overlay/<your-project>/` (matching the four files below), and update `.claude/config.json::overlay`, **or**
2. Delete the overlay entirely — commands run with their generic defaults.

## Files

| File | Loaded by |
|---|---|
| `anti-patterns.md` | `/debug`, `debugger` skill — domain anti-patterns specific to this stack (Astro + Supabase + Pix + Resend) |
| `routing-supplements.md` | `/prime`, `/implement` — extra rows for the routing matrix (Pix providers, Resend wrappers, donation flow) |
| `verify-supplements.md` | `/verify` — extra smoke tests (webhook idempotency, RLS anon deny, public_donor_list, donation excess→reserve) |
| `layer-map.md` | `planning` skill — Astro+Supabase layer map (migrations → API route → component → page) |
| `seo-supplement.md` | `performance-optimization` skill — pt-BR locale, sitemap, OG tags for donation listings |

## Source rules

The overlay does NOT replace `.claude/rules/`. Tier 2 rules (`backend.md`, `database.md`, `frontend.md`, `integrations.md`, `stability.md`, `DESIGN.md`) remain authoritative. The overlay only adds project-specific bindings that don't fit a generic command body.
