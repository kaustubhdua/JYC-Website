import {isDerivativeDimensionEligible} from './jyc-photo-intelligence.js';
// Shared, deployment-fresh image manifest loader for gallery metadata and responsive <picture> sources.
let imageManifestPromise=null;

const isRecord=value=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value);
const isSafeManifestAssetUrl=url=>{
 if(typeof url!=='string'||!url.startsWith('/assets/')||url.startsWith('//'))return false;
 if(url.includes('\\')||/[?#\x00-\x1f\x7f]/.test(url)||/%(?:25)*(?:2e|2f|5c)/i.test(url))return false;
 const segments=url.slice(1).split('/');
 return segments.every(segment=>Boolean(segment)&&segment!=='.'&&segment!=='..');
};
const isDerivativeManifestPath=url=>['/assets/source-archive/','/assets/hub-photos/','/assets/hub-photos-extra/','/assets/events/','/assets/home/','/assets/team/'].some(prefix=>url.startsWith(prefix));

// Do not trust a non-empty `images` object alone: a stale/error page can still
// return HTTP 200 JSON. Every advertised record must carry dimensions and the
// exact fields used by srcset generation before the payload can be shared.
export function isValidJycImageManifest(payload){
 if(!isRecord(payload)||payload.version!==1||!isRecord(payload.images))return false;
 const entries=Object.entries(payload.images);
 if(!entries.length||entries.length>10000)return false;
 return entries.every(([url,entry])=>{
  if(!isSafeManifestAssetUrl(url)||!isRecord(entry))return false;
  const {width,height,aspectRatio:ratio}=entry;
  if(typeof width!=='number'||!Number.isInteger(width)||width<=0||typeof height!=='number'||!Number.isInteger(height)||height<=0||typeof ratio!=='number'||typeof entry.derivativesEligible!=='boolean')return false;
  if(!Number.isFinite(ratio)||Math.abs(ratio-Number((width/height).toFixed(5)))>0.000001)return false;
  // A stale manifest can be valid JSON while still marking a banner, wordmark or tiny thumbnail as derivative-safe.
  // Never trust a positive eligibility flag unless the URL is in an approved media folder and the dimensions are safe.
  if(entry.derivativesEligible&&(!isDerivativeManifestPath(url)||!isDerivativeDimensionEligible(width,height)))return false;
  const orientation=width===height?'square':width>height?'landscape':'portrait';
  return entry.orientation===orientation;
 });
}

export function loadJycImageManifest(){
 if(!imageManifestPromise){
  imageManifestPromise=fetch('/image-manifest.json',{cache:'no-cache'})
   .then(response=>{
    if(!response.ok)throw new Error('Image manifest unavailable');
    return response.json();
   })
   .then(payload=>{
    if(isValidJycImageManifest(payload))return payload;
    imageManifestPromise=null;
    return null;
   })
   .catch(()=>{
    // Allow later route mounts to retry after transient HTTP, network or JSON failures.
    imageManifestPromise=null;
    return null;
   });
 }
 return imageManifestPromise;
}
