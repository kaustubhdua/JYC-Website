-- Least privilege for public gallery access.
-- Anonymous access must pass the same media readiness gate as the public read RPC.
-- The 2026-10-16 production audit found 52 approved-status items whose rights
-- are still under review and whose focal points are unset; they must not be
-- exposed through direct PostgREST table reads.
DROP POLICY IF EXISTS "public read approved gallery" ON public.jyc_gallery_items;
CREATE POLICY "public read approved gallery"
  ON public.jyc_gallery_items
  FOR SELECT
  TO anon, authenticated
  USING (
    status = 'approved'
    AND media_kind = 'photo'
    AND rights_status = 'cleared'
    AND focal_x IS NOT NULL
    AND focal_y IS NOT NULL
    AND NULLIF(public_url, '') IS NOT NULL
  );

-- RLS policies already restrict anonymous album reads to published albums.
-- Anonymous callers must not receive table-level write/schema-management grants.
REVOKE ALL PRIVILEGES ON TABLE public.jyc_gallery_items FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.jyc_media_albums FROM anon;
GRANT SELECT ON TABLE public.jyc_gallery_items TO anon;
GRANT SELECT ON TABLE public.jyc_media_albums TO anon;

-- Authenticated gallery administrators still rely on CRUD privileges plus the existing RLS policies.
-- REFERENCES and TRIGGER are DDL capabilities and are not needed by the public app/admin UI.
REVOKE REFERENCES, TRIGGER ON TABLE public.jyc_gallery_items FROM authenticated;
REVOKE REFERENCES, TRIGGER ON TABLE public.jyc_media_albums FROM authenticated;
