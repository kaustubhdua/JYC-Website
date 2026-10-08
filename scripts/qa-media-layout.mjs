import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const home=read('src/jyc-editorial-home.jsx');
const homeCss=read('src/jyc-editorial-home.css');
const system=read('src/styles/public-system.css');
const checks=[
  ['homepage does not mount a second photo chapter system',!home.includes('<PhotoChapters/>')],
  ['homepage does not mount a full-page drift photo wall',!home.includes('LazyDriftWall')&&!home.includes('<LazyDriftWall')],
  ['homepage community family cards are text-led rather than five extra photos',home.includes('className="jh-family-index"')&&!home.includes('className="jh-family-image"')],
  ['homepage campus photo story is capped at four intentional frames',home.includes('gallery.slice(0,4)')],
  ['homepage activity bento does not duplicate gallery imagery',!home.includes('image:gallery[')],
  ['homepage photo-story has a deterministic four-tile layout',homeCss.includes('.jh-photo-grid')&&homeCss.includes('.tile-0')&&homeCss.includes('.tile-3')],
  ['homepage family index has a stable non-media frame',homeCss.includes('.jh-family-index')],
  ['gallery archive uses a deterministic grid, not CSS columns/masonry',system.includes('.public-app .gallery-grid{')&&system.includes('display:grid!important')&&system.includes('column-count:unset!important')&&!system.includes('.public-app .gallery-grid{display:block!important')],
  ['gallery archive images have stable aspect-ratio frames',system.includes('.public-app .gallery-grid .gallery-item img')&&system.includes('aspect-ratio:4/3!important')],
  ['gallery archive remains responsive at mobile widths',system.includes('@media(max-width:620px)')&&system.includes('.public-app .gallery-grid')],
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed){console.error('\nMedia-layout QA failed: '+failed+' contract(s).');process.exit(1)}
console.log('\nMedia-layout QA passed: '+checks.length+' contracts.');
