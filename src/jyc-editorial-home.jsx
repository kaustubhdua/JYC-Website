import React,{Suspense,lazy,useEffect,useMemo,useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {JYC_HUB_CONTENT,JYC_HUB_FAMILIES} from './v21-hub-content.js';
import {sourceEventMedia} from './jyc-source-media.js';
import {JYC_PUBLIC_ACTIVITIES} from './public-v1/config.js';
import {ResponsivePhoto} from './jyc-responsive-photo.jsx';
const LazyDitherVeil=lazy(()=>import('./react-bits/DitherVeil.jsx'));
const LazyMagicBento=lazy(()=>import('./components/react-bits/MagicBento.jsx'));
import './jyc-editorial-home.css';

const FALLBACK=import.meta.env.PROD?'/assets/jyc-logo.webp':'/JYC%20Logo(4).png';
const DITHER_SOURCE=import.meta.env.PROD?'/assets/jyc-logo.avif':FALLBACK;
function LazyActivityBento({activities,nav}){
 const host=useRef(null),[active,setActive]=useState(false);
 useEffect(()=>{
  const node=host.current;
  if(!node)return;
  if(typeof IntersectionObserver==='undefined'){setActive(true);return}
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){setActive(true);observer.disconnect()}
  },{rootMargin:'360px 0px'});
  observer.observe(node);
  return()=>observer.disconnect();
 },[]);
 const fallback=<div className="jh-activity-grid" aria-label="JYC activity areas">{activities.map((a,i)=><button type="button" className="jh-activity-card" key={a.id||a.title} onClick={()=>nav(a.link||'/clubs')}><span>{String(i+1).padStart(2,'0')}</span><strong>{a.title}</strong><p>{a.text}</p><b>Explore <i>↗</i></b></button>)}</div>;
 const items=activities.map((a,i)=>({id:a.id||a.title,title:a.title,description:a.text,label:`${String(i+1).padStart(2,'0')} · JYC ACTIVITY`,href:a.link||'/clubs'}));
 return <div ref={host} className="jh-activity-bento-host">{active?<Suspense fallback={fallback}><LazyMagicBento items={items} onNavigate={nav} enableMagnetism={true} enableTilt={true} enableStars={false} enableSpotlight={true} enableBorderGlow={true} clickEffect={false} particleCount={0} glowColor="191,156,111"/></Suspense>:fallback}</div>;
}
const slug=v=>String(v||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const eventPath=e=>`/events/${slug(e?.slug||e?.title)}`;
const media=v=>v?.url||v?.src||v?.image||v?.imageUrl||'';
const dateMs=e=>{const raw=String(e?.date||'').trim();if(!raw)return Infinity;const time=String(e?.start||'').trim();const candidate=/T\d{2}:\d{2}/.test(raw)?raw:raw+'T'+(/^\d{1,2}:\d{2}$/.test(time)?time.padStart(5,'0'):'00:00');const ms=Date.parse(candidate);return Number.isFinite(ms)?ms:Infinity};
const dateLabel=v=>{const d=new Date(String(v||''));return Number.isNaN(d.getTime())?'DATE TBA':d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});};
const eventImage=e=>e?.poster||sourceEventMedia(e)?.photoItems?.filter(x=>x?.url).map(media)[0]||'';
const safeRegistrationUrl=value=>{try{const url=new URL(String(value||''));return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?url.href:''}catch{return ''}};
const registrationState=e=>{
 const href=safeRegistrationUrl(e?.registrationUrl);
 const endDate=String(e?.dateEnd||e?.date||'').trim();
 const endMs=endDate?Date.parse(/T\d{2}:\d{2}/.test(endDate)?endDate:endDate+'T23:59:59'):NaN;
 const deadline=String(e?.registrationDeadline||'').trim();
 const deadlineMs=deadline?Date.parse(/T\d{2}:\d{2}/.test(deadline)?deadline:deadline+'T23:59:59'):NaN;
 const ended=Number.isFinite(endMs)&&Date.now()>endMs;
 const deadlinePassed=Number.isFinite(deadlineMs)&&Date.now()>deadlineMs;
 if(e?.publicStatus==='planned'&&e?.registrationVerified!==true)return {label:'Registration not published',href:''};
 if(href&&!ended&&!deadlinePassed)return {label:'Registration open',href};
 if(href||ended||deadlinePassed)return {label:'Registration closed',href:''};
 return {label:'Registration details unavailable',href:''};
};

