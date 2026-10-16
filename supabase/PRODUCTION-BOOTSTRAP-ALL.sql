-- JYC production bootstrap: run this entire file once in Supabase SQL Editor.
-- It is ordered to support a fresh project and is designed to be re-runnable.


-- ================================================================
-- SOURCE: supabase/00-bootstrap-admins.sql
-- ================================================================
-- JYC bootstrap: create the administrator table before any policy/function
-- references it. Safe to run on a fresh or existing project.
create extension if not exists pgcrypto;

create table if not exists public.jyc_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'jyc_admin',
  display_name text,
  is_active boolean not null default true,
  club_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jyc_admins enable row level security;

-- Administrators are never publicly listable. The frontend only needs the
-- current user's own row; privileged management uses a server-side function.
drop policy if exists "Users can read own JYC admin record" on public.jyc_admins;
create policy "Users can read own JYC admin record"
on public.jyc_admins for select to authenticated
using (user_id = auth.uid());

create index if not exists jyc_admins_role_idx on public.jyc_admins(role, is_active);
create index if not exists jyc_admins_club_idx on public.jyc_admins(club_id);

select 'JYC admin bootstrap complete.' as result;

-- ================================================================
-- SOURCE: supabase/00-core-migration.sql
-- ================================================================
-- JYC website content + access migration
-- Run this in Supabase SQL Editor once.
-- Uses the safe browser publishable key; never put a service/secret key in the frontend.

create extension if not exists pgcrypto;

-- Keep this migration runnable on a fresh Supabase project. Older versions
-- assumed jyc_admins had already been created outside the migration set.
create table if not exists public.jyc_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'jyc_admin',
  display_name text,
  is_active boolean not null default true,
  club_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.jyc_admins enable row level security;
drop policy if exists "Users can read own JYC admin record" on public.jyc_admins;
create policy "Users can read own JYC admin record" on public.jyc_admins for select to authenticated using (user_id=auth.uid());
create index if not exists jyc_admins_role_idx on public.jyc_admins(role,is_active);
create index if not exists jyc_admins_club_idx on public.jyc_admins(club_id);

create table if not exists public.jyc_site_data (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.jyc_site_data enable row level security;
drop policy if exists "Public can read published site data" on public.jyc_site_data;
drop policy if exists "Public can read site data" on public.jyc_site_data;
drop policy if exists "Admins can read site data" on public.jyc_site_data;
create policy "Admins can read site data"
on public.jyc_site_data for select to authenticated
using (
  exists (
    select 1 from public.jyc_admins a
    where a.user_id = auth.uid()
      and a.is_active = true
  )
);

drop policy if exists "JYC admins can manage site data" on public.jyc_site_data;
create policy "JYC admins can manage site data"
on public.jyc_site_data for all to authenticated
using (exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true))
with check (exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));

insert into public.jyc_site_data(id,data) values('main',jsonb_build_object(
  'clubs','[]'::jsonb,
  'events','[]'::jsonb,
  'gallery','[]'::jsonb,
  'team','[]'::jsonb,
  'categories',jsonb_build_object('Technical','[]'::jsonb,'Non-Technical','[]'::jsonb),
  'announcement',jsonb_build_object('on',false,'text','','link',''),
  'mode','events','fest','null'::jsonb,
  'homepage',jsonb_build_object('heroTitle','JIIT YOUTH CLUB','heroSubtitle','READY TO SOAR','heroLead','A student-led ecosystem connecting campus communities, creativity, technology and experiences at JIIT Sector 128.','showClubs',true,'showEvents',true,'showGallery',true,'aboutTitle','The JYC story belongs here.','aboutText',''),
  'creator',jsonb_build_object('name','Kaustubh Dua','role','Website Creator','linkedin','https://www.linkedin.com/in/kaustubh-dua-2b5a76416','instagram','https://www.instagram.com/kaustubh.this.side/','github','https://github.com/kaustubhdua','email','kaustubhdua1991@gmail.com')
)) on conflict(id) do nothing;

create table if not exists public.jyc_activity_logs(
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.jyc_activity_logs enable row level security;
drop policy if exists "Admins can read activity logs" on public.jyc_activity_logs;
create policy "Admins can read activity logs" on public.jyc_activity_logs for select to authenticated
using(exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));
drop policy if exists "Admins can create activity logs" on public.jyc_activity_logs;
create policy "Admins can create activity logs" on public.jyc_activity_logs for insert to authenticated
with check(actor_id=auth.uid() and exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));

-- Optional club-level assignment for future club_admin accounts.
alter table public.jyc_admins add column if not exists club_id uuid;

insert into storage.buckets(id,name,public) values('jyc-media','jyc-media',true) on conflict(id) do nothing;
drop policy if exists "Public can view JYC media" on storage.objects;
create policy "Public can view JYC media" on storage.objects for select to anon,authenticated using(bucket_id='jyc-media');
drop policy if exists "JYC admins can upload JYC media" on storage.objects;
create policy "JYC admins can upload JYC media" on storage.objects for insert to authenticated
with check(bucket_id='jyc-media' and exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));
drop policy if exists "JYC admins can update JYC media" on storage.objects;
create policy "JYC admins can update JYC media" on storage.objects for update to authenticated
using(bucket_id='jyc-media' and exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true))
with check(bucket_id='jyc-media' and exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));
drop policy if exists "JYC admins can delete JYC media" on storage.objects;
create policy "JYC admins can delete JYC media" on storage.objects for delete to authenticated
using(bucket_id='jyc-media' and exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));

select 'JYC migration complete.' as result;

-- =========================================================
-- Secure content writes for the JSON content store
-- Club Admins can only mutate their assigned club, its events,
-- and its gallery items. JYC/Super Admins can mutate everything.
-- =========================================================
alter table public.jyc_admins add column if not exists club_id text;

create or replace function public.jyc_save_site_data(
  p_data jsonb,
  p_action text default 'Updated site',
  p_entity_type text default 'site',
  p_entity_id text default 'main'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  a_role text;
  a_club text;
  old_data jsonb;
  next_data jsonb;
  own_clubs jsonb;
  own_events jsonb;
  own_gallery jsonb;
begin
  select role, club_id::text into a_role, a_club
  from public.jyc_admins
  where user_id = auth.uid() and is_active = true
  limit 1;

  if a_role is null then
    raise exception 'Not authorized';
  end if;

  select data into old_data from public.jyc_site_data where id = 'main' for update;
  old_data := coalesce(old_data, '{}'::jsonb);

  if a_role in ('super_admin','jyc_super_admin') then
    next_data := p_data;
  elsif a_role = 'jyc_admin' then
    -- JYC Editor: editorial access to clubs, events and gallery only.
    -- It cannot change fest mode, homepage, team, categories, admins or settings.
    next_data := old_data;
    if p_entity_type in ('club','clubs') then
      next_data := next_data || jsonb_build_object('clubs',coalesce(p_data->'clubs','[]'::jsonb));
    elsif p_entity_type in ('event','events') then
      next_data := next_data || jsonb_build_object('events',coalesce(p_data->'events','[]'::jsonb));
    elsif p_entity_type = 'gallery' then
      next_data := next_data || jsonb_build_object('gallery',coalesce(p_data->'gallery','[]'::jsonb));
    else
      raise exception 'JYC Editor does not have permission for this content area';
    end if;
  elsif a_role in ('clubs_admin','events_admin','gallery_admin','content_admin') then
    next_data := old_data;
    if a_role = 'clubs_admin' and p_entity_type in ('club','clubs','settings') then next_data := next_data || jsonb_build_object('clubs',coalesce(p_data->'clubs','[]'::jsonb),'categories',coalesce(p_data->'categories',old_data->'categories')); end if;
    if a_role = 'events_admin' and p_entity_type in ('event','events') then next_data := next_data || jsonb_build_object('events',coalesce(p_data->'events','[]'::jsonb),'fest',coalesce(p_data->'fest',old_data->'fest')); end if;
    if a_role = 'gallery_admin' and p_entity_type in ('gallery') then next_data := next_data || jsonb_build_object('gallery',coalesce(p_data->'gallery','[]'::jsonb)); end if;
    if a_role = 'content_admin' and p_entity_type in ('homepage','team','fest','settings') then next_data := next_data || jsonb_build_object('homepage',coalesce(p_data->'homepage',old_data->'homepage'),'team',coalesce(p_data->'team',old_data->'team'),'fest',coalesce(p_data->'fest',old_data->'fest'),'creator',coalesce(p_data->'creator',old_data->'creator')); end if;
  elsif a_role = 'club_admin' then
    if a_club is null then
      raise exception 'Club Admin has no assigned club';
    end if;

    own_clubs := coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p_data->'clubs','[]'::jsonb)) v where v->>'id'=a_club),'[]'::jsonb);
    own_events := coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p_data->'events','[]'::jsonb)) v where v->>'clubId'=a_club),'[]'::jsonb);
    own_gallery := coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p_data->'gallery','[]'::jsonb)) v where v->>'clubId'=a_club),'[]'::jsonb);

    next_data := old_data
      || jsonb_build_object('clubs',
        coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(old_data->'clubs','[]'::jsonb)) v where v->>'id'<>a_club),'[]'::jsonb) || own_clubs)
      || jsonb_build_object('events',
        coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(old_data->'events','[]'::jsonb)) v where coalesce(v->>'clubId','')<>a_club),'[]'::jsonb) || own_events)
      || jsonb_build_object('gallery',
        coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(old_data->'gallery','[]'::jsonb)) v where coalesce(v->>'clubId','')<>a_club),'[]'::jsonb) || own_gallery);
  else
    raise exception 'Unsupported administrator role';
  end if;

  -- The creator credit is a protected website identity field. Never accept
  -- a browser-supplied value for it, even when an administrator calls the RPC directly.
  next_data := jsonb_set(next_data, '{creator}', jsonb_build_object(
    'name','Kaustubh Dua',
    'role','Website Creator',
    'linkedin','https://www.linkedin.com/in/kaustubh-dua-2b5a76416',
    'instagram','https://www.instagram.com/kaustubh.this.side/',
    'github','https://github.com/kaustubhdua',
    'email','kaustubhdua1991@gmail.com'
  ), true);

  insert into public.jyc_site_data(id,data,updated_at,updated_by)
  values('main',next_data,now(),auth.uid())
  on conflict(id) do update set data=excluded.data,updated_at=excluded.updated_at,updated_by=excluded.updated_by;

  insert into public.jyc_activity_logs(actor_id,action,entity_type,entity_id,metadata)
  values(auth.uid(),coalesce(p_action,'Updated site'),p_entity_type,p_entity_id,jsonb_build_object('role',a_role));

  return next_data;
