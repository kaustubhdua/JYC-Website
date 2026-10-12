import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
const main=read('src/main.jsx');
const exp=read('src/jyc57-experience.jsx');
const extra=read('src/extra-features.jsx');
const sw=read('public/sw.js');
const readme=read('README.md');

const checks=[];
const add=(name,ok)=>checks.push([name,Boolean(ok)]);

add('release metadata is synchronized to the package release',pkg.version===lock.version&&lock.packages?.['']?.version===pkg.version);
add('service worker cache matches current release',sw.includes('jyc-cache-v'+pkg.version.replace(/\./g,'-')));
add('README release matches current package',readme.includes('Current release: V'+pkg.version));
add('event detail has registration action',/id="event-register"/.test(main)&&/REGISTER NOW|REGISTRATIONS CLOSED/.test(main));
add('event detail gates unverified planned registration and requires an external URL',/registrationPublished=e\.publicStatus!=='planned'\|\|e\.registrationVerified===true/.test(main)&&/Boolean\(safeExternalUrl\(e\.registrationUrl\)\)/.test(main)&&!main.includes("registrationMode==='native'?")&&!main.includes("Boolean(e.registrationUrl||e.registrationMode==='native')"));
add('event detail has share and ICS tools',/ShareButton/.test(main)&&/DownloadICS/.test(main));
add('event detail has source/provenance surface',/Official event sources|source photography|VISUAL RECORD/.test(main));
add('event detail has related event/community links',/relatedEvents/.test(main)&&/relatedClub/.test(main));
add('club detail runtime is preserved',/function ClubDetail/.test(main));
add('club detail supports recruitment and official links',/recruitment/.test(main)&&/socials|website|linkedin|instagram/.test(main));
add('calendar route is preserved',main.includes("clean==='/calendar'")&&main.includes('JYCCalendarPage'));
add('calendar supports Google Calendar',/calendar\.google\.com/.test(main));
add('public calendar exports the selected month as ICS',/const downloadMonthICS=/.test(main)&&/Add month to device/.test(main)&&main.includes("replace(/-/g,'')"));
add('calendar controls expose accessible month semantics',/aria-label="Previous month"/.test(main)&&/aria-label="Next month"/.test(main)&&/aria-live="polite"/.test(main));
add('club side panel chooses the next live/upcoming event',/const upcomingEvents=events\.filter\(e=>eventState\(e\)!=='past'\)/.test(main)&&/upcomingEvents\[0\]/.test(main));
add('calendar/ICS helper remains available',/DownloadICS/.test(main)&&/googleCalendarUrl/.test(main));
add('Sector 128 event boundary remains enforced',/isSector128Venue/.test(main)&&/events\.filter\(e=>isSector128Venue/.test(main));
add('retired Projects/Impact/FAQ navigation remains absent',!main.includes("['/projects','Projects'")&&!main.includes("['/impact','Impact'")&&!main.includes("['/faq','FAQ'"));
add('reduced-motion CSS contract remains present',/prefers-reduced-motion/.test(read('src/styles/public-system.css')));
add('no new animation/icon dependency was introduced',pkg.dependencies?.motion==='14.0.0'&&pkg.dependencies?.gsap==='3.15.0'&&pkg.dependencies?.['@hugeicons/react']==='1.1.10');
add('v57.1 experience routes remain wired',main.includes('JYC57Events')&&main.includes('JYC57Clubs')&&main.includes('JYC57Gallery')&&main.includes('JYC57Archive')&&exp.includes('Sector 128 only'));
add('public event filters are shareable in the URL',exp.includes('syncFilters')&&exp.includes('status')&&exp.includes('category'));
add('gallery dialog traps focus and restores it',exp.includes('dialogRef')&&exp.includes('triggerRef')&&exp.includes("e.key!=='Tab'"));
add('public visual system has 320px-safe sizing',/max-width:320px/.test(read('src/styles/jyc-v58-final.css'))||/min-width:0/.test(read('src/styles/jyc-v58-final.css')));

add('event timeline contract remains present',exp.includes('jyc57-event-timeline'));
add('event card/detail shared transition exists',main.includes('event-media-')&&main.includes('layoutId')&&main.includes('event-detail-poster'));
add('gallery/lightbox shared transition exists',exp.includes('photo-${String(g.id||g.url)}')&&exp.includes('photo-${String(active.id||active.url)}')&&exp.includes('jyc57-lightbox-shared'));
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+' · '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('JYC V58.0.8 production-finish contract PASS ('+checks.length+' checks)');

