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
  assert.match(main, new RegExp(`if\\(clean===['"]${route.path}['"]\\)return <>{schema}<${route.component} data={data}/></>;`),
    `${route.path} must render its dedicated page component`);
  assert.match(shells, new RegExp(route.path.replaceAll('/', '\\/')),
    `${route.path} must have a direct-entry SEO shell`);
}

assert.doesNotMatch(main, /if\\(clean===['"]\\/(?:history|achievements|best-of-jyc)['"]\\)return <Navigate to=['"]\\/about['"] replace\\/>/,
  'Dedicated public pages must not silently redirect to About');
assert.match(main, /import JYCHistory/);
assert.match(main, /import \\{JYC57Events,JYC57Clubs,JYC57Gallery,JYC57Archive,JYCBestOf\\}/);
assert.match(main, /function Achievements\\(\\{data\\}\\)/);

console.log('Public route completeness contract: PASS (history, achievements, best-of-jyc)');
