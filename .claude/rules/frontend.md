# Frontend Rules (Tier 2 — Generic Template)

> Replace placeholders with project specifics, or override entirely via `${overlay}/rules/frontend.md`.

## Purpose

Operational guardrails for pages, components, layouts, styling, hydration boundaries.

---

## Render mode (when framework supports multiple modes)

Astro / Next.js / Remix / Nuxt all support multiple rendering strategies. Every route declares its mode:

| Path category | Typical mode |
|---|---|
| Public marketing / blog | Static / prerendered |
| Public listing with frequently-changing data | SSR or ISR |
| Authenticated app surfaces | SSR |
| API / webhook routes | SSR (always) |
| Admin dashboard | SSR (always) |

Never SPA when the framework offers SSR/SSG — full client-side rendering hurts SEO + first-paint.

---

## Component placement

| Layer | Path |
|---|---|
| Primitives (buttons, inputs, dialogs) | `${paths.componentsRoot}/ui/` |
| Domain composites (per feature) | `${paths.componentsRoot}/<feature>/` |
| Layouts | `${paths.frontendRoot}/layouts/` |
| Pages | `${paths.frontendRoot}/pages/` (or `app/`, `routes/`) |

Default to framework's static template (`.astro`, `.tsx` server component, `.vue`, `.svelte`). Promote to client/island/interactive only when interactivity is required.

---

## Hydration / interactivity directives (when framework supports)

| Directive | When |
|---|---|
| `client:visible` / lazy-hydrate-on-visible | Default for islands below the fold |
| `client:idle` / lazy-hydrate-on-idle | Background islands (toast root, analytics) |
| `client:load` / hydrate-immediately | **Avoid** unless strictly above-the-fold and required for LCP |
| `client:only` | Only when the component cannot SSR (uses `window` at top level) |

---

## Styling

- All design tokens in `${paths.stylesRoot}/global.css` (or framework equivalent: `theme.css`, `tailwind.config.ts`, `styled-system.config`).
- **No hardcoded hex** outside the token file.
- Custom utilities defined after tokens.
- Spacing uses a named scale, not arbitrary values.

---

## Icons

- Single icon library (Lucide / Heroicons / Material Symbols / Font Awesome — pick one).
- Wrap in a single `<Icon name="…" />` component for consistency + tree-shaking.
- **Never mix** icon libraries.
- **Never use emoji** as UI icons in a professional product.

---

## Forms

- Validate with the same schema library the server uses (Zod / Valibot / Yup / equivalent).
- Re-export schemas from a shared `validators/` module so client + server share them.
- Form component handles:
  - Client-side validation on submit
  - `fetch` to server with explicit `Content-Type`
  - Error display branched on `error.code` (never on `error` substrings)
  - Loading state via `useTransition` or local `isPending`
- Accessibility: every field has a `<label>`; required fields visually marked; error messages use color **plus** icon **plus** text (never color alone).
- For PII/consent: explicit copy + boolean stored.

---

## Performance discipline

- `staleTime` on data fetching equals `refetchInterval` (avoid double-fetch).
- Memoize hot list items (`React.memo` / `Vue computed` / `Svelte $derived`) when rendering > 30 cards.
- Stabilize callbacks passed to memoized children.
- Hoist static arrays, objects, regex, formatters (`Intl`, `Date.format`) to module scope.
- Don't create expensive objects inside render bodies.
- Prefer `Set` / `Map` over repeated `.find()` / `.includes()` on hot paths.
- Use immutable array methods; never mutate state in place.
- Avoid nested scroll containers unless layout pattern requires.

---

## Images

- Static art (hero photo, logo) → framework's image component (`<Image>`, `next/image`, `<picture>`) with `loading="eager"` + `fetchpriority="high"` for LCP, otherwise `loading="lazy"` + `fetchpriority="low"`.
- User-uploaded → plain `<img>` with explicit `width` + `height` (CLS = 0).
- Below the fold: always lazy.
- Decorative: `alt=""` + `aria-hidden="true"`.
- Meaningful: descriptive `alt` in project locale.

---

## Accessibility

- One `<h1>` per page. Sectioning via `<section>` / `<article>` / `<nav>` / `<main id="…" tabindex="-1">`.
- All icon-only buttons require `aria-label`.
- Focus rings: 2px outline + offset on every interactive element. Visible always.
- Skip link is the first focusable element on every page.
- `<noscript>` block forces revealed content visible (so animation gating never hides content).
- Accordion / expand-collapse uses CSS `grid-template-rows: 0fr ↔ 1fr` — never animate `height`.
- Respect `prefers-reduced-motion` in every animation block.

---

## Negative constraints

- One package manager (npm OR pnpm OR yarn OR bun) — pick one in `.claude/config.json::tooling.packageManager`.
- No `href="#"`. `<button>` for actions; real `<a>` for navigation.
- No mixing icon libraries.
- No hardcoded hex outside token file.
- No layout property animations (`width`, `height`, `top`, `left`).
- No dropping into SPA when framework offers SSR/SSG.
- No global CSS overrides bypassing tokens.

---

## When to load more

| Need | Load |
|---|---|
| API contract / validators / server logic | `backend.md` |
| Schema / type generation | `database.md` |
| External provider UI integration | `integrations.md` |
| Universal stability checklist | `stability.md` |
| Design tokens, components, accessibility detail | `DESIGN.md` |

---

## Project-specific authority

If `${overlay}/rules/frontend.md` exists, prefer it — it captures framework specifics (Astro hybrid / Next.js App Router / Remix / Nuxt), UI library choice, and project-specific render-mode rules.
