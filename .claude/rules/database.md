# Database Rules (Tier 2 — Generic Template)

> Replace placeholders with project specifics, or override entirely via `${overlay}/rules/database.md`.

## Purpose

Operational guardrails for database schema, migrations, RLS, views, functions, storage policies.

---

## Migration discipline

- One logical change per file. Filename: `NNNN_short_description.sql` (or framework equivalent).
- Idempotent where possible: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, exception-swallowing for enum-style alters.
- Never edit a migration that has been pushed to production. Add a new one.
- Apply via project's tool (`supabase db push`, `prisma migrate deploy`, `drizzle-kit push`, etc.).
- Regenerate types after every schema change. Commit generated types.

---

## Core rules

- **Extend first.** Add a column to an existing table before introducing a new table when the domain already exists.
- **Every foreign key needs an index.** No exceptions. Add the index in the **same migration** that adds the FK.
- **Enum-style columns** prefer `CHECK (col IN (…))` over `CREATE TYPE … AS ENUM` — easier to extend later.
- **Money is integer cents** (or smallest unit). Column suffix `_cents`. Never floating-point currency.
- **Timestamps** are `timestamptz default now()` (Postgres) / `DATETIME WITH TIME ZONE` (MySQL/SQL Server) / equivalent. Never naive timestamps.
- **Soft deletion** preferred for user-facing tables (`archived_at` / `deleted_at` / status enum). Hard delete only for transient data.
- **Always export Row + Insert types** from generated types. Custom helpers in a single helpers module.

---

## RLS / row-level security (when supported)

Every table gets RLS enabled in the migration that creates it.

Policy patterns:

| Audience | Pattern |
|---|---|
| Public read of published items | `for select to anon using (status = 'published')` |
| Public read of public content | `for select to anon using (is_public = true)` |
| Public insert (with constraints) | column-level grants + `for insert to anon with check (…)` |
| Owner read/write | `using (owner_id = auth.uid()) with check (owner_id = auth.uid())` |
| Admin all | `for all to authenticated using (public.is_admin(auth.uid()))` |

**PII rule:** never grant `select` on PII columns (email, phone, etc.) to public roles. Public reads go through curated views with `security_invoker = on` that drop the PII columns.

---

## Views and functions

Always set the security model explicitly:

```sql
CREATE OR REPLACE VIEW public_view
WITH (security_invoker = on)
AS SELECT … FROM … WHERE …;
```

Helper functions:
- `is_admin(uid)` / equivalent — single source of truth for admin checks. `language sql security definer stable`. Grant execute to authenticated.
- Domain-specific procedures (`confirm_<action>`) — `language plpgsql security definer`. Lock rows with `FOR UPDATE` when transitioning state.

`security definer` functions must `set search_path = public` (or equivalent) and never accept user-controlled identifiers without parameter binding.

---

## Storage (object storage)

Buckets defined in project config + policies in a migration:

| Bucket type | Public read | Write |
|---|---|---|
| Public assets (images, logos) | yes | admin only |
| Public proofs / receipts | yes | admin only |
| Private user uploads | no | admin only |

Use signed URLs for private buckets. Set MIME-type allowlist on policies.

---

## Schema change checklist

Before pushing a migration:

- [ ] Existing domain confirmed (extend > create)
- [ ] Every new FK has an index in the **same migration**
- [ ] Enum columns mirrored in app-side validators
- [ ] RLS enabled on any new table
- [ ] Public-facing policies use views, not direct table access for sensitive columns
- [ ] Tenant scoping (multi-tenant projects) preserved
- [ ] DB linter clean (`supabase db lint`, `pgsanity`, equivalent)
- [ ] Regenerated types
- [ ] Audit trigger / `logAudit()` covers the new write path

---

## When to load more

| Need | Load |
|---|---|
| API/server logic that reads/writes the schema | `backend.md` |
| Frontend bindings + types | `frontend.md` |
| Webhook idempotency + integration callers | `integrations.md` |
| Universal stability checklist | `stability.md` |

---

## Project-specific authority

If `${overlay}/rules/database.md` exists, prefer it over this template — it captures project DB engine (Postgres / MySQL / SQLite), ORM (Drizzle / Prisma / SQLAlchemy / equivalent), and domain-specific invariants.
