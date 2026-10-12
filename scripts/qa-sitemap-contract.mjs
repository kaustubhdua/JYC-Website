import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {JYC_HUB_SOURCE_REGISTRY} from '../src/jyc-hub-registry.js';

const root=process.cwd();
const sitemapPath=path.join(root,'public','sitemap.xml');
const site='https://jyc-website-eight.vercel.app';
const core=['/','/about','/history','/clubs','/events','/fests','/gallery','/team','/contact','/calendar','/announcements','/updates','/achievements','/best-of-jyc','/join-jyc','/events/jai-2026-jaypee-agentic-ai-hackathon','/events/ride-hack-2026','/events/converge-2026','/events/drono-o-war-2026','/events/innovate-3-0-2026','/events/bitbox-6-0-2026','/events/sih-college-internals-26','/events/jyc-function-2026'];
const slug=value=>String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const allowed=new Set(core);
for(const hub of JYC_HUB_SOURCE_REGISTRY) allowed.add('/clubs/'+slug(hub.name));

const run=spawnSync(process.execPath,['scripts/generate-sitemap.mjs'],{cwd:root,env:{...process.env,JYC_CANONICAL_ORIGIN:site},encoding:'utf8'});
if(run.status!==0){console.error(run.stdout||'');console.error(run.stderr||'');process.exit(run.status||1)}
const xml=fs.readFileSync(sitemapPath,'utf8');
const locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].replace(site,''));
const failures=[];
const add=(name,ok,detail='')=>{if(!ok)failures.push(name+(detail?' — '+detail:''));console.log((ok?'PASS':'FAIL')+': '+name+(detail?' — '+detail:''));};
add('sitemap exists',xml.includes('<urlset'));
add('sitemap has no duplicate canonical URLs',new Set(locs).size===locs.length,`${locs.length} URLs`);
add('all core public routes are present',core.every(u=>locs.includes(u)));
add('all source-hub routes are canonical',locs.filter(u=>u.startsWith('/clubs/')).every(u=>allowed.has(u)));
add('no legacy JAI slug is emitted',!locs.includes('/events/agentic-ai-2026'));
add('no stale CodeAI slug is emitted',!locs.includes('/events/codeai-hackathon'));
add('no query strings or hashes are emitted',locs.every(u=>!/[?#]/.test(u)));
add('public URLs are lowercase and slash-normalized',locs.every(u=>u==='/'||(!/[A-Z]/.test(u)&&!u.endsWith('/'))));
add('image sitemap namespace is present',xml.includes('xmlns:image='));
add('image locations stay on the production origin',![...xml.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].some(m=>!m[1].startsWith(site+'/')));
const dynamicFlagships=core.filter(u=>u.startsWith('/events/'));
add('flagship event routes remain unique',dynamicFlagships.every(u=>locs.filter(x=>x===u).length===1));
if(failures.length){console.error(`Sitemap QA failed: ${failures.length}`);process.exit(1)}
console.log(`PASS: sitemap contract (${locs.length} URLs)`);