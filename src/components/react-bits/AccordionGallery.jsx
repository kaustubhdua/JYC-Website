import React,{useCallback,useEffect,useRef,useState} from 'react';
import {gsap} from 'gsap';
import {useReducedMotion} from 'motion/react';
import {ResponsivePhoto} from '../../jyc-responsive-photo.jsx';
import './AccordionGallery.css';

export default function AccordionGallery({
 items=[],defaultIndex=0,onSelect,
 accentColor='var(--jyc-accent, #d9b37a)',overlayColor='#090b10',textColor='#fff',
 height=390,gap=10,radius=18,expandRatio=.52,trigger='click',grayscale=true,
 className=''
}){
 const rootRef=useRef(null),panelRefs=useRef([]),mediaRefs=useRef([]),timelineRef=useRef(null);
 const reduced=useReducedMotion();
 const [active,setActive]=useState(()=>Math.max(0,Math.min(defaultIndex,Math.max(items.length-1,0))));
 const safeItems=items.slice(0,5);
 useEffect(()=>{setActive(i=>Math.min(i,Math.max(safeItems.length-1,0)))},[safeItems.length]);
 const applyLayout=useCallback((animate=true)=>{
  const panels=panelRefs.current.filter(Boolean);if(!panels.length)return;
  timelineRef.current?.kill();
  const ratio=Math.max(.3,Math.min(.68,expandRatio));
  const grow=panels.length>1?ratio*(panels.length-1)/(1-ratio):1;
  const tl=gsap.timeline();
  panels.forEach((panel,i)=>{
   const selected=i===active,media=mediaRefs.current[i];
   tl.to(panel,{flexGrow:selected?grow:1,scale:selected?1:1,duration:animate && !reduced ? 0.42 : 0,ease:'power3.out'},0);
   if(media)tl.to(media,{'--ag-gray':grayscale&&!selected?1:0,'--ag-dim':selected?0:.34,duration:animate && !reduced ? 0.42 : 0,ease:'power3.out'},0);
  });
  timelineRef.current=tl;
 },[active,expandRatio,reduced,grayscale]);
 useEffect(()=>{applyLayout(false);return()=>timelineRef.current?.kill()},[applyLayout]);
 useEffect(()=>{
  const node=rootRef.current;if(!node)return;
  const observer=new ResizeObserver(()=>applyLayout(false));observer.observe(node);
  return()=>observer.disconnect();
 },[applyLayout]);
 const choose=i=>{setActive(i);if(trigger==='hover')return};
 const keyDown=(e,i)=>{
  let next=i;
  if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%safeItems.length;
  else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i-1+safeItems.length)%safeItems.length;
  else if(e.key==='Home')next=0;
  else if(e.key==='End')next=safeItems.length-1;
  else return;
  e.preventDefault();setActive(next);panelRefs.current[next]?.focus();
 };
 if(!safeItems.length)return null;
 const selected=safeItems[active]||safeItems[0];
 return <section className={`jyc-accordion-feature ${className}`} aria-labelledby="jyc-accordion-title">
  <div className="jyc-accordion-heading"><div><span className="eyebrow">THE JYC PHOTO JOURNAL</span><h2 id="jyc-accordion-title">Five frames. Countless stories.</h2><p>A small, source-backed selection from the published visual archive. Open any frame to see it in full.</p></div><span className="jyc-accordion-count">0{safeItems.length} / CURATED</span></div>
  <div ref={rootRef} className="accordion-gallery" role="group" aria-label="Featured JYC photographs" style={{'--ag-accent':accentColor,'--ag-overlay':overlayColor,'--ag-text':textColor,'--ag-gap':gap+'px','--ag-radius':radius+'px','--ag-height':height+'px'}}>
   {safeItems.map((item,i)=><button key={item.id||item.url||i} ref={el=>panelRefs.current[i]=el} type="button" className={`ag-panel ${i===active?'ag-panel--active':''}`} aria-pressed={i===active} aria-label={`Feature photo ${i+1}: ${item.caption||item.alt||item.association||'JYC photograph'}`} onClick={()=>choose(i)} onFocus={()=>setActive(i)} onPointerEnter={e=>{if(trigger==='hover'&&e.pointerType==='mouse')setActive(i)}} onKeyDown={e=>keyDown(e,i)}>
    <span className="ag-panel__frame"><span className="ag-panel__media" ref={el=>mediaRefs.current[i]=el}><ResponsivePhoto src={item.url} alt={item.alt||item.caption||`Published JYC photograph ${i+1}`} width={item.width} height={item.height} sizes="(max-width: 600px) 88vw, (max-width: 1000px) 28vw, 34vw" loading={i===active?'eager':'lazy'} decoding="async" /></span><span className="ag-panel__overlay" aria-hidden="true"/></span>
    <span className="ag-panel__index">0{i+1}</span><span className="ag-panel__label"><span className="ag-panel__bar"/><span className="ag-panel__text">{item.association||item.collection||'JYC Archive'}<small>{item.year||'Published photo'}</small></span></span>
   </button>)}
  </div>
  <div className="jyc-accordion-caption" aria-live="polite"><div><span>{selected.association||selected.collection||'JYC ARCHIVE'}{selected.year?' · '+selected.year:''}</span><strong>{selected.caption||selected.alt||'A moment from JYC'}</strong></div><button type="button" onClick={()=>onSelect?.(selected)}>Open full photograph <span aria-hidden="true">↗</span></button></div>
 </section>;
}
