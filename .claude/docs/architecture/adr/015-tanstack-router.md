# ADR-015: TanStack Router for Type-Safe File-Based Routing

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

The NeonDash frontend (`apps/web`) is a React 19 SPA requiring type-safe routing with code splitting. Options considered: (A) React Router v6/v7 (most popular), (B) Next.js App Router (file-based, SSR), (C) TanStack Router (100% type-safe, file-based for Vite).

Key requirements: type-safe `Link` and `useParams` (no string-typed routes), automatic code splitting, seamless integration with TanStack Query, and compatibility with the Vite + Bun build toolchain.

## Decision

Use TanStack Router with file-based route generation. Routes are defined in `apps/web/src/routes/` using the `createFileRoute` API. The route tree is auto-generated to `routeTree.gen.ts`. `autoCodeSplitting` is enabled, automatically lazy-loading every route.

## Consequences

**Positive:**
- 100% type-safe `Link to` and `useParams` — route parameter typos caught at compile time
- `autoCodeSplitting` reduces initial bundle size automatically
- Native TanStack Query integration (`loaders` with `ensureQueryData`)
- File-based routes scale cleanly to 44+ protected routes without a central route registry

**Negative / Trade-offs:**
- Generated `routeTree.gen.ts` must be committed and kept in sync
- Smaller community than React Router
- Server-side rendering not supported (acceptable — this is a pure SPA)

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — React Router v6/v7 | Largest community, most tutorials | String-typed routes, no built-in type safety for params/search | Rejected: type safety gap |
| B — Next.js App Router | File-based, SSR, Vercel ecosystem | SSR is unnecessary for auth-gated dashboard; full Next.js is over-engineering | Rejected: SSR overhead not needed |
| C — TanStack Router | 100% type-safe, file-based, TanStack Query native | Newer, generated routeTree.gen.ts | **Chosen** |

## Related ADRs

- [ADR-009](009-turborepo-monorepo.md) — Frontend lives in `apps/web` within the Turborepo monorepo
- [ADR-016](016-shadcn-tailwind.md) — Route page components use shadcn/ui + Tailwind CSS
