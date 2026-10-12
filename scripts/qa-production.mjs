import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const checks=[];
const pass=(label)=>{checks.push([true,label]);console.log(`PASS: ${label}`)};
const fail=(label)=>{checks.push([false,label]);console.error(`FAIL: ${label}`)};

const vercel=read('vercel.json');
const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
const main=read('src/main.jsx');
const publicEntry=read('src/styles/public-entry.css');
if(/https:\/\/[^*\s]+\.supabase\.co/.test(vercel)) fail('Vercel CSP does not hard-code a single Supabase project'); else pass('Vercel CSP is deployable across Supabase projects');
if(vercel.includes('X-Content-Type-Options')&&vercel.includes('X-Frame-Options')&&vercel.includes('Referrer-Policy')) pass('Baseline security headers present'); else fail('Baseline security headers incomplete');
if(vercel.includes('Strict-Transport-Security')) pass('HSTS header present'); else fail('HSTS header missing');
const robots=read('public/robots.txt');
const configuredSite=(process.env.VITE_CANONICAL_ORIGIN||'https://jyc-website-eight.vercel.app').trim();
const siteOrigin=(()=>{try{const candidate=/^[a-z][a-z\d+.-]*:\/\//i.test(configuredSite)?configuredSite:`https://${configuredSite}`;const parsed=new URL(candidate);if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password)throw new Error('Invalid site URL');return parsed.origin}catch{throw new Error('VITE_CANONICAL_ORIGIN must be a valid HTTP(S) origin')}})();
const sitemap=path.join(root,'public','sitemap.xml');
if(fs.existsSync(sitemap)){
  const sitemapText=read('public/sitemap.xml');
  if(sitemapText.includes('<loc>'+siteOrigin+'/</loc>')&&!sitemapText.includes('example.com')) pass('Generated sitemap uses the configured production origin');
  else fail('Generated sitemap contains a stale or placeholder production origin');
}else pass('Sitemap will be generated during the production build');
const sitemapLine=robots.split(/\r?\n/).map(line=>line.trim()).find(line=>/^Sitemap:/i.test(line));
let robotsSitemapMatches=false;
if(sitemapLine){try{const sitemapUrl=new URL(sitemapLine.slice(sitemapLine.indexOf(':')+1).trim());robotsSitemapMatches=['http:','https:'].includes(sitemapUrl.protocol)&&sitemapUrl.origin===siteOrigin&&sitemapUrl.pathname==='/sitemap.xml'&&!sitemapUrl.search&&!sitemapUrl.hash&&!sitemapUrl.username&&!sitemapUrl.password}catch{robotsSitemapMatches=false}}
if(!sitemapLine||robotsSitemapMatches) pass('Robots sitemap is absent or matches the configured production origin'); else fail('Robots file points at a stale or malformed sitemap URL');
const env=read('.env.example');
if(env.includes('VITE_CANONICAL_ORIGIN=')) pass('Runtime and generated metadata share an explicit canonical origin'); else fail('Canonical origin variables are missing from .env.example');
if(read('src/main.jsx').includes('unknownRoute')&&read('src/main.jsx').includes('noindex:privateRoute||unknownRoute')) pass('Unknown SPA routes are marked noindex'); else fail('Unknown SPA routes can be indexed');
if(read('src/extra-features.jsx').includes("if(item.date&&item.end)eventGraph.endDate")) pass('Event schema does not invent an end time'); else fail('Event schema end time fallback remains');
const ai=read('supabase/functions/ai-content-assist/index.ts');
const adminFn=read('supabase/functions/admin-management/index.ts');
const contactSql=read('supabase/contact-and-project-submissions.sql');
const lockPackage=lock.packages?.['']||{};
if(pkg.version!==lock.version||pkg.version!==lockPackage.version||lockPackage.engines?.node!==pkg.engines?.node) fail('Release metadata and lockfile engine are out of sync'); else pass('Release metadata and lockfile engine are synchronized');
if((main.match(/import '\.\/styles\/public-entry\.css';/g)||[]).length!==1 || (publicEntry.match(/@import ['\"]\.\/public-system\.css['\"];?/g)||[]).length!==1) fail('Consolidated public stylesheet entry must be imported exactly once and include the public system once'); else pass('Consolidated public stylesheet entry is unique');
if(main.includes("functions.invoke('public-submission'")&&main.includes("type:'contact'")) pass('Contact form uses the guarded persistent submission target'); else fail('Contact form has no guarded persistent submission target');
if(contactSql.includes('alter table public.jyc_contact_submissions enable row level security')&&contactSql.includes('Admins can read contact messages')) pass('Contact inbox has RLS and admin-only reads'); else fail('Contact inbox security policy incomplete');
if(contactSql.includes('public.jyc_project_submissions')&&contactSql.includes('Admins can update project submissions')) pass('Project submission inbox schema and RLS are present'); else fail('Project submission schema/security incomplete');
if(ai.includes("gpt-6-luna")) pass('AI content assistant uses a current configured model default'); else fail('AI content assistant model default is stale');
if(ai.includes('if(!allowedOrigin(origin))')&&ai.includes('jyc_allow_ai_request')&&ai.includes('contentLength>24000')&&ai.includes('store:false')&&ai.includes('json_schema')) pass('AI content assistant has origin, size, distributed rate and structured-output guards'); else fail('AI content assistant request guards are incomplete');
if(adminFn.includes("Deno.env.get('SITE_ORIGINS')") && !/https?:\/\/jycjiit\.vercel\.app(?=\/|[\s'\")]|$)/i.test(adminFn)) pass('Admin edge function uses deploy-time origin configuration'); else fail('Admin edge function still hard-codes a legacy production origin');

const failed=checks.filter(x=>!x[0]);
if(failed.length){process.exitCode=1;console.error(`Production preflight failed: ${failed.length} check(s)`)}else console.log(`Production preflight complete: ${checks.length} checks passed`);
