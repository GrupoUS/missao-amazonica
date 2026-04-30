# ADR-014: Drizzle ORM for Type-Safe Database Access

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

NeonDash requires an ORM for managing 121+ tables across multiple schema files with Neon Serverless PostgreSQL. Options evaluated: (A) Prisma (generator-based, separate schema language), (B) Knex (query builder, no type inference), (C) TypeORM (decorator-based, class-centric), (D) Drizzle ORM (TypeScript-first, schema-as-code).

Key requirements: TypeScript-first schema definitions, compatibility with `@neondatabase/serverless` driver, push-based development workflow (`bun run db:push`), and zero codegen steps at query time.

## Decision

Use Drizzle ORM for all database access. Schema is defined in TypeScript files (`drizzle/schema*.ts`). Development workflow uses `bun run db:push` (drizzle-kit push). Production uses `drizzle-kit generate` + `drizzle-kit migrate`. The `@neondatabase/serverless` driver is used as the underlying connection adapter.

Schema is organized across 10 domain files (schema-core.ts, schema.ts, schema-marketing.ts, schema-email-marketing.ts, schema-workspace.ts, schema-automations.ts, schema-baileys.ts, schema-trail-instances.ts, schema-trail-templates.ts, relations.ts) to manage circular dependency concerns.

## Consequences

**Positive:**
- Schema-as-code in TypeScript — no separate `.prisma` language to learn
- Direct type inference from schema without a codegen step
- Excellent `@neondatabase/serverless` compatibility
- Push-based dev workflow eliminates migration file management during development
- `relations.ts` separates relation definitions from table definitions, breaking circular imports

**Negative / Trade-offs:**
- Push-based dev workflow (`db:push`) can lose migration history if not careful
- No built-in soft-delete or audit log features — handled manually via `ativo` boolean convention
- Schema split across 10 files adds indirection when looking up a table definition

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Prisma | Mature, great DX, extensive docs | Separate schema language, codegen step, Prisma Client doesn't work well with Neon serverless driver | Rejected: codegen friction + driver incompatibility |
| B — Knex | SQL-first, flexible | No TypeScript type inference, manual query typing | Rejected: type safety gap |
| C — TypeORM | Familiar to Java/C# devs, decorators | Decorator-heavy, class instances complicate React server patterns | Rejected: paradigm mismatch |
| D — Drizzle ORM | TypeScript-first, schema-as-code, serverless-compatible | Newer ecosystem, smaller community than Prisma | **Chosen** |

## Related ADRs

- [ADR-006](006-multi-tenant-mentorado-isolation.md) — Drizzle enforces mentoradoId WHERE clauses on all tenant-scoped queries
- [ADR-012](012-neon-postgresql.md) — Drizzle connects to Neon via `@neondatabase/serverless` driver
