
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const collectFiles=(dir)=>fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(entry=>{
  const rel=path.join(dir,entry.name);
  return entry.isDirectory()?collectFiles(rel):[rel];
});
const files=[...collectFiles('src/react-bits'),...collectFiles('src/components/react-bits')];
const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
const main=read('src/main.jsx');
const now=read('src/jyc-now.jsx');
const micro=read('src/react-bits/JYCMicro.jsx');
const microCss=read('src/react-bits/JYCMicro.css');
const dither=read('src/react-bits/DitherVeil.jsx');
const ditherCss=read('src/react-bits/DitherVeil.css');
const home=read('src/jyc-editorial-home.jsx');
const homeCss=read('src/jyc-editorial-home.css');
const extraFeaturesSafe=()=>{const f=read('src/extra-features.jsx');return f.includes('LazyDriftWall')&&f.includes('Drift wall')};

const checks=[
 ['React Bits dependencies declared',pkg.dependencies.motion==='14.1.0'&&pkg.dependencies['@hugeicons/react']==='1.1.10'&&pkg.dependencies['@hugeicons/core-free-icons']==='4.3.5'&&pkg.dependencies.ogl==='1.0.11'],
 ['lockfile root matches React Bits/runtime dependencies',lock.packages[''].dependencies.motion===pkg.dependencies.motion&&lock.packages[''].dependencies.ogl==='1.0.11'&&lock.packages['node_modules/ogl']?.version==='1.0.11'],
 ['React Bits micro components present',/BellToggle|JellyRadio|RubberSegment|BorderGlow/.test(micro)],
 ['React Bits motion controls are lazy-loaded',main.includes('LazyRubberSegment')&&main.includes('LazyBellToggle')],
 ['JYC Now uses JellyRadio',now.includes('LazyJellyRadio')&&now.includes('Filter JYC Now by community')],
 ['event view uses RubberSegment',main.includes('LazyRubberSegment')&&main.includes('Event view')],
 ['event reminders use BellToggle',main.includes('EventReminderControl')&&main.includes('scheduleEventReminder')],
 ['Agentic AI popup is isolated from the public shell',!main.includes('AgenticAIPopup')&&!main.includes('agentic-launcher')&&!main.includes('LazyBorderGlow')],
 ['DitherVeil is the current React Bits implementation',dither.includes('const KERNELS =')&&dither.includes('const getBlueNoise')&&dither.includes('const diffuse')&&dither.includes('RenderTarget')&&dither.includes('measureEdge')],
 ['DitherVeil is lazy-mounted on the optimized AVIF JYC hero logo with WebP/original-PNG fallback',dither.includes('export default')&&dither.includes('prefers-reduced-motion')&&home.includes('LazyDitherVeil')&&home.includes('Suspense fallback={<img')&&home.includes('src={DITHER_SOURCE}')&&home.includes('fallbackSrc={FALLBACK}')&&home.includes('originalFallbackSrc={ORIGINAL_LOGO}')&&home.includes("const FALLBACK = import.meta.env.PROD ? '/assets/jyc-logo.webp' : ORIGINAL_LOGO")&&home.includes("const DITHER_SOURCE = import.meta.env.PROD ? '/assets/jyc-logo.avif' : FALLBACK")&&dither.includes('fallbackSrc = DEFAULT_SRC')&&dither.includes('originalFallbackSrc = null')&&dither.includes('logoFallbackStage')&&home.includes('jh-dither-mark')&&!home.includes('LazyDriftWall')],
 ['DitherVeil has reduced-motion/visibility lifecycle support',dither.includes("prefers-reduced-motion")&&dither.includes('IntersectionObserver')&&dither.includes('ResizeObserver')],
 ['MagicBento uses router navigation and disables motion for reduced-motion users',read('src/components/react-bits/MagicBento.jsx').includes('onNavigate?onNavigate(item.href)')&&read('src/components/react-bits/MagicBento.jsx').includes("prefers-reduced-motion: reduce")&&home.includes('LazyMagicBento')&&home.includes('enableMagnetism={true}')],
 ['DitherVeil CSS is minimal and scoped',ditherCss.includes('.dither-veil')&&!ditherCss.includes('body{')],
 ['public motion layer is lazy-loaded',main.includes('LazyJYCInnovationMotion')&&main.includes('<Suspense fallback={null}><LazyJYCInnovationMotion/></Suspense>')],
 ['route changes do not animate the whole document scroll',main.includes("window.scrollTo({top:0,behavior:'auto'})")&&!main.includes("window.scrollTo({top:0,behavior:'smooth'})},[loc.pathname])")],
 ['single global image-error fallback listener is canonical',
  (main.match(/document\.addEventListener\('error',onImageError,true\)/g)||[]).length===1&&
  (main.match(/document\.removeEventListener\('error',onImageError,true\)/g)||[]).length===1&&
  main.includes("img.dataset.jycFallback='1'")&&main.includes("img.dataset.jycFallbackApplied='1'")&&main.includes('img.src=logo')],
 ['no public Control Center launcher added',!main.includes('Control Center</button>')&&!main.includes('Control Center ↗')]
];

