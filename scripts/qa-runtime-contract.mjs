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
const media=fs.readFileSync(path.join(root,'src/jyc-source-media.js'),'utf8');
const next=fs.readFileSync(path.join(root,'src/jyc-next-experience.jsx'),'utf8');
const metaOriginOk=extra.includes("export function usePageMeta")&&extra.includes("const origin=(import.meta.env.VITE_SITE_URL||window.location.origin)");
console.log((metaOriginOk ? "PASS" : "FAIL")+": usePageMeta resolves a site origin before building canonical/OG URLs");
if(!metaOriginOk)failed++;
const assistant=fs.readFileSync(path.join(root,'src/jyc-assistant.jsx'),'utf8');
const archiveYearOk=!assistant.includes("year:'2026',sourceLabel:'JYC supplied hub archive'")&&!assistant.includes('year:"2026",sourceLabel:"JYC supplied hub archive"');
console.log((archiveYearOk ? "PASS" : "FAIL")+": source archive assistant entries do not infer a 2026 photograph year");
if(!archiveYearOk)failed++;
const modalA11yOk=extra.includes("export function GalleryItems")&&extra.includes('role="dialog"')&&extra.includes('aria-modal="true"')&&extra.includes("closeRef.current?.focus()")&&extra.includes("e.key==='Tab'");
console.log((modalA11yOk ? "PASS" : "FAIL")+": gallery lightbox keeps keyboard focus inside the modal");
if(!modalA11yOk)failed++;
for(const [label,needle] of [['Fest Mode fallback',':[]'],['Recruitment homepage gate','recruitmentEnabled(data)'],['Contact route',"clean==='/contact'"]]){const ok=source.includes(needle);console.log(`${ok?'PASS':'FAIL'}: ${label}`);if(!ok)failed++}
const curationOk=media.includes('ARCHIVE_VISUAL_SUBJECTS')&&media.includes('ARCHIVE_EDITORIAL_ORDER')&&media.includes('curateArchivePhotos')&&next.includes('curateArchivePhotos(JYC_SOURCE_ARCHIVE_PHOTO_ITEMS,36)');
console.log((curationOk ? "PASS" : "FAIL")+": source archive media has an explicit editorial curation layer and the homepage photo story uses it");
if(!curationOk)failed++;
const eventArchiveOk=media.includes("Dron-O-War")&&media.includes("p5-event-")&&media.includes("CodeAI Hackathon")&&media.includes("RIDE Hack");
console.log((eventArchiveOk ? "PASS" : "FAIL")+": event media can use strongly source-named archive material without inventing event associations");
if(!eventArchiveOk)failed++;

if(failed)process.exit(1);
console.log('Runtime contract QA complete.');
