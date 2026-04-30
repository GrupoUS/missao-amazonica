# `supabase/migrations/` — Agent Rules (Tier 2)

> Numbered SQL migrations. **Never edit a pushed migration — add a new one.**

## Filename Convention

`NNNN_short_description.sql` — zero-padded 4-digit prefix, snake_case description.

```
0001_init.sql
0002_admin_users.sql
0003_views_fns.sql
0004_rls.sql
0005_audit.sql
0006_add_item_priority.sql   ← next migration goes here
```

## Iron Rules

1. **One logical change per file.** Adding a column + its index + its RLS policy = ONE migration. Adding two unrelated columns = TWO migrations.
2. **Idempotent where possible.**
   ```sql
   create table if not exists …
   create index if not exists …
   do $$ begin … exception when duplicate_object then null; end $$;  -- for ALTER TYPE
   ```
3. **Never edit a migration that has been pushed to production.** Add a new one. Editing is a stability A–L violation and breaks `supabase db push` for everyone else.
4. **Apply with `bunx supabase db push`. Lint with `bunx supabase db lint`.** Both must be clean before commit.
5. **Regenerate types in the same commit.**
   ```bash
   bunx supabase gen types typescript --linked > src/lib/supabase/types.ts
   ```
   PR has migration + regenerated `types.ts` together. Never one without the other.
6. **Every FK has an index.** No exceptions:
   ```sql
   alter table donation_items add column category_id uuid references categories(id);
   create index if not exists donation_items_category_id_idx on donation_items(category_id);
   ```
7. **Money is integer cents.** Columns suffix `_cents`. Type `integer` or `bigint`, never `numeric` for currency.
8. **Timestamps are `timestamptz default now()`.** Never `timestamp` (without timezone).
9. **Soft delete preferred** for donor-facing tables (`archived_at timestamptz` or `status` enum). Hard delete only for clearly transient data.

## Enum Pattern

Prefer `check` constraint over PG ENUM — extension via single ALTER:

```sql
alter table donation_items
  add column status text not null default 'draft'
  check (status in ('draft', 'published', 'completed', 'archived'));
```

To extend later:

```sql
alter table donation_items drop constraint donation_items_status_check;
alter table donation_items add constraint donation_items_status_check
  check (status in ('draft', 'published', 'completed', 'archived', 'paused'));
```

The Zod schema in `src/lib/validators/` MUST mirror exactly. Drift = silent runtime errors.

## RLS — Always On

Every new table:

```sql
alter table <name> enable row level security;
```

Plus at least one policy. Common patterns:

```sql
-- Anon read of published rows
create policy "anon read published" on donation_items for select to anon
  using (status = 'published');

-- Anon insert (donation intents)
create policy "anon insert intent" on donation_intents for insert to anon
  with check (status = 'pending');

-- Admin all
create policy "admin all" on <name> for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
```

**Donor PII rule:** never grant `select` on `donation_intents.donor_email` / `donor_phone` to `anon`. Public reads go through the `public_donor_list` view (`security_invoker = on`).

## Views + Functions

```sql
-- Always set security model explicitly
create or replace view public_donor_list
with (security_invoker = on)
as select item_id, donor_name, amount_cents, confirmed_at
   from donation_intents
   where status = 'confirmed'
     and is_anonymous = false
     and display_name_publicly = true;
```

`security definer` functions MUST `set search_path = public` and never accept user-controlled identifiers without parameter binding.

## Schema Change Checklist

Before pushing:

- [ ] Existing domain confirmed (extend > create new table)
- [ ] Every new FK has an index in the same migration
- [ ] Enum columns mirrored in `src/lib/validators/`
- [ ] RLS enabled on any new table
- [ ] Public-facing reads via views, not direct table for sensitive columns
- [ ] Tenant scoping (`mission_id`) preserved where applicable
- [ ] `bunx supabase db lint` clean
- [ ] Regenerated `src/lib/supabase/types.ts` in same commit
- [ ] Audit trigger or `logAudit()` covers the new write path

## Don'ts

- ❌ Edit a pushed migration (use a new one).
- ❌ Skip RLS on a table.
- ❌ Grant `select` on PII columns to `anon`.
- ❌ Add a FK without an index.
- ❌ Forget to regenerate types.
- ❌ `numeric` for currency. Always integer cents.
- ❌ `timestamp` without timezone.
- ❌ `set search_path = '';` leaving security definer functions vulnerable.

## See Also

- [`.claude/rules/database.md`](../../.claude/rules/database.md) — full schema/migration/RLS spec
- [`@/lib/supabase/AGENTS.md`](../../src/lib/supabase/AGENTS.md) — client-side type discipline
