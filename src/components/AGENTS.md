# `src/components/` — Agent Rules (Tier 2)

> Auto-loads when editing any file under `src/components/`.

## Folder Map

| Folder | Purpose |
|---|---|
| `ui/` | Reusable primitives (Button, Card, Badge, Input, Icon, ProgressBar, ThemeToggle, AnimatedNumber, Reveal, Spotlight, dialog, sonner, tabs). Zero domain logic. |
| `donation/` | Donation flow (ItemCard, DonationForm, PixPanel, RecentDonors). |
| `accountability/` | Public accountability cards + timeline (when added). |
| `admin/` | Admin dashboard primitives (when added). |

## Decision: `.astro` or `.tsx`

| Need | File type |
|---|---|
| Hydration-free static markup | `.astro` |
| Form, polling, optimistic UI, theme toggle, animated counter | `.tsx` (React 19 island) |
| Wraps a slot for layout / token application | `.astro` |

**Default to `.astro`.** Promote to `.tsx` only when interactivity is required.

## Naming + Props

- File names: `PascalCase.astro` / `PascalCase.tsx` for components. `kebab-case.tsx` is acceptable for shadcn-generated primitives (`dialog.tsx`, `sonner.tsx`, `tabs.tsx`) — keep their CLI-style.
- Props interface named `Props`. Astro: `const props = Astro.props as Props;`. React: `function Foo({ … }: Props)`.
- Accept `class?: string` (Astro) / `className?: string` (React) and merge via `cn()` from `@/lib/utils`.
- Accept `as?` only when the tag truly varies (Card, Reveal). Otherwise pick the right semantic tag.

## Tokens, Styling, Icons

- Semantic Material-3 tokens only: `bg-primary`, `text-on-surface`, `border-outline-variant`. Never `bg-zinc-*`, `bg-stone-*`, or hex.
- Spacing via 8 px scale (`p-md`, `gap-lg`, `mb-xl`).
- Radius via scale (`rounded-lg` buttons/inputs · `rounded-xl` cards · `rounded-2xl` modals).
- Shadows via custom utilities (`shadow-card`, `shadow-modal`, `shadow-cta`).
- Icons: `<Icon name="…" />` from `@/components/ui/Icon.astro` (Astro) or `lucide-react` direct (React island only).
- Focus ring is global (`*:focus-visible` in `global.css`) — don't re-declare.

## Hydration

- Default: no directive.
- `client:visible` for below-the-fold interactive (DonationForm, AnimatedNumber).
- `client:idle` for background (ThemeToggle, Toaster).
- Never `client:load` on a non-LCP island.

## Accessibility (component-level)

- `aria-label` mandatory on icon-only buttons.
- `aria-live="polite"` on dynamically updating numbers/timers (Pix countdown, AnimatedNumber).
- Form inputs always paired with `<label for="…">`.
- `role="status"` / `role="alert"` only when WAI-ARIA semantics are correct.

## Don'ts

- ❌ Domain logic in `ui/`. Move to `donation/`, `admin/`, or `lib/`.
- ❌ Imports from `@/lib/supabase/admin` in any `.tsx` island.
- ❌ `dark:bg-stone-900` style cross-mode literals (token swap on `.dark` already handles dark — just use semantic tokens).
- ❌ Hex literals anywhere except `global.css`.
- ❌ Side effects at module scope in `.tsx` (use `useEffect`).

## See Also

- [`.claude/rules/frontend.md`](../../.claude/rules/frontend.md) — full island + styling rules
- [`.claude/rules/DESIGN.md`](../../.claude/rules/DESIGN.md) — token + component contract
- [`ui/AGENTS.md`](./ui/AGENTS.md) — primitive-specific
- [`donation/AGENTS.md`](./donation/AGENTS.md) — donation-flow specific
