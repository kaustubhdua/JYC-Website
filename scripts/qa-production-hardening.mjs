import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const failures=[];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

const migrationsDir=path.join(root,'supabase','migrations');
if(!fs.existsSync(migrationsDir)) failures.push('supabase/migrations directory is missing');
const migrations=fs.existsSync(migrationsDir)?fs.readdirSync(migrationsDir).filter(x=>/^\d{12}_[a-z0-9_-]+\.sql$/.test(x)).sort():[];
if(!migrations.includes('202610030001_production_hardening.sql')) failures.push('production hardening migration is missing');
if(!migrations.includes('202610030002_ai_hardening.sql')) failures.push('AI hardening migration is missing');
if(!migrations.includes('202610030003_campus_verification.sql')) failures.push('campus verification migration is missing');
if(!migrations.includes('202610030004_media_write_boundary.sql')) failures.push('media write-boundary migration is missing');
if(!migrations.includes('202610030007_verification_trust_contract.sql')) failures.push('verification trust-contract migration is missing');
if(!migrations.includes('202610030008_verification_identity_audit.sql')) failures.push('verification identity-audit migration is missing');
if(!migrations.includes('202610030009_public_submission_guard.sql')) failures.push('public submission abuse-guard migration is missing');
if(!migrations.includes('202610030005_publication_verification_guard.sql')) failures.push('publication verification guard migration is missing');
if(!migrations.includes('202610030006_publication_guard_insert_fix.sql')) failures.push('publication guard insert-fix migration is missing');
if(!migrations.includes('202610030003_campus_verification.sql')) failures.push('campus verification migration is missing');
if(!migrations.includes('202610030004_media_write_boundary.sql')) failures.push('media write-boundary migration is missing');

const hardening=read('supabase/migrations/202610030001_production_hardening.sql');
for(const needle of [
  'revoke insert, update, delete on public.jyc_site_data from anon, authenticated;',
  "'jyc-backups',\n  'jyc-backups',\n  false",
  'jyc_ingest_error_report',
  'jyc_registration_rate_limits',
  'revoke insert, delete on public.jyc_event_registrations from anon, authenticated;'
]) if(!hardening.includes(needle)) failures.push('hardening migration missing: '+needle);

const ai=read('supabase/functions/ai-content-assist/index.ts');
if(!ai.includes("jyc_allow_ai_request")) failures.push('AI function is not using distributed rate limiting');
if(!ai.includes("store:false")) failures.push('AI Responses request must disable response storage');
if(!ai.includes("json_schema")) failures.push('AI Responses request must use a structured JSON schema');

const backup=read('supabase/functions/backup-site-data/index.ts');
if(!backup.includes("from('jyc-backups')")) failures.push('backup function is not using private jyc-backups bucket');
for(const fn of ['supabase/functions/admin-management/index.ts','supabase/functions/send-notification/index.ts','supabase/functions/ai-content-assist/index.ts']) {
  const source=read(fn);
  if(/https?:\/\/(?:jycjiit\.vercel\.app|jyc-website-livid\.vercel\.app)(?=\/|[\s'\")]|$)/i.test(source)) failures.push(fn+' still contains a legacy Vercel origin');
}

const config=read('supabase/config.toml');
if(!config.includes('[functions.error-report]')||!config.includes('verify_jwt = false')) failures.push('public error-report Edge Function is not configured');
const errorReport=read('supabase/functions/error-report/index.ts');
if(!errorReport.includes("const originAllowed=origin &&")||!errorReport.includes("new TextEncoder().encode(raw).byteLength>18000")) failures.push('error-report must reject untrusted origins and oversized bodies before parsing');
const adminManagement=read('supabase/functions/admin-management/index.ts');
if(!adminManagement.includes("new TextEncoder().encode(raw).byteLength > 20000")) failures.push('admin-management must bound the raw request body before JSON parsing');
const grants=read('supabase/migrations/202610040020_revoke_api_truncate_privileges.sql');
if(!grants.includes('revoke truncate on all tables in schema public from anon, authenticated')||!grants.includes('revoke truncate on all tables in schema storage from anon, authenticated')) failures.push('browser TRUNCATE privileges must be revoked from public and storage tables');
const internalRateLimits=read('supabase/migrations/202610040021_revoke_internal_rate_limit_api_access.sql');
if(!internalRateLimits.includes('revoke all on table public.jyc_ai_rate_limits, public.jyc_error_rate_limits, public.jyc_public_submission_rate_limits, public.jyc_registration_rate_limits from anon, authenticated')) failures.push('internal rate-limit tables must not be exposed to API roles');

const main=read('src/main.jsx');
const project=read('src/v14-final-platform.jsx');
if(main.includes("from('jyc_error_reports').insert")) failures.push('browser still writes directly to jyc_error_reports');
if(main.includes("from('jyc_contact_submissions').insert")||project.includes("from('jyc_project_submissions').insert")) failures.push('browser still writes directly to public submission tables');
if(!main.includes("functions.invoke('public-submission'")||!project.includes("functions.invoke('public-submission'")) failures.push('public submission flows do not use the guarded Edge Function');
const configText=read('supabase/config.toml');
if(!configText.includes('[functions.public-submission]')||!configText.includes('verify_jwt = false')) failures.push('public-submission Edge Function is not configured');
if(!main.includes("functions.invoke('error-report'")) failures.push('browser error reporting does not use the Edge Function');

const vercel=JSON.parse(read('vercel.json'));
const headers=vercel.headers||[];
const asset= headers.find(x=>x.source==='/assets/:path*')?.headers||[];
const assetMap=new Map(asset.map(x=>[x.key.toLowerCase(),x.value]));
if(!String(assetMap.get('cache-control')||'').includes('immutable')) failures.push('hashed assets do not have immutable caching');

if(failures.length){
  console.error('PRODUCTION HARDENING QA FAIL');
  for(const f of failures) { console.error('FAIL:',f); console.error(`::error file=scripts/qa-production-hardening.mjs::${f}`); }
  process.exit(1);
}
console.log('PRODUCTION HARDENING QA PASS');
console.log(`Checked ${migrations.length} migration(s), security boundaries, Edge Functions, frontend telemetry path and asset caching.`);
