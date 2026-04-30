# Design Rules (Tier 2 — Generic Template)

> Replace placeholders with project specifics, or override entirely via `${overlay}/rules/DESIGN.md`.

## Purpose

Design tokens, component specs, typography, color, accessibility constraints. Single source of truth for visual decisions.

---

## North star

Every product has a creative north star — a one-sentence description of the visual atmosphere. Examples:
- "Stripe minimalism with human warmth"
- "Linear precision, calm authority"
- "Vercel sharpness, honest typography"

**The project's north star lives in `${overlay}/rules/DESIGN.md`.** It anchors every design decision: tokens, type, spacing, components.

---

## Brand anchors

Every project picks a small set of mode-invariant anchors:
- Primary color (signal-only, used sparingly)
- Secondary color (CTAs, links, focus rings)
- Single typography family (or 1 + wordmark exception)
- Spacing grid (8px or 4px strict)
- Page background (rarely pure white — usually warm or cool tinted)
- Border treatment (ghost borders @ 0.3 opacity / solid 1px / none)

---

## Anti-traps (rejection gates)

| Trap | Trigger | Fix |
|---|---|---|
| Sales-loud | "BUY NOW!", red CTAs everywhere, urgency timers piscando | Calm authority — single primary CTA per section |
| Stock-clinical | `#fff` everywhere + tech-stock images | Warm neutrals + real photography |
| Token-drift | Inline `#hex` in components | Semantic token only |
| Icon-mix | Material Symbols + Lucide + emoji co-existing | One library only |
| Mode-bleed | `bg-stone-900` in light mode, light tokens in dark mode | Strict mode contract — `dark:` variant; never cross-mode |

**Template test:** "Could this be a Vercel/Stripe template?" → YES = FAIL.

---

## Color system (Material 3 reference)

When using Material 3 design tokens, the contract is:

- **Primary family:** primary / on-primary / primary-container / on-primary-container + fixed variants
- **Secondary family:** secondary / on-secondary / secondary-container / on-secondary-container + fixed
- **Tertiary family:** tertiary / on-tertiary / tertiary-container / on-tertiary-container + fixed
- **Surface hierarchy (7 tiers):** surface-bright / surface-dim / surface-container-{lowest, low, normal, high, highest}
- **Outlines:** outline (strong) / outline-variant (subtle)
- **Status:** error / on-error / error-container / on-error-container

**Mode contract — golden rule:** never mix tokens between light and dark modes. Each mode has a complete, independent token set. The only mode-invariant tokens are the `*-fixed` family.

---

## Typography

- **Single family discipline.** One typeface for all UI. One exception only: the wordmark in the header.
- **Tabular numerals** (`font-variant-numeric: tabular-nums`) on currency, counters, percentages.
- **Headline-to-body ratio** ≥ 2× (h1 vs body).
- **No size below 12px** (legibility).
- **Sentence case** in headlines. UPPERCASE only in status pills (with `tracking: 0.04em`).
- **Body text** never pure black or pure white — use warm near-black / warm near-white.

Reference scale (Tailwind v4 `--text-*` tokens):
- Hero (h1): 48px / 1.2 / -0.02em / 700
- Section (h2): 32px / 1.3 / -0.01em / 600
- Card (h3): 24px / 1.4 / 600
- Body large: 18px / 1.6 / 400
- Body base: 16px / 1.6 / 400
- Label small: 14px / 1.2 / 0.02em / 500
- Caption: 12px / 1.2 / 400
- Badge / status: 11–12px / 0.04em / 500 / UPPERCASE

---

## Spacing

8px grid strict. Named scale: `xs 4 · sm 8 · md 16 · lg 24 · xl 32 · xxl 48 · huge 64`. Never 7px or 13px.

Section vertical: `py-huge` (64px) between thematic sections; `py-xxl` (48px) on mobile.
Card padding: `p-md` mobile / `p-lg` desktop. Never below `p-md`.

---

## Border radius

Generic scale:
- `sm` 4px — badges, micro-pills
- `md` 6px — compact inputs
- `lg` 8px — buttons, default inputs
- `xl` 12px — standard cards
- `2xl` 16px — large containers, modals
- `3xl` 24px — media-prominent containers
- `full` 9999px — pills, avatars, icon buttons

---

## Depth & elevation

- Light mode: shadows are primary; tonal layering supplements alt sections
- Dark mode: tonal layering is primary; shadows only for overlays/modals

Soft shadows: `0 4px 12px rgba(0,0,0,0.02-0.05)` for cards. Larger shadows for modals/toasts. Never aggressive `box-shadow: 0 0 50px` glows.

---

## Iconography

- One library only (Lucide / Heroicons / Phosphor — pick one in `${overlay}/rules/DESIGN.md`).
- Wrap in `<Icon name="…" />` component for consistency.
- Sizes: 16 / 20 / 24 / 32 / 48.
- `aria-label` mandatory on icon-only buttons.
- No emoji as UI icons. No Material Symbols font. No Font Awesome.

---

## Motion

- `prefers-reduced-motion` respected in every animation.
- Allowed properties: `transform`, `opacity` (GPU-only).
- Forbidden: animating `width`, `height`, `top`, `left`, `padding`, `margin`.
- Accordion: `grid-template-rows: 0fr ↔ 1fr` (not `height: auto`).
- Default transitions: `150ms ease`. Reveals: `300ms ease-out`.
- Focus ring: `outline 2px solid <secondary>` + `outline-offset 2px`.

---

## Imagery

- Hero: framework `<Image>` with `loading="eager"` + `fetchpriority="high"`.
- Below fold: `loading="lazy"` + `fetchpriority="low"`.
- Aspect ratios: hero 16:9 or 21:9; card 4:3; avatar 1:1.
- Always explicit `width` + `height` (CLS = 0).
- Decorative: `alt=""` + `aria-hidden="true"`.
- Meaningful: descriptive alt in project locale.

---

## Accessibility

- WCAG AA contrast minimum on every text/background pair.
- One `<h1>` per page; sectioning by `<section>` / `<article>` / `<nav>` / `<main>`.
- Focus rings always visible.
- Skip link is the first focusable element.
- All form fields associated with `<label>`.
- All icon-only buttons have `aria-label`.
- Color is never the sole status indicator (always color + icon + text).
- Keyboard navigation: full FAQ / modal / table / accordion.

---

## Token usage rules

- Always semantic tokens (`bg-surface`, `text-on-surface`).
- Never hex inline in components — only in `@theme` / token file.
- Never cross-mode tokens (no light tokens used in dark mode bodies).
- Components reference tokens; mockups may use hex literals — never copy hex from mockups to code.

---

## Project-specific authority

If `${overlay}/rules/DESIGN.md` exists, it carries the **authoritative** north star, palette, type pairing, component spec, and full contrast validation tables. This template is a scaffold only.
