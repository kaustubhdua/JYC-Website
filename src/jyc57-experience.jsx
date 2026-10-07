import React,{useEffect,useMemo,useRef,useState} from 'react';
import {useLocation,useNavigate} from 'react-router-dom';
import {supabase} from './lib/supabase';
import {JYC_SOURCE_ARCHIVE_PHOTO_ITEMS,JYC_SOURCE_ARCHIVE_ALBUMS,rankJycPhotoItems} from './jyc-source-media.js';

const safeDate=(e)=>{const t=Date.parse(`${e?.date||''}T${e?.start||'00:00'}`);return Number.isFinite(t)?t:Infinity};
const stateOf=(e)=>{const start=safeDate(e),end=Date.parse(`${e?.dateEnd||e?.date||''}T${e?.end||'23:59'}`),now=Date.now();if(!Number.isFinite(start)||!e?.date)return 'draft';if(now<start)return 'upcoming';if(Number.isFinite(end)&&now<=end)return 'live';return 'past'};
const publishedEvents=(data)=>Array.isArray(data?.events)?data.events.filter(e=>e?.published&&e?.archived!==true):[];
const publishedClubs=(data)=>Array.isArray(data?.clubs)?data.clubs.filter(c=>c?.published&&c?.status!=='archived'):[];
const eventPath=(e)=>`/events/${encodeURIComponent(String(e?.slug||slugify(e?.title)||e?.id||''))}`;
const slugify=(value)=>String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const syncFilters=(nav,loc,values)=>{const p=new URLSearchParams(loc.search);Object.entries(values).forEach(([k,v])=>{const value=String(v??'').trim();if(!value||value==='All'||(k==='status'&&value==='upcoming'))p.delete(k);else p.set(k,value)});const search=p.toString();nav({pathname:loc.pathname,search:search?'?'+search:''},{replace:true});};

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
   {featured&&<button className="jyc57-feature" onClick={()=>nav(eventPath(featured))}>{featured.poster?<img src={featured.poster} alt="" loading="eager"/>:<div className="jyc57-feature-fallback">JYC</div>}<div><MetaPill tone={stateOf(featured)==='live'?'live':''}>{stateOf(featured)==='live'?'LIVE NOW':'UP NEXT'}</MetaPill><strong>{featured.title}</strong><small>{featured.club||'JYC'} · {featured.venue||'JIIT Sector 128'}</small><span>Open event ↗</span></div></button>}
  </header>
  <div className="jyc57-event-toolbar" aria-label="Event filters">
   <label className="jyc57-search"><span aria-hidden="true">⌕</span><input value={query} onChange={e=>{const v=e.target.value;setQuery(v);syncFilters(nav,loc,{q:v,category,status:scope})}} placeholder="Search events, clubs or topics" aria-label="Search events"/></label>
   <div className="jyc57-segment">{[['upcoming','Upcoming'],['live','Live'],['past','Past'],['all','All']].map(([id,label])=><button key={id} className={scope===id?'active':''} onClick={()=>{setScope(id);syncFilters(nav,loc,{q:query,category,status:id})}}>{label}</button>)}</div>
  </div>
  <div className="jyc57-category-row" aria-label="Event categories">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>{setCategory(c);syncFilters(nav,loc,{q:query,category:c,status:scope})}}>{c}</button>)}</div>
  <div className="jyc57-event-layout">
   <div className="jyc57-event-list">
    <div className="jyc57-list-head"><span>{filtered.length} published {filtered.length===1?'event':'events'}</span><small>Sector 128 only</small></div>
    {filtered.length?filtered.map((e,i)=><button className="jyc57-event-card" key={e.id||e.title||i} onClick={()=>nav(eventPath(e))}>
      <div className="jyc57-event-date"><b>{e.date?new Date(`${e.date}T12:00`).toLocaleDateString('en-IN',{day:'2-digit'}):'—'}</b><span>{e.date?new Date(`${e.date}T12:00`).toLocaleDateString('en-IN',{month:'short'}):'TBA'}</span></div>
      <div className="jyc57-event-copy"><div><MetaPill tone={stateOf(e)==='live'?'live':''}>{stateOf(e)==='live'?'LIVE':stateOf(e)==='past'?'ARCHIVED':'UPCOMING'}</MetaPill>{(e.eventType||e.category)&&<MetaPill>{e.eventType||e.category}</MetaPill>}</div><h2>{e.title}</h2><p>{e.description||'Open the event for registration, schedule, venue and published details.'}</p><small>{e.club||'JYC'} · {e.venue||'JIIT Sector 128'}</small></div>
      <span className="jyc57-arrow" aria-hidden="true">↗</span>
    </button>):<Empty eyebrow="EVENT DIRECTORY" title="Nothing matches this view." text="Try another category, status, or search term. Only published Sector-128 events are shown."/>}
   </div>
   <aside className="jyc57-next"><span className="eyebrow">02 / WHAT'S NEXT</span><h2>Near-term rhythm.</h2>{upcoming.map(e=><button key={e.id||e.title} onClick={()=>nav(eventPath(e))}><span>{e.date||'TBA'}</span><strong>{e.title}</strong><small>{e.start||'Time TBA'} · {e.venue||'Venue TBA'}</small></button>)}{!upcoming.length&&<p>No upcoming published events yet.</p>}<button className="jyc57-text-link" onClick={()=>setScope('past')}>Browse the archive →</button></aside>
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
 const nav=useNavigate(),loc=useLocation();
 const params=useMemo(()=>new URLSearchParams(loc.search),[loc.search]);
 const pathAlbum=loc.pathname.startsWith('/gallery/')?decodeURIComponent(loc.pathname.split('/').filter(Boolean)[1]||''):'';
 const [query,setQuery]=useState(params.get('q')||''),[association,setAssociation]=useState(params.get('club')||'All'),[year,setYear]=useState(params.get('year')||'All'),[album,setAlbum]=useState(pathAlbum||params.get('album')||'All');
 const [albums,setAlbums]=useState(JYC_SOURCE_ARCHIVE_ALBUMS),[imageManifest,setImageManifest]=useState({});
 const [selected,setSelected]=useState(null),[visibleCount,setVisibleCount]=useState(36),[zoom,setZoom]=useState(1),[copied,setCopied]=useState(false);
 const dialogRef=useRef(null),triggerRef=useRef(null),touchStart=useRef(null),lastTap=useRef(0);
 useEffect(()=>{let alive=true;fetch('/image-manifest.json',{cache:'force-cache'}).then(r=>r.ok?r.json():null).then(payload=>{if(alive&&payload?.images)setImageManifest(payload.images)}).catch(()=>{});return()=>{alive=false}},[]);
 useEffect(()=>{let alive=true;supabase.from('jyc_media_albums').select('id,name,slug,cover_url,hero_url,narrative,description,scope_type,club_id,event_id').eq('is_published',true).order('created_at',{ascending:false}).then(({data:rows})=>{if(alive)setAlbums([...JYC_SOURCE_ARCHIVE_ALBUMS,...(rows||[])].reduce((acc,row)=>{if(!acc.some(x=>x.slug===row.slug))acc.push(row);return acc},[]))});return()=>{alive=false}},[]);
 const albumMatches=(g)=>{if(album==='All')return true;const key=String(g.albumId||g.album_id||'');const selectedAlbum=albums.find(a=>String(a.id)===String(album)||String(a.slug)===String(album));return key===String(selectedAlbum?.id||album)||String(g.album||g.albumSlug||'')===String(album)};
 const items=useMemo(()=>{
   const incoming=Array.isArray(data?.gallery)?data.gallery:[];
   const strict=[...incoming,...JYC_SOURCE_ARCHIVE_PHOTO_ITEMS].filter(g=>g?.url&&(!g.mediaKind||g.mediaKind==='photo')).filter(g=>g.mediaKind!=='identity'&&g.mediaKind!=='utility').map(g=>({...g,mediaKind:'photo'}));
   return [...new Map(strict.map(g=>[String(g.url),g])).values()];
 },[data?.gallery]);
 const associations=useMemo(()=>['All',...new Set(items.map(g=>String(g.association||'JYC Archive')).filter(Boolean))].sort((a,b)=>a==='All'?-1:b==='All'?1:a.localeCompare(b)),[items]);
 const years=useMemo(()=>['All',...new Set(items.map(g=>String(g.year||g.date||'').slice(0,4)).filter(Boolean))].sort((a,b)=>a==='All'?-1:b==='All'?1:Number(b)-Number(a)),[items]);
 const filtered=useMemo(()=>items.filter(g=>{
   const hay=(g.caption||'')+' '+(g.alt||'')+' '+(g.association||'')+' '+(g.collection||'')+' '+(g.year||'');
   return (!query||hay.toLowerCase().includes(query.toLowerCase()))&&(association==='All'||String(g.association||'')===association)&&(year==='All'||String(g.year||g.date||'').startsWith(year))&&albumMatches(g);
 }),[items,query,association,year,album,albums]);
 const activeAlbum=useMemo(()=>albums.find(a=>String(a.id)===String(album)||String(a.slug)===String(album)),[albums,album]);
 const relatedAlbums=useMemo(()=>{if(!activeAlbum)return [];return albums.filter(a=>String(a.id)!==String(activeAlbum.id)&&((activeAlbum.club_id&&String(a.club_id)===String(activeAlbum.club_id))||(activeAlbum.event_id&&String(a.event_id)===String(activeAlbum.event_id))||String(a.scope_type)===String(activeAlbum.scope_type))).slice(0,4)},[albums,activeAlbum]);
 const featured=useMemo(()=>rankJycPhotoItems(filtered,{limit:6}),[filtered]);
 const featuredKeys=useMemo(()=>new Set(featured.map(g=>String(g.url))),[featured]);
 const archiveItems=useMemo(()=>filtered.filter(g=>!featuredKeys.has(String(g.url))),[filtered,featuredKeys]);
 const visible=archiveItems.slice(0,visibleCount);
 const selectedIndex=selected===null?-1:filtered.findIndex(g=>String(g.url)===String(selected?.url));
 const active=selectedIndex>=0?filtered[selectedIndex]:null;
 const setFilter=(key,value)=>{
   if(key==='album'){setAlbum(value);setSelected(null);setVisibleCount(36);if(value==='All')nav('/gallery');else nav('/gallery/'+encodeURIComponent(value));return}
   const next={q:query,club:association,year,album:album==='All'?'':album};next[key]=value;
   syncFilters(nav,loc,next);
   if(key==='q')setQuery(value);if(key==='club')setAssociation(value);if(key==='year')setYear(value);
   setSelected(null);setVisibleCount(36);
 };
 useEffect(()=>{setQuery(params.get('q')||'');setAssociation(params.get('club')||'All');setYear(params.get('year')||'All');if(!pathAlbum)setAlbum(params.get('album')||'All')},[params,pathAlbum]);
 useEffect(()=>{const key=params.get('photo');if(!key||!filtered.length)return;const match=filtered.find(g=>String(g.id)===String(key)||String(g.url)===decodeURIComponent(key));if(match)setSelected(match)},[params,filtered]);
 useEffect(()=>{
   if(!active)return;
   triggerRef.current=document.activeElement;setZoom(1);setCopied(false);
   const onKey=e=>{
     if(e.key==='Escape'){e.preventDefault();setSelected(null);return}
     if(e.key==='ArrowRight'){e.preventDefault();setSelected(filtered[(selectedIndex+1)%filtered.length]);return}
     if(e.key==='ArrowLeft'){e.preventDefault();setSelected(filtered[(selectedIndex-1+filtered.length)%filtered.length]);return}
     if(e.key==='+'||e.key==='='){e.preventDefault();setZoom(z=>Math.min(3,+(z+.25).toFixed(2)));return}
     if(e.key==='-'){e.preventDefault();setZoom(z=>Math.max(1,+(z-.25).toFixed(2)));return}
     if(e.key!=='Tab')return;
     const root=dialogRef.current;if(!root)return;const nodes=[...root.querySelectorAll('button,a[href],[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&x.offsetParent!==null);
     if(nodes.length){const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};
   window.addEventListener('keydown',onKey);const previous=document.body.style.overflow;document.body.style.overflow='hidden';requestAnimationFrame(()=>dialogRef.current?.querySelector('button')?.focus());
   return()=>{window.removeEventListener('keydown',onKey);document.body.style.overflow=previous;triggerRef.current?.focus?.()};
 },[active,filtered,selectedIndex]);
 const close=()=>setSelected(null);
 const move=dir=>{if(!filtered.length)return;setSelected(filtered[(selectedIndex+dir+filtered.length)%filtered.length])};
 const share=async()=>{
   if(!active)return;const url=window.location.origin+'/gallery?photo='+encodeURIComponent(active.id||active.url);
   try{if(navigator.share)await navigator.share({title:active.caption||'JYC photograph',text:active.alt||active.caption||'JYC visual archive',url});else{await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1800)}}catch{}
 };
 const download=()=>{if(!active)return;const a=document.createElement('a');a.href=active.url;a.download='jyc-'+String(active.association||'archive').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-photo.webp';a.target='_blank';a.rel='noopener';a.click()};
 const onTouchStart=e=>{touchStart.current={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY,t:Date.now()}};
 const onTouchEnd=e=>{if(!touchStart.current)return;const s=touchStart.current,dx=e.changedTouches[0].clientX-s.x,dy=e.changedTouches[0].clientY-s.y,dt=Date.now()-s.t;touchStart.current=null;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)&&dt<650){move(dx<0?1:-1);return}if(Math.abs(dx)<10&&Math.abs(dy)<10&&dt<280){const now=Date.now();if(now-lastTap.current<320)setZoom(z=>z>1?1:2);lastTap.current=now}};
 return <section className="section page unified-public-page jyc57-page jyc57-gallery-page">
  <header className="jyc57-archive-head"><div><span className="eyebrow">JYC · VISUAL ARCHIVE{activeAlbum?' · ALBUM':''}</span><h1>{activeAlbum?.name||'Keep the moments.'}</h1><p>{activeAlbum?.narrative||activeAlbum?.description||(activeAlbum?'A published JYC album preserved as a permanent visual collection.':'A photography-first institutional record built from published JYC media. Design assets and identity material stay preserved without being misrepresented as photography.')}</p>{activeAlbum?.hero_url&&<img className="jyc57-album-hero" src={activeAlbum.hero_url} alt="" loading="eager" decoding="async"/>}</div><label className="jyc57-search"><span>⌕</span><input value={query} onChange={e=>setFilter('q',e.target.value)} placeholder="Search photographs, clubs, events…" aria-label="Search photographs"/></label></header>
  <div className="jyc57-album-context">{activeAlbum&&<span>Album record · {activeAlbum.scope_type||'JYC'}{activeAlbum.club_id?' · club-linked':''}{activeAlbum.event_id?' · event-linked':''}</span>}{relatedAlbums.length>0&&<div className="jyc57-related-albums" aria-label="Related albums">{relatedAlbums.map(a=><button key={a.id} type="button" onClick={()=>setFilter('album',a.slug)}>{a.name}</button>)}</div>}</div>
  <div className="jyc57-gallery-meta"><span><b>{filtered.length}</b> photographs</span><span>{associations.length-1} collections</span><span>{years.length-1} years</span><span>Swipe, zoom & keyboard ready</span></div>
  <div className="jyc57-filterbar" aria-label="Archive filters"><div className="jyc57-filter-group"><span>Album</span><div><button type="button" className={album==='All'?'active':''} onClick={()=>setFilter('album','All')}>All albums</button>{albums.slice(0,12).map(a=><button type="button" key={a.id} className={album===a.slug||album===a.id?'active':''} onClick={()=>setFilter('album',a.slug)}>{a.name}</button>)}</div></div><div className="jyc57-filter-group"><span>Collection</span><div>{associations.slice(0,18).map(x=><button type="button" key={x} className={association===x?'active':''} onClick={()=>setFilter('club',x)}>{x}</button>)}</div></div><div className="jyc57-filter-group"><span>Year</span><div>{years.map(x=><button type="button" key={x} className={year===x?'active':''} onClick={()=>setFilter('year',x)}>{x}</button>)}</div></div></div>
  {featured.length>0&&<section className="jyc57-featured" aria-labelledby="jyc57-featured-title"><div className="jyc57-section-head"><div><span className="eyebrow">EDITORIAL SELECTION</span><h2 id="jyc57-featured-title">A few frames worth stopping for.</h2></div><span>{Math.min(featured.length,6)} featured from the current result</span></div><div className="jyc57-featured-grid">{featured.map((g,i)=><button type="button" key={g.id||g.url} className={'jyc57-feature-card feature-'+i} onClick={()=>setSelected(g)} aria-label={'Open '+(g.caption||'JYC photograph')}><img src={g.url} alt={g.alt||g.caption||'JYC archive photograph'} loading={i<2?'eager':'lazy'} fetchPriority={i<2?'high':undefined} decoding="async" width={imageManifest[g.url]?.width} height={imageManifest[g.url]?.height} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 42vw"/><span><small>{g.association||'JYC ARCHIVE'}{g.year?' · '+g.year:''}</small><strong>{g.caption||'JYC moment'}</strong></span></button>)}</div></section>}
  {filtered.length?<><div className="jyc57-masonry" aria-label="JYC photograph collection">{visible.map((g,i)=><button type="button" key={g.id||g.url||i} className={'jyc57-photo photo-'+i%6} onClick={()=>setSelected(g)} aria-label={'Open '+(g.caption||'JYC photograph')}><img src={g.url} alt={g.alt||g.caption||'JYC archive photograph'} loading={i<2?'eager':'lazy'} decoding="async" width={imageManifest[g.url]?.width} height={imageManifest[g.url]?.height} sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw"/><span><small>{g.association||g.collection||'JYC'}</small><strong>{g.caption||'JYC moment'}</strong></span></button>)}</div>{archiveItems.length>visibleCount&&<div className="jyc57-load-more"><span>Showing {visible.length} archive frames · {featured.length} featured above</span><button type="button" className="btn secondary" onClick={()=>setVisibleCount(n=>Math.min(n+36,archiveItems.length))}>Load 36 more</button></div>}</>:<Empty eyebrow="VISUAL ARCHIVE" title="The archive is waiting." text="No published photography matches this search yet."/>}
  {active&&<div ref={dialogRef} className="jyc57-lightbox" role="dialog" aria-modal="true" aria-label={active.caption||'JYC photograph'} onClick={close} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}><div className="jyc57-lightbox-inner" onClick={e=>e.stopPropagation()}><button className="jyc57-close" onClick={close} aria-label="Close photograph">×</button><button className="jyc57-nav prev" type="button" onClick={()=>move(-1)} aria-label="Previous photograph">‹</button><div className="jyc57-lightbox-media"><img width={imageManifest[active.url]?.width} height={imageManifest[active.url]?.height} src={active.url} alt={active.alt||active.caption||'JYC photograph'} style={{transform:'scale('+zoom+')'}} draggable="false"/></div><button className="jyc57-nav next" type="button" onClick={()=>move(1)} aria-label="Next photograph">›</button><div className="jyc57-lightbox-copy"><span className="eyebrow">{active.association||'JYC'}</span><h2>{active.caption||'JYC moment'}</h2><p>{active.story||active.description||active.alt||'Published JYC photography.'}</p><small>{active.sourceLabel||active.source||'JYC public archive'}{active.credit?' · '+active.credit:''}</small><span className="jyc57-counter">{selectedIndex+1} / {filtered.length}</span><div className="jyc57-lightbox-actions"><button type="button" onClick={()=>setZoom(z=>z>1?1:2)}>{zoom>1?'Reset zoom':'Zoom'}</button><button type="button" onClick={share}>{copied?'Link copied':'Share photograph'}</button><button type="button" onClick={download}>Open / download</button>{active.eventId&&<button type="button" onClick={()=>nav(`/events/${encodeURIComponent(String(active.eventSlug||active.eventId||''))}`)}>Open event ↗</button>}{active.association&&<button type="button" onClick={()=>nav('/clubs/'+encodeURIComponent(active.association))}>Open community ↗</button>}</div></div></div></div>}
 </section>
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
  {groups.map(([name,rows])=><section className="jyc57-featured" key={name} aria-labelledby={'best-'+name}><div className="jyc57-section-head"><div><span className="eyebrow">BEST OF JYC</span><h2 id={'best-'+name}>{name}</h2></div><span>{rows.length} frames</span></div><div className="jyc57-featured-grid">{rows.map((g,i)=><figure className={'jyc57-feature-card feature-'+i%6} key={g.id||g.url}><img src={g.url} alt={g.alt||g.caption||'JYC archive photograph'} loading={i<2?'eager':'lazy'} decoding="async"/><figcaption><small>{g.association||'JYC ARCHIVE'}{g.year?' · '+g.year:''}</small><strong>{g.caption||'JYC moment'}</strong></figcaption></figure>)}</div></section>)}
  {!groups.length&&<Empty eyebrow="BEST OF JYC" title="The selection is waiting." text="Published source photography will appear here as the archive grows."/>}
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
