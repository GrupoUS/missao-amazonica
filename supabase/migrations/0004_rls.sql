-- ─────────────────────────────────────────────────────────────────────────────
-- 0004_rls · Row Level Security policies for every table.
-- Default: deny. Public reads are explicit and minimal.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.missions               enable row level security;
alter table public.categories             enable row level security;
alter table public.donation_items         enable row level security;
alter table public.donation_intents       enable row level security;
alter table public.payment_events         enable row level security;
alter table public.global_reserve_entries enable row level security;
alter table public.accountability_entries enable row level security;
alter table public.audit_logs             enable row level security;
alter table public.settings               enable row level security;
alter table public.admin_users            enable row level security;

-- ─── missions ───────────────────────────────────────────────────────────────
drop policy if exists "missions: anon read active" on public.missions;
create policy "missions: anon read active"
  on public.missions for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "missions: admin all" on public.missions;
create policy "missions: admin all"
  on public.missions for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ─── categories ─────────────────────────────────────────────────────────────
drop policy if exists "categories: read all" on public.categories;
create policy "categories: read all"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "categories: admin all" on public.categories;
create policy "categories: admin all"
  on public.categories for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ─── donation_items ─────────────────────────────────────────────────────────
drop policy if exists "items: anon read published" on public.donation_items;
create policy "items: anon read published"
  on public.donation_items for select
  to anon, authenticated
  using (status in ('published', 'completed'));

drop policy if exists "items: admin all" on public.donation_items;
create policy "items: admin all"
  on public.donation_items for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ─── donation_intents ───────────────────────────────────────────────────────
-- Anon may INSERT a pending intent (the donation form). They cannot SELECT.
drop policy if exists "intents: anon insert pending" on public.donation_intents;
create policy "intents: anon insert pending"
  on public.donation_intents for insert
  to anon, authenticated
  with check (status = 'pending');

drop policy if exists "intents: admin select" on public.donation_intents;
create policy "intents: admin select"
  on public.donation_intents for select
  to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "intents: admin update" on public.donation_intents;
create policy "intents: admin update"
  on public.donation_intents for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ─── payment_events ─────────────────────────────────────────────────────────
drop policy if exists "events: admin select" on public.payment_events;
create policy "events: admin select"
  on public.payment_events for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- inserts happen via service-role only (webhook + manual confirm)

-- ─── global_reserve_entries ─────────────────────────────────────────────────
drop policy if exists "reserve: read all" on public.global_reserve_entries;
create policy "reserve: read all"
  on public.global_reserve_entries for select
  to anon, authenticated
  using (true);

-- inserts via service-role / confirm_donation()

-- ─── accountability_entries ─────────────────────────────────────────────────
drop policy if exists "accountability: anon read public" on public.accountability_entries;
create policy "accountability: anon read public"
  on public.accountability_entries for select
  to anon, authenticated
  using (is_public = true);

drop policy if exists "accountability: admin all" on public.accountability_entries;
create policy "accountability: admin all"
  on public.accountability_entries for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ─── audit_logs ─────────────────────────────────────────────────────────────
drop policy if exists "audit: admin select" on public.audit_logs;
create policy "audit: admin select"
  on public.audit_logs for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- ─── settings ───────────────────────────────────────────────────────────────
drop policy if exists "settings: anon read public" on public.settings;
create policy "settings: anon read public"
  on public.settings for select
  to anon, authenticated
  using (is_public = true);

drop policy if exists "settings: admin all" on public.settings;
create policy "settings: admin all"
  on public.settings for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ─── admin_users ────────────────────────────────────────────────────────────
drop policy if exists "admin_users: self read" on public.admin_users;
create policy "admin_users: self read"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "admin_users: admin manage" on public.admin_users;
create policy "admin_users: admin manage"
  on public.admin_users for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
