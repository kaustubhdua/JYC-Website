import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const main=read('src/main.jsx');
const responsive=read('src/jyc-responsive-photo.jsx');
const bot=read('src/jyc-bot.jsx');
const css=read('src/styles/public-system.css');
const sw=read('public/sw.js');

const checks=[
  ['release metadata is V64.x',/^64\.\d+\.\d+$/.test(pkg.version)],
  ['responsive media has native lazy loading',responsive.includes("loading='lazy'")||responsive.includes('loading="lazy"')],
  ['responsive media has async decoding',responsive.includes("decoding='async'")||responsive.includes('decoding="async"')],
  ['responsive media has intrinsic dimensions when supplied',responsive.includes('width={width}')&&responsive.includes('height={height}')],
  ['responsive derivatives have AVIF and WebP sources',responsive.includes('type="image/avif"')&&responsive.includes('type="image/webp"')],
  ['homepage keeps heavy interactive modules lazy',main.includes("lazy(()=>import('./jyc-bot.jsx')")&&main.includes("lazy(()=>import('./jyc-innovation-motion.jsx')")],
  ['assistant 3D model is interaction-gated',!bot.includes("requestIdleCallback(start")&&!bot.includes("setTimeout(start,1800)")&&bot.includes('onPointerEnter={()=>{loadModelViewer();preloadModelAsset()}}')],
  ['reduced-motion contract remains global',css.includes('prefers-reduced-motion: reduce')],
  ['public media is not content-visibility gated',!css.includes(':where(img, video, iframe) {\n  content-visibility: auto;')],
  ['service-worker cache matches release',sw.includes('jyc-cache-v'+String(pkg.version).replaceAll('.','-'))],
  ['public app has horizontal overflow containment',css.includes('.public-app{overflow-x:clip}'),
  ['interactive targets meet 44px minimum',css.includes('min-height: 44px')]
];

let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed){console.error('ZERO-GLITCH CONTRACT FAILED: '+failed+' check(s).');process.exit(1)}
console.log('ZERO-GLITCH CONTRACT PASS ('+checks.length+' checks)');
