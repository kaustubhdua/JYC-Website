import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const main=fs.readFileSync(path.join(root,'src/main.jsx'),'utf8');
const extra=fs.readFileSync(path.join(root,'src/extra-features.jsx'),'utf8');
const importLine=main.split(/\r?\n/).find(line=>line.includes("from './extra-features.jsx'"));
const importMatch=importLine?.match(/import\s*\{([^}]*)\}\s*from\s*['"]\.\/extra-features\.jsx['"]/);
if(!importMatch){console.error('FAIL: extra-features import block not found');process.exit(1)}
const names=importMatch[1].split(',').map(x=>x.trim()).filter(Boolean).map(x=>x.replace(/\s+as\s+\w+$/,''));
const exports=new Set();
for(const m of extra.matchAll(/export\s+(?:async\s+)?(?:function|const|let|var|class)\s+(\w+)/g))exports.add(m[1]);
for(const m of extra.matchAll(/export\s*\{([^}]+)\}/gs))for(const x of m[1].split(',')){const n=x.trim().replace(/\s+as\s+\w+$/,'');if(n)exports.add(n)}
let failed=0;
for(const n of names){const ok=exports.has(n);console.log(`${ok?'PASS':'FAIL'}: extra-features export ${n}`);if(!ok)failed++}
const required=['EventTools','DownloadICS'];
for(const n of required){const ok=exports.has(n);console.log(`${ok?'PASS':'FAIL'}: runtime-critical export ${n}`);if(!ok)failed++}
const source=fs.readFileSync(path.join(root,'src/main.jsx'),'utf8');
const metaOriginOk=extra.includes("export function usePageMeta")&&extra.includes("import.meta.env.VITE_CANONICAL_ORIGIN||'https://jyc-website-eight.vercel.app'")&&!extra.includes("const origin=(import.meta.env.VITE_SITE_URL||window.location.origin)");
console.log((metaOriginOk ? "PASS" : "FAIL")+": usePageMeta resolves a site origin before building canonical/OG URLs");
if(!metaOriginOk)failed++;
const updatesApi=fs.readFileSync(path.join(root,'api/jyc-updates.js'),'utf8');
const updatesResilienceOk=updatesApi.includes('async function dbRead()')&&updatesApi.includes('async function dbWrite(items)')&&updatesApi.includes('}catch{return []}')&&updatesApi.includes('}catch{}');
console.log((updatesResilienceOk ? "PASS" : "FAIL")+": JYC updates API keeps optional persistence failures from becoming 500s");
if(!updatesResilienceOk)failed++;
const authModule=fs.readFileSync(path.join(root,'src/extra-features.jsx'),'utf8');
const authRedirectOk=!authModule.includes("emailRedirectTo:`${window.location.origin}/my-jyc`")&&authModule.includes("emailRedirectTo:`${window.location.origin}/`");
console.log((authRedirectOk ? "PASS" : "FAIL")+": passwordless auth callback avoids retired /my-jyc redirect");
if(!authRedirectOk)failed++;
const nowModule=fs.readFileSync(path.join(root,'src/jyc-now.jsx'),'utf8');
const nowLogoOk=nowModule.includes('/JYC%20Logo(4).png')&&!nowModule.includes('/jyc-logo-official.webp');
console.log((nowLogoOk ? "PASS" : "FAIL")+": JYC Now uses the canonical JYC logo asset");
if(!nowLogoOk)failed++;
const nowNormaliseOk=nowModule.includes('safeExternalUrl(x.url)')&&nowModule.includes('safeExternalUrl(x.image||x.thumbnail||\'\')')&&nowModule.includes('.filter(x=>x.url)');
console.log((nowNormaliseOk ? "PASS" : "FAIL")+": JYC Now drops connector items whose URLs fail external URL validation");
if(!nowNormaliseOk)failed++;
const nativeRegistrationOk=!authModule.includes('className="native-registration"')&&!authModule.includes("supabase.rpc('jyc_register_for_event'")&&authModule.includes('Public native registration is disabled.');
console.log((nativeRegistrationOk ? "PASS" : "FAIL")+": public native registration is removed after RPC revocation");
if(!nativeRegistrationOk)failed++;
const externalRegistrationOk=authModule.includes('Open official registration ↗')&&authModule.includes('safeExternalUrl(event.registrationUrl)')&&authModule.includes('target="_blank" rel="noopener noreferrer"');
console.log((externalRegistrationOk ? "PASS" : "FAIL")+": public external registration links require a safe HTTP(S) URL");
if(!externalRegistrationOk)failed++;

const nowLazyImportOk=nowModule.includes('lazy(') && /import React,\{[^}]*\blazy\b/.test(nowModule);
console.log((nowLazyImportOk ? "PASS" : "FAIL")+": JYC Now lazy React dependency is explicitly imported");
if(!nowLazyImportOk)failed++;
const assistant=fs.readFileSync(path.join(root,'src/jyc-assistant.jsx'),'utf8');
const archiveYearOk=!assistant.includes("year:'2026',sourceLabel:'JYC supplied hub archive'")&&!assistant.includes('year:"2026",sourceLabel:"JYC supplied hub archive"');
console.log((archiveYearOk ? "PASS" : "FAIL")+": source archive assistant entries do not infer a 2026 photograph year");
if(!archiveYearOk)failed++;
const modalA11yOk=extra.includes("export function GalleryItems")&&extra.includes('role="dialog"')&&extra.includes('aria-modal="true"')&&extra.includes("closeRef.current?.focus()")&&extra.includes("e.key==='Tab'");
console.log((modalA11yOk ? "PASS" : "FAIL")+": gallery lightbox keeps keyboard focus inside the modal");
if(!modalA11yOk)failed++;
for(const [label,needle] of [['Fest Mode fallback',':[]'],['Recruitment homepage gate','recruitmentEnabled(data)'],['Contact route',"clean==='/contact'"]]){const ok=source.includes(needle);console.log(`${ok?'PASS':'FAIL'}: ${label}`);if(!ok)failed++}
if(failed)process.exit(1);
console.log('Runtime contract QA complete.');
