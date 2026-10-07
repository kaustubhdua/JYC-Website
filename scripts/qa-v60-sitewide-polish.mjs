import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const checks=[];
const check=(name,ok,detail='')=>{checks.push({name,ok,detail});console.log((ok?'PASS':'FAIL')+': '+name+(detail?' — '+detail:''));};

const main=read('src/main.jsx');
const gallery=read('src/jyc57-experience.jsx');
const editorial=read('src/jyc-editorial-home.jsx');
const flagship=read('src/jyc-next-experience.jsx');
const css=read('src/styles/public-system.css');
const browser=read('scripts/browser-smoke.spec.js');

check('search event links prefer stored event slugs',main.includes("slug(e.slug||e.title)"));
check('search club links use canonical slugs',main.includes("encodeURIComponent(slug(c.name))"));
check('gallery event links prefer stored event slugs',gallery.includes("e?.slug||slugify(e?.title)||e?.id"));
check('gallery initial archive images are mostly lazy',gallery.includes("loading={i<2?'eager':'lazy'}"));
check('gallery featured images cap eager loading at two',gallery.includes("fetchPriority={i<2?'high':undefined}"));
check('editorial home prefers stored event slugs',editorial.includes("e?.slug||e?.title"));
check('flagship experience prefers stored event slugs',flagship.includes("event.slug||event.title"));
check('gallery filter controls meet 44px target',css.includes('.jyc57-filter-group button{min-height:44px'));
check('related album controls meet 44px target',css.includes('.jyc57-related-albums button{min-height:44px'));
check('browser QA covers canonical event navigation',browser.includes("eventCard.click()")&&browser.includes("toMatch(/^\\/events\\/[a-z0-9-]+$/)"));
check('browser QA caps eager gallery images',browser.includes("eagerImages")&&browser.includes("toBeLessThanOrEqual(4)"));

if(checks.some(x=>!x.ok)) process.exit(1);
console.log('V60 sitewide polish QA PASS ('+checks.length+' checks)');