end;
$$;

revoke all on function public.jyc_save_site_data(jsonb,text,text,text) from public;
grant execute on function public.jyc_save_site_data(jsonb,text,text,text) to authenticated;

-- Web Push subscriptions. The subscription JSON contains browser push endpoint
-- data and is only readable/writable by its owner; admins can manage delivery.
create table if not exists public.jyc_push_subscriptions(
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text unique not null,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.jyc_push_subscriptions enable row level security;
drop policy if exists "Users can register own push subscription" on public.jyc_push_subscriptions;
create policy "Users can register own push subscription" on public.jyc_push_subscriptions for insert to anon,authenticated with check(user_id is null or user_id=auth.uid());
drop policy if exists "Users can update own push subscription" on public.jyc_push_subscriptions;
create policy "Users can update own push subscription" on public.jyc_push_subscriptions for update to authenticated using(user_id=auth.uid() or user_id is null) with check(user_id=auth.uid() or user_id is null);
drop policy if exists "Users can delete own push subscription" on public.jyc_push_subscriptions;
create policy "Users can delete own push subscription" on public.jyc_push_subscriptions for delete to authenticated using(user_id=auth.uid() or user_id is null);
drop policy if exists "Admins can read push subscriptions" on public.jyc_push_subscriptions;
create policy "Admins can read push subscriptions" on public.jyc_push_subscriptions for select to authenticated using(exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));

-- Anonymous devices may refresh an existing endpoint subscription.
drop policy if exists "Anonymous devices can refresh push subscription" on public.jyc_push_subscriptions;
create policy "Anonymous devices can refresh push subscription" on public.jyc_push_subscriptions for update to anon using(user_id is null) with check(user_id is null);

-- The content-store uses string IDs for clubs (friendly slugs), so administrator
-- assignments use text rather than uuid.
alter table public.jyc_admins alter column club_id type text using club_id::text;

-- Tighten media permissions: Club Admins can only write/delete files inside
-- clubs/<their-club-id>/; JYC admins can manage the full archive.
drop policy if exists "JYC admins can upload JYC media" on storage.objects;
create policy "JYC admins can upload JYC media" on storage.objects for insert to authenticated
with check(bucket_id='jyc-media' and exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true and (a.role<>'club_admin' or name like 'clubs/'||a.club_id||'/%')));
drop policy if exists "JYC admins can update JYC media" on storage.objects;
create policy "JYC admins can update JYC media" on storage.objects for update to authenticated
using(bucket_id='jyc-media' and exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true and (a.role<>'club_admin' or name like 'clubs/'||a.club_id||'/%')))
with check(bucket_id='jyc-media' and exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true and (a.role<>'club_admin' or name like 'clubs/'||a.club_id||'/%')));
drop policy if exists "JYC admins can delete JYC media" on storage.objects;
create policy "JYC admins can delete JYC media" on storage.objects for delete to authenticated
using(bucket_id='jyc-media' and exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true and (a.role<>'club_admin' or name like 'clubs/'||a.club_id||'/%')));

-- ================================================================
-- SOURCE: supabase/relational-v2.sql
-- ================================================================
-- JYC PLATFORM V2 RELATIONAL FOUNDATION
-- Safe starting point for the scalable CMS.
-- The existing jyc_site_data JSON store can remain during migration.
-- Do NOT put service/secret keys in the frontend.

create extension if not exists pgcrypto;

