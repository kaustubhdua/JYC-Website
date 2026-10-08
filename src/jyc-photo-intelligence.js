/* JYC PHOTO INTELLIGENCE
   Editorial assistance only. Scores never imply rights clearance or publication.
*/
export const JYC_EDITORIAL_RUBRIC={composition:5,peopleMoment:5,jycRelevance:5,technicalQuality:5,uniqueness:5,storyValue:5};
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
export function photoVariantBase(url){const value=String(url||'');if(!(value.startsWith('/assets/source-archive/')||value.startsWith('/assets/hub-photos/')||value.startsWith('/assets/hub-photos-extra/')))return null;return '/assets/photo-derivatives/'+value.slice('/assets/'.length).replace(/\.(jpe?g|png|webp)$/i,'')}
export function photoDerivativeUrls(url){const base=photoVariantBase(url);if(!base)return null;const widths=[320,480,640,960,1280,1600,2400];return{avif:widths.map(width=>({url:base+'-'+width+'.avif',width})),webp:widths.map(width=>({url:base+'-'+width+'.webp',width}))}}
