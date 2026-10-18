import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const bot=read('src/jyc-bot.jsx');
const assistant=read('src/jyc-assistant.jsx');
const main=read('src/main.jsx');
const theme=read('src/jyc-logo-final-theme.css');
const publicEntry=read('src/styles/public-entry.css');
const pkg=JSON.parse(read('package.json'));
const lock=JSON.parse(read('package-lock.json'));
const modelPath=path.join(root,'public/models/1780947277181-w2z6yhqv.glb');
const distModelPath=path.join(root,'dist/models/1780947277181-w2z6yhqv.glb');
const model=fs.existsSync(modelPath)?fs.readFileSync(modelPath):null;
let gltf=null,chunks=[],parseError='';
if(model){
 try{
  if(model.length<20)throw new Error('file shorter than a GLB header and chunk');
  if(model.toString('ascii',0,4)!=='glTF')throw new Error('invalid GLB magic');
  if(model.readUInt32LE(4)!==2)throw new Error('unsupported GLB version');
  if(model.readUInt32LE(8)!==model.length)throw new Error('declared file length mismatch');
  let offset=12;
  while(offset<model.length){
   if(offset+8>model.length)throw new Error('truncated chunk header');
   const length=model.readUInt32LE(offset),type=model.readUInt32LE(offset+4);
   const start=offset+8,end=start+length;
   if(end>model.length)throw new Error('chunk exceeds file length');
   const data=model.subarray(start,end);
   chunks.push({type,length,start,end,data});
   if(type===0x4e4f534a)gltf=JSON.parse(data.toString('utf8').replace(/[\u0000\u0020]+$/g,''));
   offset=end;
  }
  if(offset!==model.length)throw new Error('chunk boundary mismatch');
 }catch(error){parseError=String(error?.message||error)}
}
const jsonChunk=chunks.find(c=>c.type===0x4e4f534a);
const binChunk=chunks.find(c=>c.type===0x004e4942);
const bufferViews=gltf?.bufferViews||[];
const accessors=gltf?.accessors||[];
const meshPrimitives=(gltf?.meshes||[]).flatMap(mesh=>mesh.primitives||[]);
const textureSource=texture=>Number.isInteger(texture?.source)?texture.source:texture?.extensions?.EXT_texture_webp?.source;
let pass=0,fail=0;
const check=(label,ok)=>{console.log((ok?'PASS: ':'FAIL: ')+label);if(ok)pass++;else fail++;};

