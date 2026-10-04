begin;

select plan(14);

select ok(not has_table_privilege('anon','public.jyc_site_data','INSERT'),'anon cannot insert into jyc_site_data');
select ok(not has_table_privilege('authenticated','public.jyc_site_data','INSERT'),'authenticated cannot insert into jyc_site_data');
select ok(not has_table_privilege('authenticated','public.jyc_site_data','UPDATE'),'authenticated cannot update jyc_site_data directly');
select ok(not has_table_privilege('authenticated','public.jyc_site_data','DELETE'),'authenticated cannot delete jyc_site_data directly');
select ok(has_function_privilege('authenticated','public.jyc_save_site_data(jsonb,text,text,text)','EXECUTE'),'authenticated can execute the authorization-aware site-data write RPC');
select ok(not has_function_privilege('anon','public.jyc_save_site_data(jsonb,text,text,text)','EXECUTE'),'anon cannot execute the site-data write RPC');
select ok(not has_table_privilege('anon','public.jyc_event_registrations','INSERT'),'anon cannot insert registrations directly');
select ok(not has_table_privilege('authenticated','public.jyc_event_registrations','INSERT'),'authenticated cannot insert registrations directly');
select ok(has_table_privilege('authenticated','public.jyc_event_registrations','UPDATE'),'authenticated retains the status-update privilege required by My JYC');
select ok(not has_table_privilege('anon','storage.objects','INSERT'),'anon cannot upload directly to Storage');
select ok(not has_table_privilege('authenticated','storage.objects','INSERT'),'authenticated cannot upload directly to Storage');
select ok((select relrowsecurity from pg_class where oid='public.jyc_campuses'::regclass),'campus registry has RLS enabled');
select ok((select relrowsecurity from pg_class where oid='public.jyc_content_verification'::regclass),'content verification has RLS enabled');
select ok(not has_table_privilege('anon','public.jyc_admins','TRUNCATE'),'anon cannot truncate JYC admin records');
select ok(not has_table_privilege('authenticated','public.jyc_site_data','TRUNCATE'),'authenticated cannot truncate site data');

select * from finish();
rollback;
