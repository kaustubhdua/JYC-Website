import fs from 'node:fs';
import assert from 'node:assert/strict';

const main = fs.readFileSync('src/main.jsx', 'utf8');
const sitemap = fs.readFileSync('scripts/generate-sitemap.mjs', 'utf8');
const routeShells = fs.readFileSync('scripts/generate-route-shells.mjs', 'utf8');
const home = fs.readFileSync('src/jyc-editorial-home.jsx', 'utf8');

const routesStart = main.indexOf('function Routes(');
const routesEnd = main.indexOf('function NavIcon(', routesStart);
assert.ok(routesStart >= 0 && routesEnd > routesStart, 'Routes component boundaries must exist');
const routesSource = main.slice(routesStart, routesEnd);
const metadataHook = routesSource.indexOf('usePageMeta(');
const schemaDeclaration = routesSource.indexOf('const schema=');
const firstRenderReturn = routesSource.search(/return\s*<>|return\s*<Navigate|return\s*<section/);
assert.ok(metadataHook >= 0 && schemaDeclaration > metadataHook, 'Route metadata and schema hooks must be declared before route rendering');
assert.ok(firstRenderReturn > schemaDeclaration, 'Route rendering must not return before metadata/schema hooks; this prevents hook-order runtime errors');
assert.doesNotMatch(routesSource.slice(0, schemaDeclaration), /if\s*\([^\n]*\)\s*return\s*</, 'No conditional JSX returns are allowed before all route hooks');

const routes = [
  { path: '/history', render: /if\(clean===['"]\/history['"]\)return <>\{schema\}<JYCHistory data=\{data\}\/><\/>;/ },
  { path: '/achievements', render: /if\(clean===['"]\/achievements['"]\)return <>\{schema\}<Achievements data=\{data\}\/><\/>;/ },
  { path: '/best-of-jyc', render: /if\(clean===['"]\/best-of-jyc['"]\)return <>\{schema\}<JYCBestOf data=\{data\}\/><\/>;/ }
];

for (const route of routes) {
  assert.ok(main.includes(route.path), `Route metadata missing: ${route.path}`);
  assert.match(main, route.render, `Route does not render its dedicated page: ${route.path}`);
}

assert.match(main, /function Achievements\(\{data\}\)/, 'Achievements page component must exist');
assert.match(main, /import \{JYC57Events,JYC57Clubs,JYC57Gallery,JYC57Archive,JYCBestOf\}/, 'Best-of component must be imported');
assert.match(main, /import JYCHistory,\{HistoryTeaser,\s*HISTORY\}/, 'History page must be imported');
assert.match(sitemap, /history|achievements|best-of-jyc/i, 'Sitemap generator should account for editorial routes');
assert.match(routeShells, /history|achievements|best-of-jyc/i, 'Static route shells should account for editorial routes');
assert.match(home, /const featured = upcoming\[0\] \|\| null;/, 'Homepage must not promote a past event when no upcoming event exists');
assert.doesNotMatch(home, /Explore all 23 societies/, 'Homepage should not hard-code a community count');

console.log('P0 public route integrity PASS (3 dedicated editorial routes + truthful homepage content)');
