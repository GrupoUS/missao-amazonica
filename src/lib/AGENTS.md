# `src/lib/` — Agent Rules (Tier 2)

> Server-side helpers + shared utilities. Auto-loads when editing files here.

## Folder Map

| Folder | Purpose | Has its own AGENTS.md |
|---|---|---|
| `supabase/` | Server / browser / admin clients + generated `types.ts`. | yes |
| `payments/` | Pix BR-Code generator + provider abstraction (`bank-pix`, `manual`). | yes |
| `validators/` | Zod schemas (shared between API + islands). | yes |
| `email/` | Resend wrapper + templates. | no |
| `auth/` | Admin guard helpers. | no |
| `audit/` | `logAudit()` + structured audit context. | no |
| `monitoring/` | Sentry init wrapper. | no |
| `format/` | pt-BR formatters (BRL, date, relative). | no |
| `icons.tsx` | Material Symbols → Lucide map. | (file) |
| `utils.ts` | `cn()` for class merge (`clsx` + `tailwind-merge`). | (file) |

## Server-Boundary Rules

1. **`*.ts` files in `lib/` are server-first.** Default assumption: imported from API routes / middleware / Astro server scripts. Anything that uses `window`, `document`, `localStorage`, or `addEventListener` must be in a `.tsx` island under `src/components/`, NOT in `lib/`.
2. **Browser-allowed exceptions** (single-imports OK from `.tsx`): `format/*`, `icons.tsx`, `utils.ts`, `validators/*`, `supabase/browser.ts`. Keep this list small.
3. **`supabase/admin.ts` is server-only.** It throws at import time if `import.meta.env.SSR === false`. Never import from a `.tsx` island — even indirectly via a wrapper.
4. **Never re-export `process.env`.** Read via `import.meta.env.<KEY>` (Astro contract) and validate immediately. Provide a fail-fast helper if the var is required.
5. **No top-level side effects.** Module load should not open connections, register listeners, or fire fetches.

## Error Discipline

- Never throw raw `Error` from a public helper. Throw typed errors with stable codes (e.g., `class WebhookSignatureError extends Error { code = 'webhook_invalid_signature' }`) — API routes branch on `code`.
- Wrap external calls (`fetch`, Supabase, Resend) with timeouts (5 s sync / 30 s batch) + `Sentry.captureException` on failure.
- Never silently swallow — at minimum `Sentry.captureMessage` with `level: 'warn'`.

## Type Discipline

- Generated Supabase types live in `supabase/types.ts`. Regenerate after every schema change:
  ```bash
  bunx supabase gen types typescript --linked > src/lib/supabase/types.ts
  ```
- Never `as any`. Use `unknown` + Zod parse at boundaries.
- Closed type unions on enums (`type Provider = 'bank_pix' | 'manual' | 'mercado_pago' | 'asaas'`). Never widen to `string`.

## Logging

- Errors → `Sentry.captureException(err, { tags: { route, provider, intent_id } })`.
- Notable info events → `Sentry.captureMessage('donation_confirmed', { level: 'info', extra: { item_id, amount_cents } })`.
- **Never log donor PII** (`donor_email`, `donor_phone`, full `donor_name` for anonymous). Strip in `Sentry.beforeSend`.

## Sub-folder Quick Reference

- `email/`: `sendEmail()` returns `{ skipped: true }` when `RESEND_API_KEY` undefined. Never throw. Subjects in pt-BR. No PII in subjects.
- `auth/`: `requireAdmin(Astro)` — fail with 403 if not in `admin_users`. Never re-implement `is_admin` in TS — DB function is source of truth.
- `audit/`: `logAudit({ actorId, action, entityType, entityId, before, after })`. Every admin POST/PATCH/DELETE calls it.
- `monitoring/`: `initSentry()` no-ops when `SENTRY_DSN` undefined.
- `format/`: `formatBRL(cents, { compact? })`, `formatRelative(date)`. UI binds via `tabular-nums` class.

## See Also

- [`.claude/rules/backend.md`](../../.claude/rules/backend.md) — full server patterns
- [`.claude/rules/integrations.md`](../../.claude/rules/integrations.md) — provider patterns
- [`.claude/rules/stability.md`](../../.claude/rules/stability.md) — A–L universal checklist
