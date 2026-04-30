# `src/layouts/` — Agent Rules (Tier 2)

> Layout files only. `PublicLayout.astro` (public pages) and `AdminLayout.astro` (admin panel). Auto-loads when editing files here.

## Layout Contract

Both layouts must:

1. **FOUC kill.** Inline `<script is:inline>` in `<head>` BEFORE any stylesheet — reads `localStorage['salda-theme']` (default `'system'`) + `matchMedia('(prefers-color-scheme: dark)')`, sets `<html class="dark">` if resolved theme is dark. Wrap in `try { } catch { }` (localStorage can throw in private mode).
2. **Skip link first.** First focusable element of `<body>` is `<a href="#…" class="skip-link">Pular para o conteúdo</a>` pointing at `<main id="…" tabindex="-1">`.
3. **Theme color meta.** Two `<meta name="theme-color">` with `media="(prefers-color-scheme: …)"` for light / dark.
4. **Reveal observer.** Inline `<script is:inline>` near `</body>` adds `is-visible` to `.reveal` elements via IntersectionObserver. Bypass when `prefers-reduced-motion: reduce` (visible immediately) or no `IntersectionObserver`.
5. **`<noscript>` fallback.** `.reveal { opacity: 1 !important; transform: none !important; }` so non-JS users see content.
6. **Theme toggle mounted.** `<ThemeToggle client:idle />` — PublicLayout: header right; AdminLayout: sidebar `mt-auto`.
7. **Toaster mounted.** `<Toaster client:idle position="bottom-right" richColors closeButton />` — site-wide toast root.
8. **Font preconnect.** `<link rel="preconnect" href="https://fonts.googleapis.com">` + `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` BEFORE the `@import` stylesheet.
9. **Semantic structure.** Exactly one `<h1>` per page (rendered inside `<main>` by the page, not the layout).

## Public vs Admin

| Property | PublicLayout | AdminLayout |
|---|---|---|
| Header | sticky `<header>` with logo + nav + CTA "Contribuir" + ThemeToggle + admin link | Fixed left `<aside>` 240 px wide with nav + ThemeToggle + logout |
| Main wrapper | `<main id="conteudo-principal" tabindex="-1">` | `<main id="admin-content" tabindex="-1">` with `ml-64` |
| Footer | yes — 3-col grid + links | no |
| `<meta robots>` | indexed by default · `noindex` if `noindex` prop set | always `noindex,nofollow` |
| OG / Twitter meta | yes | minimal (admin not shareable) |

## Forbidden in Layouts

- ❌ Hex literals — use semantic tokens (`bg-surface-container-lowest`, not `bg-[#faf6f0]`).
- ❌ `dark:bg-*` for surfaces — use the semantic token; the `.dark { … }` override in `global.css` handles swap.
- ❌ Putting the FOUC inline script AFTER the stylesheet — flash will happen.
- ❌ Importing server-only modules (`@/lib/supabase/admin`) from a layout that runs on prerendered pages.
- ❌ Static `<a>` for actions like menu toggle — use `<button data-…>` and a tiny inline script if needed.

## Adding a Section to a Layout

1. Decide whether it belongs in the layout (every page that uses it) or in the page (one-off).
2. If layout-level, accept a `<slot name="…">` for page-specific override.
3. Wrap interactive elements in islands with appropriate `client:idle` / `client:visible`.

## Verification

```bash
bunx astro check
bun run build
# Manual checks:
# 1. localStorage.salda-theme = 'dark' → reload / → no white flash on first paint
# 2. Tab through page → skip link visible on first Tab, focus rings on every interactive element
# 3. Reduced motion emulation → reveal elements appear instantly, no transition
```

## See Also

- [`.claude/rules/frontend.md`](../../.claude/rules/frontend.md) — render mode + accessibility
- [`.claude/rules/DESIGN.md`](../../.claude/rules/DESIGN.md) — design tokens + nav spec § 4.7
- [`@/components/ui/AGENTS.md`](../components/ui/AGENTS.md) — ThemeToggle, Toaster contract
