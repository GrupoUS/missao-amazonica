# ADR-001: Use Bun as Runtime, Package Manager, and API Bundler

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

NeonDash is a TypeScript monorepo requiring a package manager, runtime, and build toolchain. The options considered were: (A) Node.js + npm + esbuild (standard), (B) Node.js + pnpm + Vite (popular alternative), (C) Bun as a unified toolchain. The project started in 2024 as Bun reached 1.0 stability, making option C viable for production use.

Note on scope: Bun handles the **API server** build (`bun build` via `bunx bun build src/_core/index.ts --outdir=dist`). The **frontend** (`apps/web`) is built with Vite 7 — see ADR-018. Tests use **Vitest**, not Bun's built-in test runner, which provides better compatibility with the Jest plugin ecosystem.

## Decision

Bun is used as the exclusive package manager (`bun install`), runtime (`bun src/_core/index.ts`), and **API** bundler (`bun build`). The frontend build uses Vite (see ADR-018). Tests use Vitest (via `bun run vitest`). npm, yarn, and pnpm are explicitly forbidden across the project.

## Consequences

**Positive:**
- Single toolchain simplifies CI/CD pipelines and Dockerfile stages
- `bun install` is 10-25x faster than npm, significantly reducing CI wait times
- Native TypeScript execution without a separate transpilation step
- Excellent compatibility with Hono, the project's HTTP framework
- Bun workspaces support the `@neondash/*` package structure in the Turborepo monorepo

**Negative / Trade-offs:**
- Ecosystem compatibility risk for packages that assume Node.js-specific APIs
- Team must learn Bun-specific patterns and behaviors
- Fewer community resources and Stack Overflow answers for Bun-specific debugging

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Node.js + npm + esbuild | Standard ecosystem, maximum community support | Slow installs, separate transpilation step, complex toolchain | Rejected: toolchain fragmentation |
| B — Node.js + pnpm + Vite | Fast installs, excellent Vite HMR for frontend | Still requires Node.js runtime, two runtimes for frontend/backend | Rejected: runtime split |
| C — Bun as unified toolchain | 10-25x faster installs, native TS execution, built-in test runner | Younger ecosystem, some Node.js API gaps | **Chosen** |

## Related ADRs

- [ADR-004](004-tsgo-type-checking.md) — tsgo type-checker runs via `bun run type-check`
- [ADR-005](005-single-process-deployment.md) — Bun runtime serves the single-process monolith
- [ADR-009](009-turborepo-monorepo.md) — Bun workspaces power the Turborepo monorepo
- [ADR-017](017-biome-oxlint.md) — Biome/OXLint native toolchain philosophy aligns with Bun choice
- [ADR-018](018-vite-frontend-build.md) — Bun handles API bundling; Vite handles frontend build
