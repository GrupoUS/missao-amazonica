# Rules — Tier 2 Domain Guardrails

> Tier 2 rule files. Loaded on demand by `/prime` per the routing matrix in `.claude/CLAUDE.md`.
> Per-project specifics live in `${overlay}/rules/` (e.g., `.claude/overlay/<project>/rules/`).

## Purpose

These templates describe **what each rule file should contain** for the project that adopts them. They're scaffolds — fill them in with the project's actual stack, conventions, and constraints.

The companion overlay (`${overlay}/rules/*.md` if present) provides authoritative project-specific rules. The harness preferentially loads overlay rules first; if absent, it falls back to these generic stubs.

## Files

| File | Scope |
|---|---|
| `backend.md` | Server-side code (API routes, middleware, ORM, validators) |
| `database.md` | Schema, migrations, RLS, views, functions, indexes |
| `frontend.md` | Pages, components, layouts, styling, hydration boundaries |
| `integrations.md` | External providers (payments, email, monitoring, real-time) |
| `stability.md` | Universal stability checklist (always-applicable guardrails) |
| `DESIGN.md` | Design tokens, component specs, typography, color, accessibility |

## How rules are loaded

1. `/prime` (auto / backend / frontend / fullstack) reads `.claude/CLAUDE.md` § routing matrix
2. Routing matrix says "task type X loads rule Y"
3. Loader checks `${overlay}/rules/Y.md` first
4. Falls back to `.claude/rules/Y.md` (this directory) if overlay absent
5. Stops once minimum-viable context loaded

## Adapting to a new project

1. Read each template. Replace placeholders (`<your-stack>`, `<your-paths>`, `<your-tooling>`) with project specifics.
2. Either edit `.claude/rules/<file>.md` directly (stack-specific project) **or** create `.claude/overlay/<project>/rules/<file>.md` (multi-overlay scenario).
3. Update `.claude/config.json::overlay` to point at the right overlay directory.

## Project-specific authoritative rules

For Missão Amazônica (this repo), full rules live in `.claude/overlay/missao-amazonica/rules/`:

- `backend.md` — Astro API routes, Supabase server clients, Pix providers, Resend, Sentry
- `database.md` — Supabase schema, RLS, views, idempotency, donor PII rules
- `frontend.md` — Astro hybrid, render mode, Lucide icons, Tailwind v4 tokens
- `integrations.md` — Pix BR-Code, Resend, Sentry, Supabase Realtime, Vercel
- `stability.md` — Universal A-L checklist + project-specific idempotency / performance gates
- `DESIGN.md` — Sal da Terra Material 3 tokens, light/dark contract, typography
