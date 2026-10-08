import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const checks=[];
const check=(name,ok,detail='')=>{checks.push(ok);console.log((ok?'PASS':'FAIL')+': '+name+(detail?' — '+detail:''));};
const main=read('src/main.jsx'), gallery=read('src/jyc57-experience.jsx'), motion=read('src/v18.18-motion.jsx'), spotlight=read('src/jyc-spotlight.jsx'), pkg=JSON.parse(read('package.json')), lock=JSON.parse(read('package-lock.json')), sw=read('public/sw.js');
check('release version is 61.0.0',pkg.version==='61.0.0'&&lock.version==='61.0.0'&&lock.packages?.['']?.version==='61.0.0');
check('service worker cache rotated',sw.includes('jyc-cache-v61-0-0')&&!sw.includes('jyc-cache-v60-0-0'));
check('event search URLs prefer stored slugs',main.includes('slug(e.slug||e.title)'));
check('gallery event cards use canonical eventPath',gallery.includes('onClick={()=>nav(eventPath(e))}'));
check('club cards use canonical slugs',gallery.includes("encodeURIComponent(slugify(c.name))"));
check('archive rows use canonical eventPath',gallery.includes('jyc57-archive-row')&&gallery.includes('onClick={()=>nav(eventPath(e))}'));
check('gallery related community uses a slug',gallery.includes("slugify(String(active.association).split(' · ')[0])"));
check('legacy motion event routes prefer stored slugs',motion.includes('slug18(e.slug||e.title)'));
check('legacy motion club routes prefer stored slugs',motion.includes('slug18(c.slug||c.name)'));
check('spotlight event route prefers stored slug',spotlight.includes('spotlight.event.slug||spotlight.event.title'));
const bad=[
  "/events/'+(e.id||e.title)",
  "/clubs/'+(c.id||c.name)",
  "/events/'+slug(spotlight.event.title)",
  "`/events/${slug18(e.title)}`"
];
for(const needle of bad) check('no legacy route pattern: '+needle,!gallery.includes(needle)&&!main.includes(needle)&&!motion.includes(needle)&&!spotlight.includes(needle));
if(checks.some(x=>!x)) process.exit(1);
console.log('V61 FINALIZATION QA PASS ('+checks.length+' checks)');