create table if not exists public.jyc_clubs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  type text not null check (type in ('Technical','Non-Technical')),
  category text,
  subcategory text,
  logo_url text,
  banner_url text,
  short_description text not null,
  full_description text,
  status text not null default 'draft' check (status in ('draft','published','hidden','archived')),
  pinned boolean not null default false,
  featured boolean not null default false,
  recruitment_enabled boolean not null default false,
  auditions_enabled boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jyc_club_sections (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.jyc_clubs(id) on delete cascade,
  section_type text not null default 'text',
  title text not null,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jyc_club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.jyc_clubs(id) on delete cascade,
  name text not null,
  position text not null,
  photo_url text,
  bio text,
  instagram text,
  linkedin text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.jyc_club_links (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.jyc_clubs(id) on delete cascade,
  label text not null,
  url text not null,
  sort_order integer not null default 0
);

create table if not exists public.jyc_events (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.jyc_clubs(id) on delete set null,
  slug text unique not null,
  title text not null,
  event_type text,
  poster_url text,
  banner_url text,
  short_description text,
  full_description text,
  start_at timestamptz,
  end_at timestamptz,
  venue text,
  map_url text,
  registration_url text,
  registration_deadline timestamptz,
  eligibility text,
  fee text,
  status text not null default 'draft' check (status in ('draft','submitted','under_review','changes_requested','published','ongoing','past','archived')),
  featured boolean not null default false,
  pinned boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jyc_event_blocks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.jyc_events(id) on delete cascade,
  block_type text not null,
  title text,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_visible boolean not null default true
);

create table if not exists public.jyc_event_people (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.jyc_events(id) on delete cascade,
  person_type text not null check (person_type in ('speaker','guest','contact')),
  name text not null,
  designation text,
  organization text,
  photo_url text,
  bio text,
  email text,
  phone text,
  linkedin text,
  sort_order integer not null default 0
);

create table if not exists public.jyc_gallery_items (
  id uuid primary key default gen_random_uuid(),
  scope_type text not null check (scope_type in ('jyc','club','event','fest')),
  club_id uuid references public.jyc_clubs(id) on delete cascade,
  event_id uuid references public.jyc_events(id) on delete cascade,
  storage_path text,
  public_url text not null,
  caption text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.jyc_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  link text,
  priority integer not null default 0,
  pinned boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  is_visible boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.jyc_homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  title text,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.jyc_content_versions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  version_number integer not null,
  snapshot jsonb not null,
  changed_by uuid references auth.users(id) on delete set null,
  change_summary text,
  created_at timestamptz not null default now(),
  unique(entity_type, entity_id, version_number)
);

create table if not exists public.jyc_content_reviews (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  submitted_by uuid references auth.users(id) on delete set null,
  status text not null default 'submitted' check (status in ('submitted','under_review','changes_requested','approved','rejected')),
  reviewer_id uuid references auth.users(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.jyc_feature_flags (
  key text primary key,
  enabled boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists jyc_clubs_status_idx on public.jyc_clubs(status);
create index if not exists jyc_clubs_category_idx on public.jyc_clubs(type, category, subcategory);
create index if not exists jyc_events_dates_idx on public.jyc_events(start_at, end_at, status);
create index if not exists jyc_events_club_idx on public.jyc_events(club_id);
create index if not exists jyc_gallery_scope_idx on public.jyc_gallery_items(scope_type, club_id, event_id);
create index if not exists jyc_reviews_status_idx on public.jyc_content_reviews(status);

alter table public.jyc_clubs enable row level security;
alter table public.jyc_club_sections enable row level security;
alter table public.jyc_club_members enable row level security;
alter table public.jyc_club_links enable row level security;
alter table public.jyc_events enable row level security;
alter table public.jyc_event_blocks enable row level security;
alter table public.jyc_event_people enable row level security;
alter table public.jyc_gallery_items enable row level security;
alter table public.jyc_announcements enable row level security;
alter table public.jyc_homepage_sections enable row level security;
alter table public.jyc_content_versions enable row level security;
alter table public.jyc_content_reviews enable row level security;
alter table public.jyc_feature_flags enable row level security;

-- Public reads only published/visible content.
drop policy if exists "public read published clubs" on public.jyc_clubs;
create policy "public read published clubs" on public.jyc_clubs for select to anon, authenticated using (status='published');

drop policy if exists "public read published events" on public.jyc_events;
create policy "public read published events" on public.jyc_events for select to anon, authenticated using (status in ('published','ongoing','past'));

drop policy if exists "public read approved gallery" on public.jyc_gallery_items;
create policy "public read approved gallery" on public.jyc_gallery_items for select to anon, authenticated using (status='approved');

drop policy if exists "public read visible announcements" on public.jyc_announcements;
create policy "public read visible announcements" on public.jyc_announcements for select to anon, authenticated using (is_visible=true and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>=now()));

-- Admin/editor helpers rely on the existing jyc_admins table.
create or replace function public.jyc_v2_role()
returns text language sql stable security definer set search_path=public as $$
  select role from public.jyc_admins where user_id=auth.uid() and is_active=true limit 1;
$$;

create or replace function public.jyc_v2_club()
returns text language sql stable security definer set search_path=public as $$
  select club_id::text from public.jyc_admins where user_id=auth.uid() and is_active=true limit 1;
$$;

grant execute on function public.jyc_v2_role() to anon, authenticated;
grant execute on function public.jyc_v2_club() to authenticated;

-- Super Admin: full CRUD on the V2 CMS tables.
-- JYC Editor: operational content, but not administrator/security tables.
drop policy if exists "admins manage clubs" on public.jyc_clubs;
create policy "admins manage clubs" on public.jyc_clubs for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','clubs_admin')
  or (public.jyc_v2_role()='club_admin' and id::text=public.jyc_v2_club()))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','clubs_admin')
  or (public.jyc_v2_role()='club_admin' and id::text=public.jyc_v2_club()));

drop policy if exists "admins manage events" on public.jyc_events;
create policy "admins manage events" on public.jyc_events for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin')
  or (public.jyc_v2_role()='club_admin' and club_id::text=public.jyc_v2_club()))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin')
  or (public.jyc_v2_role()='club_admin' and club_id::text=public.jyc_v2_club()));

drop policy if exists "admins manage gallery" on public.jyc_gallery_items;
create policy "admins manage gallery" on public.jyc_gallery_items for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','gallery_admin')
  or (public.jyc_v2_role()='club_admin' and club_id::text=public.jyc_v2_club()))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','gallery_admin')
  or (public.jyc_v2_role()='club_admin' and club_id::text=public.jyc_v2_club()));

-- Child tables follow their parent scope.
drop policy if exists "admins manage club sections" on public.jyc_club_sections;
create policy "admins manage club sections" on public.jyc_club_sections for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','clubs_admin')
  or (public.jyc_v2_role()='club_admin' and club_id::text=public.jyc_v2_club()))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','clubs_admin')
  or (public.jyc_v2_role()='club_admin' and club_id::text=public.jyc_v2_club()));

drop policy if exists "admins manage club members" on public.jyc_club_members;
create policy "admins manage club members" on public.jyc_club_members for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','clubs_admin')
  or (public.jyc_v2_role()='club_admin' and club_id::text=public.jyc_v2_club()))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','clubs_admin')
  or (public.jyc_v2_role()='club_admin' and club_id::text=public.jyc_v2_club()));

drop policy if exists "admins manage club links" on public.jyc_club_links;
create policy "admins manage club links" on public.jyc_club_links for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','clubs_admin')
  or (public.jyc_v2_role()='club_admin' and club_id::text=public.jyc_v2_club()))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','clubs_admin')
  or (public.jyc_v2_role()='club_admin' and club_id::text=public.jyc_v2_club()));

-- Child event data.
drop policy if exists "admins manage event blocks" on public.jyc_event_blocks;
create policy "admins manage event blocks" on public.jyc_event_blocks for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin'))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin'));

drop policy if exists "admins manage event people" on public.jyc_event_people;
create policy "admins manage event people" on public.jyc_event_people for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin'))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin'));

drop policy if exists "admins manage announcements" on public.jyc_announcements;
create policy "admins manage announcements" on public.jyc_announcements for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','content_admin'))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','content_admin'));

drop policy if exists "admins manage homepage" on public.jyc_homepage_sections;
create policy "admins manage homepage" on public.jyc_homepage_sections for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','content_admin'))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','content_admin'));

drop policy if exists "admins manage versions" on public.jyc_content_versions;
create policy "admins manage versions" on public.jyc_content_versions for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin'))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin'));

drop policy if exists "admins manage reviews" on public.jyc_content_reviews;
create policy "admins manage reviews" on public.jyc_content_reviews for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin','clubs_admin','content_admin'))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin','clubs_admin','content_admin'));

drop policy if exists "super admins manage flags" on public.jyc_feature_flags;
create policy "super admins manage flags" on public.jyc_feature_flags for all to authenticated
using (public.jyc_v2_role() in ('super_admin','jyc_super_admin'))
with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin'));

