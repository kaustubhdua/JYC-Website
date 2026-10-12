import React,{useEffect,useMemo,useRef,useState} from 'react';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {useLocation,useNavigate} from 'react-router-dom';
import {supabase} from './lib/supabase';
import {JYC_SOURCE_ARCHIVE_PHOTO_ITEMS,JYC_SOURCE_ARCHIVE_ALBUMS,rankJycPhotoItems,sourceHubMedia,sourceEventMedia} from './jyc-source-media.js';
import {eventIdentity} from './hub-identities.js';
import {ResponsivePhoto} from './jyc-responsive-photo.jsx';
import {loadJycImageManifest} from './jyc-image-manifest.js';
import AccordionGallery from './components/react-bits/AccordionGallery.jsx';

const safeDate=(e)=>{const t=Date.parse(`${e?.date||''}T${e?.start||'00:00'}`);return Number.isFinite(t)?t:Infinity};
const stateOf=(e)=>{const start=safeDate(e),end=Date.parse(`${e?.dateEnd||e?.date||''}T${e?.end||'23:59'}`),now=Date.now();if(!Number.isFinite(start)||!e?.date)return 'draft';if(now<start)return 'upcoming';if(Number.isFinite(end)&&now<=end)return 'live';return 'past'};
const publishedEvents=(data)=>Array.isArray(data?.events)?data.events.filter(e=>e?.published&&e?.archived!==true):[];
const publishedClubs=(data)=>Array.isArray(data?.clubs)?data.clubs.filter(c=>c?.published&&c?.status!=='archived'):[];
const eventPath=(e)=>`/events/${encodeURIComponent(String(e?.slug||slugify(e?.title)||e?.id||''))}`;
const albumPath=value=>'/gallery/'+encodeURIComponent(value);
const slugify=(value)=>String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const syncFilters=(nav,loc,values)=>{const p=new URLSearchParams(loc.search);Object.entries(values).forEach(([k,v])=>{const value=String(v??'').trim();if(!value||value==='All'||(k==='status'&&value==='upcoming'))p.delete(k);else p.set(k,value)});const search=p.toString();nav({pathname:loc.pathname,search:search?'?'+search:''},{replace:true});};

