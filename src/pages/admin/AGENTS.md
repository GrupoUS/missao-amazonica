# `src/pages/admin/` — Agent Rules (Tier 2)

> SSR admin panel. **Every page is `prerender = false`.** All writes audit-logged. Donor PII may surface here (admin-only via RLS).

## Inventory

| Path | Role |
|---|---|
| `login.astro` | Email + password → Supabase Auth. Public layout (no admin guard). |
| `logout.ts` | POST → sign out. |
| `index.astro` | Dashboard — KPIs + recent items + audit logs. |
| `items/{index,new,[id]/edit}.astro` | CRUD donation items. |
| `donations/index.astro` | Donations list + filter + (optional) export. |
| `accountability/{index,new,[id]/edit}.astro` | Accountability entries CRUD. |
| `settings.astro` | Org settings (Pix bank, contact email, Resend key). |

## Iron Rules

1. **`export const prerender = false`** on every page.
2. **`AdminLayout`** wraps all pages except `login.astro` and `logout.ts`.
3. **Admin guard.** `src/middleware.ts` redirects to `/admin/login` if `!locals.user || !locals.isAdmin`. Don't re-implement — middleware is the source.
4. **Audit log on every write.** After any POST / PATCH / DELETE that mutates a donation item / accountability entry / setting, call `logAudit({ actorId: locals.user.id, action, entityType, entityId, before, after })` from `@/lib/audit/log.ts`. DB triggers exist as backstop but JS audit captures admin context (IP, user-agent).
5. **Donation totals are derived.** Render from `confirmed_amount_by_item` view. NEVER write to a `collected_amount` column — it doesn't exist for a reason.
6. **Service-role client allowed here.** Admin pages can use `getSupabaseAdmin()` after the guard passes. Never on public pages.

## PII Discipline

- Donor `email` / `phone` ARE allowed in admin views (audit, donation list). Admins need them for reconciliation.
- Never include donor PII in URLs or query params (logs leak via referrer).
- Export CSVs MUST log the export to `audit_logs` with `action='donations_exported'` + actor ID + filter context.
- Print-friendly views: hide `donor_email` / `donor_phone` unless explicit "Show PII" toggle (with audit entry).

## Page Patterns

### List page
```astro
---
import AdminLayout from '@/layouts/AdminLayout.astro';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const prerender = false;
const admin = getSupabaseAdmin();
const { data: items } = await admin.from('donation_items').select('…').order('sort_order');
---
<AdminLayout title="Itens" activeNav="projetos">
  <h1 class="type-h2">Itens</h1>
  <!-- table -->
</AdminLayout>
```

### Form page (POST handler in same file)
```astro
---
import { z } from 'zod';
import { logAudit } from '@/lib/audit/log';

export const prerender = false;
const admin = getSupabaseAdmin();

if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData();
  const parsed = ItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) { /* render with errors */ }
  else {
    const { data: created, error } = await admin.from('donation_items').insert(parsed.data).select().single();
    if (created) {
      await logAudit({ actorId: Astro.locals.user!.id, action: 'item_created', entityType: 'donation_item', entityId: created.id, after: created });
      return Astro.redirect(`/admin/items/${created.id}/edit?created=1`);
    }
  }
}
---
```

## Don'ts

- ❌ Forget `prerender = false`.
- ❌ Mutate state on GET. Admin actions go via POST (or PATCH/DELETE in API).
- ❌ Re-implement `is_admin` in TS — it's a plpgsql function (source of truth).
- ❌ Write to `donation_items.collected_amount` — column doesn't exist + invariant violation.
- ❌ Display `donor_email` in plain HTML when it could be screen-shared during a demo. Use a "Reveal PII" toggle.
- ❌ Skip the audit log "because it's a small change". DB triggers exist but JS audit has more context.

## Verification

```bash
bunx astro check
# Manual: log in, perform CRUD, confirm:
#   - audit_logs has matching row
#   - confirmed_amount_by_item updates after a donation confirms
#   - non-admin user is redirected from /admin/* to /admin/login
```

## See Also

- [`@/middleware.ts`](../../middleware.ts) — auth + guard
- [`@/lib/audit/log.ts`](../../lib/audit/log.ts) — `logAudit()`
- [`.claude/rules/backend.md`](../../../.claude/rules/backend.md) — server patterns
- [`.claude/rules/database.md`](../../../.claude/rules/database.md) — RLS + audit triggers
