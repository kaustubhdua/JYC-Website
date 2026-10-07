import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('public/assets');
const out=path.resolve('public/image-manifest.json');

function png(buf){if(buf.length<24||buf.toString('ascii',1,4)!=='PNG')return null;return {width:buf.readUInt32BE(16),height:buf.readUInt32BE(20)}}
function jpeg(buf){if(buf.length<4||buf[0]!==0xff||buf[1]!==0xd8)return null;let i=2;while(i+9<buf.length){if(buf[i]!==0xff){i++;continue}const marker=buf[i+1];i+=2;if(marker===0xd8||marker===0xd9||marker===0x01)continue;const len=buf.readUInt16BE(i);if(len<2||i+len>buf.length)return null;const sof=[0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf];if(sof.includes(marker))return {width:buf.readUInt16BE(i+5),height:buf.readUInt16BE(i+3)};i+=len}return null}
function webp(buf){if(buf.length<30||buf.toString('ascii',0,4)!=='RIFF'||buf.toString('ascii',8,12)!=='WEBP')return null;const type=buf.toString('ascii',12,16);if(type==='VP8X')return {width:1+(buf[24]|(buf[25]<<8)|(buf[26]<<16)),height:1+(buf[27]|(buf[28]<<8)|(buf[29]<<16))};if(type==='VP8 '){const s=20;if(buf[s+3]===0x9d&&buf[s+4]===0x01&&buf[s+5]===0x2a)return {width:buf.readUInt16LE(s+6)&0x3fff,height:buf.readUInt16LE(s+8)&0x3fff}}if(type==='VP8L'&&buf[21]===0x2f)return {width:1+((buf[22]|(buf[23]<<8)|((buf[24]&0x3f)<<16))),height:1+(((buf[24]>>6)|((buf[25]<<2)&0x3fc)|((buf[26]&0x0f)<<10)))};return null}
function dimensions(file){const b=fs.readFileSync(file);return png(b)||jpeg(b)||webp(b)}
function walk(dir){const out=[];for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())out.push(...walk(full));else out.push(full)}return out}
const files=walk(root).filter(f=>/\.(png|jpe?g|webp)$/i.test(f));const manifest={generatedAt:new Date().toISOString(),version:1,images:{}};for(const file of files){try{const d=dimensions(file);if(!d?.width||!d?.height)continue;const rel='/'+path.relative('public',file).split(path.sep).join('/');manifest.images[rel]={width:d.width,height:d.height,aspectRatio:Number((d.width/d.height).toFixed(5)),orientation:d.width===d.height?'square':d.width>d.height?'landscape':'portrait'}}catch{}}fs.writeFileSync(out,JSON.stringify(manifest));console.log('Image manifest: '+Object.keys(manifest.images).length+' images');
