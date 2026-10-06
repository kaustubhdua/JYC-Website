-- V56.17 source records for official JYC 128 event candidates.
begin;
insert into public.jyc_content_verification
  (entity_type,entity_id,campus_id,status,source_url,notes,last_updated_at)
values
  ('event','murious-innovate-to-excel-2026','sector-128','review',
   'https://www.juit.ac.in/attachments/ACADEMICCALENDAR202627.pdf',
   'Official JUIT 2026–27 academic calendar. Verify event-specific publication details before publishing.',
   now()),
  ('event','parakram-2026','sector-128','review',
   'https://www.juit.ac.in/attachments/ACADEMICCALENDAR202627.pdf',
   'Official JUIT 2026–27 academic calendar. Verify event-specific publication details before publishing.',
   now()),
  ('event','diksha-2026','sector-128','review',
   'https://www.juit.ac.in/attachments/ACADEMICCALENDAR202627.pdf',
   'Official JUIT 2026–27 academic calendar. Verify event-specific publication details before publishing.',
   now())
on conflict (entity_type,entity_id) do update set
  campus_id=excluded.campus_id,
  status='review',
  source_url=excluded.source_url,
  notes=excluded.notes,
  last_updated_at=now();
commit;
