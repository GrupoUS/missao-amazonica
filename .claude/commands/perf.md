---
description: "Performance audits and build optimization. Runtime: PSI API (mobile/desktop), multi-route, site-wide, auto-fix, compare. Build: bundle analysis, caching, code splitting, Vite/TypeScript/Bun optimizations. Database: pool audit, N+1 scan, SELECT * scan, index gap check, prepared statement candidates. Pass URL, strategy (mobile/desktop), mode (routes/all/fix/compare/build/db), or combine."
workflow_type: orchestrator-workers
---

# /perf — Performance & Build Optimization

**ARGUMENTS**: $ARGUMENTS

> **Runtime audits:** Google PageSpeed Insights v5 (zero-dependency, no Chrome needed)
> **Build optimization:** Vite 7 + Bun + TypeScript (tsgo) — project-specific
> **Agent:** `performance-optimizer`
> **Skill:** `performance-optimization`

---

## Task

Conduct comprehensive performance audit following these steps:

1. **Technology Stack Analysis**
   - Identify the primary language, framework, and runtime environment
   - Review build tools and optimization configurations
   - Check for performance monitoring tools already in place

2. **Code Performance Analysis**
   - Identify inefficient algorithms and data structures
   - Look for nested loops and O(n²) operations
   - Check for unnecessary computations and redundant operations
   - Review memory allocation patterns and potential leaks

3. **Database Performance**
   - Analyze database queries for efficiency
   - Check for missing indexes and slow queries
   - Review connection pooling and database configuration
   - Identify N+1 query problems and excessive database calls

4. **Frontend Performance (if applicable)**
   - Analyze bundle size and chunk optimization
   - Check for unused code and dependencies
   - Review image optimization and lazy loading
   - Examine render performance and re-render cycles
   - Check for memory leaks in UI components

5. **Network Performance**
   - Review API call patterns and caching strategies
   - Check for unnecessary network requests
   - Analyze payload sizes and compression
   - Examine CDN usage and static asset optimization

6. **Asynchronous Operations**
   - Review async/await usage and promise handling
   - Check for blocking operations and race conditions
   - Analyze task queuing and background processing
   - Identify opportunities for parallel execution

7. **Memory Usage**
   - Check for memory leaks and excessive memory consumption
   - Review garbage collection patterns
   - Analyze object lifecycle and cleanup
   - Identify large objects and unnecessary data retention

8. **Build & Deployment Performance**
   - Analyze build times and optimization opportunities
   - Review dependency bundling and tree shaking
   - Check for development vs production optimizations
   - Examine deployment pipeline efficiency

9. **Performance Monitoring**
   - Check existing performance metrics and monitoring
   - Identify key performance indicators (KPIs) to track
   - Review alerting and performance thresholds
   - Suggest performance testing strategies

10. **Benchmarking & Profiling**
    - Run performance profiling tools appropriate for the stack
    - Create benchmarks for critical code paths
    - Measure before and after optimization impact
    - Document performance baselines

11. **Optimization Recommendations**
    - Prioritize optimizations by impact and effort
    - Provide specific code examples and alternatives
    - Suggest architectural improvements for scalability
    - Recommend appropriate performance tools and libraries

Include specific file paths, line numbers, and measurable metrics where possible. Focus on high-impact, low-effort optimizations first.

---


### Measurement Tool Selection

```
1. Try PSI API (preferred — no Chrome needed)
2. If HTTP 429 (quota) → fall back to Lighthouse CLI:
   bunx lighthouse URL --output=json --chrome-flags="--headless --no-sandbox --disable-gpu"
3. For full crawl → Unlighthouse: npx unlighthouse --site URL --throttle --samples 1
```

---

## Default Configuration

```yaml
KEY_ROUTES: detect from router files or use user-provided list
THRESHOLDS:
  performance:     { pass: 90, warn: 50 }
  accessibility:   { pass: 90, warn: 70 }
  best-practices:  { pass: 90, warn: 70 }
  seo:             { pass: 95, warn: 80 }
CWV_TARGETS: { LCP: 2.5s, FCP: 1.8s, CLS: 0.1, TBT: 200ms, SI: 3.4s, TTI: 3.8s }
```

---

