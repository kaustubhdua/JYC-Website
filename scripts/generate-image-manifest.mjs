import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('public/assets');
const out=path.resolve('public/image-manifest.json');
const {JYC_SOURCE_ARCHIVE_PHOTO_ITEMS,JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS}=await import('../src/jyc-source-media.js');
const allowedArchiveUrls=new Set([...JYC_SOURCE_ARCHIVE_PHOTO_ITEMS,...JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS].map(item=>String(item?.url||'')));
function png(b){return b.length>=24&&b.toString('ascii',1,4)==='PNG'?{width:b.readUInt32BE(16),height:b.readUInt32BE(20)}:null}
function jpeg(b){if(b.length<4||b[0]!==255||b[1]!==216)return null;let i=2;while(i+9<b.length){if(b[i]!==255){i++;continue}const m=b[i+1];i+=2;if(m===216||m===217||m===1)continue;const n=b.readUInt16BE(i);if(n<2||i+n>b.length)return null;if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(m))return{width:b.readUInt16BE(i+5),height:b.readUInt16BE(i+3)};i+=n}return null}
function webp(b){if(b.length<30||b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')return null;const t=b.toString('ascii',12,16);if(t==='VP8X')return{width:1+(b[24]|b[25]<<8|b[26]<<16),height:1+(b[27]|b[28]<<8|b[29]<<16)};if(t==='VP8 '){const s=20;if(b[s+3]===157&&b[s+4]===1&&b[s+5]===42)return{width:b.readUInt16LE(s+6)&16383,height:b.readUInt16LE(s+8)&16383}}if(t==='VP8L'&&b[21]===47)return{width:1+(b[22]|b[23]<<8|(b[24]&63)<<16),height:1+((b[24]>>6)|((b[25]<<2)&1020)|((b[26]&15)<<10))};return null}
function walk(dir){const out=[];for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);e.isDirectory()?out.push(...walk(f)):out.push(f)}return out}
const manifest={version:1,generatedAt:new Date().toISOString(),images:{}};
for(const file of walk(root).filter(f=>/\.(png|jpe?g|webp)$/i.test(f))){try{const d=png(fs.readFileSync(file))||jpeg(fs.readFileSync(file))||webp(fs.readFileSync(file));if(!d?.width||!d?.height)continue;const url='/'+path.relative('public',file).split(path.sep).join('/');if(url.startsWith('/assets/photo-derivatives/'))continue;if(url.startsWith('/assets/source-archive/')&&!allowedArchiveUrls.has(url))continue;manifest.images[url]={width:d.width,height:d.height,aspectRatio:Number((d.width/d.height).toFixed(5)),orientation:d.width===d.height?'square':d.width>d.height?'landscape':'portrait'}}catch{}}
fs.writeFileSync(out,JSON.stringify(manifest));
console.log('Image manifest: '+Object.keys(manifest.images).length+' images');
