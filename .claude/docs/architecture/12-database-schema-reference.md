# 12 — Database Schema Reference

> Tier 3 architecture reference for NeonDash data domains.
> Source of truth: `apps/api/drizzle/schema.ts`
> Canonical schema rules: `apps/api/drizzle/AGENTS.md`

This document is a compact architecture-oriented reference for the main database domains in NeonDash. It exists to support planning, architecture review, backend implementation, and context priming without loading the full schema file.

---

## Purpose

Use this document when you need to answer questions such as:

- Which domain owns a table?
- What are the main entities and relationships?
- Which areas of the product are affected by a schema change?
- Where should a new column or relation likely live?
- Which reference docs should be loaded next?

This is **not** the migration source of truth and does **not** replace `schema.ts`.

---

## Schema Design Principles

NeonDash follows these database principles:

- **Extension-first:** prefer extending existing tables before creating new ones
- **Every foreign key needs an index**
- **Soft delete over hard delete** where the domain uses lifecycle state
- **Typed exports are mandatory:** each table should expose `Type` and `InsertType`
- **Enums use `camelCase` exports and `snake_case` DB names**
- **`bun run db:push` is the standard development workflow** — avoid manual SQL as the primary path

For authoritative implementation rules, load `apps/api/drizzle/AGENTS.md`.

---

## Domain Map

| Domain | Primary Concern | Representative Tables |
|--------|------------------|------------------------|
| Core | Identity, mentorship, gamification | `users`, `mentorados`, `metricas_mensais`, `feedbacks`, `badges`, `mentorado_badges`, `ranking_mensal` |
| CRM | Lead tracking and follow-up | `leads`, `interacoes`, `crm_column_config`, `tasks` |
| Patients | Clinical records and treatment flow | `pacientes`, `pacientes_info_medica`, `pacientes_procedimentos`, `pacientes_fotos`, `pacientes_documentos`, `pacientes_chat_ia`, `planos_tratamento`, `pacientes_consentimentos` |
| Financial | Revenue, expenses, procedures, supplies | `categorias_financeiras`, `formas_pagamento`, `transacoes`, `insumos`, `procedimentos` |
| Integrations | External platform state and sync audit | `whatsapp_messages`, `whatsapp_contacts`, `instagram_tokens`, `instagram_sync_log`, `facebook_ads_*`, `google_tokens` |

---

## 1. Core Domain

The Core domain defines the primary identity and mentorship model of the platform.

### Main Tables

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `users` | Clerk-backed auth and billing identity | Billing fields, auth role data |
| `mentorados` | Primary tenant/business entity | Links users, integrations, domain data |
| `metricas_mensais` | Monthly performance metrics | → `mentorados` |
| `feedbacks` | Periodic mentor feedback | → `mentorados` |
| `badges` | Achievement catalog | Categorization enum |
| `mentorado_badges` | Awarded badge history | → `mentorados`, → `badges` |
| `ranking_mensal` | Competitive monthly rankings | → `mentorados` |

### Architectural Notes

- `mentorados` is a central tenant anchor in multiple product areas.
- Many business flows scope data through a resolved mentorado context.
- Changes here can affect auth resolution, dashboard summaries, reporting, and AI context.

### Typical Change Triggers

- New user roles or tenant resolution rules
- New performance metrics or ranking attributes
- Additional gamification or badge metadata

---

## 2. CRM Domain

The CRM domain manages leads, pipeline interactions, and lightweight task tracking.

### Main Tables

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `leads` | Lead records and pipeline state | → `mentorados`, status/origin enums |
| `interacoes` | History of communication and follow-up | → `leads`, → `mentorados` |
| `crm_column_config` | Kanban/pipeline column configuration | → `mentorados` |
| `tasks` | Task/checklist items | → `mentorados` |

### Architectural Notes

- CRM data is tenant-scoped through `mentoradoId`.
- Pipeline customization is persisted separately from lead rows.
- This domain commonly intersects with WhatsApp, Instagram, and automation features.

### Typical Change Triggers

- New lead status/origin values
- Additional pipeline metadata
- Activity logging enhancements
- Automation and outreach integrations

---

## 3. Patient Domain

The Patient domain supports clinical workflows, records, consent, and treatment planning.

