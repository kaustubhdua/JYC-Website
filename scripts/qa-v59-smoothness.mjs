import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const home=read('src/jyc-editorial-home.jsx');
const extra=read('src/extra-features.jsx');
const admin=read('src/admin-chunk.jsx');
const packageJson=JSON.parse(read('package.json'));
const checks=[
  ['homepage keeps only purposeful React Bits surfaces',home.includes('LazyDitherVeil')&&home.includes('LazyMagicBento')&&!home.includes('LazyDriftWall')&&!home.includes('<PhotoChapters')],
  ['homepage no longer carries the unused visual archive model',!home.includes('visualArchive')],
  ['homepage selects a real-photo hero before fallback media',home.includes('photoGallery')&&home.includes('heroPhoto=photoGallery[0]||gallery[0]||null')],
  ['homepage filters upcoming events by end time',home.includes('eventEndMs')&&home.includes('end>=now')&&home.includes('events.filter')],
  ['homepage photo story excludes obvious decorative assets',home.includes('qr|logo|banner|poster|graphic|artwork')],
  ['homepage section numbering is continuous after visual simplification',home.includes('01 / THE ORGANISATION')&&home.includes('02 / FIND YOUR SPACE')&&home.includes('03 / WHAT’S NEXT')&&home.includes('04 / CAMPUS IN MOTION')&&home.includes('05 / WHAT JYC MAKES POSSIBLE')&&home.includes('07 / THROUGH THE YEARS')&&home.includes('08 / THE PEOPLE')&&home.includes('09 / GET INVOLVED')],
  ['homepage image reserves intrinsic dimensions for the hero',home.includes('width="1600" height="1000"')],
  ['existing React Bits QA script remains available',fs.existsSync(path.join(root,'scripts/qa-react-bits.mjs'))],
  ['native registration uses a real submit button',extra.includes('type="submit" className="btn" disabled={busy}>{busy?\'Submitting…\':\'Submit registration\'}')],
  ['admin club links are optional but validated when supplied',admin.includes("String(form[k]||'').trim()&&!isSafeHttpUrl(form[k])")],
  ['admin previews use canonical slugs',admin.includes("window.open('/clubs/'+slug(c.name)")&&admin.includes("window.open('/events/'+slug(e.title)" )],
  ['project remains on React 19 + Motion + GSAP + OGL',packageJson.dependencies?.react==='19.3.0'&&packageJson.dependencies?.motion==='14.0.0'&&packageJson.dependencies?.gsap==='3.15.0'&&packageJson.dependencies?.ogl==='1.0.11']
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('JYC V59 smoothness QA passed.');
