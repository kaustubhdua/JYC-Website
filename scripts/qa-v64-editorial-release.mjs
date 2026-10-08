import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const main=read('src/main.jsx');
const gallery=read('src/jyc57-experience.jsx');
const responsive=read('src/jyc-responsive-photo.jsx');
const sitemap=read('scripts/generate-sitemap.mjs');
const pkg=JSON.parse(read('package.json'));
const checks=[
 ['society detail exposes organisation, activities, events, people and photography',/function ClubDetail/.test(main)&&/HUB PROFILE/.test(main)&&/ACTIVITIES/.test(main)&&/EVENTS/.test(main)&&/PEOPLE/.test(main)&&/CLUB PHOTOGRAPHY/.test(main)],
 ['event detail has lifecycle state and participation action',/eventState\(e\)/.test(main)&&/LIVE NOW/.test(main)&&/REGISTER NOW/.test(main)&&/REGISTRATIONS CLOSED/.test(main)],
 ['event card and detail share the same media layout id',main.includes('layoutId={\`event-media-\${slug(e.id||e.slug||e.title)}\`')&&main.includes('event-detail-poster')],
 ['gallery card and lightbox share the same media layout id',gallery.includes('layoutId={\`photo-\${String(g.id||g.url)}\`')&&gallery.includes('layoutId={\`photo-\${String(active.id||active.url)}\`}')],
 ['gallery transition is reduced-motion aware',gallery.includes('shouldReduceMotion?0:.28')],
 ['responsive photos provide AVIF/WebP srcset and sizes',responsive.includes('srcSet={sourceSet(variants.avif)}')&&responsive.includes('srcSet={sourceSet(variants.webp)}')&&responsive.includes('sizes={sizes}')],
 ['canonical JAI slug is the only sitemap slug',sitemap.includes('/events/jai-2026-jaypee-agentic-ai-hackathon')&&!sitemap.includes('/events/agentic-ai-2026')&&!sitemap.includes('/events/codeai-hackathon')],
 ['sitemap resolves dynamic event slugs from canonical data',sitemap.includes('slug(e.slug||e.title)')],
 ['legacy JAI redirect remains explicit in runtime',main.includes("legacyEventSlugMap={'agentic-ai-2026':'jai-2026-jaypee-agentic-ai-hackathon'}")],
 ['Sector 128 event boundary remains enforced',main.includes('isSector128Venue')&&main.includes('events.filter(e=>isSector128Venue')],
 ['editorial QA remains wired',pkg.scripts?.['qa:editorial']==='node scripts/qa-editorial-system.mjs'],
 ['new V64 QA is wired',pkg.scripts?.['qa:v64-editorial']==='node scripts/qa-v64-editorial-release.mjs']
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+' · '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('JYC V64 editorial/release contract PASS ('+checks.length+' checks)');
