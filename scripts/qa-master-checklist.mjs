import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const main=read('src/main.jsx');
const home=read('src/jyc-editorial-home.jsx');
const homeCss=read('src/jyc-editorial-home.css');
const spotlight=read('src/jyc-spotlight.jsx');
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
add('JYC ecosystem spotlight is mounted on the editorial homepage',home.includes("import { JYCSpotlight } from './jyc-spotlight.jsx';")&&home.includes('<JYCSpotlight data={data} />')&&spotlight.includes('JYC')&&spotlight.includes('EVENTS'));
add('homepage activity discovery uses lazy magnetic Bento with router navigation',home.includes('LazyMagicBento')&&home.includes('enableMagnetism={true}')&&read('src/components/react-bits/MagicBento.jsx').includes('onNavigate?onNavigate(item.href)'));
add('official JYC hero logo uses the lazy React Bits Dither Veil with static fallback',home.includes('LazyDitherVeil')&&home.includes('jh-dither-mark')&&home.includes('const DITHER_SOURCE = import.meta.env.PROD ?')&&home.includes('const DITHER_SRCSET = import.meta.env.PROD ?')&&home.includes('srcSet={DITHER_SRCSET}')&&home.includes('src={DITHER_SOURCE}')&&home.includes('fallbackSrc={FALLBACK}')&&!home.includes('LazyDriftWall'));
add('hero uses the approved JYC red and warm-gold palette without neon cyan',homeCss.includes('--jh-accent: #A82420')&&homeCss.includes('--jh-line-accent: rgba(191, 156, 111, 0.42)')&&!homeCss.includes('#38bdf8')&&!homeCss.includes('rgba(56, 189, 248'));
add('reduced motion is covered',networkCss.includes('prefers-reduced-motion')&&homeCss.includes('prefers-reduced-motion'));
add('production media boundary is configured',vite.includes('sourceArchivePruner')&&vite.includes('production-media-boundary.json'));
add('image dimension manifest is part of the build',read('package.json').includes('generate-image-manifest.mjs')&&fs.existsSync(path.join(root,'scripts/generate-image-manifest.mjs')));
add('no student-utility public scope regression',!home.includes('My JYC')&&!home.includes('academic timetable')&&!home.includes('attendance dashboard'));
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS ':'FAIL ')+name);if(!ok)failed++;}
if(failed){console.error('\nMASTER CHECKLIST FAILED: '+failed+' code-level contract(s).');process.exit(1);}
console.log('\nMASTER CHECKLIST CODE CONTRACT PASSED');
console.log('External release gates intentionally remain outside static QA: Supabase Auth leaked-password protection, rights/editorial approval, Vercel deployment verification/quota, CI execution, and real image-variant generation.');
