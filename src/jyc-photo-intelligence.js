/* JYC PHOTO INTELLIGENCE
   Editorial assistance only. Scores never imply rights clearance or publication.
*/
export const JYC_EDITORIAL_RUBRIC={composition:5,peopleMoment:5,jycRelevance:5,technicalQuality:5,uniqueness:5,storyValue:5};

const ascii=(bytes,start,end)=>String.fromCharCode(...bytes.subarray(start,end));
const dimensionResult=(width,height)=>width>0&&height>0?{width,height}:null;

/** Read intrinsic dimensions from the image headers used by the JYC media pipeline.
 * Accepts Uint8Array/Buffer and intentionally avoids decoding full image pixels.
 */
export function parseImageDimensions(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input||[]);
 if(bytes.length>=24&&bytes[0]===0x89&&ascii(bytes,1,4)==='PNG'&&bytes[4]===0x0d&&bytes[5]===0x0a&&bytes[6]===0x1a&&bytes[7]===0x0a)return dimensionResult(new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(16,false),new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(20,false));
 if(bytes.length>=26&&ascii(bytes,0,4)==='RIFF'&&ascii(bytes,8,12)==='WEBP'){
  const kind=ascii(bytes,12,16);
  if(kind==='VP8X'&&bytes.length>=30)return dimensionResult(1+(bytes[24]|bytes[25]<<8|bytes[26]<<16),1+(bytes[27]|bytes[28]<<8|bytes[29]<<16));
  if(kind==='VP8 '&&bytes.length>=30&&bytes[23]===0x9d&&bytes[24]===0x01&&bytes[25]===0x2a)return dimensionResult((bytes[26]|bytes[27]<<8)&0x3fff,(bytes[28]|bytes[29]<<8)&0x3fff);
  if(kind==='VP8L'&&bytes.length>=26&&bytes[20]===0x2f)return dimensionResult(1+(bytes[21]|(bytes[22]&0x3f)<<8),1+((bytes[22]>>6)|(bytes[23]<<2)|((bytes[24]&0x0f)<<10)));
 }
 if(bytes.length>=4&&bytes[0]===0xff&&bytes[1]===0xd8){
  let offset=2;
  while(offset+3<bytes.length){
   if(bytes[offset]!==0xff){offset++;continue}
   const marker=bytes[offset+1];offset+=2;
   if(marker===0xd8||marker===0xd9||marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
   if(offset+2>bytes.length)break;
   const size=(bytes[offset]<<8)|bytes[offset+1];
   if(size<2||offset+size>bytes.length)break;
   if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)&&size>=7)return dimensionResult((bytes[offset+5]<<8)|bytes[offset+6],(bytes[offset+3]<<8)|bytes[offset+4]);
   if(marker===0xda||marker===0xd9)break;
   offset+=size;
  }
 }
 return null;
}
export const JYC_EDITORIAL_BANDS=[
 {min:24,max:30,key:'hero',label:'Hero / editorial'},
 {min:19,max:23,key:'featured',label:'Featured gallery'},
 {min:14,max:18,key:'standard',label:'Standard gallery'},
 {min:9,max:13,key:'archive',label:'Archive / supporting'},
 {min:0,max:8,key:'reject',label:'Do not publish'}
];
const clamp=(n,min=0,max=5)=>Math.max(min,Math.min(max,Number.isFinite(Number(n))?Number(n):0));
const textOf=item=>String([item?.title,item?.caption,item?.alt,item?.description,item?.story,item?.sourceLabel,item?.association].filter(Boolean).join(' ')).toLowerCase();
const categorySignals={peopleMoment:/people|student|audience|crowd|portrait|team|group|volunteer|leadership|behind.?the.?scene/,activity:/performance|stage|workshop|competition|sports|hackathon|event|campus|activity|showcase|demonstration/,jyc:/jyc|jiit|club|community|fest|sector.?128/,weak:/poster|logo|qr|banner|graphic|illustration|background|texture|screenshot|slide|template|decorative/};
export function inferPhotoSignals(item={}){const text=textOf(item);return{peopleMoment:categorySignals.peopleMoment.test(text)?4:2,jycRelevance:categorySignals.jyc.test(text)?5:3,storyValue:categorySignals.activity.test(text)?4:2,weak:categorySignals.weak.test(text),activity:categorySignals.activity.test(text)}}
export function scoreJycPhoto(item={}){
 const s=inferPhotoSignals(item),dimensions=item.width&&item.height?Number(item.width)*Number(item.height):0;
 const technical=item.technicalQuality!=null?clamp(item.technicalQuality):dimensions>=2000000?5:dimensions>=1000000?4:dimensions>=600000?3:dimensions?2:3;
 const composition=clamp(item.composition??(s.weak?1:3)),peopleMoment=clamp(item.peopleMoment??s.peopleMoment),jycRelevance=clamp(item.jycRelevance??s.jycRelevance),uniqueness=clamp(item.uniqueness??(item.duplicateGroup?2:4)),storyValue=clamp(item.storyValue??s.storyValue);
 const total=Math.round(composition+peopleMoment+jycRelevance+technical+uniqueness+storyValue);
 return{composition,peopleMoment,jycRelevance,technicalQuality:technical,uniqueness,storyValue,total};
}
export function classifyEditorialScore(score){const n=Number(score)||0;return JYC_EDITORIAL_BANDS.find(x=>n>=x.min&&n<=x.max)||JYC_EDITORIAL_BANDS.at(-1)}
export function enrichPhotoEditorial(item={}){const score=scoreJycPhoto(item);return{...item,editorialScore:item.editorialScore??score.total,editorialBand:item.editorialBand||classifyEditorialScore(score.total).key,editorialScoreBreakdown:item.editorialScoreBreakdown||score}}
export function rankDiverseJycPhotos(items=[],{limit=24,seed=0,maxPerAssociation=3}={}){
 const pool=[...new Map((items||[]).filter(x=>x?.url&&(x.mediaKind||'photo')==='photo').map(x=>[String(x.url),enrichPhotoEditorial(x)])).values()];
 const scored=pool.map((item,index)=>{const score=Number(item.editorialScore)||scoreJycPhoto(item).total;const roleBoost=item.role==='event'?8:item.role==='club'?5:0;const freshness=Number(String(item.year||'').slice(0,4))||0;const freshnessBoost=freshness?Math.max(0,Math.min(4,freshness-2022)):0;return{item,score:score+roleBoost+freshnessBoost,index,adjusted:score+roleBoost+freshnessBoost}});
 const out=[],associationCounts=new Map(),familyCounts=new Map();
 for(const entry of scored){const assoc=String(entry.item.association||'JYC Archive');const ac=associationCounts.get(assoc)||0;const family=String(entry.item.family||entry.item.role||'archive');const fc=familyCounts.get(family)||0;entry.adjusted-=ac>=maxPerAssociation?28:fc>=Math.max(4,Math.floor(limit/4))?10:0}
 scored.sort((a,b)=>b.adjusted-a.adjusted||a.index-b.index);
 for(const entry of scored){const assoc=String(entry.item.association||'JYC Archive'),ac=associationCounts.get(assoc)||0;if(ac>=maxPerAssociation&&out.length<Math.min(limit,pool.length)-4)continue;out.push(entry.item);associationCounts.set(assoc,ac+1);const family=String(entry.item.family||entry.item.role||'archive');familyCounts.set(family,(familyCounts.get(family)||0)+1);if(out.length>=Math.min(limit,pool.length))break}
 if(seed&&out.length>1){const shift=Math.abs(Number(seed)||0)%out.length;return[...out.slice(shift),...out.slice(0,shift)]}
 return out;
}
export function diversityAudit(items=[]){const rows=[...new Set((items||[]).map(x=>String(x.association||'JYC Archive')))].map(association=>({association,count:(items||[]).filter(x=>String(x.association||'JYC Archive')===association).length})).sort((a,b)=>b.count-a.count);return{total:items.length,collections:rows,largestCollection:rows[0]||null}}
export function photoVariantBase(url){const value=String(url||'');const prefixes=['/assets/source-archive/','/assets/hub-photos/','/assets/hub-photos-extra/','/assets/events/','/assets/home/','/assets/team/'];if(!prefixes.some(prefix=>value.startsWith(prefix)))return null;return '/assets/photo-derivatives/'+value.slice('/assets/'.length).replace(/\.(jpe?g|png|webp)$/i,'')}
export function isDerivativeDimensionEligible(width,height){const w=Number(width),h=Number(height);if(!Number.isFinite(w)||!Number.isFinite(h)||w<320||h<120)return false;const ratio=w/h;return ratio>=0.25&&ratio<=5;}
export function orientedImageDimensions(width,height,orientation){const w=Number(width),h=Number(height),o=Number(orientation);if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)return null;return o>=5&&o<=8?{width:h,height:w}:{width:w,height:h};}
export function photoDerivativeUrls(url,sourceWidth){const base=photoVariantBase(url);if(!base)return null;const widths=[240,480,960,1600].filter(width=>!Number.isFinite(Number(sourceWidth))||width<=Number(sourceWidth));if(!widths.length)return null;return{avif:widths.map(width=>({url:base+'-'+width+'.avif',width})),webp:widths.map(width=>({url:base+'-'+width+'.webp',width}))}}
