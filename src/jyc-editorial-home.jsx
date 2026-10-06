import React,{lazy,Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {JYC_HUB_CONTENT,JYC_HUB_FAMILIES} from './v21-hub-content.js';
import {sourceHubMedia,sourceEventMedia,mergeSourceGallery} from './jyc-source-media.js';
import {JYC_PUBLIC_ACTIVITIES} from './public-v1/config.js';
import {JYC_CONTACTS} from './lib/site-config.js';
import {JYCNowStrip} from './jyc-now.jsx';
import {JYCSpotlight} from './jyc-spotlight.jsx';
import {FlagshipExperience,PhotoChapters} from './jyc-next-experience.jsx';
import CountUp from './components/react-bits/CountUp.jsx';
import './jyc-editorial-home.css';

const LazyDitherVeil=lazy(()=>import('./react-bits/DitherVeil.jsx'));
const LazyFlexCarousel=lazy(()=>import('./components/react-bits/FlexCarousel.jsx'));
const LazyMagicBento=lazy(()=>import('./components/react-bits/MagicBento.jsx'));
const LazyDriftWall=lazy(()=>import('./components/react-bits/DriftWall.jsx'));

const DRIFT_WALL_PRESETS={
 '1':{columns:4,tileWidth:220,tileHeight:140,gap:16,tilt:8,turn:-6,perspective:1250,depth:60,speed:2.4,direction:'up',variance:.1,parallax:.08,lift:20,fade:.62,dim:.52},
 '2':{columns:3,tileWidth:250,tileHeight:160,gap:20,tilt:12,turn:7,perspective:1350,depth:90,speed:1.8,direction:'down',variance:.18,parallax:.06,lift:28,fade:.52,dim:.48},
 '4':{columns:5,tileWidth:190,tileHeight:126,gap:12,tilt:6,turn:-10,perspective:1200,depth:45,speed:3.1,direction:'up',variance:.08,parallax:.1,lift:18,fade:.68,dim:.58}
};

function ViewportDeferred({children,fallback,rootMargin='700px'}){
 const ref=useRef(null);
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  if(ready||!ref.current)return;
  const node=ref.current;
  if(!('IntersectionObserver' in window)){setReady(true);return}
  const io=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setReady(true);io.disconnect()}},{rootMargin});
  io.observe(node);
  return()=>io.disconnect();
 },[ready,rootMargin]);
 return <div ref={ref} className="jyc-deferred-surface">{ready?children:fallback}</div>;
}

const FALLBACK_PHOTO='/assets/hub-photos/jyc-06.webp';
const TEAM_PHOTOS={
 'devansh tripathi':'/assets/team/campaign/devansh-tripathi.webp',
 'amrit kumar':'/assets/team/campaign/amrit-kumar.webp',
 'daksh sachdeva':'/assets/team/campaign/daksh-sachdeva.webp',
 'saksham kotia':'/assets/team/campaign/saksham-kotia.webp',
 'asmi srivastava':'/assets/team/campaign/asmi-srivastava.webp',
 'juhi hatuka':'/assets/team/campaign/juhi-hatuka.webp',
 'pratik kumar':'/assets/team/campaign/pratik-kumar.webp',
 'divye bajaj':'/assets/team/divye-bajaj.webp',
 'revant srivastava':'/assets/team/campaign/revant-srivastava.webp',
 'aradhyaa singh':'/assets/team/campaign/aradhyaa-singh.webp',
 'vansh mahajan':'/assets/team/campaign/vansh-mahajan.webp',
 'shriya singh':'/assets/team/campaign/shriya-singh.webp'
};

const slug=value=>String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const mediaUrl=item=>item?.url||item?.src||item?.image||item?.imageUrl||'';

function dateValue(e){
 const raw=String(e?.date||'');
 const t=String(e?.start||'00:00').match(/^\d{1,2}:\d{2}/)?.[0]||'00:00';
 const d=new Date(raw?raw+'T'+t:'');
 return Number.isNaN(d.getTime())?Number.MAX_SAFE_INTEGER:d.getTime();
}
function formatDate(value){
 const d=new Date(String(value||''));
 return Number.isNaN(d.getTime())?'DATE TBA':d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}
