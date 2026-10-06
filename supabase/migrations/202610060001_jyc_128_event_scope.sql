-- V56.17 — hard campus boundary for public event publication.
begin;
update public.jyc_events
set venue='JIIT Wish Town Campus · Sector 128, Noida', updated_at=now()
where slug in ('agentic-ai-2026','converge-2026');

update public.jyc_events
set status='under_review', featured=false, pinned=false, updated_at=now()
where status in ('published','ongoing','past')
  and (lower(coalesce(venue,'')) like '%sector 62%'
    or lower(coalesce(venue,'')) like '%sector-62%'
    or lower(coalesce(venue,'')) not like '%128%');

create or replace function public.jyc_guard_event_campus_scope()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status in ('published','ongoing','past') then
    if lower(coalesce(new.venue,'')) not like '%128%'
       or lower(coalesce(new.venue,'')) like '%sector 62%'
       or lower(coalesce(new.venue,'')) like '%sector-62%' then
      raise exception 'JYC public events are restricted to JIIT Sector 128; verify campus before publication';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_jyc_event_campus_scope on public.jyc_events;
create trigger trg_jyc_event_campus_scope before insert or update of status,venue
on public.jyc_events for each row execute function public.jyc_guard_event_campus_scope();
revoke execute on function public.jyc_guard_event_campus_scope() from public, anon, authenticated;
grant execute on function public.jyc_guard_event_campus_scope() to service_role;
commit;
