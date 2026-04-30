# Unlighthouse — Site-Wide Audits

For full-site crawling and multi-page audits. Requires Node 20+ and Chrome.

## Installation

```bash
# One-off run (no install)
npx unlighthouse --site https://staging.neondash.com.br

# Or install globally
bun add -g @unlighthouse/cli unlighthouse
```

## CLI Usage

```bash
# Quick site scan (mobile, throttled)
npx unlighthouse --site https://staging.neondash.com.br --throttle --samples 1

# Specific routes only
npx unlighthouse --site https://staging.neondash.com.br \
  --urls /,/financeiro,/dashboard,/crm,/pacientes \
  --throttle --samples 1

# Desktop mode
npx unlighthouse --site https://staging.neondash.com.br --desktop

# No cache (fresh scan)
npx unlighthouse --site https://staging.neondash.com.br --no-cache
```

## Configuration File

```typescript
// unlighthouse.config.ts
import { defineUnlighthouseConfig } from 'unlighthouse'

export default defineUnlighthouseConfig({
  site: 'https://staging.neondash.com.br',
  scanner: {
    device: 'mobile',
    samples: 1,
    throttle: true,
    maxRoutes: 50,
    exclude: ['/api/*', '/health/*']
  },
  lighthouseOptions: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  },
  ci: {
    budget: {
      performance: 75,
      accessibility: 90,
      'best-practices': 80,
      seo: 95,
    }
  }
})
```

## Output

- Dashboard: `localhost:5678` (interactive Vite UI)
- Reports: `./unlighthouse-reports/` (HTML + JSON)
