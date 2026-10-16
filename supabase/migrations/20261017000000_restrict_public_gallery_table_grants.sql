-- Least privilege for public gallery access.
-- RLS policies already restrict anonymous reads to approved gallery items and published albums.
-- Anonymous callers must not receive table-level write/schema-management grants.
REVOKE ALL PRIVILEGES ON TABLE public.jyc_gallery_items FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.jyc_media_albums FROM anon;
GRANT SELECT ON TABLE public.jyc_gallery_items TO anon;
GRANT SELECT ON TABLE public.jyc_media_albums TO anon;

-- Authenticated gallery administrators still rely on CRUD privileges plus the existing RLS policies.
-- REFERENCES and TRIGGER are DDL capabilities and are not needed by the public app/admin UI.
REVOKE REFERENCES, TRIGGER ON TABLE public.jyc_gallery_items FROM authenticated;
REVOKE REFERENCES, TRIGGER ON TABLE public.jyc_media_albums FROM authenticated;