-- ================================================================
-- SOURCE: supabase/platform-v3.sql
-- ================================================================
-- JYC Platform V3: analytics, push, reminders, notification preferences and media albums.
-- Run after the existing schema + relational-v2.sql. Safe to re-run.
create table if not exists public.jyc_push_subscriptions (
  id uuid primary key default gen_random_uuid(), endpoint text unique not null,
  subscription jsonb not null, user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.jyc_page_views (
  id bigint generated always as identity primary key, path text not null,
  referrer text, user_id uuid references auth.users(id) on delete set null,
  session_key text, created_at timestamptz not null default now()
);
create table if not exists public.jyc_error_reports (
  id bigint generated always as identity primary key, message text not null,
  stack text, path text, user_agent text, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.jyc_event_reminders (
  id uuid primary key default gen_random_uuid(), event_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
  reminder_at timestamptz not null, delivered_at timestamptz,
  created_at timestamptz not null default now(), unique(event_id,user_id,reminder_at)
);
create table if not exists public.jyc_notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  events boolean not null default true, recruitment boolean not null default true,
  announcements boolean not null default true, fests boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.jyc_media_albums (
  id uuid primary key default gen_random_uuid(), name text not null,
  slug text unique not null, description text, scope_type text not null default 'jyc',
  club_id uuid, event_id text, fest_id text, cover_url text,
  is_published boolean not null default false, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists jyc_page_views_path_idx on public.jyc_page_views(path,created_at desc);
create index if not exists jyc_page_views_created_idx on public.jyc_page_views(created_at desc);
create index if not exists jyc_push_user_idx on public.jyc_push_subscriptions(user_id);
alter table public.jyc_push_subscriptions enable row level security;
alter table public.jyc_page_views enable row level security;
alter table public.jyc_error_reports enable row level security;
alter table public.jyc_event_reminders enable row level security;
alter table public.jyc_notification_preferences enable row level security;
alter table public.jyc_media_albums enable row level security;

drop policy if exists "push owner or anonymous" on public.jyc_push_subscriptions;
create policy "push owner or anonymous" on public.jyc_push_subscriptions for insert to anon,authenticated with check (user_id is null or user_id=auth.uid());
drop policy if exists "push owner read" on public.jyc_push_subscriptions;
create policy "push owner read" on public.jyc_push_subscriptions for select to authenticated using (user_id=auth.uid() or user_id is null);
drop policy if exists "push owner update" on public.jyc_push_subscriptions;
create policy "push owner update" on public.jyc_push_subscriptions for update to authenticated using (user_id=auth.uid() or user_id is null) with check (user_id=auth.uid() or user_id is null);
drop policy if exists "push owner delete" on public.jyc_push_subscriptions;
create policy "push owner delete" on public.jyc_push_subscriptions for delete to authenticated using (user_id=auth.uid() or user_id is null);

drop policy if exists "public insert page views" on public.jyc_page_views;
create policy "public insert page views" on public.jyc_page_views for insert to anon,authenticated with check (user_id is null or user_id=auth.uid());
drop policy if exists "admins read page views" on public.jyc_page_views;
create policy "admins read page views" on public.jyc_page_views for select to authenticated using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin'));

drop policy if exists "public submit errors" on public.jyc_error_reports;
create policy "public submit errors" on public.jyc_error_reports for insert to anon,authenticated with check (true);
drop policy if exists "admins read errors" on public.jyc_error_reports;
create policy "admins read errors" on public.jyc_error_reports for select to authenticated using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin'));

drop policy if exists "reminders owner" on public.jyc_event_reminders;
create policy "reminders owner" on public.jyc_event_reminders for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists "preferences owner" on public.jyc_notification_preferences;
create policy "preferences owner" on public.jyc_notification_preferences for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

drop policy if exists "public read albums" on public.jyc_media_albums;
create policy "public read albums" on public.jyc_media_albums for select to anon,authenticated using (is_published=true);
drop policy if exists "admins manage albums" on public.jyc_media_albums;
create policy "admins manage albums" on public.jyc_media_albums for all to authenticated using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','gallery_admin')) with check (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','gallery_admin'));

create table if not exists public.jyc_event_registrations (
  id uuid primary key default gen_random_uuid(), event_id text not null,
  name text not null, email text not null, enrollment_no text, phone text,
  year text, branch text, responses jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), unique(event_id,email)
);
alter table public.jyc_event_registrations enable row level security;
drop policy if exists "public register event" on public.jyc_event_registrations;
create policy "public register event" on public.jyc_event_registrations for insert to anon,authenticated with check (true);
drop policy if exists "admins read registrations" on public.jyc_event_registrations;
create policy "admins read registrations" on public.jyc_event_registrations for select to authenticated using (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin','club_admin'));

-- ================================================================
-- SOURCE: supabase/platform-v4-fix.sql
-- ================================================================
-- JYC V4 FIX: clean legacy starter data + repair the RPC signature mismatch.
-- Run this ONE file in Supabase SQL Editor after the existing migrations.
-- It is safe to re-run. It removes only the known legacy starter record id/name.

create extension if not exists pgcrypto;

-- Canonical save function used by the current frontend.
create or replace function public.jyc_save_site_data(
  p_data jsonb,
  p_action text default 'Updated site',
  p_entity_type text default 'site',
  p_entity_id text default 'main'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  a_role text;
  a_club text;
  old_data jsonb;
  next_data jsonb;
  own_clubs jsonb;
  own_events jsonb;
  own_gallery jsonb;
begin
  select role, club_id::text into a_role, a_club
  from public.jyc_admins where user_id=auth.uid() and is_active=true limit 1;
  if a_role is null then raise exception 'Not authorized'; end if;
  select data into old_data from public.jyc_site_data where id='main' for update;
  old_data:=coalesce(old_data,'{}'::jsonb);

  if a_role in ('super_admin','jyc_super_admin') then
    next_data:=p_data;
  elsif a_role='jyc_admin' then
    next_data:=old_data;
    if p_entity_type in ('club','clubs') then next_data:=next_data||jsonb_build_object('clubs',coalesce(p_data->'clubs','[]'::jsonb));
    elsif p_entity_type in ('event','events') then next_data:=next_data||jsonb_build_object('events',coalesce(p_data->'events','[]'::jsonb));
    elsif p_entity_type='gallery' then next_data:=next_data||jsonb_build_object('gallery',coalesce(p_data->'gallery','[]'::jsonb));
    else raise exception 'JYC Editor does not have permission for this content area'; end if;
  elsif a_role='clubs_admin' and p_entity_type in ('club','clubs') then
    next_data:=old_data||jsonb_build_object('clubs',coalesce(p_data->'clubs','[]'::jsonb));
  elsif a_role='events_admin' and p_entity_type in ('event','events') then
    next_data:=old_data||jsonb_build_object('events',coalesce(p_data->'events','[]'::jsonb));
  elsif a_role='gallery_admin' and p_entity_type='gallery' then
    next_data:=old_data||jsonb_build_object('gallery',coalesce(p_data->'gallery','[]'::jsonb));
  elsif a_role='content_admin' and p_entity_type in ('homepage','team','fest') then
    next_data:=old_data||jsonb_build_object('homepage',coalesce(p_data->'homepage',old_data->'homepage'),'team',coalesce(p_data->'team',old_data->'team'),'fest',coalesce(p_data->'fest',old_data->'fest'));
  elsif a_role='club_admin' then
    if a_club is null then raise exception 'Club Admin has no assigned club'; end if;
    own_clubs:=coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p_data->'clubs','[]'::jsonb)) v where v->>'id'=a_club),'[]'::jsonb);
    own_events:=coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p_data->'events','[]'::jsonb)) v where v->>'clubId'=a_club),'[]'::jsonb);
    own_gallery:=coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p_data->'gallery','[]'::jsonb)) v where v->>'clubId'=a_club),'[]'::jsonb);
    next_data:=old_data
      ||jsonb_build_object('clubs',coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(old_data->'clubs','[]'::jsonb)) v where v->>'id'<>a_club),'[]'::jsonb)||own_clubs)
      ||jsonb_build_object('events',coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(old_data->'events','[]'::jsonb)) v where coalesce(v->>'clubId','')<>a_club),'[]'::jsonb)||own_events)
      ||jsonb_build_object('gallery',coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(old_data->'gallery','[]'::jsonb)) v where coalesce(v->>'clubId','')<>a_club),'[]'::jsonb)||own_gallery);
  else raise exception 'Administrator role does not have permission for this content area'; end if;

  -- Permanently protect the creator identity.
  next_data:=jsonb_set(next_data,'{creator}',jsonb_build_object('name','Kaustubh Dua','role','Website Creator','linkedin','https://www.linkedin.com/in/kaustubh-dua-2b5a76416','instagram','https://www.instagram.com/kaustubh.this.side/','github','https://github.com/kaustubhdua','email','kaustubhdua1991@gmail.com'),true);
  insert into public.jyc_site_data(id,data,updated_at,updated_by) values('main',next_data,now(),auth.uid()) on conflict(id) do update set data=excluded.data,updated_at=excluded.updated_at,updated_by=excluded.updated_by;
  insert into public.jyc_activity_logs(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),coalesce(p_action,'Updated site'),p_entity_type,p_entity_id,jsonb_build_object('role',a_role));
  return next_data;
end $$;

revoke all on function public.jyc_save_site_data(jsonb,text,text,text) from public;
grant execute on function public.jyc_save_site_data(jsonb,text,text,text) to authenticated;

-- Some older JYC deployments created the same RPC with the arguments in a different order.
-- Keep a compatibility wrapper so old schema-cache/function signatures stop breaking saves.
drop function if exists public.jyc_save_site_data(text,jsonb,text,text);
create or replace function public.jyc_save_site_data(
  p_action text,
  p_data jsonb,
  p_entity_id text default 'main',
  p_entity_type text default 'site'
)
returns jsonb
language sql
security definer
set search_path=public
as $$
  select public.jyc_save_site_data(p_data,p_action,p_entity_type,p_entity_id);
$$;
revoke all on function public.jyc_save_site_data(text,jsonb,text,text) from public;
grant execute on function public.jyc_save_site_data(text,jsonb,text,text) to authenticated;

-- IMPORTANT: Abhivyakti is a legitimate JYC community in the supplied hub directory.
-- Never delete content by the name/slug "abhivyakti" from a production database.
-- The old starter cleanup used that identity and could destroy the real community.
-- Existing content is intentionally preserved during bootstrap/re-run.

select 'JYC V4 fix applied. Refresh the website.' as result;

-- ================================================================
-- SOURCE: supabase/final-role-hardening.sql
-- ================================================================
-- JYC FINAL ROLE HARDENING
-- Run this once on the existing production Supabase project after deploying the UI.
-- Super Admin keeps full control. JYC Editor is limited to clubs, events and gallery.
-- This file does not create users or change Club Admin assignments.

