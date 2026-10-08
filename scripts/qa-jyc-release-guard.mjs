import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
const main=read('src/main.jsx');
const home=read('src/jyc-editorial-home.jsx');
const homeCss=read('src/jyc-editorial-home.css');
const publicCss=read('src/styles/public-system.css');
const sw=read('public/sw.js');
const checks=[
 ['release is V59.0.1',pkg.version==='59.0.1'&&lock.version==='59.0.1'&&lock.packages?.['']?.version==='59.0.1'],
 ['service worker cache is V59.0.1',sw.includes('jyc-cache-v58-0-8')&&!sw.includes('jyc-cache-v57-0-0')],
 ['retired Projects/Impact/FAQ navigation is absent',!main.includes("['/projects','Projects'")&&!main.includes("['/impact','Impact'")&&!main.includes("['/faq','FAQ'"),],
 ['homepage retired Impact section is absent',!home.includes('jyc-v1-impact')&&!home.includes('HIGHLIGHTS · IMPACT')],
 ['homepage achievements section remains available',home.includes("nav('/achievements')")&&home.includes('Explore Achievements')],
 ['homepage media hierarchy is consolidated',home.includes('jh-photo-story')&&!home.includes('<PhotoChapters/>')&&!home.includes('jh-archive-section')],
 ['homepage keeps the heavy archive engine off the landing page',!home.includes('LazyDriftWall')&&home.includes('LazyMagicBento')],
 ['DriftWall surface has desktop/tablet/mobile height reservations',homeCss.includes('.jh-photo-grid')&&homeCss.includes('@media(max-width:680px)')],
 ['public layout has min-width and wrapping guards',publicCss.includes('min-width:0')&&publicCss.includes('overflow-wrap:anywhere')],
 ['reduced motion remains explicit',publicCss.includes('prefers-reduced-motion')],
 ['no placeholder hrefs are shipped in the public React entry',!main.includes('href="#"')]
];
let failed=0;for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+' · '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('JYC V59.0.1 release guard PASS');
