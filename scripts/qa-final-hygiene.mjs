import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const readme=read('README.md');
const main=read('src/main.jsx');
const config=read('src/public-v1/config.js');
const vercel=JSON.parse(read('vercel.json'));
const theme=read('src/jyc-logo-final-theme.css');

const checks=[];
const add=(name,ok,detail='')=>checks.push({name,ok:Boolean(ok),detail});

add('package remains V52',pkg.version==='52.0.0');
add('README names V52 as current',readme.includes('Current release: V52'));
add('README does not carry superseded V45/V47 product sections',!readme.includes('## V45 product upgrades')&&!readme.includes('## V47 product upgrades'));
add('README does not advertise retired public utilities',!readme.includes('Standalone JYC Assistant')&&!readme.includes('Featured JAI 2026 popup')&&!readme.includes('public academic calendar'));
add('club-only public boundary is explicit',config.includes('Official organisational website for JYC 128 identity')&&config.includes('student account area'));
add('canonical public routes remain JYC-only',[
  '/about','/history','/clubs','/events','/gallery','/team','/archive','/recruitment','/announcements','/calendar','/contact'
].every(route=>config.includes(route)));
add('student-platform UI is not mounted',!/<(MyJYC|AccountLogin|RegistrationPage|QRSharePage|JYCBot|FeaturedEventPopup|SiteAtmosphere)\b/.test(main));
add('academic/campus utility UI is not mounted',!main.includes('JIIT Academic Calendar')&&!main.includes('Campus Map')&&!main.includes('<CampusMap'));
add('legacy public aliases redirect',vercel.redirects.some(x=>x.source==='/my-jyc'&&x.destination==='/')&&vercel.redirects.some(x=>x.source==='/map'&&x.destination==='/events'));
add('visual contract is present',theme.includes('V52 FINAL VISUAL QA CONTRACT')&&theme.includes('overflow-wrap:anywhere')&&theme.includes('text-wrap:pretty'));
add('reduced motion contract is present',theme.includes('@media (prefers-reduced-motion:reduce)')&&theme.includes('animation:none!important'));

for(const c of checks) console.log((c.ok?'PASS: ':'FAIL: ')+c.name+(c.detail?' — '+c.detail:''));
const failed=checks.filter(c=>!c.ok);
if(failed.length){console.error('Final hygiene QA failed: '+failed.length);process.exit(1);}
console.log('PASS: final hygiene contract ('+checks.length+' checks)');
