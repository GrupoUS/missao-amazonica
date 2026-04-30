# `src/` — Agent Rules (Tier 2)

> Auto-loads when editing any file under `src/`. Combine with root `AGENTS.md` (cardinal rules) and `.claude/CLAUDE.md` (behavioral).

## Scope

This is the entire Astro app: pages, layouts, components, lib helpers, middleware, styles. TypeScript **strict**, paths `@/*` → `./src/*`.

## Top-level Layout

| Folder | Purpose | Subdir AGENTS.md |
|---|---|---|
| `pages/` | Route files. Each declares render mode. | yes |
| `pages/api/` | SSR API endpoints. `prerender = false`. | yes |
| `pages/admin/` | SSR admin panel. `prerender = false`. | yes |
| `layouts/` | `PublicLayout.astro`, `AdminLayout.astro` only. | yes |
| `components/` | Reusable UI. Group by domain. | yes |
| `components/ui/` | shadcn-style primitives + `Icon.astro`. | yes |
| `components/donation/` | Donation flow (ItemCard, DonationForm, PixPanel, RecentDonors). | yes |
| `lib/` | Server + shared helpers. | yes |
| `lib/supabase/` | Server / browser / admin Supabase clients + types. | yes |
| `lib/payments/` | Pix BR-Code + provider abstraction. | yes |
| `lib/validators/` | Zod schemas (server + island shared). | yes |
| `styles/` | `global.css` only — Tailwind v4 `@theme` tokens. | yes |
| `middleware.ts` | Supabase session hydrate + admin guard. | — |
| `env.d.ts` | Astro env typings. | — |

## Universal Rules (apply everywhere in `src/`)

1. **Render mode is mandatory.** Every `src/pages/**` file declares `export const prerender = true|false`. Public → `true`. `/admin/**` + `/api/**` → `false`.
2. **TypeScript strict.** No `as any`, no `!` non-null assertion on optional values, no `// @ts-ignore`. Use type guards or Zod parse.
3. **No `console.log`.** Use `Sentry.captureException` (errors) / `captureMessage` (notable events). `console.warn` is OK only inside Resend / Sentry no-op fallbacks.
4. **Bun-only.** Never `npm` / `yarn` / `pnpm`.
5. **Lucide-only icons** via `<Icon name="…" />` (`src/components/ui/Icon.astro`). No emoji, no Material Symbols, no Font Awesome.
6. **No hardcoded hex** outside `src/styles/global.css` `@theme`/`.dark` blocks. Use semantic tokens (`bg-primary`, `text-on-surface-variant`).
7. **No `href="#"`.** `<button>` for actions, real `<a>` for navigation. Skip-links to `#conteudo-principal` / `#admin-content` are the only exception.
8. **No SPA frameworks.** Astro hybrid only.

## Hydration Policy

| Directive | When |
|---|---|
| (none, `.astro`) | Default. Static markup, no interactivity needed. |
| `client:visible` | Default for islands below the fold. |
| `client:idle` | Background islands (toast root, theme toggle). |
| `client:load` | **Avoid** unless strictly above-the-fold and required for LCP. |
| `client:only="react"` | Only when the component cannot SSR (uses `window` at top level). |

## Donation Invariants (cross-folder)

- Donation totals are **derived** from `confirmed_amount_by_item` view — never store / mutate `collected_amount`.
- Donor PII (`donor_email`, `donor_phone`) is admin-only via RLS. Public reads go through `public_donor_list`.
- `payment_events` insert is idempotent on `(provider, bank_end_to_end_id)` with `on conflict do nothing`.
- Service-role client (`@/lib/supabase/admin.ts`) is server-only. Never import from `.tsx` islands.

## Verification

After any change in `src/`:

```bash
bunx astro check     # 0 errors, 0 warnings
bun run build        # succeeds, no missing-env warnings
```

Frontend changes: also run `bun run dev`, hit the affected page, watch for console errors.

## See Also

- Root [`AGENTS.md`](../AGENTS.md) — cardinal rules, project snapshot, performance gates
- [`.claude/rules/frontend.md`](../.claude/rules/frontend.md) — Astro + Tailwind + island patterns
- [`.claude/rules/backend.md`](../.claude/rules/backend.md) — API + Supabase server patterns
- [`.claude/rules/integrations.md`](../.claude/rules/integrations.md) — Pix, Resend, Sentry, Vercel
- [`.claude/rules/stability.md`](../.claude/rules/stability.md) — universal A–L checklist
- [`.claude/rules/DESIGN.md`](../.claude/rules/DESIGN.md) — design tokens + components contract
