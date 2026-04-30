# `src/components/ui/` — Agent Rules (Tier 2)

> Reusable primitives. **Zero domain logic.** Auto-loads when editing files here.

## Inventory

| File | Type | Purpose |
|---|---|---|
| `Icon.astro` | Astro | Lucide adapter via mapping in `@/lib/icons.tsx`. |
| `Button.astro` | Astro | variants: primary / secondary / ghost / outline / destructive · sizes: sm/md/lg. |
| `Card.astro` | Astro | variants: default / metric / accountability / modal · accents: primary / secondary / tertiary / error / outline. |
| `Badge.astro` | Astro | tones: urgent / high / medium / low / success / neutral / category / info. |
| `Input.astro`, `Select.astro`, `Textarea.astro` | Astro | Form inputs with label/hint/error. |
| `ProgressBar.astro` | Astro | 8 px track, fill semantic-tokenized. |
| `EmptyState.astro` | Astro | Icon + message fallback. |
| `Reveal.astro`, `Spotlight.astro` | Astro | Motion utilities (CSS-only + tiny scripts). |
| `ThemeToggle.tsx` | React island | Light / dark / system cycle, View Transitions API. |
| `AnimatedNumber.tsx` | React island | rAF count-up triggered on viewport-enter. |
| `dialog.tsx` | React (radix-ui) | Modal primitive (shadcn). |
| `sonner.tsx` | React | Toaster primitive (shadcn). |
| `tabs.tsx` | React (radix-ui) | Tab primitive (shadcn). |
| `badge-helpers.ts` | TS helper | Tone + label maps for Badge. |

## Hard Rules

1. **Tokens, not hex.** All colors via M3 semantic tokens (`bg-primary`, `text-on-surface-variant`, `border-outline-variant`). Hex literals → `git blame` will find you.
2. **Lucide-only.** Icon imports either via `Icon.astro` (Astro) or `lucide-react` (React). No raw SVG, no Material Symbols.
3. **Mode contract.** Light values in `@theme {…}` block; dark values override on `.dark { … }` in `src/styles/global.css`. Components consume via the `bg-token` / `text-token` utility — never hardcode per-mode.
4. **No business logic.** A primitive should not know about donations, items, users, RLS. Pull domain shape into props.
5. **Slot first.** Astro components default to `<slot />`. React primitives accept `children`.
6. **`cn()` for class merge.** Import from `@/lib/utils`. Never string-concat conditionally.
7. **Reduced-motion guard.** Any animation honors `prefers-reduced-motion: reduce`. CSS transitions get the global guard in `global.css`; JS animations need `matchMedia('(prefers-reduced-motion: reduce)').matches` short-circuit.
8. **Focus visible.** Don't override the global `*:focus-visible` ring.
9. **Touch target ≥ 44 px on mobile.** Icon buttons: 40×40 desktop / 44×44 mobile.

## shadcn Primitive Notes

- shadcn-generated files use the new-york style and reference shadcn-named tokens (`bg-popover`, `text-muted-foreground`, `--radius`). Those tokens are aliased to M3 in `global.css` `@theme` (e.g., `--color-popover: var(--color-surface-container-lowest)`). **Do not introduce raw hex when refactoring shadcn output.**
- `dark:` prefix is ALLOWED here because `@custom-variant dark (&:where(.dark, .dark *))` is registered. Prefer the semantic token (auto-swaps via `.dark`) — use `dark:` only when shadcn template requires it for `data-state` color shifts.
- `sonner.tsx` reads theme via MutationObserver on `<html class>`, not `next-themes`. Don't reintroduce `next-themes`.

## ThemeToggle Specifics

- Storage key: `'salda-theme'` · values `'light' | 'dark' | 'system'`.
- View Transitions origin set via CSS vars `--toggle-x` / `--toggle-y` on `<html>`.
- FOUC-prevention is the `<script is:inline>` block in both layouts' `<head>`. Don't move it after the stylesheet.
- Cross-tab sync via `storage` event. System mode listens to `matchMedia('(prefers-color-scheme: dark)')` change.

## Adding a New Primitive

1. Check if it should live in `donation/` / `admin/` instead — UI primitives are domain-agnostic.
2. Default to `.astro` unless interactivity is required.
3. Define `Props` interface.
4. Use semantic tokens. Validate light + dark contrast against `.claude/rules/DESIGN.md` § 2.8 / § 2.9 before commit.
5. Add `aria-label` for icon-only buttons.
6. If it animates: `transform` / `opacity` only (never `width` / `height` / `top` / `left` / `padding` / `margin`).

## See Also

- [`.claude/rules/DESIGN.md`](../../../.claude/rules/DESIGN.md) — full token / component spec
- [`.claude/rules/frontend.md`](../../../.claude/rules/frontend.md) — hydration + styling
- [`@/lib/icons.tsx`](../../lib/icons.tsx) — Material Symbols → Lucide map
