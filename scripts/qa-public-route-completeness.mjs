import fs from 'node:fs';
import assert from 'node:assert/strict';

const main = fs.readFileSync('src/main.jsx', 'utf8');
const shells = fs.readFileSync('scripts/generate-route-shells.mjs', 'utf8');

const routes = [
  { path: '/history', component: 'JYCHistory' },
  { path: '/achievements', component: 'Achievements' },
  { path: '/best-of-jyc', component: 'JYCBestOf' }
];

for (const route of routes) {
  const expected = `if(clean==='${route.path}')return <>{schema}<${route.component} data={data}/></>;`;
  assert.ok(main.includes(expected), `${route.path} must render its dedicated page component`);
  assert.ok(shells.includes(`'${route.path}'`), `${route.path} must have a direct-entry SEO shell`);
}

assert.ok(!main.includes("if(clean==='/history')return <Navigate to=\"/about\" replace/>;"),
  'History must not silently redirect to About');
assert.ok(!main.includes("if(clean==='/achievements'||clean==='/best-of-jyc')return <Navigate to=\"/about\" replace/>;"),
  'Achievements and Best of JYC must not silently redirect to About');
assert.ok(main.includes('import JYCHistory'));
assert.ok(main.includes('JYCBestOf'));
assert.ok(main.includes('function Achievements({data})'));

console.log('Public route completeness contract: PASS (history, achievements, best-of-jyc)');
