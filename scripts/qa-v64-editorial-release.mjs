import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const main=read('src/main.jsx');
const gallery=read('src/jyc57-experience.jsx');
const responsive=read('src/jyc-responsive-photo.jsx');
const intelligence=read('src/jyc-photo-intelligence.js');
const routeShells=read('scripts/generate-route-shells.mjs');
const sitemap=read('scripts/generate-sitemap.mjs');
const pkg=JSON.parse(read('package.json'));
const checks=[
 ['society detail exposes organisation, activities, events, people and photography',/function ClubDetail/.test(main)&&/HUB PROFILE/.test(main)&&/ACTIVITIES/.test(main)&&/EVENTS/.test(main)&&/PEOPLE/.test(main)&&/CLUB PHOTOGRAPHY/.test(main)],
 ['event detail has lifecycle state and participation action',/eventState\(e\)/.test(main)&&/LIVE NOW/.test(main)&&/REGISTER NOW/.test(main)&&/REGISTRATIONS CLOSED/.test(main)],
 ['event card and detail share the same media layout id',main.includes('layoutId={\`event-media-\${slug(e.id||e.slug||e.title)}\`')&&main.includes('event-detail-poster')],
 ['gallery card and lightbox share the same media layout id',gallery.includes('layoutId={\`photo-\${String(g.id||g.url)}\`')&&gallery.includes('layoutId={\`photo-\${String(active.id||active.url)}\`}')],
 ['gallery transition is reduced-motion aware',gallery.includes('shouldReduceMotion?0:.28')],
 ['responsive photos provide AVIF/WebP srcset and sizes',responsive.includes('srcSet={sourceSet(variants.avif)}')&&responsive.includes('srcSet={sourceSet(variants.webp)}')&&responsive.includes('sizes={sizes}')],
 ['derivative candidates respect source dimensions',responsive.includes('photoDerivativeUrls(src,width)')&&intelligence.includes('photoDerivativeUrls(url,sourceWidth)')&&intelligence.includes('width<=Number(sourceWidth)*1.15')],
 ['canonical JAI slug is the only sitemap slug',sitemap.includes('/events/jai-2026-jaypee-agentic-ai-hackathon')&&!sitemap.includes('/events/agentic-ai-2026')&&!sitemap.includes('/events/codeai-hackathon')],
 ['sitemap resolves dynamic event slugs from canonical data',sitemap.includes('slug(e.slug||e.title)')],
 ['legacy JAI redirect remains explicit in runtime',main.includes("legacyEventSlugMap={'agentic-ai-2026':'jai-2026-jaypee-agentic-ai-hackathon'}")],
 ['Sector 128 event boundary remains enforced',main.includes('isSector128Venue')&&main.includes('events.filter(e=>isSector128Venue')],
 ['editorial QA remains wired',pkg.scripts?.['qa:editorial']==='node scripts/qa-editorial-system.mjs'],
 ['new V64 QA is wired',pkg.scripts?.['qa:v64-editorial']==='node scripts/qa-v64-editorial-release.mjs'],
 ['release metadata is V64',/^64\.\d+\.\d+$/.test(pkg.version)],
 ['production prebuild generates real photo derivatives',pkg.scripts?.prebuild?.includes('generate-photo-derivatives.mjs')],
 ['responsive photos enable derivatives in production',responsive.includes('import.meta.env.PROD')],
 ['route metadata shell generator is wired',pkg.scripts?.postbuild==='node scripts/generate-route-shells.mjs'&&routeShells.includes("<link rel=\"canonical\" href=\"${siteOrigin}${route}\" />")&&routeShells.includes("/events/jai-2026-jaypee-agentic-ai-hackathon")],
 ['route-shell canonicals use a stable production origin fallback',!routeShells.includes('process.env.VERCEL_URL')&&routeShells.includes("process.env.VITE_SITE_URL||'https://jyc-website-eight.vercel.app'")],
 ['sitemap uses a stable production origin fallback',!sitemap.includes('process.env.VERCEL_URL')&&sitemap.includes("process.env.VERCEL_PROJECT_PRODUCTION_URL||'https://jyc-website-eight.vercel.app'")],
 ['route shells cover all static public entry pages', ['/announcements','/updates','/calendar','/fests','/recruitment','/join-jyc','/achievements','/best-of-jyc'].every(route=>routeShells.includes(`'${route}':`))],
 ['route shells cover maintained public hubs',routeShells.includes('JYC_HUB_SOURCE_REGISTRY')&&routeShells.includes("'/clubs/'+String(hub.name).toLowerCase().replace(/[^a-z0-9]+/g,'-')")]
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+' · '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('JYC V64 editorial/release contract PASS ('+checks.length+' checks)');
