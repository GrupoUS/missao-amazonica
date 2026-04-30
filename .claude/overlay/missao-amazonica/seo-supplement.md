# SEO Supplement — Missão Amazônica

> Loaded by `performance-optimization` skill (`seo-geo-baseline` pack) when scanning this project.

## Locale

`pt-BR`. Every public page sets `<html lang="pt-BR">`.

## Routes (Astro hybrid)

| Route | prerender | SEO requirements |
|---|---|---|
| `/` | true | OG image, Schema.org `Organization` + `WebSite` |
| `/doar` | true | Schema.org `ItemList` of donation items, ISR-style rebuild on admin write |
| `/doar/[slug]` | false (SSR) | Schema.org `Product` per item with `offers.priceCurrency=BRL`, `priceValidUntil` |
| `/prestacao-de-contas` | true (rebuild on publish) | Schema.org `Article` with `author`, `datePublished`, `dateModified` |
| `/admin/**` | false (SSR) | `<meta name="robots" content="noindex,nofollow">` mandatory |
| `/api/**` | false (SSR) | No SEO; `Cache-Control: no-store` on per-user endpoints |

## Sitemap

Generated at build time. Public routes only. Excludes `/admin/**` and `/api/**`. Re-trigger build (Vercel webhook) after admin "publish" actions.

## robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://<production-domain>/sitemap.xml
```

## OG / Twitter cards

Every page declares:
- `og:title`, `og:description`, `og:image` (1200×630), `og:locale=pt_BR`, `og:type=website` (or `article` for accountability entries)
- `twitter:card=summary_large_image`

Hero photography (Rio Negro) is the OG default unless a page provides override via frontmatter.

## Schema.org JSON-LD

`Organization` (root):
```json
{
  "@context": "https://schema.org",
  "@type": "NGO",
  "name": "Missão Amazônica — Sal da Terra",
  "url": "https://<production-domain>",
  "logo": "https://<production-domain>/logo.svg",
  "areaServed": { "@type": "Place", "name": "Rio Negro, Amazonas, Brasil" }
}
```

`Product` (per donation item, SSR'd in `/doar/[slug]`):
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "<item.title>",
  "description": "<item.description>",
  "image": "<item.image_url>",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "BRL",
    "price": "<item.target_amount_cents / 100>",
    "availability": "<published ? InStock : OutOfStock>"
  }
}
```

`Article` (per accountability entry):
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "<entry.title>",
  "datePublished": "<entry.published_at>",
  "dateModified": "<entry.updated_at>",
  "author": { "@type": "Organization", "name": "Missão Amazônica" }
}
```

## CWV thresholds (project-specific override)

Match `_shared.md` § 1 + `.claude/rules/stability.md`:
- LCP < 2.5s
- CLS = 0 (donation card images mandatory `width`/`height`)
- INP < 100ms
- Initial JS < 50KB on prerendered pages

## AI citation (GEO) considerations

- Accountability entries should include date + author + receipt links → maximizes LLM citation
- Avoid client-only-rendered prices on donation detail (SSR is the rule — `prerender = false` for `/doar/[slug]`)
- Public_donor_list view exposes consented donor names — optionally expose via Schema.org `Donation` type if public transparency is desired
