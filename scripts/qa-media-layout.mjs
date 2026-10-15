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
 ['homepage activity cards choose editorially ranked real photos from each hub pool',home.includes('rankDiverseJycPhotos((source?.photoItems || []).filter(item => item?.url && (item.mediaKind || \'photo\') === \'photo\'), { limit: 1, maxPerAssociation: 1 })')&&home.includes('sourceHubMedia(photoHubs[p.id])')&&!home.includes('source.photoItems.find(item => item?.url)')],
 ['homepage activity cards use curated source photos and responsive delivery',home.includes('LazyActivityBento activities={activities} nav={nav}')&&home.includes('sourceHubMedia(photoHubs[p.id])')&&home.includes('rankDiverseJycPhotos((source?.photoItems || []).filter(item => item?.url && (item.mediaKind || \'photo\') === \'photo\'), { limit: 1, maxPerAssociation: 1 })')&&homeCss.includes('.jyc-editorial-home .magic-bento-card__media { display: block; }')&&read('src/components/react-bits/MagicBento.jsx').includes('ResponsivePhoto')&&!home.includes("count: '10 Hubs'")&&!home.includes("count: '5 Societies'")],
 ['photo-led activity cards expose keyboard focus and a reduced-motion-safe image treatment',read('src/components/react-bits/MagicBento.css').includes('.magic-bento-card:focus-within')&&read('src/components/react-bits/MagicBento.css').includes('button:focus-visible')&&read('src/components/react-bits/MagicBento.css').includes('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')&&read('src/components/react-bits/MagicBento.css').includes('@media (prefers-reduced-motion: reduce)')],
 ['homepage has a single featured-event photo focal point',home.includes('className="jh-featured-event-photo"')&&home.includes('eventImage(featured)')&&home.includes('fallbackSrc={FALLBACK}')],
 ['homepage activity cards do not duplicate gallery imagery',!home.includes('image:gallery[')],
 ['homepage activity Bento keeps stable image frames and responsive sizing',homeCss.includes('.jh-activity-bento-shell')&&homeCss.includes('.magic-bento__grid')&&homeCss.includes('.magic-bento-card {')&&homeCss.includes('.magic-bento-card__media picture { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }')],
 ['gallery archive uses deterministic grid geometry',system.includes('.public-app .gallery-grid{')&&system.includes('display:grid!important')&&system.includes('column-count:unset!important')],
 ['gallery archive images have stable 4:3 frames',system.includes('.public-app .gallery-grid .gallery-item img')&&system.includes('aspect-ratio:4/3!important')],
 ['gallery archive is responsive',system.includes('@media(max-width:620px)')&&system.includes('.public-app .gallery-grid')],
 ['archive masonry route has deterministic rows',system.includes('.public-app .jyc57-masonry{')&&system.includes('grid-auto-rows:auto!important')&&system.includes('.public-app .jyc57-masonry .jyc57-photo')&&system.includes('aspect-ratio:4/3!important')],
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed){console.error('\nMedia-layout QA failed: '+failed+' contract(s).');process.exit(1)}
console.log('\nMedia-layout QA passed: '+checks.length+' contracts.');