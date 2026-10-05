import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const main=read('src/main.jsx');
const editorialHome=read('src/jyc-editorial-home.jsx');
const editorialCss=read('src/jyc-editorial-home.css');
const fallbacks=read('src/content/jyc-public-fallbacks.js');
const extra=read('src/extra-features.jsx');
const css=read('src/jyc-logo-final-theme.css');
const index=read('index.html');
const pkg=JSON.parse(read('package.json'));
const sw=read('public/sw.js');
const hubContent=read('src/v21-hub-content.js');
const sourceMedia=read('src/jyc-source-media.js');
const hubRegistry=read('src/jyc-hub-registry.js');

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
check('homepage hierarchy and motion layer are present',editorialCss.includes('.jyc-editorial-hero{')&&editorialCss.includes('.jyc-editorial-hero-media')&&editorialCss.includes('@media(prefers-reduced-motion:reduce)'));
check('latest updates are part of homepage',editorialHome.includes('<JYCNowStrip limit={3}/>'));
check('Join JYC CTA is clear',editorialHome.includes("nav('/recruitment')")&&editorialHome.includes('Join JYC ↗'));
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
check('JYC logo remains the public hero identity',editorialHome.includes('jyc-editorial-photo-frame')&&editorialHome.includes('REAL PEOPLE.')&&editorialHome.includes('OFFICIAL ARCHIVE'));
check('SEO/social preview remains logo-led',index.includes('og:image" content="https://www.jiityouthclub128.in/jyc-logo-official.webp"')&&index.includes('twitter:image" content="https://www.jiityouthclub128.in/jyc-logo-official.webp"'));
check('service worker cache is current',read('public/sw.js').includes('jyc-cache-v56-15-1'));
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
const lock=JSON.parse(read('package-lock.json'));check('release metadata is synchronized',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);

if(fail)process.exit(1);
console.log(`Public visual QA: ${pass}/${pass+fail} passed.`);