const LOGO_FALLBACK=import.meta.env.PROD?'/assets/jyc-logo.webp':'/JYC%20Logo(4).png';
const identityPalette=['#38bdf8','#818cf8','#fbbf24','#34d399','#f43f5e','#a855f7'];
const identityAccent=value=>{let hash=0;for(const ch of String(value||'JYC'))hash=(hash*31+ch.charCodeAt(0))>>>0;return identityPalette[hash%identityPalette.length]};
const eventCardPhoto=event=>event?.poster||event?.banner||sourceEventMedia(event)?.photoItems?.find(item=>item?.url)?.url||'';
const clubCardPhoto=club=>{const clubName=typeof club==='object'&&club!==null?club.name:club;const source=sourceHubMedia(clubName);return club?.hubPhotos?.[0]||source?.photos?.[0]||source?.photoItems?.find(item=>item?.url)?.url||source?.visuals?.[0]||(club?.banner&&club.banner!==club.logo?club.banner:'')||''};
function magneticMove(event){
 if(event.pointerType!=='mouse'||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const element=event.currentTarget,rect=element.getBoundingClientRect();
 if(!rect.width||!rect.height)return;
 const x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
 element.style.setProperty('--magnetic-x',`${(x*7).toFixed(2)}px`);
 element.style.setProperty('--magnetic-y',`${(y*7).toFixed(2)}px`);
 element.style.setProperty('--magnetic-rx',`${(-y*1.7).toFixed(2)}deg`);
 element.style.setProperty('--magnetic-ry',`${(x*1.7).toFixed(2)}deg`);
}
function magneticReset(event){for(const property of ['--magnetic-x','--magnetic-y','--magnetic-rx','--magnetic-ry'])event.currentTarget.style.removeProperty(property)}
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
 const timelineDays=useMemo(()=>{const rows=filtered.filter(e=>e.date).reduce((m,e)=>{const k=String(e.date);(m[k] ||= []).push(e);return m},{});return Object.entries(rows).sort(([a],[b])=>safeDate({date:a})-safeDate({date:b})).slice(0,7)},[filtered]);
 return <section className="section page unified-public-page jyc57-page">
  <div className="visible-breadcrumbs"><button type="button" onClick={()=>nav('/')}>JYC</button><span>→</span><strong>Events</strong></div>
  <header className="jyc57-hero">
   <div><span className="eyebrow">JYC · 01 / DISCOVER</span><h1>Events that move the campus.</h1><p>Find what is happening at JIIT Sector 128, see the details that matter, and move from discovery to participation without friction.</p></div>
   {featured&&<button type="button" className="jyc57-feature" onClick={()=>nav(eventPath(featured))}>{eventCardPhoto(featured)?<ResponsivePhoto src={eventCardPhoto(featured)} alt="" loading="eager" fetchPriority="high" sizes="(max-width: 760px) 35vw, 240px"/>:<div className="jyc57-feature-fallback">JYC</div>}<div><MetaPill tone={stateOf(featured)==='live'?'live':''}>{stateOf(featured)==='live'?'LIVE NOW':'UP NEXT'}</MetaPill><strong>{featured.title}</strong><small>{featured.club||'JYC'} · {featured.venue||'JIIT Sector 128'}</small><span>Open event ↗</span></div></button>}
  </header>
  <div className="jyc57-event-toolbar" aria-label="Event filters">
   <label className="jyc57-search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>{const v=e.target.value;setQuery(v);syncFilters(nav,loc,{q:v,category,status:scope})}} placeholder="Search events, clubs or topics" aria-label="Search events"/></label>
   <div className="jyc57-segment">{[['upcoming','Upcoming'],['live','Live'],['past','Past'],['all','All']].map(([id,label])=><button type="button" key={id} className={scope===id?'active':''} onClick={()=>{setScope(id);syncFilters(nav,loc,{q:query,category,status:id})}}>{label}</button>)}</div>
  </div>
  <div className="jyc57-category-row" aria-label="Event categories">{categories.map(c=><button type="button" key={c} className={category===c?'active':''} onClick={()=>{setCategory(c);syncFilters(nav,loc,{q:query,category:c,status:scope})}}>{c}</button>)}</div>
  {timelineDays.length>1&&<section className="jyc57-event-timeline" aria-label="Event timeline"><div className="jyc57-section-head"><div><span className="eyebrow">EVENT TIMELINE</span><h2>See the week at a glance.</h2></div><span>{timelineDays.length} dates in this view</span></div><div className="jyc57-timeline-days">{timelineDays.map(([day,rows],i)=><button type="button" key={day} onClick={()=>document.getElementById('event-day-'+day)?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'})}><b>{new Date(day+'T12:00').toLocaleDateString('en-IN',{day:'2-digit'})}</b><span>{new Date(day+'T12:00').toLocaleDateString('en-IN',{weekday:'short',month:'short'})}</span><small>{rows.length} {rows.length===1?'event':'events'}</small></button>)}</div><div className="jyc57-timeline-list">{timelineDays.map(([day,rows])=><div id={'event-day-'+day} className="jyc57-timeline-day" key={day}><strong>{new Date(day+'T12:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</strong>{rows.slice(0,4).map(e=><button type="button" key={e.id||e.title} onClick={()=>nav(eventPath(e))}><span>{e.start||'TBA'}</span><div><b>{e.title}</b><small>{e.club||'JYC'} · {e.venue||'JIIT Sector 128'}</small></div><em>↗</em></button>)}</div>)}</div></section>}
  <div className="jyc57-event-layout">
   <div className="jyc57-event-list">
    <div className="jyc57-list-head"><span>{filtered.length} published {filtered.length===1?'event':'events'}</span><small>Sector 128 only</small></div>
    {filtered.length?filtered.map((e,i)=>{const photo=eventCardPhoto(e);return <button type="button" className="jyc57-event-card" key={e.id||e.title||i} style={{'--event-accent':eventIdentity(e).accent||identityAccent(e.title||e.slug||e.club)}} onPointerMove={magneticMove} onPointerLeave={magneticReset} onClick={()=>nav(eventPath(e))}>
      <div className="jyc57-event-date"><b>{e.date?new Date(`${e.date}T12:00`).toLocaleDateString('en-IN',{day:'2-digit'}):'—'}</b><span>{e.date?new Date(`${e.date}T12:00`).toLocaleDateString('en-IN',{month:'short'}):'TBA'}</span></div>
      <div className="jyc57-event-art">{photo?<ResponsivePhoto src={photo} alt="" loading="lazy" decoding="async" sizes="92px" fallbackSrc={e.poster||LOGO_FALLBACK} fallbackAlt=""/>:<span>{String(e.eventType||e.club||'JYC').slice(0,3).toUpperCase()}</span>}</div>
      <div className="jyc57-event-copy"><div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}><MetaPill tone={stateOf(e)==='live'?'live':''}>{stateOf(e)==='live'?'● LIVE NOW':stateOf(e)==='past'?'ARCHIVED':'UPCOMING'}</MetaPill>{(e.eventType||e.category)&&<MetaPill>{e.eventType||e.category}</MetaPill>}{e.registrationUrl&&stateOf(e)!=='past'&&<span className="jyc57-reg-pill">REGISTRATION OPEN ↗</span>}</div><h2>{e.title}</h2><p>{e.description||'Open the event for registration, schedule, venue and published details.'}</p><small>{e.club||'JYC'} · {e.venue||'JIIT Sector 128'}{e.start?` · ${e.start}`:''}</small></div>
      <span className="jyc57-arrow" aria-hidden="true">↗</span>
    </button>}):<Empty eyebrow="EVENT DIRECTORY" title="Nothing matches this view." text="Try another category, status, or search term. Only published Sector-128 events are shown."/>}
   </div>
   <aside className="jyc57-next"><span className="eyebrow">02 / WHAT'S NEXT</span><h2>Near-term rhythm.</h2>{upcoming.map(e=><button type="button" key={e.id||e.title} onClick={()=>nav(eventPath(e))}><span>{e.date||'TBA'}</span><strong>{e.title}</strong><small>{e.start||'Time TBA'} · {e.venue||'Venue TBA'}</small></button>)}{!upcoming.length&&<p>No upcoming published events yet.</p>}<button type="button" className="jyc57-text-link" onClick={()=>setScope('past')}>Browse the archive →</button></aside>
  </div>
 </section>
}

