import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const {JYC_SOURCE_ARCHIVE_PHOTO_ITEMS}=await import('../src/jyc-source-media.js');
const allowedArchive=new Set(JYC_SOURCE_ARCHIVE_PHOTO_ITEMS.map(item=>String(item?.url||'')));
const root=path.resolve('public/assets');
const outputRoot=path.resolve('public/assets/photo-derivatives');
const WIDTHS=[320,480,640,960,1280,1600,2400];
const ALLOWED=['source-archive','hub-photos','hub-photos-extra'];
const inputFiles=[];
const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(/\.(jpe?g|png|webp)$/i.test(file))inputFiles.push(file)}};
walk(root);
const sourceFiles=inputFiles.filter(file=>{if(file.includes(path.join('photo-derivatives',path.sep)))return false;const url='/assets/'+path.relative(root,file).replaceAll(path.sep,'/');if(url.startsWith('/assets/source-archive/'))return allowedArchive.has(url);return ALLOWED.some(folder=>url.startsWith('/assets/'+folder+'/'));});
let generated=0,failed=0,skipped=0;
for(const file of sourceFiles){
 const rel=path.relative(root,file).replaceAll(path.sep,'/');
 const base=rel.replace(/\.(jpe?g|png|webp)$/i,'');
 const outDir=path.join(outputRoot,path.dirname(rel));
 fs.mkdirSync(outDir,{recursive:true});
 try{
  const meta=await sharp(file).metadata();
  if(!meta.width||!meta.height){skipped++;continue}
  for(const width of WIDTHS){
   if(width>meta.width*1.15)continue;
   for(const format of ['avif','webp']){
    const out=path.join(outDir,path.basename(base)+'-'+width+'.'+format);
    if(fs.existsSync(out))continue;
    const pipeline=sharp(file).rotate().resize({width,withoutEnlargement:true});
    if(format==='avif')await pipeline.avif({quality:52,effort:4}).toFile(out);
    else await pipeline.webp({quality:82,effort:4}).toFile(out);
    generated++;
   }
  }
 }catch(error){failed++;console.warn('Derivative failed:',rel,error?.message||error)}
}
console.log('Photo derivatives: generated='+generated+' skipped='+skipped+' failed='+failed);
if(failed>0)process.exitCode=1;
