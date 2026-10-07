import React,{useEffect,useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {JYC_CONTACTS} from '../lib/site-config.js';

const safeUrl=value=>{try{const u=new URL(String(value||''),window.location.origin);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};

export default function JYCMobileMoreSheet({data,close,openSearch}){
 const nav=useNavigate();
 const sheetRef=useRef(null);
 useEffect(()=>{
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const timer=setTimeout(()=>sheetRef.current?.querySelector('button,a')?.focus(),30);
  const onKey=e=>{
   if(e.key==='Escape'){e.preventDefault();close();return}
   if(e.key!=='Tab')return;
   const root=sheetRef.current;if(!root)return;
   const focusable=[...root.querySelectorAll('button,a,input,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled&&el.offsetParent!==null);
   if(!focusable.length)return;
   const first=focusable[0],last=focusable[focusable.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  };
  document.addEventListener('keydown',onKey);
  return()=>{clearTimeout(timer);document.body.style.overflow=previous;document.removeEventListener('keydown',onKey)};
 },[close]);
 const go=path=>{close();nav(path)};
 const explore=[
  ['/about','About JYC','Vision, mission and values'],
  ['/leadership','Leadership','Faculty, Apex and Core Team'],
  ['/clubs','Clubs & Communities','Explore the official JYC ecosystem'],
  ['/events','Events','Upcoming, ongoing and completed experiences'],
  ['/calendar','Event Calendar','Browse JYC events by date'],
  ['/gallery','Gallery','Event memories and visual archive'],
  ['/announcements','Announcements','Registrations, notices and JYC updates'],
  ['/join-jyc','Join JYC · Coming Soon','Official recruitment will appear here when the next cycle opens'],
  ['/contact','Contact','Official public channels and query form']
 ];
 return <div ref={sheetRef} className="more-sheet-overlay" role="dialog" aria-modal="true" aria-label="More JYC" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
  <div className="more-sheet jyc-more-club-sheet">
   <div className="sheet-grabber"/>
   <div className="more-sheet-head"><div><span className="eyebrow">MORE JYC</span><h3>Useful pages. Nothing repeated.</h3><p>Explore the core JYC 128 public experience from one place.</p></div><button type="button" className="sheet-close" onClick={close} aria-label="Close More JYC">×</button></div>
   <div className="more-sheet-section"><span className="eyebrow">JYC</span><div className="more-sheet-grid jyc-more-grid">{explore.map(([path,title,text])=><button type="button" key={path} onClick={()=>go(path)}><b>{title}</b><span>{text} →</span></button>)}</div></div>
   <div className="more-sheet-section"><span className="eyebrow">SEARCH JYC</span><div className="more-sheet-grid more-sheet-guide"><button type="button" onClick={openSearch}><b>Search JYC</b><span>Find a page, club or event →</span></button>{safeUrl(data?.homepage?.jtvUrl)&&<a className="more-sheet-link" href={safeUrl(data.homepage.jtvUrl)} target="_blank" rel="noopener noreferrer"><b>JTV</b><span>Official JYC media ↗</span></a>}</div></div>
   <div className="more-sheet-connect"><span className="eyebrow">CONNECT WITH JYC</span><div><a href={JYC_CONTACTS.instagram} target="_blank" rel="noreferrer">Instagram ↗</a><a href={JYC_CONTACTS.whatsapp} target="_blank" rel="noreferrer">WhatsApp ↗</a><a href={'mailto:'+data?.creator?.email}>Email ↗</a></div></div>
  </div>
 </div>;
}
