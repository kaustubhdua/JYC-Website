import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const main=read('src/main.jsx');
const pkg=JSON.parse(read('package.json'));
const editorialHome=read('src/jyc-editorial-home.jsx');
const editorialCss=read('src/jyc-editorial-home.css');
const fallbacks=read('src/content/jyc-public-fallbacks.js');
const extra=read('src/extra-features.jsx');
const css=read('src/jyc-logo-final-theme.css');
const index=read('index.html');
const sw=read('public/sw.js');
const hubContent=read('src/v21-hub-content.js');
const sourceMedia=read('src/jyc-source-media.js');
const bot=read('src/jyc-bot.jsx');
const logoTheme=read('src/jyc-logo-final-theme.css');
const hubRegistry=read('src/jyc-hub-registry.js');
const glbPath=path.join(root,'public/models/1780947277181-w2z6yhqv.glb');
const glb=fs.existsSync(glbPath)?fs.readFileSync(glbPath):null;
let glbJson=null,glbChunks=[],glbParseError='';
if(glb){
 try{
  if(glb.length<20)throw new Error('file is shorter than a GLB header and chunk');
  const declared=glb.readUInt32LE(8);
  if(declared!==glb.length)throw new Error('declared GLB length differs from actual bytes');
  let offset=12;
  while(offset<declared){
   if(offset+8>declared)throw new Error('truncated GLB chunk header');
   const length=glb.readUInt32LE(offset),type=glb.readUInt32LE(offset+4),start=offset+8,end=start+length;
   if(end>declared)throw new Error('GLB chunk exceeds declared length');
   const bytes=glb.subarray(start,end);
   glbChunks.push({type,length,bytes});
   if(type===0x4e4f534a)glbJson=JSON.parse(bytes.toString('utf8').replace(/[\\u0000\\u0020]+$/g,''));
   offset=end;
  }
  if(offset!==declared)throw new Error('GLB chunk boundaries do not end at declared length');
 }catch(error){glbParseError=String(error?.message||error)}
}
const glbJsonChunk=glbChunks.find(c=>c.type===0x4e4f534a);
const glbBinChunk=glbChunks.find(c=>c.type===0x004e4942);