export function JYC57Clubs({data}){
 const nav=useNavigate();
 const [query,setQuery]=useState('');
 const [family,setFamily]=useState('All');
 const [type,setType]=useState('All');
 const [domain,setDomain]=useState('All');
 const [filtersOpen,setFiltersOpen]=useState(false);
 const [active,setActive]=useState(null);

 const clubs=publishedClubs(data);
 const families=['All','Technical','Cultural','Creative','Literary','Sports'];
 const types=['All','Technical','Non-Technical'];
 const quickDomains=[
   'AI & Coding',
   'Robotics & Drones',
   'Web & App',
   'Music & Band',
   'Dance',
   'Theatre & Drama',
   'Debate & MUN',
   'Design & Media',
   'Photography',
   'Sports & Fitness'
 ];

 const activeFilterCount=(family!=='All'?1:0)+(type!=='All'?1:0)+(domain!=='All'?1:0);

 const filtered=clubs.filter(c=>{
  const hay=`${c.name} ${c.category||''} ${c.type||''} ${c.description||''} ${(c.interests||[]).join(' ')}`.toLowerCase();
  const matchesQuery=!query||hay.includes(query.toLowerCase());
  const matchesFamily=family==='All'||c.type===family||c.category===family||(c.interests||[]).includes(family);
  const matchesType=type==='All'||c.type===type;
  const matchesDomain=domain==='All'||hay.includes(domain.toLowerCase().split('&')[0].trim());
  return matchesQuery && matchesFamily && matchesType && matchesDomain;
 });

 const clearAllFilters=()=>{
  setQuery('');
  setFamily('All');
  setType('All');
  setDomain('All');
 };

 return <section className="section page unified-public-page jyc57-page jyc-clubs-hub-container">
  <header className="jyc-clubs-header">
   <span className="jh-kicker">JYC 128 <b>COMMUNITIES</b></span>
   <h1>Explore the Club Ecosystem.</h1>
   <p>Find your space across 23 technical, cultural, creative, literary and sports hubs at JIIT Sector 128.</p>
  </header>

  {/* Sleek Filter Bar */}
  <div className="jyc-filter-bar">
   <div className="jyc-search-input-wrap">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <input className="jyc-search-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search clubs by name, tech, domain..." aria-label="Search clubs"/>
    {query&&<button type="button" onClick={()=>setQuery('')} style={{position:'absolute',right:12,background:'none',border:0,color:'#888',cursor:'pointer',fontSize:16}}>×</button>}
   </div>

   <button type="button" className={`jyc-filter-toggle-btn ${filtersOpen||activeFilterCount>0?'is-active':''}`} onClick={()=>setFiltersOpen(v=>!v)} aria-expanded={filtersOpen}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
    Filter Communities
    {activeFilterCount>0&&<span className="filter-badge">{activeFilterCount}</span>}
    <span>{filtersOpen?'▲':'▼'}</span>
   </button>
  </div>

  {/* Quick Family Filter Ribbon */}
  <div className="jyc-quick-family-pills" aria-label="Quick family filter">
   {families.map(f=>{
     const count = f === 'All' ? clubs.length : clubs.filter(c => c.type === f || c.category === f || (c.interests||[]).includes(f)).length;
     return (
       <button
         type="button"
         key={f}
         className={`jyc-quick-pill ${family === f ? 'is-active' : ''}`}
         onClick={() => setFamily(f)}
       >
         <span>{f}</span>
         <small>{count}</small>
       </button>
     );
   })}
  </div>

  {/* Expandable Filter Drawer */}
  {filtersOpen&&<div className="jyc-filter-drawer">
   <div className="jyc-filter-group">
    <span className="jyc-filter-group-label">Community Family</span>
    <div className="jyc-filter-pill-row">
     {families.map(f=><button type="button" key={f} className={`jyc-filter-pill ${family===f?'is-active':''}`} onClick={()=>setFamily(f)}>{f}</button>)}
    </div>
   </div>

   <div className="jyc-filter-group">
    <span className="jyc-filter-group-label">Society Type</span>
    <div className="jyc-filter-pill-row">
     {types.map(t=><button type="button" key={t} className={`jyc-filter-pill ${type===t?'is-active':''}`} onClick={()=>setType(t)}>{t}</button>)}
    </div>
   </div>

   <div className="jyc-filter-group">
    <span className="jyc-filter-group-label">Domain / Focus Area</span>
    <div className="jyc-filter-pill-row">
     <button type="button" className={`jyc-filter-pill ${domain==='All'?'is-active':''}`} onClick={()=>setDomain('All')}>All Domains</button>
     {quickDomains.map(d=><button type="button" key={d} className={`jyc-filter-pill ${domain===d?'is-active':''}`} onClick={()=>setDomain(d)}>{d}</button>)}
    </div>
   </div>

   <div className="jyc-filter-drawer-footer">
    <span>Showing <b>{filtered.length}</b> of {clubs.length} communities</span>
    {(activeFilterCount>0||query)&&<button type="button" className="jyc-clear-filters-btn" onClick={clearAllFilters}>Reset All Filters ↺</button>}
   </div>
  </div>}

  {/* Club Cards Wall */}
  <div className="jyc57-club-wall">
   {filtered.map((c,i)=>{
    const selected=active===i;
    const photo=clubCardPhoto(c);
    return <button type="button" key={c.id||c.name||i} className={`jyc57-club-card ${selected?'selected':''}`} style={{'--club-accent':identityAccent(c.name)}} onPointerMove={magneticMove} onPointerLeave={magneticReset} onMouseEnter={()=>setActive(i)} onFocus={()=>setActive(i)} onClick={()=>nav('/clubs/'+encodeURIComponent(slugify(c.name)))}>
     {photo?<ResponsivePhoto src={photo} alt="" loading="lazy" decoding="async" sizes="(max-width: 760px) 50vw, (max-width: 1100px) 50vw, 33vw" fallbackSrc={c.logo||LOGO_FALLBACK} fallbackAlt=""/>:<div className="jyc57-club-fallback"><span aria-hidden="true">{String(c.name||'JYC').slice(0,2).toUpperCase()}</span>{c.logo&&<ResponsivePhoto className="jyc57-club-fallback-logo" src={c.logo} alt={`${c.name||'JYC'} logo`} width={160} height={160} loading="lazy" decoding="async" sizes="160px"/>}</div>}
     <span className="jyc57-club-shade"/>
     <div className="jyc57-club-content">
      <div className="jyc57-club-top-bar">
       <MetaPill>{c.type||c.category||'JYC'}</MetaPill>
       {c.logo&&<div className="jyc57-club-brand-glyph" title={`${c.name} official emblem`}><img src={c.logo} alt="" loading="lazy"/></div>}
      </div>
      <h2>{c.name}</h2>
      <p>{c.description||c.about||'A published JYC community.'}</p>
      <span>Explore Community ↗</span>
     </div>
    </button>;
   })}
  </div>
  {!filtered.length&&<Empty eyebrow="COMMUNITY DIRECTORY" title="No community found." text="Try clearing some filters or searching with a different term."/>}
 </section>;
}

