import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const drift=read('src/components/react-bits/DriftWall.jsx');
const dither=read('src/react-bits/DitherVeil.jsx');
const bento=read('src/components/react-bits/MagicBento.jsx');
const home=read('src/jyc-editorial-home.jsx');
const main=read('src/main.jsx');
const failures=[];
const check=(name,ok)=>{console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failures.push(name)};

check('DriftWall does not schedule an idle RAF when reduced/low-power/offscreen',drift.includes('if(reduced||lowPower||!visible.current)')&&drift.includes('if(!reduced&&!lowPower&&visible.current)frame.current=requestAnimationFrame(animate)'));
check('Homepage signature engines remain bounded',home.includes('LazyMagicBento')&&!home.includes('LazyDriftWall')&&home.includes('activities.map'));
check('DriftWall remains bounded on event and club rails',main.includes('event-drift-wall-section')&&main.includes('club-drift-wall-section')&&main.includes('.slice(0,18)')&&main.includes('.slice(0,24)'));
check('DriftWall remains bounded on Gallery page',read('src/extra-features.jsx').includes('const wallItems=useMemo(()=>rankJycPhotoItems(items,{limit:24}),[items])'));
check('DriftWall images are lazy and async decoded',drift.includes('loading="lazy"')&&drift.includes('decoding="async"'));
check('DitherVeil avoids WebGL on mobile and reduced motion',dither.includes('(pointer: coarse)')&&dither.includes('reducedMotion || coarsePointer')&&dither.includes('dither-veil__fallback'));
check('MagicBento disables heavy effects on coarse/mobile',bento.includes('(pointer:coarse)')&&bento.includes('const disabled=disableAnimations||mobile'));
check('MagicBento does not permanently reserve transform compositing',read('src/components/react-bits/MagicBento.css').includes('.magic-bento-card:hover{will-change:transform')&&!read('src/components/react-bits/MagicBento.css').includes('background:#18161d;color:#fff8e9;isolation:isolate;box-shadow:0 16px 40px rgba(17,19,24,.08);transform-style:preserve-3d;will-change:transform'));
check('Homepage non-critical imagery stays lazy',home.includes('loading="lazy"'));
check('Below-fold heavy engines are lazy-loaded',home.includes('LazyMagicBento')&&!home.includes('LazyDriftWall'));
if(failures.length)process.exit(1);
console.log('JYC animation/media performance contract: '+(10-failures.length)+'/10');
