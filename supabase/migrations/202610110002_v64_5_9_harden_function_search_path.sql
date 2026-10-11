begin;

-- These SECURITY DEFINER helpers are part of the public website's controlled
-- read/write path. Keep their existing authorization logic and grants, but pin
-- resolution to trusted schemas so callers cannot influence object lookup.
-- Supabase defaults deny CREATE on public/auth to anon and authenticated; pg_temp
-- is deliberately last.
alter function public.jyc_read_site_data()
  set search_path = pg_catalog, public, auth, extensions, pg_temp;

alter function public.jyc_save_site_data(jsonb)
  set search_path = pg_catalog, public, auth, extensions, pg_temp;

alter function public.is_jyc_admin()
  set search_path = pg_catalog, public, auth, extensions, pg_temp;

alter function public.is_club_admin()
  set search_path = pg_catalog, public, auth, extensions, pg_temp;

alter function public.is_super_admin()
  set search_path = pg_catalog, public, auth, extensions, pg_temp;

alter function public.jyc_v2_role()
  set search_path = pg_catalog, public, auth, extensions, pg_temp;

alter function public.jyc_v2_club()
  set search_path = pg_catalog, public, auth, extensions, pg_temp;

commit;
