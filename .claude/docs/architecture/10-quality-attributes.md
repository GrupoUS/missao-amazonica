# Quality Attributes

> Performance, observability, reliability, scalability, and maintainability characteristics of the NeonDash platform.

---

## Performance

### Session Caching

- Redis-backed session cache with 1-hour TTL reduces Clerk API calls by ~80%
- In-memory `Map` fallback when Redis is unavailable (same TTL, auto-cleanup every 5 minutes)
- Cache invalidation on mentorado creation, team membership activation, and explicit logout
- Prepared statement for `getUserByClerkId` avoids rebuilding query AST on every authenticated request

### Frontend Optimization

- **Code splitting:** 14 vendor chunks via Vite `manualChunks` (react, router, ui, three, charts, motion, clerk, trpc, pdf, dnd, date, mediapipe, markdown, icons) + TanStack Router `autoCodeSplitting` on all routes
- **Build output:** `sourcemap: "hidden"` in production (no source maps served to browsers)
- **TanStack Query:** `staleTime` = 30s default, `retry` max 2 (skips 401/403/429), `gcTime` >= `staleTime`
- **Lazy loading:** `React.lazy` + `<Suspense>` for heavy dependencies (Recharts, Three.js, PDF libraries)
- **Memoization:** `React.memo` on list items with polling parents, `useCallback` for callbacks passed to memoized children

### Backend Optimization

- `Promise.all` for independent DB queries (parallel execution)
- Prepared statements (`sql.placeholder()` + `.prepare()`) for hot-path queries
- Every `SELECT` specifies columns explicitly (no `SELECT *`)
- `.limit()` required on queries that may return more than 100 rows
- Every external API call uses `AbortSignal.timeout()` or `AbortController`

### Build Toolchain

- **tsgo** (`@typescript/native-preview`): Go-native TypeScript type-checking, ~4s for full monorepo (vs ~5min with tsc)
- **TurboRepo:** Topological build graph with remote cache (`TURBO_TOKEN`), parallel task execution
- **Biome:** Format + lint in ~1s (Rust-native)
- **OXLint:** Additional lint rules in ~0.1s (Rust-native)

---

## Observability

### Structured Logging

Custom logger in `apps/api/src/_core/logger.ts` outputs JSON to stdout/stderr:

```json
{
  "timestamp": "2026-04-01T12:00:00.000Z",
  "level": "INFO",
  "service": "context",
  "requestId": "m1abc-def1234",
  "userId": "user_2abc...",
  "action": "context_created",
  "cacheHit": true,
  "hasUser": true,
  "hasMentorado": true
}
```

| Level | Output | Behavior |
|-------|--------|----------|
| `DEBUG` | stdout | Development only (`NODE_ENV=development`) |
| `INFO` | stdout | Always |
| `WARN` | stderr | Always |
| `ERROR` | stderr | Always, includes stack trace |

AI Gateway uses `pino` logger with `pino-pretty` in development.

### Health Endpoints

| Endpoint | Checks | Response |
|----------|--------|----------|
| `GET /health/live` | `isShuttingDown` flag | 200 "OK" or 503 "Shutting down" |
| `GET /health/ready` | DB (3s timeout) + Redis (warn-only) + AI Gateway | 200 "Ready" or 503 with reason |
| `GET /metrics` | None | Prometheus text: `neondash_memory_heap_used_bytes`, `neondash_memory_rss_bytes`, `neondash_uptime_seconds` |

### System Health (tRPC)

The `system.healthCheck` procedure returns:

| Section | Metrics |
|---------|---------|
| Cache | hits, misses, hitRate (%) |
| Database | latencyMs, connected (boolean) |
| Webhook Queue | pending, size, failedCount |

### Performance Measurement

The `measureAsync` helper wraps async operations with timing:
- Logs `{action}_completed` with `durationMs` on success
- Logs `{action}_failed` with `durationMs` and error on failure

---

## Reliability

### Graceful Shutdown

- SIGTERM/SIGINT handlers with configurable grace period (default 10s)
- Ordered teardown: HTTP server close, grace wait, Redis quit, schedulers stop, Baileys disconnect, AI Gateway stop
- Each step wrapped in try-catch to ensure the sequence completes

### Webhook Retry Queue

- `p-queue` with concurrency 5, rate-capped at 10 tasks/second
- Max 3 retries per task with automatic re-enqueue on failure
- Failed tasks stored in memory (max 500) for admin review
- Admin-accessible retry via `system.retryFailedWebhooks` mutation

