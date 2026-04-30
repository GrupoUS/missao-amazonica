# Dockerfile Optimization Guide

## 3-Stage Multi-Stage Build

### Stage 1 — Dependencies (production only)

```dockerfile
FROM oven/bun:1.3.9-alpine AS deps
WORKDIR /app

# Copy all workspace package.json files for dependency resolution
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ai-gateway/package.json ./packages/ai-gateway/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/workspace/package.json ./packages/workspace/package.json
COPY packages/config/package.json ./packages/config/package.json

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production
```

- Uses Alpine for smaller footprint
- Installs only production deps (no devDependencies)
- **BuildKit cache mount** keeps Bun's download cache across builds — even if Docker layer cache is cold, packages aren't re-downloaded
- Cached independently — layer only re-runs when `package.json`/`bun.lock` change

### Stage 2 — Builder (full deps + build)

```dockerfile
FROM oven/bun:1.3.9-alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/ai-gateway/package.json ./packages/ai-gateway/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/workspace/package.json ./packages/workspace/package.json
COPY packages/config/package.json ./packages/config/package.json

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production

# Vite inlines VITE_* at compile time — supports both build args (Coolify) and secrets (GHA)
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_META_APP_ID
ARG VITE_META_CONFIG_ID
ARG VITE_META_GRAPH_API_VERSION=v24.0

RUN --mount=type=secret,id=VITE_CLERK_PUBLISHABLE_KEY \
    --mount=type=secret,id=VITE_META_APP_ID \
    --mount=type=secret,id=VITE_META_CONFIG_ID \
    VITE_CLERK_PUBLISHABLE_KEY="${VITE_CLERK_PUBLISHABLE_KEY:-$(cat /run/secrets/VITE_CLERK_PUBLISHABLE_KEY 2>/dev/null || true)}" \
    VITE_META_APP_ID="${VITE_META_APP_ID:-$(cat /run/secrets/VITE_META_APP_ID 2>/dev/null || true)}" \
    VITE_META_CONFIG_ID="${VITE_META_CONFIG_ID:-$(cat /run/secrets/VITE_META_CONFIG_ID 2>/dev/null || true)}" \
    VITE_META_GRAPH_API_VERSION="${VITE_META_GRAPH_API_VERSION}" \
    bun run --filter=@neondash/web build

RUN bun run --filter=@neondash/api build
```

- Full deps needed for TypeScript compilation and Vite build
- `ARG` for Vite env vars (embedded at build time)
- `--mount=type=secret` for secure secret passing (no secrets in image layers)
- Output: `dist/public/` (frontend) + `dist/index.js` (backend)

### Stage 3 — Production Runtime

```dockerfile
FROM oven/bun:1.3.9-alpine AS runtime
WORKDIR /app

# Non-root user
RUN addgroup -g 1001 -S bunuser && \
    adduser -u 1001 -S bunuser -G bunuser

# Copy production deps from stage 1
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy build output from stage 2
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web/dist ./apps/api/dist/public
COPY --from=builder /app/apps/api/drizzle ./apps/api/drizzle
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/ai-gateway ./packages/ai-gateway
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/workspace ./packages/workspace

# Set ownership
RUN chown -R bunuser:bunuser /app
USER bunuser

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Docker health check (used by Coolify rolling updates)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health/live || exit 1

CMD ["bun", "apps/api/dist/index.js"]
```

## Key Decisions

| Decision | Rationale |
|---|---|
| Alpine base | Reduces image ~200MB → ~80-100MB |
| Non-root user (UID 1001) | Prevents privilege escalation in container |
| 3-stage (deps separate from builder) | Avoids devDependencies in final image |
| `--frozen-lockfile` | Deterministic builds |
| `--mount=type=cache` on bun install | Survives Docker layer cache eviction (critical for Coolify) |
| `--mount=type=secret` for VITE vars | Secrets NOT baked into image layers |
| `wget` healthcheck (not `curl`) | `curl` not available in Alpine by default |
| `127.0.0.1` in healthcheck | Avoids `localhost` fallback to `::1` on Alpine/BusyBox |
| `--start-period=30s` | Gives app time to initialize before health checks start |
| No `--smol` flag | Trades CPU for memory — not beneficial with 4GB+ RAM |

## BuildKit Cache Mounts (Critical)

BuildKit `--mount=type=cache` keeps a persistent cache directory across builds. Unlike Docker layer caching, these caches **survive Docker's BuildKit garbage collection** (which evicts unused layers after ~48h by default).

```dockerfile
# This cache persists even when Coolify triggers a full rebuild
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile
```

**Why this matters for Coolify**: Coolify may inject changing build args (`SOURCE_COMMIT`, `COOLIFY_CONTAINER_NAME`) that invalidate layer caches. Cache mounts are immune to this.

## .dockerignore

Ensure build context is minimal:

```
node_modules
dist
.git
.github
.gitignore
.agent
.gemini
.kilocode
.cursor
.vscode
.idea
.claude
.turbo
docs
*.md
!README.md
**/*.test.ts
**/*.spec.ts
**/__tests__
attached_assets
Dockerfile
docker-compose*.yml
.dockerignore
railway.json
.env
.env.*
!.env.example
*.log
.DS_Store
coverage
```

## Image Size Targets

| Base | Expected Size |
|---|---|
| `oven/bun:1.3.9` (Debian) | ~180-200MB |
| `oven/bun:1.3.9-alpine` | ~80-100MB |

## Version Pinning

- Dockerfile, GitHub Actions workflows, and `package.json` `packageManager` field **must all pin the same Bun version** (currently `1.3.9`).
- Version mismatches between local/CI/Docker can cause `bun install --frozen-lockfile` failures.
