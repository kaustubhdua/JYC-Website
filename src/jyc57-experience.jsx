import React,{useEffect,useMemo,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';

const safeDate=(e)=>{const t=Date.parse(`${e?.date||''}T${e?.start||'00:00'}`);return Number.isFinite(t)?t:Infinity};
const stateOf=(e)=>{const start=safeDate(e),end=Date.parse(`${e?.dateEnd||e?.date||''}T${e?.end||'23:59'}`),now=Date.now();if(!Number.isFinite(start)||!e?.date)return 'draft';if(now<start)return 'upcoming';if(Number.isFinite(end)&&now<=end)return 'live';return 'past'};
const publishedEvents=(data)=>Array.isArray(data?.events)?data.events.filter(e=>e?.published&&e?.archived!==true):[];
const publishedClubs=(data)=>Array.isArray(data?.clubs)?data.clubs.filter(c=>c?.published&&c?.status!=='archived'):[];

function MetaPill({children,tone=''}){return <span className={`jyc57-pill ${tone}`}>{children}</span>}
function Empty({eyebrow,title,text}){return <div className="jyc57-empty"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>}

export function JYC57Events({data}){
 const nav=useNavigate(),loc=useLocation();
 const params=useMemo(()=>new URLSearchParams(loc.search),[loc.search]);
 const [query,setQuery]=useState(params.get('q')||''),[category,setCategory]=useState(params.get('category')||'All'),[scope,setScope]=useState(params.get('status')||'upcoming');
 const events=useMemo(()=>publishedEvents(data).sort((a,b)=>safeDate(a)-safeDate(b)),[data]);
 const categories=useMemo(()=>['All',...new Set(events.map(e=>e.eventType||e.category||'').filter(Boolean))],[events]);
 const filtered=useMemo(()=>events.filter(e=>{
   const hay=`${e.title} ${e.club} ${e.eventType} ${e.description} ${e.venue}`.toLowerCase();
   const okQ=!query.trim()||hay.includes(query.trim().toLowerCase());
   const okC=category==='All'||(e.eventType||e.category)===category;
   const s=stateOf(e),okS=scope==='all'||s===scope;
   return okQ&&okC&&okS;
 }),[events,query,category,scope]);
 const featured=events.find(e=>e.featured&&stateOf(e)!=='past')||events.find(e=>stateOf(e)==='live')||events.find(e=>stateOf(e)==='upcoming');
 const upcoming=events.filter(e=>stateOf(e)==='upcoming'||stateOf(e)==='live').slice(0,5);
 return <section className="section page unified-public-page jyc57-page">
  <div className="visible-breadcrumbs"><button onClick={()=>nav('/')}>JYC</button><span>→</span><strong>Events</strong></div>
  <header className="jyc57-hero">
   <div><span className="eyebrow">JYC · 01 / DISCOVER</span><h1>Events that move the campus.</h1><p>Find what is happening at JIIT Sector 128, see the details that matter, and move from discovery to participation without friction.</p></div>
   {featured&&<button className="jyc57-feature" onClick={()=>nav('/events/'+(featured.id||featured.title))}>{featured.poster?<img src={featured.poster} alt="" loading="eager"/>:<div className="jyc57-feature-fallback">JYC</div>}<div><MetaPill tone={stateOf(featured)==='live'?'live':''}>{stateOf(featured)==='live'?'LIVE NOW':'UP NEXT'}</MetaPill><strong>{featured.title}</strong><small>{featured.club||'JYC'} · {featured.venue||'JIIT Sector 128'}</small><span>Open event ↗</span></div></button>}
  </header>
  <div className="jyc57-event-toolbar" aria-label="Event filters">
   <label className="jyc57-search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search events, clubs or topics" aria-label="Search events"/></label>
   <div className="jyc57-segment">{[['upcoming','Upcoming'],['live','Live'],['past','Past'],['all','All']].map(([id,label])=><button key={id} className={scope===id?'active':''} onClick={()=>setScope(id)}>{label}</button>)}</div>
  </div>
  <div className="jyc57-category-row" aria-label="Event categories">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
  <div className="jyc57-event-layout">
   <div className="jyc57-event-list">
    <div className="jyc57-list-head"><span>{filtered.length} published {filtered.length===1?'event':'events'}</span><small>Sector 128 only</small></div>
    {filtered.length?filtered.map((e,i)=><button className="jyc57-event-card" key={e.id||e.title||i} onClick={()=>nav('/events/'+(e.id||e.title))}>
      <div className="jyc57-event-date"><b>{e.date?new Date(`${e.date}T12:00`).toLocaleDateString('en-IN',{day:'2-digit'}):'—'}</b><span>{e.date?new Date(`${e.date}T12:00`).toLocaleDateString('en-IN',{month:'short'}):'TBA'}</span></div>
      <div className="jyc57-event-copy"><div><MetaPill tone={stateOf(e)==='live'?'live':''}>{stateOf(e)==='live'?'LIVE':stateOf(e)==='past'?'ARCHIVED':'UPCOMING'}</MetaPill>{(e.eventType||e.category)&&<MetaPill>{e.eventType||e.category}</MetaPill>}</div><h2>{e.title}</h2><p>{e.description||'Open the event for registration, schedule, venue and published details.'}</p><small>{e.club||'JYC'} · {e.venue||'JIIT Sector 128'}</small></div>
      <span className="jyc57-arrow" aria-hidden="true">↗</span>
    </button>):<Empty eyebrow="EVENT DIRECTORY" title="Nothing matches this view." text="Try another category, status, or search term. Only published Sector-128 events are shown."/>}
   </div>
   <aside className="jyc57-next"><span className="eyebrow">02 / WHAT'S NEXT</span><h2>Near-term rhythm.</h2>{upcoming.map(e=><button key={e.id||e.title} onClick={()=>nav('/events/'+(e.id||e.title))}><span>{e.date||'TBA'}</span><strong>{e.title}</strong><small>{e.start||'Time TBA'} · {e.venue||'Venue TBA'}</small></button>)}{!upcoming.length&&<p>No upcoming published events yet.</p>}<button className="jyc57-text-link" onClick={()=>setScope('past')}>Browse the archive →</button></aside>
  </div>
 </section>
}

export function JYC57Clubs({data}){
 const nav=useNavigate();const [query,setQuery]=useState(''),[family,setFamily]=useState('All'),[active,setActive]=useState(null);
 const clubs=publishedClubs(data);const families=['All',...new Set(clubs.map(c=>c.type||c.category||'').filter(Boolean))];
 const filtered=clubs.filter(c=>{const hay=`${c.name} ${c.category} ${c.description} ${(c.interests||[]).join(' ')}`.toLowerCase();return (!query||hay.includes(query.toLowerCase()))&&(family==='All'||(c.type||c.category)===family)});
 return <section className="section page unified-public-page jyc57-page">
  <header className="jyc57-hero jyc57-club-hero"><div><span className="eyebrow">JYC · 02 / FIND YOUR SPACE</span><h1>Communities, not just cards.</h1><p>Explore the published JYC community index by family, interest and identity. Open a club to see its people, activities, events and official links.</p></div><div className="jyc57-club-count"><b>{clubs.length}</b><span>published communities</span></div></header>
  <div className="jyc57-event-toolbar"><label className="jyc57-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a club or interest" aria-label="Search clubs"/></label><div className="jyc57-segment">{families.map(f=><button key={f} className={family===f?'active':''} onClick={()=>setFamily(f)}>{f}</button>)}</div></div>
  <div className="jyc57-club-wall">{filtered.map((c,i)=>{const selected=active===i;const photo=c.banner||c.logo||c.hubPhotos?.[0];return <button key={c.id||c.name||i} className={`jyc57-club-card ${selected?'selected':''}`} onMouseEnter={()=>setActive(i)} onFocus={()=>setActive(i)} onClick={()=>nav('/clubs/'+(c.id||c.name))}>{photo?<img src={photo} alt="" loading="lazy"/>:<div className="jyc57-club-fallback">{String(c.name||'JYC').slice(0,2).toUpperCase()}</div>}<span className="jyc57-club-shade"/><div className="jyc57-club-content"><MetaPill>{c.type||c.category||'JYC'}</MetaPill><h2>{c.name}</h2><p>{c.description||c.about||'A published JYC community.'}</p><span>Explore community ↗</span></div></button>})}</div>
  {!filtered.length&&<Empty eyebrow="COMMUNITY DIRECTORY" title="No community found." text="Try a broader search or another family."/>}
 </section>
}

export function JYC57Gallery({data}){
 const [query,setQuery]=useState(''),[selected,setSelected]=useState(null);
 const items=useMemo(()=>Array.isArray(data?.gallery)?data.gallery.filter(g=>g?.url||g?.src):[],[data]);
 const filtered=items.filter(g=>{const hay=`${g.caption||''} ${g.association||''} ${g.collection||''} ${g.year||''}`.toLowerCase();return !query||hay.includes(query.toLowerCase())});
 useEffect(()=>{if(selected!==null){const onKey=e=>{if(e.key==='Escape')setSelected(null);};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)}},[selected]);
 return <section className="section page unified-public-page jyc57-page">
  <header className="jyc57-archive-head"><div><span className="eyebrow">JYC · 03 / ARCHIVE</span><h1>Keep the moments.</h1><p>A photography-first archive built from published JYC media. Open an image for the full story context when it is available.</p></div><label className="jyc57-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search the archive" aria-label="Search gallery"/></label></header>
  <div className="jyc57-gallery-meta"><span><b>{filtered.length}</b> published frames</span><span>Photography first</span><span>Keyboard accessible</span></div>
  {filtered.length?<div className="jyc57-masonry">{filtered.map((g,i)=><button key={g.id||i} className={`jyc57-photo photo-${i%6}`} onClick={()=>setSelected(i)}><img src={g.url||g.src} alt={g.caption||g.association||'JYC archive photograph'} loading={i<6?'eager':'lazy'}/><span><small>{g.association||g.collection||'JYC'}</small><strong>{g.caption||'JYC moment'}</strong></span></button>)}</div>:<Empty eyebrow="VISUAL ARCHIVE" title="The archive is waiting." text="No published photography matches this search yet."/>}
  {selected!==null&&filtered[selected]&&<div className="jyc57-lightbox" role="dialog" aria-modal="true" aria-label="JYC photograph" onClick={()=>setSelected(null)}><div className="jyc57-lightbox-inner" onClick={e=>e.stopPropagation()}><button className="jyc57-close" onClick={()=>setSelected(null)} aria-label="Close">×</button><img src={filtered[selected].url||filtered[selected].src} alt={filtered[selected].caption||'JYC photograph'}/><div><span className="eyebrow">{filtered[selected].association||'JYC'}</span><h2>{filtered[selected].caption||'JYC moment'}</h2><p>{filtered[selected].story||filtered[selected].description||'Published JYC photography.'}</p></div></div></div>}
 </section>
}