const hasExactUrl=(content,{protocol,hostname,pathname})=>{
  const matches=content.match(/https?:\/\/[^\s"'`<>)]+/g)??[];
  return matches.some(raw=>{
    try{
      const u=new URL(raw);
      return u.protocol===protocol&&u.hostname===hostname&&u.pathname===pathname;
    }catch{
      return false;
    }
  });
};

let pass=0,fail=0;
const check=(name,ok)=>{if(ok){console.log('PASS: '+name);pass++}else{console.error('FAIL: '+name);fail++}};

check('Consolidated public stylesheet is loaded exactly once',main.match(/import '\.\/styles\/public-system\.css';/g)?.length===1);
check('final JYC logo theme remains inside consolidated stylesheet stack',read('src/styles/public-system.css').includes("@import '../jyc-logo-final-theme.css';"));
check('logo beige is the final public brand anchor',css.includes('--jyc-champagne:#bf9c6f')&&css.includes('--jyc-cream:#f5f1e6')&&css.includes('--jyc-navy:#18161d')&&css.includes('--accent-red:#a82420'));
check('light/dark theme contracts are explicit',css.includes('html[data-theme="light"]')&&css.includes('html[data-theme="dark"]')&&css.includes('--jyc-text:var(--jyc-ink)')&&css.includes('--jyc-muted-live:var(--jyc-muted)'));
check('public text has explicit secondary contrast',css.includes('.public-app p,.public-app li{color:var(--jyc-muted-live)!important}'));
check('homepage hierarchy and motion layer are present',editorialHome.includes('jh-hero')&&editorialHome.includes('JYCNetwork')&&editorialHome.includes('jh-photo-story')&&!editorialHome.includes('<PhotoChapters/>')&&!editorialHome.includes('jh-archive-section')&&editorialCss.includes('@media(prefers-reduced-motion:reduce)'));

check('latest updates are part of homepage',editorialHome.includes('<JYCNowStrip limit={3} compact/>')&&read('src/jyc-now.jsx').includes('compact=false')&&read('src/jyc-now.jsx').includes('showMedia={!compact}'));
check('Join JYC CTA is clear',editorialHome.includes("nav('/join-jyc')")&&editorialHome.includes('Join JYC'));
check('Team hierarchy is explicit',main.includes('Faculty → Apex → Core → Clubs & Hubs')&&main.includes('team-command-strip')&&main.includes('JYC Apex'));
check('About exposes requested principles',main.includes('WHAT WE STAND FOR')&&main.includes('about-principles-v33'));
check('Gallery supports year discovery',extra.includes('gallery-years')&&extra.includes("const years=['All'"));
check('Event details support structured extra information',main.includes('e.rules?.length')&&main.includes('e.eligibility')&&main.includes('e.prizes?.length')&&main.includes('e.faqs?.length'));
check('Contact includes official JIIT campus context',main.includes('contact-location')&&hasExactUrl(main,{protocol:'https:',hostname:'www.jiit.ac.in',pathname:'/contact-us'}));
check('mobile layout stays compact',css.includes('@media(max-width:640px)')&&css.includes('grid-template-columns:1fr'));
check('image treatment uses non-distorting crops',css.includes('object-fit:cover!important')&&css.includes('object-position:center'));
check('reduced motion remains supported',css.includes('@media(prefers-reduced-motion:reduce)'));
check('public navigation exposes Contact',main.includes("['Contact','/contact']"));
check('official JYC hub content is wired',main.includes('JYC_HUB_CONTENT')&&main.includes('JYC_HUB_FAMILIES'));
check('verified leadership content remains source-grounded',fallbacks.includes('Dr. Vinay Anand Tikkiwal')&&fallbacks.includes('Dr. Pankaj Kumar Srivastava')&&fallbacks.includes("name:'Harisha'")&&fallbacks.includes("name:'Dhruv Choudhary'"));
check('production path does not fabricate demo content',main.includes('allowContentFallback:false')&&main.includes('return norm(empty)'));
check('JYC identity remains explicit in the public hero',editorialHome.includes('jh-kicker')&&editorialHome.includes('JIIT YOUTH CLUB')&&editorialHome.includes('128'));
check('SEO/social preview remains logo-led',index.includes('og:image" content="https://www.jiityouthclub128.in/JYC%20Logo(4).png"')&&index.includes('twitter:image" content="https://www.jiityouthclub128.in/JYC%20Logo(4).png"'));
check('runtime image failures have a safe public fallback',main.includes("img.dataset.jycFallback='1'")&&main.includes("img.src='/JYC%20Logo(4).png'"));
check('GLB assistant loads without interaction-gated rendering',bot.includes("/models/1780947277181-w2z6yhqv.glb")&&bot.includes('reveal="auto"')&&!bot.includes('requestIdleCallback'));
check('GLB asset exists within the 3 MiB transfer budget',Boolean(glb)&&glb.length>20&&glb.length<=3*1024*1024);
check('GLB header magic, version and exact declared byte length match',Boolean(glb)&&glb.toString('ascii',0,4)==='glTF'&&glb.readUInt32LE(4)===2&&glb.readUInt32LE(8)===glb.length);
check('GLB chunk framing and JSON are parseable',Boolean(glbJsonChunk)&&Boolean(glbJson)&&!glbParseError&&glbChunks[0]?.type===0x4e4f534a);
check('GLB JSON declares glTF 2.0 and at least one drawable mesh',glbJson?.asset?.version==='2.0'&&Array.isArray(glbJson.meshes)&&glbJson.meshes.length>0&&glbJson.meshes.every(m=>Array.isArray(m.primitives)&&m.primitives.length>0));
check('GLB scene graph has nodes referencing meshes',Array.isArray(glbJson?.nodes)&&glbJson.nodes.length>0&&glbJson.nodes.some(n=>Number.isInteger(n.mesh)&&n.mesh>=0&&n.mesh<glbJson.meshes.length));
check('GLB materials and primitives reference valid material indices',Array.isArray(glbJson?.materials)&&glbJson.materials.length>0&&glbJson.meshes.every(m=>m.primitives.every(p=>Number.isInteger(p.material)&&p.material>=0&&p.material<glbJson.materials.length)));
check('GLB embedded image references map to valid buffer views',Array.isArray(glbJson?.images)&&glbJson.images.length>0&&glbJson.images.every(i=>Number.isInteger(i.bufferView)&&i.bufferView>=0&&i.bufferView<(glbJson.bufferViews||[]).length)&&Array.isArray(glbJson.bufferViews));
check('GLB buffer views stay within the embedded BIN payload',Boolean(glbBinChunk)&&Array.isArray(glbJson?.buffers)&&glbJson.buffers.length>0&&glbJson.buffers.every(b=>Number.isInteger(b.byteLength)&&b.byteLength>0&&b.byteLength<=glbBinChunk.length)&&glbJson.bufferViews.every(v=>Number.isInteger(v.byteOffset||0)&&Number.isInteger(v.byteLength)&&v.byteLength>0&&(v.byteOffset||0)+v.byteLength<=glbBinChunk.length));

check('GLB binary header, version and declared length are valid',Boolean(glb)&&glb.toString('ascii',0,4)==='glTF'&&glb.readUInt32LE(4)===2&&glb.readUInt32LE(8)===glb.length);
check('homepage team surface stays text-led while full team retains image support',editorialHome.includes('jh-team-monogram')&&!editorialHome.includes('m.photo||m.image')&&main.includes('divye-bajaj.webp')&&fs.existsSync(path.join(root,'public/assets/team/divye-bajaj.webp')));
check('public media frames centre their images',logoTheme.includes('object-position:center center')&&logoTheme.includes('place-items:center'));
check('mobile public content clears the persistent dock',logoTheme.includes('.public-app{padding-bottom:96px}'));
check('service worker cache is current',read('public/sw.js').includes('jyc-cache-v'+pkg.version.replace(/\./g,'-')));
const maintainedHubCount=(hubContent.match(/^\s{2}(?:'[^']+'|[A-Za-z][^:]+):\{/gm)||[]).length;
check('orientation source count stays internally consistent',main.includes('JYC_HUB_CONTENT')&&main.includes("Object.keys(JYC_HUB_CONTENT).length")&&maintainedHubCount===23&&hubRegistry.match(/\{name:/g)?.length===23);
check('hub detail exposes source and live evidence layers',main.includes('hub-evidence-rail')&&main.includes('club-source')&&main.includes('Published JYC records provide the live layer'));
check('events support family-level discovery',main.includes("[family,setFamily]=useState('All')")&&main.includes('eventCategoryOf(e).toLowerCase()===family.toLowerCase()')&&main.includes('All'));
check('hub identity comment matches maintained count',read('src/hub-identities.js').includes('23 maintained community signatures'));
check('all 23 hub identities are represented',maintainedHubCount===23&&read('src/hub-identities.js').includes('23 maintained community signatures')&&read('src/hub-identities.js').includes('Qriosity')&&read('src/hub-identities.js').includes('JIIT OPTICA'));
check('event identity system covers supplied flagship events',read('src/hub-identities.js').includes('Dron-O-War')&&read('src/hub-identities.js').includes('Converge')&&read('src/hub-identities.js').includes('Code Clash')&&main.includes('eventIdentity(e)'));
check('event detail carries its own identity lockup',main.includes('event-identity-lockup')&&main.includes('event-identity-panel'));
check('source-first hub media helper exists',sourceMedia.includes('enrichSourceClubs')&&sourceMedia.includes('mergeSourceGallery')&&sourceMedia.includes('QUALITY_OVERRIDES'));
check('event identity fallback is deterministic',read('src/hub-identities.js').includes('EVENT_VISUALS')&&read('src/hub-identities.js').includes('hashEvent')&&read('src/hub-identities.js').includes('eventSeed'));
check('hub directory editorial preview exists',main.includes('hub-directory-stage')&&main.includes('hub-directory-preview')&&main.includes('onMouseEnter={()=>setActive(name)}'));
check('event timeline preview exists',main.includes('EventTimelinePreview')&&main.includes('event-timeline-row'));
const lock=JSON.parse(read('package-lock.json'));check('public image failure fallback prevents broken-image gaps',main.includes("dataset.jycFallback==='1'")&&main.includes("img.src='/JYC%20Logo(4).png'"));
check('public image presentation is centered',read('src/jyc-logo-final-theme.css').includes('object-position:center')&&editorialCss.includes('object-position:center'));
check('GLB stays fixed without camera controls',read('src/jyc-bot.jsx').includes('src="/models/1780947277181-w2z6yhqv.glb"')&&!read('src/jyc-bot.jsx').includes('camera-controls')&&!read('src/jyc-bot.jsx').includes('onPointerMove'));
check('GLB click animation remains enabled',read('src/jyc-bot.jsx').includes("onClick={openAssistant}")&&read('src/jyc-bot.jsx').includes("const openAssistant=")&&read('src/jyc-bot.jsx').includes('triggerMotion(next[0],next[1],next[2])')&&read('src/jyc-bot.jsx').includes('availableAnimations'));
check('GLB click path does not double-trigger pointer and keyboard animations',!read('src/jyc-bot.jsx').includes('onPointerDown={()=>triggerMotion')&&!read('src/jyc-bot.jsx').includes("onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){triggerMotion('is-tap'"));
check('GLB animation stop timer prevents stacked playback timers',read('src/jyc-bot.jsx').includes('animationStopTimer')&&read('src/jyc-bot.jsx').includes('clearTimeout(animationStopTimer.current)'));
check('GLB shadow cost is capped for smoother interaction',read('src/jyc-bot.jsx').includes('shadow-intensity="0.32"'));
check('GLB avoids repeated asset HEAD probes and respects lite mode',!read('src/jyc-bot.jsx').includes("fetch('/models/1780947277181-w2z6yhqv.glb'")&&read('src/jyc-bot.jsx').includes("dataset.performance==='lite'")&&read('src/jyc-bot.jsx').includes('saveData'));
check('homepage proof strip is explicit and non-fabricated',editorialHome.includes('01</b> DISCOVER')&&editorialHome.includes('02</b> PARTICIPATE')&&editorialHome.includes('03</b> BELONG'));
check('release metadata is synchronized',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);

check('signature interaction modules remain local and lightweight',main.includes('DepthCarousel')&&!read('src/components/react-bits/DepthCarousel.jsx').includes("from'gsap'"));if(fail)process.exit(1);
console.log(`Public visual QA: ${pass}/${pass+fail} passed.`);
