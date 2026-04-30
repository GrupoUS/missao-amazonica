---
globs: src/pages/**, src/components/**, src/layouts/**, src/styles/**, src/lib/icons.tsx, src/lib/format/**
---

# Frontend Rules (Tier 2 — Auto-loaded)

> Authority: this file + root `AGENTS.md`. Visual reference: `docs/stitch-design/`.

## Purpose

Operational guardrails for Astro pages, layouts, components, styling, hydration boundaries.

---

## Render Mode

| Path | Mode | Declaration |
|---|---|---|
| `src/pages/index.astro` | static | `export const prerender = true;` |
| `src/pages/doar/index.astro` | static | `prerender = true` |
| `src/pages/doar/[slug].astro` | SSR | `prerender = false` |
| `src/pages/prestacao-de-contas.astro` | static (rebuild on admin write) | `prerender = true` |
| `src/pages/admin/**` | SSR | `prerender = false` |
| `src/pages/api/**` | SSR | `prerender = false` |

Hybrid is **mandatory** (root cardinal rule #4). Never SPA.

---

## Component Placement

- `src/components/ui/` — shadcn-style primitives + `Icon.astro` adapter. Never product-specific composites here.
- `src/components/donation/` — donation flow (ItemCard, DonationForm, PixPanel, RecentDonors).
- `src/components/accountability/` — accountability cards, timeline.
- `src/components/admin/` — admin dashboard primitives (MetricCard, ItemsTable, LogsFeed, FileUpload).
- `src/layouts/` — `PublicLayout.astro`, `AdminLayout.astro` only.
- `src/pages/` — route pages only; never reusable components.

Default to `.astro` files. Promote to `.tsx` (React island) only when interactivity is required:

| Component type | File |
|---|---|
| Hydration-free static markup | `.astro` |
| Form, polling, optimistic UI, toast queue | `.tsx` (React 19 island) |

---

## Hydration Directives

| Use | When |
|---|---|
| `client:visible` | Default for islands below the fold (`<DonationForm client:visible />`) |
| `client:idle` | Background islands that hydrate after main thread free (toast root) |
| `client:load` | **Avoid** unless strictly above-the-fold and required for LCP — and even then, prefer `.astro` |
| `client:only="react"` | Only when the component cannot SSR (e.g., uses `window` at top level) |

---

## Styling

- All tokens come from `src/styles/global.css` `@theme { … }`. Use semantic Tailwind classes: `bg-surface-container-lowest`, `text-on-surface`, `border-outline-variant`, `text-secondary`.
- **No hardcoded hex** outside `@theme`. The token list is enumerated in `AGENTS.md` § Design System and in `docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md`.
- Custom utilities live in `global.css` after the `@theme` block: `.shadow-card`, `.shadow-card-hover`, `.shadow-modal`, `.skip-link`.
- Spacing uses the named scale (`p-md`, `gap-lg`, `mb-huge`) per the 8-px grid.

---

## Icons

```astro
---
import Icon from '@/components/ui/Icon.astro';
---
<Icon name="hand_heart" size={20} class="text-secondary" />
```

- Source from `src/lib/icons.tsx` (mapping table).
- Mockup names map to Lucide names via the table; missing key → typecheck error.
- Use the Astro variant (`Icon.astro`) for SSR; the React variant exists only for islands that already render via React.
- **Never** import a `Material Symbols Outlined` font, never use `<span class="material-symbols-outlined">`, never use emoji.

---

## Forms

- All forms validate with the same Zod schemas the server uses (re-export from `src/lib/validators/`).
- Form islands handle:
  - client-side Zod validation on submit
  - `fetch('/api/...', { method, body, headers })` with explicit `Content-Type: application/json`
  - error display branched on `error.code` (never on `error` substrings)
  - loading state via `useTransition` or local `isPending`
- LGPD consent: every donation form shows explicit copy ("Autorizo exibir meu nome…") and stores the boolean.

---

## Performance Discipline

- `staleTime` on any TanStack Query usage equals `refetchInterval`.
- Memoize hot list items (`React.memo`) when rendering > 30 cards.
- Stabilize callbacks passed to memoized children (`useCallback` with full dep list).
- Hoist static arrays, objects, `Intl` instances, and regexes to module scope.
- Don't create expensive objects inside render bodies.
- Prefer `Set` / `Map` over repeated `.find()` / `.includes()` on hot paths.
- Use immutable array methods; never mutate state in place.
- Avoid nested scroll containers unless the layout pattern requires them.

---

## Images

- Static art (hero photo, logo) → `astro:assets` with `<Image>`, `loading="eager"` + `fetchpriority="high"` for LCP, otherwise `loading="lazy"` + `fetchpriority="low"`.
- User-uploaded (Supabase Storage) → plain `<img>` with the public URL, **always with explicit `width` + `height`** (CLS = 0).
- Below the fold: `loading="lazy"`.
- Decorative-only: `alt=""` and `aria-hidden="true"`.
- Meaningful: descriptive `alt` in pt-BR.

---

## Accessibility

- One `<h1>` per page. Sectioning via `<section>` / `<article>` / `<nav>` / `<main id="conteudo-principal" tabindex="-1">`.
- All icon-only buttons require `aria-label`.
- Focus rings: `outline: 2px solid var(--color-secondary); outline-offset: 2px;` on every interactive element.
- Skip link `.skip-link` is always the first focusable element on the page.
- `<noscript>` block forces `[data-reveal]` content to be visible (so animation gating never hides content).
- FAQ / accordion expand uses CSS grid `grid-template-rows: 0fr ↔ 1fr` — never animate `height`.

---

## Negative Constraints

- No `npm`/`yarn`/`pnpm`. Bun only.
- No `href="#"`. `<button>` for actions, real `<a>` for navigation.
- No emoji. No Material Symbols. Lucide only.
- No hardcoded hex outside `@theme`.
- No `client:load` on non-LCP islands.
- No animation of layout properties (`width`, `height`, `top`, `left`).
- No SPA frameworks.
- No global CSS overrides bypassing tokens.

---

## When To Load More

| Need | Load |
|---|---|
| API contract / Zod schemas / server logic | `.claude/rules/backend.md` |
| Schema / type generation | `.claude/rules/database.md` |
| External provider UI integration | `.claude/rules/integrations.md` |
| Universal stability checklist | `.claude/rules/stability.md` |