Call PSI API for the URL with each selected strategy. Parse and display:

```markdown
## PSI Report: {URL}

### Scores ({strategy})
| Category | Score | Status |
|----------|-------|--------|
| Performance | XX | PASS/WARN/FAIL |
| Accessibility | XX | PASS/WARN/FAIL |
| Best Practices | XX | PASS/WARN/FAIL |
| SEO | XX | PASS/WARN/FAIL |

### Core Web Vitals
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| FCP | X.Xs | 1.8s | PASS/FAIL |
| LCP | X.Xs | 2.5s | PASS/FAIL |
| CLS | X.XX | 0.1  | PASS/FAIL |
| TBT | Xms  | 200ms | PASS/FAIL |

### Top Opportunities
| Audit | Savings | Display |
|-------|---------|---------|
| unused-javascript | XXXms | Est savings XXX KiB |
```

---

## FIX

Automated measure → fix → validate loop.

### Measure Baseline

Scan all key routes (or single URL). Identify routes with Performance < 90.

### Spawn 1 Agent Per Failing Route (Parallel)

For each route with Performance < 90, spawn one `performance-optimizer` agent. All in a **single message block**. Each agent uses `isolation: "worktree"`.

Each agent prompt must include:
- Route-specific scores, CWV, top opportunities, failing audits
- Scope: which route files and components to focus on
- Instructions: read project frontend AGENTS.md, fix top 3 opportunities by savings_ms, run quality gates, report changes

Skip routes with Performance >= 90.

Optimize build performance for the Vite 7 + Bun + TypeScript (tsgo) stack.
Follow this systematic approach: measure first, identify bottlenecks, apply targeted fixes, validate.

### Step 1: Build System Analysis

- Confirm build system: **Vite 7** (frontend), **Bun** (runtime + bundler), **tsgo** (type checking)
- Read `vite.config.ts`, `tsconfig.json`, `package.json` build scripts
- Map the complete build pipeline: `bun run build` → Vite (esbuild transform + Rollup bundle)
- Check for custom plugins, preprocessors, and post-build steps

### Step 2: Performance Baseline

Measure and record before any changes:

```bash
# Clean build timing
time bun run build

# Incremental (cache warm) build timing
time bun run build

# Type check timing
time bun run type-check

# Output sizes
ls -lh apps/web/dist/assets/ | sort -k5 -hr | head -20
```

Document:
- Clean build time vs incremental build time
- Bundle sizes per chunk (JS, CSS, assets)
- Type-check time (tsgo target: ~4s)
- Slowest phases in the build output

### Step 3: Bundle Analysis

Run bundle visualizer to map composition:

```bash
# Add temporarily to vite.config.ts, then build
bunx rollup-plugin-visualizer   # or vite-bundle-visualizer
bun run build
# Open stats.html in browser
```

Identify:
- Largest chunks and their top contributors
- Duplicate dependencies across chunks
- Opportunities for further splitting

### Step 4: Caching Strategy

**Vite dependency pre-bundling:**
- Verify `node_modules/.vite/deps` exists and is populated
- Add rarely-changing deps to `optimizeDeps.include` in `vite.config.ts`
- Check `optimizeDeps.exclude` is not over-broad

**tsgo incremental compilation:**
- Verify `tsBuildInfoFile` is set in `tsconfig.json` for incremental builds
- Confirm `incremental: true` is set

**CI/CD cache:**
- Cache `~/.bun/install/cache` between pipeline runs
- Cache `node_modules/.vite` for Vite dep pre-bundling
- Cache tsgo `*.tsbuildinfo` files

### Step 5: Code Splitting & Lazy Loading

**Route-based splitting (TanStack Router):**
- Verify route files use `React.lazy` + `<Suspense>` for heavy page components
- Check that heavy deps (Recharts 200KB+, PDF libs, chart editors) are lazy-loaded
- Confirm vendor chunks are properly separated

