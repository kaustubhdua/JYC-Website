-- V63: photo intelligence, editorial metadata and album story readiness.
-- This migration adds editorial tooling without changing any rights state or publishing media.
alter table public.jyc_gallery_items
  add column if not exists title text,
  add column if not exists story text,
  add column if not exists subjects text[] not null default '{}',
  add column if not exists location text,
  add column if not exists captured_at timestamptz,
  add column if not exists captured_at_precision text not null default 'unknown',
  add column if not exists orientation text,
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists aspect_ratio numeric(10,5),
  add column if not exists technical_quality numeric(5,2),
  add column if not exists composition_score smallint,
  add column if not exists people_moment_score smallint,
  add column if not exists jyc_relevance_score smallint,
  add column if not exists uniqueness_score smallint,
  add column if not exists story_value_score smallint,
  add column if not exists editorial_score smallint,
  add column if not exists editorial_status text not null default 'unreviewed',
  add column if not exists featured boolean not null default false,
  add column if not exists hero_eligible boolean not null default false,
  add column if not exists archive_eligible boolean not null default true,
  add column if not exists duplicate_group text,
  add column if not exists source_hash text,
  add column if not exists derivative_status text not null default 'pending',
  add column if not exists derivative_manifest jsonb not null default '{}'::jsonb,
  add column if not exists master_storage_path text;

alter table public.jyc_gallery_items
  drop constraint if exists jyc_gallery_editorial_status_check;
alter table public.jyc_gallery_items
  add constraint jyc_gallery_editorial_status_check
  check (editorial_status in ('unreviewed','shortlisted','featured','archive','rejected'));

alter table public.jyc_gallery_items
  drop constraint if exists jyc_gallery_captured_precision_check;
alter table public.jyc_gallery_items
  add constraint jyc_gallery_captured_precision_check
  check (captured_at_precision in ('unknown','year','month','day','exact'));

alter table public.jyc_gallery_items
  drop constraint if exists jyc_gallery_derivative_status_check;
alter table public.jyc_gallery_items
  add constraint jyc_gallery_derivative_status_check
  check (derivative_status in ('pending','ready','failed','not_required'));

alter table public.jyc_gallery_items
  drop constraint if exists jyc_gallery_editorial_score_check;
alter table public.jyc_gallery_items
  add constraint jyc_gallery_editorial_score_check
  check (editorial_score is null or editorial_score between 0 and 30);

alter table public.jyc_gallery_items
  drop constraint if exists jyc_gallery_focal_check;
alter table public.jyc_gallery_items
  add constraint jyc_gallery_focal_check
  check (
    (focal_x is null and focal_y is null)
    or
    (focal_x between 0 and 100 and focal_y between 0 and 100)
  );

alter table public.jyc_media_albums
  add column if not exists editorial_status text not null default 'draft',
  add column if not exists story_sections jsonb not null default '[]'::jsonb,
  add column if not exists cover_gallery_item_id uuid references public.jyc_gallery_items(id) on delete set null,
  add column if not exists category_tags text[] not null default '{}',
  add column if not exists sort_order integer not null default 0;

alter table public.jyc_media_albums
  drop constraint if exists jyc_media_album_editorial_status_check;
alter table public.jyc_media_albums
  add constraint jyc_media_album_editorial_status_check
  check (editorial_status in ('draft','curating','ready','published','archived'));

create index if not exists jyc_gallery_editorial_idx on public.jyc_gallery_items(editorial_status,editorial_score,featured,hero_eligible);
create index if not exists jyc_gallery_duplicate_idx on public.jyc_gallery_items(duplicate_group);
create index if not exists jyc_gallery_derivative_idx on public.jyc_gallery_items(derivative_status);
create index if not exists jyc_gallery_source_hash_idx on public.jyc_gallery_items(source_hash);
create index if not exists jyc_album_editorial_idx on public.jyc_media_albums(editorial_status,is_published,sort_order);

comment on column public.jyc_gallery_items.editorial_score is
  '0-30 editorial assistance score. It never grants rights or publication permission.';
comment on column public.jyc_gallery_items.editorial_status is
  'Human editorial state. Do not infer publication or rights from this field.';
comment on column public.jyc_gallery_items.master_storage_path is
  'Optional pointer to a preserved master; web derivatives remain separate.';
comment on column public.jyc_media_albums.story_sections is
  'Structured editorial beats for the album story. Empty until an editor supplies them.';

-- Extend the existing publication guard: focal framing, narrative and explicit editorial readiness
-- are required before a CMS album can become public.
create or replace function public.jyc_guard_media_album_publication()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  total_count integer;
  bad_count integer;
begin
  if new.is_published is distinct from true then
    return new;
  end if;

  select count(*) into total_count
  from public.jyc_gallery_items
  where album_id=new.id;

  if total_count=0 then
    raise exception 'Album cannot be published without at least one linked photograph';
  end if;

  if coalesce(nullif(trim(new.narrative),''),'')='' then
    raise exception 'Album cannot be published without an editorial narrative';
  end if;

  if new.editorial_status not in ('ready','published') then
    raise exception 'Album must be editorially ready before publication';
  end if;

  select count(*) into bad_count
  from public.jyc_gallery_items
  where album_id=new.id
    and (
      status <> 'approved'
      or rights_status <> 'cleared'
      or focal_x is null
      or focal_y is null
    );

  if bad_count>0 then
    raise exception 'Album cannot be published while linked photographs are unapproved, rights are uncleared, or focal points are missing';
  end if;

  if exists (
    select 1
    from public.jyc_gallery_items g
    join public.jyc_content_verification v
      on v.entity_type='gallery' and v.entity_id=g.id::text
    where g.album_id=new.id
      and coalesce(v.status,'') not in ('verified','published','approved')
  ) then
    raise exception 'Album cannot be published while linked provenance verification is unresolved';
  end if;

  return new;
end;
$$;

drop trigger if exists jyc_guard_media_album_publication on public.jyc_media_albums;
create trigger jyc_guard_media_album_publication
before insert or update of is_published,narrative,editorial_status
on public.jyc_media_albums
for each row execute function public.jyc_guard_media_album_publication();

revoke all on function public.jyc_guard_media_album_publication() from public;
grant execute on function public.jyc_guard_media_album_publication() to authenticated;
