-- Public project submissions must pass through the rate-limited server-side Edge Function.
-- The Edge Function validates fields and calls jyc_allow_public_submission before using service-role access.
 DROP POLICY IF EXISTS "public submit projects" ON public.jyc_project_submissions;
 DROP POLICY IF EXISTS "Public can submit projects" ON public.jyc_project_submissions;
 REVOKE INSERT ON TABLE public.jyc_project_submissions FROM PUBLIC, anon, authenticated;
