import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  const p=path.join(dir,entry.name);
  if(entry.isDirectory() && !['node_modules','.git','dist'].includes(entry.name)) return walk(p);
  return entry.isFile()?[p]:[];
});
const files=[...walk(path.join(root,'src')),...walk(path.join(root,'public')),...walk(path.join(root,'scripts')),path.join(root,'index.html'),path.join(root,'vercel.json')].filter(fs.existsSync);
const findings=[];
const checks=[];
const add=(name,ok,detail='')=>checks.push({name,ok,detail});
const read=p=>fs.readFileSync(p,'utf8');

const secretPatterns=[
  /sb_secret_[A-Za-z0-9_-]{12,}/,
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^\n#]+/i,
  /VITE_[A-Z0-9_]*(SERVICE_ROLE|SECRET|PRIVATE|TOKEN)[A-Z0-9_]*\s*=\s*[^\n#]+/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
];
for(const file of files){
  const text=read(file);
  for(const pattern of secretPatterns) if(pattern.test(text)) findings.push(`${path.relative(root,file)} matches ${pattern}`);
}
add('No browser-shipped secret key patterns',findings.length===0,findings.join('; '));
const supabase=read(path.join(root,'src/lib/supabase.js'));
add('Frontend Supabase client uses publishable key only',supabase.includes('VITE_SUPABASE_PUBLISHABLE_KEY')&&!/SERVICE_ROLE|sb_secret_/i.test(supabase));
const vercel=JSON.parse(read(path.join(root,'vercel.json')));
const headers=vercel.headers?.find(x=>x.source==='/(.*)')?.headers||[];
const headerMap=new Map(headers.map(x=>[x.key.toLowerCase(),x.value]));
for(const [key,value] of [['x-content-type-options','nosniff'],['x-frame-options','DENY'],['referrer-policy','strict-origin-when-cross-origin'],['strict-transport-security','max-age=31536000; includeSubDomains; preload'],['content-security-policy','default-src']]){
  add(`Security header ${key}`,String(headerMap.get(key)||'').includes(value),String(headerMap.get(key)||''));
}
add('CSP blocks inline script attributes',String(headerMap.get('content-security-policy')||'').includes("script-src-attr 'none'"));
add('CSP has frame-ancestors protection',String(headerMap.get('content-security-policy')||'').includes("frame-ancestors 'none'"));
add('Service worker only caches same-origin runtime assets',/new URL\(request\.url\)\.origin === self\.location\.origin/.test(read(path.join(root,'public/sw.js'))));
add('Service worker never caches same-origin API responses',read(path.join(root,'public/sw.js')).includes("pathname.startsWith('/api/')")&&read(path.join(root,'public/sw.js')).includes('event.respondWith(fetch(request)'));
add('Public JSON CMS table is not directly readable',!read(path.join(root,'supabase/PRODUCTION-BOOTSTRAP-ALL.sql')).includes('create policy "Public can read published site data"') && read(path.join(root,'supabase/PRODUCTION-BOOTSTRAP-ALL.sql')).includes('create policy "Admins can read site data"'));
add('JSON-LD is escaped against script-breakout',/JSON\.stringify\(\{\'@context\':\'https:\/\/schema\.org\'/.test(read(path.join(root,'src/extra-features.jsx'))) && /replace\(\/</.test(read(path.join(root,'src/extra-features.jsx'))));
add('No raw innerHTML usage',!files.some(file=>/\.jsx?$/.test(file)&&/\.innerHTML\s*=/.test(read(file))));
if(checks.some(x=>!x.ok)){for(const c of checks)console.log(`${c.ok?'PASS':'FAIL'}: ${c.name}${c.detail?` — ${c.detail}`:''}`);process.exit(1)}
for(const c of checks)console.log(`PASS: ${c.name}${c.detail?` — ${c.detail}`:''}`);
console.log(`SECURITY QA PASS (${checks.length} checks)`);
