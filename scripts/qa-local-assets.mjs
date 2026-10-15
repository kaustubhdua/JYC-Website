import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const scanRoots=['index.html','public','src'];
const extensions=new Set(['.html','.css','.js','.jsx','.mjs','.json']);
const localPrefixes=['/assets/','/models/','/jyc-','/offline.html','/manifest.json','/robots.txt','/sitemap.xml','/llms.txt'];

const activeCss=new Set(['src/styles/public-system.css']);
const cssImports=new Set();
const files=[];
const walk=(p)=>{
  const full=path.join(root,p);
  if(!fs.existsSync(full)) return;
  const stat=fs.statSync(full);
  if(stat.isDirectory()){
    for(const entry of fs.readdirSync(full)) walk(path.join(p,entry));
    return;
  }
  if(extensions.has(path.extname(full).toLowerCase())) {
    const rel=path.relative(root,full).replaceAll('\\\\','/');
    const ext=path.extname(full).toLowerCase();
    if(ext!=='.css' || activeCss.has(rel)) files.push(full);
  }
};
scanRoots.forEach(walk);

// Only the consolidated public stylesheet is a runtime CSS entry. Historical CSS files are archived source and must not create false asset failures.
const refs=new Map();
const pattern=/(["'\`])((?:\/assets\/|\/models\/|\/jyc-[^"'\`?\s<>]+|\/offline\.html|\/manifest\.json|\/robots\.txt|\/sitemap\.xml|\/llms\.txt)(?:\?[^"'\`\s<>]*)?)(?:\1)/g;

for(const file of files){
  const text=fs.readFileSync(file,'utf8');
  let match;
  while((match=pattern.exec(text))){
    const raw=match[2].split('?')[0];
    if(!refs.has(raw)) refs.set(raw,[]);
    refs.get(raw).push(path.relative(root,file));
  }
}

const missing=[];
const dynamicLocalRefs=new Set();
for(const file of files){
  const text=fs.readFileSync(file,'utf8');
  for(const m of text.matchAll(/(?:src|poster|href|content|url)\s*=\s*[{(]?\s*['\"](\/(?:assets|models|jyc-[^'\"]+|offline\.html|manifest\.json|robots\.txt|sitemap\.xml|llms\.txt)[^'\"]*)['\"]/g)) dynamicLocalRefs.add(m[1].split('?')[0]);
}
for(const asset of dynamicLocalRefs) if(!refs.has(asset)) refs.set(asset,['dynamic-local-reference']);
const assetRoot=fs.existsSync(path.join(root,'dist'))?path.join(root,'dist'):path.join(root,'public');
for(const [asset,owners] of refs){
  const target=path.join(assetRoot,asset.replace(/^\//,''));
  if(!fs.existsSync(target)) missing.push({asset,owners});
}

for(const [asset,owners] of refs) console.log(`CHECK: ${asset} ← ${owners.slice(0,3).join(', ')}`);
if(missing.length){
  for(const item of missing) console.error(`FAIL: missing local runtime asset ${item.asset} ← ${item.owners.join(', ')}`);
  process.exit(1);
}
console.log(`PASS: local runtime asset references resolve (${refs.size} unique assets checked)`);
