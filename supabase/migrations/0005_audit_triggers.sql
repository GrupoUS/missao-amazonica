-- ─────────────────────────────────────────────────────────────────────────────
-- 0005_audit_triggers · Backstop audit_logs entries from DB (defense in depth).
-- App layer also writes audit via src/lib/audit/log.ts.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.audit_admin_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_action text;
  v_before jsonb;
  v_after  jsonb;
begin
  if TG_OP = 'INSERT' then
    v_action := lower(TG_TABLE_NAME) || '.created';
    v_before := null;
    v_after  := to_jsonb(NEW);
  elsif TG_OP = 'UPDATE' then
    v_action := lower(TG_TABLE_NAME) || '.updated';
    v_before := to_jsonb(OLD);
    v_after  := to_jsonb(NEW);
  elsif TG_OP = 'DELETE' then
    v_action := lower(TG_TABLE_NAME) || '.deleted';
    v_before := to_jsonb(OLD);
    v_after  := null;
  end if;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before_data, after_data)
  values (
    v_actor,
    v_action,
    TG_TABLE_NAME,
    coalesce(NEW.id, OLD.id),
    v_before,
    v_after
  );

  return coalesce(NEW, OLD);
end;
$$;

revoke all on function public.audit_admin_change() from public;

-- Wire triggers to the tables admins mutate.
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'donation_items', 'accountability_entries', 'settings', 'admin_users'
    ])
  loop
    execute format('drop trigger if exists audit_%I on public.%I;', t, t);
    execute format(
      'create trigger audit_%I after insert or update or delete on public.%I
       for each row execute function public.audit_admin_change();',
      t, t
    );
  end loop;
end;
$$;
