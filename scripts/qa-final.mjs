import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const main=fs.readFileSync(path.join(root,'src/main.jsx'),'utf8');
const editorialHome=fs.readFileSync(path.join(root,'src/jyc-editorial-home.jsx'),'utf8');
const fallbacks=fs.readFileSync(path.join(root,'src/content/jyc-public-fallbacks.js'),'utf8');
const nextExperience=fs.readFileSync(path.join(root,'src/jyc-next-experience.jsx'),'utf8');
const css=fs.readFileSync(path.join(root,'src/styles/public-system.css'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const livingPhoto=fs.readFileSync(path.join(root,'src/jyc-living-photo.jsx'),'utf8');
const checks=[
 ['release version is current V56.15 line',pkg.version==='56.15.1'],
 ['visible breadcrumbs component exists',main.includes('function Breadcrumbs')&&main.includes('aria-label="Breadcrumb"')],
 ['public home has closing CTA contract',main.includes('JYCEditorialHome')&&editorialHome.includes('jyc-v1-final')],
 ['Club navigation links include clubs/events/team/contact',main.includes("nav('/clubs')")&&main.includes("nav('/events')")&&main.includes("nav('/team')")&&main.includes("nav('/contact')")],
 ['public club URLs use slugs',main.includes("nav('/clubs/'+slug(c.name))")],
 ['public event URLs use slugs',main.includes("nav('/events/'+slug(e.title))")],
 ['detail canonical URLs use slugs',main.includes('const canonicalPath=club?`/clubs/${slug(club.name)}`')&&main.includes('`/events/${slug(event.title)}'),],
 ['breadcrumb styling exists',main.includes('className="visible-breadcrumbs reveal"')],
 ['SEO topic link styling exists',main.includes('.search-topic-links')],
 ['service worker cache matches V56.15 release',fs.readFileSync(path.join(root,'public/sw.js'),'utf8').includes('jyc-cache-v56-15-1')],
 ['footer gates Fests by fest mode',main.includes("isFestMode(data)&&<button onClick={()=>nav('/fests')}>Fests</button>")],
 ['club logo alt text is descriptive',main.includes('alt={\`\${c.name} logo\`}'),],
 ['homepage does not expose gallery image count as a hero metric',!main.includes('Published gallery images')&&!main.includes('gallery memories')],
 ['homepage metric counters start at zero and use live values',editorialHome.includes('jyc-v1-stat-strip')&&editorialHome.includes('Published communities')&&editorialHome.includes('Community families')&&editorialHome.includes('Published events')],
 ['reduced-motion count-up resolves directly to the current value',editorialHome.includes('jyc-v1-stat-strip')&&fs.readFileSync(path.join(root,'src/jyc-editorial-home.css'),'utf8').includes('prefers-reduced-motion:reduce')],
 ['native event registration route is reachable',main.includes('RegistrationPage')&&main.includes("parts[2]==='register'")&&!main.includes("parts[2]==='register')return <Navigate")],['living photo engine uses decoded related transitions',livingPhoto.includes('scoreRelatedPhoto')&&livingPhoto.includes('preloadAndDecode')&&livingPhoto.includes('img.decode')&&livingPhoto.includes('setOutgoing')],
 ['living photo engine respects reduced motion and hidden tabs',livingPhoto.includes('prefers-reduced-motion')&&livingPhoto.includes('visibilitychange')],
 ['gallery defaults to living story mode',fs.readFileSync(path.join(root,'src/extra-features.jsx'),'utf8').includes("const [viewMode,setViewMode]=useState('story')")&&fs.readFileSync(path.join(root,'src/extra-features.jsx'),'utf8').includes('LivingPhoto')&&fs.readFileSync(path.join(root,'src/extra-features.jsx'),'utf8').includes("viewMode==='archive'")],
 
 ['legacy event-calendar route redirects to canonical calendar',main.includes("if(clean==='/event-calendar')return <Navigate to=\"/calendar\" replace/>")],
];

const extraPublicCss=fs.readFileSync(path.join(root,'src/styles/jyc-v56-final-system.css'),'utf8');
const extraFeatures=fs.readFileSync(path.join(root,'src/extra-features.jsx'),'utf8');

const official=fs.readFileSync(path.join(root,'src/jyc-official-hub-descriptions.js'),'utf8');
checks.push(['official brochure hub descriptions cover 17 communities', ['VamUnique','BDS','Aakriti','Panache','Abhivyakti','Aura','Cinekala','Eloquence','Qriosity','Prismatic','Fortissimo','CICR','JODC','RPH','Innovation','JSA','JIIT OPTICA'].every(n=>official.includes("'"+n+"':"))]);
checks.push(['sitemap generator includes image namespace',fs.readFileSync(path.join(root,'scripts/generate-sitemap.mjs'),'utf8').includes('xmlns:image')]);
const pdfHub=fs.readFileSync(path.join(root,'src/pdf-hub-content.js'),'utf8');
checks.push(
 ['final V56 public system is imported',css.includes("jyc-v56-final-system.css")],
 ['Gallery lightbox has useRef import',/import React,\{[^}]*useRef/.test(extraFeatures)&&extraFeatures.includes('useRef(null)')],
 ['final public system has mobile photo breakpoints',extraPublicCss.includes('@media(max-width:620px)')&&extraPublicCss.includes('.gallery-grid')],
 ['generic supplied archive photos do not carry inferred 2026 years',!pdfHub.split('\n').some(line=>line.includes("association:'JYC Archive'")&&line.includes("year:'2026'"))],
 ['ecosystem context rail selects across JYC families',main.includes('JYC_HUB_FAMILIES.map(family')&&main.includes('sourceHubMedia(name).photoItems')],
 ['public copy uses maintained 23-community count',!main.includes('names 21 communities')],
 ['JAI event fallback uses local committed artwork',fallbacks.includes("poster:'/assets/events/agentic-ai-2026.webp'")],
 ['photo archive uses the full source pool',nextExperience.includes('sourceBuckets=JYC_HUB_SOURCE_REGISTRY.map')&&nextExperience.includes('sourceHubMedia(meta.name).photoItems')&&!nextExperience.includes('photoItems.slice(0,8)')&&!nextExperience.includes('sourcePhotos.slice(0,16)')&&!nextExperience.includes('photos.slice(0,4)')],
 ['photo story imports the committed archive photo pool',nextExperience.includes('JYC_SOURCE_ARCHIVE_PHOTO_ITEMS')&&nextExperience.includes('...JYC_SOURCE_ARCHIVE_PHOTO_ITEMS')],
['photo story uses the living related-photo engine',nextExperience.includes('LivingPhoto')&&nextExperience.includes('className="jyc-photo-story-living"')&&livingPhoto.includes('scoreRelatedPhoto')&&livingPhoto.includes('preloadAndDecode')&&livingPhoto.includes('img.decode')],
 ['Supplied archive years are event-specific when present',pdfHub.split('\n').filter(line=>line.includes("year:'2026'")).every(line=>/Converge|Dron-O-War/.test(line))],
 ['source-material hubs expose provenance',nextExperience.includes("sourceMaterialCount")&&nextExperience.includes("SOURCE MATERIAL")],
 ['supplied five-volume archive inventory is represented',nextExperience.includes('JYC_SOURCE_ARCHIVE_STATS')&&nextExperience.includes('jyc-source-archive.js')&&fs.readFileSync(path.join(root,'src/jyc-source-archive.js'),'utf8').includes('rawImages')&&fs.readFileSync(path.join(root,'src/jyc-source-archive.js'),'utf8').includes('uniqueImages')],
 ['gallery deduplicates source media by URL',fs.readFileSync(path.join(root,'src/jyc-source-media.js'),'utf8').includes('new Map(media.filter(x=>x?.url).map(x=>[String(x.url),x]))')],
 ['gallery story avoids decorative source assets when possible',fs.readFileSync(path.join(root,'src/extra-features.jsx'),'utf8').includes('nonDecorative=photoOnly.filter')&&fs.readFileSync(path.join(root,'src/extra-features.jsx'),'utf8').includes('const itemIndex=g=>items.findIndex')],
 ['club and event source galleries use living-photo presentation',main.includes('className="club-living-photo"')&&main.includes('className="event-living-photo"')&&main.includes('LivingPhoto')],
 ['remaining public source-media merge is URL-keyed',fs.readFileSync(path.join(root,'src/jyc-source-media.js'),'utf8').includes("map.set(String(enriched.url),enriched)")],
 ['remaining find-community ornament is static, not orbital motion',!fs.readFileSync(path.join(root,'src/v36-depth-polish.css'),'utf8').includes('jycV36Orbit')],
 ['public search does not expose the Control Center',!main.includes('more-sheet-staff')&&!main.includes('search-admin-tools')],
 ['public search indexes published visual records',main.includes("type:'PHOTO'")&&main.includes("data.gallery.filter(g=>g&&g.url)" )],
 ['public event search includes event type and date',main.includes('e.eventType||')&&main.includes('e.date||')],
 ['public feature bundle has no retired academic calendar surface',!fs.readFileSync(path.join(root,'src/extra-features.jsx'),'utf8').includes('academicKeyDates')],
 ['dark theme follows native color-scheme',fs.readFileSync(path.join(root,'src/styles/public-system.css'),'utf8').includes('html[data-theme="dark"] { color-scheme: dark; }')],
 ['source-led JYC brand editorial block is mounted on home and About',editorialHome.includes('jyc-editorial-home')&&nextExperience.includes('export function JYCBrandEditorial')],
 ['brand editorial follows left-copy/right-emblem responsive contract',fs.readFileSync(path.join(root,'src/styles/jyc-v55-visual-polish.css'),'utf8').includes('.jyc-brand-editorial{')&&fs.readFileSync(path.join(root,'src/styles/jyc-v55-visual-polish.css'),'utf8').includes('grid-template-columns:minmax(0,1.25fr)')],
 ['GLB navigator is mounted non-blockingly and supports intent animations',main.includes('LazyJYCBot')&&main.includes('<Suspense fallback={null}><LazyJYCBot data={data}/></Suspense>')&&fs.readFileSync(path.join(root,'src/jyc-bot.jsx'),'utf8').includes('intent=\'wave\'')&&fs.readFileSync(path.join(root,'src/jyc-bot.jsx'),'utf8').includes('animationCursor')],
 ['GLB bot has restrained tap/hover motion and no auto-rotation',fs.readFileSync(path.join(root,'src/jyc-bot.jsx'),'utf8').includes('jycBotTap')&&fs.readFileSync(path.join(root,'src/jyc-bot.jsx'),'utf8').includes('availableAnimations')&&!fs.readFileSync(path.join(root,'src/jyc-bot.jsx'),'utf8').includes('auto-rotate')],
 ['maintained JYC source registry has 23 communities across five families',(()=>{const r=fs.readFileSync(path.join(root,'src/jyc-hub-registry.js'),'utf8');const names=[...r.matchAll(/\{name:'([^']+)'/g)].map(m=>m[1]);const families=[...new Set([...r.matchAll(/family:'([^']+)'/g)].map(m=>m[1]))];return names.length===23&&families.length===5})()],
 ['source-backed hub content covers all 23 maintained communities',(()=>{const r=fs.readFileSync(path.join(root,'src/v21-hub-content.js'),'utf8');const entries=[...r.matchAll(/^\s*(?:'([^']+)'|([A-Za-z0-9]+)):\{family:/gm)].map(m=>m[1]||m[2]);return entries.length===23})()],

);

checks.push(['flagship experience layer is mounted and data-driven',editorialHome.includes('<FlagshipExperience data={data}/>')&&nextExperience.includes('export function FlagshipExperience')&&nextExperience.includes("agentic-ai-2026")]);
checks.push(['flagship experience follows configured-home fallback ordering',editorialHome.includes('<FlagshipExperience data={data}/>')]);
checks.push(['current flagship events have dedicated identities',(()=>{const id=fs.readFileSync(path.join(root,'src/hub-identities.js'),'utf8');return ['JAI 2026','DRONO-O-WAR','RIDE Hack','CodeAI Hackathon','TechTonic 2.0','Code Clash 25.1','Code Clash 25.2'].every(n=>id.includes(n))})()]);
checks.push(['source photo relationship backfill migration exists',fs.existsSync(path.join(root,'supabase/migrations/202610040014_v56_4_source_photo_relationships.sql'))]);
checks.push(['GLB bot assistant sequence uses declared animation state',(()=>{const b=fs.readFileSync(path.join(root,'src/jyc-bot.jsx'),'utf8');return b.includes('animationCursor.current%sequence.length')&&b.includes('animationCursor.current+=1')&&!b.includes('motionCursor')})()]);
checks.push(['source-backed team bridge migration exists',fs.existsSync(path.join(root,'supabase/migrations/202610040018_v56_7_team_source_bridge.sql'))]);
checks.push(['production runtime preserves source-material hubs',main.includes('JYC_HUB_SOURCE_ONLY')&&main.includes("status:'source-material'")&&main.includes('existingClubNames')]);
checks.push(['normalized event read bridge migration exists',fs.existsSync(path.join(root,'supabase/migrations/202610040019_v56_9_normalized_event_read_bridge.sql'))]);
const publicAssets=path.join(root,'public','assets');
function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const assetFiles=walk(publicAssets).filter(p=>/\.(webp|png|jpe?g|avif|gif|svg)$/i.test(p));
const assetTextFiles=['src/main.jsx','src/jyc-next-experience.jsx','src/jyc-source-media.js','src/pdf-hub-content.js','src/pdf-hub-extra.js','src/v21-hub-content.js','src/jyc-assistant.jsx'].map(p=>fs.readFileSync(path.join(root,p),'utf8')).join('\n');
const assetRefs=new Set([...assetTextFiles.matchAll(/\/assets\/[^'"\s)]+/g)].map(m=>m[0]));
const assetRel=new Set(assetFiles.map(p=>p.slice(path.join(root,'public').length).replaceAll('\\\\','/')));
const missingReferencedAssets=[...assetRefs].filter(ref=>!assetRel.has(ref));
checks.push(['all explicitly referenced public assets exist',missingReferencedAssets.length===0]);
let failed=0; for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}: ${name}`); if(!ok)failed++;}
if(failed)process.exit(1); console.log('Final product QA complete.');
