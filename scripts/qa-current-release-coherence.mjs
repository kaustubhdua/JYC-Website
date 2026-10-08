import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const main=read('src/main.jsx');
const home=read('src/jyc-editorial-home.jsx');
const homeCss=read('src/jyc-editorial-home.css');
const publicCss=read('src/styles/public-system.css');
const suite=read('scripts/run-qa-suite.mjs');
const admin=read('src/admin-chunk.jsx');
const browser=read('scripts/browser-smoke.spec.js');

const checks=[];
const add=(name,ok,detail='')=>checks.push([name,Boolean(ok),detail]);

add('release metadata is a V64 release',/^64\.\d+\.\d+$/.test(pkg.version));
add('homepage has exactly one intentional photo-story surface',home.includes('gallery.slice(0,4)')&&home.includes('jh-photo-grid'));
add('homepage has no retired PhotoChapters mount',!home.includes('<PhotoChapters/>'));
add('homepage has no retired DriftWall mount',!home.includes('LazyDriftWall')&&!home.includes('jh-archive-section'));
add('homepage family cards are media-free',home.includes('jh-family-index')&&!home.includes('jh-family-image'));
add('homepage activity cards are media-free',!home.includes('image:gallery['));
add('homepage does not lazy-load a retired visual archive engine',!home.includes('LazyDitherVeil'));
add('gallery uses the deterministic grid contract',publicCss.includes('.public-app .gallery-grid{')&&publicCss.includes('display:grid!important')&&publicCss.includes('column-count:unset!important')&&publicCss.includes('aspect-ratio:4/3!important'));
add('gallery archive uses deterministic rows',publicCss.includes('.public-app .jyc57-masonry')&&publicCss.includes('grid-auto-rows:auto!important')&&publicCss.includes('.public-app .jyc57-masonry .jyc57-photo'));
add('gallery has mobile layout contracts',publicCss.includes('@media(max-width:620px)')&&publicCss.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important')&&publicCss.includes('@media(max-width:460px)');
add('homepage media CSS has the current family-index contract',homeCss.includes('.jyc-home .jh-family-index')&&!homeCss.includes('.jh-family-image{'));
add('homepage media CSS has stable four-tile mobile placement',homeCss.includes('.jyc-home .tile-0')&&homeCss.includes('.jyc-home .tile-3')&&homeCss.includes('@media(max-width:680px)');
add('active suite contains the current media/layout QA',suite.includes('qa-media-layout.mjs')&&suite.includes('qa-current-release-coherence.mjs'));
add('homepage CMS cannot reorder or restore retired visual surfaces',!admin.includes('move=(id,dir)')&&!admin.includes("Photo Chapters")&&!admin.includes("Hub Photo Wall"));
add('browser QA directly guards homepage media composition',browser.includes('homepage media composition stays editorial')&&browser.includes('homepage photo-story tiles')&&browser.includes('activity image duplication'));

const suiteFiles=[...suite.matchAll(/'([^']+\.mjs)'/g)].map(m=>m[1]).filter(p=>p.startsWith('qa-'));
const stale=[];
const stalePatterns=[
  /pkg\.version===['"](?:5[0-9]|6[0-3])\./,
  /release is v(?:5[0-9]|6[0-3])/i,
  /release version is V(?:5[0-9]|6[0-3])/i,
  /<PhotoChapters\/>/,
  /home\.includes\(['"]LazyDriftWall['"]\)/,
  /editorialHome\.includes\(['"]LazyDriftWall['"]\)/,
  /column-count:4/
];
for(const file of suiteFiles){
  if(file==='qa-current-release-coherence.mjs') continue;
  const full=path.join('scripts',file);
  if(!fs.existsSync(path.join(root,full))) { stale.push(full+' (missing)'); continue; }
  const text=read(full);
  for(const pattern of stalePatterns) if(pattern.test(text)) stale.push(full+' :: '+pattern);
}
add('active QA suite has no stale release/layout assertions',stale.length===0,stale.slice(0,12).join('; '));

const failures=checks.filter(x=>!x[1]);
for(const [name,ok,detail] of checks) console.log((ok?'PASS':'FAIL')+' · '+name+(detail?' — '+detail:''));
if(failures.length){console.error('\nCurrent release coherence QA failed: '+failures.length);process.exit(1)}
console.log('\nCurrent release coherence QA PASS ('+checks.length+' checks).');
