import fs from 'node:fs';
import assert from 'node:assert/strict';

const main=fs.readFileSync('src/main.jsx','utf8');
const routeShells=fs.readFileSync('scripts/generate-route-shells.mjs','utf8');
const sitemap=fs.readFileSync('scripts/generate-sitemap.mjs','utf8');
const home=fs.readFileSync('src/jyc-editorial-home.jsx','utf8');
const experience=fs.readFileSync('src/jyc57-experience.jsx','utf8');
const publicEntry=fs.readFileSync('src/styles/public-entry.css','utf8');

const cases=[
  ['/history','JYCHistory data={data}'],
  ['/achievements','Achievements data={data}'],
  ['/best-of-jyc','JYCBestOf data={data}']
];
for(const [route,component] of cases){
  assert.ok(main.includes(`'${route}'`),`route metadata must include ${route}`);
  assert.ok(main.includes(component),`${route} must render its dedicated component`);
  assert.ok(routeShells.includes(`'${route}'`),`${route} must have a direct-request HTML shell`);
}
assert.ok(!main.includes("if(clean==='/history')return <Navigate to=\"/about\" replace/>;"),
  '/history must not silently redirect away from its dedicated historical page');
assert.ok(!main.includes("if(clean==='/achievements'||clean==='/best-of-jyc')return <Navigate to=\"/about\" replace/>;"),
  'achievements and Best of JYC must not silently redirect away from their dedicated pages');
assert.ok(sitemap.includes('/history')&&sitemap.includes('/achievements')&&sitemap.includes('/best-of-jyc'),
  'dedicated editorial routes must be represented in the sitemap');

assert.ok(!home.includes('Explore all 23 societies'), 'homepage must not hard-code an unverified society count');
assert.ok(!experience.includes('across 23 technical, cultural, creative, literary and sports hubs'), 'club directory must not hard-code an unverified community count');
assert.ok(experience.includes('fallbackAlt="Official JYC logo placeholder; photograph unavailable"'), 'gallery fallback must not be announced as a real photograph');
assert.ok(publicEntry.includes('grid-template-columns: repeat(12, minmax(0, 1fr)) !important')&&publicEntry.includes('nth-child(8n+1)')&&publicEntry.includes('grid-auto-rows: clamp(28px, 8.5vw, 38px) !important'), 'gallery must use a responsive editorial collage with varied card spans');
assert.ok(publicEntry.includes('prefers-reduced-motion: no-preference')&&publicEntry.includes('prefers-reduced-motion: reduce'), 'collage image motion must respect reduced-motion settings');
assert.ok(publicEntry.includes('font-synthesis: none')&&publicEntry.includes('font-feature-settings: "kern" 1, "liga" 1')&&publicEntry.includes('text-wrap: pretty'), 'public typography must use intentional OpenType and editorial wrapping rules');

console.log('Public route completeness and content-truth contract: PASS (3 direct routes, metadata, shells, sitemap and unverified-count guards)');
