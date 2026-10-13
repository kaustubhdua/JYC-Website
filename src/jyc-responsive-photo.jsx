import React,{useEffect,useLayoutEffect,useState} from 'react';
import {photoDerivativeUrls} from './jyc-photo-intelligence.js';
import {loadJycImageManifest} from './jyc-image-manifest.js';
const PHOTO_FALLBACK='/assets/photo-unavailable.svg';
const isDerivativeSource=url=>/^\/assets\/(?:source-archive|hub-photos|hub-photos-extra|events|home|team)\//.test(String(url||''));
export function ResponsivePhoto({src,alt='',width,height,sizes='100vw',loading='lazy',fetchPriority,decoding='async',className='',style,onError,objectPosition,fallbackSrc=PHOTO_FALLBACK,fallbackAlt='Photograph unavailable'}){
 // Empty/whitespace sources must never become a request for the current document.
 const normalizedFallbackSrc=typeof fallbackSrc==='string'&&fallbackSrc.trim()?fallbackSrc.trim():PHOTO_FALLBACK;
 const source=typeof src==='string'&&src.trim()?src.trim():normalizedFallbackSrc;
 const [sourceDimensions,setSourceDimensions]=useState(()=>({src:source,width:0,derivativesEligible:false}));
 const [fallbackState,setFallbackState]=useState(()=>({src:source,fallbackSrc:normalizedFallbackSrc,stage:0,preferOriginal:false}));
 const intrinsicWidth=sourceDimensions.src===source&&sourceDimensions.derivativesEligible?sourceDimensions.width:0;
 const derivativesEnabled=import.meta.env.PROD||import.meta.env.VITE_ENABLE_PHOTO_DERIVATIVES==='true';
 const fallbackStateMatches=fallbackState.src===source&&fallbackState.fallbackSrc===normalizedFallbackSrc;
 const stage=fallbackStateMatches?fallbackState.stage:0;
 const preferOriginal=fallbackStateMatches&&fallbackState.preferOriginal===true;
 const candidatePool=preferOriginal?[source,normalizedFallbackSrc]:[normalizedFallbackSrc];
 const candidates=candidatePool.filter((url,index,all)=>Boolean(url)&&(preferOriginal||url!==source)&&all.indexOf(url)===index);
 const failed=stage>candidates.length;
 const usingOriginalRetry=preferOriginal&&stage===1&&candidates[0]===source;
 const activeFallback=stage>0&&!failed&&!usingOriginalRetry;
 // Only emit srcset candidates after the generated manifest confirms intrinsic dimensions and derivative eligibility.
 // If the manifest is unavailable, keep the original source rather than guessing derivative URLs that may 404 or upscale.
 const variants=stage===0&&derivativesEnabled&&intrinsicWidth>0?photoDerivativeUrls(source,intrinsicWidth):null;
 // Keep the original source in the img element as the final format-compatibility fallback;
 // supported browsers select the optimized AVIF/WebP sources above it.
 const resolvedSrc=stage===0?source:!failed?candidates[stage-1]:undefined;
 useEffect(()=>{
  let active=true;
  if(!derivativesEnabled||!isDerivativeSource(source))return()=>{active=false};
  loadJycImageManifest().then(manifest=>{
   const entry=manifest?.images?.[source];
   const measured=Number(entry?.width);
   if(active&&entry?.derivativesEligible===true&&measured>0)setSourceDimensions({src:source,width:measured,derivativesEligible:true});
  });
  return()=>{active=false};
 },[source,derivativesEnabled]);
 useLayoutEffect(()=>{setFallbackState(previous=>previous.src===source&&previous.fallbackSrc===normalizedFallbackSrc?previous:{src:source,fallbackSrc:normalizedFallbackSrc,stage:0,preferOriginal:false})},[source,normalizedFallbackSrc]);
 const baseStyle=objectPosition?{...style,objectPosition}:style;
 const sourceSet=list=>list.map(x=>x.url+' '+x.width+'w').join(', ');
 const handleError=e=>{
  const failedUrl=String(e?.currentTarget?.currentSrc||'');
  setFallbackState(previous=>{
   const currentMatches=previous.src===source&&previous.fallbackSrc===normalizedFallbackSrc;
   const current=currentMatches?previous:{src:source,fallbackSrc:normalizedFallbackSrc,stage:0,preferOriginal:false};
   const derivativeFailed=currentMatches&&current.stage===0&&!source.startsWith('/assets/photo-derivatives/')&&failedUrl.includes('/assets/photo-derivatives/');
   return {src:source,fallbackSrc:normalizedFallbackSrc,stage:current.stage+1,preferOriginal:current.preferOriginal||derivativeFailed};
  });
  onError?.(e);
 };
 return <picture className={className?'jyc-responsive-picture '+className:'jyc-responsive-picture'} data-image-failed={failed?'true':undefined} data-image-fallback-label={failed?(alt?'Image unavailable':''):undefined} role={failed&&alt?'img':undefined} aria-label={failed&&alt?alt+' (image unavailable)':undefined} aria-hidden={failed&&!alt?true:undefined}>
  {variants&&<source type="image/avif" srcSet={sourceSet(variants.avif)} sizes={sizes}/>}
  {variants&&<source type="image/webp" srcSet={sourceSet(variants.webp)} sizes={sizes}/>}
  <img src={resolvedSrc} alt={activeFallback?fallbackAlt:alt} width={width} height={height} loading={loading} fetchPriority={fetchPriority} decoding={decoding} sizes={sizes} data-image-fallback-stage={failed?'failed':usingOriginalRetry?'original':activeFallback?String(stage):undefined} style={failed?{...baseStyle,visibility:'hidden'}:baseStyle} onError={handleError}/>
 </picture>;
}
