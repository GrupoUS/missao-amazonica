---
globs: apps/api/drizzle/**
---

# Database Rules (Tier 2 — Auto-loaded)

> Canonical schema authority: `apps/api/drizzle/AGENTS.md`
> Source of truth: `apps/api/drizzle/schema.ts`
> Deep references:
> - `.claude/docs/architecture/11-runtime-environment.md`
> - `.claude/docs/architecture/12-database-schema-reference.md`
> - `.claude/docs/architecture/06-data-architecture.md`

## Purpose

This file is intentionally **slim**.

It should give you the minimum safe guardrails for schema work while pushing deep reference material into Tier 3 architecture docs. Load those references only when the task actually needs them.

---

## Load Strategy

### Load this file for
- any edit under `apps/api/drizzle/**`
- schema/table/column/index changes
- enum changes
- migration planning
- DB performance review tied to schema shape

### Also load on demand
- `apps/api/drizzle/AGENTS.md` — when editing schema or migration files
- `.claude/docs/architecture/12-database-schema-reference.md` — when you need domain/table orientation
- `.claude/docs/architecture/11-runtime-environment.md` — when env/runtime/config affects DB work
- `.claude/docs/architecture/06-data-architecture.md` — when the task is architectural, relational, or cross-domain

### Do not preload
- full backend references
- frontend references
- unrelated design specs

---

## Core Rules

- **Extend first**: prefer adding columns to existing tables before creating new tables when the domain already exists
- **Every foreign key needs an index** — no exceptions
- **Enum naming**: `camelCase` TypeScript export, `snake_case` database name
- **Always export** the row type and insert type for each table
- **Soft deletes** use domain conventions such as `ativo` where applicable; do not default to physical deletion
- **Development workflow**: use `bun run db:push` for schema propagation; avoid manual SQL as the default path
- **Keep validation aligned**: enum-backed columns must stay consistent with API validation schemas
- **Prefer existing domains** over inventing parallel structures for near-duplicate data

---

## Change Checklist

Before changing schema, verify:

- Which existing domain owns this data?
- Can the existing table absorb the change?
- Does every new FK have a matching index?
- Are enum values mirrored correctly in validation/input layers?
- Will this affect tenant scoping, reporting, or integrations?
- Does the change require updates outside Drizzle?

---

## Domain Map

| Domain | Representative Tables |
|--------|------------------------|
| Core | `users`, `mentorados`, `metricas_mensais`, `feedbacks`, `badges`, `mentorado_badges`, `ranking_mensal` |
| CRM | `leads`, `interacoes`, `crm_column_config`, `tasks` |
| Patients | `pacientes`, `pacientes_info_medica`, `pacientes_procedimentos`, `pacientes_fotos`, `pacientes_documentos`, `pacientes_chat_ia`, `planos_tratamento`, `pacientes_consentimentos` |
| Financial | `categorias_financeiras`, `formas_pagamento`, `transacoes`, `insumos`, `procedimentos` |
| Integrations | `whatsapp_messages`, `whatsapp_contacts`, `instagram_tokens`, `instagram_sync_log`, `facebook_ads_*`, `google_tokens` |

For table-by-table orientation, load:
` .claude/docs/architecture/12-database-schema-reference.md`

---

## When to Escalate Context

Load deeper references if the task involves:

- cross-domain schema design
- tenant resolution impact
- integration token/storage design
- financial/reporting correctness
- architecture-level tradeoffs
- deciding whether to extend vs create a table

For those cases, prefer reading the architecture references instead of bloating this rule file.

---

## Summary

This rule file should stay short, operational, and safe.

- Rules here = immediate schema guardrails
- Architecture docs = deep reference
- `apps/api/drizzle/AGENTS.md` = canonical implementation authority
