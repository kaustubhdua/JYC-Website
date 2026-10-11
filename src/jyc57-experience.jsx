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
const slugify=(value)=>String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const syncFilters=(nav,loc,values)=>{const p=new URLSearchParams(loc.search);Object.entries(values).forEach(([k,v])=>{const value=String(v??'').trim();if(!value||value==='All'||(k==='status'&&value==='upcoming'))p.delete(k);else p.set(k,value)});const search=p.toString();nav({pathname:loc.pathname,search:search?'?'+search:''},{replace:true});};

const LOGO_FALLBACK=import.meta.env.PROD?'/assets/jyc-logo.webp':'/JYC%20Logo(4).png';
const identityPalette=['#bf9c6f','#81927a','#b8785b','#8297ad','#a294b5','#a98c62'];
const identityAccent=value=>{let hash=0;for(const ch of String(value||'JYC'))hash=(hash*31+ch.charCodeAt(0))>>>0;return identityPalette[hash%identityPalette.length]};
const eventCardPhoto=event=>event?.poster||event?.banner||sourceEventMedia(event)?.photoItems?.find(item=>item?.url)?.url||'';
const clubCardPhoto=club=>{const source=sourceHubMedia(club);return club?.hubPhotos?.[0]||source?.photos?.[0]||source?.photoItems?.find(item=>item?.url)?.url||(club?.banner&&club.banner!==club.logo?club.banner:'')||''};
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
      <div className="jyc57-event-copy"><div><MetaPill tone={stateOf(e)==='live'?'live':''}>{stateOf(e)==='live'?'LIVE':stateOf(e)==='past'?'ARCHIVED':'UPCOMING'}</MetaPill>{(e.eventType||e.category)&&<MetaPill>{e.eventType||e.category}</MetaPill>}</div><h2>{e.title}</h2><p>{e.description||'Open the event for registration, schedule, venue and published details.'}</p><small>{e.club||'JYC'} · {e.venue||'JIIT Sector 128'}</small></div>
      <span className="jyc57-arrow" aria-hidden="true">↗</span>
    </button>}):<Empty eyebrow="EVENT DIRECTORY" title="Nothing matches this view." text="Try another category, status, or search term. Only published Sector-128 events are shown."/>}
   </div>
   <aside className="jyc57-next"><span className="eyebrow">02 / WHAT'S NEXT</span><h2>Near-term rhythm.</h2>{upcoming.map(e=><button type="button" key={e.id||e.title} onClick={()=>nav(eventPath(e))}><span>{e.date||'TBA'}</span><strong>{e.title}</strong><small>{e.start||'Time TBA'} · {e.venue||'Venue TBA'}</small></button>)}{!upcoming.length&&<p>No upcoming published events yet.</p>}<button type="button" className="jyc57-text-link" onClick={()=>setScope('past')}>Browse the archive →</button></aside>
  </div>
 </section>
}

