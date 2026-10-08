import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const css=read('src/styles/jyc-v55-visual-polish.css');
const main=read('src/main.jsx');
const editorialHome=read('src/jyc-editorial-home.jsx');
const next=read('src/jyc-next-experience.jsx');
const sourceMedia=read('src/jyc-source-media.js');
const extraFeatures=read('src/extra-features.jsx');
const checks=[
 ['homepage photo presentation is intentionally consolidated',editorialHome.includes('jh-photo-story')&&!editorialHome.includes('<PhotoChapters/>')&&!editorialHome.includes('jh-archive-section')],

 ['V56.7 polish is imported',read('src/styles/public-system.css').includes("./jyc-v55-visual-polish.css")],
 ['public content has centered width contract',css.includes('--jyc-content')&&css.includes('margin-inline:auto')],
 ['global text overflow is guarded',css.includes('overflow-wrap:anywhere')],
 ['public sections are centered',css.includes('.public-app .section,.public-app .page')],
 ['club cards use source photography',main.includes('const clubMedia=sourceHubMedia(c.name)')&&main.includes('c.banner||sourcePhoto')],
 ['event cards prefer source photography',main.includes('sourceEventMedia(e)?.photoItems')&&main.includes('source?.url')],
 ['gallery uses masonry columns',css.includes('column-count:4')&&css.includes('break-inside:avoid')],
 ['gallery has mobile single-column fallback',css.includes('@media(max-width:480px)')&&css.includes('.public-app .gallery-grid{column-count:1}')],
 ['club pages expose source photo strip',main.includes('club-living-photo')&&main.includes('sourceHubMedia(c.name).photoItems')&&main.includes('LivingPhoto')],
 ['homepage photo story uses maintained gallery media',editorialHome.includes('jh-photo-grid')&&editorialHome.includes('gallery.slice(0,6)')&&editorialHome.includes("nav('/gallery')")],
 ['homepage does not mount a second archive wall',!editorialHome.includes('LazyDriftWall')&&!editorialHome.includes('jh-archive-section')],
 ['club source rail uses metadata-aware captions',main.includes('club-living-photo')&&read('src/jyc-living-photo.jsx').includes('current.caption||current.title||current.association')&&read('src/jyc-living-photo.jsx').includes('jyc-living-photo-meta')],
 ['gallery mounts source hub photography',read('src/extra-features.jsx').includes('sourcePhotoItems=useMemo')&&read('src/extra-features.jsx').includes('sourceHubMedia(name).photoItems')],
 ['gallery defaults to DriftWall archive presentation',extraFeatures.includes("useState('wall')")&&extraFeatures.includes('LazyDriftWall')],
 ['maintained hub photo mapping has no duplicate URLs',(()=>{const refs=[...sourceMedia.matchAll(/QUALITY_OVERRIDES=[\s\S]*?};/g)][0]?.[0]||'';const urls=[...refs.matchAll(/['\"](\/assets\/[^'\"]+)['\"]/g)].map(m=>m[1]);return new Set(urls).size===urls.length})()],
 ['public club/event/photo cards stay upright',!main.includes('club-card-v41 tilt-card')&&!main.includes('event-card-premium tilt-card')&&!main.includes('moments-feature-${i} tilt-card')],
 ['event identity contract remains present',main.includes('event-identity-page')&&main.includes('eventIdentity(e)')],
 ['club identity contract remains present',main.includes('club-identity-page')&&main.includes('hubIdentity(c.name)')],
 ['reduced motion is covered',css.includes('prefers-reduced-motion')],
 ['mobile widths are covered',css.includes('@media(max-width:700px)')&&css.includes('@media(max-width:480px)')],
 ['fixed overlays stay above content',css.includes('z-index:10000')&&css.includes('z-index:9000')]
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('V56.7 visual QA: '+checks.length+'/'+checks.length+' checks passed.');
