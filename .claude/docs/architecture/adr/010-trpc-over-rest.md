# ADR-010: tRPC for Internal API (End-to-End Type Safety)

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

The frontend and backend are both TypeScript. Without a shared type contract, API changes on the backend can silently break the frontend at runtime. Options considered: (A) OpenAPI/Swagger with code generation, (B) GraphQL with schema-first typing, (C) tRPC for direct TypeScript type sharing, (D) plain REST with manual type alignment.

The team prioritizes type safety and developer velocity over external API compatibility. The API is consumed exclusively by the Neondash frontend (no third-party consumers of the internal API).

## Decision

Use tRPC 11 for all internal API communication. The frontend imports `AppRouter` directly from `apps/api/src/routers.ts` — no code generation step. Hono serves as the HTTP adapter via `@hono/trpc-server`. SuperJSON is used as the transformer for rich type serialization (Date, Map, Set).

Procedure hierarchy:
- `publicProcedure` — health checks only
- `protectedProcedure` — Clerk auth required
- `mentoradoProcedure` — auth + mentorado context resolved
- `adminProcedure` — auth + admin/mentor role check

## Consequences

**Positive:**
- Zero-latency type propagation: changing a procedure input/output type is immediately reflected as a TypeScript error in the frontend
- No code generation step or build artifact to maintain
- Input validation via Zod is co-located with the procedure definition
- TanStack Query integration via `@trpc/react-query` provides caching, optimistic updates, and refetch policies

**Negative / Trade-offs:**
- Not suitable for external API consumers (no REST, no GraphQL schema to share)
- Deep coupling between frontend and backend repositories (required for type import — acceptable in monorepo context)
- tRPC 11 has specific patterns for streaming and subscriptions that differ from v10

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — OpenAPI + codegen | External API compatible, language-agnostic | Code generation step, types can drift from spec, extra build artifact | Rejected: added friction, no external consumers |
| B — GraphQL | Flexible queries, type generation | Resolver boilerplate, separate schema language, not suitable for mutations-first API | Rejected: overpowered for this use case |
| C — tRPC 11 | Zero-latency type propagation, no codegen, co-located Zod validation | Internal-only (no external consumers), tRPC 11 subscription patterns differ from v10 | **Chosen** |
| D — Plain REST with manual types | Simple, universally understood | Types drift from implementation, no automatic validation, manual alignment burden | Rejected: type safety defeats the purpose |

## Related ADRs

- [ADR-006](006-multi-tenant-mentorado-isolation.md) — `mentoradoProcedure` enforces tenant isolation at the procedure level
- [ADR-009](009-turborepo-monorepo.md) — Monorepo enables direct `AppRouter` type imports from API to frontend
- [ADR-011](011-clerk-authentication.md) — Clerk JWT validated in `protectedProcedure` base middleware
