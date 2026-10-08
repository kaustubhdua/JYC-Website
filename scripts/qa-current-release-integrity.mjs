import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const failures=[];
const check=(name,ok,detail='')=>{if(!ok)failures.push({name,detail});};

const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
const sw=read('public/sw.js');
const readme=read('README.md');
const home=read('src/jyc-editorial-home.jsx');
const homeCss=read('src/jyc-editorial-home.css');
const publicCss=read('src/styles/public-system.css');
const gallery=read('src/jyc57-experience.jsx');
const accessibility=read('scripts/qa-accessibility-contract.mjs');
const zeroGlitch=read('scripts/qa-zero-glitch-contract.mjs');
const suite=read('scripts/run-qa-suite.mjs');

check('release metadata is synchronized',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version);
check('service-worker cache matches the release',sw.includes('jyc-cache-v'+pkg.version.replace(/\./g,'-')));
check('README advertises the exact release',readme.includes('Current release: V'+pkg.version));
check('homepage uses the intended editorial section sequence',
  ['jh-hero','jh-intro jh-container','jh-dark-section','jh-container jh-events','jh-photo-story','jh-activities jh-container','jh-history','jh-people jh-container','jh-final']
    .every(x=>home.includes('className="'+x+'"')));
check('homepage has one bounded four-frame photo story',home.includes('gallery.slice(0,4)')&&!home.includes('PhotoChapters')&&!home.includes('LazyDriftWall')&&!home.includes('jh-archive-section'));
check('homepage activity cards are not fed gallery images',!home.includes('image:gallery[');
check('homepage family cards are text-led',home.includes('jh-family-index')&&!home.includes('jh-family-image'));
check('homepage photo grid has deterministic geometry',homeCss.includes('.jyc-home .jh-photo-grid')&&homeCss.includes('.tile-0')&&homeCss.includes('.tile-3'));

const galleryButtons=gallery.split('<button').slice(1).map(x=>x.split('>',1)[0]);
check('gallery route controls are explicit non-submit buttons',galleryButtons.every(tag=>tag.includes('type="button"')||tag.includes("type='button'")));

check('gallery archive no longer relies on variable-row masonry',
  publicCss.includes('.public-app .jyc57-masonry')&&publicCss.includes('grid-auto-rows:auto!important')&&publicCss.includes('.public-app .jyc57-masonry .jyc57-photo')&&publicCss.includes('aspect-ratio:4/3!important'));
check('gallery grid also has deterministic geometry',
  publicCss.includes('.public-app .gallery-grid')&&publicCss.includes('column-count:unset!important')&&publicCss.includes('aspect-ratio:4/3!important'));

const importSpecs=[...publicCss.matchAll(/@import ['"]([^'"]+)['"];/g)].map(m=>m[1]);
const missingImports=importSpecs.filter(spec=>{
  if(!spec.startsWith('.'))return false;
  const target=path.normalize(path.join('src/styles',spec)).replaceAll('\\','/');
  return !exists(target);
});
check('active public CSS imports exist',missingImports.length===0,missingImports.join(', '));

check('accessibility gate covers the gallery module',accessibility.includes("'src/jyc57-experience.jsx'"));
check('zero-glitch gate validates CSS @imports',zeroGlitch.includes("relative CSS @imports resolve"));
check('media-layout gate is part of the main QA suite',suite.includes("'qa-media-layout.mjs'"));
check('obsolete V52 release gate is not in the main suite',!suite.includes("'qa-v52-final-contract.mjs'"));
check('no placeholder links are present in active public entry',!read('src/main.jsx').includes('href="#"')&&!home.includes('href="#"'));

if(failures.length){
  for(const f of failures)console.error('FAIL: '+f.name+(f.detail?' — '+f.detail:''));
  process.exit(1);
}
console.log('CURRENT RELEASE INTEGRITY PASS (15 checks)');