export function JYC57Clubs({data}){
 const nav=useNavigate();const [query,setQuery]=useState(''),[family,setFamily]=useState('All'),[active,setActive]=useState(null);
 const clubs=publishedClubs(data);const families=['All',...new Set(clubs.map(c=>c.type||c.category||'').filter(Boolean))];
 const filtered=clubs.filter(c=>{const hay=`${c.name} ${c.category} ${c.description} ${(c.interests||[]).join(' ')}`.toLowerCase();return (!query||hay.includes(query.toLowerCase()))&&(family==='All'||(c.type||c.category)===family)});
 return <section className="section page unified-public-page jyc57-page">
  <header className="jyc57-hero jyc57-club-hero"><div><span className="eyebrow">JYC · 02 / FIND YOUR SPACE</span><h1>Communities, not just cards.</h1><p>Explore the published JYC community index by family, interest and identity. Open a club to see its people, activities, events and official links.</p></div><div className="jyc57-club-count"><b>{clubs.length}</b><span>published communities</span></div></header>
  <div className="jyc57-event-toolbar"><label className="jyc57-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a club or interest" aria-label="Search clubs"/></label><div className="jyc57-segment">{families.map(f=><button type="button" key={f} style={{minWidth:40,minHeight:44}} className={family===f?'active':''} onClick={()=>setFamily(f)}>{f}</button>)}</div></div>
  <div className="jyc57-club-wall">{filtered.map((c,i)=>{const selected=active===i;const photo=clubCardPhoto(c);return <button type="button" key={c.id||c.name||i} className={`jyc57-club-card ${selected?'selected':''}`} style={{'--club-accent':identityAccent(c.name)}} onPointerMove={magneticMove} onPointerLeave={magneticReset} onMouseEnter={()=>setActive(i)} onFocus={()=>setActive(i)} onClick={()=>nav('/clubs/'+encodeURIComponent(slugify(c.name)))}>{photo?<ResponsivePhoto src={photo} alt="" loading="lazy" decoding="async" sizes="(max-width: 760px) 50vw, (max-width: 1100px) 50vw, 33vw" fallbackSrc={c.logo||LOGO_FALLBACK} fallbackAlt=""/>:<div className="jyc57-club-fallback"><span aria-hidden="true">{String(c.name||'JYC').slice(0,2).toUpperCase()}</span>{c.logo&&<ResponsivePhoto className="jyc57-club-fallback-logo" src={c.logo} alt={`${c.name||'JYC'} logo`} width={160} height={160} loading="lazy" decoding="async" sizes="160px"/>}</div>}<span className="jyc57-club-shade"/><div className="jyc57-club-content"><MetaPill>{c.type||c.category||'JYC'}</MetaPill><h2>{c.name}</h2><p>{c.description||c.about||'A published JYC community.'}</p><span>Explore community ↗</span></div></button>})}</div>
  {!filtered.length&&<Empty eyebrow="COMMUNITY DIRECTORY" title="No community found." text="Try a broader search or another family."/>}
 </section>
}

