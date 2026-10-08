import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root=path.resolve('dist');
const MAX_BYTES=3*1024*1024;
const candidates=[];
const walk=dir=>{
  if(!fs.existsSync(dir))return;
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    entry.isDirectory()?walk(file):candidates.push(file);
  }
};
walk(root);
const raster=candidates.filter(f=>/\.(?:png|jpe?g|webp)$/i.test(f));
let optimized=0,skipped=0,failed=0;

for(const file of raster){
  const before=fs.statSync(file).size;
  if(before<=MAX_BYTES){skipped++;continue}
  const ext=path.extname(file).toLowerCase();
  const tmp=file+'.jyc-opt';
  try{
    const image=sharp(file).rotate();
    if(ext==='.jpg'||ext==='.jpeg'){
      await image.jpeg({quality:82,mozjpeg:true,progressive:true}).toFile(tmp);
    }else if(ext==='.png'){
      await image.png({compressionLevel:9,adaptiveFiltering:true,palette:true,quality:92,effort:10}).toFile(tmp);
    }else{
      await image.webp({quality:82,effort:5}).toFile(tmp);
    }
    const after=fs.statSync(tmp).size;
    if(after<before){
      fs.renameSync(tmp,file);
      optimized++;
      console.log('Optimized '+path.relative(process.cwd(),file)+' '+before+' -> '+after+' bytes');
    }else{
      fs.rmSync(tmp,{force:true});
      skipped++;
    }
  }catch(error){
    fs.rmSync(tmp,{force:true});
    failed++;
    console.warn('Production media optimization failed: '+path.relative(process.cwd(),file),error?.message||error);
  }
}
console.log('Production media optimization: optimized='+optimized+' skipped='+skipped+' failed='+failed);
if(failed)process.exitCode=1;
