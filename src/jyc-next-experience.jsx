import {useMemo,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {JYC_HUB_CONTENT,JYC_HUB_FAMILIES} from './v21-hub-content.js';
import {JYC_HUB_SOURCE_REGISTRY,JYC_HUB_VERIFIED_CURRENT,JYC_HUB_SOURCE_ONLY} from './jyc-hub-registry.js';
import {sourceHubMedia,rankJycPhotoItems,canonicalHubName,JYC_SOURCE_ARCHIVE_PHOTO_ITEMS} from './jyc-source-media.js';
import {JYC_SOURCE_ARCHIVE_STATS} from './jyc-source-archive.js';
import {LivingPhoto} from './jyc-living-photo.jsx';

const ROUTES=[
 {id:'build',label:'BUILD',kicker:'TECHNICAL · AI · ROBOTICS',text:'Build things that work. Find coding, robotics, AI, open-source and innovation communities.',families:['Technical'],focus:['AI','Robotics','Open Source','Programming','Innovation','Cybersecurity'],accent:'#8d6b42'},
 {id:'create',label:'CREATE',kicker:'CULTURAL · CREATIVE · LITERARY',text:'Make, perform, design, write and tell stories with people who care about craft.',families:['Cultural','Creative','Literary'],focus:['Music','Dance','Drama','Design','Photography','Film','Writing'],accent:'#9a4f3f'},
 {id:'compete',label:'COMPETE',kicker:'SPORTS · ESPORTS · CHALLENGES',text:'Step into tournaments, contests, hackathons and challenges where participation becomes the experience.',families:['Sports','Technical','Cultural'],focus:['Sports','Gaming','Esports','Coding','Hackathon','Competition'],accent:'#6c6656'},
 {id:'connect',label:'CONNECT',kicker:'COMMUNITY · PEOPLE · COLLABORATION',text:'Meet people, join communities, volunteer, coordinate and build the campus together.',families:['Literary','Cultural','Creative','Technical','Sports'],focus:['Community','Leadership','Collaboration','Events'],accent:'#5c6570'}
];

const normal=v=>String(v||'').toLowerCase();
const routeMatch=(club,route)=>{
 const hay=normal([club?.name,club?.category,club?.type,club?.description,club?.about,(club?.interests||[]).join(' ')].join(' '));
 const family=String(club?.family||'');
 return route.families.includes(family)||route.focus.some(x=>hay.includes(normal(x)));
};

function RouteCard({route,clubs,onOpen}){
 const matches=clubs.filter(c=>routeMatch(c,route)).slice(0,4);
 return <article className="jyc-route-card" style={{'--route-accent':route.accent}}>
  <div className="jyc-route-top"><span className="jyc-route-index">{route.label[0]}</span><span className="eyebrow">{route.kicker}</span></div>
  <h3>{route.label}</h3><p>{route.text}</p>
  <div className="jyc-route-hubs">{matches.map(c=><button type="button" key={c.id||c.name} onClick={()=>onOpen(c)}>{c.name}<b>↗</b></button>)}</div>
  <div className="jyc-route-footer"><span>{matches.length ? 'Suggested communities' : 'Explore the ecosystem'}</span><button type="button" onClick={()=>onOpen()}>{matches.length?'See route →':'Browse all clubs →'}</button></div>
 </article>
}


export function JYCBrandEditorial({compact=false}){
 const nav=useNavigate();
 const points=['Organize college events','Connect students & clubs','Develop leadership skills','Promote talent & creativity','Industry & alumni interaction','Build teamwork & responsibility'];
 return <section className={`section jyc-brand-editorial ${compact?'is-compact':''} reveal`} aria-labelledby={compact?'jyc-brand-editorial-compact':'jyc-brand-editorial-title'}>
  <div className="jyc-brand-editorial-copy">
   <span className="eyebrow">JYC · READY TO SOAR</span>
   <h2 id={compact?'jyc-brand-editorial-compact':'jyc-brand-editorial-title'}>A student body built around participation.</h2>
   <p>JYC is presented in the supplied 2026–27 orientation material as a student-governed organisation: a coordinating layer for clubs, events, talent, leadership and shared campus experiences at JIIT Wish Town, Sector 128.</p>
   <div className="jyc-brand-editorial-points">{points.map((point,i)=><div key={point}><b>{String(i+1).padStart(2,'0')}</b><span>{point}</span></div>)}</div>
   <div className="jyc-brand-editorial-actions"><button type="button" className="btn" onClick={()=>nav('/about')}>Read the JYC story ↗</button><button type="button" className="text-link" onClick={()=>nav('/clubs')}>Explore communities →</button></div>
  </div>
  <div className="jyc-brand-editorial-mark" aria-label="JIIT Youth Club official identity">
   <div className="jyc-brand-editorial-logo"><img src="/assets/jyc-logo.avif" srcSet="/assets/jyc-logo-48.avif 48w, /assets/jyc-logo-small.avif 96w, /assets/jyc-logo-medium.avif 192w, /assets/jyc-logo-270.avif 270w, /assets/jyc-logo.avif 512w" sizes="(max-width: 600px) 70vw, 270px" alt="JIIT Youth Club official emblem" width={512} height={512} loading={compact?'lazy':'eager'} decoding="async"/></div>
   <span className="jyc-brand-editorial-rule"><i/>JYC 128<i/></span>
   <strong>VOICE · TALENT · SPIRIT</strong>
   <small>JIIT WISH TOWN CAMPUS</small>
  </div>
 </section>
}

export function ChooseYourRoute({data}){
 const nav=useNavigate();
 const [active,setActive]=useState('build');
 const clubs=useMemo(()=>Array.isArray(data?.clubs)?data.clubs.filter(c=>c?.published&&c?.status!=='archived'):[],[data?.clubs]);
 const route=ROUTES.find(x=>x.id===active)||ROUTES[0];
 const openClub=c=>c?nav('/clubs/'+encodeURIComponent(c.id||c.name)):nav('/clubs');
 return <section id="routes" className="section jyc-route-section reveal">
  <div className="jyc-route-head"><div><span className="eyebrow">CHOOSE YOUR ROUTE</span><h2>Start with what you want to make.</h2><p>JYC is bigger than a list of clubs. Choose a direction and discover the communities that fit it.</p></div><div className="jyc-route-switcher" role="tablist" aria-label="JYC routes">{ROUTES.map(r=><button key={r.id} type="button" role="tab" aria-selected={active===r.id} className={active===r.id?'active':''} onClick={()=>setActive(r.id)}>{r.label}</button>)}</div></div>
  <div className="jyc-route-grid">{ROUTES.map(r=><div key={r.id} hidden={active!==r.id}><RouteCard route={r} clubs={clubs} onOpen={openClub}/></div>)}</div>
  <div className="jyc-route-note"><span>01</span><p><strong>Not sure yet?</strong> Browse the complete JYC directory and let the community pages lead you from one interest to another.</p><button type="button" onClick={()=>nav('/clubs')}>Open all communities ↗</button></div>
 </section>
}

export function FlagshipExperience({data}){
 const nav=useNavigate();
 const event=useMemo(()=>{
  const rows=Array.isArray(data?.events)?data.events:[];
  const preferred=rows.find(e=>String(e.id||e.slug||'')==='jai-2026-jaypee-agentic-ai-hackathon'&&e.published&&!e.archived);
  if(preferred)return preferred;
  return rows.filter(e=>e.published&&!e.archived&&(e.featured||e.pinned)).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')))[0]||null;
 },[data?.events]);
 if(!event)return null;
 const tracks=Array.isArray(event.tracks)?event.tracks.slice(0,4):[];
 const stats=Array.isArray(event.summitStats)?event.summitStats.slice(0,4):[];
 const steps=[
  ['01','UNDERSTAND','Start with the real problem and the published challenge context.'],
  ['02','CHOOSE A TRACK',tracks.length?tracks.map(x=>x.name).join(' · '):'Choose the published experience track that fits your idea.'],
  ['03','BUILD TOGETHER',event.teamSize?'Work with a '+event.teamSize+' team and turn the idea into a working experience.':'Build with your team, tools and community.'],
  ['04','PRESENT & CONNECT','Show what you built, meet the ecosystem and take the work beyond the event.']
 ];
 const open=()=>nav('/events/'+String(event.slug||event.title||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
 const register=safeExternal(event.registrationUrl);
 return <section className="section jyc-flagship-section reveal" aria-labelledby="jyc-flagship-title">
  <div className="jyc-flagship-head"><div><span className="eyebrow">FLAGSHIP EXPERIENCE · JYC 128</span><h2 id="jyc-flagship-title">{event.title}</h2><p>{event.summitTitle||event.description||'A major JYC experience with a clear path from idea to participation.'}</p></div><span className="jyc-flagship-date">{event.date?(event.dateEnd?event.date+' — '+event.dateEnd:event.date):''}</span></div>
  <div className="jyc-flagship-shell">
   <div className="jyc-flagship-visual">{event.poster?<img src={event.poster} alt={event.title+' poster'} loading="lazy"/>:<div className="jyc-flagship-mark"><img src="/assets/jyc-logo.avif" alt="JIIT Youth Club official emblem" loading="lazy"/><span>JYC · 128</span></div>}<span className="jyc-flagship-visual-label">JYC · SECTOR 128 · NOIDA</span></div>
   <div className="jyc-flagship-copy">
    <div className="jyc-flagship-kicker"><span>{event.eventType||'FLAGSHIP PROGRAMME'}</span><b>{event.venue||'JIIT Wish Town Campus · Sector 128, Noida'}</b></div>
    <h3>{event.description||'Build, participate and connect through a flagship JYC experience.'}</h3>
    <div className="jyc-flagship-stats">{stats.map((x,i)=><span key={i}><b>{String(i+1).padStart(2,'0')}</b>{x}</span>)}</div>
    <div className="jyc-flagship-steps">{steps.map(([n,label,text])=><article key={n}><b>{n}</b><div><strong>{label}</strong><p>{text}</p></div></article>)}</div>
    <div className="jyc-flagship-actions"><button type="button" className="btn" onClick={open}>Explore the experience ↗</button>{register&&<a className="btn secondary" href={register} target="_blank" rel="noopener noreferrer">Register ↗</a>}</div>
   </div>
  </div>
 </section>
}
function safeExternal(value){const raw=String(value||'').trim();if(!raw)return '';try{const u=new URL(raw,window.location.origin);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}

export function PhotoStory({data}){
 const nav=useNavigate();
 const items=useMemo(()=>{
  const published=(Array.isArray(data?.gallery)?data.gallery:[]).filter(g=>g?.url&&g?.published!==false);
  const sourceBuckets=JYC_HUB_SOURCE_REGISTRY.map(meta=>sourceHubMedia(meta.name).photoItems.map((item,i)=>({
   id:`source-${meta.name}-${i}`,url:item.url,association:meta.name,year:item.year||'',
   caption:item.caption||item.title||`${meta.name} · source photography`,
   alt:item.alt||item.caption||`${meta.name} supplied JYC source photograph`,
   published:true,mediaKind:'photo',sourceLabel:item.sourceLabel||'JYC supplied hub archive',family:meta.family||''
  }))).filter(bucket=>bucket.length);
  const sourcePhotos=[]; const maxSourceDepth=Math.max(0,...sourceBuckets.map(bucket=>bucket.length));
  for(let depth=0;depth<maxSourceDepth;depth++)sourceBuckets.forEach(bucket=>{if(bucket[depth])sourcePhotos.push(bucket[depth])});
  const raw=[...published,...sourcePhotos,...JYC_SOURCE_ARCHIVE_PHOTO_ITEMS];
  const preferred=[...raw.filter(g=>/Converge|Dron-O-War|Ebullience|JAI|JYC Archive/i.test(String(g.association||''))),...raw];
  const seen=new Set();
  return preferred.filter(g=>{const key=String(g.url||g.id||'');if(!key||seen.has(key))return false;seen.add(key);return true});
 },[data?.gallery]);
 if(!items.length)return null;
 return <section id="photo-story" className="section jyc-photo-story-section reveal">
  <div className="jyc-photo-story-head"><div><span className="eyebrow">PHOTO STORY · JYC ARCHIVE</span><h2>Let the photographs tell the story.</h2><p>Real JYC media becomes the narrative layer: event, people, place, performance and work. The archive stays available without forcing hundreds of images into the first paint.</p></div><button type="button" className="reference-view-all" onClick={()=>nav('/gallery')}>Open visual archive ↗</button></div>
  <LivingPhoto items={items} seed={0} interval={6000} className="jyc-photo-story-living"/>
  <div className="jyc-photo-story-footer"><span>{JYC_SOURCE_ARCHIVE_STATS.uniqueImages} unique archive images · related frames rotate automatically</span><button type="button" className="text-link" onClick={()=>nav('/gallery')}>Browse every frame ↗</button></div>
 </section>
}

export function PhotoChapters(){
 const nav=useNavigate();
 const chapters=useMemo(()=>JYC_HUB_FAMILIES.map(family=>{
  const hubs=JYC_HUB_SOURCE_REGISTRY.filter(h=>h.family===family).map(h=>({
   ...h,
   profile:JYC_HUB_CONTENT[h.name]||{},
   media:sourceHubMedia(h.name)
  })).filter(h=>h.media.photos.length);
  const photos=hubs.flatMap(h=>rankJycPhotoItems(h.media.photoItems,{limit:4,seed:h.name.length}).map((item,i)=>({
   url:item.url,
   hub:h.name,
   caption:item.caption||item.title||h.profile.summary||h.profile.focus||family,
   alt:item.alt||item.caption||`${h.name} source photograph ${i+1}`,
   year:item.year||''
  })));
  return {family,hubs,photos};
 }).filter(x=>x.photos.length),[]);
 if(!chapters.length)return null;
 return <section className="section jyc-photo-chapters-section reveal">
  <div className="jyc-photo-chapters-head">
   <div><span className="eyebrow">PHOTO CHAPTERS · 23 COMMUNITIES</span><h2>See JYC through its communities.</h2><p>Instead of one generic gallery, the archive is grouped into visual chapters so each family keeps its own rhythm, people and places.</p></div>
   <button type="button" className="reference-view-all" onClick={()=>nav('/gallery')}>Browse every frame ↗</button>
  </div>
  <div className="jyc-photo-chapters-grid">
   {chapters.map(ch=><article className="jyc-photo-chapter" key={ch.family}>
    <div className="jyc-photo-chapter-title"><span>{ch.family}</span><b>{ch.hubs.length} communities · {ch.photos.length} frames</b></div>
    <div className="jyc-photo-chapter-collage">
     {ch.photos.map((p,i)=><button type="button" key={p.url+i} onClick={()=>nav('/clubs/'+encodeURIComponent(p.hub))} aria-label={`Explore ${p.hub}`}>
      <img src={p.url} alt={p.alt} loading="lazy"/><span><b>{p.hub}</b><small>{p.caption}</small></span>
     </button>)}
    </div>
    <button type="button" className="text-link" onClick={()=>nav('/clubs?family='+encodeURIComponent(ch.family))}>Explore {ch.family} ↗</button>
   </article>)}
  </div>
 </section>
}

export function HubSignalRail({data}){
 const nav=useNavigate();
 const [family,setFamily]=useState('All');
 const hubs=useMemo(()=>JYC_HUB_SOURCE_REGISTRY.map(meta=>{const canonical=canonicalHubName(meta.name);const p=JYC_HUB_CONTENT[canonical]||{};return {...meta,canonicalName:canonical,...p,media:sourceHubMedia(canonical)}}),[]);
 const visible=useMemo(()=>family==='All'?hubs:hubs.filter(h=>h.family===family),[family,hubs]);
 const currentCount=JYC_HUB_VERIFIED_CURRENT.length;
 const sourceMaterialCount=JYC_HUB_SOURCE_ONLY.filter(h=>h.status==='source-material').length;
 return <section className="section jyc-hub-signal-section reveal">
  <div className="jyc-hub-signal-head">
   <div><span className="eyebrow">JYC ECOSYSTEM · SOURCE INDEX</span><h2>Five families. One connected campus.</h2><p>{currentCount} communities are verified in the 2026 JIIT brochure; {sourceMaterialCount} additional communities are verified in the supplied 2026–27 orientation material. This index is not an exhaustive list of every active JIIT hub.</p></div>
   <button type="button" className="reference-view-all" onClick={()=>nav('/clubs')}>Open live club directory ↗</button>
  </div>
  <div className="jyc-hub-source-filters" role="tablist" aria-label="Filter JYC source hub index">
   {['All',...JYC_HUB_FAMILIES].map(x=><button key={x} type="button" role="tab" aria-selected={family===x} className={family===x?'active':''} onClick={()=>setFamily(x)}>{x}<span>{x==='All'?hubs.length:hubs.filter(h=>h.family===x).length}</span></button>)}
  </div>
  <div className="jyc-hub-signal-grid">{visible.map((h,i)=><button type="button" className="jyc-hub-signal-card" data-source-status={h.status} key={h.name} onClick={()=>nav('/clubs/'+encodeURIComponent(h.canonicalName||h.name))}>
    <div>{h.media.photos[0]||h.media.visuals?.[0]?<img src={h.media.photos[0]||h.media.visuals?.[0]} alt={`${h.name} JYC visual`} loading="lazy"/>:<span>{String(i+1).padStart(2,'0')}</span>}</div>
    <small>{h.family} · {h.focus}</small><strong>{h.name}</strong><em>{h.summary||'Source-backed JYC hub profile awaiting richer live records.'}</em>
    <span className="jyc-hub-source-status">{h.status==='brochure-verified'?'2026 BROCHURE VERIFIED':h.status==='source-material'?'SOURCE MATERIAL':'SOURCE MATERIAL'}</span><b>Open hub ↗</b>
   </button>)}</div>
 </section>
}
