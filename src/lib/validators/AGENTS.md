# `src/lib/validators/` — Agent Rules (Tier 2)

> Zod schemas. Single source of truth between API routes + React islands.

## Files

| File | Purpose |
|---|---|
| `donation.ts` | Donation intent create / status / consent schemas. |

(Add a new file per domain: `accountability.ts`, `admin-settings.ts`, etc.)

## Pattern

```ts
import { z } from 'zod';

export const CreateDonationSchema = z.object({
  itemId: z.string().uuid(),
  amountCents: z.number().int().positive().max(100_000_00),
  donorName: z.string().min(2).max(80).optional(),
  donorEmail: z.string().email().optional(),
  donorPhone: z.string().regex(/^\+?\d{10,14}$/).optional(),
  isAnonymous: z.boolean(),
  displayNamePublicly: z.boolean(),
  consent: z.literal(true),  // LGPD
});

export type CreateDonationInput = z.infer<typeof CreateDonationSchema>;
```

## Hard Rules

1. **Module-scope only.** Define schemas at top level. NEVER inside a handler — re-parses on every request, allocates per-call.
2. **Shared between server + island.** Both `src/pages/api/donations/create.ts` and `src/components/donation/DonationForm.tsx` import the same schema. No duplication.
3. **Always `.safeParse()` at boundaries.** API route example:
   ```ts
   const parsed = CreateDonationSchema.safeParse(await request.json());
   if (!parsed.success) {
     return Response.json({ error: parsed.error.flatten(), code: 'validation_failed' }, { status: 400 });
   }
   ```
4. **Mirror DB enums.** If DB has `check (status in ('pending','confirmed','expired','cancelled','failed'))`, the Zod schema uses `z.enum(['pending','confirmed','expired','cancelled','failed'])`. Drift = silent runtime errors.
5. **Closed enums.** Never `z.string()` for an enum field. Use `z.enum([…])` so TS narrows.
6. **Max bounds.** Every `z.string()` for user input must have `.max(N)`. Every `z.number()` must have `.max()`.
7. **PII fields are optional + opt-in.** `donorEmail` / `donorPhone` are `.optional()`; the form gates them behind LGPD consent.
8. **Currency is integer cents.** `z.number().int().positive()`. Reject decimals, NaN, Infinity.

## Versioning

If a schema changes shape (add required field, narrow type), the API route handler must reject old shapes with `code: 'validation_failed'`. Front-end deploys + back-end deploys are not atomic — handle both for the rollout window.

## Don'ts

- ❌ `z.any()` or `z.unknown().passthrough()` on user input.
- ❌ Manually regex-validating fields that Zod has built-in for (`z.string().email()`, `z.string().uuid()`).
- ❌ Re-parsing inside loops.
- ❌ Coupling validator to DB row type — write the validator first, generate the row type from migration second.

## Verification

```bash
bunx astro check  # type-checks the inferred z.infer<>
# Manual: POST malformed body to the API route — confirm 400 + code 'validation_failed'.
```

## See Also

- [`.claude/rules/backend.md`](../../../.claude/rules/backend.md) — error contract `error` + `code` shape
- [`@/components/donation/AGENTS.md`](../../components/donation/AGENTS.md) — island + form integration
