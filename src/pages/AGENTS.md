# `src/pages/` — Agent Rules (Tier 2)

> Route files. Auto-loads when editing files here. **Render mode is mandatory.**

## Folder Map

| Path | Render | Layout | Notes |
|---|---|---|---|
| `index.astro` | static (`prerender = true`) | `PublicLayout` | Landing |
| `doar/index.astro` | static (`prerender = true`) | `PublicLayout` | Listing with filters |
| `doar/[slug].astro` | SSR (`prerender = false`) | `PublicLayout` | Detail. Reads item by slug per request. |
| `prestacao-de-contas.astro` | static (`prerender = true`) | `PublicLayout` | Public accountability |
| `admin/**` | SSR (`prerender = false`) | `AdminLayout` | All admin pages |
| `api/**` | SSR (`prerender = false`) | (no layout) | API routes |

## Render Mode Hard Rule

Every `*.astro` file under `src/pages/` MUST declare `export const prerender = true|false` explicitly. Without it, Astro infers from the project default (`output: 'server'` in `astro.config.mjs` → SSR for all). Forgetting on a public page = unnecessary SSR cost, dynamic page = build failure.

```ts
// Top of every page
export const prerender = true; // OR false
```

## Page Conventions

1. **One `<h1>` per page.** Render inside the page, not the layout.
2. **`description` prop** on `<PublicLayout>`: pt-BR, max 160 chars, no PII, sentence case.
3. **`activeNav` prop** for nav highlighting (`'missao' | 'projetos' | 'transparencia' | 'impacto'` for public; `'painel' | 'doacoes' | 'projetos' | 'logs' | 'configuracoes' | 'transparencia'` for admin).
4. **Server data fetch in frontmatter.** Top of file, between `---` markers. Use `Astro.locals.supabase` (per-request, RLS-bound) for SSR pages; `getSupabaseAdmin()` only when explicitly needed (and only on SSR pages).
5. **Cache headers** on prerendered routes: framework default is fine. SSR routes that touch user state set `Cache-Control: no-store` via `Astro.response.headers`.

## Data Patterns

```astro
---
import PublicLayout from '@/layouts/PublicLayout.astro';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const prerender = false;

const admin = getSupabaseAdmin();
const { data: item, error } = await admin
  .from('donation_items')
  .select('id, slug, title, …')
  .eq('slug', Astro.params.slug)
  .eq('status', 'published')
  .maybeSingle();

if (error || !item) {
  return Astro.redirect('/doar?error=not-found', 302);
}
---
<PublicLayout title={item.title} description={item.description}>
  …
</PublicLayout>
```

## Performance

- Hero `<Image>` (astro:assets) `loading="eager"` + `fetchpriority="high"` on prerendered pages.
- Below the fold: `loading="lazy"` + `fetchpriority="low"`.
- All `<img>` carry explicit `width` + `height` (CLS = 0).
- Hydration: `client:visible` / `client:idle` only. NEVER `client:load` on a non-LCP island.

## Don'ts

- ❌ Forget `export const prerender = …`.
- ❌ Mix server-only imports (`@/lib/supabase/admin`) into a page that's marked `prerender = true` and then renders that data dynamically — at build time it works, at request time the data is stale.
- ❌ Use `Astro.params` on a static page (no params at build).
- ❌ Skip the layout. Every page wraps `<PublicLayout>` or `<AdminLayout>`.
- ❌ Inline business logic — push into `@/lib/<domain>/` so it's testable + reusable.

## See Also

- [`api/AGENTS.md`](./api/AGENTS.md) — API routes
- [`admin/AGENTS.md`](./admin/AGENTS.md) — admin pages
- [`.claude/rules/frontend.md`](../../.claude/rules/frontend.md) — render mode + hydration
- [`.claude/rules/backend.md`](../../.claude/rules/backend.md) — data fetching patterns
