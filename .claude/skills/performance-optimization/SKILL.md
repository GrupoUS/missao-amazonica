---
name: performance-optimization
description: Use for runtime performance, build performance, database and API speed, security baseline checks, SEO readiness, bundle size, Core Web Vitals, and production release gates.
---

# Performance Optimization

Single performance skill for four goals: speed, database performance, security baseline, and SEO/GEO baseline.

## Core Rules

1. Measure before changing code.
2. Change one bottleneck at a time.
3. Re-measure with the same tool and scenario.
4. Keep fixes minimal (KISS) and only for active issues (YAGNI).

## Packs

Pick one pack per run:

| Pack                    | Use When                                                                        | Minimum Output                                   |
| ----------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| `performance-core`      | Slow load, sluggish interaction, high API p95, large bundle                     | before/after metrics + exact fixes               |
| `database-performance`  | Slow API p95, N+1 queries, SELECT *, missing indexes, pool exhaustion, cold starts | before/after query metrics + exact fixes       |
| `security-baseline`     | Release hardening, OWASP sanity, dependency and header checks                   | findings by severity + mitigation                |
| `seo-geo-baseline`      | Search visibility, crawlability, AI citation readiness                          | indexability/schema/CWV report + action list     |

## Baseline Commands

```bash
bun run type-check
bun run lint:check
bun run build
ANALYZE=true bun run build
```

## Live Docs Lookup (Context7)

Before applying optimizations, fetch live docs:
- `drizzle-orm` → resolve library ID, query for query optimization, prepared statements, `inArray()` batch patterns
- `@tanstack/react-query` → resolve for `staleTime`, `gcTime`, `skipToken`, polling patterns
- `recharts` → resolve for lazy loading and tree-shaking patterns

---

## Pack Commands

### `database-performance`

Use when API p95 is high, queries are slow, or the DB is a suspected bottleneck.

**Step 1: Connection Pool Audit**

Read `apps/api/src/db.ts` and check the `Pool` constructor:

```typescript
// Correct — tuned for Neon serverless
const pool = new Pool({
  connectionString,
  max: 10,                        // Neon free tier max ~20; leave headroom for other services
  idleTimeoutMillis: 30_000,      // 30s — close idle connections to avoid stale/billing
  connectionTimeoutMillis: 10_000, // 10s — fail fast on Neon cold starts
});
```

Report as findings if any of `max`, `idleTimeoutMillis`, or `connectionTimeoutMillis` are absent.

> **Note:** `@neondatabase/serverless` Pool accepts the same constructor options as `pg.Pool`. The `options` field for statement_timeout (`options: '-c statement_timeout=30000'`) may vary by driver version — verify against runtime before applying.

**Step 2: Query Anti-Pattern Scan**

```bash
# SELECT * (missing column specification)
grep -rn "db\.select()\.from" apps/api/src/ --include="*.ts"

# N+1 pattern: look for await db. inside a for/while loop
grep -A5 "for (const\|for (let\|for (var\|while (" apps/api/src/ -rn --include="*.ts" | grep "await db\."
```

| Severity | Pattern | Fix |
|----------|---------|-----|
| High | `db.select().from(table)` with no columns | Specify `db.select({ col1, col2 })` |
| High | `await db.` inside `for` loop | Pre-fetch all IDs → single query with `inArray()` |
| Medium | List queries without `.limit()` | Add `.limit(N)` — cap at 100 for list endpoints |
| Medium | Sequential independent queries | Wrap in `Promise.all([...])` |

**Step 3: Index Audit**

For every FK column (`.references(() => table.id)`), confirm a corresponding `index("...").on(table.fkCol)` exists in the same table definition.

```bash
grep -n "\.references(" apps/api/drizzle/ -r --include="*.ts"
grep -n "index(" apps/api/drizzle/ -r --include="*.ts"
```

**Step 4: Prepared Statement Candidates**

Identify hot-path queries for Drizzle `.prepare()`:

```typescript
import { placeholder } from 'drizzle-orm';

const getUserByClerkIdStmt = db
  .select({ id: users.id, clerkId: users.clerkId, email: users.email, role: users.role })
  .from(users)
  .where(eq(users.clerkId, placeholder('clerkId')))
  .limit(1)
  .prepare('get_user_by_clerk_id');

const [user] = await getUserByClerkIdStmt.execute({ clerkId: 'clerk_xxx' });
```

Use prepared statements for: every-request queries, frequently-called service functions, and scheduler/cron hot loops.

**Step 5: Batch Operations**

```typescript
// Instead of: for (const item of items) { await db.insert(table).values(item) }
await db.insert(table).values(items); // single round-trip

// Instead of: for (const id of ids) { await db.select().from(t).where(eq(t.id, id)) }
const results = await db.select().from(t).where(inArray(t.id, ids));
const map = new Map(results.map(r => [r.id, r]));
```

**Step 6: Report**

```markdown
## Database Performance Report

Pack: database-performance

### Connection Pool
| Setting | Current | Recommended | Status |
|---------|---------|-------------|--------|
| max | unset | 10 | FAIL |
| idleTimeoutMillis | unset | 30000 | FAIL |
| connectionTimeoutMillis | unset | 10000 | FAIL |

### Query Anti-Patterns
| # | File | Line | Issue | Severity |
|---|------|------|-------|----------|

### Index Gaps
| Table | FK Column | Has Index? |
|-------|-----------|------------|

### Changes
1. [change] -> [impact]

### Risks / Follow-up
- [remaining risk]
```