create or replace function public.jyc_save_site_data(
  p_data jsonb,
  p_action text default 'Updated site',
  p_entity_type text default 'site',
  p_entity_id text default 'main'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  a_role text;
  a_club text;
  old_data jsonb;
  next_data jsonb;
  own_clubs jsonb;
  own_events jsonb;
  own_gallery jsonb;
begin
  select role, club_id::text into a_role, a_club
  from public.jyc_admins
  where user_id = auth.uid() and is_active = true
  limit 1;

  if a_role is null then raise exception 'Not authorized'; end if;
  if a_role = 'jyc_admin' and lower(coalesce(p_action,'')) like 'deleted %' then
    raise exception 'JYC Editor cannot permanently delete content. Archive or hide it instead.';
  end if;

  if a_role = 'club_admin' and (
    lower(coalesce(p_action,'')) like 'deleted %'
    or lower(coalesce(p_action,'')) like 'archived %'
    or lower(coalesce(p_action,'')) like 'published %'
  ) then
    raise exception 'Club Admin can edit and submit content, but cannot publish, archive or permanently delete it.';
  end if;


  select data into old_data from public.jyc_site_data where id='main' for update;
  old_data := coalesce(old_data, '{}'::jsonb);

  if a_role in ('super_admin','jyc_super_admin') then
    next_data := p_data;
  elsif a_role = 'jyc_admin' then
    next_data := old_data;
    if p_entity_type in ('club','clubs') then
      next_data := next_data || jsonb_build_object('clubs',coalesce(p_data->'clubs','[]'::jsonb));
    elsif p_entity_type in ('event','events') then
      next_data := next_data || jsonb_build_object('events',coalesce(p_data->'events','[]'::jsonb));
    elsif p_entity_type = 'gallery' then
      next_data := next_data || jsonb_build_object('gallery',coalesce(p_data->'gallery','[]'::jsonb));
    else
      raise exception 'JYC Editor does not have permission for this content area';
    end if;
  elsif a_role in ('clubs_admin','events_admin','gallery_admin','content_admin') then
    next_data := old_data;
    if a_role='clubs_admin' and p_entity_type in ('club','clubs') then
      next_data := next_data || jsonb_build_object('clubs',coalesce(p_data->'clubs','[]'::jsonb));
    elsif a_role='events_admin' and p_entity_type in ('event','events') then
      next_data := next_data || jsonb_build_object('events',coalesce(p_data->'events','[]'::jsonb));
    elsif a_role='gallery_admin' and p_entity_type='gallery' then
      next_data := next_data || jsonb_build_object('gallery',coalesce(p_data->'gallery','[]'::jsonb));
    elsif a_role='content_admin' and p_entity_type in ('homepage','team','fest') then
      next_data := next_data || jsonb_build_object(
        'homepage',coalesce(p_data->'homepage',old_data->'homepage'),
        'team',coalesce(p_data->'team',old_data->'team'),
        'fest',coalesce(p_data->'fest',old_data->'fest')
      );
    else
      raise exception 'Administrator role does not have permission for this content area';
    end if;
  elsif a_role='club_admin' then
    if a_club is null then raise exception 'Club Admin has no assigned club'; end if;
    own_clubs := coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p_data->'clubs','[]'::jsonb)) v where v->>'id'=a_club),'[]'::jsonb);
    own_events := coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p_data->'events','[]'::jsonb)) v where v->>'clubId'=a_club),'[]'::jsonb);
    own_gallery := coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p_data->'gallery','[]'::jsonb)) v where v->>'clubId'=a_club),'[]'::jsonb);
    next_data := old_data
      || jsonb_build_object('clubs',coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(old_data->'clubs','[]'::jsonb)) v where v->>'id'<>a_club),'[]'::jsonb)||own_clubs)
      || jsonb_build_object('events',coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(old_data->'events','[]'::jsonb)) v where coalesce(v->>'clubId','')<>a_club),'[]'::jsonb)||own_events)
      || jsonb_build_object('gallery',coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(old_data->'gallery','[]'::jsonb)) v where coalesce(v->>'clubId','')<>a_club),'[]'::jsonb)||own_gallery);
  else
    raise exception 'Unsupported administrator role';
  end if;

  next_data := jsonb_set(next_data,'{creator}',jsonb_build_object(
    'name','Kaustubh Dua','role','Website Creator',
    'linkedin','https://www.linkedin.com/in/kaustubh-dua-2b5a76416',
    'instagram','https://www.instagram.com/kaustubh.this.side/',
    'github','https://github.com/kaustubhdua',
    'email','kaustubhdua1991@gmail.com'
  ),true);

  insert into public.jyc_site_data(id,data,updated_at,updated_by)
  values('main',next_data,now(),auth.uid())
  on conflict(id) do update set data=excluded.data,updated_at=excluded.updated_at,updated_by=excluded.updated_by;

  insert into public.jyc_activity_logs(actor_id,action,entity_type,entity_id,metadata)
  values(auth.uid(),coalesce(p_action,'Updated site'),p_entity_type,p_entity_id,jsonb_build_object('role',a_role));

  return next_data;
end;
$$;

revoke all on function public.jyc_save_site_data(jsonb,text,text,text) from public;
grant execute on function public.jyc_save_site_data(jsonb,text,text,text) to authenticated;

-- ================================================================
-- SOURCE: supabase/platform-v5-production.sql
-- ================================================================
-- JYC Platform V5: production-read hardening + account-linked registrations.
-- Run after 00-core-migration.sql, relational-v2.sql, platform-v3.sql,
-- platform-v4-fix.sql and final-role-hardening.sql.
-- This migration keeps the existing JSON CMS but stops anonymous clients
-- from reading unpublished/admin-only content from jyc_site_data.

create or replace function public.jyc_read_site_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  raw jsonb;
  is_admin boolean;
begin
  select data into raw from public.jyc_site_data where id='main';
  raw := coalesce(raw,'{}'::jsonb);
  select exists(
    select 1 from public.jyc_admins
    where user_id=auth.uid() and is_active=true
  ) into is_admin;

  if is_admin then
    return raw;
  end if;

  raw := jsonb_set(raw,'{clubs}',coalesce((
    select jsonb_agg(v order by lower(coalesce(v->>'name','')))
    from jsonb_array_elements(coalesce(raw->'clubs','[]'::jsonb)) v
    where coalesce(v->>'published','false')='true'
      and coalesce(v->>'status','published') <> 'archived'
  ),'[]'::jsonb),true);

  raw := jsonb_set(raw,'{events}',coalesce((
    select jsonb_agg(v order by coalesce(v->>'date','9999-99-99'),coalesce(v->>'start','99:99'))
    from jsonb_array_elements(coalesce(raw->'events','[]'::jsonb)) v
    where coalesce(v->>'published','false')='true'
      and coalesce(v->>'archived','false') <> 'true'
  ),'[]'::jsonb),true);

  -- Existing gallery records pre-date a published flag, so only an explicit
  -- published=false hides an image from the public experience.
  raw := jsonb_set(raw,'{gallery}',coalesce((
    select jsonb_agg(v order by coalesce(v->>'created_at','9999-99-99'))
    from jsonb_array_elements(coalesce(raw->'gallery','[]'::jsonb)) v
    where coalesce(v->>'published','true') <> 'false'
  ),'[]'::jsonb),true);

  raw := jsonb_set(raw,'{team}',coalesce((
    select jsonb_agg(v order by case when coalesce(v->>'sortOrder','') ~ '^[0-9]+$' then (v->>'sortOrder')::int else 9999 end)
    from jsonb_array_elements(coalesce(raw->'team','[]'::jsonb)) v
    where coalesce(v->>'published','true')='true'
  ),'[]'::jsonb),true);

  -- Never expose the creator's protected admin-only identity object through a
  -- public content read. The public footer uses the same static credit in the
  -- frontend and the protected value is retained for administrator backups.
  raw := raw - 'creator';
  return raw;
end;
$$;

revoke all on function public.jyc_read_site_data() from public;
grant execute on function public.jyc_read_site_data() to anon, authenticated;

-- jyc_site_data is now readable directly only by active administrators.
drop policy if exists "Public can read published site data" on public.jyc_site_data;
drop policy if exists "Public can read site data" on public.jyc_site_data;
drop policy if exists "Admins can read site data" on public.jyc_site_data;
create policy "Admins can read site data" on public.jyc_site_data
for select to authenticated
using (exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));

