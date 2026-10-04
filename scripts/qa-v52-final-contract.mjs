import fs from 'node:fs';
import path from 'node:path';

const read=p=>fs.readFileSync(path.join(process.cwd(),p),'utf8');
const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
const main=read('src/main.jsx');
const config=read('src/public-v1/config.js');
const media=read('src/jyc-source-media.js');
const theme=read('src/jyc-logo-final-theme.css');
const vercel=JSON.parse(read('vercel.json'));

const checks=[];
const add=(name,ok,detail='')=>checks.push({name,ok:Boolean(ok),detail});

add('release is V52',pkg.version==='52.0.0'&&lock.version==='52.0.0'&&lock.packages?.['']?.version==='52.0.0');
add('canonical public routes are declared',[
  ['/about','/history','/clubs','/events','/gallery','/team','/archive','/recruitment','/announcements','/calendar','/contact']
].every(group=>group.every(route=>config.includes("'" + route + "'"))));
add('leadership points to canonical team page',config.includes("['Leadership','/team']"));
add('public shell does not mount student-platform UI',!/<(MyJYC|AccountLogin|RegistrationPage|QRSharePage|JYCBot|FeaturedEventPopup|SiteAtmosphere)\\b/.test(main));
add('public shell does not mount academic calendar UI',!main.includes('JIIT Academic Calendar')&&!main.includes('Academic Calendar 2026'));
add('public shell does not mount campus-map UI',!main.includes('Campus Map')&&!main.includes('<CampusMap'));
add('public shell does not mount public notifications/settings UI',!main.includes('JYC Notifications')&&!main.includes('Experience Settings'));
add('public event registration is external/editorial only',!main.includes("endsWith('/register')")&&!main.includes('RegistrationPage'));
add('real source-media pipeline remains active',main.includes('mergeSourceGallery')&&main.includes('sourceHubMedia')&&media.includes('PDF_HUB_GALLERY'));
add('Neural Nexus source override is unique',(media.match(/NeuralNexus:/g)||[]).length===1);
add('senior logo palette is active',theme.includes('--jyc-navy:#141927')&&theme.includes('--jyc-champagne:#c2a682')&&theme.includes('--jyc-ivory:#faf7ef'));
add('reduced motion is enforced',theme.includes('@media (prefers-reduced-motion:reduce)')&&theme.includes('animation:none!important'));
add('minimum pointer target contract is enforced',theme.includes('min-width:44px')&&theme.includes('min-height:44px'));
add('legacy public routes redirect safely',vercel.redirects.some(x=>x.source==='/my-jyc'&&x.destination==='/')&&vercel.redirects.some(x=>x.source==='/planner'&&x.destination==='/events'));
add('rewrite keeps SPA deep links alive',vercel.rewrites?.some(x=>x.source==='/(.*)'&&x.destination==='/'));

const localRefs=[...new Set(
  [...main.matchAll(/['"]((?:\\/assets\\/)[^'"]+)['"]/g),...media.matchAll(/['"]((?:\\/assets\\/)[^'"]+)['"]/g)]
  .map(m=>m[1].split('?')[0])
)];
const missing=localRefs.filter(p=>!fs.existsSync(path.join(process.cwd(),'public',p.replace(/^\\/,'').replaceAll('/','/'))));
add('all local media references resolve',missing.length===0,missing.length?missing.slice(0,12).join(', '):'');
for(const c of checks) console.log((c.ok?'PASS: ':'FAIL: ')+c.name+(c.detail?' — '+c.detail:''));
const failed=checks.filter(c=>!c.ok);
if(failed.length){
 console.error('V52 final contract failed: '+failed.length+' checks');
 process.exit(1);
}
console.log('PASS: V52 final contract ('+checks.length+' checks)');
