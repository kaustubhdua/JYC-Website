import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const readme=read('README.md');
const main=read('src/main.jsx');
const jycNow=read('src/jyc-now.jsx');
const config=read('src/public-v1/config.js');
const vercel=JSON.parse(read('vercel.json'));
const theme=read('src/jyc-logo-final-theme.css');

const checks=[];
const add=(name,ok,detail='')=>checks.push({name,ok:Boolean(ok),detail});

add('package release is current V64 line',/^64\.\d+\.\d+$/.test(pkg.version));
add('README names current release',readme.includes('Current release: V64.0.0'));
add('README does not advertise superseded release markers',!readme.includes('Current release: V61.1.0')&&!readme.includes('Current release: V58.0.8'));
add('README does not carry superseded V45/V47 product sections',!readme.includes('## V45 product upgrades')&&!readme.includes('## V47 product upgrades'));
add('README does not advertise retired public utilities',!readme.includes('Standalone JYC Assistant')&&!readme.includes('Featured JAI 2026 popup')&&!readme.includes('public academic calendar'));
add('club-only public boundary is explicit',config.includes('Official organisational website for JYC 128 identity')&&config.includes('student account area'));
add('canonical public routes remain JYC-only',[
  '/about','/history','/clubs','/events','/gallery','/team','/best-of-jyc','/archive','/recruitment','/announcements','/calendar','/contact'
].every(route=>config.includes(route)));
add('public staff surface is not exposed',!main.includes('footer-admin-link')&&!main.includes('more-sheet-staff')&&!main.includes('search-admin-tools'));
add('student-platform UI is not mounted',!/<(MyJYC|AccountLogin|QRSharePage|SiteAtmosphere)\b/.test(main));
add('academic/campus utility UI is not mounted',!main.includes('JIIT Academic Calendar')&&!main.includes('Campus Map')&&!main.includes('<CampusMap'));
add('legacy public aliases redirect',vercel.redirects.some(x=>x.source==='/my-jyc'&&x.destination==='/')&&vercel.redirects.some(x=>x.source==='/map'&&x.destination==='/events'));
add('visual contract is present',theme.includes('V56.8 FINAL VISUAL QA CONTRACT')&&theme.includes('overflow-wrap:anywhere')&&theme.includes('text-wrap:pretty'));
add('homepage keeps Projects/Impact/FAQ out of navigation',!main.includes("['/projects','Projects'")&&!main.includes("['/impact','Impact'")&&!main.includes("['/faq','FAQ'"));
add('homepage does not mount the retired Impact block',!main.includes('jyc-v1-impact')&&!main.includes('HIGHLIGHTS · IMPACT'));
add('reduced motion contract is present',theme.includes('@media (prefers-reduced-motion:reduce)')&&theme.includes('animation:none!important'));

for(const c of checks) console.log((c.ok?'PASS: ':'FAIL: ')+c.name+(c.detail?' — '+c.detail:''));
const failed=checks.filter(c=>!c.ok);
if(failed.length){console.error('Final hygiene QA failed: '+failed.length);process.exit(1);}
console.log('PASS: final hygiene contract ('+checks.length+' checks)');