-- Account-linked registrations.
alter table public.jyc_event_registrations
  add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.jyc_event_registrations
  add column if not exists registration_status text not null default 'registered';
alter table public.jyc_event_registrations
  add column if not exists updated_at timestamptz not null default now();
create index if not exists jyc_event_registrations_user_idx
  on public.jyc_event_registrations(user_id,created_at desc);

-- Remove the old permissive policies before replacing them.
drop policy if exists "public register event" on public.jyc_event_registrations;
drop policy if exists "admins read registrations" on public.jyc_event_registrations;
drop policy if exists "users read own registrations" on public.jyc_event_registrations;
drop policy if exists "users update own registrations" on public.jyc_event_registrations;
drop policy if exists "users delete own registrations" on public.jyc_event_registrations;

create policy "public register published native event" on public.jyc_event_registrations
for insert to anon, authenticated
with check (
  (user_id is null or user_id=auth.uid())
  and exists(
    select 1
    from public.jyc_site_data s,
         jsonb_array_elements(coalesce(s.data->'events','[]'::jsonb)) ev
    where s.id='main'
      and ev->>'id'=event_id
      and coalesce(ev->>'published','false')='true'
      and coalesce(ev->>'archived','false') <> 'true'
      and coalesce(ev->>'registrationMode','external')='native'
  )
);

create policy "users read own registrations" on public.jyc_event_registrations
for select to authenticated
using (user_id=auth.uid());

create policy "users update own registrations" on public.jyc_event_registrations
for update to authenticated
using (user_id=auth.uid())
with check (user_id=auth.uid());

create policy "users delete own registrations" on public.jyc_event_registrations
for delete to authenticated
using (user_id=auth.uid());

create policy "admins read registrations" on public.jyc_event_registrations
for select to authenticated
using (
  public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin')
  or (
    public.jyc_v2_role()='club_admin'
    and exists(
      select 1
      from public.jyc_admins a,
           public.jyc_site_data s,
           jsonb_array_elements(coalesce(s.data->'events','[]'::jsonb)) ev
      where a.user_id=auth.uid()
        and a.is_active=true
        and ev->>'id'=event_id
        and ev->>'clubId'=a.club_id::text
    )
  )
);

-- Keep registration status updates under the same role boundary.
create policy "admins update registrations" on public.jyc_event_registrations
for update to authenticated
using (
  public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin')
  or (
    public.jyc_v2_role()='club_admin'
    and exists(
      select 1 from public.jyc_admins a, public.jyc_site_data s,
        jsonb_array_elements(coalesce(s.data->'events','[]'::jsonb)) ev
      where a.user_id=auth.uid() and a.is_active=true
        and ev->>'id'=event_id and ev->>'clubId'=a.club_id::text
    )
  )
)
with check (
  public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin')
  or (
    public.jyc_v2_role()='club_admin'
    and exists(
      select 1 from public.jyc_admins a, public.jyc_site_data s,
        jsonb_array_elements(coalesce(s.data->'events','[]'::jsonb)) ev
      where a.user_id=auth.uid() and a.is_active=true
        and ev->>'id'=event_id and ev->>'clubId'=a.club_id::text
    )
  )
);


-- Registration integrity: non-admin users may only cancel their own registration.
create or replace function public.jyc_protect_registration_update()
returns trigger
language plpgsql
security invoker
set search_path=public
as $$
begin
  if auth.uid() = old.user_id and not (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin')) then
    if new.event_id <> old.event_id
       or coalesce(new.user_id::text,'') <> coalesce(old.user_id::text,'')
       or new.name <> old.name
       or lower(new.email) <> lower(old.email)
       or coalesce(new.enrollment_no,'') <> coalesce(old.enrollment_no,'')
       or coalesce(new.phone,'') <> coalesce(old.phone,'')
       or coalesce(new.year,'') <> coalesce(old.year,'')
       or coalesce(new.branch,'') <> coalesce(old.branch,'')
       or coalesce(new.responses,'{}'::jsonb) <> coalesce(old.responses,'{}'::jsonb)
       or new.registration_status <> 'cancelled' then
      raise exception 'You may only cancel your own registration';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists jyc_protect_registration_update on public.jyc_event_registrations;
create trigger jyc_protect_registration_update
before update on public.jyc_event_registrations
for each row execute function public.jyc_protect_registration_update();

-- Native-event capacity/waitlist handling. The trigger derives the initial status server-side.
create or replace function public.jyc_assign_registration_status()
returns trigger
language plpgsql
security invoker
set search_path=public
as $$
declare
  ev jsonb;
  cap integer;
  use_waitlist boolean;
  current_count integer;
begin
  if coalesce(new.registration_status,'') = 'cancelled' then return new; end if;
  select x into ev
  from public.jyc_site_data s,
       jsonb_array_elements(coalesce(s.data->'events','[]'::jsonb)) x
  where s.id='main' and x->>'id'=new.event_id
    and coalesce(x->>'registrationMode','external')='native'
  limit 1;
  if ev is null then return new; end if;
  cap:=nullif(ev->>'capacity','')::integer;
  use_waitlist:=coalesce((ev->>'waitlist')::boolean,false);
  if cap is null or cap <= 0 then new.registration_status:='registered'; return new; end if;
  select count(*) into current_count
  from public.jyc_event_registrations r
  where r.event_id=new.event_id and r.registration_status in ('registered','confirmed');
  if current_count >= cap then
    if use_waitlist then new.registration_status:='waitlisted';
    else raise exception 'This event has reached capacity'; end if;
  else
    new.registration_status:='registered';
  end if;
  return new;
end;
$$;
drop trigger if exists jyc_assign_registration_status on public.jyc_event_registrations;
create trigger jyc_assign_registration_status
before insert on public.jyc_event_registrations
for each row execute function public.jyc_assign_registration_status();

-- Keep timestamps fresh when an account changes its registration status.
create or replace function public.jyc_touch_registration()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  new.updated_at=now();
  return new;
end;
$$;
drop trigger if exists jyc_touch_registration on public.jyc_event_registrations;
create trigger jyc_touch_registration
before update on public.jyc_event_registrations
for each row execute function public.jyc_touch_registration();

select 'JYC V5 production hardening complete.' as result;

-- JYC V13 FINAL CANONICAL OVERRIDES
-- JYC FINAL ROLE HARDENING
-- Run this once on the existing production Supabase project after deploying the UI.
-- Super Admin keeps full control. JYC Editor is limited to clubs, events and gallery.
-- This file does not create users or change Club Admin assignments.

create or replace function public.jyc_save_site_data(
  p_data jsonb,
  p_action text default 'Updated site',
  p_entity_type text default 'site',
  p_entity_id text default 'main'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  a_role text;
  a_club text;
  old_data jsonb;
  next_data jsonb;
  own_clubs jsonb;
  own_events jsonb;
  own_gallery jsonb;
begin
  select role, club_id::text into a_role, a_club
  from public.jyc_admins
  where user_id = auth.uid() and is_active = true
  limit 1;

  if a_role is null then raise exception 'Not authorized'; end if;
  if a_role = 'jyc_admin' and lower(coalesce(p_action,'')) like 'deleted %' then
    raise exception 'JYC Editor cannot permanently delete content. Archive or hide it instead.';
  end if;

  if a_role = 'club_admin' and (
    lower(coalesce(p_action,'')) like 'deleted %'
    or lower(coalesce(p_action,'')) like 'archived %'
    or lower(coalesce(p_action,'')) like 'published %'
  ) then
    raise exception 'Club Admin can edit and submit content, but cannot publish, archive or permanently delete it.';
  end if;


  select data into old_data from public.jyc_site_data where id='main' for update;
  old_data := coalesce(old_data, '{}'::jsonb);

  if a_role in ('super_admin','jyc_super_admin') then
    next_data := p_data;
  elsif a_role = 'jyc_admin' then
    next_data := old_data;
    if p_entity_type in ('club','clubs') then
      next_data := next_data || jsonb_build_object('clubs',coalesce(p_data->'clubs','[]'::jsonb));
    elsif p_entity_type in ('event','events') then
      next_data := next_data || jsonb_build_object('events',coalesce(p_data->'events','[]'::jsonb));
    elsif p_entity_type = 'gallery' then
      next_data := next_data || jsonb_build_object('gallery',coalesce(p_data->'gallery','[]'::jsonb));
    elsif p_entity_type in ('categories','settings') then
      next_data := next_data || jsonb_build_object('categories',coalesce(p_data->'categories',old_data->'categories'));
    elsif p_entity_type in ('calendar','academic_calendar') then
      next_data := next_data || jsonb_build_object('academicCalendar',coalesce(p_data->'academicCalendar',old_data->'academicCalendar'));
    else
      raise exception 'JYC Editor does not have permission for this content area';
    end if;
  elsif a_role in ('clubs_admin','events_admin','gallery_admin','content_admin') then
    next_data := old_data;
    if a_role='clubs_admin' and p_entity_type in ('club','clubs') then
      next_data := next_data || jsonb_build_object('clubs',coalesce(p_data->'clubs','[]'::jsonb));
    elsif a_role='events_admin' and p_entity_type in ('event','events') then
      next_data := next_data || jsonb_build_object('events',coalesce(p_data->'events','[]'::jsonb));
    elsif a_role='gallery_admin' and p_entity_type='gallery' then
      next_data := next_data || jsonb_build_object('gallery',coalesce(p_data->'gallery','[]'::jsonb));
    elsif a_role='content_admin' and p_entity_type in ('homepage','team','fest') then
      next_data := next_data || jsonb_build_object(
        'homepage',coalesce(p_data->'homepage',old_data->'homepage'),
        'team',coalesce(p_data->'team',old_data->'team'),
        'fest',coalesce(p_data->'fest',old_data->'fest')
      );
    elsif a_role='content_admin' and p_entity_type in ('calendar','academic_calendar') then
      next_data := next_data || jsonb_build_object('academicCalendar',coalesce(p_data->'academicCalendar',old_data->'academicCalendar'));
    elsif a_role='clubs_admin' and p_entity_type in ('categories','settings') then
      next_data := next_data || jsonb_build_object('categories',coalesce(p_data->'categories',old_data->'categories'));
    else
      raise exception 'Administrator role does not have permission for this content area';
    end if;
  elsif a_role='club_admin' then
    if a_club is null then raise exception 'Club Admin has no assigned club'; end if;
    own_clubs := coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p_data->'clubs','[]'::jsonb)) v where v->>'id'=a_club),'[]'::jsonb);
    own_events := coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p_data->'events','[]'::jsonb)) v where v->>'clubId'=a_club),'[]'::jsonb);
    own_gallery := coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(p_data->'gallery','[]'::jsonb)) v where v->>'clubId'=a_club),'[]'::jsonb);
    next_data := old_data
      || jsonb_build_object('clubs',coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(old_data->'clubs','[]'::jsonb)) v where v->>'id'<>a_club),'[]'::jsonb)||own_clubs)
      || jsonb_build_object('events',coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(old_data->'events','[]'::jsonb)) v where coalesce(v->>'clubId','')<>a_club),'[]'::jsonb)||own_events)
      || jsonb_build_object('gallery',coalesce((select jsonb_agg(v) from jsonb_array_elements(coalesce(old_data->'gallery','[]'::jsonb)) v where coalesce(v->>'clubId','')<>a_club),'[]'::jsonb)||own_gallery);
  else
    raise exception 'Unsupported administrator role';
  end if;

  next_data := jsonb_set(next_data,'{creator}',jsonb_build_object(
    'name','Kaustubh Dua','role','Website Creator',
    'linkedin','https://www.linkedin.com/in/kaustubh-dua-2b5a76416',
    'instagram','https://www.instagram.com/kaustubh.this.side/',
    'github','https://github.com/kaustubhdua',
    'email','kaustubhdua1991@gmail.com'
  ),true);

  insert into public.jyc_site_data(id,data,updated_at,updated_by)
  values('main',next_data,now(),auth.uid())
  on conflict(id) do update set data=excluded.data,updated_at=excluded.updated_at,updated_by=excluded.updated_by;

  insert into public.jyc_activity_logs(actor_id,action,entity_type,entity_id,metadata)
  values(auth.uid(),coalesce(p_action,'Updated site'),p_entity_type,p_entity_id,jsonb_build_object('role',a_role));

  return next_data;
