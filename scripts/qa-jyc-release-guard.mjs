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
 ['release is V56.16.0',pkg.version==='56.16.0'&&lock.version==='56.16.0'&&lock.packages?.['']?.version==='56.16.0'],
 ['service worker cache is V56.16.0',sw.includes('jyc-cache-v56-16-0')],
 ['retired Projects/Impact/FAQ navigation is absent',!main.includes("['/projects','Projects'")&&!main.includes("['/impact','Impact'")&&!main.includes("['/faq','FAQ'"),],
 ['homepage retired Impact section is absent',!home.includes('jyc-v1-impact')&&!home.includes('HIGHLIGHTS · IMPACT')],
 ['homepage achievements section remains available',home.includes('jyc-v1-achievements')&&home.includes("nav('/achievements')")],
 ['DriftWall presets 1, 2 and 4 are wired',home.includes("['1','2','4']")&&home.includes('DRIFT_WALL_PRESETS')&&home.includes('LazyDriftWall')],
 ['only one DriftWall instance is mounted on the homepage',(home.match(/<LazyDriftWall/g)||[]).length===1],
 ['DriftWall surface has desktop/tablet/mobile height reservations',homeCss.includes('.jyc-v1-drift .drift-wall{width:100%;height:560px')&&homeCss.includes('max-width:800px')&&homeCss.includes('max-width:680px')],
 ['public layout has min-width and wrapping guards',publicCss.includes('min-width:0')&&publicCss.includes('overflow-wrap:anywhere')],
 ['reduced motion remains explicit',publicCss.includes('prefers-reduced-motion')],
 ['no placeholder hrefs are shipped in the public React entry',!main.includes('href="#"')]
];
let failed=0;for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+' · '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('JYC V56.16 release guard PASS');