export function JYC57Gallery({data}){
 const nav=useNavigate(),loc=useLocation();
 const params=useMemo(()=>new URLSearchParams(loc.search),[loc.search]);
 const pathAlbum=loc.pathname.startsWith('/gallery/')?decodeURIComponent(loc.pathname.split('/').filter(Boolean)[1]||''):'';
 const [query,setQuery]=useState(params.get('q')||''),[association,setAssociation]=useState(params.get('club')||'All'),[year,setYear]=useState(params.get('year')||'All'),[album,setAlbum]=useState(pathAlbum||params.get('album')||'All');
 const [albums,setAlbums]=useState(JYC_SOURCE_ARCHIVE_ALBUMS),[imageManifest,setImageManifest]=useState({});
 const [selected,setSelected]=useState(null),[visibleCount,setVisibleCount]=useState(36),[zoom,setZoom]=useState(1),[copied,setCopied]=useState(false),[storyIndex,setStoryIndex]=useState(0);
 const dialogRef=useRef(null),triggerRef=useRef(null),touchStart=useRef(null),lastTap=useRef(0),shouldReduceMotion=useReducedMotion();
 useEffect(()=>{let alive=true;loadJycImageManifest().then(payload=>{if(alive&&payload?.images)setImageManifest(payload.images)});return()=>{alive=false}},[]);
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
 const featured=useMemo(()=>rankJycPhotoItems(filtered,{limit:9}),[filtered]);
 const featuredKeys=useMemo(()=>new Set(featured.map(g=>String(g.url))),[featured]);
 const archiveItems=useMemo(()=>filtered.filter(g=>!featuredKeys.has(String(g.url))),[filtered,featuredKeys]);
 const visible=archiveItems.slice(0,visibleCount);
 const storyItems=useMemo(()=>featured.slice(0,9),[featured]);
 const activeStory=storyItems[storyIndex]||storyItems[0]||null;
 const focal=g=>g?.focalX!=null&&g?.focalY!=null?String(g.focalX)+'% '+String(g.focalY)+'%':undefined;
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
 useEffect(()=>{
   const key=params.get('photo');
   if(!key||!items.length)return;
   // Resolve against the complete archive, not the currently filtered subset:
   // shared links must work even when the photo belongs to another collection/year.
   const candidates=[key];
   try{const decoded=decodeURIComponent(key);if(decoded!==key)candidates.push(decoded)}catch{};
   const match=items.find(g=>{
     const ids=[g.id,g.photoId,g.photo_id].filter(v=>v!==undefined&&v!==null).map(String);
     const urls=[g.url,g.src,g.image,g.imageUrl].filter(Boolean).map(String);
     return candidates.some(candidate=>ids.includes(candidate)||urls.includes(candidate));
   });
   if(match){
     setQuery('');setAssociation('All');setYear('All');setAlbum('All');
     setSelected(match);
   }
 },[params,items]);
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
 return <section className="section page unified-public-page jyc57-page jyc57-gallery-page" data-motion={shouldReduceMotion?'reduced':'full'}>
  <header className="jyc57-archive-head"><div><span className="eyebrow">JYC · VISUAL ARCHIVE{activeAlbum?' · ALBUM':''}</span><h1>{activeAlbum?.name||'Keep the moments.'}</h1><p>{activeAlbum?.narrative||activeAlbum?.description||(activeAlbum?'A published JYC album preserved as a permanent visual collection.':'A photography-first institutional record built from published JYC media. Design assets and identity material stay preserved without being misrepresented as photography.')}</p>{activeAlbum?.hero_url&&<ResponsivePhoto className="jyc57-album-hero" src={activeAlbum.hero_url} alt="" width={imageManifest[activeAlbum.hero_url]?.width||1200} height={imageManifest[activeAlbum.hero_url]?.height||600} sizes="(max-width: 700px) 100vw, 980px" loading="eager" decoding="async"/>}</div><label className="jyc57-search"><span>⌕</span><input value={query} onChange={e=>setFilter('q',e.target.value)} placeholder="Search photographs, clubs, events…" aria-label="Search photographs"/></label></header>
  <div className="jyc57-album-context">{activeAlbum&&<span>Album record · {activeAlbum.scope_type||'JYC'}{activeAlbum.club_id?' · club-linked':''}{activeAlbum.event_id?' · event-linked':''}</span>}{relatedAlbums.length>0&&<div className="jyc57-related-albums" aria-label="Related albums">{relatedAlbums.map(a=><button key={a.id} type="button" onClick={()=>setFilter('album',a.slug)}>{a.name}</button>)}</div>}</div>
  <nav className="jyc57-archive-nav" aria-label="Visual archive views"><a href="#photo-story">MOMENTS</a><button type="button" onClick={()=>setFilter('album','All')}>COLLECTIONS</button><button type="button" onClick={()=>setFilter('year',years.find(x=>x!=='All')||'All')}>YEARS</button><button type="button" onClick={()=>setFilter('club',associations.find(x=>x!=='All')||'All')}>COMMUNITIES</button></nav>
  {albums.length>0&&<section className="jyc57-collection-rail" aria-label="Collections"><div className="jyc57-section-head"><div><span className="eyebrow">COLLECTIONS</span><h2>Browse the archive as stories.</h2></div><span>{albums.length} collections · Swipe or scroll to explore</span></div><div className="jyc57-collection-scroller">{albums.slice(0,10).map(a=><button type="button" key={a.id} className={String(album)===String(a.slug)?'active':''} onClick={()=>setFilter('album',a.slug)}><span className="jyc57-collection-cover">{a.cover_url?<ResponsivePhoto src={a.cover_url} alt="" width={imageManifest[a.cover_url]?.width||640} height={imageManifest[a.cover_url]?.height||480} sizes="220px" loading="lazy"/>:<span aria-hidden="true">JYC</span>}</span><strong>{a.name}</strong><small>{a.scope_type||'JYC'} collection</small></button>)}</div></section>}
  {storyItems.length>=5&&<AccordionGallery items={storyItems.slice(0,5)} defaultIndex={Math.min(2,storyItems.length-1)} onSelect={setSelected} trigger="click" grayscale height={390} gap={10} radius={18} expandRatio={0.5}/>}
  <div className="jyc57-gallery-meta"><span><b>{filtered.length}</b> photographs</span><span>{associations.length-1} collections</span><span>{years.length-1} years</span><span>Swipe, zoom & keyboard ready</span></div>
  <div className="jyc57-filterbar" aria-label="Archive filters"><div className="jyc57-filter-group"><span>Album</span><div><button type="button" className={album==='All'?'active':''} onClick={()=>setFilter('album','All')}>All albums</button>{albums.slice(0,12).map(a=><button type="button" key={a.id} className={album===a.slug||album===a.id?'active':''} onClick={()=>setFilter('album',a.slug)}>{a.name}</button>)}</div></div><div className="jyc57-filter-group"><span>Collection</span><div>{associations.slice(0,18).map(x=><button type="button" key={x} className={association===x?'active':''} onClick={()=>setFilter('club',x)}>{x}</button>)}</div></div><div className="jyc57-filter-group"><span>Year</span><div>{years.map(x=><button type="button" key={x} className={year===x?'active':''} onClick={()=>setFilter('year',x)}>{x}</button>)}</div></div></div>
  {activeStory&&<section id="photo-story" className="jyc57-photo-story" aria-labelledby="photo-story-title"><div className="jyc57-section-head"><div><span className="eyebrow">SIGNATURE PHOTO STORY</span><h2 id="photo-story-title">A sequence worth remembering.</h2><p>Eight-to-nine curated frames, with restraint: the moment, the people, the place, then the aftermath.</p></div><span>{storyItems.length} frames</span></div><div className="jyc57-photo-story-stage"><div className="jyc57-photo-story-image"><AnimatePresence mode="wait" initial={false}><motion.div key={activeStory.url} className="jyc57-photo-story-frame" initial={{opacity:0,x:18}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-18}} transition={{duration:shouldReduceMotion?0:.28}}><ResponsivePhoto src={activeStory.url} alt={activeStory.alt||activeStory.caption||'JYC photograph'} width={imageManifest[activeStory.url]?.width} height={imageManifest[activeStory.url]?.height} sizes="(max-width: 760px) 100vw, 68vw" loading="eager" fetchPriority="high" objectPosition={focal(activeStory)}/></motion.div></AnimatePresence></div><div className="jyc57-photo-story-copy"><span className="eyebrow">{activeStory.association||'JYC ARCHIVE'}{activeStory.year?' · '+activeStory.year:''}</span><h3>{activeStory.caption||'A JYC moment.'}</h3><p>{activeStory.story||activeStory.description||activeStory.alt||'A curated frame from the JYC visual archive.'}</p><button type="button" className="btn secondary" onClick={()=>setSelected(activeStory)}>Open full photograph ↗</button></div></div><div className="jyc57-photo-story-scrubber" role="tablist" aria-label="Photo story frames">{storyItems.map((item,i)=><button type="button" role="tab" aria-selected={storyIndex===i} aria-label={`Photo story frame ${i+1} of ${storyItems.length}`} key={item.url} className={storyIndex===i?'active':''} onClick={()=>setStoryIndex(i)} onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();setStoryIndex((i+1)%storyItems.length)}if(e.key==='ArrowLeft'){e.preventDefault();setStoryIndex((i-1+storyItems.length)%storyItems.length)}}}><ResponsivePhoto src={item.url} alt="" width={imageManifest[item.url]?.width} height={imageManifest[item.url]?.height} sizes="110px" loading="lazy"/><span>{String(i+1).padStart(2,'0')}</span></button>)}</div></section>}
  {featured.length>0&&<section className="jyc57-featured" aria-labelledby="jyc57-featured-title"><div className="jyc57-section-head"><div><span className="eyebrow">EDITORIAL SELECTION</span><h2 id="jyc57-featured-title">A few frames worth stopping for.</h2></div><span>{Math.min(featured.length,6)} featured from the current result</span></div><div className="jyc57-featured-grid">{featured.slice(0,6).map((g,i)=><motion.button layoutId={`photo-${String(g.id||g.url)}`} transition={{duration:shouldReduceMotion?0:.28,ease:[.22,1,.36,1]}} type="button" key={g.id||g.url} className={'jyc57-feature-card feature-'+i} data-photo-id={String(g.id||g.url)} onClick={()=>setSelected(g)} aria-label={'Open '+(g.caption||'JYC photograph')}><ResponsivePhoto src={g.url} alt={g.alt||g.caption||'JYC archive photograph'} loading={i<2?'eager':'lazy'} fetchPriority={i<2?'high':undefined} width={imageManifest[g.url]?.width} height={imageManifest[g.url]?.height} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 42vw" objectPosition={focal(g)}/><span><small>{g.association||'JYC ARCHIVE'}{g.year?' · '+g.year:''}</small><strong>{g.caption||'JYC moment'}</strong></span></motion.button>)}</div></section>}
  {filtered.length?<><div className="jyc57-masonry" aria-label="JYC photograph collection">{visible.map((g,i)=><motion.button layoutId={`photo-${String(g.id||g.url)}`} transition={{duration:shouldReduceMotion?0:.28,ease:[.22,1,.36,1]}} type="button" key={g.id||g.url||i} className={'jyc57-photo photo-'+i%6} data-photo-id={String(g.id||g.url)} onClick={()=>setSelected(g)} aria-label={'Open '+(g.caption||'JYC photograph')}><ResponsivePhoto src={g.url} alt={g.alt||g.caption||'JYC archive photograph'} loading={i<2?'eager':'lazy'} decoding="async" width={imageManifest[g.url]?.width} height={imageManifest[g.url]?.height} sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" objectPosition={focal(g)}/><span><small>{g.association||g.collection||'JYC'}</small><strong>{g.caption||'JYC moment'}</strong></span></motion.button>)}</div>{archiveItems.length>visibleCount&&<div className="jyc57-load-more"><span>Showing {visible.length} archive frames · {featured.length} featured above</span><button type="button" className="btn secondary" onClick={()=>setVisibleCount(n=>Math.min(n+36,archiveItems.length))}>Load 36 more</button></div>}</>:<Empty eyebrow="VISUAL ARCHIVE" title="The archive is waiting." text="Photography is shown here only after editorial, rights and framing review. The archive queue is being prepared; no rights-review image is exposed as published CMS photography."/>}
  {active&&<div ref={dialogRef} data-photo-id={String(active.id||active.url)} className="jyc57-lightbox" role="dialog" aria-modal="true" aria-label={active.caption||'JYC photograph'} onClick={close} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}><div className="jyc57-lightbox-inner" onClick={e=>e.stopPropagation()}><button type="button" className="jyc57-close" onClick={close} aria-label="Close photograph">×</button><button className="jyc57-nav prev" type="button" onClick={()=>move(-1)} aria-label="Previous photograph">‹</button><div className="jyc57-lightbox-media"><motion.div layoutId={`photo-${String(active.id||active.url)}`} transition={{duration:shouldReduceMotion?0:.28,ease:[.22,1,.36,1]}} className="jyc57-lightbox-shared"><ResponsivePhoto src={active.url} alt={active.alt||active.caption||'JYC photograph'} width={imageManifest[active.url]?.width} height={imageManifest[active.url]?.height} sizes="(max-width: 900px) 100vw, 70vw" loading="eager" objectPosition={focal(active)} style={{transform:'scale('+zoom+')'}}/></motion.div></div><button className="jyc57-nav next" type="button" onClick={()=>move(1)} aria-label="Next photograph">›</button><div className="jyc57-lightbox-copy"><span className="eyebrow">{active.association||'JYC'}</span><h2>{active.caption||'JYC moment'}</h2><p>{active.story||active.description||active.alt||'Published JYC photography.'}</p><small>{active.sourceLabel||active.source||'JYC public archive'}{active.credit?' · '+active.credit:''}</small><span className="jyc57-counter">{selectedIndex+1} / {filtered.length}</span><div className="jyc57-lightbox-actions"><button type="button" onClick={()=>setZoom(z=>z>1?1:2)}>{zoom>1?'Reset zoom':'Zoom'}</button><button type="button" onClick={share}>{copied?'Link copied':'Share photograph'}</button><button type="button" onClick={download}>Open / download</button>{active.eventId&&<button type="button" onClick={()=>nav(`/events/${encodeURIComponent(String(active.eventSlug||active.eventId||''))}`)}>Open event ↗</button>}{active.association&&<button type="button" onClick={()=>nav('/clubs/'+encodeURIComponent(slugify(String(active.association).split(' · ')[0])))}>Open community ↗</button>}</div></div></div></div>}
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
  {groups.map(([name,rows])=><section className="jyc57-featured" key={name} aria-labelledby={'best-'+name}><div className="jyc57-section-head"><div><span className="eyebrow">BEST OF JYC</span><h2 id={'best-'+name}>{name}</h2></div><span>{rows.length} frames</span></div><div className="jyc57-featured-grid">{rows.map((g,i)=><a className={'jyc57-feature-card feature-'+i%6} key={g.id||g.url} href={'/gallery?photo='+encodeURIComponent(g.id||g.url)} aria-label={`Open ${g.caption||'JYC photograph'} in the gallery`}><ResponsivePhoto src={g.url} alt={g.alt||g.caption||'JYC archive photograph'} loading={i<2?'eager':'lazy'} decoding="async" sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"/><span><small>{g.association||'JYC ARCHIVE'}{g.year?' · '+g.year:''}</small><strong>{g.caption||'JYC moment'}</strong></span></a>)}</div></section>)}
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
