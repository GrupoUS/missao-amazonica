-- ─────────────────────────────────────────────────────────────────────────────
-- 0003_views_fns · Aggregation views + confirm_donation function.
-- ─────────────────────────────────────────────────────────────────────────────

-- Total confirmed amount per item (derived; never store on donation_items).
create or replace view public.confirmed_amount_by_item
with (security_invoker = on) as
select
  di.item_id,
  coalesce(sum(di.amount_cents), 0)::bigint as confirmed_amount_cents,
  count(di.id)::bigint as confirmed_count
from public.donation_intents di
where di.status = 'confirmed'
group by di.item_id;

-- Public-safe view of donors who consented to display.
create or replace view public.public_donor_list
with (security_invoker = on) as
select
  di.id,
  di.item_id,
  di.donor_name,
  di.amount_cents,
  di.confirmed_at
from public.donation_intents di
where di.status = 'confirmed'
  and di.is_anonymous = false
  and di.display_name_publicly = true
  and di.donor_name is not null;

-- Global reserve total in cents.
create or replace view public.global_reserve_total
with (security_invoker = on) as
select coalesce(sum(amount_cents), 0)::bigint as reserve_cents
from public.global_reserve_entries;

-- Item progress (target vs raised, with derived percentage).
create or replace view public.item_progress
with (security_invoker = on) as
select
  i.id as item_id,
  i.target_amount_cents,
  coalesce(c.confirmed_amount_cents, 0)::bigint as confirmed_amount_cents,
  case
    when i.target_amount_cents > 0
      then least(999, round((coalesce(c.confirmed_amount_cents, 0)::numeric / i.target_amount_cents) * 100))
    else 0
  end::int as progress_pct
from public.donation_items i
left join public.confirmed_amount_by_item c on c.item_id = i.id;

-- Landing page aggregate stats.
create or replace view public.landing_stats
with (security_invoker = on) as
select
  (select coalesce(sum(amount_cents), 0)::bigint
     from public.donation_intents where status = 'confirmed') as total_raised_cents,
  (select count(*)::bigint from public.donation_items
     where status = 'published') as projects_active,
  (select count(*)::bigint from public.donation_items
     where status = 'completed') as items_completed,
  (select reserve_cents from public.global_reserve_total) as reserve_cents,
  (select count(distinct mission_id)::bigint from public.donation_items
     where status in ('published','completed')) as missions_active;

-- Recent confirmed donations (admin-side feed shim — RLS still applies upstream).
create or replace view public.recent_confirmed_donations
with (security_invoker = on) as
select
  di.id,
  di.item_id,
  di.amount_cents,
  di.donor_name,
  di.is_anonymous,
  di.display_name_publicly,
  di.confirmed_at,
  i.title as item_title,
  i.slug as item_slug
from public.donation_intents di
join public.donation_items i on i.id = di.item_id
where di.status = 'confirmed'
order by di.confirmed_at desc
limit 50;

-- ─── confirm_donation: locks intent, transitions, splits excess to reserve ───
create or replace function public.confirm_donation(
  p_intent_id uuid,
  p_event_id  uuid,
  p_amount    integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item_id          uuid;
  v_target           integer;
  v_existing_total   bigint;
  v_excess           integer;
begin
  -- Lock the intent row to serialize concurrent confirmations.
  select item_id into v_item_id
  from public.donation_intents
  where id = p_intent_id and status = 'pending'
  for update;

  if v_item_id is null then
    -- Already confirmed or doesn't exist; idempotent no-op.
    return;
  end if;

  -- Mark intent confirmed.
  update public.donation_intents
  set status = 'confirmed',
      confirmed_at = now(),
      updated_at = now()
  where id = p_intent_id;

  -- Compute excess vs target.
  select target_amount_cents into v_target
  from public.donation_items
  where id = v_item_id;

  if v_target is not null and v_target > 0 then
    select coalesce(sum(amount_cents), 0)::bigint
      into v_existing_total
      from public.donation_intents
     where item_id = v_item_id
       and status = 'confirmed'
       and id <> p_intent_id;

    if (v_existing_total + p_amount) > v_target then
      v_excess := least(p_amount, (v_existing_total + p_amount) - v_target);
      if v_excess > 0 then
        insert into public.global_reserve_entries
          (donation_intent_id, source_item_id, amount_cents, reason)
        values
          (p_intent_id, v_item_id, v_excess, 'donation_excess');
      end if;
    end if;
  end if;

  -- Audit
  insert into public.audit_logs (action, entity_type, entity_id, after_data, metadata)
  values (
    'donation_confirmed',
    'donation_intent',
    p_intent_id,
    jsonb_build_object('amount_cents', p_amount, 'item_id', v_item_id),
    jsonb_build_object('event_id', p_event_id)
  );
end;
$$;

revoke all on function public.confirm_donation(uuid, uuid, integer) from public;
grant execute on function public.confirm_donation(uuid, uuid, integer) to service_role;