**Bottleneck Routing (DB-specific)**

```
API p95 > 140ms  → run Step 1 (pool) + Step 2 (query scan)
Cold start delay → check pool.connectionTimeoutMillis + Neon region latency
N+1 detected     → batch with inArray() or join
SELECT * detected → specify needed columns in db.select({ col1, col2 })
Pool exhaustion  → lower max or add idleTimeoutMillis
Sequential queries → wrap independent queries in Promise.all
```

---

### `performance-core`

> Full PSI API reference: `references/psi-api.md`
> Full Unlighthouse reference: `references/unlighthouse.md`

**Step 1: Measure with PSI API (primary)**

```bash
# Mobile audit
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://staging.neondash.com.br&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo&locale=pt-BR" -o /tmp/psi-mobile.json

# Desktop audit
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://staging.neondash.com.br&strategy=desktop&category=performance&category=accessibility&category=best-practices&category=seo&locale=pt-BR" -o /tmp/psi-desktop.json

# Parse scores
jq '{perf: (.lighthouseResult.categories.performance.score * 100 | round), a11y: (.lighthouseResult.categories.accessibility.score * 100 | round), bp: (.lighthouseResult.categories["best-practices"].score * 100 | round), seo: (.lighthouseResult.categories.seo.score * 100 | round)}' /tmp/psi-mobile.json
```

**Step 2: Local Lighthouse (for auth pages or deeper analysis)**

```bash
npx lighthouse https://staging.neondash.com.br --preset=desktop --port=9222 --chrome-flags="--headless=new --disable-gpu --no-first-run --no-default-browser-check --disable-background-networking --disable-extensions"
npx lighthouse https://neondash.com.br --preset=desktop --port=9333 --chrome-flags="--headless=new --disable-gpu --no-first-run --no-default-browser-check --disable-background-networking --disable-extensions"
```

**Step 3: React Doctor**

```bash
npx -y react-doctor@latest . --yes --verbose
```

> Full React Doctor remediation loop: `references/react-doctor.md`

---

### `security-baseline`

```bash
bun audit
gitleaks detect --source .
curl -I https://staging.neondash.com.br
```

Check at least: access control, injection resistance, auth flows, misconfiguration, secrets.

---

### `seo-geo-baseline`

> Full SEO playbook (robots, sitemap, metadata, constraints): `references/seo-playbook.md`

**Step 1: PSI API for SEO scores**

```bash
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://neondash.com.br&strategy=mobile&category=seo&category=accessibility&locale=pt-BR" | jq '{seo: (.lighthouseResult.categories.seo.score * 100 | round), a11y: (.lighthouseResult.categories.accessibility.score * 100 | round)}'
```

**Step 2: Robots and Sitemap**

```bash
curl https://staging.neondash.com.br/robots.txt
curl https://neondash.com.br/robots.txt
curl -I https://staging.neondash.com.br/sitemap.xml
curl -I https://neondash.com.br/sitemap.xml
```

**Step 3: Local Lighthouse (optional, for deeper SEO audits)**

```bash
npx lighthouse https://staging.neondash.com.br --preset=desktop --port=9222 --chrome-flags="--headless=new --disable-gpu --no-first-run --no-default-browser-check --disable-background-networking --disable-extensions"
```

Use distinct explicit ports for sequential runs (`9222` for staging, `9333` for production).
If Lighthouse cannot find Chrome automatically, set `CHROME_PATH` to your local Chrome/Chromium executable.

Check at least: metadata, structured data, canonical links, robots, sitemap, CWV.

---

## Targets

| Metric      | Target   |
| ----------- | -------- |
| LCP         | <= 2.5s  |
| INP         | <= 200ms |
| CLS         | <= 0.1   |
| API p95     | <= 140ms |
| Main bundle | <= 200KB |

## Bottleneck Routing

- Initial load slow → inspect critical rendering path and bundle split.
- Interaction slow → inspect re-renders and long handlers.
- API slow → inspect N+1 patterns and missing indexes. Use `database-performance` pack.
- Memory growth → inspect subscription/listener/interval cleanup.
- DB pool exhaustion → tune `max`, `idleTimeoutMillis`, `connectionTimeoutMillis` in Pool constructor.

## High-Value Fixes

**Frontend:** Route-level lazy loading for heavy pages and modals. Remove unstable props/callbacks causing unnecessary re-renders. Virtualize long lists.

**Backend/DB:** Remove N+1 queries with joins or batch strategy. Ensure FK columns are indexed. Avoid unbounded list queries.

## Guardrails

- Do not optimize based on intuition only.
- Do not over-memoize cheap operations.
- Do not expand scope to unrelated refactors.
- Do not claim improvement without before/after evidence.

## Report Template

```markdown
## Optimization Report

Pack: [performance-core|security-baseline|seo-geo-baseline]

| Metric | Before | After | Delta |
| ------ | ------ | ----- | ----- |
| ...    | ...    | ...   | ...   |

### Changes
1. [change] -> [impact]

### Risks / Follow-up
- [remaining risk]
```