end;
$$;

revoke all on function public.jyc_save_site_data(jsonb,text,text,text) from public;
grant execute on function public.jyc_save_site_data(jsonb,text,text,text) to authenticated;

-- V5 public-read hardening and registration policies
-- JYC Platform V5: production-read hardening + account-linked registrations.
-- Run after 00-core-migration.sql, relational-v2.sql, platform-v3.sql,
-- platform-v4-fix.sql and final-role-hardening.sql.
-- This migration keeps the existing JSON CMS but stops anonymous clients
-- from reading unpublished/admin-only content from jyc_site_data.

create or replace function public.jyc_read_site_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  raw jsonb;
  is_admin boolean;
begin
  select data into raw from public.jyc_site_data where id='main';
  raw := coalesce(raw,'{}'::jsonb);
  select exists(
    select 1 from public.jyc_admins
    where user_id=auth.uid() and is_active=true
  ) into is_admin;

  if is_admin then
    return raw;
  end if;

  raw := jsonb_set(raw,'{clubs}',coalesce((
    select jsonb_agg(v order by lower(coalesce(v->>'name','')))
    from jsonb_array_elements(coalesce(raw->'clubs','[]'::jsonb)) v
    where coalesce(v->>'published','false')='true'
      and coalesce(v->>'status','published') <> 'archived'
  ),'[]'::jsonb),true);

  raw := jsonb_set(raw,'{events}',coalesce((
    select jsonb_agg(v order by coalesce(v->>'date','9999-99-99'),coalesce(v->>'start','99:99'))
    from jsonb_array_elements(coalesce(raw->'events','[]'::jsonb)) v
    where coalesce(v->>'published','false')='true'
      and coalesce(v->>'archived','false') <> 'true'
  ),'[]'::jsonb),true);

  -- Existing gallery records pre-date a published flag, so only an explicit
  -- published=false hides an image from the public experience.
  raw := jsonb_set(raw,'{gallery}',coalesce((
    select jsonb_agg(v order by coalesce(v->>'created_at','9999-99-99'))
    from jsonb_array_elements(coalesce(raw->'gallery','[]'::jsonb)) v
    where coalesce(v->>'published','true') <> 'false'
  ),'[]'::jsonb),true);

  raw := jsonb_set(raw,'{team}',coalesce((
    select jsonb_agg(v order by case when coalesce(v->>'sortOrder','') ~ '^[0-9]+$' then (v->>'sortOrder')::int else 9999 end)
    from jsonb_array_elements(coalesce(raw->'team','[]'::jsonb)) v
    where coalesce(v->>'published','true')='true'
  ),'[]'::jsonb),true);

  -- Never expose the creator's protected admin-only identity object through a
  -- public content read. The public footer uses the same static credit in the
  -- frontend and the protected value is retained for administrator backups.
  raw := raw - 'creator';
  return raw;
end;
$$;

revoke all on function public.jyc_read_site_data() from public;
grant execute on function public.jyc_read_site_data() to anon, authenticated;

-- jyc_site_data is now readable directly only by active administrators.
drop policy if exists "Public can read published site data" on public.jyc_site_data;
drop policy if exists "Public can read site data" on public.jyc_site_data;
drop policy if exists "Admins can read site data" on public.jyc_site_data;
create policy "Admins can read site data" on public.jyc_site_data
for select to authenticated
using (exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));

-- Account-linked registrations.
alter table public.jyc_event_registrations
  add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.jyc_event_registrations
  add column if not exists registration_status text not null default 'registered';
alter table public.jyc_event_registrations
  add column if not exists updated_at timestamptz not null default now();
create index if not exists jyc_event_registrations_user_idx
  on public.jyc_event_registrations(user_id,created_at desc);

-- Remove the old permissive policies before replacing them.
drop policy if exists "public register event" on public.jyc_event_registrations;
drop policy if exists "admins read registrations" on public.jyc_event_registrations;
drop policy if exists "users read own registrations" on public.jyc_event_registrations;
drop policy if exists "users update own registrations" on public.jyc_event_registrations;
drop policy if exists "users delete own registrations" on public.jyc_event_registrations;

create policy "public register published native event" on public.jyc_event_registrations
for insert to anon, authenticated
with check (
  (user_id is null or user_id=auth.uid())
  and exists(
    select 1
    from public.jyc_site_data s,
         jsonb_array_elements(coalesce(s.data->'events','[]'::jsonb)) ev
    where s.id='main'
      and ev->>'id'=event_id
      and coalesce(ev->>'published','false')='true'
      and coalesce(ev->>'archived','false') <> 'true'
      and coalesce(ev->>'registrationMode','external')='native'
  )
);

