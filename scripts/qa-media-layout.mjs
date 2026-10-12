import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const home=read('src/jyc-editorial-home.jsx');
const homeCss=read('src/jyc-editorial-home.css');
const system=read('src/styles/public-system.css');
const checks=[
 ['homepage has no retired photo chapter system',!home.includes('<PhotoChapters/>')],
 ['homepage has no retired drift photo wall',!home.includes('LazyDriftWall')&&!home.includes('<LazyDriftWall')],
 ['homepage activity cards are text-led',home.includes('LazyActivityBento activities={activities} nav={nav}')&&!home.includes('image:gallery[')&&!home.includes("count: '10 Hubs'")&&!home.includes("count: '5 Societies'")],
 ['homepage has a single featured-event photo focal point',home.includes('className="jh-featured-event-photo"')&&home.includes('eventImage(featured)')&&home.includes('fallbackSrc={FALLBACK}')],
 ['homepage activity cards do not duplicate gallery imagery',!home.includes('image:gallery[')],
 ['homepage activity Bento has a stable non-media frame',homeCss.includes('.jh-activity-bento-shell')&&homeCss.includes('.magic-bento__grid')&&homeCss.includes('.magic-bento-card {')],
 ['gallery archive uses deterministic grid geometry',system.includes('.public-app .gallery-grid{')&&system.includes('display:grid!important')&&system.includes('column-count:unset!important')],
 ['gallery archive images have stable 4:3 frames',system.includes('.public-app .gallery-grid .gallery-item img')&&system.includes('aspect-ratio:4/3!important')],
 ['gallery archive is responsive',system.includes('@media(max-width:620px)')&&system.includes('.public-app .gallery-grid')],
 ['archive masonry route has deterministic rows',system.includes('.public-app .jyc57-masonry{')&&system.includes('grid-auto-rows:auto!important')&&system.includes('.public-app .jyc57-masonry .jyc57-photo')&&system.includes('aspect-ratio:4/3!important')],
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed){console.error('\nMedia-layout QA failed: '+failed+' contract(s).');process.exit(1)}
console.log('\nMedia-layout QA passed: '+checks.length+' contracts.');