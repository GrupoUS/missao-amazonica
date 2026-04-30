# ADR-012: Neon Serverless PostgreSQL as Primary Database

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

NeonDash needs a relational database for 80+ tables covering CRM, financial data, patient records, AI agent memory, and WhatsApp message history. Options considered: (A) traditional PostgreSQL on a VPS (always-on), (B) PlanetScale (MySQL-based, no FK constraints by default), (C) Supabase PostgreSQL (managed), (D) Neon Serverless PostgreSQL.

Key requirements: Drizzle ORM compatibility, branching for staging/production isolation, Brazilian data residency considerations, cost efficiency for a startup with variable load, and compatibility with the serverless connection pooling used by Bun.

## Decision

Use Neon Serverless PostgreSQL as the primary database. Connection management uses `@neondatabase/serverless` with a connection pool (max 10, 30s idle timeout, 10s connection timeout). Drizzle ORM handles schema management and query building.

The project uses `bun run db:push` (drizzle-kit push) for schema synchronization in development, and `drizzle-kit generate` + `drizzle-kit migrate` for production migrations.

Multi-tenant support is implemented at the application level via `mentoradoId` as a foreign key on all tenant-scoped tables. The `getDbForContext()` function supports separate connection strings for `clinica` and `mentoria` contexts.

## Consequences

**Positive:**
- Database branching enables staging/production isolation without extra infrastructure
- Serverless connection pooler handles connection limits for Bun's concurrent connections
- Neon's `@neondatabase/serverless` driver is optimized for low-latency serverless workloads
- Point-in-time recovery and automatic backups included
- `mcp-server-neon` MCP integration available for AI-assisted schema operations (currently deactivated)

**Negative / Trade-offs:**
- `mcp-server-neon` is currently **DEACTIVATED** — use `neonctl` CLI for all Neon operations
- Serverless cold starts can add latency on the first connection after idle periods
- The schema.ts file has grown to ~3,700 lines (80+ tables) — splitting into domain files is planned architectural debt
- Multi-database pattern (`getDbForContext`) adds complexity without full separation of data

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Self-hosted PostgreSQL on VPS | Full control, no vendor cost | Manual backups, manual scaling, operational burden on small team | Rejected: operational overhead |
| B — PlanetScale (MySQL) | Serverless, branching | MySQL (no FK constraints by default), not Drizzle-ORM optimized for Postgres | Rejected: MySQL and FK constraint limitations |
| C — Supabase PostgreSQL | Managed, good DX, Postgres | Couples DB to Supabase auth/storage ecosystem; would conflict with Clerk (ADR-011) | Rejected: ecosystem coupling |
| D — Neon Serverless PostgreSQL | Database branching, serverless pooling, Drizzle compatible, `@neondatabase/serverless` driver | Cold starts after idle, mcp-server-neon deactivated (use neonctl CLI) | **Chosen** |

## Related ADRs

- [ADR-006](006-multi-tenant-mentorado-isolation.md) — Neon stores all multi-tenant data with mentoradoId FK
- [ADR-014](014-drizzle-orm.md) — Drizzle ORM manages schema and queries against this Neon instance
