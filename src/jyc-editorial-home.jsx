import React,{lazy,Suspense,useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {JYC_HUB_CONTENT,JYC_HUB_FAMILIES} from './v21-hub-content.js';
import {sourceHubMedia,sourceEventMedia,mergeSourceGallery} from './jyc-source-media.js';
import {JYC_PUBLIC_ACTIVITIES} from './public-v1/config.js';
import {JYCNowStrip} from './jyc-now.jsx';
import {JYC_SOCIALS} from './jyc-socials.js';
import './jyc-editorial-home.css';

const LazyDitherVeil=lazy(()=>import('./react-bits/DitherVeil.jsx'));
const LazyMagicBento=lazy(()=>import('./components/react-bits/MagicBento.jsx'));

const FALLBACK='/assets/hub-photos/jyc-06.webp';
const slug=v=>String(v||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const media=v=>v?.url||v?.src||v?.image||v?.imageUrl||'';
const dateMs=e=>{const d=new Date(String(e?.date||'')+'T'+String(e?.start||'00:00'));return Number.isNaN(d.getTime())?Infinity:d.getTime()};
const dateLabel=v=>{const d=new Date(String(v||''));return Number.isNaN(d.getTime())?'DATE TBA':d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});};
const hubImage=(name,i=0)=>sourceHubMedia(name)?.photos?.[i%Math.max(1,sourceHubMedia(name)?.photos?.length||1)]||FALLBACK;
const eventImage=(e,i=0)=>e?.poster||sourceEventMedia(e)?.items?.filter(x=>x?.url).map(media)[i]||FALLBACK;

function Img({src,alt,...props}){return <img {...props} src={src||FALLBACK} alt={alt||''} onError={e=>{if(e.currentTarget.dataset.fallback)return;e.currentTarget.dataset.fallback='1';e.currentTarget.src=FALLBACK;}}/>}

