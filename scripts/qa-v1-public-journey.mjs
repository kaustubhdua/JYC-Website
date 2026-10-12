import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=file=>fs.readFileSync(file,'utf8');
const home=read('src/jyc-editorial-home.jsx');
const css=read('src/jyc-editorial-home.css');
const main=read('src/main.jsx');
const config=read('src/public-v1/config.js');
const registration=read('src/extra-features.jsx');
const gallery=read('src/jyc57-experience.jsx');

const checks=[
  ['homepage hero action group is present',home.includes('className="jh-actions jh-hero-actions"')],
  ['homepage exposes event, club and Join JYC routes',home.includes("nav('/events')")&&home.includes("nav('/clubs')")&&home.includes("nav('/join-jyc')")&&home.includes('Explore Events')&&home.includes('Explore Clubs')&&home.includes('Join JYC')],
  ['homepage has an editorial introduction and lazy activity discovery',home.includes('jh-about-editorial')&&home.includes('LazyActivityBento activities={activities} nav={nav}')],
  ['homepage avoids unsupported hub and student-reach counters',!home.includes('23+ hubs')&&!home.includes('5,000+')&&!home.includes('thousands of students')],
  ['Join JYC route stays honest about recruitment state',main.includes("clean==='/join-jyc'")&&main.includes('function JoinJYC')&&main.includes('coming soon')],
  ['public registration route is external-only after native RPC revocation',registration.includes('Public native registration is disabled.')&&!registration.includes('className="native-registration"')&&!registration.includes("supabase.rpc('jyc_register_for_event'")],
  ['public external registration URL is validated before rendering a CTA',registration.includes('function safeExternalUrl(value)')&&registration.includes("['http:','https:'].includes(u.protocol)")&&registration.includes('safeExternalUrl(event.registrationUrl)')],
  ['event detail derives registration state from verified dates and URLs',main.includes("const registrationPublished=e.publicStatus!=='planned'||e.registrationVerified===true")&&main.includes('Boolean(safeExternalUrl(e.registrationUrl))')&&main.includes('registrationDeadline')],
  ['event registration labels distinguish planned, open and closed states',main.includes('REGISTRATION NOT PUBLISHED')&&main.includes('REGISTRATION CLOSED')&&main.includes('REGISTER NOW')],
  ['external event registration opens with safe window features',main.includes("window.open(safeExternalUrl(e.registrationUrl),'_blank','noopener,noreferrer')")&&main.includes('rel="noopener noreferrer"')],
  ['event detail links use source slugs',main.includes("nav('/events/'+slug(e.slug||e.title))")||main.includes('eventPath(e)')],
  ['event categories come from the current public configuration',config.includes('JYC_EVENT_CATEGORIES')&&config.includes('Technical')&&config.includes('Cultural')&&config.includes('Sports')],
  ['public information routes remain registered',['/about','/team','/events','/clubs','/gallery','/contact','/calendar','/announcements'].every(route=>main.includes(`'${route}'`))],
  ['gallery supports published albums and shareable photo URLs',gallery.includes('jyc_media_albums')&&gallery.includes("params.get('photo')")&&gallery.includes("const albumRoute=value=>'/gallery/'+encodeURIComponent(value)")],
  ['hero and action layouts support mobile and reduced motion',css.includes('@media (max-width: 760px)')&&css.includes('@media (prefers-reduced-motion: reduce)')]
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed){console.error('\nJYC current public journey QA failed: '+failed+' contract(s).');process.exit(1)}
console.log('\nJYC current public journey contract: PASS ('+checks.length+' assertions)');
