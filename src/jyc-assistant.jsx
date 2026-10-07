import React,{useEffect,useMemo,useRef,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {normalizeSearch,rankSearchResults} from './lib/search.js';
import {JYC_HUB_SOURCE_REGISTRY} from './jyc-hub-registry.js';
import {sourceHubMedia} from './jyc-source-media.js';
import {hubDetails} from './v23.6-hub-details.js';

const published=data=>({
 clubs:(data?.clubs||[]).filter(c=>c?.published&&c?.status!=='archived'),
 events:(data?.events||[]).filter(e=>e?.published&&!e?.archived),
 team:(data?.team||[]).filter(m=>m?.published===true),
 gallery:(data?.gallery||[]).filter(g=>g?.url&&g?.published!==false)
});

export function JYCAssistant({data,onClose}){
 const nav=useNavigate(),loc=useLocation(),inputRef=useRef(null),[query,setQuery]=useState('');
 const {clubs,events,team,gallery}=useMemo(()=>published(data),[data]);
 const context=loc.pathname.startsWith('/clubs')?'clubs':loc.pathname.startsWith('/events')?'events':loc.pathname.startsWith('/gallery')?'gallery':loc.pathname.startsWith('/team')||loc.pathname.startsWith('/leadership')?'leadership':'home';
 const contextCopy={home:'Start with a club, an event or the JYC story.',clubs:'Find a community by name, focus or activity.',events:'Find upcoming and published JYC experiences.',gallery:'Find the visual archive and event stories.',leadership:'Find the people behind JYC.'}[context];
 useEffect(()=>{const id=setTimeout(()=>inputRef.current?.focus(),40);return()=>clearTimeout(id)},[]);
 useEffect(()=>{const onKey=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose?.()}};document.addEventListener('keydown',onKey,true);return()=>document.removeEventListener('keydown',onKey,true)},[onClose]);
 const go=path=>{onClose?.();nav(path)};
 const pages=[['JYC','Official JIIT Youth Club 128 website for communities, events, leadership and the JYC archive.','PAGE','/'],['About JYC','How JYC works, its purpose, values and campus role.','PAGE','/about'],['Clubs & Communities','Explore the 2026–27 JYC hub ecosystem.','PAGE','/clubs'],['Events','Upcoming, ongoing and completed JYC experiences.','PAGE','/events'],['Gallery','Published JYC photography and event memories.','PAGE','/gallery'],['Leadership','Faculty, Apex and Core Team.','PAGE','/leadership'],['Contact','Official JYC channels and contact information.','PAGE','/contact']];
 const sourceGallery=JYC_HUB_SOURCE_REGISTRY.flatMap(h=>sourceHubMedia(h.name).photos.map((url,i)=>({id:`source-${h.name}-${i}`,caption:`${h.name} source photograph`,association:h.name,year:'',sourceLabel:'JYC supplied hub archive',alt:`${h.name} source photograph`})));
 const raw=[
  ...pages.map(([title,meta,type,path])=>({key:'page-'+path,title,meta,type,go:()=>go(path)})),
  ...clubs.map(c=>{const d=hubDetails(c.name);return {key:'club-'+c.id,title:c.name,meta:c.category||c.type||d?.label||'JYC community',type:'CLUB',searchText:[c.name,c.category,c.type,c.description,c.about,(c.interests||[]).join(' '),d?.label,d?.experience,(d?.activities||[]).join(' '),(d?.signature||[]).join(' '),(d?.sourceHighlights||[]).join(' ')].filter(Boolean).join(' '),go:()=>go('/clubs/'+encodeURIComponent(c.id||c.name))}}),
  ...events.map(e=>({key:'event-'+e.id,title:e.title,meta:[e.club,e.venue,e.date].filter(Boolean).join(' · '),type:'EVENT',searchText:[e.title,e.club,e.eventType,e.venue,(e.highlights||[]).join(' '),(e.tracks||[]).map(x=>x.name).join(' ')].join(' '),go:()=>go('/events/'+encodeURIComponent(e.id||e.title))})),
  ...team.map(m=>({key:'team-'+m.id,title:m.name,meta:m.role||m.position||'JYC Team',type:'TEAM',searchText:[m.name,m.role,m.position,m.bio,m.description].join(' '),go:()=>go('/leadership')})),
  ...[...gallery,...sourceGallery].map((g,i)=>({key:'gallery-'+(g.id||i),title:g.caption||g.association||'JYC visual archive',meta:[g.association,g.year,g.sourceLabel].filter(Boolean).join(' · '),type:'GALLERY',searchText:[g.caption,g.association,g.year,g.sourceLabel,g.alt].filter(Boolean).join(' '),go:()=>go('/gallery')}))
 ];
 const term=normalizeSearch(query);
 const results=term?rankSearchResults(raw.map(x=>({...x,text:x.searchText||x.meta})),term).slice(0,8):[];
 const quick=context==='clubs'?[['Technical hubs','/clubs'],['Cultural hubs','/clubs'],['Upcoming events','/events'],['JYC archive','/archive']]:context==='events'?[['Upcoming events','/events'],['Event calendar','/calendar'],['JYC archive','/archive'],['Explore hubs','/clubs']]:context==='gallery'?[['JYC archive','/archive'],['Events','/events'],['Explore hubs','/clubs'],['Leadership','/leadership']]:context==='leadership'?[['Leadership','/leadership'],['Explore hubs','/clubs'],['Events','/events'],['Contact JYC','/contact']]:[['Explore clubs','/clubs'],['Upcoming events','/events'],['JAI 2026','/events/jai-2026-jaypee-agentic-ai-hackathon'],['JYC archive','/archive']];
 return <div className="jyc-assistant-overlay" role="dialog" aria-modal="true" aria-label="JYC Assistant" onMouseDown={e=>e.target===e.currentTarget&&onClose?.()}>
  <section className="jyc-assistant-panel">
   <div className="jyc-assistant-head"><div className="jyc-assistant-brand"><span className="jyc-assistant-mark"><img src="/jyc-logo-circle.png" alt="" /></span><div><span className="eyebrow">JYC ASSISTANT</span><h2>Ask JYC. Find your route.</h2><p>{contextCopy}</p></div></div><button type="button" className="jyc-assistant-close" onClick={onClose} aria-label="Close JYC Assistant">×</button></div>
   <div className="jyc-assistant-search"><span aria-hidden="true">⌕</span><input ref={inputRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try “robotics”, “dance”, “JAI 2026” or a club name…" aria-label="Search JYC content"/>{query&&<button type="button" onClick={()=>setQuery('')} aria-label="Clear assistant search">×</button>}</div>
   {!term&&<div className="jyc-assistant-quick"><span className="eyebrow">QUICK ROUTES</span><div>{quick.map(([label,path])=><button type="button" key={path} onClick={()=>go(path)}>{label}<b>↗</b></button>)}</div></div>}
   {term&&<div className="jyc-assistant-results" aria-live="polite"><div className="jyc-assistant-result-meta"><span>{results.length} relevant result{results.length===1?'':'s'}</span><span>Published JYC content</span></div>{results.length?results.map((r,i)=><button type="button" key={r.key} className="jyc-assistant-result" onClick={r.go}><small>{i===0?'BEST MATCH · ':''}{r.type}</small><strong>{r.title}</strong><span>{r.meta}</span><b>↗</b></button>):<div className="jyc-assistant-empty"><strong>No direct match yet.</strong><p>Try the exact club name, a focus such as “AI” or “photography”, an event title, or “JYC”.</p><button type="button" onClick={()=>go('/clubs')}>Browse all communities →</button></div>}</div>}
   {!term&&<div className="jyc-assistant-note"><span>✓</span><p>This assistant searches published JYC content first, so it does not invent club or event details.</p></div>}
   <div className="jyc-assistant-foot"><span>JYC 128 · Sector 128, Noida</span><button type="button" onClick={()=>go('/contact')}>Need official help? Contact JYC →</button></div>
  </section>
  <style>{`
   .jyc-assistant-overlay{position:fixed;inset:0;z-index:12000;display:grid;place-items:center;padding:18px;background:rgba(16,15,13,.58);backdrop-filter:blur(14px);animation:jycAssistantIn .22s ease both}
   .jyc-assistant-panel{width:min(760px,calc(100vw - 28px));max-height:min(760px,calc(100dvh - 28px));overflow:auto;border:1px solid color-mix(in srgb,var(--jyc-accent,#bf9c6f) 42%,transparent);border-radius:26px;background:var(--jyc-surface,#fffaf1);color:var(--jyc-ink,#171513);box-shadow:0 32px 90px rgba(0,0,0,.32);padding:22px}
   html[data-theme="dark"] .jyc-assistant-panel{background:#151412;color:#f7f0e5;border-color:rgba(210,180,140,.28)}
   html[data-theme="dark"] .jyc-assistant-head p,
   html[data-theme="dark"] .jyc-assistant-result span,
   html[data-theme="dark"] .jyc-assistant-empty p,
   html[data-theme="dark"] .jyc-assistant-note,
   html[data-theme="dark"] .jyc-assistant-foot{color:#b8aea0}
   html[data-theme="dark"] .jyc-assistant-search{background:rgba(255,255,255,.035);border-color:rgba(210,180,140,.22)}
   html[data-theme="dark"] .jyc-assistant-quick button,
   html[data-theme="dark"] .jyc-assistant-result,
   html[data-theme="dark"] .jyc-assistant-empty button{border-color:rgba(210,180,140,.20);background:rgba(255,255,255,.02)}
   html[data-theme="dark"] .jyc-assistant-note{background:rgba(210,180,140,.08)}
   html[data-theme="dark"] .jyc-assistant-foot{border-color:rgba(210,180,140,.16)}
   html[data-theme="dark"] .jyc-assistant-mark{background:#18161d;border-color:rgba(210,180,140,.35)}

   .jyc-assistant-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.jyc-assistant-brand{display:flex;gap:13px;align-items:flex-start}.jyc-assistant-mark{width:46px;height:46px;flex:0 0 46px;display:grid;place-items:center;border-radius:15px;background:#faf7ef;border:1px solid rgba(194,166,130,.58);box-shadow:0 10px 24px rgba(20,25,39,.16);overflow:hidden}.jyc-assistant-mark img{width:38px;height:38px;object-fit:contain}.jyc-assistant-head h2{margin:3px 0 5px;font-size:clamp(23px,4vw,34px);letter-spacing:-.035em}.jyc-assistant-head p{margin:0;color:#6b6258;line-height:1.55}.jyc-assistant-close{width:44px;height:44px;border-radius:50%;border:1px solid rgba(23,21,19,.14);background:transparent;font-size:25px;cursor:pointer;color:inherit}
   .jyc-assistant-search{display:flex;align-items:center;gap:10px;margin:20px 0 16px;padding:6px 10px 6px 14px;border:1px solid rgba(23,21,19,.16);border-radius:17px;background:rgba(255,255,255,.64)}html[data-theme="dark"] .jyc-assistant-search{border-color:rgba(255,255,255,.14);background:rgba(255,255,255,.04)}.jyc-assistant-search span{font-size:22px}.jyc-assistant-search input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:inherit;font:inherit;padding:10px 0}.jyc-assistant-search button{width:36px;height:36px;border:0;border-radius:10px;background:transparent;color:inherit;font-size:20px}
   .jyc-assistant-quick>span,.jyc-assistant-result-meta{display:flex;justify-content:space-between}.jyc-assistant-quick>div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:9px}.jyc-assistant-quick button{min-height:54px;text-align:left;padding:11px 13px;border:1px solid rgba(23,21,19,.12);border-radius:14px;background:transparent;color:inherit;cursor:pointer}.jyc-assistant-quick button:hover{transform:translateY(-2px);border-color:rgba(164,123,67,.48);background:rgba(164,123,67,.07)}.jyc-assistant-quick b,.jyc-assistant-result>b{float:right;color:#8a673b}
   .jyc-assistant-results{display:grid;gap:8px}.jyc-assistant-result-meta{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#7a7167;padding:0 2px 4px}.jyc-assistant-result{display:grid;grid-template-columns:minmax(0,1fr) 26px;gap:3px 12px;text-align:left;padding:13px 14px;border:1px solid rgba(23,21,19,.11);border-radius:15px;background:transparent;color:inherit;cursor:pointer}.jyc-assistant-result:hover{transform:translateY(-2px);border-color:rgba(164,123,67,.5);background:rgba(164,123,67,.07)}.jyc-assistant-result small{grid-column:1/-1;letter-spacing:.1em;font-size:9px;color:#8a673b}.jyc-assistant-result strong{font-size:16px}.jyc-assistant-result span{font-size:12px;color:#746b62;line-height:1.4}.jyc-assistant-result>b{grid-row:2;grid-column:2}.jyc-assistant-empty{padding:22px 4px}.jyc-assistant-empty strong{font-size:17px}.jyc-assistant-empty p{color:#746b62;line-height:1.55}.jyc-assistant-empty button{min-height:44px;border:1px solid rgba(23,21,19,.16);border-radius:12px;background:transparent;padding:0 13px;color:inherit}.jyc-assistant-note{display:flex;gap:10px;margin-top:16px;padding:12px 14px;border-radius:14px;background:rgba(164,123,67,.08);color:#655d55}.jyc-assistant-note span{color:#8a673b}.jyc-assistant-note p{margin:0;font-size:12px;line-height:1.5}.jyc-assistant-foot{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:18px;padding-top:14px;border-top:1px solid rgba(23,21,19,.1);font-size:11px;color:#766d64}.jyc-assistant-foot button{border:0;background:none;color:#8a673b;font:inherit;cursor:pointer}
   @keyframes jycAssistantIn{from{opacity:0;transform:scale(.985)}to{opacity:1;transform:none}}@media(max-width:600px){.jyc-assistant-overlay{padding:8px}.jyc-assistant-panel{width:100%;max-height:calc(100dvh - 16px);border-radius:20px;padding:16px}.jyc-assistant-quick>div{grid-template-columns:1fr}.jyc-assistant-foot{align-items:flex-start;flex-direction:column}}@media(prefers-reduced-motion:reduce){.jyc-assistant-overlay{animation:none}.jyc-assistant-quick button:hover,.jyc-assistant-result:hover{transform:none}}
  `}</style>
 </div>
}
