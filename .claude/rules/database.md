---
globs: supabase/migrations/**, supabase/seed.sql, supabase/config.toml, src/lib/supabase/types.ts
---

# Database Rules (Tier 2 — Auto-loaded)

> Source of truth: `supabase/migrations/` (numbered SQL files).
> Generated types: `src/lib/supabase/types.ts` (regenerate after every schema change).

## Purpose

Operational guardrails for Supabase schema, migrations, RLS, views, functions, storage policies.

---

## Migration Discipline

- One logical change per file. Filename: `NNNN_short_description.sql` (e.g., `0006_add_item_priority.sql`).
- Make migrations **idempotent** where possible: `create table if not exists`, `create index if not exists`, `do $$ begin … exception when duplicate_object then null; end $$;` for enum-style alterations.
- Never edit a migration that has been pushed to production. Add a new one.
- Apply with `bunx supabase db push`. Lint with `bunx supabase db lint`.
- Regenerate types after every schema change: `bunx supabase gen types typescript --linked > src/lib/supabase/types.ts`.

---

## Core Rules

- **Extend first.** Add a column to an existing table before introducing a new table when the domain already exists.
- **Every foreign key needs an index.** No exceptions. Pattern:

  ```sql
  alter table donation_items add column category_id uuid references categories(id);
  create index if not exists donation_items_category_id_idx on donation_items(category_id);
  ```
- **Enum-style columns** use `check (col in ('a','b','c'))` rather than `create type` ENUM, so values can be extended via a single `alter table … drop constraint … add constraint …` migration.
- **All money is integer cents.** Column suffix `_cents`. Never `numeric` for currency.
- **All timestamps** are `timestamptz default now()`. Never `timestamp` without timezone.
- **Soft deletion** is preferred for donor-facing tables. Use `archived_at timestamptz` or `status` enum. Hard delete only for clearly transient data.
- **Always export Row + Insert types** from generated `types.ts`. Custom helpers in `src/lib/supabase/helpers.ts`.

---

## RLS — Always On

Every table gets `alter table <name> enable row level security;` in the same migration that creates it.

Policy patterns:

| Audience | Pattern |
|---|---|
| Public (anon) read of published items | `create policy "anon read published" on donation_items for select to anon using (status = 'published');` |
| Public read of public accountability | `create policy "anon read public" on accountability_entries for select to anon using (is_public = true);` |
| Public anonymous insert (donation intents) | column-level grants + `create policy "anon insert intent" on donation_intents for insert to anon with check (status = 'pending');` |
| Admin all | `create policy "admin all" on <table> for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));` |

**Donor PII rule:** never grant `select` on `donation_intents.donor_email` / `donor_phone` to `anon` — even via column-level grants. Public reads go through the `public_donor_list` view, which is `security_invoker = on` and only exposes `donor_name`, `amount_cents`, `confirmed_at`.

---

## Views and Functions

```sql
-- Always set the security model explicitly.
create or replace view public_donor_list
with (security_invoker = on)
as select item_id, donor_name, amount_cents, confirmed_at
   from donation_intents
   where status = 'confirmed'
     and is_anonymous = false
     and display_name_publicly = true;
```

Helper functions:

- `public.is_admin(uid uuid) returns boolean language sql security definer stable` — single source of truth for admin checks. Grant execute to `authenticated`.
- `public.confirm_donation(p_intent_id uuid, p_event_id uuid, p_amount integer) returns void language plpgsql security definer` — locks the intent row (`for update`), transitions to `confirmed`, computes excess vs `target_amount_cents`, inserts into `global_reserve_entries` if positive. Use this function from webhook + manual-confirm only.

`security definer` functions must `set search_path = public` and never accept user-controlled identifiers without parameter binding.

---

## Storage

Buckets defined in `supabase/config.toml` and policies in a migration:

| Bucket | Public read | Write |
|---|---|---|
| `item-images` | yes | admin only |
| `accountability-proofs` | yes | admin only |
| `donor-uploads` | no | admin only |

Use signed URLs for private buckets. Set `image/png|jpeg|webp` allowlist on policies.

---

## Schema Change Checklist

Before pushing a migration:

- [ ] Existing domain confirmed (extend > create)
- [ ] Every new FK has an index in the same migration
- [ ] Enum columns mirrored in Zod validators (`src/lib/validators/`)
- [ ] RLS enabled on any new table
- [ ] Public-facing policies use views, not direct table access for sensitive columns
- [ ] Tenant scoping (mission_id) preserved where applicable
- [ ] `bunx supabase db lint` clean
- [ ] Regenerated types: `bunx supabase gen types typescript --linked > src/lib/supabase/types.ts`
- [ ] Audit trigger or `logAudit()` call covers the new write path

---

## Domain Map

| Domain | Tables |
|---|---|
| Mission catalog | `missions`, `categories`, `donation_items` |
| Donation flow | `donation_intents`, `payment_events`, `global_reserve_entries` |
| Accountability | `accountability_entries` |
| Audit | `audit_logs` |
| Settings | `settings`, `admin_users` |

`donation_items.collected_amount` does **not** exist. The total comes from the `confirmed_amount_by_item` view. UI binds to that view.

---

## When To Load More

| Need | Load |
|---|---|
| API/server logic that reads or writes the schema | `.claude/rules/backend.md` |
| Frontend bindings + types in components | `.claude/rules/frontend.md` |
| Webhook idempotency + integration callers | `.claude/rules/integrations.md` |
| Universal stability checklist | `.claude/rules/stability.md` |
