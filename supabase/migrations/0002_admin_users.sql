-- ─────────────────────────────────────────────────────────────────────────────
-- 0002_admin_users · Admin user table + is_admin() helper.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists admin_users_is_active_idx on public.admin_users(is_active);

-- Helper: is_admin(uid) — single source of truth for admin checks.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.admin_users
    where user_id = uid and is_active = true
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated, anon;
