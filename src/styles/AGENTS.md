# `src/styles/` — Agent Rules (Tier 2)

> `global.css` only. Tailwind v4 `@theme` tokens + `.dark { … }` overrides + reusable utilities.

## File Layout

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@custom-variant dark (&:where(.dark, .dark *));

@theme { /* light tokens (50 colors + 13 typography vars + 7 spacing + 8 radius + 4 shadow + 17 shadcn aliases) */ }

.dark { /* dark token overrides — primary M3 + dark shadows */ }
:root { color-scheme: light; }

@layer base { /* html / body / focus-visible / heading defaults */ }
@layer utilities { /* shadow-* / type-* / .skip-link / .reveal / .theme-transitioning / reduced-motion guard */ }

::view-transition-old(root) { … }
::view-transition-new(root) { animation: theme-circle-reveal 500ms …; }
@keyframes theme-circle-reveal { … }
```

## Hard Rules

1. **All hex literals live in this file.** Components NEVER use `bg-[#…]` or `style="color: #…"`. Source of truth: `.claude/rules/DESIGN.md` § 2.2-2.6.
2. **Mode contract.** Light values in `@theme`. Dark values override the same properties on `.dark { … }`. NEVER mix modes (no `dark:bg-zinc-900` cross-mode bleed).
3. **shadcn aliases reference M3.** `--color-popover: var(--color-surface-container-lowest)` etc. — when shadcn primitives ship `bg-popover`, it auto-swaps via `.dark`. Don't redefine the alias in `.dark`; it inherits the M3 swap.
4. **Spacing on 8 px grid.** `--spacing-{xs,sm,md,lg,xl,xxl,huge}`. Don't add intermediates.
5. **Typography roles only.** `--text-{h1,h2,h3,body-lg,body-base,label-sm,caption}` with size + weight + line-height + letter-spacing. Never inline arbitrary `font-size`.
6. **No emoji in CSS content.** Lucide via `<Icon>`.
7. **Motion safety.** Animation properties limited to `transform` + `opacity`. Forbidden: `width`, `height`, `top`, `left`, `padding`, `margin`. Accordion: `grid-template-rows: 0fr ↔ 1fr`.
8. **Reduced motion guard.** `@media (prefers-reduced-motion: reduce)` zeros `animation-duration` + `transition-duration` for all elements. `.reveal` becomes `opacity: 1; transform: none`. NEVER skip this guard when adding a new animation.
9. **Focus ring is global.** Defined on `*:focus-visible`. Don't override per-component.

## Adding a Token

1. Check it doesn't already exist (especially `surface-container-*` tiers cover most semantic backgrounds).
2. Add to `@theme { }` with the light value.
3. Add the dark override in `.dark { }` if the value differs by mode.
4. If it's a shadcn alias, reference an existing M3 token (`var(--color-…)`).
5. Validate contrast against `.claude/rules/DESIGN.md` § 2.8 (light) AND § 2.9 (dark). WebAIM ≥ 4.5:1 for body text.

## Adding a Utility

1. Place in `@layer utilities`.
2. Use existing tokens (`var(--color-…)`, `var(--shadow-…)`).
3. If it animates, ensure reduced-motion guard handles it.
4. Avoid `!important` unless competing with a third-party stylesheet (sonner toast).

## Don'ts

- ❌ Hex literal anywhere outside `@theme` / `.dark`.
- ❌ Pure white (`#fff`) page background — use `--color-background` (`#f9faf6` light, `#0f1411` dark).
- ❌ Pure black (`#000`) text — use `--color-on-background` (`#1a1c1a` light, `#e1e3df` dark).
- ❌ Animate layout properties.
- ❌ Skip reduced-motion guard.
- ❌ `dark:bg-stone-900` style cross-mode utilities.
- ❌ Inline `<style>` in components — token-bound CSS lives here.

## Verification

```bash
# After any change here:
bun run build      # confirms Tailwind compiles, tokens are referenced correctly
# Manual:
# - DevTools → toggle <html class="dark"> → confirm 100% surfaces swap
# - WebAIM contrast checker on each pair from DESIGN.md §2.8/§2.9
# - Lighthouse Accessibility ≥ 95 on / and /admin
```

## See Also

- [`.claude/rules/DESIGN.md`](../../.claude/rules/DESIGN.md) — full token spec
- [`.claude/rules/frontend.md`](../../.claude/rules/frontend.md) — utility usage from components
- [`docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md`](../../docs/stitch-design/miss_o_amaz_nica_design_system/DESIGN.md) — canonical token authority
