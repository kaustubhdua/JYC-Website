import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const main=read('src/main.jsx');
const config=read('src/public-v1/config.js');
const schema=read('public/content/schema.json');
const vercel=JSON.parse(read('vercel.json'));
const pkg=JSON.parse(read('package.json'));
const checks=[];
const add=(name,ok)=>checks.push({name,ok:Boolean(ok)});

add('release is V51',pkg.version==='51.0.0');
add('club-only public scope is explicit',config.includes('JYC_OFFICIAL_SITE_SCOPE')&&config.includes('event-pass/certificate system')&&config.includes('student account area'));
add('core public routes exist',['/about','/history','/clubs','/events','/gallery','/team','/contact','/archive','/recruitment','/announcements'].every(r=>main.includes("'"+r+"'")));
add('JYC event calendar is public and not academic',main.includes('function JYCCalendarPage')&&main.includes('A calendar for JYC events only')&&!main.includes("JIIT Academic Calendar 2026–27"));
add('legacy student routes are not public page routes',!main.includes("clean==='/my-jyc'")&&!main.includes("clean==='/login'")&&!main.includes("clean==='/planner'")&&!main.includes("clean==='/notifications'")&&!main.includes("clean==='/settings'")&&!main.includes("clean==='/agenda'"));
add('legacy routes have Vercel redirects',vercel.redirects.some(x=>x.source==='/my-jyc'&&x.destination==='/')&&vercel.redirects.some(x=>x.source==='/planner'&&x.destination==='/events')&&vercel.redirects.some(x=>x.source==='/qr/:path*'));
add('native event registration is not mounted',!main.includes('RegistrationPage')&&!main.includes("endsWith('/register')"));
add('QR sharing utility is not mounted',!main.includes('QRSharePage'));
add('student assistant/popup is not mounted in public shell',!main.includes('<JYCBot')&&!main.includes('<FeaturedEventPopup'));
add('decorative atmosphere is not mounted in public shell',!main.includes('<SiteAtmosphere/>'));
add('real JYC source media remains first-class',main.includes('mergeSourceGallery')&&main.includes('PDF_HUB_EXTRA_GALLERY')&&main.includes('sourceHubMedia'));
add('public gallery includes supplied hub and archive material',main.includes('PDF_HUB_GALLERY')&&main.includes('PUBLIC_GALLERY_FALLBACK')&&main.includes('PUBLIC_GALLERY_FALLBACK'));
add('club detail uses source photography',main.includes('hub-source-photo-strip')&&main.includes('sourceHubMedia(c.name).photos'));
add('Neural Nexus source override is unique',read('src/jyc-source-media.js').match(/NeuralNexus:/g)?.length===1);
add('legacy certificate/location schema entities are gone',!schema.includes('"certificate"')&&!schema.includes('"location"'));
add('Sector 128 remains canonical public campus',main.includes('JIIT · SECTOR 128')&&config.includes('primaryCampus:\'JIIT Sector 128, Noida\''));
add('leadership remains canonical /team with /leadership alias',main.includes("clean==='/team'||clean==='/leadership'")&&vercel.redirects.some(x=>x.source==='/leadership'&&x.destination==='/team'));
add('recruitment remains club-site functionality',main.includes("clean==='/recruitment'")&&main.includes('RecruitmentHub'));
add('reduced motion contract remains',config.includes('respectReducedMotion:true')&&read('src/styles/public-system.css').includes('prefers-reduced-motion'));
add('real JYC social identity remains',read('src/jyc-socials.js').includes("instagramHandle: '@jiityouthclub'"));
add('package and lock are synchronized',(() => {const l=JSON.parse(read('package-lock.json')); return l.version===pkg.version&&l.packages?.['']?.version===pkg.version})());

const failed=checks.filter(x=>!x.ok);
for(const c of checks) console.log((c.ok?'PASS: ':'FAIL: ')+c.name);
if(failed.length){console.error('V51 club-only QA failed: '+failed.length);process.exit(1)}
console.log('PASS: V51 club-only QA ('+checks.length+' checks)');
