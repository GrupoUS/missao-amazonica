# Turborepo + Docker Integration Guide

## How Turborepo Fits Into the Deploy Pipeline

NeonDash uses Turborepo as its **monorepo task orchestrator**, not as a Docker build tool. The deployment pipeline uses:

```
turbo.json tasks → bun --filter builds → Docker multi-stage → Coolify deploy
```

Turborepo's role:
- **CI verification**: `bunx turbo run lint:check check test` (all packages in parallel)
- **Local builds**: `turbo run build` (respects task graph + caching)
- **Docker builds**: Uses `bun run --filter=<package> build` directly (bypasses turbo)

---

## Current Approach: bun --filter in Docker

The current Dockerfile builder stage uses direct bun filter commands:

```dockerfile
# Builds only the web frontend
RUN bun run --filter=@neondash/web build

# Builds only the API backend
RUN bun run --filter=@neondash/api build
```

**Why not `turbo` inside Docker?**
- Turbo cache (`.turbo/`) is excluded from Docker build context via `.dockerignore`
- Remote cache is not configured (`TURBO_TOKEN`/`TURBO_TEAM` absent) — would be local only
- `bun --filter` is simpler and sufficient for two-package builds

---

## Optimization: turbo prune (for future use)

`turbo prune --docker --scope=@neondash/api` generates a **pruned workspace** with only the packages needed to build a specific target. This reduces Docker build context and improves layer cache hit rates.

### Generated output structure

```
.out/
├── json/           # package.json files only (for dependency install layer)
│   ├── package.json
│   ├── bun.lock
│   ├── apps/api/package.json
│   ├── packages/shared/package.json
│   └── ...
└── full/           # full source for only the needed packages
    ├── apps/api/
    ├── packages/shared/
    ├── packages/ai-gateway/
    └── packages/workspace/
    # NOTE: apps/web NOT included when pruning for api only
```

### Pruned Dockerfile pattern (3-stage)

```dockerfile
FROM oven/bun:1.3.9-alpine AS pruner
WORKDIR /app
COPY . .
# Generates .out/json/ and .out/full/ for @neondash/api and its deps
RUN bunx turbo prune --scope=@neondash/api --docker

FROM oven/bun:1.3.9-alpine AS deps
WORKDIR /app
# Only copies package.json files (for cache-friendly dependency install)
COPY --from=pruner /app/.out/json/ .
COPY --from=pruner /app/.out/bun.lock ./bun.lock
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production

FROM oven/bun:1.3.9-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Now copy only the source needed for the target
COPY --from=pruner /app/.out/full/ .
RUN bun run --filter=@neondash/api build
```

**When to adopt:**
- Build context exceeds 500MB due to monorepo growth
- Layer cache miss rate is high (unrelated package changes invalidate build)
- Currently the monorepo is small enough that the simpler approach is fine

---

## CI Caching: GitHub Actions (.turbo/)

Turborepo **remote cache is NOT used** (no `TURBO_TOKEN`/`TURBO_TEAM` in workflows). Instead, CI uses GitHub Actions local cache:

```yaml
- uses: actions/cache@v4
  with:
    path: .turbo
    key: turbo-${{ runner.os }}-${{ github.sha }}
    restore-keys: turbo-${{ runner.os }}-
```

**How it works:**
- SHA-keyed: exact match restores same-commit build cache
- Fallback `restore-keys`: partial hit restores nearest ancestor's cache
- Cache applies to `bunx turbo run lint:check check test` verification step only
- Docker builds in Coolify are independent (use BuildKit cache on the VPS, not turbo cache)

**Performance:**
- `turbo run check` (tsgo type-check): ~4s with FULL TURBO cache, ~15s without
- `turbo run lint:check`: ~1-2s with cache, ~5-10s without
- `turbo run test`: ~10-30s with cache (test suite dependent)

---

## turbo.json Configuration (Current)

```json
{
  "$schema": "https://turborepo.dev/schema.v2.json",
  "globalDependencies": [".env", ".env.*"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "env": ["NODE_ENV", "VITE_CLERK_PUBLISHABLE_KEY", "VITE_META_APP_ID", "VITE_META_CONFIG_ID"],
      "inputs": ["$TURBO_DEFAULT$"]
    }
  }
}
```

**Key decisions:**
- `outputs: ["dist/**"]` — Vite outputs to `dist/`, not `.next/` (this is NOT Next.js)
- `globalDependencies: [".env", ".env.*"]` — env file changes bust all caches
- `inputs: ["$TURBO_DEFAULT$"]` — lean; `.env` files covered by globalDependencies
- No `remoteCache` block — using local `.turbo/` dir via `actions/cache` in CI

---

## .dockerignore Entries (Must Include)

```
.turbo          # Local turbo cache — never in Docker context
node_modules    # Rebuilt in deps stage
.git            # Not needed in container
.github         # CI config not needed
.env            # Secrets never in image
.env.*          # All env variants excluded
dist            # Rebuilt during Docker build
```

All of these are already present in the project's `.dockerignore`.

---

## Workspace Packages in Dockerfile

After removing `packages/ui` (orphan), the active workspace packages are:

| Package | Role | In Dockerfile |
|---------|------|---------------|
| `apps/api` | Hono backend | Built + copied |
| `apps/web` | React frontend | Built, served by API |
| `packages/ai-gateway` | AI routing | Copied to runtime |
| `packages/shared` | Types/utils | Copied to runtime |
| `packages/workspace` | Events/constants | Copied to runtime |
| `packages/config` | TS/Biome config | Build-time only (devDep) |

> Note: `packages/ui` was REMOVED (2026-03-31). It was a placeholder — web uses shadcn/ui from `apps/web/src/components/ui/` instead.
