-- V56.17 — hard campus boundary for public event publication.
begin;

-- Official academic-calendar records are added as review-stage 128-campus events.
-- They become public only after the existing authenticated verification workflow approves them.
insert into public.jyc_events
  (slug,title,event_type,short_description,full_description,start_at,end_at,venue,status,featured,pinned)
values
  ('murious-innovate-to-excel-2026','MURIOUS · Innovate to Excel 2026','Technical · Innovation','MURIOUS / Innovate to Excel at JIIT Wish Town Campus, Sector 128.','Official JUIT academic-calendar entry for the 2026 edition. Publication remains verification-gated.','2026-09-24T09:00:00+05:30','2026-09-26T18:00:00+05:30','JIIT Wish Town Campus · Sector 128, Noida','under_review',false,false),
  ('parakram-2026','Parakram 2026','Sports · Fest','Parakram 2026 at JIIT Wish Town Campus, Sector 128.','Official JUIT academic-calendar entry for Parakram 2026, scheduled for 1–4 October 2026. Publication remains verification-gated.','2026-10-01T09:00:00+05:30','2026-10-04T18:00:00+05:30','JIIT Wish Town Campus · Sector 128, Noida','under_review',false,false),
  ('diksha-2026','Diksha 2026','Orientation','Diksha 2026 at JIIT Wish Town Campus, Sector 128.','Official JUIT academic-calendar entry dated 5 August 2026. Publication remains verification-gated.','2026-08-05T09:00:00+05:30','2026-08-05T18:00:00+05:30','JIIT Wish Town Campus · Sector 128, Noida','under_review',false,false)
on conflict (slug) do update set
  venue=excluded.venue,
  short_description=excluded.short_description,
  full_description=excluded.full_description,
  start_at=excluded.start_at,
  end_at=excluded.end_at,
  status='under_review',
  featured=false,
  pinned=false,
  updated_at=now();
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
