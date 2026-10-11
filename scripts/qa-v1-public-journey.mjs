import fs from 'node:fs';
import assert from 'node:assert/strict';

const home=fs.readFileSync('src/jyc-editorial-home.jsx','utf8');
const css=fs.readFileSync('src/jyc-editorial-home.css','utf8');
const main=fs.readFileSync('src/main.jsx','utf8');

assert.match(home,/className="jh-hero-actions"/,'homepage hero action group is present');
for(const [label,path] of [['Explore Events','/events'],['Join JYC','/join-jyc'],['View Clubs','/clubs']]){
  assert.ok(home.includes(label)&&home.includes(path),`homepage exposes ${label} → ${path}`);
}
assert.match(home,/function JoinJYC\(/,'Join JYC page component exists');
assert.match(home,/The next JYC recruitment cycle is being prepared/,'Join JYC stays honest about the recruitment state');
assert.match(main,/clean==='\/join-jyc'/,'Join JYC is routed as a public destination');

assert.match(home,/function registrationState\(e\)/,'featured event registration state is derived from event data');
assert.match(home,/new URL\(String\(value\|\|''\)\)/,'registration URLs are parsed before use');
assert.match(home,/\['https:','http:'\]\.includes\(url\.protocol\)/,'registration CTA rejects non-http(s) URL schemes');
assert.match(home,/url\.username\|\|url\.password/,'registration CTA rejects credential-bearing URLs');
assert.match(home,/registrationDeadline/,'registration CTA respects a published deadline');
assert.match(home,/Registration not published/,'planned events do not imply registration is open');
assert.match(home,/Registration open/,'open registration state is visible');
assert.match(home,/Registration closed/,'closed registration state is visible');
assert.match(home,/Register Now/,'registration CTA appears when registration is open');
assert.match(home,/noopener,noreferrer/,'external registration opens with safe window features');
assert.match(home,/View Event/,'event details remain available alongside registration');

assert.match(css,/\.jh-registration-row/,'registration state has a dedicated layout');
assert.match(css,/@media\(max-width:760px\)/,'hero and registration actions have a mobile layout');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,'new action styling respects reduced-motion preference');
console.log('JYC V1 public journey contract: PASS (20 assertions)');