create policy "users read own registrations" on public.jyc_event_registrations
for select to authenticated
using (user_id=auth.uid());

create policy "users update own registrations" on public.jyc_event_registrations
for update to authenticated
using (user_id=auth.uid())
with check (user_id=auth.uid());

create policy "users delete own registrations" on public.jyc_event_registrations
for delete to authenticated
using (user_id=auth.uid());

create policy "admins read registrations" on public.jyc_event_registrations
for select to authenticated
using (
  public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin')
  or (
    public.jyc_v2_role()='club_admin'
    and exists(
      select 1
      from public.jyc_admins a,
           public.jyc_site_data s,
           jsonb_array_elements(coalesce(s.data->'events','[]'::jsonb)) ev
      where a.user_id=auth.uid()
        and a.is_active=true
        and ev->>'id'=event_id
        and ev->>'clubId'=a.club_id::text
    )
  )
);

-- Keep registration status updates under the same role boundary.
create policy "admins update registrations" on public.jyc_event_registrations
for update to authenticated
using (
  public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin')
  or (
    public.jyc_v2_role()='club_admin'
    and exists(
      select 1 from public.jyc_admins a, public.jyc_site_data s,
        jsonb_array_elements(coalesce(s.data->'events','[]'::jsonb)) ev
      where a.user_id=auth.uid() and a.is_active=true
        and ev->>'id'=event_id and ev->>'clubId'=a.club_id::text
    )
  )
)
with check (
  public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin')
  or (
    public.jyc_v2_role()='club_admin'
    and exists(
      select 1 from public.jyc_admins a, public.jyc_site_data s,
        jsonb_array_elements(coalesce(s.data->'events','[]'::jsonb)) ev
      where a.user_id=auth.uid() and a.is_active=true
        and ev->>'id'=event_id and ev->>'clubId'=a.club_id::text
    )
  )
);


-- Registration integrity: non-admin users may only cancel their own registration.
create or replace function public.jyc_protect_registration_update()
returns trigger
language plpgsql
security invoker
set search_path=public
as $$
begin
  if auth.uid() = old.user_id and not (public.jyc_v2_role() in ('super_admin','jyc_super_admin','jyc_admin','events_admin')) then
    if new.event_id <> old.event_id
       or coalesce(new.user_id::text,'') <> coalesce(old.user_id::text,'')
       or new.name <> old.name
       or lower(new.email) <> lower(old.email)
       or coalesce(new.enrollment_no,'') <> coalesce(old.enrollment_no,'')
       or coalesce(new.phone,'') <> coalesce(old.phone,'')
       or coalesce(new.year,'') <> coalesce(old.year,'')
       or coalesce(new.branch,'') <> coalesce(old.branch,'')
       or coalesce(new.responses,'{}'::jsonb) <> coalesce(old.responses,'{}'::jsonb)
       or new.registration_status <> 'cancelled' then
      raise exception 'You may only cancel your own registration';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists jyc_protect_registration_update on public.jyc_event_registrations;
create trigger jyc_protect_registration_update
before update on public.jyc_event_registrations
for each row execute function public.jyc_protect_registration_update();

-- Native-event capacity/waitlist handling. The trigger derives the initial status server-side.
create or replace function public.jyc_assign_registration_status()
returns trigger
language plpgsql
security invoker
set search_path=public
as $$
declare
  ev jsonb;
  cap integer;
  use_waitlist boolean;
  current_count integer;
begin
  if coalesce(new.registration_status,'') = 'cancelled' then return new; end if;
  select x into ev
  from public.jyc_site_data s,
       jsonb_array_elements(coalesce(s.data->'events','[]'::jsonb)) x
  where s.id='main' and x->>'id'=new.event_id
    and coalesce(x->>'registrationMode','external')='native'
  limit 1;
  if ev is null then return new; end if;
  cap:=nullif(ev->>'capacity','')::integer;
  use_waitlist:=coalesce((ev->>'waitlist')::boolean,false);
  if cap is null or cap <= 0 then new.registration_status:='registered'; return new; end if;
  select count(*) into current_count
  from public.jyc_event_registrations r
  where r.event_id=new.event_id and r.registration_status in ('registered','confirmed');
  if current_count >= cap then
    if use_waitlist then new.registration_status:='waitlisted';
    else raise exception 'This event has reached capacity'; end if;
  else
    new.registration_status:='registered';
  end if;
  return new;
end;
$$;
drop trigger if exists jyc_assign_registration_status on public.jyc_event_registrations;
create trigger jyc_assign_registration_status
before insert on public.jyc_event_registrations
for each row execute function public.jyc_assign_registration_status();

-- Keep timestamps fresh when an account changes its registration status.
create or replace function public.jyc_touch_registration()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  new.updated_at=now();
  return new;
end;
$$;
drop trigger if exists jyc_touch_registration on public.jyc_event_registrations;
create trigger jyc_touch_registration
before update on public.jyc_event_registrations
for each row execute function public.jyc_touch_registration();

select 'JYC V5 production hardening complete.' as result;



-- ================================================================
-- SOURCE: supabase/contact-and-project-submissions.sql
-- ================================================================
create table if not exists public.jyc_contact_submissions(
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(trim(name)) between 2 and 120),
  email text not null check (char_length(trim(email)) between 5 and 320), message text not null check (char_length(trim(message)) between 5 and 5000),
  source text not null default 'public-contact', status text not null default 'new' check (status in ('new','read','resolved','spam')),
  created_at timestamptz not null default now(), reviewed_at timestamptz, reviewed_by uuid references auth.users(id) on delete set null
);
alter table public.jyc_contact_submissions enable row level security;
drop policy if exists "Public can submit contact messages" on public.jyc_contact_submissions;
-- Public contact writes are accepted only through the public-submission Edge Function.
revoke insert on public.jyc_contact_submissions from anon, authenticated;
drop policy if exists "Admins can read contact messages" on public.jyc_contact_submissions;
create policy "Admins can read contact messages" on public.jyc_contact_submissions for select to authenticated using (exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));
drop policy if exists "Admins can update contact messages" on public.jyc_contact_submissions;
create policy "Admins can update contact messages" on public.jyc_contact_submissions for update to authenticated using (exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true)) with check (exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));
create index if not exists jyc_contact_submissions_created_idx on public.jyc_contact_submissions(created_at desc);

create table if not exists public.jyc_project_submissions(
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(trim(name)) between 2 and 160), description text not null check (char_length(trim(description)) between 10 and 5000),
  link text check (link is null or link ~* '^https?://'), submitter_name text not null check (char_length(trim(submitter_name)) between 2 and 120), submitter_email text not null check (char_length(trim(submitter_email)) between 5 and 320), club_name text,
  status text not null default 'submitted' check (status in ('submitted','under_review','changes_requested','approved','rejected')), created_at timestamptz not null default now(), reviewed_at timestamptz, reviewed_by uuid references auth.users(id) on delete set null
);
alter table public.jyc_project_submissions enable row level security;
drop policy if exists "Public can submit projects" on public.jyc_project_submissions;
drop policy if exists "public submit projects" on public.jyc_project_submissions;
revoke insert on public.jyc_project_submissions from public, anon, authenticated;
-- Public project writes are accepted only through the public-submission Edge Function.
revoke insert on public.jyc_project_submissions from anon, authenticated;
drop policy if exists "Admins can read project submissions" on public.jyc_project_submissions;
create policy "Admins can read project submissions" on public.jyc_project_submissions for select to authenticated using (exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));
drop policy if exists "Admins can update project submissions" on public.jyc_project_submissions;
create policy "Admins can update project submissions" on public.jyc_project_submissions for update to authenticated using (exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true)) with check (exists(select 1 from public.jyc_admins a where a.user_id=auth.uid() and a.is_active=true));
create index if not exists jyc_project_submissions_created_idx on public.jyc_project_submissions(created_at desc);


-- Keep direct public gallery access least-privileged even when this bootstrap is
-- applied to a project whose default grants are broader than the migration baseline.
REVOKE ALL PRIVILEGES ON TABLE public.jyc_gallery_items FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.jyc_media_albums FROM anon;
GRANT SELECT ON TABLE public.jyc_gallery_items TO anon;
GRANT SELECT ON TABLE public.jyc_media_albums TO anon;
REVOKE REFERENCES, TRIGGER ON TABLE public.jyc_gallery_items FROM authenticated;
REVOKE REFERENCES, TRIGGER ON TABLE public.jyc_media_albums FROM authenticated;