**Vite chunk configuration** (`vite.config.ts`):
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        router: ['@tanstack/react-router'],
        query: ['@tanstack/react-query'],
        // Heavy UI libs get their own chunks
      }
    }
  },
  chunkSizeWarningLimit: 500 // KB
}
```

### Step 6: Asset Optimization

- **Images:** verify WebP/AVIF formats, lazy loading (`loading="lazy"`), correct sizing
- **CSS:** confirm Tailwind v4 purge is active in production builds
- **Compression:** enable gzip + brotli in the Hono API server or CDN/Coolify config
- **Tree shaking:** verify `sideEffects: false` in package.json for pure utility packages

### Step 7: Vite-Specific Optimizations

```typescript
// vite.config.ts recommended settings
export default defineConfig({
  build: {
    target: 'es2020',           // Modern target = smaller output
    minify: 'esbuild',          // esbuild is faster than terser
    cssMinify: true,
    sourcemap: false,           // Disable in prod (or 'hidden')
    rollupOptions: {
      output: {
        manualChunks: { /* see Step 5 */ }
      }
    },
    chunkSizeWarningLimit: 500,
  },
  optimizeDeps: {
    include: [/* stable deps */],
  },
})
```

### Step 8: TypeScript (tsgo) Optimizations

```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    "skipLibCheck": true,       // Skip type-checking .d.ts in node_modules
    "moduleResolution": "bundler"
  }
}
```

- Use project references if monorepo grows beyond ~200 files per package
- Avoid `paths` aliases that force tsgo to re-resolve entire module graph

### Step 9: Development Build Optimization

- Verify `vite dev` uses esbuild (default) — never Babel in dev
- Confirm HMR is active for React Fast Refresh
- Source maps: `eval-cheap-module-source-map` for fastest HMR rebuilds
- Pre-bundle all frequently-used deps at startup (see `optimizeDeps.include`)

### Step 10: CI/CD Build Optimization

```yaml
# GitHub Actions / Coolify pipeline
cache:
  - ~/.bun/install/cache       # Bun package cache
  - node_modules/.vite         # Vite pre-bundle cache
  - .tsbuildinfo               # tsgo incremental cache
  - apps/api/.tsbuildinfo

# Parallel CI jobs where independent
jobs:
  type-check:  bun run type-check     # ~4s with tsgo
  lint:        bunx biome check       # ~1s
  test:        bun run test           # parallel with above
  build:       bun run build          # after type-check passes
```

### Step 11: Memory Usage Optimization

- Monitor `bun run build` peak memory: `--max-heap-size` flag if OOM in CI
- If Rollup plugin causes memory bloat, limit plugin concurrency
- tsgo is memory-efficient by default (Go runtime)

### Step 12: Output Optimization

- Confirm asset filenames use content hashing: `[name]-[hash].js`
- Verify Brotli/gzip headers are set by the CDN or Hono middleware
- Check that `<link rel="preload">` is used for critical chunks
- Validate `Cache-Control: max-age=31536000, immutable` on hashed assets

### Step 13: Monitoring & Profiling

Track bundle size regressions over time:

```bash
# Add to CI pipeline — fail if total JS exceeds budget
bun run build && du -sh apps/web/dist/assets/*.js | awk '{sum += $1} END {print sum " KB total"}'
```

- Set up `bundlesize` or `size-limit` to enforce budgets per PR
- Track `bun run build` timing in CI logs as a regression signal
- Alert when any chunk exceeds `chunkSizeWarningLimit`

### BUILD Output Format

```markdown
## Build Optimization Report

### Baseline
| Metric | Value |
|--------|-------|
| Clean build time | Xs |
| Incremental build time | Xs |
| Type check time | ~4s (tsgo) |
| Total JS (gzip) | XXX KB |
| Total CSS (gzip) | XX KB |
| Largest chunk | XXX KB — name |

### Findings
| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 1 | ... | high | low |

### Applied Optimizations
| Optimization | Before | After | Delta |
|-------------|--------|-------|-------|
| manualChunks | 890KB main | 340KB main | -550KB |

### Remaining Opportunities
[ranked by impact]
```

## Error Handling

| Error | Action |
|-------|--------|
| PSI API error | Retry once; fall back to Lighthouse CLI |
| URL unreachable | Report error, suggest checking deployment |
| jq not installed | Use `bun -e` to parse JSON instead |
| Unlighthouse fails | Fall back to MULTI_ROUTE PSI scan |
| Build fails during BUILD mode | Run `bun run type-check` first to surface TS errors |

---
