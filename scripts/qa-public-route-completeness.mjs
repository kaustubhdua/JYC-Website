import fs from 'node:fs';
import assert from 'node:assert/strict';

const main=fs.readFileSync('src/main.jsx','utf8');
const routeShells=fs.readFileSync('scripts/generate-route-shells.mjs','utf8');
const sitemap=fs.readFileSync('scripts/generate-sitemap.mjs','utf8');

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

console.log('Public route completeness contract: PASS (3 direct routes, metadata, shells and sitemap)');