### Main Tables

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `pacientes` | Patient master record | → `mentorados` |
| `pacientes_info_medica` | Medical history and information | → `pacientes` |
| `pacientes_procedimentos` | Per-patient performed procedures | → `pacientes` |
| `pacientes_fotos` | Clinical/photo history | → `pacientes` |
| `pacientes_documentos` | Document storage and tracking | → `pacientes` |
| `pacientes_chat_ia` | AI conversation history by patient | → `pacientes` |
| `planos_tratamento` | Treatment plans | → `pacientes` |
| `pacientes_consentimentos` | Consent tracking / LGPD-sensitive workflow | → `pacientes` |

### Architectural Notes

- This domain has stronger sensitivity around PII, consent, and document lifecycle.
- It often interacts with file storage, signing flows, and AI-assisted patient workflows.
- Schema changes here may require coordinated updates across backend validation, frontend forms, and compliance-sensitive flows.

### Typical Change Triggers

- New clinical metadata fields
- Consent and document workflow requirements
- Photo/document retention changes
- New treatment planning capabilities

---

## 4. Financial Domain

The Financial domain models transactions, categories, payment methods, supplies, and procedures.

### Main Tables

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `categorias_financeiras` | Revenue/expense categorization | → `mentorados` |
| `formas_pagamento` | Payment methods | → `mentorados` |
| `transacoes` | Financial ledger / movement records | → `mentorados` |
| `insumos` | Inventory/supplies | → `mentorados` |
| `procedimentos` | Offered billable procedures/services | → `mentorados` |

### Architectural Notes

- Financial features often depend on precise date handling and aggregation logic.
- This domain may integrate with invoice emission and payment providers.
- Derived metrics should be recalculated from raw values rather than stitched from inconsistent ratios.

### Typical Change Triggers

- New transaction attributes
- Reporting or category refinements
- Billing/payment workflow integration
- Procedure pricing and operational analytics

---

## 5. Integrations Domain

The Integrations domain stores external platform credentials, sync state, and imported communication/reporting data.

### Main Tables

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `whatsapp_messages` | WhatsApp message history | → `mentorados` |
| `whatsapp_contacts` | WhatsApp contact records | → `mentorados` |
| `instagram_tokens` | Instagram OAuth/token state | → `mentorados` |
| `instagram_sync_log` | Sync audit trail | → `mentorados` |
| `facebook_ads_*` | Facebook Ads reporting data | → `mentorados` |
| `google_tokens` | Google OAuth/token state | → `users` |

### Architectural Notes

- This domain is highly coupled to external API reliability, token expiry, and sync idempotency.
- Tables here often function as caches, audit logs, or provider-state stores.
- Schema updates may require changes to webhook handlers, token refresh logic, and timeout/retry behavior.

### Typical Change Triggers

- New external providers
- Additional sync metadata
- Auditability requirements
- Token lifecycle and expiry management

---

## Cross-Domain Relationship Patterns

Several relationship patterns recur across the schema:

### Tenant Scoping

Most product data is scoped through either:

- `mentorados`
- `users`
- `pacientes` for nested clinical records

### Audit and History Tables

Many features persist operational history rather than overwriting state:

- interactions
- sync logs
- message history
- badge awards
- rankings
- consent records

### External-State Tables

Integration-heavy features often require dedicated persistence for:

- access tokens
- sync checkpoints
- imported provider data
- webhook idempotency or event correlation

---

## When to Load More Context

Use this file as an entry point, then load deeper context only when needed:

| Need | Next Document |
|------|---------------|
| Full schema rules and naming conventions | `apps/api/drizzle/AGENTS.md` |
| Backend procedure and validation patterns | `apps/api/src/AGENTS.md` |
| Environment variable requirements | `.claude/docs/architecture/13-environment-variables-reference.md` |
| Backend bug patterns and data-layer pitfalls | `.claude/docs/architecture/14-backend-learnings-reference.md` |
| Database implementation details in code | `apps/api/drizzle/schema.ts` |

---

## Change Impact Checklist

Before changing a table or relation, verify:

- Which domain owns the data?
- Is there an existing table/column that should be extended first?
- Does every new foreign key also have an index?
- Are enums mirrored correctly in validation schemas?
- Will the change affect auth scoping or tenant resolution?
- Does the change require router, service, frontend, and integration updates?
- Should this be documented in architecture or design references after implementation?

---

## Summary

NeonDash’s schema is organized around five architectural domains:

1. **Core** for identity and mentorship
2. **CRM** for lead and pipeline operations
3. **Patients** for clinical workflows
4. **Financial** for revenue and operations
5. **Integrations** for provider state and sync

Use this document to orient architectural decisions quickly, then escalate to the canonical schema and domain AGENTS files for implementation work.