### Redis Fallback

- When Redis is unavailable, the session cache falls back to an in-memory `Map`
- Rate limiting uses in-memory `Map` stores (always, independent of Redis)
- Redis health check is warn-only in the readiness probe -- does not block startup

### Stale-Chunk Auto-Reload

- Browser-side `vite:preloadError` listener catches chunk load failures after deployments
- Uses `sessionStorage` guard to prevent infinite reload loops
- Automatically reloads the page once to pick up new asset hashes

### Baileys Reconnect

- Session state persisted in PostgreSQL (`baileysSessions` table) survives process restarts
- `baileysSessionManager` handles reconnection on startup
- Disconnect storms handled by the baileys-integration skill patterns

### Global Error Handlers

- `process.on("uncaughtException")` -- logs to stderr, exits with code 1
- `process.on("unhandledRejection")` -- logs to stderr, exits with code 1
- Registered as the first code in `apps/api/src/_core/index.ts` (before any imports)

---

## Scalability

### Current Constraints

| Resource | Limit | Configuration |
|----------|-------|---------------|
| CPU | 1.5 cores | Docker Compose resource limit |
| Memory | 1536M | Docker Compose resource limit |
| Redis | 256MB maxmemory | allkeys-lru eviction |
| DB connections | 10 per pool | Neon serverless pool |
| Rate limit (user) | 500 req / 15min | In-memory, per-process |
| Rate limit (auth) | 10 req / 15min | In-memory, per-process |

### Background Processing

- In-process schedulers using Bun `setTimeout` (no external cron dependency)
- Campaign scheduler for marketing email campaigns
- Webhook queue for async Clerk event processing
- Session cache cleanup every 5 minutes (unref'd to not prevent exit)

### Multi-Database Routing

- Separate Neon instances for `clinica` and `mentoria` contexts when configured
- Falls back to default `DATABASE_URL` when context-specific URLs are not set
- Lazy initialization -- pools created on first use, not at startup

---

## Maintainability

### Monorepo Structure

- **TurboRepo** manages the build graph with topological ordering and remote caching
- Task pipeline: `lint:check`, `check` (type-check), `test`, `build` run in correct dependency order
- Workspace packages: `@neondash/shared`, `@neondash/ai-gateway`, `@neondash/workspace`, `@neondash/config`

### Type Safety Toolchain

| Tool | Purpose | Speed |
|------|---------|-------|
| tsgo | Type checking (Go-native) | ~4s full monorepo |
| Biome | Format + lint (Rust-native) | ~1s |
| OXLint | Additional lint rules (Rust-native) | ~0.1s |

Pre-commit workflow: `bunx biome check --write` on edited files, then `bun run type-check`.

### Documentation Convention

- `AGENTS.md` files in each subdirectory serve as canonical domain authority
- Priority chain: subdirectory `AGENTS.md` > `.claude/rules/` > root `AGENTS.md` > `.claude/CLAUDE.md`
- Tier 1 (always loaded) < 500 lines; Tier 3 (reference) loaded on demand by sub-agents

### Code Health Practices

- **YAGNI enforcement:** Regular audits removing dead code, unused features, and stale memory layers
- **Python-only scripts:** All automation in Python 3 stdlib (no shell scripts, no pip installs)
- **Stability checklist (A-L):** 12 non-negotiable rules enforced on every code change
- **Conventional Commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `chore:` prefixes
- **LF line endings:** `.gitattributes` enforces LF; CRLF on CI causes mass Biome failures

---

## Related Decisions

- [ADR-001: Bun Runtime](adr/001-bun-runtime.md) — Bun's 10-25x faster installs and native TypeScript execution directly contribute to build toolchain performance
- [ADR-004: tsgo Type Checking](adr/004-tsgo-type-checking.md) — tsgo's ~4s type check is documented in the Build Toolchain section
- [ADR-007: Redis Dual-Purpose](adr/007-redis-dual-purpose.md) — Redis session cache (~80% Clerk call reduction) is documented in the Session Caching section
- [ADR-013: WISC Documentation](adr/013-wisc-documentation.md) — The WISC 3-tier system is the documentation convention described in the Maintainability section
- [ADR-017: Biome + OXLint](adr/017-biome-oxlint.md) — Biome (~1s) and OXLint (~0.1s) are documented in the Build Toolchain section
