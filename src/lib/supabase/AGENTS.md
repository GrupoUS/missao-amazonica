# `src/lib/supabase/` — Agent Rules (Tier 2)

> Three Supabase clients + generated types. **Import boundary is critical** — wrong client = security incident.

## Files

| File | Use from | Auth | Throws if browser |
|---|---|---|---|
| `server.ts` | Astro pages, API routes, middleware | Cookie session via `@supabase/ssr` | no |
| `browser.ts` | React `.tsx` islands ONLY | Anon key, public | no |
| `admin.ts` | Webhook handlers + admin-action endpoints ONLY | Service-role key | **YES** (import-time) |
| `types.ts` | Anywhere needing typed rows | — | (just types) |
| `aliases.ts` | Type narrowing helpers (`asUrgency`, `asItemStatus`) | — | (just types) |
| `helpers.ts` | Custom query helpers | — | depends on client used |

## Iron Rules

1. **`admin.ts` is server-only.** It MUST throw at the top of the file if it's accidentally bundled for the browser. Pattern:
   ```ts
   if (!import.meta.env.SSR) {
     throw new Error('admin.ts is server-only. Do not import from a .tsx island.');
   }
   ```
   Never import this from `.tsx` files. The bundler will pull `SUPABASE_SERVICE_ROLE_KEY` into client JS — instant data breach.
2. **`server.ts` is per-request.** Use it from API routes (`locals.supabase` is hydrated by middleware) and Astro server scripts. RLS enforces auth automatically.
3. **`browser.ts` uses anon key only.** Public reads via RLS; never admin operations.

## Picking a Client

```
Is the call from a webhook OR an admin POST that confirms a donation?
  YES → admin.ts (service-role, bypasses RLS, must be paired with manual auth check)
  NO  → server.ts (cookie session, RLS enforces auth)

Is the call from a React island (.tsx)?
  YES → browser.ts (anon, RLS; never admin.ts)
  NO  → see above
```

## Type Generation

After every schema change in `supabase/migrations/`:

```bash
bunx supabase gen types typescript --linked > src/lib/supabase/types.ts
```

Commit `types.ts` together with the migration. Stale types are a stability A–L violation.

## Query Patterns

- Always destructure `{ data, error }` from `.select()` / `.insert()` / `.update()`. Check `error` before using `data`.
- `.single()` returns `data: null` when row missing — check both `error` AND `data`:
  ```ts
  const { data, error } = await supabase.from('x').select('…').single();
  if (error || !data) return Response.json({ error: '…', code: 'not_found' }, { status: 404 });
  ```
- For arrays, check `error` first, then `data?.length`. Never destructure `data[0]` without guard.
- Never `as any` to bypass type errors. Regenerate types or use Zod parse.
- For deeply nested selects (`select('id, categories(name)')`), the generated row type may be loose — narrow via `aliases.ts` helpers.

## RLS Awareness

- RLS is the primary auth layer. The per-request `server.ts` client has the user's session; RLS will deny unauthorized rows.
- For elevated work (webhook → confirm donation), use `admin.ts` AND explicitly enforce idempotency + audit logging.
- Never re-implement `is_admin` in TS. Call the plpgsql function via `supabase.rpc('is_admin', { uid })`.

## Donor PII

- `donor_email` / `donor_phone` are admin-only. Public reads use the `public_donor_list` view (consent-filtered).
- Any new query that joins `donation_intents` must explicitly drop these columns OR be reachable only from admin paths.

## Don'ts

- ❌ `import { admin } from '@/lib/supabase/admin'` from a `.tsx` file. Ever.
- ❌ `service_role` env var in any client-bundled module.
- ❌ Bypass `confirm_donation` plpgsql function — never set `donation_intents.status = 'confirmed'` from JS.
- ❌ `as any` on Supabase results.
- ❌ Re-create the client per-request inside a hot loop. Use `locals.supabase`.

## See Also

- [`.claude/rules/database.md`](../../../.claude/rules/database.md) — RLS, views, function patterns
- [`.claude/rules/backend.md`](../../../.claude/rules/backend.md) — server client usage in API routes
- [`@/middleware.ts`](../../middleware.ts) — session hydration
