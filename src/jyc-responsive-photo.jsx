import React,{useEffect,useState} from 'react';
import {photoDerivativeUrls} from './jyc-photo-intelligence.js';
const LOGO_FALLBACK=import.meta.env.PROD?'/assets/jyc-logo.webp':'/JYC%20Logo(4).png';
const ORIGINAL_LOGO='/JYC%20Logo(4).png';
const isDerivativeSource=url=>/^\/assets\/(?:source-archive|hub-photos|hub-photos-extra)\//.test(String(url||''));
let imageManifestPromise=null;
const loadImageManifest=()=>{
 if(!imageManifestPromise)imageManifestPromise=fetch('/image-manifest.json',{cache:'force-cache'}).then(response=>response.ok?response.json():null).catch(()=>null);
 return imageManifestPromise;
};
export function ResponsivePhoto({src,alt='',width,height,sizes='100vw',loading='lazy',fetchPriority,decoding='async',className='',style,onError,objectPosition,fallbackSrc=LOGO_FALLBACK,fallbackAlt='Official JYC logo placeholder; image unavailable'}){
 const [sourceDimensions,setSourceDimensions]=useState({src:'',width:0,derivativesEligible:false});
 const [fallbackState,setFallbackState]=useState({src:'',fallbackSrc:'',stage:0});
 const intrinsicWidth=sourceDimensions.src===src&&sourceDimensions.derivativesEligible?sourceDimensions.width:0;
 const derivativesEnabled=import.meta.env.PROD||import.meta.env.VITE_ENABLE_PHOTO_DERIVATIVES==='true';
 const stage=fallbackState.src===src&&fallbackState.fallbackSrc===fallbackSrc?fallbackState.stage:0;
 const candidates=[fallbackSrc,LOGO_FALLBACK,ORIGINAL_LOGO].filter((url,index,all)=>Boolean(url)&&url!==src&&all.indexOf(url)===index);
 const failed=stage>candidates.length;
 const activeFallback=stage>0&&!failed;
 const resolvedSrc=stage===0?(photoDerivativeUrls(src,intrinsicWidth)&&derivativesEnabled?photoDerivativeUrls(src,intrinsicWidth).webp.at(-1)?.url||src:src):activeFallback?candidates[stage-1]:undefined;
 useEffect(()=>{
  let active=true;
  setSourceDimensions({src,width:0,derivativesEligible:false});
  if(!derivativesEnabled||!isDerivativeSource(src))return()=>{active=false};
  loadImageManifest().then(manifest=>{
   const entry=manifest?.images?.[src];
   const measured=Number(entry?.width);
   if(active&&entry?.derivativesEligible===true&&measured>0)setSourceDimensions({src,width:measured,derivativesEligible:true});
  });
  return()=>{active=false};
 },[src,derivativesEnabled]);
 useEffect(()=>{setFallbackState({src,fallbackSrc,stage:0})},[src,fallbackSrc]);
 const variants=stage===0&&derivativesEnabled?photoDerivativeUrls(src,intrinsicWidth):null;
 const baseStyle=objectPosition?{...style,objectPosition}:style;
 const sourceSet=list=>list.map(x=>x.url+' '+x.width+'w').join(', ');
 const handleError=e=>{
  setFallbackState(previous=>{
   const currentStage=previous.src===src&&previous.fallbackSrc===fallbackSrc?previous.stage:0;
   return {src,fallbackSrc,stage:currentStage+1};
  });
  onError?.(e);
 };
 return <picture className={className?'jyc-responsive-picture '+className:'jyc-responsive-picture'}>
  {variants&&<source type="image/avif" srcSet={sourceSet(variants.avif)} sizes={sizes}/>}
  {variants&&<source type="image/webp" srcSet={sourceSet(variants.webp)} sizes={sizes}/>}
  <img src={resolvedSrc} alt={activeFallback?fallbackAlt:alt} width={width} height={height} loading={loading} fetchPriority={fetchPriority} decoding={decoding} sizes={sizes} data-image-fallback-stage={failed?'failed':activeFallback?String(stage):undefined} style={failed?{...baseStyle,visibility:'hidden'}:baseStyle} onError={handleError}/>
 </picture>;
}
