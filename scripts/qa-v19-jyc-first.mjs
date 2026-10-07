import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const main=fs.readFileSync(path.join(root,'src/main.jsx'),'utf8');
const extra=fs.readFileSync(path.join(root,'src/extra-features.jsx'),'utf8');
const admin=fs.readFileSync(path.join(root,'src/admin-chunk.jsx'),'utf8');
const css=fs.readFileSync(path.join(root,'src/v19.7-jyc-club.css'),'utf8');
const platform=fs.readFileSync(path.join(root,'src/v14-platform.jsx'),'utf8');
const map=fs.readFileSync(path.join(root,'src/v14-platform-plus.jsx'),'utf8');
const checks=[
 ['tutorial is viewport-fixed',css.includes('.onboarding-overlay,.admin-tour-backdrop{position:fixed!important')],
 ['tutorial navigates through JYC pages',main.includes("['01 · CLUBS'")&&main.includes("['02 · EVENTS'")&&main.includes("['03 · MY JYC'")&&main.includes("['04 · MORE'")],
 ['three functional phoenix cards',main.includes('bird-trio-grid')&&main.includes('Communities')&&main.includes('Experiences')&&main.includes('People')],
 ['phoenix core uses JYC pages not Fest Mode',platform.includes("['MY JYC','/my-jyc','node-three'")&&!platform.includes("['FESTS','/fests','node-three'")],
 ['Discover is not public navigation',!main.includes("['Discover','/discover'")],
 ['Fest mode is controlled in system settings',fs.readFileSync(path.join(root,'src/admin-extra.jsx'),'utf8').includes('Fest mode')&&fs.readFileSync(path.join(root,'src/admin-extra.jsx'),'utf8').includes("mode:'fest'")],
 ['recruitment is homepage-only',!main.includes("['/recruitment','Recruitment'")&&!main.includes("['Recruitment','Find clubs with open recruitment.'")&&main.includes('recruitmentEnabled(data)')],
 ['calendar supports Google Calendar',extra.includes('Google Calendar ↗')&&extra.includes('googleCalendarUrl')],
 ['calendar supports saved events',extra.includes('jyc-saved-event-')&&extra.includes('My saved')],
 ['admin menu uses readable labels',admin.includes('admin-nav-label')&&admin.includes("['calendar','Academic Calendar']")&&admin.includes("['platform','Campus Map']")],
 ['student platform tools removed from public shell',!main.includes('STUDENT TOOLS · SUPPORTING JYC')&&!main.includes('student-tools-strip reveal')&&!main.includes('JIIT Shelf + Pulse')&&!main.includes('student guide')],
 ['retired achievement route redirects away',main.includes("if(clean==='/achievements')return <Navigate to=\"/about\" replace/>")],
 ['JYC story is clickable',main.includes('club-story-button')&&main.includes("nav('/about')")],
 ['map has campus summary controls',map.includes('campus-map-summary')&&map.includes('Search JYC venue')],
 ['Edge health check exists',fs.readFileSync(path.join(root,'supabase/functions/admin-management/index.ts'),'utf8').includes("body.action === 'health'")],
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'PASS':'FAIL'}: ${name}`);if(!ok)failed++;}
if(failed)process.exit(1);console.log('JYC-first product QA complete.');
