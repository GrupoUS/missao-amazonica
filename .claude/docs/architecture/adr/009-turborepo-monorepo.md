# ADR-009: Turborepo Monorepo over Polyrepo

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

NeonDash consists of a React frontend (`apps/web`), a Hono API backend (`apps/api`), and shared packages (`packages/shared`, `packages/config`, `packages/ai-gateway`). The team considered two structures: (A) separate Git repositories per app/package (polyrepo), or (B) a single repository with workspace tooling (monorepo).

The frontend needs to import types directly from the backend's tRPC router (`AppRouter`) for end-to-end type safety. A polyrepo approach would require publishing the router types as an npm package and managing version synchronization, which adds friction and breaks the type-safe development loop.

## Decision

Use a single Turborepo monorepo with Bun workspaces. All apps and packages live in the same repository under `apps/` and `packages/`. Turborepo provides task orchestration (`turbo run build`, `turbo run check`) with remote caching via Vercel's infrastructure.

## Consequences

**Positive:**
- Direct TypeScript type imports between packages without publishing (e.g. `AppRouter` from `apps/api/src/routers.ts`)
- Atomic commits that span frontend + backend changes
- Shared tooling (`packages/config`) with a single source of truth for Biome and TypeScript config
- Turbo remote cache reduces CI build time when only one package changes
- Single `bun install` installs all dependencies

**Negative / Trade-offs:**
- Repository size grows as all code is in one place
- CI pipelines must be designed to filter which packages changed (handled by Turbo's task graph)
- New team members must understand workspace conventions (`@neondash/*` package names)

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Polyrepo (separate Git repos) | Independent versioning, smaller repos | Cross-repo type imports require package publishing, version sync complexity, tRPC AppRouter can't be directly imported | Rejected: breaks tRPC type safety |
| B — Monorepo + Turborepo | Direct TypeScript imports, atomic commits, shared config, remote caching | Single large repo, CI must handle task graph | **Chosen** |
| C — Monorepo + Nx | Similar to Turborepo, mature tooling | More configuration overhead, slower task graph resolution | Rejected: Turborepo simpler for this scale |

## Related ADRs

- [ADR-001](001-bun-runtime.md) — Bun workspaces (`@neondash/*` packages) power the monorepo workspace
- [ADR-010](010-trpc-over-rest.md) — Monorepo enables direct `AppRouter` type imports without package publishing
- [ADR-015](015-tanstack-router.md) — Frontend (`apps/web`) lives in the monorepo alongside the API
- [ADR-017](017-biome-oxlint.md) — `packages/config` provides shared Biome config to all packages
