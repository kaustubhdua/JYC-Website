-- JYC V55 media provenance and editorial crop metadata.
alter table public.jyc_gallery_items
  add column if not exists media_kind text not null default 'photo',
  add column if not exists alt_text text,
  add column if not exists source_type text,
  add column if not exists source_label text,
  add column if not exists source_page integer,
  add column if not exists source_url text,
  add column if not exists source_year integer,
  add column if not exists credit text,
  add column if not exists focal_x numeric(5,2),
  add column if not exists focal_y numeric(5,2);

alter table public.jyc_gallery_items
  drop constraint if exists jyc_gallery_items_media_kind_check;

alter table public.jyc_gallery_items
  add constraint jyc_gallery_items_media_kind_check
  check (media_kind in ('photo','artwork','visual'));

create index if not exists idx_jyc_gallery_items_club_status
  on public.jyc_gallery_items (club_id,status);
create index if not exists idx_jyc_gallery_items_event_status
  on public.jyc_gallery_items (event_id,status);
create index if not exists idx_jyc_gallery_items_kind_status
  on public.jyc_gallery_items (media_kind,status);
create index if not exists idx_jyc_gallery_items_source_year
  on public.jyc_gallery_items (source_year,status);

comment on column public.jyc_gallery_items.media_kind is 'Editorial media classification: photo, artwork, or visual.';
comment on column public.jyc_gallery_items.alt_text is 'Accessible image description approved for publication.';
comment on column public.jyc_gallery_items.source_type is 'Media provenance type.';
comment on column public.jyc_gallery_items.source_label is 'Human-readable provenance label.';
comment on column public.jyc_gallery_items.source_page is 'Page number in a supplied source presentation when known.';
comment on column public.jyc_gallery_items.source_url is 'Original source URL when available.';
comment on column public.jyc_gallery_items.source_year is 'Year associated with the source media.';
comment on column public.jyc_gallery_items.focal_x is 'Optional responsive crop focal point, percentage.';
comment on column public.jyc_gallery_items.focal_y is 'Optional responsive crop focal point, percentage.';
