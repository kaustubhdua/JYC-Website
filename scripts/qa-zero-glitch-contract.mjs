import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const walk=(dir,files=[])=>{
  for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
    const rel=path.join(dir,entry.name).replaceAll('\\','/');
    if(entry.isDirectory()&&!['node_modules','dist','.git'].includes(entry.name))walk(rel,files);
    else if(/\.(js|jsx|mjs|css|json|html|md)$/.test(entry.name))files.push(rel);
  }
  return files;
};
const files=walk('.');
const sourceFiles=files.filter(p=>p.startsWith('src/')&&/\.(js|jsx|mjs)$/.test(p));
const cssFiles=files.filter(p=>p.endsWith('.css'));
const checks=[];
const add=(name,ok,detail='')=>checks.push({name,ok:Boolean(ok),detail});

const pkg=JSON.parse(read('package.json'));
const staleOwnerToken=['cool','bandariya'].join('');
add('repository identity uses the current GitHub owner',!files.some(file=>/\.(js|jsx|mjs|css|json|html|md|sql|yml|yaml|ps1)$/.test(file)&&file!=='scripts/qa-zero-glitch-contract.mjs'&&read(file).includes(staleOwnerToken)), 'stale GitHub owner references remain outside the QA contract');

add('release metadata is V64 or newer',Number(String(pkg.version).split('.')[0])>=64);
add('Sharp is locked for real photo derivatives',pkg.devDependencies?.sharp==='0.35.5'&&pkg.scripts?.['media:derivatives']==='node scripts/generate-photo-derivatives.mjs'&&pkg.scripts?.prebuild?.includes('generate-photo-derivatives.mjs'));
add('only one browser workflow remains',exists('.github/workflows/jyc-browser.yml')&&!exists('.github/workflows/browser-qa.yml'));
add('all active workflow files are present',[
  '.github/workflows/ci.yml','.github/workflows/jyc-quality.yml','.github/workflows/jyc-browser.yml','.github/workflows/codeql.yml'
].every(exists));

const relativeFailures=[];
for(const file of sourceFiles){
  const text=read(file);
  for(const match of text.matchAll(/(?:from|import)\s*(?:\(\s*)?['"](\.\.?\/[^'"]+)['"]/g)){
    const spec=match[1];
    if(!spec.startsWith('.'))continue;
    const base=path.normalize(path.join(path.dirname(file),spec)).replaceAll('\\','/');
    const candidates=[base,base+'.js',base+'.jsx',base+'.mjs',base+'.css',path.join(base,'index.js'),path.join(base,'index.jsx')].map(x=>x.replaceAll('\\','/'));
    if(!candidates.some(exists))relativeFailures.push(file+' -> '+spec);
  }
}
add('relative JS/CSS imports resolve',relativeFailures.length===0,relativeFailures.slice(0,10).join('; '));

const cssImportFailures=[];
for(const file of cssFiles){
  const text=read(file);
  for(const match of text.matchAll(/@import\s+(?:url\(\s*)?['"]([^'"]+)['"]\s*\)?\s*;/g)){
    const spec=match[1];
    if(!spec.startsWith('.'))continue;
    const base=path.normalize(path.join(path.dirname(file),spec)).replaceAll('\\','/');
    const candidates=[base,base+'.css',path.join(base,'index.css')].map(x=>x.replaceAll('\\','/'));
    if(!candidates.some(exists))cssImportFailures.push(file+' -> '+spec);
  }
}
add('relative CSS @imports resolve',cssImportFailures.length===0,cssImportFailures.slice(0,12).join('; '));



const assetFailures=[];
for(const file of [...sourceFiles,...cssFiles]){
  const text=read(file);
  for(const match of text.matchAll(/(?:['"(]|url\(\s*['"]?)(\/assets\/[^'")\s?]+)/g)){
    const url=match[1];
    if(/\\$|\\{|\\}|\\*|\\[|\\]/.test(url))continue;
    const clean=url.split('?')[0].split('#')[0];
    if(!exists('public'+clean))assetFailures.push(file+' -> '+clean);
  }
}
add('literal local asset references resolve',assetFailures.length===0,assetFailures.slice(0,12).join('; '));

