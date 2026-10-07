import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const home=read('src/jyc-editorial-home.jsx');
const extra=read('src/extra-features.jsx');
const admin=read('src/admin-chunk.jsx');
const packageJson=JSON.parse(read('package.json'));\nconst network=read('src/jyc-network.jsx');\nconst webgl=read('src/jyc-webgl-showcase.jsx');\nconst search=read('src/lib/search.js');\nconst main=read('src/main.jsx');\n
const checks=[
  ['homepage keeps only purposeful React Bits surfaces',home.includes('LazyDitherVeil')&&home.includes('LazyMagicBento')&&!home.includes('LazyDriftWall')&&!home.includes('<PhotoChapters')],
  ['homepage no longer carries the unused visual archive model',!home.includes('visualArchive')],
  ['homepage selects a real-photo hero before fallback media',home.includes('photoGallery')&&home.includes('heroPhoto=photoGallery[0]||gallery[0]||null')],
  ['homepage filters upcoming events by end time',home.includes('eventEndMs')&&home.includes('end>=now')&&home.includes('events.filter')],
  ['homepage photo story excludes obvious decorative assets',home.includes('qr|logo|banner|poster|graphic|artwork')],
  ['homepage section numbering is continuous after visual simplification',home.includes('01 / THE ORGANISATION')&&home.includes('02 / FIND YOUR SPACE')&&home.includes('03 / WHAT’S NEXT')&&home.includes('04 / CAMPUS IN MOTION')&&home.includes('05 / WHAT JYC MAKES POSSIBLE')&&home.includes('07 / LIVE SNAPSHOT')&&home.includes('08 / THE PEOPLE')&&home.includes('10 / GET INVOLVED')],
  ['homepage image reserves intrinsic dimensions for the hero',home.includes('width="1600" height="1000"')],
  ['existing React Bits QA script remains available',fs.existsSync(path.join(root,'scripts/qa-react-bits.mjs'))],
  ['native registration uses a real submit button',extra.includes('type="submit" className="btn" disabled={busy}>{busy?\'Submitting…\':\'Submit registration\'}')],
  ['admin club links are optional but validated when supplied',admin.includes("String(form[k]||'').trim()&&!isSafeHttpUrl(form[k])")],
  ['admin previews use canonical slugs',admin.includes("window.open('/clubs/'+slug(c.name)")&&admin.includes("window.open('/events/'+slug(e.title)" )],
  ['project remains on React 19 + Motion + GSAP + OGL',packageJson.dependencies?.react==='19.3.0'&&packageJson.dependencies?.motion==='14.0.0'&&packageJson.dependencies?.gsap==='3.15.0'&&packageJson.dependencies?.ogl==='1.0.11'],\n  ['purposeful JYC Network is mounted on the homepage',home.includes("import {JYCNetwork} from './jyc-network.jsx'")&&home.includes('<JYCNetwork data={data}/>')&&network.includes('PEOPLE')&&network.includes('COMMUNITIES')&&network.includes('EVENTS')],\n  ['JYC Network has no orbit/auto-rotation language',!/orbit|auto-rotate|camera-controls/i.test(network)],\n  ['WebGL showcase has no camera orbit or auto-rotation',!/camera-controls|auto-rotate|rotation-per-second|camera-orbit/i.test(webgl)],\n  ['public homepage has no legacy orbit runtime markup',!/phoenix-orbit|ecosystem-orbit|team-orbit|orbit-ring|jyc-flight-layer/i.test(home)],\n  ['search ranking is relevance-scored and bounded',search.includes('relevanceScore')&&search.includes('rankSearchResults')&&search.includes('slice(0,16)')],\n  ['gallery lightbox retains keyboard navigation and focus trapping',extra.includes("e.key==='ArrowRight'")&&extra.includes("e.key==='ArrowLeft'")&&extra.includes("e.key==='Tab'")&&extra.includes('aria-modal="true"')],\n  ['event details expose programme, registration and calendar tools',main.includes('event-programme')&&main.includes('event-register')&&main.includes('DownloadICS')],\n  ['mobile navigation remains a five-item public dock',main.includes("['Home','/','home'],['Clubs','/clubs','clubs'],['Events','/events','events'],['Gallery','/gallery','gallery'],['More','__more','more']")],\n  ['reduced motion remains a global product contract',main.includes('reducedMotion="user"')],\n  ['no new UI dependency was added for the research pass',!packageJson.dependencies?.photoswipe&&!packageJson.dependencies?.fuse.js]);
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('JYC V59 smoothness QA passed.');
