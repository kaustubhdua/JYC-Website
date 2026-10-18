import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const main=read('src/main.jsx');
const bot=read('src/jyc-bot.jsx');
const assistant=read('src/jyc-assistant.jsx');
const popup=read('src/featured-event-popup.jsx');
const socials=read('src/jyc-socials.js');
const pkg=JSON.parse(read('package.json'));

const checks=[
 [pkg.version==='50.0.0','V50 current release'],
 [main.includes("import {JYCBot} from './jyc-bot.jsx';")&&!main.includes('function JYCBot('),'bot runtime is isolated from main.jsx'],
 [main.includes("import {FeaturedEventPopup} from './featured-event-popup.jsx';")&&main.includes('<FeaturedEventPopup/>'),'featured event popup is mounted in the public shell'],
 [!main.includes('function FirstVisitTour(')&&!main.includes('<FirstVisitTour/>'),'obsolete first-visit tour does not compete with the persistent featured event'],
 [bot.includes('/models/1780947277181-w2z6yhqv.glb')&&bot.includes('camera-orbit="0deg 75deg auto"')&&bot.includes('disable-zoom'),'supplied bot uses a fixed, non-auto-rotating camera'],
 [bot.includes('is-wave')&&bot.includes('jycBotWave'),'bot click has a purposeful wave interaction'],
 [assistant.includes('rankSearchResults')&&assistant.includes('published JYC content first'),'assistant is source-grounded and reuses the public search relevance engine'],
 [popup.includes('unstop.com/o/XAfa40i')&&popup.includes('discord.gg/K6vrFAhMA')&&popup.includes('jiityouthclub128.in'),'JAI popup contains official registration, Discord and website routes'],
 [popup.includes('useState(true)')&&!popup.includes('storageGet'),'JAI popup is shown on every fresh public visit, including returning users'],
 [socials.includes('@auraphotography.128')&&socials.includes('@eloquencej128')&&socials.includes('@cypherx_jiit')&&socials.includes('@arcadia_jiit')&&socials.includes('@vamunique'),'PDF-verified club Instagram handles are represented'],
 [fs.existsSync('public/models/1780947277181-w2z6yhqv.glb'),'assistant GLB is present at the runtime path'],
 [(()=>{const p='public/models/1780947277181-w2z6yhqv.glb';if(!fs.existsSync(p))return false;const b=fs.readFileSync(p);return b.length>20&&b.length<=3*1024*1024&&b.toString('ascii',0,4)==='glTF'&&b.readUInt32LE(4)===2&&b.readUInt32LE(8)===b.length})(),'assistant GLB has a valid GLB 2.0 header and stays within the 3 MiB budget']
];
let failed=false;
for(const [ok,label] of checks){console.log(ok?'PASS':'FAIL',label);if(!ok)failed=true}
process.exit(failed?1:0);
