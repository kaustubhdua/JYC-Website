import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const main=read('src/main.jsx');
const editorialHome=read('src/jyc-editorial-home.jsx');
const next=read('src/jyc-next-experience.jsx');
const bot=read('src/jyc-bot.jsx');
const assistant=read('src/jyc-assistant.jsx');
const css=read('src/styles/jyc-next-experience.css');
const visualPolish=read('src/styles/jyc-v55-visual-polish.css');
const registry=read('src/jyc-hub-registry.js');
const sourceMedia=read('src/jyc-source-media.js');
const gallery=read('src/extra-features.jsx');
const hubContent=read('src/v21-hub-content.js');
const checks=[
 ['brand editorial module remains available for secondary public surfaces',next.includes('export function JYCBrandEditorial')&&next.includes('jyc-brand-editorial')],
 ['next experience module remains available',next.includes('export function ChooseYourRoute')&&next.includes('export function PhotoStory')&&next.includes('export function PhotoChapters')&&next.includes('export function HubSignalRail')],
 ['homepage imports next experience layer',main.includes("from './jyc-next-experience.jsx'")&&main.includes("from './jyc-editorial-home.jsx'")],
 ['editorial homepage provides community discovery',editorialHome.includes('families.slice(0,5).map')&&editorialHome.includes('Explore all clubs')],
 ['editorial homepage mounts current updates',editorialHome.includes('<JYCNowStrip limit={3}/>')],
 ['homepage uses one controlled moments surface',editorialHome.includes('jh-photo-story')&&!editorialHome.includes('<PhotoChapters/>')&&!editorialHome.includes('jh-archive-section')],
 ['editorial homepage mounts living spotlight',editorialHome.includes('LazyMagicBento')],
 ['editorial homepage ordering is content-first',(()=>{const order=['jh-hero','jh-intro','jh-dark-section','jh-events','jh-photo-story','jh-activities','<JYCNowStrip limit={3}/>','jh-history','jh-people','jh-final'];const positions=order.map(token=>editorialHome.indexOf(token));return positions.every(i=>i>=0)&&positions.every((i,n)=>n===0||i>positions[n-1])})()],
 ['bot context labels exist',bot.includes('Explore hubs')&&bot.includes('Find an event')&&bot.includes('Explore archive')],
 ['bot stays above mobile dock',bot.includes('bottom:calc(94px + env(safe-area-inset-bottom))')],
 ['assistant quick routes are contextual',assistant.includes("context==='clubs'")&&assistant.includes("context==='events'")&&assistant.includes("context==='gallery'")],
 ['assistant indexes gallery and source photography',assistant.includes("type:'GALLERY'")&&assistant.includes('JYC_HUB_SOURCE_REGISTRY')&&assistant.includes('sourceHubMedia')],
 ['photo story preserves source-photo metadata',next.includes('sourceBuckets=JYC_HUB_SOURCE_REGISTRY.map')&&next.includes('item.caption||item.title')],
 ['photo story uses published media',next.includes("g?.published!==false")],
 ['route discovery uses five-family ecosystem',next.includes("JYC_HUB_CONTENT")&&next.includes("Technical")&&next.includes("Cultural")],
 ['hub source registry is loaded',next.includes("jyc-hub-registry.js")&&registry.includes('JYC_HUB_SOURCE_REGISTRY')],
 ['source registry covers current and source-only hubs',registry.includes("brochure-verified")&&registry.includes("source-material")&&registry.match(/\{name:/g)?.length===23],
 ['official 2026 brochure hubs are represented',hubContent.includes('Qriosity')&&hubContent.includes('JIIT OPTICA')],
 ['hub source filters exist',next.includes('jyc-hub-source-filters')&&css.includes('.jyc-hub-source-filters')],
 ['source media has explicit visual classification',sourceMedia.includes('mediaKind')&&sourceMedia.includes("return 'photo'")&&sourceMedia.includes("return 'artwork'")],
 ['gallery separates photography from artwork',gallery.includes("const [visual,setVisual]=useState('photo')")&&gallery.includes('MEDIA TYPE')&&gallery.includes('Photography')],
 ['hub index is explicitly non-exhaustive',next.includes('not an exhaustive list of every active JIIT hub')],
 ['new CSS is loaded',read('src/styles/public-system.css').includes("@import './jyc-next-experience.css';")],
 ['new layer avoids neon/glass/orbit language',!/neon|orbit-ring|glassmorphism/i.test(css)]
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed){console.error('JYC V54 NEXT EXPERIENCE QA FAILED: '+failed);process.exit(1)}
console.log('JYC V54 NEXT EXPERIENCE QA PASS');
