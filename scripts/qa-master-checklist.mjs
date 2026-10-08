import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const main=read('src/main.jsx');
const home=read('src/jyc-editorial-home.jsx');
const homeCss=read('src/jyc-editorial-home.css');
const network=read('src/jyc-network.jsx');
const networkCss=read('src/jyc-network.css');
const gallery=read('src/jyc57-experience.jsx');
const vite=read('vite.config.js');
const checks=[];
const add=(name,ok)=>checks.push([name,Boolean(ok)]);
add('release is V64.0.0 or newer',Number(String(pkg.version).split('.')[0])>=64);
add('core public routes are wired', ['/','/about','/clubs','/events','/gallery','/team','/contact'].every(r=>main.includes("'" + r + "'")||main.includes('"' + r + '"')));
add('hub and event detail routes remain canonical',main.includes("/clubs/")&&main.includes("/events/")&&main.includes('eventPath'));
add('gallery album/deep-link experience exists',gallery.includes('/gallery/')&&gallery.includes('ArrowRight')&&gallery.includes('ArrowLeft'));
add('strict photo pool is used',gallery.includes('JYC_SOURCE_ARCHIVE_PHOTO_ITEMS'));
add('JYC network signature interaction is mounted',home.includes("./jyc-network.jsx")&&home.includes('<JYCNetwork />')&&network.includes('JYC')&&network.includes('EVENTS'));
add('legacy decorative dither is not mounted',!home.includes('LazyDitherVeil')&&!home.includes('<LazyDitherVeil'));
add('red hero palette is removed',!homeCss.includes('#a82420')&&!homeCss.includes('168,36,32'));
add('reduced motion is covered',networkCss.includes('prefers-reduced-motion')&&homeCss.includes('prefers-reduced-motion'));
add('production media boundary is configured',vite.includes('sourceArchivePruner')&&vite.includes('production-media-boundary.json'));
add('image dimension manifest is part of the build',read('package.json').includes('generate-image-manifest.mjs')&&fs.existsSync(path.join(root,'scripts/generate-image-manifest.mjs')));
add('no student-utility public scope regression',!home.includes('My JYC')&&!home.includes('academic timetable')&&!home.includes('attendance dashboard'));
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS ':'FAIL ')+name);if(!ok)failed++;}
if(failed){console.error('\nMASTER CHECKLIST FAILED: '+failed+' code-level contract(s).');process.exit(1);}
console.log('\nMASTER CHECKLIST CODE CONTRACT PASSED');
console.log('External release gates intentionally remain outside static QA: Supabase Auth leaked-password protection, rights/editorial approval, Vercel deployment verification/quota, CI execution, and real image-variant generation.');
