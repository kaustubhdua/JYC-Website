import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const root=path.resolve('public/assets');
const out=path.resolve('public/photo-intelligence-report.json');
const {JYC_SOURCE_ARCHIVE_PHOTO_ITEMS}=await import('../src/jyc-source-media.js');
const allowed=new Set(JYC_SOURCE_ARCHIVE_PHOTO_ITEMS.map(x=>String(x?.url||'')));
const files=[];
const walk=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(/\\.(jpe?g|png|webp)$/i.test(f))files.push(f)}};
walk(root);
const selected=files.filter(file=>{if(file.includes(path.join('photo-derivatives',path.sep)))return false;const url='/assets/'+path.relative(root,file).replaceAll(path.sep,'/');return url.startsWith('/assets/source-archive/')?allowed.has(url):(url.startsWith('/assets/hub-photos/')||url.startsWith('/assets/hub-photos-extra/'))});
const hamming=(a,b)=>{let x=0;for(let i=0;i<a.length;i++){let v=a.charCodeAt(i)^b.charCodeAt(i);while(v){x+=v&1;v>>=1}}return x};
const rows=[];
for(const file of selected){
 try{
  const meta=await sharp(file).metadata();
  const stats=await sharp(file).resize(16,16,{fit:'fill'}).grayscale().raw().toBuffer();
  const mean=stats.reduce((a,b)=>a+b,0)/stats.length;
  let bits='';for(const value of stats)bits+=value>=mean?'1':'0';
  const binary=fs.readFileSync(file);
  const hash=crypto.createHash('sha256').update(binary).digest('hex');
  const s=await sharp(file).stats();
  const technical=Math.max(0,Math.min(5,Math.round(((Number(s.sharpness||0)>90?5:Number(s.sharpness||0)>55?4:Number(s.sharpness||0)>25?3:Number(s.sharpness||0)>8?2:1)+(Number(s.entropy||0)>6?5:Number(s.entropy||0)>4.5?4:Number(s.entropy||0)>3?3:2))/2)));
  rows.push({url:'/assets/'+path.relative(root,file).replaceAll(path.sep,'/'),width:meta.width||null,height:meta.height||null,aspectRatio:meta.width&&meta.height?Number((meta.width/meta.height).toFixed(5)):null,format:meta.format||null,bytes:binary.length,sourceHash:hash,perceptualHash:bits,entropy:Number(s.entropy||0),sharpness:Number(s.sharpness||0),technicalQuality:technical});
 }catch(error){console.warn('Audit failed',file,error?.message||error)}
}
const groups=[];
const used=new Set();
for(let i=0;i<rows.length;i++){
 if(used.has(i))continue;
 const members=[i];
 for(let j=i+1;j<rows.length;j++)if(!used.has(j)&&hamming(rows[i].perceptualHash,rows[j].perceptualHash)<=12)members.push(j);
 if(members.length>1){const id='phash-'+String(groups.length+1).padStart(4,'0');members.forEach(i=>used.add(i));groups.push({id,urls:members.map(i=>rows[i].url)})}
}
const report={version:1,generatedAt:new Date().toISOString(),total:rows.length,uniqueBinaryHashes:new Set(rows.map(x=>x.sourceHash)).size,nearDuplicateGroups:groups,images:rows};
fs.writeFileSync(out,JSON.stringify(report,null,2));
console.log('Photo intelligence report: '+rows.length+' images, '+report.uniqueBinaryHashes+' unique binary hashes, '+groups.length+' near-duplicate groups');