function eventStatus(event){
 if(event?.archived)return {label:'Completed',tone:'muted'};
 const start=event?.date?Date.parse(event.date+'T'+(event.start||'00:00')):NaN;
 const endDate=event?.dateEnd||event?.date;
 const end=endDate?Date.parse(endDate+'T'+(event.end||'23:59')):NaN;
 const now=Date.now();
 if(Number.isFinite(start)&&Number.isFinite(end)){
  if(now>=start&&now<=end)return {label:'Ongoing',tone:'live'};
  if(now>end)return {label:'Completed',tone:'muted'};
 }
 if(event?.registrationUrl||event?.registrationMode==='native')return {label:'Registration Open',tone:'open'};
 return {label:'Coming Soon',tone:'soon'};
}
function eventMedia(event,index=0){
 if(event?.poster)return event.poster;
 const items=sourceEventMedia(event)?.items||[];
 const photos=items.filter(x=>x?.url&&(x.mediaKind==='photo'||!x.mediaKind));
 return photos[index%Math.max(1,photos.length)]?.url||FALLBACK_PHOTO;
}
function hubMedia(name,index=0){
 const media=sourceHubMedia(name);
 return media?.photos?.[index%Math.max(1,media.photos.length)]||FALLBACK_PHOTO;
}
function externalUrl(value){
 const raw=String(value||'').trim();
 if(!raw)return '';
 try{
  const u=new URL(raw,window.location.origin);
  return ['http:','https:'].includes(u.protocol)?u.href:'';
 }catch{return ''}
}
function activityPhoto(activity,index,gallery){
 const family=JYC_HUB_FAMILIES.find(x=>String(activity?.title||'').toLowerCase()===String(x).toLowerCase());
 if(family){
  const first=Object.entries(JYC_HUB_CONTENT).find(([,p])=>p.family===family);
  if(first)return hubMedia(first[0],index);
 }
 return gallery[index%Math.max(1,gallery.length)]?.url||FALLBACK_PHOTO;
}

