'use client';
import {useEffect,useRef} from 'react';
import {gsap} from 'gsap';
import './ChromaGrid.css';
export default function ChromaGrid({items=[],className='',radius=260,damping=.45,fadeOut=.45,ease='power3.out',columns=3}){
 const rootRef=useRef(null),fadeRef=useRef(null),setX=useRef(null),setY=useRef(null),pos=useRef({x:0,y:0});
 useEffect(()=>{const el=rootRef.current;if(!el)return;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;setX.current=gsap.quickSetter(el,'--x','px');setY.current=gsap.quickSetter(el,'--y','px');const rect=el.getBoundingClientRect();pos.current={x:rect.width/2,y:rect.height/2};setX.current(pos.current.x);setY.current(pos.current.y);if(reduced)return;
  const moveTo=(x,y)=>gsap.to(pos.current,{x,y,duration:damping,ease,onUpdate:()=>{setX.current?.(pos.current.x);setY.current?.(pos.current.y)},overwrite:true});
  const move=e=>{const r=el.getBoundingClientRect();moveTo(e.clientX-r.left,e.clientY-r.top);if(fadeRef.current)gsap.to(fadeRef.current,{opacity:0,duration:.2,overwrite:true})};
  const leave=()=>{if(fadeRef.current)gsap.to(fadeRef.current,{opacity:1,duration:fadeOut,overwrite:true})};
  el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);return()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);gsap.killTweensOf(pos.current);if(fadeRef.current)gsap.killTweensOf(fadeRef.current)};
 },[damping,fadeOut,ease]);
 const data=Array.isArray(items)?items:[];
 return <div ref={rootRef} className={'chroma-grid '+className} style={{'--r':radius+'px','--cols':columns}}>{data.map((c,i)=><article key={c.id||i} className="chroma-card" style={{'--card-border':c.borderColor||'#bf9c6f','--card-gradient':c.gradient||'linear-gradient(145deg,#25231f,#111318)'}}><div className="chroma-img-wrapper"><img src={c.image} alt={c.title} loading="lazy"/></div><footer className="chroma-info"><h3>{c.title}</h3><span>{c.handle||''}</span><p>{c.subtitle||''}</p>{c.location&&<small>{c.location}</small>}{c.url&&<a href={c.url} target="_blank" rel="noopener noreferrer" aria-label={'Open '+c.title+' profile'}>↗</a>}</footer></article>)}<div className="chroma-overlay"/><div ref={fadeRef} className="chroma-fade"/></div>;
}
