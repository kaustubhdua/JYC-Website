import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
const main=read('src/main.jsx');
const now=read('src/jyc-now.jsx');
const micro=read('src/react-bits/JYCMicro.jsx');
const microCss=read('src/react-bits/JYCMicro.css');
const dither=read('src/react-bits/DitherVeil.jsx');
const ditherCss=read('src/react-bits/DitherVeil.css');
const home=read('src/jyc-editorial-home.jsx');

const checks=[
 ['React Bits dependencies declared',pkg.dependencies.motion==='12.23.22'&&pkg.dependencies['@hugeicons/react']==='1.1.10'&&pkg.dependencies['@hugeicons/core-free-icons']==='4.3.5'&&pkg.dependencies.ogl==='1.0.11'],
 ['lockfile root matches React Bits/runtime dependencies',lock.packages[''].dependencies.motion==='12.23.22'&&lock.packages[''].dependencies.ogl==='1.0.11'&&lock.packages['node_modules/ogl']?.version==='1.0.11'],
 ['React Bits micro components present',/BellToggle|JellyRadio|RubberSegment|BorderGlow/.test(micro)],
 ['React Bits motion controls are lazy-loaded',main.includes('LazyRubberSegment')&&main.includes('LazyBellToggle')],
 ['JYC Now uses JellyRadio',now.includes('LazyJellyRadio')&&now.includes('Filter JYC Now by community')],
 ['event view uses RubberSegment',main.includes('LazyRubberSegment')&&main.includes('Event view')],
 ['event reminders use BellToggle',main.includes('EventReminderControl')&&main.includes('scheduleEventReminder')],
 ['Agentic AI popup is isolated from the public shell',!main.includes('AgenticAIPopup')&&!main.includes('agentic-launcher')&&!main.includes('LazyBorderGlow')],
 ['DitherVeil is the current React Bits implementation',dither.includes('const KERNELS =')&&dither.includes('const getBlueNoise')&&dither.includes('const diffuse')&&dither.includes('RenderTarget')&&dither.includes('measureEdge')],
 ['DitherVeil is lazy-loaded on the homepage',home.includes("lazy(()=>import('./react-bits/DitherVeil.jsx'))")&&home.includes('<LazyDitherVeil')],
 ['DitherVeil has reduced-motion/visibility lifecycle support',dither.includes("prefers-reduced-motion")&&dither.includes('IntersectionObserver')&&dither.includes('ResizeObserver')],
 ['DitherVeil CSS is minimal and scoped',ditherCss.includes('.dither-veil')&&!ditherCss.includes('body{')],
 ['public motion layer is lazy-loaded',main.includes('LazyJYCInnovationMotion')&&main.includes('<Suspense fallback={null}><LazyJYCInnovationMotion/></Suspense>')],
 ['route changes do not animate the whole document scroll',main.includes("window.scrollTo({top:0,behavior:'auto'})")&&!main.includes("window.scrollTo({top:0,behavior:'smooth'})},[loc.pathname])")],
 ['single global image-error fallback listener is canonical',
  (main.match(/document\.addEventListener\('error',onImageError,true\)/g)||[]).length===1&&
  (main.match(/document\.removeEventListener\('error',onImageError,true\)/g)||[]).length===1&&
  main.includes("img.dataset.jycFallback='1'")&&main.includes("img.dataset.jycFallbackApplied='1'")&&main.includes("img.src='/jyc-logo-official.webp'")],
 ['no public Control Center launcher added',!main.includes('Control Center</button>')&&!main.includes('Control Center ↗')]
];

check('CountUp component is present',fs.existsSync(path.join(root,'src/components/react-bits/CountUp.jsx')));
check('DepthCarousel component is present',fs.existsSync(path.join(root,'src/components/react-bits/DepthCarousel.jsx'))&&fs.readFileSync(path.join(root,'src/components/react-bits/DepthCarousel.css'),'utf8').includes('overflow:hidden'));
check('DepthCarousel avoids GSAP dependency',!read('src/components/react-bits/DepthCarousel.jsx').includes("from'gsap'")&&!pkg.dependencies?.gsap);

let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+' · '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('React Bits + interaction/performance QA PASS');
