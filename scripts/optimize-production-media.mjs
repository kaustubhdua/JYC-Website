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
const logoSource=path.resolve('public/JYC Logo(4).png');
const logoOutput=path.join(root,'assets','jyc-logo.webp');
const logoAvifOutput=path.join(root,'assets','jyc-logo.avif');
const logoTinyAvifOutput=path.join(root,'assets','jyc-logo-48.avif');
const logoSmallAvifOutput=path.join(root,'assets','jyc-logo-small.avif');
const logoMediumAvifOutput=path.join(root,'assets','jyc-logo-medium.avif');
const logoBrandAvifOutput=path.join(root,'assets','jyc-logo-270.avif');
try{
  if(!fs.existsSync(logoSource))throw new Error('Official JYC logo source is missing: '+logoSource);
  fs.mkdirSync(path.dirname(logoOutput),{recursive:true});
  const before=fs.statSync(logoSource).size;
  const image=sharp(logoSource).rotate().resize({width:512,withoutEnlargement:true});
  const webpTemp=logoOutput+'.jyc-opt';
  await image.clone().webp({quality:92,effort:5,alphaQuality:100}).toFile(webpTemp);
  const webpBytes=fs.statSync(webpTemp).size;
  fs.renameSync(webpTemp,logoOutput);
  const avifTemp=logoAvifOutput+'.jyc-opt';
  await image.clone().avif({quality:80,effort:6}).toFile(avifTemp);
  const avifBytes=fs.statSync(avifTemp).size;
  fs.renameSync(avifTemp,logoAvifOutput);
  const tinyAvifTemp=logoTinyAvifOutput+'.jyc-opt';
  await sharp(logoSource).rotate().resize({width:48,withoutEnlargement:true}).avif({quality:80,effort:6}).toFile(tinyAvifTemp);
  const tinyAvifBytes=fs.statSync(tinyAvifTemp).size;
  fs.renameSync(tinyAvifTemp,logoTinyAvifOutput);
  const smallAvifTemp=logoSmallAvifOutput+'.jyc-opt';
  await sharp(logoSource).rotate().resize({width:96,withoutEnlargement:true}).avif({quality:80,effort:6}).toFile(smallAvifTemp);
  const smallAvifBytes=fs.statSync(smallAvifTemp).size;
  fs.renameSync(smallAvifTemp,logoSmallAvifOutput);
  const mediumAvifTemp=logoMediumAvifOutput+'.jyc-opt';
  await sharp(logoSource).rotate().resize({width:192,withoutEnlargement:true}).avif({quality:80,effort:6}).toFile(mediumAvifTemp);
  const mediumAvifBytes=fs.statSync(mediumAvifTemp).size;
  fs.renameSync(mediumAvifTemp,logoMediumAvifOutput);
  const brandAvifTemp=logoBrandAvifOutput+'.jyc-opt';
  await sharp(logoSource).rotate().resize({width:270,withoutEnlargement:true}).avif({quality:80,effort:6}).toFile(brandAvifTemp);
  const brandAvifBytes=fs.statSync(brandAvifTemp).size;
  fs.renameSync(brandAvifTemp,logoBrandAvifOutput);
  console.log('Generated official JYC logo derivatives from '+before+' bytes: WebP '+webpBytes+' bytes; AVIF '+avifBytes+' bytes; 48px AVIF '+tinyAvifBytes+' bytes; 96px AVIF '+smallAvifBytes+' bytes; 192px AVIF '+mediumAvifBytes+' bytes; 270px AVIF '+brandAvifBytes+' bytes.');
}catch(error){
  for(const temp of [logoOutput+'.jyc-opt',logoAvifOutput+'.jyc-opt',logoTinyAvifOutput+'.jyc-opt',logoSmallAvifOutput+'.jyc-opt',logoMediumAvifOutput+'.jyc-opt',logoBrandAvifOutput+'.jyc-opt'])fs.rmSync(temp,{force:true});
  failed++;
  console.warn('Official JYC logo derivative failed:',error?.message||error);
}
console.log('Production media optimization: optimized='+optimized+' skipped='+skipped+' failed='+failed);
if(failed)process.exitCode=1;