const publicRoutes=[
  '/','/about','/history','/clubs','/events','/gallery','/team','/best-of-jyc','/achievements','/archive',
  '/recruitment','/announcements','/updates','/calendar','/fests','/contact','/join-jyc'
];
const main=read('src/main.jsx');
add('maintained public route registry is represented',publicRoutes.every(route=>route==='/'||main.includes(route)));
add('Sector 128 boundary remains enforced',main.includes('isSector128Venue')&&main.includes('events.filter(e=>isSector128Venue'));
add('canonical JAI route is retained',main.includes('jai-2026-jaypee-agentic-ai-hackathon'));
add('legacy JAI redirect is retained',main.includes("legacyEventSlugMap={'agentic-ai-2026':'jai-2026-jaypee-agentic-ai-hackathon'}"));

const staleActive=[];
for(const file of [...sourceFiles,...cssFiles,'.github/workflows/ci.yml','.github/workflows/jyc-quality.yml'].filter(exists)){
  const text=read(file);
  if(file.includes('qa-final-hygiene.mjs'))continue;
  if(/Current release: V61\.1\.0|V58\.0\.8 is the current|release is V62\.0\.0/.test(text))staleActive.push(file);
}
add('no stale active release assertions remain',staleActive.length===0,staleActive.join(', '));

const placeholders=[];
for(const file of sourceFiles){
  const text=read(file);
  if(/lorem ipsum|TODO:?|FIXME:?|XXX:/.test(text))placeholders.push(file);
}
add('no placeholder/TODO/FIXME markers remain in runtime source',placeholders.length===0,placeholders.join(', '));

const responsive=read('src/jyc-responsive-photo.jsx');
add('responsive photo component is production-enabled',responsive.includes('import.meta.env.PROD')&&responsive.includes('srcSet={sourceSet(variants.avif)}')&&responsive.includes('srcSet={sourceSet(variants.webp)}'));
const derivative=read('scripts/generate-photo-derivatives.mjs');
add('derivative generator matches supported image extensions',derivative.includes('/\\.(jpe?g|png|webp)$/i.test(file)'));
const derivativeContract={
  usesSharp:derivative.includes("sharp(file)"),
  widths:derivative.includes("const WIDTHS=[240,480,960,1600]"),
  avif:/\.avif\(\{quality:\s*(?:4[5-9]|5[0-9]|6[0-9]),\s*effort:\s*[1-9]\d*\}/.test(derivative),
  webp:/\.webp\(\{quality:\s*(?:7[0-9]|8[0-9]|9[0-9]),\s*effort:\s*[1-9]\d*\}/.test(derivative),
  boundedConcurrency:/sharp\.concurrency\(/.test(derivative)&&/CONCURRENCY=/.test(derivative)
};
add('derivative generator contains budgeted Sharp transforms',Object.values(derivativeContract).every(Boolean),JSON.stringify(derivativeContract));

const workflowText=fs.readdirSync(path.join(root,'.github/workflows')).filter(x=>x.endsWith('.yml')||x.endsWith('.yaml')).map(x=>read('.github/workflows/'+x)).join('\n');
add('browser QA workflow actually installs Chromium',workflowText.includes('playwright install --with-deps chromium'));
add('active workflows do not use stale Node 22',!workflowText.includes('node-version: 22'));
add('production build uses the package build command',pkg.scripts.build==='vite build');
add('production browser suite covers image integrity and geometry',exists('scripts/zero-glitch-browser.spec.js')&&read('scripts/zero-glitch-browser.spec.js').includes('broken images')&&read('scripts/zero-glitch-browser.spec.js').includes('fixed overlap'));
const directImageLoadingFailures=[];
for(const file of sourceFiles){
  for(const tag of read(file).matchAll(/<img\b[^>]*>/g)){
    const markup=tag[0];
    if(/\bloading\s*=/.test(markup))continue;
    if(/fetchPriority\s*=\s*["']high["']/.test(markup))continue;
    directImageLoadingFailures.push(file);
  }
}
add('direct public photos default to lazy loading',directImageLoadingFailures.length===0,[...new Set(directImageLoadingFailures)].slice(0,10).join(', '));

let failed=0;
for(const c of checks){
  console.log((c.ok?'PASS':'FAIL')+' · '+c.name+(c.detail?' — '+c.detail:''));
  if(!c.ok)failed++;
}
if(failed)process.exit(1);
console.log('JYC ZERO-GLITCH STATIC CONTRACT PASS ('+checks.length+' checks)');
