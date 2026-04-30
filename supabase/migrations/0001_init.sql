-- ─────────────────────────────────────────────────────────────────────────────
-- 0001_init · Core schema: missions, categories, items, intents, payments,
--               accountability, audit, settings, global reserve.
-- ─────────────────────────────────────────────────────────────────────────────

-- Required extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ─── Missions ─────────────────────────────────────────────────────────────────
create table if not exists public.missions (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  description     text,
  region          text,
  mission_month   text default 'April',
  mission_duration_days integer default 7,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists missions_is_active_idx on public.missions(is_active);

-- ─── Categories ──────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists categories_sort_order_idx on public.categories(sort_order);

-- ─── Donation Items ──────────────────────────────────────────────────────────
create table if not exists public.donation_items (
  id                  uuid primary key default gen_random_uuid(),
  mission_id          uuid not null references public.missions(id) on delete cascade,
  category_id         uuid references public.categories(id) on delete set null,
  title               text not null,
  slug                text not null unique,
  description         text,
  image_url           text,
  image_type          text not null default 'illustrative'
                      check (image_type in ('real', 'illustrative')),
  urgency             text not null default 'medium'
                      check (urgency in ('low', 'medium', 'high', 'urgent')),
  target_amount_cents integer not null default 0
                      check (target_amount_cents >= 0),
  status              text not null default 'draft'
                      check (status in ('draft', 'published', 'archived', 'completed')),
  approved_by         uuid references auth.users(id) on delete set null,
  approved_at         timestamptz,
  pix_txid_prefix     text not null default 'MIS',
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists donation_items_mission_id_idx     on public.donation_items(mission_id);
create index if not exists donation_items_category_id_idx    on public.donation_items(category_id);
create index if not exists donation_items_approved_by_idx    on public.donation_items(approved_by);
create index if not exists donation_items_status_idx         on public.donation_items(status);
create index if not exists donation_items_urgency_idx        on public.donation_items(urgency);

-- ─── Donation Intents ────────────────────────────────────────────────────────
create table if not exists public.donation_intents (
  id                       uuid primary key default gen_random_uuid(),
  item_id                  uuid not null references public.donation_items(id) on delete restrict,
  amount_cents             integer not null check (amount_cents >= 100),
  donor_name               text,
  donor_email              text,
  donor_phone              text,
  is_anonymous             boolean not null default false,
  display_name_publicly    boolean not null default false,
  status                   text not null default 'pending'
                           check (status in ('pending', 'confirmed', 'expired', 'cancelled', 'failed')),
  pix_txid                 text not null unique,
  pix_payload              text,
  pix_qr_data_url          text,
  expires_at               timestamptz,
  confirmed_at             timestamptz,
  ip_hash                  text,
  user_agent               text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists donation_intents_item_id_idx    on public.donation_intents(item_id);
create index if not exists donation_intents_status_idx     on public.donation_intents(status);
create index if not exists donation_intents_created_at_idx on public.donation_intents(created_at desc);
create index if not exists donation_intents_donor_email_idx on public.donation_intents(donor_email);

-- ─── Payment Events (idempotent webhook ingestion) ───────────────────────────
create table if not exists public.payment_events (
  id                  uuid primary key default gen_random_uuid(),
  donation_intent_id  uuid references public.donation_intents(id) on delete set null,
  provider            text not null default 'bank_pix'
                      check (provider in ('bank_pix', 'manual', 'mercado_pago', 'asaas')),
  event_type          text not null,
  bank_end_to_end_id  text not null,
  txid                text,
  amount_cents        integer,
  raw_payload         jsonb,
  received_at         timestamptz not null default now(),
  unique (provider, bank_end_to_end_id)
);

create index if not exists payment_events_intent_id_idx on public.payment_events(donation_intent_id);
create index if not exists payment_events_txid_idx      on public.payment_events(txid);
create index if not exists payment_events_received_at_idx on public.payment_events(received_at desc);

-- ─── Global Reserve Entries ──────────────────────────────────────────────────
create table if not exists public.global_reserve_entries (
  id                  uuid primary key default gen_random_uuid(),
  donation_intent_id  uuid references public.donation_intents(id) on delete set null,
  source_item_id      uuid references public.donation_items(id) on delete set null,
  amount_cents        integer not null check (amount_cents > 0),
  reason              text not null default 'donation_excess',
  notes               text,
  created_at          timestamptz not null default now()
);

create index if not exists reserve_intent_id_idx on public.global_reserve_entries(donation_intent_id);
create index if not exists reserve_source_id_idx on public.global_reserve_entries(source_item_id);
create index if not exists reserve_created_at_idx on public.global_reserve_entries(created_at desc);

-- ─── Accountability Entries ──────────────────────────────────────────────────
create table if not exists public.accountability_entries (
  id                  uuid primary key default gen_random_uuid(),
  item_id             uuid references public.donation_items(id) on delete set null,
  reserve_entry_id    uuid references public.global_reserve_entries(id) on delete set null,
  title               text not null,
  description         text,
  amount_cents        integer check (amount_cents >= 0),
  proof_url           text,
  media_url           text,
  status              text not null default 'planned'
                      check (status in ('planned', 'purchased', 'delivered', 'completed')),
  is_public           boolean not null default true,
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists accountability_item_id_idx        on public.accountability_entries(item_id);
create index if not exists accountability_reserve_id_idx     on public.accountability_entries(reserve_entry_id);
create index if not exists accountability_created_by_idx     on public.accountability_entries(created_by);
create index if not exists accountability_status_idx         on public.accountability_entries(status);
create index if not exists accountability_is_public_idx      on public.accountability_entries(is_public);
create index if not exists accountability_created_at_idx     on public.accountability_entries(created_at desc);

-- ─── Audit Logs ──────────────────────────────────────────────────────────────
create table if not exists public.audit_logs (
  id            uuid primary key default gen_random_uuid(),
  actor_id      uuid references auth.users(id) on delete set null,
  action        text not null,
  entity_type   text not null,
  entity_id     uuid,
  before_data   jsonb,
  after_data    jsonb,
  metadata      jsonb,
  ip_hash       text,
  created_at    timestamptz not null default now()
);

create index if not exists audit_logs_actor_id_idx     on public.audit_logs(actor_id);
create index if not exists audit_logs_entity_idx       on public.audit_logs(entity_type, entity_id);
create index if not exists audit_logs_created_at_idx   on public.audit_logs(created_at desc);

-- ─── Settings (key/value JSON) ───────────────────────────────────────────────
create table if not exists public.settings (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       jsonb,
  is_public   boolean not null default false,
  updated_at  timestamptz not null default now()
);

create index if not exists settings_is_public_idx on public.settings(is_public);

-- ─── updated_at triggers ─────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'missions', 'donation_items', 'donation_intents',
      'accountability_entries', 'settings'
    ])
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I;', t, t);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I
       for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end;
$$;
