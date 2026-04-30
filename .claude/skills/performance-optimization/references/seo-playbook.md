# SEO Optimization Playbook

Use this playbook when improving indexability for `neondash.com.br`.

## Phase 0 — Discover First

Always confirm stack before implementation:

- frontend framework and router (`Next.js App Router` vs `Vite + TanStack Router`)
- existing robots/sitemap files and runtime endpoints
- private and dynamic routes that must not be indexed
- metadata strategy (global + route-level)

Current project baseline (verified):

- frontend is `Vite + React + TanStack Router` (not Next.js App Router)
- no `app/robots.ts` or `app/sitemap.ts` structure exists
- no `apps/web/public/robots.txt` and no `apps/web/public/sitemap.xml`
- `https://neondash.com.br/robots.txt` and `/sitemap.xml` currently return SPA HTML (`text/html`), not real robots/sitemap content

## Project Baseline Findings Table

Use this table in every SEO execution report:

| # | Finding | Confidence (1-5) | Source | Impact |
|---|---------|-----------------|--------|--------|
| 1 | Current robots.txt status | 5 | `apps/web/public` + curl response | High |
| 2 | Sitemap generation strategy | 5 | `apps/web/public` + curl response | High |
| 3 | Existing metadata patterns | 5 | `apps/web/index.html` | Medium |
| 4 | Dynamic/private routes needing exclusion | 5 | `apps/web/src/routeTree.gen.ts` + `routes/_dashboard.tsx` | High |
| 5 | Core Web Vitals current state | 4 | Lighthouse run artifacts | High |

## Edge Cases to Check (Minimum)

1. Authenticated routes indexed by accident (`/meu-dashboard`, `/clientes`, `/pacientes`, `/workspace`, `/configuracoes`).
2. Tokenized routes indexed (`/unsubscribe/$token`).
3. Missing canonical for public legal/onboarding pages.
4. Missing `og:image` absolute URL for public sharing.
5. Sitemap present but serving HTML fallback instead of XML.
6. robots/sitemap returning 200 with wrong content-type (`text/html` instead of `text/plain`/`application/xml`).

## Implementation Strategy

### A) Next.js App Router projects (reference pattern)

Use native metadata files:

- `app/robots.ts`
- `app/sitemap.ts`
- `metadataBase` in `app/layout.tsx`

For robots policy, always disallow private routes and keep crawler allowlist behavior safe:

- disallow at least: `/api/`, `/dashboard/`, `/admin/`, `/_next/`, `/auth/`
- include `sitemap` and `host`
- do not globally block all crawlers

### B) Current NeonDash stack (Vite + TanStack Router + Hono)

Use static assets served by frontend build output:

- create `apps/web/public/robots.txt`
- create `apps/web/public/sitemap.xml`

Recommended `robots.txt` policy for this repo:

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /meu-dashboard/
Disallow: /configuracoes/
Disallow: /clientes/
Disallow: /pacientes/
Disallow: /workspace/
Disallow: /chat/
Disallow: /financeiro/
Disallow: /crm/
Disallow: /ai-agents/
Disallow: /admin/
Disallow: /unsubscribe/

User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

Sitemap: https://neondash.com.br/sitemap.xml
Host: https://neondash.com.br
```

Sitemap rules for this repo:

- include only public pages (for example: `/`, `/termos`, `/privacidade`, `/comece-aqui`, `/primeiro-acesso`, `/account-deletion`)
- exclude private/authenticated and tokenized routes
- include `<lastmod>` for every URL

## Metadata Rules

For Next.js projects:

- always set `metadataBase`
- always use title template (`%s | NeonDash`)
- always set canonical and OG/Twitter image metadata

For current Vite project:

- maintain base metadata in `apps/web/index.html`
- add route-level title/description/canonical management for public pages only
- ensure meaningful images do not use empty `alt` text

## CWV Targets

- `LCP < 2.5s`
- `INP < 200ms`
- `CLS < 0.1`
- `TTFB < 600ms`

## Validation Commands

```bash
# Robots and sitemap must be real files (not SPA HTML)
curl -I https://neondash.com.br/robots.txt
curl -I https://neondash.com.br/sitemap.xml

# Verify content type + payload start
python - <<'PY'
import urllib.request
for u in ['https://neondash.com.br/robots.txt','https://neondash.com.br/sitemap.xml']:
    with urllib.request.urlopen(u, timeout=30) as r:
        body = r.read(80).decode('utf-8', errors='replace')
        print(u, r.status, r.headers.get('content-type'), repr(body))
PY

# PSI API SEO check
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://neondash.com.br&strategy=mobile&category=seo&locale=pt-BR" | jq '{seo: (.lighthouseResult.categories.seo.score * 100 | round)}'
```

## Non-Negotiable Constraints

- Never index private areas (`/api/`, `/dashboard/`, `/admin/`, `/auth/`, and equivalent private business paths).
- Never apply Next.js `app/robots.ts` guidance to non-Next stacks.
- Never ship sitemap entries without `lastmod`.
- Never block all crawlers globally.
- Never skip post-deploy curl validation.

## Success Criteria

- `/robots.txt` returns 200 with `text/plain` and expected disallow rules.
- `/sitemap.xml` returns 200 with XML content-type and valid URL set.
- URLs in sitemap return 200 and are public pages.
- Lighthouse SEO score reaches `>= 0.95` on production.
- Public pages have unique and stable title/description/canonical strategy.