export function JYC57Archive({data}){
 const nav=useNavigate();const events=publishedEvents(data);const years=[...new Set(events.map(e=>String(e.date||'').slice(0,4)).filter(Boolean))].sort((a,b)=>Number(b)-Number(a));
 const [year,setYear]=useState(years[0]||'all');const selected=year==='all'?events:events.filter(e=>String(e.date||'').startsWith(year));const photos=(data.gallery||[]).filter(g=>g?.url||g?.src).slice(0,6);
 return <section className="section page unified-public-page jyc57-page">
  <header className="jyc57-archive-head"><div><span className="eyebrow">JYC · 04 / HISTORY</span><h1>What happened stays.</h1><p>The public archive connects years, events and photographs so JYC feels like a living organisation rather than a list of current pages.</p></div><div className="jyc57-year-switch">{['all',...years].map(y=><button key={y} className={year===y?'active':''} onClick={()=>setYear(y)}>{y==='all'?'All':y}</button>)}</div></header>
  <div className="jyc57-archive-grid"><div><div className="jyc57-list-head"><span>{selected.length} archived/published events</span><small>Year: {year==='all'?'All':year}</small></div>{selected.sort((a,b)=>safeDate(b)-safeDate(a)).map(e=><button className="jyc57-archive-row" key={e.id||e.title} onClick={()=>nav('/events/'+(e.id||e.title))}><span>{e.date||'TBA'}</span><div><strong>{e.title}</strong><small>{e.club||'JYC'} · {e.venue||'JIIT Sector 128'}</small></div><b>↗</b></button>)}{!selected.length&&<Empty eyebrow="ARCHIVE" title="No records for this year." text="Published records will appear here when available."/>}</div><aside className="jyc57-archive-story"><span className="eyebrow">VISUAL MEMORY</span><h2>People. Places. Participation.</h2><div className="jyc57-story-grid">{photos.map((g,i)=><img key={g.id||i} src={g.url||g.src} alt={g.caption||'JYC archive'} loading="lazy"/>)}</div><button className="jyc57-text-link" onClick={()=>nav('/gallery')}>Open the full gallery →</button></aside></div>
 </section>
}
