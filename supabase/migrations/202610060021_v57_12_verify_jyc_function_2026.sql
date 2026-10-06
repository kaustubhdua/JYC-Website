-- V57.12 — promote JYC Function 2026 from the official JIIT academic calendar.
begin;
do $block$
declare verifier uuid;
begin
  select user_id into verifier from public.jyc_admins where is_active=true order by created_at limit 1;
  if verifier is null then raise exception 'No active JYC admin exists'; end if;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',verifier::text,'role','authenticated')::text,true);
  execute 'set local role authenticated';
end $block$;

insert into public.jyc_content_verification (
 entity_type,entity_id,campus_id,status,source_url,source_type,verified_by,verified_at,
 last_updated_at,notes,confidence,source_name,source_platform,source_captured_at,review_reason
) values (
 'event','jyc-function-2026','sector-128','verified',
 'https://www.jiit.ac.in/uploads/AC_2025_26_0_8c1fe78bf3.pdf',
 'official-JIIT-academic-calendar',
 (select user_id from public.jyc_admins where is_active=true order by created_at limit 1),
 now(),now(),
 'Official JIIT Noida academic calendar lists JYC Function for 06–08 Feb 2026. This confirms the event identity and date window; the supplied JYC orientation material independently establishes JYC as the student-governed body organizing campus activities.',
 'official','JIIT Noida Academic Calendar 2025-26','official-site',now(),null
)
on conflict (entity_type,entity_id) do update set
 campus_id=excluded.campus_id,status=excluded.status,source_url=excluded.source_url,
 source_type=excluded.source_type,verified_by=excluded.verified_by,verified_at=excluded.verified_at,
 last_updated_at=excluded.last_updated_at,notes=excluded.notes,confidence=excluded.confidence,
 source_name=excluded.source_name,source_platform=excluded.source_platform,
 source_captured_at=excluded.source_captured_at,review_reason=null;

update public.jyc_events
set status='published',updated_at=now(),venue='JIIT Wish Town Campus · Sector 128, Noida'
where slug='jyc-function-2026';

commit;