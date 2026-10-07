import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const main=read('src/main.jsx');
const editorialHome=read('src/jyc-editorial-home.jsx');
const extra=read('src/extra-features.jsx');
const pkg=JSON.parse(read('package.json'));
const socials=read('src/jyc-socials.js');
const config=read('src/public-v1/config.js');
const siteConfig=read('src/lib/site-config.js');
const index=read('index.html');
const exact=(scheme,host,path)=>[scheme,'//',host,path].join('');
const legacyInstagram=exact('https:','www.instagram.com','/jiityouthclub/','');
const canonicalLinkedIn=exact('https:','in.linkedin.com','/in/jyc128','');
const linktree=exact('https:','linktr.ee','/jiityouthclub','');
const canonicalInstagram=exact('https:','www.instagram.com','/jiityouthclub128/','');
// V1 public-site contract: assertions follow the canonical public routes and current homepage.
const checks=[];
const add=(name,ok)=>checks.push({name,ok:Boolean(ok)});

const lock=JSON.parse(read('package-lock.json'));add('release package version is synchronized',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
add('Official JYC 128 scope is explicit',config.includes('JYC_OFFICIAL_SITE_SCOPE')&&config.includes('JIIT Youth Club 128')&&config.includes('Sector 128'));
add('Public model map excludes utility-portal routes',!read('public/llms.txt').includes('/planner')&&!read('public/llms.txt').includes('/notifications')&&!read('public/llms.txt').includes('/resources'));
add('Public SEO identity is JYC 128',index.includes('JIIT Youth Club 128')&&index.includes('Sector 128, Noida'));
add('Senior navigation includes About, Clubs, Events, Gallery, Leadership and Contact',
  main.includes("['About JYC','/about']")&&main.includes("['Clubs','/clubs']")&&main.includes("['Events','/events']")&&main.includes("['Gallery','/gallery']")&&(main.includes("['Leadership','/team']")||main.includes("['Leadership','/leadership']"))&&main.includes("['Contact','/contact']"));
add('Leadership canonical route exists',main.includes("clean==='/team'||clean==='/leadership'")||main.includes("'/leadership':'JYC 128 Leadership"));
add('Event Calendar canonical alias exists',main.includes("clean==='/calendar'||clean==='/event-calendar'")&&main.includes("'/event-calendar':'JYC 128 Event Calendar"));
add('Join JYC recruitment CTA is clear',editorialHome.includes("nav('/join-jyc')")&&editorialHome.includes('Join JYC'));
add('Home hero has required participation CTAs',editorialHome.includes("nav('/events')")&&editorialHome.includes("nav('/clubs')")&&editorialHome.includes("nav('/join-jyc')"));
add('Home hero uses senior-approved statement',editorialHome.includes('<span>THE VOICE.</span>')&&editorialHome.includes('<span>THE TALENT.</span>')&&editorialHome.includes('<em>THE SPIRIT.</em>'));
add('JYC 128 scope is explicit',main.includes('JIIT · SECTOR 128 · NOIDA')&&main.includes('JIIT YOUTH CLUB'));
add('Events expose upcoming/live/past states',main.includes("['upcoming','Upcoming',upcoming.length]")&&main.includes("['live','Ongoing',live.length]")&&main.includes("['past','Completed',past.length]"));
add('Events expose senior-requested categories',config.includes("JYC_EVENT_CATEGORIES")&&config.includes("'Social'"));
add('Event cards retain organiser, venue and registration data',main.includes('event.club')&&main.includes('event.venue')&&main.includes('registrationUrl'));
add('Verified official registration can remain actionable on planned events',main.includes("event.registrationVerified===true")&&main.includes("e.registrationVerified===true"));
add('Event template contains rules, eligibility, prizes and FAQs',main.includes('rules:[]')&&main.includes('eligibility:')&&main.includes('prizes:[]')&&main.includes('faqs:[]'));
add('Team structure follows Faculty → Apex → Core → Clubs & Hubs',main.includes('Faculty → Apex → Core → Clubs & Hubs')&&main.includes('JYC Apex'));
add('Clubs have recruitment and social fields',main.includes("recruitment:{on:false")&&main.includes("instagram:''")&&main.includes("linkedin:''"));
add('Announcements and Join JYC have dedicated public routes',main.includes("clean==='/announcements'")&&main.includes("clean==='/join-jyc'"));
add('Achievements page is intentionally retired',!main.includes('function Achievements(')&&main.includes("if(clean==='/achievements')return <Navigate to=\"/about\" replace/>;"));
add('Gallery remains public in V1',main.includes("clean==='/gallery'"));
add('Find Your Community discovery is present',main.includes('JYC COMMUNITY MAP')&&main.includes('Build & code')&&main.includes('Leadership & events'));
add('Recruitment exposes deadlines and application links',extra.includes('RecruitmentHub')&&extra.includes('recruitment.deadline')&&extra.includes('recruitment.link'));
add('Calendar exposes Google Calendar and device ICS export',extra.includes('Google Calendar ↗')&&extra.includes('Add JYC dates to device')&&extra.includes('text/calendar'));
add('Gallery exposes source/credit provenance',extra.includes('gallery-provenance')&&extra.includes('active.credit||active.sourceLabel||active.source'));
add('Community discovery chips map to meaningful search aliases',config.includes("'Build & code'")&&config.includes("'AI & robotics'")&&main.includes('discoveryTerms.some'));
add('Event category filter uses event category/type rather than only organiser family',main.includes('const eventCategoryOf=')&&main.includes('eventCategoryOf(e).toLowerCase()===family.toLowerCase()'));
add('Leadership and gallery have explicit page metadata',main.includes("'/leadership':'JYC 128 Leadership")&&main.includes("'/gallery':'JYC Gallery"));
add('Contact form does not claim success when Supabase is unconfigured',main.includes("if(!supabase.__configured)")&&main.includes("The live contact inbox is not configured yet"));
add('Contact form has name/email/message fields',main.includes('name="name"')&&main.includes('name="email"')&&main.includes('name="message"'));
add('Homepage What JYC Does covers the senior categories',config.includes("title:'Cultural'")&&config.includes("title:'Technical'")&&config.includes("title:'Literary'")&&config.includes("title:'Sports'")&&config.includes("title:'Management'")&&config.includes("title:'Social Outreach'")&&config.includes("title:'Workshops'")&&config.includes("title:'Competitions'"));
add('JYC social identity is explicitly 128-scoped',socials.includes("canonicalCampus: 'sector-128'")&&socials.includes(canonicalLinkedIn)&&socials.includes(canonicalInstagram)&&socials.includes(linktree));
add('JYC contact config uses verified 128 identity',siteConfig.includes("official:'"+linktree+"'")&&siteConfig.includes("instagram:'"+canonicalInstagram+"'")&&siteConfig.includes("linkedin:'"+canonicalLinkedIn+"'")&&!siteConfig.includes("instagram:'"+legacyInstagram+"'"));
add('Organization JSON-LD uses verified 128 identity',index.includes(canonicalLinkedIn)&&index.includes(canonicalInstagram)&&index.includes(linktree)&&!index.includes(legacyInstagram));
add('Club cards surface verified social actions',main.includes('club-socials')&&main.includes('socialProfile(c.name)'));
add('Production does not use demo fallback content',main.includes('allowContentFallback:false')&&main.includes('return norm(empty)'));

const failed=checks.filter(x=>!x.ok);
for(const c of checks)console.log((c.ok?'PASS: ':'FAIL: ')+c.name);
if(failed.length){console.error('JYC V1 senior QA failed: '+failed.length+' check(s)');process.exitCode=1}
else console.log('PASS: JYC V1 senior QA ('+checks.length+' checks)');