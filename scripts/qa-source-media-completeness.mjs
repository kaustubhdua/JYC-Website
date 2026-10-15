import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const files=['src/jyc-source-media.js','src/source-archive-index.js','src/pdf-hub-content.js','src/pdf-hub-extra.js','src/main.jsx','src/extra-features.jsx'];
const source=files.map(read).join('\n');
const optimizer=read('scripts/optimize-production-media.mjs');
const postbuildGeneratedAssets=new Set();
if(optimizer.includes("const logoSmallAvifOutput=path.join(root,'assets','jyc-logo-small.avif')")&&optimizer.includes("resize({width:96,withoutEnlargement:true})"))postbuildGeneratedAssets.add('/assets/jyc-logo-small.avif');
const urls=[...source.matchAll(/['"](\/assets\/[^'"]+)['"]/g)].map(m=>m[1]);
const unique=[...new Set(urls)];
let fail=0;
const missing=[];
for(const url of unique){
  const disk=path.join(root,'public',url.replace(/^\//,''));
  if(!fs.existsSync(disk)&&!postbuildGeneratedAssets.has(url))missing.push(url);
}
if(postbuildGeneratedAssets.has('/assets/jyc-logo-small.avif'))console.log('PASS: compact assistant/footer logo is declared as a postbuild-generated asset.');
const assetFiles=[];
for(const dir of ['public/assets/hub-photos','public/assets/hub-photos-extra','public/assets/hub-stories']){
  const abs=path.join(root,dir);
  if(!fs.existsSync(abs))continue;
  for(const name of fs.readdirSync(abs,{withFileTypes:true})){
    if(name.isFile())assetFiles.push(path.join(dir,name.name));
  }
}
if(missing.length){console.error('FAIL: referenced source media missing');missing.forEach(x=>console.error('  '+x));fail++}
console.log('PASS: '+unique.length+' referenced source-media paths resolved or declared as postbuild-generated.');
console.log('PASS: '+assetFiles.length+' committed hub media files scanned.');
const archiveIndex=read('src/source-archive-index.js');
const archiveMatch=archiveIndex.match(/JYC_SOURCE_ARCHIVE_CATALOG=([\s\S]*?);\s*export const/);
if(!archiveMatch){console.error('FAIL: source archive catalog export missing');fail++}else{try{const catalog=JSON.parse(archiveMatch[1]);const expected=873; if(catalog.length!==expected){console.error(`FAIL: source archive catalog expected ${expected} entries, found ${catalog.length}`);fail++} else console.log(`PASS: complete source archive catalog indexed (${catalog.length} source assets).`); }catch(error){console.error('FAIL: source archive catalog is not valid JSON',error.message);fail++}}
const archiveUrls=[...source.matchAll(/[\"'](\/assets\/source-archive\/[^\"']+)[\"']/g)].map(m=>m[1]);
console.log('PASS: '+archiveUrls.length+' source-archive references are wired through source media code.');
if(fail)process.exit(1);
