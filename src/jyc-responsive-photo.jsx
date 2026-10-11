import React,{useEffect,useState} from 'react';
import {photoDerivativeUrls} from './jyc-photo-intelligence.js';
import {isValidJycImageManifest} from './jyc-image-manifest.js';
const LOGO_FALLBACK=import.meta.env.PROD?'/assets/jyc-logo.webp':'/JYC%20Logo(4).png';
const ORIGINAL_LOGO='/JYC%20Logo(4).png';
const isDerivativeSource=url=>/^\/assets\/(?:source-archive|hub-photos|hub-photos-extra)\//.test(String(url||''));
let imageManifestPromise=null;

// Shared, retryable manifest request: the gallery and every ResponsivePhoto use
// the same verified dimensions instead of independently guessing derivatives.
export const loadJycImageManifest=()=>{
 if(!imageManifestPromise){
  imageManifestPromise=fetch('/image-manifest.json',{cache:'no-cache'})
   .then(response=>{if(!response.ok)throw new Error('Image manifest request failed: '+response.status);return response.json()})
   .then(payload=>{if(isValidJycImageManifest(payload))return payload;imageManifestPromise=null;return null})
   .catch(()=>{imageManifestPromise=null;return null});
 }
 return imageManifestPromise;
};

export function ResponsivePhoto({src,alt='',width,height,sizes='100vw',loading='lazy',fetchPriority,decoding='async',className='',style,onError,objectPosition,fallbackSrc=LOGO_FALLBACK,fallbackAlt='Official JYC logo placeholder; image unavailable'}){
 const [sourceDimensions,setSourceDimensions]=useState({src:'',width:0,derivativesEligible:false});
 const [fallbackState,setFallbackState]=useState({src:'',fallbackSrc:'',stage:0});
 const derivativesEnabled=import.meta.env.PROD||import.meta.env.VITE_ENABLE_PHOTO_DERIVATIVES==='true';
 const measured=sourceDimensions.src===src&&sourceDimensions.derivativesEligible;
 const intrinsicWidth=measured?sourceDimensions.width:0;
 const stage=fallbackState.src===src&&fallbackState.fallbackSrc===fallbackSrc?fallbackState.stage:0;
 const candidates=[fallbackSrc,LOGO_FALLBACK,ORIGINAL_LOGO].filter((url,index,all)=>Boolean(url)&&url!==src&&all.indexOf(url)===index);
 const failed=stage>candidates.length;
 const activeFallback=stage>0&&!failed;

 useEffect(()=>{
  let active=true;
  setSourceDimensions({src,width:0,derivativesEligible:false});
  if(!derivativesEnabled||!isDerivativeSource(src))return()=>{active=false};
  loadJycImageManifest().then(manifest=>{
   const entry=manifest?.images?.[src];
   const measuredWidth=Number(entry?.width);
   if(active&&entry?.derivativesEligible===true&&Number.isFinite(measuredWidth)&&measuredWidth>0){
    setSourceDimensions({src,width:measuredWidth,derivativesEligible:true});
   }
  });
  return()=>{active=false};
 },[src,derivativesEnabled]);
 useEffect(()=>{setFallbackState({src,fallbackSrc,stage:0})},[src,fallbackSrc]);

 // Only advertise variants once the manifest proves both eligibility and the
 // original pixel width. This prevents guessed 404s and upscaled srcset widths.
 const variants=stage===0&&measured&&derivativesEnabled?photoDerivativeUrls(src,intrinsicWidth):null;
 const resolvedSrc=stage===0?(variants?.webp?.at(-1)?.url||src):activeFallback?candidates[stage-1]:undefined;
 const baseStyle=objectPosition?{...style,objectPosition}:style;
 const sourceSet=list=>list.map(item=>item.url+' '+item.width+'w').join(', ');
 const handleError=event=>{
  setFallbackState(previous=>{
   const currentStage=previous.src===src&&previous.fallbackSrc===fallbackSrc?previous.stage:0;
   return {src,fallbackSrc,stage:currentStage+1};
  });
  onError?.(event);
 };
 return <picture className={className?'jyc-responsive-picture '+className:'jyc-responsive-picture'}>
  {variants?.avif?.length>0&&<source type="image/avif" srcSet={sourceSet(variants.avif)} sizes={sizes}/>}
  {variants?.webp?.length>0&&<source type="image/webp" srcSet={sourceSet(variants.webp)} sizes={sizes}/>}
  <img src={resolvedSrc} alt={activeFallback?fallbackAlt:alt} width={width} height={height} loading={loading} fetchPriority={fetchPriority} decoding={decoding} sizes={sizes} data-image-fallback-stage={failed?'failed':activeFallback?String(stage):undefined} style={failed?{...baseStyle,visibility:'hidden'}:baseStyle} onError={handleError}/>
 </picture>;
}
