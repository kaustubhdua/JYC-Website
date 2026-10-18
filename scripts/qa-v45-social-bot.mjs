import fs from 'node:fs';
import validator from 'gltf-validator';

const read=p=>fs.readFileSync(p,'utf8');
const main=read('src/main.jsx');
const bot=read('src/jyc-bot.jsx');
const assistant=read('src/jyc-assistant.jsx');
const popup=read('src/featured-event-popup.jsx');
const socials=read('src/jyc-socials.js');
const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));

const modelPath='public/models/1780947277181-w2z6yhqv.glb';
const modelExists=fs.existsSync(modelPath);
const model=modelExists?fs.readFileSync(modelPath):null;
let modelJson=null,modelChunks=[],modelError='';
if(model){
 try{
  const declared=model.readUInt32LE(8);
  let offset=12;
  while(offset<declared){
   if(offset+8>declared)throw new Error('truncated chunk header');
   const length=model.readUInt32LE(offset),type=model.readUInt32LE(offset+4),start=offset+8,end=start+length;
   if(end>declared)throw new Error('chunk extends beyond declared file length');
   const bytes=model.subarray(start,end);
   modelChunks.push({type,length,bytes});
   if(type===0x4e4f534a)modelJson=JSON.parse(bytes.toString('utf8').replace(/[\\u0000\\u0020]+$/g,''));
   offset=end;
  }
  if(offset!==declared)throw new Error('chunk boundary does not equal declared length');
 }catch(error){modelError=String(error?.message||error)}
}
let khronosReport=null,khronosError='';
if(model){
 try{
  khronosReport=await validator.validateBytes(new Uint8Array(model),{uri:modelPath,format:'glb',writeTimestamp:false,maxIssues:0});
 }catch(error){khronosError=String(error?.message||error)}
}
const khronosMessages=khronosReport?.issues?.messages||[];
const khronosErrors=khronosMessages.filter(issue=>issue.severity===0);
const khronosWarnings=khronosMessages.filter(issue=>issue.severity===1);
if(khronosReport)console.log('Khronos glTF Validator:',JSON.stringify({version:validator.version(),errors:khronosErrors.length,warnings:khronosWarnings.length,infos:khronosMessages.filter(issue=>issue.severity>=2).length}));
for(const issue of khronosErrors.concat(khronosWarnings))console.log(issue.severity===0?'GLTF ERROR':'GLTF WARNING',issue.code,issue.pointer||'',issue.message);
if(khronosError)console.error('Khronos glTF Validator could not validate asset:',khronosError);
const jsonChunk=modelChunks.find(c=>c.type===0x4e4f534a);
const binChunk=modelChunks.find(c=>c.type===0x004e4942);
const glbStructuralChecks=[
 [Boolean(khronosReport)&&!khronosError,'Khronos glTF Validator parsed the supplied GLB'],
 [Boolean(khronosReport)&&khronosErrors.length===0,'Khronos glTF Validator reports zero severity-0 errors'],

 [modelExists,'assistant GLB exists at runtime path'],
 [Boolean(model)&&model.length>20&&model.length<=3*1024*1024,'assistant GLB is within 3 MiB budget'],
 [Boolean(model)&&model.toString('ascii',0,4)==='glTF'&&model.readUInt32LE(4)===2&&model.readUInt32LE(8)===model.length,'assistant GLB magic/version/declared length match'],
 [Boolean(jsonChunk)&&Boolean(modelJson)&&Array.isArray(modelJson.asset?.version)&&false || Boolean(jsonChunk)&&modelJson?.asset?.version==='2.0','GLB contains parseable glTF 2.0 JSON chunk'],
 [modelChunks.length>=1&&modelChunks[0]?.type===0x4e4f534a,'GLB JSON chunk is first and chunk framing is valid'],
 [Boolean(modelJson)&&Array.isArray(modelJson.meshes)&&modelJson.meshes.length>0&&modelJson.meshes.every(m=>Array.isArray(m.primitives)&&m.primitives.length>0),'GLB contains meshes and drawable primitives'],
 [Boolean(modelJson)&&Array.isArray(modelJson.nodes)&&modelJson.nodes.length>0&&modelJson.nodes.some(n=>Number.isInteger(n.mesh)),'GLB has scene nodes referencing meshes'],
 [Boolean(modelJson)&&Array.isArray(modelJson.materials)&&modelJson.materials.length>0,'GLB contains materials'],
 [Boolean(modelJson)&&Array.isArray(modelJson.images)&&modelJson.images.length>0&&modelJson.images.every(i=>Number.isInteger(i.bufferView))&&Array.isArray(modelJson.bufferViews),'GLB textures/images are embedded using buffer views'],
 [Boolean(modelJson)&&Array.isArray(modelJson.buffers)&&modelJson.buffers.length>0&&modelJson.buffers.every(b=>Number.isInteger(b.byteLength)&&b.byteLength>0&&b.byteLength<=((binChunk?.length)||0)),'GLB buffer declarations fit the embedded binary chunk'],
 [Boolean(modelJson)&&modelJson.extensionsUsed?.includes('EXT_texture_webp')&&modelJson.extensionsRequired?.includes('EXT_texture_webp')&&modelJson.textures?.filter(t=>Number.isInteger(t.extensions?.EXT_texture_webp?.source)).length===3,'embedded WebP textures use required EXT_texture_webp declarations'],
 [!modelError,'GLB chunk structure and glTF JSON parse without errors']
];
const checks=[
 [pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version,'release metadata matches lockfile'],
 [main.includes("const LazyJYCBot=lazy(()=>import('./jyc-bot.jsx').then(m=>({default:m.JYCBot})));")&&main.includes('<LazyJYCBot'),'bot runtime is isolated in a lazy-loaded launcher chunk'],
 [main.includes("import {FeaturedEventPopup} from './featured-event-popup.jsx';")&&main.includes('<FeaturedEventPopup'),'featured event popup is mounted in the public shell'],
 [!main.includes('function FirstVisitTour(')&&!main.includes('<FirstVisitTour/>'),'obsolete first-visit tour does not compete with the persistent featured event'],
 [bot.includes('/models/1780947277181-w2z6yhqv.glb')&&bot.includes('camera-orbit="0deg 75deg auto"')&&bot.includes('disable-zoom'),'supplied bot uses a fixed, non-auto-rotating camera'],
 [bot.includes('is-wave')&&bot.includes('jycBotWave'),'bot click has a purposeful wave interaction'],
 [assistant.includes('rankSearchResults')&&assistant.includes('published JYC content first'),'assistant is source-grounded and reuses the public search relevance engine'],
 [popup.includes('unstop.com/o/XAfa40i')&&popup.includes('discord.gg/K6vrFAhMA')&&popup.includes('jiityouthclub128.in'),'JAI popup contains official registration, Discord and website routes'],
 [popup.includes("const FEATURED_EVENT_DISMISS_KEY='jyc-featured-jai-2026-dismissed-until'")&&popup.includes('FEATURED_EVENT_DISMISS_MS=3*24*60*60*1000')&&popup.includes('EVENT_POPUP_DELAY_MS=10000')&&popup.includes("localStorage.getItem(FEATURED_EVENT_DISMISS_KEY)")&&popup.includes('min-width: 761px'),'featured JAI popup is delayed, desktop-gated and respects dismissal cooldown'],
 [socials.includes('@auraphotography.128')&&socials.includes('@eloquencej128')&&socials.includes('@cypherx_jiit')&&socials.includes('@arcadia_jiit')&&socials.includes('@vamunique'),'PDF-verified club Instagram handles are represented'],
 ...glbStructuralChecks
];
let failed=false;
for(const [ok,label] of checks){console.log(ok?'PASS':'FAIL',label);if(!ok)failed=true}
process.exit(failed?1:0);
