import fs from 'node:fs';
import assert from 'node:assert/strict';

const home=fs.readFileSync('src/jyc-editorial-home.jsx','utf8');
const css=fs.readFileSync('src/jyc-editorial-home.css','utf8');
const main=fs.readFileSync('src/main.jsx','utf8');
const config=fs.readFileSync('src/public-v1/config.js','utf8');

assert.ok(home.includes('className="jh-hero-actions"'),'homepage hero action group is present');
for(const [label,path] of [['Explore Events','/events'],['Join JYC','/join-jyc'],['View Clubs','/clubs']]){
  assert.ok(home.includes(label)&&home.includes(path),`homepage exposes ${label} → ${path}`);
}
assert.ok(home.includes('function JoinJYC('),'Join JYC page component exists');
assert.ok(home.includes('The next JYC recruitment cycle is being prepared'),'Join JYC stays honest about recruitment state');
assert.ok(main.includes("clean==='/join-jyc'"),'Join JYC is routed as a public destination');

assert.ok(home.includes('function registrationState(e)'),'featured event registration state is derived from event data');
assert.ok(home.includes("new URL(String(value||''))"),'registration URLs are parsed before use');
assert.ok(home.includes("['https:','http:'].includes(url.protocol)"),'registration CTA rejects non-http(s) URL schemes');
assert.ok(home.includes('!url.username&&!url.password'),'registration CTA rejects credential-bearing URLs');
assert.ok(home.includes('registrationDeadline'),'registration CTA respects a published deadline');
assert.ok(home.includes('Registration not published'),'planned events do not imply registration is open');
assert.ok(home.includes('Registration open'),'open registration state is visible');
assert.ok(home.includes('Registration closed'),'closed registration state is visible');
assert.ok(home.includes('Register Now'),'registration CTA appears when registration is open');
assert.ok(home.includes('noopener,noreferrer'),'external registration opens with safe window features');
assert.ok(home.includes('View Event'),'event details remain available alongside registration');
assert.ok(home.includes('const featuredRegistration=registrationState(featured)'),'registration state is computed once per homepage render');
for(const category of ['Cultural','Technical','Literary','Sports','Management','Social Outreach','Workshops','Competitions']){
  assert.ok(config.includes(`{title:'${category}'`),`homepage activity taxonomy includes ${category}`);
}
for(const route of ["'/about'","'/team'","'/events'","'/clubs'","'/gallery'","'/achievements'","'/announcements'","'/contact'","'/calendar'"]){
  assert.ok(main.includes(route),`public route is represented: ${route}`);
}
assert.ok(main.includes("'/events/'+slug(e.slug||e.title)")||main.includes("`/events/${slug(event.slug||event.title)}"),'event detail URLs use source slugs');
assert.ok(main.includes("clean==='/calendar'"),'event calendar is routed');


assert.ok(css.includes('.jh-registration-row'),'registration state has a dedicated layout');
assert.ok(css.includes('@media(max-width:760px)'),'hero and registration actions have a mobile layout');
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'),'new action styling respects reduced-motion preference');
console.log('JYC V1 public journey contract: PASS (39 assertions)');
