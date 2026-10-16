import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const checks=[];
const check=(name,ok,detail='')=>{checks.push(ok);console.log((ok?'PASS':'FAIL')+': '+name+(detail?' — '+detail:''));};
const main=read('src/main.jsx'), gallery=read('src/jyc57-experience.jsx'), motion=read('src/v18.18-motion.jsx'), spotlight=read('src/jyc-spotlight.jsx'), pkg=JSON.parse(read('package.json')), lock=JSON.parse(read('package-lock.json')), sw=read('public/sw.js');
check('release metadata is synchronized',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version&&Number(String(pkg.version).split('.')[0])>=61);
const cacheToken='jyc-cache-v'+String(pkg.version).replace(/\./g,'-');
check('service worker cache matches current release',sw.includes(cacheToken));
check('event search URLs prefer stored slugs',main.includes('slug(e.slug||e.title)'));
check('gallery event cards use canonical eventPath',gallery.includes('onClick={()=>nav(eventPath(e))}'));
check('club cards use canonical slugs',gallery.includes("encodeURIComponent(slugify(c.name))"));
check('archive rows use canonical eventPath',gallery.includes('jyc57-archive-row')&&gallery.includes('onClick={()=>nav(eventPath(e))}'));
check('gallery community filter recognises source-backed clubs and hubs',gallery.includes("const isCommunity = /club|community|hub|society/i.test(mediaHay)")&&gallery.includes("Object.keys(JYC_HUB_CONTENT).some(name=>mediaHay.includes(name.toLowerCase()))"));
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
console.log('ROUTING FINALIZATION QA PASS ('+checks.length+' checks)');