export function JYC57Gallery({data}){
  const nav=useNavigate(),loc=useLocation();
  const params=useMemo(()=>new URLSearchParams(loc.search),[loc.search]);
  const [query,setQuery]=useState(params.get('q')||'');
  const [eventCategory,setEventCategory]=useState('All');
  const [mediaFilter,setMediaFilter]=useState('all');
  const [year,setYear]=useState(params.get('year')||'All');
  const [selected,setSelected]=useState(null);
  const [album,setAlbum]=useState(null);
  const [albumItems,setAlbumItems]=useState([]);
  const touchStart=useRef(null);
  const albumSlug=loc.pathname.startsWith('/gallery/')?decodeURIComponent(loc.pathname.split('/')[2]||''):'';
  const [zoom,setZoom]=useState(1);
  const [copied,setCopied]=useState(false);
  const [visibleCount,setVisibleCount]=useState(36);

  const eventMemories = [
    {
      id: 'converge-2026',
      title: 'Converge 2026',
      subtitle: 'Annual Cultural & Technical Flagship Fest',
      category: 'Festivals',
      year: '2026',
      count: '86 Photos · 2 Videos',
      cover: '/assets/events/converge-2026.webp'
    },
    {
      id: 'jai-2026',
      title: 'JAI 2026 · AI Hackathon',
      subtitle: 'Jaypee Agentic AI International Summit',
      category: 'Competitions',
      year: '2026',
      count: '64 Photos · Flagship Event',
      cover: '/assets/events/jai-2026.webp'
    },
    {
      id: 'drono-war-2026',
      title: 'Dron-O-War 2026',
      subtitle: 'National Drone Racing & Combat Robotics',
      category: 'Competitions',
      year: '2026',
      count: '54 Photos · Arena Combat',
      cover: '/assets/home/dron-o-war-1.webp'
    },
    {
      id: 'ebullience-2025',
      title: "Ebullience '25",
      subtitle: "Freshers' Cultural Showcase",
      category: 'Festivals',
      year: '2025',
      count: '72 Photos',
      cover: '/assets/home/ebullience.webp'
    },
    {
      id: 'kshitij-sports-2026',
      title: 'Kshitij Sports 2026',
      subtitle: 'Annual Intra & Inter-College Sports Championship',
      category: 'Sports',
      year: '2026',
      count: '48 Photos · Kshitij Meet',
      cover: '/assets/hub-photos/sports-02.webp'
    },
    {
      id: 'vamunique-dance-2026',
      title: 'VamUnique & BDS Dance',
      subtitle: 'Stage Choreography & Flashmobs',
      category: 'Festivals',
      year: '2026',
      count: '52 Photos · Live Performing Arts',
      cover: '/assets/hub-photos/vamunique-02.webp'
    },
    {
      id: 'panache-fashion-2026',
      title: 'Panache Runway',
      subtitle: 'Annual Fashion & Design Showcase',
      category: 'Festivals',
      year: '2026',
      count: '44 Photos · Stage Runway',
      cover: '/assets/hub-photos/panache-01.webp'
    },
    {
      id: 'cicr-robotics-2026',
      title: 'CICR Robotics Arena',
      subtitle: 'Robotics Innovations & Hardware Showcase',
      category: 'Competitions',
      year: '2026',
      count: '56 Photos · Robotics Lab',
      cover: '/assets/hub-photos/cicr-01.webp'
    }
  ];

  const categories = ['All', 'Induction', 'Competitions', 'Festivals', 'Workshops', 'Sports', 'Social'];
  const years = ['All', '2026', '2025', '2024'];
  const COLLECTIONS = eventMemories;
  const MOMENTS = categories;
  const YEARS = years;
  const ARCHIVE_IA = ['COLLECTIONS', 'MOMENTS', 'YEARS', 'COMMUNITIES'];

  const rawGallery = Array.isArray(data?.gallery) ? data.gallery : [];
  useEffect(()=>{
    let active=true;
    if(!albumSlug){setAlbum(null);setAlbumItems([]);return()=>{active=false};}
    (async()=>{try{
      const {data:publishedAlbum,error}=await supabase.from('jyc_media_albums').select('id,slug,name,description,cover_url,is_published').eq('slug',albumSlug).eq('is_published',true).maybeSingle();
      if(error)throw error;if(!active)return;setAlbum(publishedAlbum||null);
      if(!publishedAlbum){setAlbumItems([]);return;}
      const {data:photos,error:photoError}=await supabase.from('jyc_gallery_items').select('id,public_url,caption,album_id,status,rights_status,created_at').eq('album_id',publishedAlbum.id).eq('status','approved').eq('rights_status','cleared');
      if(photoError)throw photoError;if(active)setAlbumItems((photos||[]).map(photo=>({...photo,url:photo.public_url,alt:photo.alt||photo.caption||'JYC archive photograph',year:photo.created_at?.slice(0,4),mediaKind:'photo'})).filter(photo=>photo.url));
    }catch{if(active){setAlbum(null);setAlbumItems([])}}})();
    return()=>{active=false};
  },[albumSlug]);
  const items = useMemo(() => {
    const gallerySource=albumSlug?(album?albumItems:[]):[...rawGallery,...JYC_SOURCE_ARCHIVE_PHOTO_ITEMS];
    const unique=[...new Map(gallerySource.filter(g=>g&&g.url&&(g.mediaKind==='photo'||!g.mediaKind)).map(g=>[String(g.url),g])).values()];
    return unique.map(g => ({
      ...g,
      category: /induction/i.test(g.caption||g.association||'') ? 'Induction'
        : /converge|fest|ebullience|ethnic/i.test(g.caption||g.association||'') ? 'Festivals'
        : /hack|hackathon|war|drone|jai|compete|code/i.test(g.caption||g.association||'') ? 'Competitions'
        : /workshop|session|class/i.test(g.caption||g.association||'') ? 'Workshops'
        : /sport|cricket|football/i.test(g.caption||g.association||'') ? 'Sports'
        : 'Festivals'
    }));
  }, [rawGallery,albumItems,albumSlug,album]);
  const COMMUNITIES = [...new Set(items.map(item => String(item.association || 'JYC ARCHIVE')).filter(Boolean))].sort();

  const filtered = useMemo(() => {
    return items.filter(g => {
      const hay = `${g.caption||''} ${g.association||''} ${g.year||''} ${g.category||''}`.toLowerCase();
      const matchesQuery = !query || hay.includes(query.toLowerCase());
      const matchesCategory = eventCategory === 'All' || g.category === eventCategory || hay.includes(eventCategory.toLowerCase());
      const matchesYear = year === 'All' || String(g.year||g.date||'').startsWith(year);
      const hayMedia=`${g.role||''} ${g.association||''} ${g.mediaKind||'photo'}`.toLowerCase();
      const isCommunity=/club|community|hub|society/i.test(hayMedia)||Object.keys(JYC_HUB_CONTENT).some(name=>hayMedia.includes(name.toLowerCase()));
      const matchesMedia=mediaFilter==='all'||(mediaFilter==='club'?isCommunity:mediaFilter==='event'?/event|fest|competition|sports|converge|ebullience|dron-o-war|hackathon/i.test(hayMedia):true);
      return matchesQuery && matchesCategory && matchesYear && matchesMedia;
    });
  }, [items, query, eventCategory, year, mediaFilter]);

  const selectedIndex = selected === null ? -1 : filtered.findIndex(g => g.url === selected.url);
  const openPhoto=photo=>{if(!photo)return;setSelected(photo);const next=new URLSearchParams(loc.search);next.set('photo',String(photo.id||photo.url));nav({pathname:albumSlug?albumPath(albumSlug):loc.pathname,search:'?'+next.toString()},{replace:true});};
  const closePhoto=()=>{setSelected(null);const next=new URLSearchParams(loc.search);next.delete('photo');nav({pathname:loc.pathname,search:next.toString()?'?'+next.toString():''},{replace:true});};
  const setFilter=filter=>{setMediaFilter(filter);setVisibleCount(36);};
  useEffect(()=>{const photoKey=params.get('photo');if(!photoKey)return;const match=items.find(photo=>String(photo.id||photo.url)===photoKey||photo.url===photoKey);if(match)setSelected(match);},[params,items]);
  const move = dir => {if(!filtered.length)return;const nextIdx=(selectedIndex+dir+filtered.length)%filtered.length;openPhoto(filtered[nextIdx]);};

  const sharePhoto = async () => {
    if (!selected) return;
    const url = window.location.origin + loc.pathname + (loc.search ? loc.search.replace(/([?&])photo=[^&]*/,'$1photo='+encodeURIComponent(selected.id||selected.url)) : '?photo='+encodeURIComponent(selected.id||selected.url));
    try {
      if (navigator.share) await navigator.share({ title: selected.caption || 'JYC Moment', url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closePhoto();
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowLeft') move(-1);
    };
    if (selected) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, selectedIndex, filtered, loc.pathname, loc.search]);

  return <section className="section page unified-public-page jyc-gallery-hub-container">
    <header className="jyc-gallery-hero">
      <span className="jh-kicker">JYC 128 <b>VISUAL VAULT</b></span>
      <h1>{album?album.name:'Captured Memories.'}</h1>
      <p>{album?(album.description||'A published JYC photo album, cleared for public viewing.'):albumSlug?'This album is not published or is unavailable.':'Explore official campus photography organized by flagship events, competitions, festivals and milestones across Sector 128.'}</p>
      {albumSlug&&<a className="jh-btn" href="/gallery">All gallery memories</a>}
    </header>

    <nav className="jyc57-archive-nav" aria-label="Gallery archive navigation">
      {ARCHIVE_IA.map(label => <a key={label} href={`#jyc-gallery-${label.toLowerCase()}`}>{label}</a>)}
    </nav>

    {/* Event Memories Section */}
    <section id="jyc-gallery-collections" className="jyc-memories-section" aria-label={`Collections: ${COLLECTIONS.length} curated albums`}>
      <div className="jyc-section-head-bar">
        <div>
          <h2>Event Memories & Flagships</h2>
          <span>Curated albums from the official JYC ecosystem</span>
        </div>
      </div>

      <div className="jyc-memories-grid">
        {eventMemories.map(mem => (
          <article 
            key={mem.id} 
            className="jyc-memory-card" 
            onClick={() => {
              setEventCategory(mem.category);
              setYear(mem.year);
              window.scrollTo({ top: 580, behavior: 'smooth' });
            }}
          >
            <div className="jyc-memory-cover">
              <ResponsivePhoto src={mem.cover} alt={mem.title} loading="lazy" sizes="(max-width: 600px) 100vw, 360px" fallbackSrc="/jyc-logo-official.webp" fallbackAlt="JYC Logo"/>
            </div>
            <div className="jyc-memory-scrim" />
            <div className="jyc-memory-details">
              <span className="jyc-memory-top-badge">{mem.category} · {mem.year}</span>
              <h3 className="jyc-memory-title">{mem.title}</h3>
              <span className="jyc-memory-count">{mem.count}</span>
              <span className="jyc-memory-action">View Gallery →</span>
            </div>
          </article>
        ))}
      </div>
    </section>

    {/* Filter Toolbar */}
    <div id="jyc-gallery-moments" className="jyc-filter-bar" aria-label={`Moments: ${MOMENTS.length} event categories`}>
      <div className="jyc-search-input-wrap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input className="jyc-search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search memories, events, years..." aria-label="Search gallery" />
        {query && <button type="button" onClick={() => setQuery('')} style={{position:'absolute',right:12,background:'none',border:0,color:'#888',cursor:'pointer',fontSize:16}}>×</button>}
      </div>
    </div>

    <div className="jyc57-media-filter" role="group" aria-label="Filter gallery by media type">
      <button type="button" className={`jyc-filter-pill ${mediaFilter==='all'?'is-active':''}`} aria-pressed={mediaFilter==='all'} onClick={()=>setFilter('all')}>All photos</button>
      <button type="button" className={`jyc-filter-pill ${mediaFilter==='club'?'is-active':''}`} aria-pressed={mediaFilter==='club'} onClick={()=>setFilter('club')}>Clubs & communities</button>
      <button type="button" className={`jyc-filter-pill ${mediaFilter==='event'?'is-active':''}`} aria-pressed={mediaFilter==='event'} onClick={()=>setFilter('event')}>Events</button>
    </div>
    {/* Category & Year Pills */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--tech-gold)', textTransform: 'uppercase', minWidth: 80 }}>Event:</span>
        {categories.map(cat => (
          <button 
            key={cat} 
            type="button" 
            className={`jyc-filter-pill ${eventCategory === cat ? 'is-active' : ''}`} 
            onClick={() => setEventCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div id="jyc-gallery-years" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }} aria-label={`Years: ${YEARS.length - 1} archive years`}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--tech-gold)', textTransform: 'uppercase', minWidth: 80 }}>Year:</span>
        {YEARS.map(y => (
          <button 
            key={y} 
            type="button" 
            className={`jyc-filter-pill ${year === y ? 'is-active' : ''}`} 
            onClick={() => setYear(y)}
          >
            {y}
          </button>
        ))}
        {(eventCategory !== 'All' || year !== 'All' || query) && (
          <button 
            type="button" 
            className="jyc-clear-filters-btn" 
            style={{ marginLeft: 'auto' }} 
            onClick={() => { setEventCategory('All'); setYear('All'); setQuery(''); }}
          >
            Reset Filters ↺
          </button>
        )}
      </div>
    </div>

    {/* Photo Grid */}
    {albumSlug&&!album ? <Empty eyebrow="GALLERY ALBUM" title="This album is not available." text="Only published albums with cleared photographs are available to the public."/> : filtered.length ? (
      <>
        <div id="jyc-gallery-communities" className="jyc57-masonry" aria-label={`Communities: ${COMMUNITIES.length} photo collections`}>
          {filtered.slice(0, visibleCount).map((g, i) => (
            <button 
              type="button" 
              key={g.id || g.url || i} 
              className={`jyc57-photo photo-${i % 6}`} 
              onClick={() => openPhoto(g)} 
              aria-label={'Open ' + (g.caption || 'JYC photograph')}
            >
              <ResponsivePhoto src={g.url} alt={g.alt || g.caption || 'JYC archive photograph'} loading={i < 4 ? 'eager' : 'lazy'} decoding="async" sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" fallbackSrc="/jyc-logo-official.webp" fallbackAlt="JYC Logo"/>
              <span>
                <small>{g.association || 'JYC ARCHIVE'}{g.year ? ' · ' + g.year : ''}</small>
                <strong>{g.caption || 'JYC moment'}</strong>
              </span>
            </button>
          ))}
        </div>

        {filtered.length > visibleCount && (
          <div className="jyc57-load-more">
            <span>Showing {visibleCount} of {filtered.length} photographs</span>
            <button type="button" className="jh-btn" onClick={() => setVisibleCount(n => n + 36)}>
              Load 36 More Photos ▾
            </button>
          </div>
        )}
      </>
    ) : (
      <Empty eyebrow="GALLERY ARCHIVE" title="No photographs found." text="Try selecting another event category, year, or clearing the search query." />
    )}

    {/* Full-Screen Lightbox Modal */}
    {selected && (
      <div className="jyc57-lightbox" role="dialog" aria-modal="true" aria-label={selected.caption || 'JYC photograph'} onClick={closePhoto}>
        <div className="jyc57-lightbox-inner" onClick={e => e.stopPropagation()} onTouchStart={e=>{touchStart.current=e.touches?.[0]?.clientX??null;}} onTouchEnd={e=>{const start=touchStart.current,end=e.changedTouches?.[0]?.clientX;touchStart.current=null;if(start==null||typeof end!=='number')return;const delta=end-start;if(Math.abs(delta)>48)move(delta<0?1:-1);}}>
          <button type="button" className="jyc57-close" onClick={() => setSelected(null)} aria-label="Close modal">×</button>
          <button className="jyc57-nav prev" type="button" onClick={() => move(-1)} aria-label="Previous photo">‹</button>
          <div className="jyc57-lightbox-media">
            <ResponsivePhoto src={selected.url} alt={selected.caption || 'JYC photo'} sizes="(max-width: 900px) 100vw, 75vw" loading="eager" style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease' }} fallbackSrc="/jyc-logo-official.webp" fallbackAlt="JYC Logo"/>
          </div>
          <button className="jyc57-nav next" type="button" onClick={() => move(1)} aria-label="Next photo">›</button>
          <div className="jyc57-lightbox-copy">
            <span className="eyebrow">{selected.association || 'JYC 128'}{selected.year ? ' · ' + selected.year : ''}</span>
            <h2>{selected.caption || 'JYC Campus Memory'}</h2>
            <p>{selected.story || selected.description || selected.alt || 'Official JYC visual archive item.'}</p>
            <span className="jyc57-counter">{selectedIndex + 1} / {filtered.length}</span>
            <div className="jyc57-lightbox-actions">
              <button type="button" onClick={() => setZoom(z => z > 1 ? 1 : 1.75)}>{zoom > 1 ? 'Reset Zoom' : 'Zoom In'}</button>
              <button type="button" onClick={sharePhoto}>{copied ? 'Link Copied ✓' : 'Share Photo'}</button>
              <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button type="button">Full Resolution ↗</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    )}
  </section>;
}
export function JYCBestOf({data}){
 const items=useMemo(()=>{
  const incoming=Array.isArray(data?.gallery)?data.gallery:[];
  const strict=[...incoming,...JYC_SOURCE_ARCHIVE_PHOTO_ITEMS]
   .filter(g=>g?.url&&(!g.mediaKind||g.mediaKind==='photo'))
   .map(g=>({...g,mediaKind:'photo'}));
  return rankJycPhotoItems([...new Map(strict.map(g=>[String(g.url),g])).values()],{limit:24});
 },[data?.gallery]);
 const groups=useMemo(()=>[
  ['People',items.filter(g=>/people|portrait|group|student|team/i.test(String(g.caption||g.alt||'')))],
  ['Performance',items.filter(g=>/stage|performance|audience|music|dance|theatre/i.test(String(g.caption||g.alt||'')))],
  ['Innovation',items.filter(g=>/innovation|workshop|technical|competition|hackathon/i.test(String(g.caption||g.alt||'')))],
  ['Campus',items.filter(g=>/campus|jiit|event|community/i.test(String(g.caption||g.alt||'')))],
  ['Celebrations',items.filter(g=>/fest|celebr|farewell|ethnic|converge|aakriti/i.test(String(g.caption||g.alt||'')))],
 ].map(([name,rows])=>[name,rows.slice(0,6)]).filter(([,rows])=>rows.length));
 return <section className="section page unified-public-page jyc57-page jyc-best-of-page">
  <header className="jyc57-archive-head"><div><span className="eyebrow">JYC · EDITORIAL SELECTION</span><h1>The Best of JYC.</h1><p>A photography-first selection of people, performance, innovation, campus life and celebrations from the maintained JYC visual archive.</p></div><div className="jyc57-gallery-meta"><span><b>{items.length}</b> selected frames</span><span>Source-backed only</span></div></header>
  {groups.map(([name,rows])=><section className="jyc57-featured" key={name} aria-labelledby={'best-'+name}><div className="jyc57-section-head"><div><span className="eyebrow">BEST OF JYC</span><h2 id={'best-'+name}>{name}</h2></div><span>{rows.length} frames</span></div><div className="jyc57-featured-grid">{rows.map((g,i)=><a className={'jyc57-feature-card feature-'+i%6} key={g.id||g.url} href={'/gallery?photo='+encodeURIComponent(g.id||g.url)} aria-label={`Open ${g.caption||'JYC photograph'} in the gallery`}><ResponsivePhoto src={g.url} alt={g.alt||g.caption||'JYC archive photograph'} loading={i<2?'eager':'lazy'} fetchPriority={i<2?'high':undefined} decoding="async" sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"/><span><small>{g.association||'JYC ARCHIVE'}{g.year?' · '+g.year:''}</small><strong>{g.caption||'JYC moment'}</strong></span></a>)}</div></section>)}
  {!groups.length&&<Empty eyebrow="BEST OF JYC" title="The selection is waiting." text="Published source photography will appear here as the archive grows."/>}
 </section>
}

export function JYC57Archive({data}){
 const nav=useNavigate();const events=publishedEvents(data);const years=[...new Set(events.map(e=>String(e.date||'').slice(0,4)).filter(Boolean))].sort((a,b)=>Number(b)-Number(a));
 const [year,setYear]=useState(years[0]||'all');const selected=year==='all'?events:events.filter(e=>String(e.date||'').startsWith(year));const photos=(data.gallery||[]).filter(g=>g?.url||g?.src).slice(0,6);
 return <section className="section page unified-public-page jyc57-page">
  <header className="jyc57-archive-head"><div><span className="eyebrow">JYC · 04 / HISTORY</span><h1>What happened stays.</h1><p>The public archive connects years, events and photographs so JYC feels like a living organisation rather than a list of current pages.</p></div><div className="jyc57-year-switch">{['all',...years].map(y=><button type="button" key={y} className={year===y?'active':''} onClick={()=>setYear(y)}>{y==='all'?'All':y}</button>)}</div></header>
  <div className="jyc57-archive-grid"><div><div className="jyc57-list-head"><span>{selected.length} archived/published events</span><small>Year: {year==='all'?'All':year}</small></div>{selected.sort((a,b)=>safeDate(b)-safeDate(a)).map(e=><button type="button" className="jyc57-archive-row" key={e.id||e.title} onClick={()=>nav(eventPath(e))}><span>{e.date||'TBA'}</span><div><strong>{e.title}</strong><small>{e.club||'JYC'} · {e.venue||'JIIT Sector 128'}</small></div><b>↗</b></button>)}{!selected.length&&<Empty eyebrow="ARCHIVE" title="No records for this year." text="Published records will appear here when available."/>}</div><aside className="jyc57-archive-story"><span className="eyebrow">VISUAL MEMORY</span><h2>People. Places. Participation.</h2><div className="jyc57-story-grid">{photos.map((g,i)=><ResponsivePhoto key={g.id||i} src={g.url||g.src} alt={g.caption||'JYC archive'} loading="lazy" sizes="(max-width: 700px) 50vw, 20vw"/>)}</div><button type="button" className="jyc57-text-link" onClick={()=>nav('/gallery')}>Open the full gallery →</button></aside></div>
 </section>
}
