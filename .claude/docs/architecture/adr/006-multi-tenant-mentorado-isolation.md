# ADR-006: Implement Multi-Tenancy via mentoradoId Foreign Key on All Tables

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

NeonDash serves multiple independent businesses (mentorados -- coaching clients). Each mentorado's data must be strictly isolated. Three options were evaluated: (A) separate database per tenant, (B) schema per tenant, (C) shared schema with a tenant discriminator column.

## Decision

Shared schema with `mentoradoId` FK (referencing `mentorados.id`, with `onDelete: cascade`) on virtually all tables. The `mentoradoProcedure` tRPC middleware injects the resolved mentorado into context, and all queries MUST include `WHERE mentoradoId = ctx.mentorado.id`.

## Consequences

**Positive:**
- Simple operations: one database, one schema, standard Drizzle queries
- `onDelete: cascade` ensures clean tenant deletion
- `mentoradoProcedure` makes it structurally difficult to forget the WHERE clause at the tRPC layer
- Multi-DB routing (`getDbForContext`) allows separate Neon instances if isolation needs increase

**Negative / Trade-offs:**
- A bug in the WHERE clause is a critical data leak (all tenants' data visible)
- Table size grows with tenant count (mitigated by Neon's serverless scaling)
- Cross-tenant analytics require admin-level bypass of the isolation layer
- Removing a tenant requires explicit cascade or soft-delete management

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Separate database per tenant | Maximum isolation, simple per-tenant queries | Operationally complex, connection pool explosion, expensive | Rejected: startup scale impractical |
| B — Schema per tenant (PostgreSQL schemas) | Good isolation, standard Postgres feature | Schema proliferation, migration complexity across all schemas | Rejected: maintenance burden |
| C — Shared schema + mentoradoId FK | Simple operations, standard Drizzle queries, cascade deletes work | Bug in WHERE clause = critical data leak | **Chosen** |

## Related ADRs

- [ADR-010](010-trpc-over-rest.md) — `mentoradoProcedure` enforces tenant isolation at the tRPC middleware layer
- [ADR-012](012-neon-postgresql.md) — Neon PostgreSQL stores all multi-tenant data with mentoradoId FK
- [ADR-014](014-drizzle-orm.md) — Drizzle ORM handles all tenant-scoped queries with mentoradoId WHERE clauses
- [ADR-020](020-dual-payment-strategy.md) — Payment records are scoped by mentoradoId
