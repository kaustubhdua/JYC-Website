import React from 'react';
import {photoDerivativeUrls} from './jyc-photo-intelligence.js';
const fallback=(e,src)=>{if(e.currentTarget.src!==src)e.currentTarget.src=src};
export function ResponsivePhoto({src,alt='',width,height,sizes='100vw',loading='lazy',fetchPriority,decoding='async',className='',style,onError,objectPosition}){
 const variants=photoDerivativeUrls(src);
 const fallbackSrc=variants?.webp?.find(x=>x.width>=960)?.url||src;
 const sourceSet=list=>list.map(x=>x.url+' '+x.width+'w').join(', ');
 return <picture className={className?'jyc-responsive-picture '+className:'jyc-responsive-picture'}>
  {variants&&<source type="image/avif" srcSet={sourceSet(variants.avif)} sizes={sizes}/>}
  {variants&&<source type="image/webp" srcSet={sourceSet(variants.webp)} sizes={sizes}/>}
  <img src={variants?fallbackSrc:src} alt={alt} width={width} height={height} loading={loading} fetchPriority={fetchPriority} decoding={decoding} sizes={sizes} style={objectPosition?{...style,objectPosition}:style} onError={e=>{fallback(e,src);onError?.(e)}}/>
 </picture>;
}