export function JYCEditorialHome({data}){
 const nav=useNavigate();
 const [activeFamily,setActiveFamily]=useState('All');
 const [driftPreset,setDriftPreset]=useState('1');
 const publishedClubs=useMemo(()=>(
  (data?.clubs||[]).filter(c=>c?.published&&c?.status!=='archived')
   .sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')))
 ),[data?.clubs]);
 const upcoming=useMemo(()=>(
  (data?.events||[]).filter(e=>e?.published&&!e?.archived).sort((a,b)=>dateValue(a)-dateValue(b)).slice(0,4)
 ),[data?.events]);
 const allPublishedEvents=useMemo(()=>(
  (data?.events||[]).filter(e=>e?.published&&!e?.archived)
 ),[data?.events]);
 const gallery=useMemo(()=>(
  mergeSourceGallery(data?.gallery||[]).filter(g=>g?.url)
 ),[data?.gallery]);
 const team=(data?.team||[]).filter(x=>x?.published===true).slice(0,6);
 const driftItems=useMemo(()=>gallery.slice(0,18).map((g,index)=>({id:g.id||index,image:g.url,title:[g.caption||g.title||'JYC archive',g.association,g.year].filter(Boolean).join(' · '),alt:g.alt||g.caption||g.title||'JYC archive image'})),[gallery]);
 const drift=DRIFT_WALL_PRESETS[driftPreset]||DRIFT_WALL_PRESETS['1'];
 const familyEntries=JYC_HUB_FAMILIES.map(family=>({
  family,
  hubs:Object.entries(JYC_HUB_CONTENT).filter(([,p])=>p.family===family).map(([name,p])=>({name,...p}))
 }));
 const visibleFamilies=activeFamily==='All'?familyEntries:familyEntries.filter(x=>x.family===activeFamily);
 const activities=JYC_PUBLIC_ACTIVITIES;
 const updates=useMemo(()=>{
  const rows=[];
  if(data?.announcement?.on&&data?.announcement?.text){
   rows.push({kind:'Notice',title:'JYC announcement',text:data.announcement.text,link:data.announcement.link||'/announcements'});
  }
  allPublishedEvents.slice(0,5).forEach(event=>{
   const status=eventStatus(event);
   if(status.label==='Completed')return;
   rows.push({
    kind:status.label,
    title:event.title,
    text:[formatDate(event.date),event.start||'Time TBA',event.venue||'Venue TBA'].join(' · '),
    link:'/events/'+slug(event.title)
   });
  });
  return rows.slice(0,4);
 },[allPublishedEvents,data?.announcement]);

 const stats=[
  {value:publishedClubs.length||Object.keys(JYC_HUB_CONTENT).length,label:'Published communities'},
  {value:JYC_HUB_FAMILIES.length,label:'Community families'},
  {value:allPublishedEvents.length,label:'Published events'},
  {value:data?.team?.filter(m=>m?.published===true).length||0,label:'Published team profiles'}
 ];

 return <main className="jyc-editorial-home">
  <section id="hero" className="jyc-v1-hero" aria-labelledby="jyc-v1-title">
   <div className="jyc-v1-hero-copy">
    <div className="jyc-v1-brand-row">
     <img src="/jyc-logo-official.webp" alt="JIIT Youth Club 128" className="jyc-v1-logo" onError={e=>{e.currentTarget.src='/jyc-logo-circle.png'}}/>
     <div><b>JIIT YOUTH CLUB 128</b><span>JIIT WISH TOWN CAMPUS · SECTOR 128 · NOIDA</span></div>
    </div>
    <span className="jyc-v1-kicker">STUDENT-LED · CAMPUS COMMUNITY</span>
    <h1 id="jyc-v1-title"><span>The Voice.</span><span>The Talent.</span><em>The Spirit of JIIT.</em></h1>
    <p>JYC is the student-led coordinating body that brings communities, events, creativity, technology, sport and campus experiences together at JIIT 128.</p>
    <div className="jyc-v1-actions">
     <button className="jyc-v1-btn primary" onClick={()=>nav('/events')}>Explore Events <span>↗</span></button>
     <button className="jyc-v1-btn" onClick={()=>nav('/join-jyc')}>Join JYC / Get Involved <span>→</span></button>
     <button className="jyc-v1-text-btn" onClick={()=>nav('/clubs')}>View Clubs ↗</button>
    </div>
    <div className="jyc-v1-proof"><span><b>01</b> VOICE</span><span><b>02</b> TALENT</span><span><b>03</b> SPIRIT</span></div>
   </div>
   <div className="jyc-v1-hero-media">
    <div className="jyc-v1-hero-dither" aria-label="JYC official logo interactive dither reveal">
     <Suspense fallback={<div className="jyc-v1-dither-fallback"><img src="/jyc-logo-official.webp" alt="JIIT Youth Club 128" fetchPriority="high"/></div>}>
      <LazyDitherVeil src="/jyc-logo-official.webp" fit="contain" pattern="floyd" pixelSize={2} levels={2} palette="duotone" inkColor="#101a2d" paperColor="#f4f1e6" contrast={1.15} revealRadius={180} softness={0.6} linger={1} rim={0} clickBurst wander={false}/>
     </Suspense>
     <span className="jyc-v1-photo-credit">JYC 128 · OFFICIAL IDENTITY</span>
     <span className="jyc-v1-photo-index">01 / IDENTITY</span>
    </div>
    <div className="jyc-v1-photo-caption"><b>ONE CLUB.</b><span>ONE CAMPUS. MANY VOICES.</span></div>
   </div>
  </section>

  <section className="jyc-v1-stat-strip" aria-label="JYC at a glance">
   {stats.map((s,i)=><article key={s.label}><span>0{i+1}</span><strong><CountUp to={Number(s.value)||0} separator="," duration={1.2}/></strong><small>{s.label}</small></article>)}
  </section>

  {data?.announcement?.on&&data?.announcement?.text&&<section className="jyc-v1-live-notice" aria-label="JYC announcement"><b>JYC NOW</b><p>{data.announcement.text}</p>{data.announcement.link&&<a href={externalUrl(data.announcement.link)||data.announcement.link}>Open ↗</a>}</section>}

  <JYCNowStrip limit={3}/>
  <JYCSpotlight data={data}/>

  <section id="events" className="jyc-v1-section jyc-v1-featured-events editorial-reveal" aria-labelledby="jyc-featured-events-title">
   <div className="jyc-v1-section-head">
    <div><span className="jyc-v1-eyebrow">FEATURED / UPCOMING EVENTS</span><h2 id="jyc-featured-events-title">What’s happening<br/><em>at JYC.</em></h2><p>Find the next experiences, see who is organising them and move directly to the official event record.</p></div>
    <button className="jyc-v1-link" onClick={()=>nav('/events')}>View all events →</button>
   </div>
   {upcoming.length?<div className="jyc-v1-event-grid">{upcoming.map((event,index)=>{
    const status=eventStatus(event);
    const registration=externalUrl(event.registrationUrl);
    return <article className="jyc-v1-event-card" key={event.id||event.title}>
     <button className="jyc-v1-event-main" onClick={()=>nav('/events/'+slug(event.title))} aria-label={'View '+event.title}>
      <div className="jyc-v1-event-image"><img src={eventMedia(event,index)} alt="" loading="lazy"/><span>0{index+1}</span></div>
      <div className="jyc-v1-event-body">
       <div className="jyc-v1-event-meta"><span>{event.eventType||'JYC EXPERIENCE'}</span><b className={'status-'+status.tone}>{status.label}</b></div>
       <h3>{event.title}</h3>
       <p>{event.description||'Explore the official JYC event record.'}</p>
       <dl><div><dt>DATE & TIME</dt><dd>{formatDate(event.date)} · {event.start||'Time TBA'}</dd></div><div><dt>VENUE</dt><dd>{event.venue||'Venue TBA'}</dd></div><div><dt>ORGANISED BY</dt><dd>{event.club||'JYC'}</dd></div></dl>
      </div>
     </button>
     <div className="jyc-v1-event-footer">
      <button onClick={()=>nav('/events/'+slug(event.title))}>View event →</button>
      {registration?<a href={registration} target="_blank" rel="noopener noreferrer">Register Now ↗</a>:<button onClick={()=>nav('/events/'+slug(event.title))}>{status.label==='Coming Soon'?'Details →':'Open record →'}</button>}
     </div>
    </article>
   })}</div>:<div className="jyc-v1-empty">No published upcoming events are currently available.</div>}
  </section>

  <section id="about" className="jyc-v1-section jyc-v1-about editorial-reveal" aria-labelledby="jyc-v1-about-title">
   <div className="jyc-v1-about-mark"><img src="/jyc-logo-official.webp" alt="JYC 128"/></div>
   <div><span className="jyc-v1-eyebrow">ABOUT JYC</span><h2 id="jyc-v1-about-title">A student-governed organisation with room to <em>participate, create, lead and belong.</em></h2><p>JYC gives students a platform to display their talents, organises inter- and intra-institutional activities, and helps first-year students acclimatise to campus life.</p><button className="jyc-v1-link" onClick={()=>nav('/about')}>Read about JYC →</button></div>
  </section>

  <section id="clubs" className="jyc-v1-section jyc-v1-families editorial-reveal" aria-labelledby="jyc-v1-families-title">
   <div className="jyc-v1-section-head">
    <div><span className="jyc-v1-eyebrow">CLUBS & COMMUNITIES</span><h2 id="jyc-v1-families-title">Find your <em>community.</em></h2><p>Explore the five community families documented in the JYC orientation material.</p></div>
    <button className="jyc-v1-link" onClick={()=>nav('/clubs')}>View full directory →</button>
   </div>
   <div className="jyc-v1-family-tabs" role="tablist" aria-label="JYC community families">
    <button role="tab" aria-selected={activeFamily==='All'} className={activeFamily==='All'?'active':''} onClick={()=>setActiveFamily('All')}>All</button>
    {JYC_HUB_FAMILIES.map(f=><button role="tab" aria-selected={activeFamily===f} key={f} className={activeFamily===f?'active':''} onClick={()=>setActiveFamily(f)}>{f}</button>)}
   </div>
   <div className="jyc-v1-family-grid">{visibleFamilies.map((group,index)=><article className="jyc-v1-family-card" key={group.family}>
    <button onClick={()=>nav('/clubs')} className="jyc-v1-family-media"><img src={hubMedia(group.hubs[0]?.name,index)} alt={group.family+' JYC community'} loading="lazy"/><span>0{index+1}</span></button>
    <div className="jyc-v1-family-copy"><span className="jyc-v1-eyebrow">{group.family}</span><h3>{group.hubs.length} communities</h3><p>{group.hubs.slice(0,4).map(x=>x.name).join(' · ')}</p><button onClick={()=>nav('/clubs')}>Explore {group.family} →</button></div>
   </article>)}</div>
  </section>

  <section id="activities" className="jyc-v1-section jyc-v1-activities editorial-reveal" aria-labelledby="jyc-v1-activities-title">
   <div className="jyc-v1-section-head">
    <div><span className="jyc-v1-eyebrow">WHAT JYC DOES</span><h2 id="jyc-v1-activities-title">More than clubs.<br/><em>A campus in motion.</em></h2></div>
    <p className="jyc-v1-head-note">From culture and sport to technical communities, outreach, workshops and competitions, JYC creates places for students to participate.</p>
   </div>
   <ViewportDeferred fallback={<div className="magic-bento-loading" aria-hidden="true"/>}><Suspense fallback={<div className="magic-bento-loading" aria-hidden="true"/>}><LazyMagicBento items={activities.map((activity,index)=>({id:activity.id||activity.title,title:activity.title,description:activity.text,label:`0${index+1}`,image:activityPhoto(activity,index,gallery),href:activity.link||'/clubs'}))} textAutoHide={false} enableStars={true} enableSpotlight={true} enableBorderGlow={true} enableTilt={false} enableMagnetism={false} particleCount={5} spotlightRadius={300} glowColor="191,156,111" clickEffect={true}/></Suspense></ViewportDeferred>
  </section>

  <section className="jyc-v1-section jyc-v1-updates editorial-reveal" aria-labelledby="jyc-v1-updates-title">
   <div className="jyc-v1-section-head">
    <div><span className="jyc-v1-eyebrow">LATEST UPDATES</span><h2 id="jyc-v1-updates-title">Know what needs<br/><em>your attention.</em></h2></div>
    <button className="jyc-v1-link" onClick={()=>nav('/announcements')}>View announcements →</button>
   </div>
   {updates.length?<div className="jyc-v1-update-list">{updates.map((item,index)=><button key={item.title+index} onClick={()=>nav(item.link?.startsWith('/')?item.link:'/announcements')}><span>{String(index+1).padStart(2,'0')}</span><small>{item.kind}</small><strong>{item.title}</strong><p>{item.text}</p><b>Open →</b></button>)}</div>:<div className="jyc-v1-empty">No new public announcements are currently published.</div>}
  </section>

  <FlagshipExperience data={data}/>

  <section className="jyc-v1-section jyc-v1-drift editorial-reveal" aria-labelledby="jyc-v1-drift-title">
   <div className="jyc-v1-section-head">
    <div><span className="jyc-v1-eyebrow">VISUAL RHYTHM · DRIFT WALL</span><h2 id="jyc-v1-drift-title">JYC, <em>in motion.</em></h2><p>Three restrained DriftWall treatments keep the homepage visual, source-backed and interactive without running multiple animation engines at once.</p></div>
    <div className="jyc-v1-drift-presets" role="tablist" aria-label="DriftWall presentation presets">{['1','2','4'].map(p=><button key={p} type="button" role="tab" aria-selected={driftPreset===p} className={driftPreset===p?'active':''} onClick={()=>setDriftPreset(p)}>DRIFT {p.padStart(2,'0')}</button>)}</div>
   </div>
   {driftItems.length?<ViewportDeferred fallback={<div className="drift-wall-home-loading" aria-hidden="true"/>}><Suspense fallback={<div className="drift-wall-home-loading" aria-hidden="true"/>}><LazyDriftWall items={driftItems} {...drift} ariaLabel={`JYC homepage DriftWall preset ${driftPreset}`} pauseOnHover /></Suspense></ViewportDeferred>:<div className="jyc-v1-empty">The visual archive is ready for published JYC photography.</div>}
   <div className="jyc-v1-drift-note"><span><strong>{driftItems.length}</strong> source-backed frames available</span><button className="jyc-v1-link" type="button" onClick={()=>nav('/gallery')}>Open full gallery →</button></div>
  </section>

  <section id="gallery" className="jyc-v1-section jyc-v1-gallery editorial-reveal" aria-labelledby="jyc-v1-gallery-title">
   <div className="jyc-v1-section-head">
    <div><span className="jyc-v1-eyebrow">VISUAL ARCHIVE · GALLERY</span><h2 id="jyc-v1-gallery-title">The JYC archive,<br/><em>always in motion.</em></h2><p>Move through a curated set of published JYC photographs. The depth stack keeps the archive visual, tactile and easy to scan; the full Gallery holds the complete metadata record.</p></div>
    <button className="jyc-v1-link" onClick={()=>nav('/gallery')}>Browse full archive →</button>
   </div>
   {gallery.length?<ViewportDeferred fallback={<div className="flex-carousel flex-carousel--loading" aria-hidden="true"/>}><Suspense fallback={<div className="flex-carousel flex-carousel--loading" aria-hidden="true"/>}><LazyFlexCarousel items={gallery.slice(0,12).map((g,index)=>({id:g.id||index,src:g.url,alt:[g.caption||g.title||'JYC archive',g.association,g.year].filter(Boolean).join(' · '),title:g.caption||g.title||'JYC archive',subtitle:[g.association,g.year].filter(Boolean).join(' · ')}))} preset="liquid" intro="rise" fit="portrait" cardHeight={.64} gap={14} radius={8} squeeze={.18} focusOnClick captions captureWheel/></Suspense></ViewportDeferred>:<div className="jyc-v1-empty">The visual archive is ready for published JYC photography. Open the full Gallery to explore the source collections.</div>}<div className="jyc-v1-gallery-wall-note"><strong>{gallery.length} published frames</strong><span>FlexCarousel is the homepage visual preview · full metadata, filters and lightbox live in the Gallery.</span></div>
  </section>

  <PhotoChapters/>

  <section id="team" className="jyc-v1-section jyc-v1-team editorial-reveal" aria-labelledby="jyc-v1-team-title">
   <div className="jyc-v1-section-head"><div><span className="jyc-v1-eyebrow">LEADERSHIP</span><h2 id="jyc-v1-team-title">Meet the people<br/><em>behind JYC.</em></h2><p>Faculty guidance, student leadership and core responsibilities form the people layer behind the ecosystem.</p></div><button className="jyc-v1-link" onClick={()=>nav('/team')}>Meet the full team →</button></div>
   <div className="jyc-v1-team-grid">{team.length?team.map((member,index)=><button key={member.id||index} className="jyc-v1-person" onClick={()=>nav('/team')}><div><img src={member.photo||member.image||TEAM_PHOTOS[String(member.name||'').trim().toLowerCase()]||'/jyc-logo-official.webp'} alt={member.name||'JYC team member'} loading="lazy"/></div><small>{member.role||member.position||'JYC Team'}</small><strong>{member.name||'JYC Team Member'}</strong></button>):<div className="jyc-v1-empty">Official team profiles will appear here when JYC publishes them.</div>}</div>
  </section>

  <section id="achievements" className="jyc-v1-achievements editorial-reveal" aria-labelledby="jyc-v1-achievements-title">
   <div><span className="jyc-v1-eyebrow">ACHIEVEMENTS · WALL OF FAME</span><h2 id="jyc-v1-achievements-title">Built by students.<br/><em>Remembered by campus.</em></h2><p>Published achievements and milestones stay source-first. The public record currently includes an SIH Finalist achievement from supplied JYC material.</p><div className="jyc-v1-achievements-actions"><button className="jyc-v1-btn primary" onClick={()=>nav('/achievements')}>View achievements →</button><button className="jyc-v1-btn" onClick={()=>nav('/archive')}>Open archive</button></div></div>
   <div className="jyc-v1-achievements-card"><span>01 · WALL OF FAME</span><strong>SIH Finalist</strong><p>Recorded in the supplied JYC hub material. New outcomes should be published with their event, year and supporting source.</p></div>
  </section>

  <section className="jyc-v1-social editorial-reveal" aria-labelledby="jyc-v1-social-title">
   <div><span className="jyc-v1-eyebrow">FOLLOW JYC</span><h2 id="jyc-v1-social-title">The website is the source of truth.<br/><em>Social keeps you close.</em></h2><p>Follow official channels for timely updates without making the website dependent on a social feed.</p></div>
   <div className="jyc-v1-social-links">
    <a href={JYC_CONTACTS.instagram} target="_blank" rel="noopener noreferrer"><span>01</span><strong>Instagram</strong><small>@jiityouthclub ↗</small></a>
    <a href={JYC_CONTACTS.linkedin} target="_blank" rel="noopener noreferrer"><span>02</span><strong>LinkedIn</strong><small>JIIT Youth Club ↗</small></a>
    <a href={JYC_CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer"><span>03</span><strong>WhatsApp</strong><small>JYC Community ↗</small></a>
   </div>
  </section>

  <section className="jyc-v1-final">
   <div><span className="jyc-v1-eyebrow">JYC 128 · OFFICIAL PUBLIC WEBSITE</span><h2>Different roles.<br/><em>Different communities.<br/>One JYC.</em></h2></div>
   <div><p>Explore the organisation, find a community, see what is happening and keep the campus memories close.</p><div className="jyc-v1-final-actions"><button className="jyc-v1-btn light" onClick={()=>nav('/clubs')}>View Clubs →</button><button className="jyc-v1-btn outline-light" onClick={()=>nav('/join-jyc')}>Join JYC · Coming Soon</button><button className="jyc-v1-text-btn light-text" onClick={()=>nav('/contact')}>Contact JYC ↗</button></div></div>
  </section>
 </main>;
}
