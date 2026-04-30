# ADR-018: Vite 7 for Frontend Build (Not Bun Bundler)

**Status:** Accepted
**Date:** 2026-04-01
**Deciders:** NeonDash Engineering Team

## Context

Bun has a built-in bundler that could theoretically build the React frontend. However, the frontend uses React-specific features (JSX, HMR, CSS-in-JS via Tailwind) that require a build tool with strong React/Vite plugin ecosystem. The question was whether to use Bun's bundler or Vite for frontend builds.

Note: Bun's bundler IS used for the API server (`apps/api`). This ADR concerns only the frontend (`apps/web`).

## Decision

Use Vite 7 for frontend build and Hot Module Replacement (HMR). The Bun bundler is used for API bundling only. Vite config (`apps/web/vite.config.ts`) defines 14 manual vendor chunks via `manualChunks` for optimal code splitting.

Frontend build output: `apps/web/dist/` → copied to `apps/api/dist/public/` at Docker build time.

## Consequences

**Positive:**
- Vite's plugin ecosystem (React Fast Refresh, Tailwind v4 integration) is mature
- `manualChunks` gives fine-grained control over 14 vendor bundles
- Excellent HMR performance in development
- `sourcemap: "hidden"` in production keeps source maps available but not served to browsers

**Negative / Trade-offs:**
- Two different bundlers in the monorepo (Vite for frontend, Bun for API) — developers must know which applies
- Vite's rollup internals differ from Bun bundler — plugin compatibility is separate
- Vite 7 requires separate Node/Bun version considerations

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A — Bun bundler for frontend | Single bundler for everything | Immature React/HMR plugin ecosystem, no manualChunks equivalent | Rejected: plugin ecosystem gaps |
| B — Vite 7 | Mature React ecosystem, fine-grained chunking, excellent HMR | Two bundlers in monorepo | **Chosen** |
| C — webpack | Proven, maximum plugin ecosystem | Much slower than Vite, complex config | Rejected: performance |
| D — esbuild directly | Very fast | No HMR, no CSS handling, manual plugin work | Rejected: too low-level |

## Related ADRs

- [ADR-001](001-bun-runtime.md) — Bun handles API bundling; Vite handles frontend build
- [ADR-005](005-single-process-deployment.md) — Vite output (`dist/`) is served by Hono from `dist/public/`