export function JYCEditorialHome({data}){
 const nav=useNavigate();
 const events=useMemo(()=>Array.isArray(data?.events)?data.events.filter(e=>e?.published&&!e?.archived).slice().sort((a,b)=>dateMs(a)-dateMs(b)):[],[data?.events]);
 const today=useMemo(()=>{const d=new Date();d.setHours(0,0,0,0);return d.getTime();},[]);
 const upcoming=events.filter(e=>{const t=dateMs(e);return Number.isFinite(t)&&t>=today;}).slice(0,4);
 const team=(data?.team||[]).filter(x=>x?.published===true).slice(0,4);
 const families=JYC_HUB_FAMILIES.map(f=>({family:f,hubs:Object.entries(JYC_HUB_CONTENT).filter(([,p])=>p.family===f).map(([name,p])=>({name,...p}))}));
 const activities=JYC_PUBLIC_ACTIVITIES;
 const featured=upcoming[0];
 const featuredRegistration=registrationState(featured);
 const photoStories=useMemo(()=>{
  const items=Array.isArray(data?.gallery)?data.gallery:[];
  const seen=new Set();
  const selected=[];
  for(const item of items){
   const url=String(item?.url||'').trim();
   const association=String(item?.association||item?.albumName||'').trim();
   const role=String(item?.role||'').toLowerCase();
   if(!url||!association||item?.published===false||item?.archived===true||item?.mediaKind!=='photo'||!['event','club'].includes(role)||/jyc archive|source archive/i.test(association)||seen.has(association.toLowerCase()))continue;
   seen.add(association.toLowerCase());
   selected.push({...item,association});
   if(selected.length===3)break;
  }
  return selected;
 },[data?.gallery]);
 return <main className="jyc-editorial-home jyc-home">
  <section className="jh-hero" aria-labelledby="jh-title"><div className="jh-hero-copy"><div className="jh-kicker"><span>JIIT YOUTH CLUB</span><b>128</b></div><p className="jh-overline">JIIT WISH TOWN · SECTOR 128 · NOIDA</p><h1 id="jh-title"><span>THE VOICE.</span><span>THE TALENT.</span><em>THE SPIRIT.</em></h1><p className="jh-lead">The student-powered layer connecting the communities, events, culture, competition and campus life of JIIT 128.</p><div className="jh-actions jh-hero-actions"><button type="button" className="jh-btn jh-btn-primary" onClick={()=>nav('/events')}>Explore Events <span>↗</span></button><button type="button" className="jh-btn" onClick={()=>nav('/join-jyc')}>Join JYC <span>→</span></button><button type="button" className="jh-btn" onClick={()=>nav('/clubs')}>View Clubs <span>→</span></button></div><div className="jh-proof"><span><b>01</b> DISCOVER</span><span><b>02</b> PARTICIPATE</span><span><b>03</b> BELONG</span></div></div><div className="jh-hero-visual jh-hero-dither-visual"><div className="jh-hero-dither-backdrop" aria-hidden="true"/><div className="jh-hero-logo-plaque"><span className="jh-logo-halo" aria-hidden="true"/><div className="jh-dither-mark" role="img" aria-label="Official JIIT Youth Club 128 logo with an interactive Dither Veil effect"><Suspense fallback={<img className="jh-hero-logo" src={FALLBACK} alt="" loading="eager" fetchPriority="high" decoding="async" onError={event=>{const image=event.currentTarget;if(FALLBACK!=="/JYC%20Logo(4).png"&&image.dataset.logoFallback!=="1"){image.dataset.logoFallback="1";image.src="/JYC%20Logo(4).png"}else image.hidden=true}}/>}><LazyDitherVeil src={DITHER_SOURCE} fallbackSrc={FALLBACK} fit="contain" pattern="floyd" pixelSize={2} levels={3} palette="duotone" inkColor="#171316" paperColor="#f8f1e5" contrast={1.2} brightness={0.02} revealRadius={230} softness={0.72} linger={1.1} rimColor="#bf9c6f" rim={0.24} wander={false} clickBurst={true} className="jh-dither-veil-effect"/></Suspense></div><span className="jh-logo-caption">JIIT YOUTH CLUB <b>·</b> 128</span></div><span className="jh-photo-label">JYC 128 / THE COMMUNITY</span><span className="jh-photo-index">01 — IDENTITY</span></div></section>
  <section className="jh-intro jh-container"><div className="jh-section-number">01 / THE ORGANISATION</div><div className="jh-intro-grid"><h2>The student organisation behind the experiences that make <em>campus life move.</em></h2><div><p>JYC connects JIIT 128 communities, events, fests and inter-society activity. Discover a skill, find people, lead something and make a memory.</p><button type="button" className="jh-text-link" onClick={()=>nav('/about')}>What is JYC? <span>→</span></button></div></div><div className="jh-word-rail"><span>CLUBS</span><i>×</i><span>EVENTS</span><i>×</i><span>CULTURE</span><i>×</i><span>COMPETITION</span><i>×</i><span>COMMUNITY</span></div></section>
  <section className="jh-dark-section"><div className="jh-container"><div className="jh-section-head light"><div><div className="jh-section-number">02 / FIND YOUR SPACE</div><h2>Many communities.<br/><em>One campus.</em></h2></div><button type="button" className="jh-text-link light" onClick={()=>nav('/clubs')}>Explore all clubs <span>↗</span></button></div><div className="jh-family-grid">{families.slice(0,5).map((group,i)=><article className="jh-family" key={group.family}><div className="jh-family-index" aria-hidden="true"><span>0{i+1}</span><b>{String(group.family||'JYC').slice(0,3).toUpperCase()}</b></div><div className="jh-family-copy"><span>{group.family}</span><h3>{group.hubs.slice(0,3).map(x=>x.name).join(' · ')}</h3><p>{group.hubs.length} documented communities</p><button type="button" onClick={()=>nav('/clubs')}>Find your space →</button></div></article>)}</div></div></section>
  <section className="jh-container jh-events"><div className="jh-section-head"><div><div className="jh-section-number">03 / WHAT’S NEXT</div><h2>What’s happening<br/><em>at JYC.</em></h2></div><button type="button" className="jh-text-link" onClick={()=>nav('/events')}>View all events <span>↗</span></button></div>{featured?<article className="jh-featured-event"><div className="jh-event-image"><ResponsivePhoto className="jh-featured-event-photo" src={eventImage(featured)||FALLBACK} alt={eventImage(featured)?featured.title+' event poster':'Official JYC logo placeholder; event media unavailable'} loading="lazy" decoding="async" sizes="(max-width: 680px) 100vw, 50vw" fallbackSrc={FALLBACK} fallbackAlt="Official JYC logo placeholder; event media unavailable"/><span>FEATURED EVENT</span></div><div className="jh-event-copy"><p className="jh-event-meta">{dateLabel(featured.date)} · JIIT 128 · {featured.club||'JYC'}</p><h3>{featured.title}</h3><p>{featured.description||'Discover the official event record, schedule and registration information.'}</p><div className="jh-event-details"><span>VENUE <b>{featured.venue||'JIIT 128'}</b></span><span>TIME <b>{featured.start||'TBA'}</b></span></div><div className="jh-registration-row"><span className={featuredRegistration.href?'is-open':''} role="status">{featuredRegistration.label}</span>{featuredRegistration.href&&<button type="button" className="jh-btn jh-btn-primary" onClick={()=>window.open(featuredRegistration.href,'_blank','noopener,noreferrer')}>Register Now <span>↗</span></button>}<button type="button" className="jh-btn" onClick={()=>nav(eventPath(featured))}>View Event <span>→</span></button></div></div></article>:<div className="jh-empty">No published upcoming events are currently available.</div>}{upcoming.slice(1).length>0&&<div className="jh-event-list">{upcoming.slice(1).map(e=><button type="button" key={e.id||e.title} onClick={()=>nav(eventPath(e))}><span>{dateLabel(e.date)}</span><strong>{e.title}</strong><small>{e.club||'JYC'} · {e.venue||'JIIT 128'}</small><b>→</b></button>)}</div>}</section>
  {photoStories.length>0&&<section className="jh-photo-story jh-container" aria-labelledby="jh-photo-story-title">
   <div className="jh-photo-story-head">
    <div><div className="jh-section-number">04 / REAL MOMENTS · REAL COMMUNITIES</div><h2 id="jh-photo-story-title">From the<br/><em>JYC record.</em></h2></div>
    <div className="jh-photo-story-intro"><p>People, performances and ideas from the communities that make campus life memorable. Explore the archive through real JYC photography.</p><button type="button" className="jh-text-link" onClick={()=>nav('/gallery')}>Open the gallery <span>↗</span></button></div>
   </div>
   <div className={`jh-photo-story-grid ${photoStories.length===3?'has-three':'has-fewer'}`}>
    {photoStories.map((story,index)=><button type="button" className={`jh-story-card jh-story-card-${index+1}`} key={story.id||story.url} onClick={()=>nav('/gallery')} aria-label={`Explore ${story.association} photography in the JYC gallery`}>
     <ResponsivePhoto className="jh-story-photo" src={story.url} alt={story.alt||story.caption||`${story.association} photography`} loading="lazy" decoding="async" sizes={index===0?'(max-width: 760px) 100vw, 58vw':'(max-width: 760px) 100vw, 34vw'} fallbackSrc={FALLBACK} fallbackAlt="Official JYC logo placeholder; photograph unavailable"/>
     <span className="jh-story-shade" aria-hidden="true"/>
     <span className="jh-story-copy"><small>{story.year||'JYC ARCHIVE'} <i>·</i> {story.association}</small><strong>{story.caption||story.association}</strong><b>Explore the archive <span aria-hidden="true">↗</span></b></span>
     <span className="jh-story-index" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
    </button>)}
   </div>
  </section>}
  <section className="jh-activities jh-container"><div className="jh-section-head"><div><div className="jh-section-number">05 / WHAT JYC MAKES POSSIBLE</div><h2>A campus with<br/><em>room to participate.</em></h2></div><p>Choose how you want to show up: create, compete, perform, build, organise or simply find your people.</p></div><LazyActivityBento activities={activities} nav={nav}/><div className="jh-activities-foot"><span>Want the visual archive?</span><button type="button" className="jh-text-link" onClick={()=>nav('/gallery')}>Open JYC Gallery <span>↗</span></button></div></section>
  <section className="jh-updates jh-container"><div className="jh-section-head"><div><div className="jh-section-number">06 / THE LATEST</div><h2>Notes from<br/><em>the community.</em></h2></div><button type="button" className="jh-text-link" onClick={()=>nav('/announcements')}>All announcements <span>↗</span></button></div>{Array.isArray(data?.announcements)&&data.announcements.filter(x=>x?.published!==false&&!x?.archived).length?<div className="jh-update-list">{data.announcements.filter(x=>x?.published!==false&&!x?.archived).slice(0,4).map((item,i)=><button type="button" key={item.id||item.slug||i} onClick={()=>nav(typeof item.href==='string'&&item.href.startsWith('/')&&!item.href.startsWith('//')?item.href:'/announcements')}><span>{item.date||item.publishedAt||'JYC NOTICE'}</span><strong>{item.title||item.name||'Announcement'}</strong><small>{item.summary||item.description||'Read the latest official update.'}</small><b>↗</b></button>)}</div>:<div className="jh-empty">Official announcements will appear here when published.</div>}</section>
  <section className="jh-community"><div className="jh-container jh-community-grid"><div className="jh-community-copy"><div className="jh-section-number">07 / THE PEOPLE + THE RECORD</div><h2>Built by students.<br/><em>Remembered together.</em></h2><p>JYC is a living student organisation, but its work also becomes a record of campus life. Meet the people behind it, then explore the years, events and achievements they leave behind.</p><div className="jh-actions"><button type="button" className="jh-btn jh-btn-light" onClick={()=>nav('/team')}>Meet the team <span>↗</span></button><button type="button" className="jh-btn jh-btn-outline-light" onClick={()=>nav('/history')}>Explore history <span>→</span></button></div></div><div className="jh-team-list"><div className="jh-team-list-head"><span>JYC TEAM</span><span>{team.length?String(team.length).padStart(2,'0'):'—'} PROFILES</span></div>{team.length?team.map((m,i)=><button type="button" key={m.id||i} onClick={()=>nav('/team')}><span className="jh-team-monogram" aria-hidden="true">{String(m.name||'JYC').trim().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase()}</span><span><small>{m.role||m.position||'JYC Team'}</small><strong>{m.name||'JYC Team Member'}</strong></span><b>↗</b></button>):<div className="jh-empty">Official team profiles will appear here when published.</div>}<div className="jh-years"><span>PEOPLE</span><span>COMMUNITY</span><span>MEMORIES</span><b>JYC 128</b></div></div></div></section>
  <section className="jh-final"><div className="jh-container jh-final-grid"><div><div className="jh-section-number">08 / GET INVOLVED</div><h2>Find your place<br/><em>in JIIT 128.</em></h2></div><div><p>Discover a community. Find the next event. Meet the people making campus life happen.</p><div className="jh-actions"><button type="button" className="jh-btn jh-btn-light" onClick={()=>nav('/clubs')}>Explore Clubs <span>↗</span></button><button type="button" className="jh-btn jh-btn-outline-light" onClick={()=>nav('/events')}>See Events <span>→</span></button><button type="button" className="jh-btn jh-btn-outline-light" onClick={()=>nav('/join-jyc')}>Join JYC <span>→</span></button></div></div></div></section>
 </main>;
}