check('package and lockfile release versions are synchronized',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
check('public entry stylesheet is wired into the active public app',/import\s+['"][^'"]*styles\/public-entry\.css['"]/.test(main)&&publicEntry.includes("@import './public-system.css';"));
check('JYC beige/ink/oxblood/champagne tokens are explicit',theme.includes('--jyc-cream:#F5F1E6')&&theme.includes('--jyc-ink:#1A191D')&&theme.includes('--accent-red:#A82420')&&theme.includes('--jyc-champagne:#BF9C6F'));
check('light and dark modes define intentional public surfaces',theme.includes('html[data-theme="light"]')&&theme.includes('html[data-theme="dark"]')&&theme.includes('--jyc-surface:#FFFFFF')&&theme.includes('--jyc-surface:#18161D'));
check('launcher uses the supplied GLB at its canonical runtime path',bot.includes('src="/models/1780947277181-w2z6yhqv.glb"')&&bot.includes('data-jyc-glb-src="/models/1780947277181-w2z6yhqv.glb"'));
check('launcher poster/logo fallback is present during load or failure',bot.includes('poster="/assets/jyc-logo-48.avif"')&&bot.includes('jyc-bot-model-fallback')&&bot.includes('jyc-logo-48.avif')&&bot.includes('onError={handleModelError}'));
check('assistant exposes model error and WebGL context-loss fallback',bot.includes('onContextLost={handleViewerContextLost}')&&bot.includes('const handleViewerContextLost')&&bot.includes('setModelFailed(true)'));
check('assistant preserves reduced-motion and constrained-device policy',bot.includes('prefers-reduced-motion: reduce')&&bot.includes('navigator.connection?.saveData')&&bot.includes("dataset.performance==='lite'"));
check('model camera remains fixed with zoom and pan disabled',bot.includes('camera-orbit="0deg 75deg auto"')&&bot.includes('disable-zoom')&&bot.includes('disable-pan')&&!bot.includes('camera-controls')&&!bot.includes('auto-rotate'));
check('chat panel maintains semantic dialog and keyboard close handling',assistant.includes('aria-modal="true"')&&assistant.includes("e.key==='Escape'")&&assistant.includes('onClose'));
check('GLB stays within the 3 MiB delivery budget',Boolean(model)&&model.length>20&&model.length<=3*1024*1024);
check('GLB header, version, declared length and chunk framing are valid',Boolean(model)&&!parseError&&model.toString('ascii',0,4)==='glTF'&&model.readUInt32LE(4)===2&&model.readUInt32LE(8)===model.length&&chunks.length>=2&&chunks[0]?.type===0x4e4f534a&&chunks[1]?.type===0x004e4942);
check('GLB JSON is glTF 2.0 with a valid default scene',gltf?.asset?.version==='2.0'&&Number.isInteger(gltf.scene)&&(gltf.scenes||[])[gltf.scene]?.nodes?.length>0);
check('GLB scene graph references valid mesh and node indices',Array.isArray(gltf?.nodes)&&gltf.nodes.length>0&&gltf.nodes.every(n=>n.mesh===undefined||(Number.isInteger(n.mesh)&&n.mesh>=0&&n.mesh<(gltf.meshes||[]).length))&&(gltf.scenes||[]).every(scene=>scene.nodes.every(n=>Number.isInteger(n)&&n>=0&&n<gltf.nodes.length)));
check('GLB includes drawable triangle primitives with position, normal and UV attributes',meshPrimitives.length>0&&meshPrimitives.every(p=>(p.mode===undefined||p.mode===4)&&['POSITION','NORMAL','TEXCOORD_0'].every(a=>Number.isInteger(p.attributes?.[a])&&accessors[p.attributes[a]])));
check('GLB accessor and buffer-view ranges stay inside the binary buffer',Boolean(binChunk)&&Array.isArray(gltf?.buffers)&&gltf.buffers.length>0&&gltf.buffers.every(b=>Number.isInteger(b.byteLength)&&b.byteLength>0&&b.byteLength<=binChunk.length)&&bufferViews.every(v=>Number.isInteger(v.byteLength)&&v.byteLength>0&&Number.isInteger(v.byteOffset||0)&&(v.byteOffset||0)+v.byteLength<=gltf.buffers[v.buffer??0]?.byteLength)&&accessors.every(a=>Number.isInteger(a.count)&&a.count>0&&Number.isInteger(a.componentType)&&typeof a.type==='string'&&(a.bufferView===undefined||(Number.isInteger(a.bufferView)&&a.bufferView>=0&&a.bufferView<bufferViews.length))));
check('GLB materials reference valid textures and embedded images',Array.isArray(gltf?.materials)&&gltf.materials.length>0&&Array.isArray(gltf?.textures)&&gltf.textures.length>0&&Array.isArray(gltf?.images)&&gltf.images.length>0&&gltf.images.every(i=>i.mimeType==='image/webp'&&Number.isInteger(i.bufferView)&&i.bufferView>=0&&i.bufferView<bufferViews.length)&&meshPrimitives.every(p=>Number.isInteger(p.material)&&p.material>=0&&p.material<gltf.materials.length));
check('embedded WebP textures use the declared EXT_texture_webp extension',gltf?.extensionsUsed?.includes('EXT_texture_webp')&&gltf?.extensionsRequired?.includes('EXT_texture_webp')&&gltf.textures.every(t=>Number.isInteger(textureSource(t))&&textureSource(t)>=0&&textureSource(t)<gltf.images.length));
check('GLB chunks parse cleanly without structural errors',!parseError&&Boolean(jsonChunk)&&Boolean(binChunk)&&chunks.every(c=>c.length===c.end-c.start+0));
check('GLB mesh primitives reference valid materials',Array.isArray(gltf?.materials)&&gltf.materials.length>0&&meshPrimitives.length>0&&meshPrimitives.every(p=>Number.isInteger(p.material)&&p.material>=0&&p.material<gltf.materials.length));
check('GLB node and scene references stay within valid index ranges',Array.isArray(gltf?.nodes)&&gltf.nodes.every(n=>n.mesh===undefined||(Number.isInteger(n.mesh)&&n.mesh>=0&&n.mesh<(gltf.meshes||[]).length))&&(gltf.scenes||[]).every(scene=>Array.isArray(scene.nodes)&&scene.nodes.every(n=>Number.isInteger(n)&&n>=0&&n<gltf.nodes.length)));
check('GLB position, normal and UV accessors are present for rendered mesh primitives',meshPrimitives.length>0&&meshPrimitives.every(p=>['POSITION','NORMAL','TEXCOORD_0'].every(a=>Number.isInteger(p.attributes?.[a])&&accessors[p.attributes[a]])));
check('GLB sampler/image texture source references resolve to embedded images',Array.isArray(gltf?.textures)&&gltf.textures.length>0&&gltf.textures.every(t=>{const src=textureSource(t);return Number.isInteger(src)&&src>=0&&src<(gltf.images||[]).length;}));
check('normalized model is present in production build output',fs.existsSync(distModelPath));
if(fs.existsSync(distModelPath)&&model){
 const built=fs.readFileSync(distModelPath);
 check('built GLB is byte-for-byte identical to the validated source model',built.length===model.length&&built.equals(model));
 check('built GLB retains the 3 MiB transfer limit',built.length<=3*1024*1024);
}

// Exercise the actual Vite production preview server rather than approximating
// static-file headers. This intentionally does not call Vercel or any cloud API.
const previewBin=path.join(root,'node_modules/vite/bin/vite.js');
if(!fs.existsSync(previewBin)){
 check('Vite preview binary exists for HTTP asset-delivery verification',false);
}else{
 const child=spawn(process.execPath,[previewBin,'preview','--host','127.0.0.1','--port','4179','--strictPort'],{cwd:root,stdio:'ignore'});
 try{
  let ready=false;
  for(let i=0;i<60&&!ready;i++){
   if(child.exitCode!==null)break;
   try{const response=await fetch('http://127.0.0.1:4179/');ready=response.ok;}catch{}
   if(!ready)await new Promise(resolve=>setTimeout(resolve,250));
  }
  check('Vite production preview starts for HTTP asset-delivery verification',ready);
  if(ready){
   const url='http://127.0.0.1:4179/models/1780947277181-w2z6yhqv.glb';
   const response=await fetch(url);
   const bytes=Buffer.from(await response.arrayBuffer());
   const contentType=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
   check('served GLB returns HTTP 200 with model/gltf-binary content type',response.status===200&&contentType==='model/gltf-binary');
   check('served content length and bytes match production asset',bytes.length>0&&Number(response.headers.get('content-length'))===bytes.length&&Boolean(model)&&bytes.equals(model));
   check('served static asset exposes a revalidation/cache validator',Boolean(response.headers.get('etag')||response.headers.get('last-modified'))&&!/no-store/i.test(response.headers.get('cache-control')||''));
   const etag=response.headers.get('etag');
   if(etag){
    const conditional=await fetch(url,{headers:{'If-None-Match':etag}});
    check('conditional asset request returns HTTP 304 without retransmitting the model',conditional.status===304);
    await conditional.arrayBuffer().catch(()=>{});
   }else{
    const modified=response.headers.get('last-modified');
    if(modified){
     const conditional=await fetch(url,{headers:{'If-Modified-Since':modified}});
     check('conditional asset request returns HTTP 304 without retransmitting the model',conditional.status===304);
     await conditional.arrayBuffer().catch(()=>{});
    }else check('conditional asset request returns HTTP 304 without retransmitting the model',false);
   }
  }
 }catch(error){
  console.error('Asset HTTP verification exception:',String(error?.stack||error));
  check('Vite production preview serves the validated GLB',false);
 }finally{
  child.kill('SIGTERM');
  await new Promise(resolve=>setTimeout(resolve,100));
  if(child.exitCode===null)child.kill('SIGKILL');
 }
}
console.log('Assistant/brand/delivery QA: '+pass+'/'+(pass+fail)+' passed.');
if(fail)process.exit(1);
