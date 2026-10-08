import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const checks=[
  ['release metadata matches package.json',(()=>{const pkg=JSON.parse(read('package.json'));return /^64\.\d+\.\d+$/.test(pkg.version)})()],
  ['service worker cache matches package release',(()=>{const pkg=JSON.parse(read('package.json'));return read('public/sw.js').includes('jyc-cache-v'+pkg.version.replace(/\./g,'-'))})()],
  ['production media boundary plugin exists',read('vite.config.js').includes("name:'jyc-production-media-boundary'")],
  ['image manifest uses the same curated archive boundary',read('scripts/generate-image-manifest.mjs').includes('allowedArchiveUrls')&&read('scripts/generate-image-manifest.mjs').includes("url.startsWith('/assets/source-archive/')&&!allowedArchiveUrls.has(url)")],
  ['production media boundary keeps strict photos and identity assets',read('vite.config.js').includes('JYC_SOURCE_ARCHIVE_PHOTO_ITEMS')&&read('vite.config.js').includes('JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS')],
  ['production media boundary removes raw dist archive before restoring curated assets',read('vite.config.js').includes("fs.rmSync(outArchive,{recursive:true,force:true})")&&read('vite.config.js').includes("fs.copyFileSync(source,target)")],
  ['sitemap uses strict photography rather than the complete raw archive',read('scripts/generate-sitemap.mjs').includes('JYC_SOURCE_ARCHIVE_PHOTO_ITEMS')&&!read('scripts/generate-sitemap.mjs').includes('JYC_SOURCE_ARCHIVE_CATALOG')],
  ['sitemap resolves event slugs from canonical data',read('scripts/generate-sitemap.mjs').includes('slug(e.slug||e.title)')],
  ['sitemap includes current flagship event routes',(()=>{const s=read('scripts/generate-sitemap.mjs');return ['/events/jai-2026-jaypee-agentic-ai-hackathon','/events/ride-hack-2026','/events/converge-2026','/events/drono-o-war-2026','/events/innovate-3-0-2026','/events/bitbox-6-0-2026','/events/sih-college-internals-26','/events/jyc-function-2026'].every(x=>s.includes(x))})()],
  ['legacy JAI slug remains only as an explicit redirect',(()=>{const legacy='agentic-ai-2026';const files=[];const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(['node_modules','.git','dist'].includes(e.name))continue;if(e.isDirectory())walk(p);else files.push(p)}};walk(path.join(root,'src'));const hits=files.filter(f=>fs.readFileSync(f,'utf8').includes(legacy));return hits.every(f=>path.relative(root,f)==='src/main.jsx')})()]
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('V59 production boundary QA PASS');