const check=(name,ok)=>checks.push([name,ok]);

check('CountUp component is present',fs.existsSync(path.join(root,'src/components/react-bits/CountUp.jsx')));
check('DepthCarousel component is present',fs.existsSync(path.join(root,'src/components/react-bits/DepthCarousel.jsx'))&&fs.readFileSync(path.join(root,'src/components/react-bits/DepthCarousel.css'),'utf8').includes('overflow:hidden'));
check('DepthCarousel avoids a direct GSAP import',!read('src/components/react-bits/DepthCarousel.jsx').includes("from'gsap'")&&!read('src/components/react-bits/DepthCarousel.jsx').includes('from "gsap"'));
check('DepthCarousel is lazy-loaded on public routes',main.includes('LazyDepthCarousel')&&main.includes('<Suspense fallback={<div className="depth-carousel depth-carousel--loading"'));

check('DriftWall remains available for the visual archive',fs.existsSync(path.join(root,'src/components/react-bits/DriftWall.jsx'))&&extraFeaturesSafe());
check('Homepage uses the identity-first Dither Veil and lazy magnetic Bento without a continuously animated photo wall',home.includes('LazyDitherVeil')&&home.includes('LazyMagicBento')&&!home.includes('LazyDriftWall')&&home.includes('jh-dither-mark')&&home.includes('enableMagnetism={true}'));
check('MagicBento remains available as an optional library surface',fs.existsSync(path.join(root,'src/components/react-bits/MagicBento.jsx'))&&pkg.dependencies.gsap==='3.15.0'&&lock.packages['node_modules/gsap']?.version==='3.15.0');
check('FlexCarousel component remains available for future archive surfaces',fs.existsSync(path.join(root,'src/components/react-bits/FlexCarousel.jsx'))&&fs.existsSync(path.join(root,'src/components/react-bits/FlexCarousel.css')));
check('React Bits components do not ship CSP-incompatible remote demo media',!files.some(file=>/\.jsx$/.test(file)&&/images\.unsplash\.com/.test(read(file))));
check('DriftWall archive surface has responsive safeguards',read('src/components/react-bits/DriftWall.css').includes('height')&&read('src/components/react-bits/DriftWall.css').includes('@media'));
check('Homepage visual archive CSS contains no escaped newline literals',!homeCss.includes('\\n'));
check('DriftWall has offscreen, low-power and reduced-motion safeguards',read('src/components/react-bits/DriftWall.jsx').includes('IntersectionObserver')&&read('src/components/react-bits/DriftWall.jsx').includes('lowPower')&&read('src/components/react-bits/DriftWall.jsx').includes('prefers-reduced-motion'));
check('DriftWall is used for event and community visual rails',main.includes('event-drift-wall-section')&&main.includes('club-drift-wall-section')&&main.includes('LazyDriftWall'));
check('MagicBento disables heavy effects on mobile/coarse pointers',read('src/components/react-bits/MagicBento.jsx').includes('(pointer:coarse)')&&read('src/components/react-bits/MagicBento.jsx').includes('max-width:768px'));

let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+' · '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('React Bits + interaction/performance QA PASS');
