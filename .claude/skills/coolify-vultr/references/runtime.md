# Runtime: Health Probes & Graceful Shutdown

## Health Probe Endpoints

| Endpoint | Purpose | Used By |
|---|---|---|
| `GET /health/live` | Process alive check | Docker HEALTHCHECK, Traefik LB |
| `GET /health/ready` | App ready + deps healthy | Traefik routing decisions |
| `GET /metrics` | Prometheus-compatible metrics | Monitoring stack |

### Endpoint Placement (CRITICAL)

Health probes MUST be registered **before** Clerk middleware and body parsers:

1. Health probes (`/health/live`, `/health/ready`, `/metrics`)
2. Stripe webhook (raw body)
3. Clerk webhook (raw body)
4. Body parsers (JSON, URL-encoded)
5. Clerk middleware
6. tRPC routes

---

## Implementation

### Prerequisites

Export Redis client from `server/_core/sessionCache.ts`:

```typescript
export function getRedisClient(): Redis | null {
  return redis;
}
```

### State Variables

Add to `server/_core/index.ts` (inside `startServer()`, after `createServer`):

```typescript
let isReady = false;
let isShuttingDown = false;
```

### Health Check Helpers

```typescript
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { getDb } = await import("../db");
    const { sql } = await import("drizzle-orm");
    const db = getDb();
    const result = await db.execute(sql`SELECT 1 as health`);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

async function checkRedisHealth(): Promise<boolean> {
  try {
    const { getRedisClient } = await import("./sessionCache");
    const redis = getRedisClient();
    if (!redis) return false;
    await redis.ping();
    return true;
  } catch (error) {
    console.error("Redis health check failed:", error);
    return false;
  }
}
```

### Liveness Probe

Fast, no dependency checks. Returns 503 during shutdown.

```typescript
app.get("/health/live", (_req, res) => {
  if (isShuttingDown) {
    return res.status(503).send("Shutting down");
  }
  res.status(200).send("OK");
});
```

### Readiness Probe

Checks critical dependencies. Redis failure is a warning (fallback mode exists).

```typescript
app.get("/health/ready", async (_req, res) => {
  if (!isReady || isShuttingDown) {
    return res.status(503).send("Not ready");
  }

  const dbHealthy = await checkDatabaseHealth();
  const redisHealthy = await checkRedisHealth();

  if (!dbHealthy) {
    return res.status(503).send("Database unavailable");
  }

  if (!redisHealthy) {
    console.warn("Redis unavailable, using in-memory fallback");
  }

  res.status(200).send("Ready");
});
```

### Metrics Endpoint

```typescript
app.get("/metrics", (_req, res) => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();

  const metrics = `
# HELP neondash_memory_heap_used_bytes Heap memory used
# TYPE neondash_memory_heap_used_bytes gauge
neondash_memory_heap_used_bytes ${memUsage.heapUsed}

# HELP neondash_memory_rss_bytes Resident set size
# TYPE neondash_memory_rss_bytes gauge
neondash_memory_rss_bytes ${memUsage.rss}

# HELP neondash_uptime_seconds Process uptime in seconds
# TYPE neondash_uptime_seconds counter
neondash_uptime_seconds ${uptime}
  `.trim();

  res.set("Content-Type", "text/plain");
  res.send(metrics);
});
```

### Initialization

Set `isReady = true` after server starts and schedulers are initialized:

```typescript
async function initialize() {
  console.log("Initializing Neondash application...");

  initSchedulers().catch((error) => {
    console.error("[scheduler] Failed to initialize schedulers:", error);
  });

  isReady = true;
  console.log(`Server ready at http://${host}:${port}`);
}

initialize().catch((error) => {
  console.error("Failed to initialize application:", error);
  process.exit(1);
});
```

---

## Graceful Shutdown

### Shutdown Sequence

```
SIGTERM received
  ↓
1. Set isShuttingDown = true  (health probes → 503)
  ↓
2. server.close()             (stop accepting new connections)
  ↓
3. Wait grace period          (10s default, in-flight requests complete)
  ↓
4. Close Redis connection     (redis.quit())
  ↓
5. Stop schedulers            (stopSchedulers())
  ↓
6. process.exit(0)
```

### Implementation

Replace the existing `shutdown` function and signal handlers in `server/_core/index.ts`:

```typescript
async function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}, starting graceful shutdown...`);

  isShuttingDown = true;

  server.close(() => {
    console.log("HTTP server closed");
  });

  const gracePeriod = parseInt(process.env.SHUTDOWN_GRACE_PERIOD || "10000");
  console.log(`Waiting ${gracePeriod}ms for in-flight requests...`);
  await new Promise((resolve) => setTimeout(resolve, gracePeriod));

  try {
    const { getRedisClient } = await import("./sessionCache");
    const redis = getRedisClient();
    if (redis) await redis.quit();
  } catch (error) {
    console.error("Error closing Redis:", error);
  }

  try {
    stopSchedulers();
  } catch (error) {
    console.error("Error stopping schedulers:", error);
  }

  console.log("Graceful shutdown complete");
  process.exit(0);
}
```

### Signal Handlers

```typescript
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});
```

### Configuration

| Env Var | Default | Purpose |
|---|---|---|
| `SHUTDOWN_GRACE_PERIOD` | `10000` | Milliseconds to wait for in-flight requests |

### Why This Order Matters

1. **`isShuttingDown = true` first** — health probes return 503, Traefik stops routing
2. **`server.close()` second** — no new TCP connections
3. **Grace period third** — in-flight requests (SSE, long queries) finish
4. **Redis/Schedulers last** — they support in-flight requests

### Docker Integration

Docker sends `SIGTERM`, then `SIGKILL` after stop timeout (default 10s). Set `stop_grace_period: 15s` (10s grace + 5s buffer).

---

## Testing

```bash
# Liveness
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health/live  # → 200

# Readiness
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health/ready  # → 200

# Metrics
curl -s http://localhost:3000/metrics | head -10

# Graceful shutdown
bun run dev &
SERVER_PID=$!
kill -TERM $SERVER_PID
# Expected: "Received SIGTERM..." → "Graceful shutdown complete"
```
