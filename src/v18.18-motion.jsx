import React,{useEffect,useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';

const slug18=value=>String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const safe18=value=>{try{const u=new URL(String(value||''),window.location.origin);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
const date18=value=>{if(!value)return 'DATE TBA';try{return new Date(`${value}T12:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}catch{return value}};
const state18=e=>{if(!e?.date)return 'draft';const start=new Date(`${e.date}T${e.start||'00:00'}`).getTime();const end=new Date(`${e.date}T${e.end||'23:59'}`).getTime();const now=Date.now();return now<start?'upcoming':now<=end?'live':'past'};
const publishedClubs=data=>(data?.clubs||[]).filter(c=>c.published&&c.status!=='archived');
const publishedEvents=data=>(data?.events||[]).filter(e=>e.published&&!e.archived);

export function JYCTicker(){
 const items=['JIIT','NOIDA 128','JYC','CLUBS','EVENTS','PEOPLE','CULTURE','CAMPUS'];
 return <div className="j18-ticker" aria-label="JYC campus ticker"><div className="j18-ticker-track">{[...items,...items].map((item,i)=><span key={`${item}-${i}`}>{item}<i>•</i></span>)}</div></div>;
}

export function JYCNowStrip({data}){
 const events=publishedEvents(data);const clubs=publishedClubs(data);const live=events.filter(e=>state18(e)==='live');const upcoming=events.filter(e=>state18(e)==='upcoming').sort((a,b)=>`${a.date} ${a.start||''}`.localeCompare(`${b.date} ${b.start||''}`));const next=upcoming[0];
 return <section className="j18-now reveal" aria-label="JYC now">
   <div className="j18-now-label"><span className="j18-live-dot"/>JYC NOW</div>
   <div className="j18-now-grid">
    <div><small>STATUS</small><strong>{live.length?`${live.length} live now`:'Campus active'}</strong></div>
    <div><small>NEXT</small><strong>{next?next.title:'No event published'}</strong>{next&&<span>{date18(next.date)} · {next.venue||'Venue TBA'}</span>}</div>
    <div><small>CLUBS</small><strong>{clubs.length||'—'}</strong><span>published communities</span></div>
   </div>
 </section>;
}

export function JYCClubDirectory({data,limit=8}){
 const nav=useNavigate();const clubs=publishedClubs(data).sort((a,b)=>(Number(!!b.pinned)-Number(!!a.pinned))||String(a.name).localeCompare(String(b.name))).slice(0,limit);const [active,setActive]=useState(0);
 if(!clubs.length)return null;
 const selected=clubs[active]||clubs[0];
 return <section className="j18-section j18-clubs reveal" aria-labelledby="j18-clubs-title">
   <div className="j18-section-head"><div><span className="eyebrow">01 · CLUBS</span><h2 id="j18-clubs-title">Find a club that feels like yours.</h2></div><button className="j18-text-link" onClick={()=>nav('/clubs')}>All clubs <span>↗</span></button></div>
   <div className="j18-club-directory">
    <div className="j18-club-list">{clubs.map((c,i)=><button data-cursor="EXPLORE" key={c.id||c.name} className={`j18-club-row ${i===active?'active':''}`} onMouseEnter={()=>setActive(i)} onFocus={()=>setActive(i)} onClick={()=>nav(`/clubs/${slug18(c.slug||c.name)}`)}><span>{String(i+1).padStart(2,'0')}</span><strong>{c.name}</strong><small>{c.category||c.type||'JYC club'}</small><b>↗</b></button>)}</div>
    <div className="j18-club-preview" aria-live="polite"><div className="j18-preview-index">{String(active+1).padStart(2,'0')} / {String(clubs.length).padStart(2,'0')}</div>{selected.banner||selected.logo?<img src={selected.banner||selected.logo} alt="" loading="lazy"/>:<div className="j18-preview-placeholder"><span>JYC</span><small>{selected.type||'CLUB'}</small></div>}<div className="j18-preview-copy"><strong>{selected.name}</strong><span>{selected.description||'Official JYC club information.'}</span></div></div>
   </div>
 </section>;
}

export function JYCEventTimeline({data,limit=6}){
 const nav=useNavigate();const events=publishedEvents(data).sort((a,b)=>`${a.date} ${a.start||''}`.localeCompare(`${b.date} ${b.start||''}`));const live=events.filter(e=>state18(e)==='live');const future=events.filter(e=>state18(e)==='upcoming');const list=[...live,...future].slice(0,limit);const [active,setActive]=useState(0);const selected=list[active];
 if(!list.length)return <section className="j18-section j18-events reveal"><div className="j18-section-head"><div><span className="eyebrow">02 · EVENTS</span><h2>Nothing published yet.</h2></div></div><p className="j18-empty-line">When JYC publishes an event, it will appear here.</p></section>;
 return <section className="j18-section j18-events reveal" aria-labelledby="j18-events-title"><div className="j18-section-head"><div><span className="eyebrow">02 · EVENTS</span><h2 id="j18-events-title">What's happening next.</h2></div><button className="j18-text-link" onClick={()=>nav('/events')}>Event archive <span>↗</span></button></div><div className="j18-event-layout"><div className="j18-event-list">{list.map((e,i)=><button data-cursor="OPEN" key={e.id||e.title} className={`j18-event-row ${i===active?'active':''}`} onMouseEnter={()=>setActive(i)} onFocus={()=>setActive(i)} onClick={()=>nav(`/events/${slug18(e.slug||e.title)}`)}><span className="j18-event-date">{date18(e.date)}</span><strong>{e.title}</strong><small>{e.club||'JYC'} · {e.venue||'Venue TBA'}</small><em>{state18(e)==='live'?'LIVE':'OPEN'} ↗</em></button>)}</div><div className="j18-event-feature">{selected?.poster?<img src={selected.poster} alt="" loading="lazy"/>:<div className="j18-event-poster-fallback"><span>{selected?.title||'JYC EVENT'}</span><small>{selected?.club||'JYC'} · {selected?.date?date18(selected.date):'DATE TBA'}</small></div>}<div><span className={state18(selected)==='live'?'j18-status live':'j18-status'}>{state18(selected)==='live'?'LIVE NOW':'UP NEXT'}</span><strong>{selected?.title}</strong><p>{selected?.description||'Open the event for registration, venue, calendar and other published details.'}</p></div></div></div></section>;
}

export function JYCMomentsRail({data,limit=8}){
 const nav=useNavigate();const rail=useRef(null);const items=(data?.gallery||[]).filter(g=>g?.url).slice(0,limit);if(!items.length)return null;
 const scroll=dir=>rail.current?.scrollBy({left:dir*360,behavior:'smooth'});
 return <section className="j18-section j18-moments reveal" aria-labelledby="j18-moments-title"><div className="j18-section-head"><div><span className="eyebrow">03 · MOMENTS</span><h2 id="j18-moments-title">The campus, as it happened.</h2></div><div className="j18-rail-actions"><button onClick={()=>scroll(-1)} aria-label="Previous moments">←</button><button onClick={()=>scroll(1)} aria-label="Next moments">→</button><button className="j18-text-link" onClick={()=>nav('/gallery')}>Full archive <span>↗</span></button></div></div><div className="j18-moment-rail" ref={rail}>{items.map((g,i)=><button data-cursor="VIEW" className={`j18-moment ${i%4===0?'wide':''}`} key={g.id||i} onClick={()=>nav('/gallery')}><img src={g.url} alt={g.caption||'JYC moment'} loading="lazy"/><span><b>{String(i+1).padStart(2,'0')}</b>{g.caption||'JYC moment'} <em>↗</em></span></button>)}</div></section>;
}

export function JYCArchive({data}){
 const nav=useNavigate();const years=[...new Set(publishedEvents(data).map(e=>String(e.date||'').slice(0,4)).filter(Boolean))].sort((a,b)=>Number(b)-Number(a));if(!years.length)return null;
 return <section className="j18-archive reveal"><div><span className="eyebrow">04 · ARCHIVE</span><h2>JYC has a history.</h2><p>Past events stay part of the club's story instead of disappearing when the semester ends.</p></div><div className="j18-years">{years.slice(0,6).map(y=><button key={y} onClick={()=>nav(`/events?year=${encodeURIComponent(y)}`)}><strong>{y}</strong><span>events ↗</span></button>)}</div></section>;
}

export function JYCActivityFeed({data}){
 const nav=useNavigate();const events=publishedEvents(data).sort((a,b)=>`${b.date} ${b.start||''}`.localeCompare(`${a.date} ${a.start||''}`)).slice(0,4);const announcement=data?.announcement?.on&&data.announcement.text?data.announcement:null;if(!events.length&&!announcement)return null;
 return <section className="j18-section j18-notes reveal"><div className="j18-section-head"><div><span className="eyebrow">05 · FROM JYC</span><h2>Small updates worth knowing.</h2></div></div><div className="j18-notes-list">{announcement&&<button className="j18-note" onClick={()=>{const url=safe18(announcement.link);if(url)window.open(url,'_blank','noopener,noreferrer')}}><span>UPDATE</span><strong>{announcement.text}</strong><b>↗</b></button>}{events.map((e,i)=><button className="j18-note" key={e.id||i} onClick={()=>nav(`/events/${slug18(e.slug||e.title)}`)}><span>{date18(e.date)}</span><strong>{e.title}</strong><small>{e.club||'JYC'} · {e.venue||'Venue TBA'}</small><b>↗</b></button>)}</div></section>;
}
