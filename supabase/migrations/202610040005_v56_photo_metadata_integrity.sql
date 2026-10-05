-- V56 editorial metadata correction
-- Generic supplied archive photography has no verified year in the source material.
-- Keep these records pending and un-dated until an editor attaches evidence.
update public.jyc_gallery_items
set source_year = null
where status = 'pending'
  and source_label = 'JYC supplied hub archive';

comment on column public.jyc_gallery_items.source_year is
  'Verified source year only; null when the supplied evidence does not establish a year.';