export function JYCEditorialHome({data}){
 const nav=useNavigate();
 const events=useMemo(()=>Array.isArray(data?.events)?data.events.filter(e=>e?.published&&!e?.archived).slice().sort((a,b)=>dateMs(a)-dateMs(b)):[],[data?.events]);
 const now=Date.now();
 const eventEndMs=e=>{const endDate=e?.dateEnd||e?.date;if(!endDate)return NaN;const end=new Date(String(endDate)+'T'+String(e?.end||'23:59'));return end.getTime()};
 const upcoming=events.filter(e=>{const start=dateMs(e);const end=eventEndMs(e);return Number.isFinite(start)&&Number.isFinite(end)&&end>=now}).slice(0,4);
 const gallery=useMemo(()=>mergeSourceGallery(data?.gallery||[]).filter(g=>g?.url),[data?.gallery]);
 const photoGallery=useMemo(()=>gallery.filter(g=>!/(qr|logo|banner|poster|graphic|artwork|thank you|follow us|scan)/i.test(String(g?.caption||'')+' '+String(g?.alt||g?.title||''))&&(g?.mediaKind==='photo'||!g?.mediaKind)),[gallery]);
 const heroPhoto=photoGallery[0]||gallery[0]||null;
 const team=(data?.team||[]).filter(x=>x?.published===true).slice(0,4);
 const families=JYC_HUB_FAMILIES.map(f=>({family:f,hubs:Object.entries(JYC_HUB_CONTENT).filter(([,p])=>p.family===f).map(([name,p])=>({name,...p}))}));
 const activities=JYC_PUBLIC_ACTIVITIES.slice(0,6);
 const featured=upcoming[0];
 return <main className="jyc-editorial-home jyc-home">
   <section className="jh-hero" aria-labelledby="jh-title">
     <div className="jh-hero-copy">
       <div className="jh-kicker"><span>JIIT YOUTH CLUB</span><b>128</b></div>
       <p className="jh-overline">JIIT WISH TOWN · SECTOR 128 · NOIDA</p>
       <h1 id="jh-title"><span>THE VOICE.</span><span>THE TALENT.</span><em>THE SPIRIT.</em></h1>
       <p className="jh-lead">The student-powered layer connecting the communities, events, culture, competition and campus life of JIIT 128.</p>
       <div className="jh-actions">
         <button type="button" className="jh-btn jh-btn-primary" onClick={()=>nav('/events')}>Explore Events <span>↗</span></button>
         <button type="button" className="jh-btn" onClick={()=>nav('/clubs')}>View Clubs <span>→</span></button>
         <button type="button" className="jh-btn" onClick={()=>nav('/join-jyc')}>Join JYC <span>→</span></button>
       </div>
       <div className="jh-proof"><span><b>01</b> DISCOVER</span><span><b>02</b> PARTICIPATE</span><span><b>03</b> BELONG</span></div>
     </div>
     <div className="jh-hero-visual">
       <div className="jh-photo-frame">
         <Img src={heroPhoto?.url||FALLBACK} alt={heroPhoto?.alt||heroPhoto?.caption||'JIIT Youth Club 128 campus moment'} width="1600" height="1000" fetchPriority="high"/>
         <div className="jh-photo-overlay"/>
         <span className="jh-photo-label">JYC 128 / CAMPUS LIFE</span>
         <span className="jh-photo-index">01 — MOMENTS</span>
       </div>
       <div className="jh-dither" aria-hidden="true">
         <Suspense fallback={null}><LazyDitherVeil src="/jyc-logo-official.webp" fit="contain" pattern="floyd" pixelSize={3} levels={2} palette="duotone" inkColor="#a82420" paperColor="#f5f1e6" contrast={1.05} revealRadius={130} softness={0.7} linger={0.8} rim={0} wander={false}/></Suspense>
       </div>
     </div>
   </section>

   <section className="jh-intro jh-container">
     <div className="jh-section-number">01 / THE ORGANISATION</div>
     <div className="jh-intro-grid">
       <h2>The student organisation behind the experiences that make <em>campus life move.</em></h2>
       <div><p>JYC is the central student-led layer connecting JIIT 128 communities, events, fests and inter-society activity. It gives students places to discover a skill, find people, lead something and make a memory.</p><button type="button" className="jh-text-link" onClick={()=>nav('/about')}>What is JYC? <span>→</span></button></div>
     </div>
     <div className="jh-word-rail"><span>CLUBS</span><i>×</i><span>EVENTS</span><i>×</i><span>CULTURE</span><i>×</i><span>COMPETITION</span><i>×</i><span>COMMUNITY</span></div>
   </section>

   <section className="jh-dark-section">
     <div className="jh-container">
       <div className="jh-section-head light"><div><div className="jh-section-number">02 / FIND YOUR SPACE</div><h2>Many communities.<br/><em>One campus.</em></h2></div><button type="button" className="jh-text-link light" onClick={()=>nav('/clubs')}>Explore all clubs <span>↗</span></button></div>
       <div className="jh-family-grid">
         {families.slice(0,5).map((group,i)=><article className={'jh-family family-'+i} key={group.family}>
           <button type="button" onClick={()=>nav('/clubs')} className="jh-family-image"><Img src={hubImage(group.hubs[0]?.name,i)} alt={group.family+' communities at JIIT 128'} loading="lazy"/><span>0{i+1}</span></button>
           <div className="jh-family-copy"><span>{group.family}</span><h3>{group.hubs.slice(0,3).map(x=>x.name).join(' · ')}</h3><p>{group.hubs.length} documented communities</p><button type="button" onClick={()=>nav('/clubs')}>Find your space →</button></div>
         </article>)}
       </div>
     </div>
   </section>

   <section className="jh-container jh-events">
     <div className="jh-section-head"><div><div className="jh-section-number">03 / WHAT’S NEXT</div><h2>What’s happening<br/><em>at JYC.</em></h2></div><button type="button" className="jh-text-link" onClick={()=>nav('/events')}>View all events <span>↗</span></button></div>
     {featured ? <div className="jh-featured-event" onClick={()=>nav('/events/'+slug(featured.title))}>
       <div className="jh-event-image"><Img src={eventImage(featured)} alt={featured.title+' event poster'} loading="lazy"/><span>FEATURED EVENT</span></div>
       <div className="jh-event-copy"><p className="jh-event-meta">{dateLabel(featured.date)} · JIIT 128 · {featured.club||'JYC'}</p><h3>{featured.title}</h3><p>{featured.description||'Discover the official event record, schedule and registration information.'}</p><div className="jh-event-details"><span>VENUE <b>{featured.venue||'JIIT 128'}</b></span><span>TIME <b>{featured.start||'TBA'}</b></span></div><button type="button" className="jh-btn jh-btn-primary">View Event <span>↗</span></button></div>
     </div> : <div className="jh-empty">No published upcoming events are currently available.</div>}
     {upcoming.slice(1).length>0&&<div className="jh-event-list">{upcoming.slice(1).map((e,i)=><button type="button" key={e.id||e.title} onClick={()=>nav('/events/'+slug(e.title))}><span>{dateLabel(e.date)}</span><strong>{e.title}</strong><small>{e.club||'JYC'} · {e.venue||'JIIT 128'}</small><b>→</b></button>)}</div>}
   </section>

   <section className="jh-photo-story">
     <div className="jh-container">
       <div className="jh-section-head"><div><div className="jh-section-number">04 / CAMPUS IN MOTION</div><h2>Real people.<br/><em>Real moments.</em></h2></div><button type="button" className="jh-text-link" onClick={()=>nav('/gallery')}>Open gallery <span>↗</span></button></div>
       <div className="jh-photo-grid">
         {photoGallery.slice(0,6).map((g,i)=><button type="button" key={g.id||i} onClick={()=>nav('/gallery')} className={'jh-gallery-tile tile-'+i}><Img src={g.url} alt={g.alt||g.caption||'JYC 128 campus moment'} loading="lazy"/><span>{g.caption||g.title||'JYC 128'}</span></button>)}
       </div>
     </div>
   </section>

   <section className="jh-activities jh-container">
     <div className="jh-section-head"><div><div className="jh-section-number">05 / WHAT JYC MAKES POSSIBLE</div><h2>A campus with<br/><em>room to participate.</em></h2></div><p>From culture and sport to technical communities, performances, workshops and competitions, JYC creates places to take part.</p></div>
     <Suspense fallback={<div className="jh-bento-fallback"/>}><LazyMagicBento items={activities.map((a,i)=>({id:a.id||a.title,title:a.title,description:a.text,label:String(i+1).padStart(2,'0'),image:photoGallery[i%Math.max(1,photoGallery.length)]?.url||FALLBACK,href:a.link||'/clubs'}))} textAutoHide={false} enableStars={false} enableSpotlight enableBorderGlow enableTilt={false} enableMagnetism={false} particleCount={0} spotlightRadius={260} glowColor="168,36,32" clickEffect/></Suspense>
   </section>

   <JYCNowStrip limit={3}/>

   <section className="jh-snapshot jh-container" aria-labelledby="jh-snapshot-title">
     <div className="jh-section-head"><div><div className="jh-section-number">07 / LIVE SNAPSHOT</div><h2 id="jh-snapshot-title">The JYC ecosystem,<br/><em>right now.</em></h2></div><p>Useful, source-backed signals instead of inflated vanity numbers.</p></div>
     <div className="jh-snapshot-grid">
       <article><b>{Object.keys(JYC_HUB_CONTENT).length}</b><span>documented communities</span></article>
       <article><b>{families.length}</b><span>community families</span></article>
       <article><b>{events.length}</b><span>published event records</span></article>
       <article><b>{activities.length}</b><span>ways to participate</span></article>
     </div>
   </section>

   <section className="jh-people jh-container">
     <div className="jh-section-head"><div><div className="jh-section-number">08 / THE PEOPLE</div><h2>The students<br/><em>behind JYC.</em></h2></div><button type="button" className="jh-text-link" onClick={()=>nav('/leadership')}>Meet leadership <span>↗</span></button></div>
     {team.length?<div className="jh-team-row">{team.map((m,i)=><button type="button" key={m.id||i} onClick={()=>nav('/leadership')}><div><Img src={m.photo||m.image} alt={m.name||'JYC team member'} loading="lazy"/></div><span>{m.role||m.position||'JYC Team'}</span><strong>{m.name||'JYC Team Member'}</strong></button>)}</div>:<div className="jh-empty">Official team profiles will appear here when published.</div>}
   </section>

   <section className="jh-social jh-container" aria-labelledby="jh-social-title">
     <div><div className="jh-section-number">09 / FOLLOW JYC</div><h2 id="jh-social-title">Stay close to campus life.</h2><p>Official JYC channels carry live notices and community updates. The website remains the source of truth for published event and club information.</p></div>
     <div className="jh-social-links">
       <a href={JYC_SOCIALS.JYC.instagram} target="_blank" rel="noopener noreferrer"><span>Instagram</span><b>{JYC_SOCIALS.JYC.instagramHandle}</b><i>↗</i></a>
       <a href={JYC_SOCIALS.JYC.official} target="_blank" rel="noopener noreferrer"><span>Official links</span><b>JIIT Youth Club 128</b><i>↗</i></a>
       <a href={JYC_SOCIALS.JYC.linkedin} target="_blank" rel="noopener noreferrer"><span>LinkedIn</span><b>JYC 128</b><i>↗</i></a>
     </div>
   </section>

   <section className="jh-final">
     <div className="jh-container jh-final-grid"><div><div className="jh-section-number">10 / GET INVOLVED</div><h2>Find your place<br/><em>in JIIT 128.</em></h2></div><div><p>Discover a community. Find the next event. Meet the people making campus life happen.</p><div className="jh-actions"><button type="button" className="jh-btn jh-btn-light" onClick={()=>nav('/clubs')}>Explore Clubs <span>↗</span></button><button type="button" className="jh-btn jh-btn-outline-light" onClick={()=>nav('/events')}>See Events <span>→</span></button><button type="button" className="jh-btn jh-btn-outline-light" onClick={()=>nav('/join-jyc')}>Join JYC <span>→</span></button></div></div></div>
   </section>
 </main>;
}
