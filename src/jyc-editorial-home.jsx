import React,{useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {JYC_HUB_CONTENT,JYC_HUB_FAMILIES} from './v21-hub-content.js';
import {sourceHubMedia,sourceEventMedia} from './jyc-source-media.js';
import {JYCNowStrip} from './jyc-now.jsx';
import {JYCSpotlight} from './jyc-spotlight.jsx';
import {FlagshipExperience} from './jyc-next-experience.jsx';
import './jyc-editorial-home.css';

const FALLBACK_PHOTO='/assets/hub-photos/jyc-06.webp';

function dateValue(e){
  const raw=String(e?.date||'');
  const t=String(e?.start||'00:00');
  const d=new Date(raw ? raw+'T'+(t.match(/^\d{1,2}:\d{2}/)?.[0]||'00:00') : '');
  return Number.isNaN(d.getTime())?Number.MAX_SAFE_INTEGER:d.getTime();
}
function formatDate(value){
  const d=new Date(String(value||''));
  return Number.isNaN(d.getTime())?'DATE TBA':d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}
function eventMedia(e,index=0){
  if(e?.poster)return e.poster;
  const items=sourceEventMedia(e)?.items||[];
  const photos=items.filter(x=>x?.url&&(x.mediaKind==='photo'||!x.mediaKind));
  return photos[index%Math.max(1,photos.length)]?.url||FALLBACK_PHOTO;
}
function hubMedia(name,index=0){
  const media=sourceHubMedia(name);
  return media?.photos?.[index%Math.max(1,media.photos.length)]||FALLBACK_PHOTO;
}

export function JYCEditorialHome({data}){
  const nav=useNavigate();
  const [activeFamily,setActiveFamily]=React.useState('All');
  const publishedClubs=useMemo(()=>(
    (data?.clubs||[]).filter(c=>c?.published&&c?.status!=='archived')
      .sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')))
  ),[data?.clubs]);
  const upcoming=useMemo(()=>(
    (data?.events||[]).filter(e=>e?.published&&!e?.archived).sort((a,b)=>dateValue(a)-dateValue(b)).slice(0,4)
  ),[data?.events]);
  const gallery=useMemo(()=>(
    (data?.gallery||[]).filter(g=>g?.url).slice(0,12)
  ),[data?.gallery]);
  const familyEntries=JYC_HUB_FAMILIES.map(family=>({
    family,
    hubs:Object.entries(JYC_HUB_CONTENT).filter(([,p])=>p.family===family).map(([name,p])=>({name,...p}))
  }));
  const visibleFamilies=activeFamily==='All'?familyEntries:familyEntries.filter(x=>x.family===activeFamily);
  const team=(data?.team||[]).filter(x=>x?.published===true).slice(0,6);

  return <main className="jyc-editorial-home">
    <section className="jyc-editorial-hero" aria-labelledby="jyc-editorial-title">
      <div className="jyc-editorial-hero-copy">
        <div className="jyc-editorial-kicker"><span>JIIT · SECTOR 128 · NOIDA</span><i/> <b>STUDENT LED</b></div>
        <h1 id="jyc-editorial-title"><span>The campus.</span><span>In motion.</span><em>Together.</em></h1>
        <p>JIIT Youth Club brings communities, events, creativity, technology, sport and campus memories into one student-led ecosystem.</p>
        <div className="jyc-editorial-actions">
          <button className="jyc-editorial-btn" onClick={()=>nav('/clubs')}>Explore communities <span>↗</span></button>
          <button className="jyc-editorial-btn secondary" onClick={()=>nav('/events')}>See what's next <span>→</span></button>
        </div>
        <div className="jyc-editorial-proof"><span><b>01</b> COMMUNITIES</span><span><b>02</b> EXPERIENCES</span><span><b>03</b> MEMORIES</span></div>
      </div>
      <div className="jyc-editorial-hero-media">
        <div className="jyc-editorial-photo-frame">
          <img src={gallery[0]?.url||FALLBACK_PHOTO} alt={gallery[0]?.caption||'JIIT Youth Club campus moment'} fetchPriority="high"/>
          <span className="jyc-editorial-photo-label">JYC / 128 · OFFICIAL ARCHIVE</span>
          <span className="jyc-editorial-photo-index">01</span>
        </div>
        <div className="jyc-editorial-photo-note"><b>REAL PEOPLE.</b><span>REAL CAMPUS MOMENTS.</span></div>
      </div>
    </section>

    {data?.announcement?.on&&data?.announcement?.text&&<section className="jyc-editorial-announcement" aria-label="JYC announcement"><b>JYC NOW</b><p>{data.announcement.text}</p>{data.announcement.link&&<a href={data.announcement.link}>Open ↗</a>}</section>}

    <JYCNowStrip limit={3}/>
    <JYCSpotlight data={data}/>

    <section className="jyc-editorial-section jyc-editorial-families" aria-labelledby="jyc-families-title">
      <div className="jyc-editorial-section-head">
        <div><span className="jyc-editorial-eyebrow">FIND YOUR COMMUNITY</span><h2 id="jyc-families-title">Five families.<br/><em>Twenty-three communities.</em></h2></div>
        <div className="jyc-editorial-head-copy"><p>The supplied JYC orientation material groups the ecosystem into Cultural, Technical, Creative, Literary and Sports communities.</p><button onClick={()=>nav('/clubs')}>Open the full directory →</button></div>
      </div>
      <div className="jyc-editorial-family-tabs" role="tablist" aria-label="JYC community families">
        <button className={activeFamily==='All'?'active':''} onClick={()=>setActiveFamily('All')}>All</button>
        {JYC_HUB_FAMILIES.map(f=><button key={f} className={activeFamily===f?'active':''} onClick={()=>setActiveFamily(f)}>{f}</button>)}
      </div>
      <div className="jyc-editorial-family-grid">
        {visibleFamilies.map((group,index)=><article className="jyc-editorial-family" key={group.family}>
          <div className="jyc-editorial-family-media"><img src={hubMedia(group.hubs[0]?.name,index)} alt={group.family+' JYC community'} loading="lazy"/><span>0{index+1}</span></div>
          <div className="jyc-editorial-family-copy">
            <span className="jyc-editorial-eyebrow">{group.family}</span>
            <h3>{group.hubs.length} communities</h3>
            <p>{group.hubs.slice(0,4).map(x=>x.name).join(' · ')}</p>
            <button onClick={()=>nav('/clubs')}>Explore {group.family} →</button>
          </div>
        </article>)}
      </div>
    </section>

    <section className="jyc-editorial-section jyc-editorial-events" aria-labelledby="jyc-events-title">
      <div className="jyc-editorial-section-head">
        <div><span className="jyc-editorial-eyebrow">WHAT'S NEXT</span><h2 id="jyc-events-title">Events with a reason<br/><em>to show up.</em></h2></div>
        <button className="jyc-editorial-head-link" onClick={()=>nav('/events')}>View all events →</button>
      </div>
      {upcoming.length?<div className="jyc-editorial-event-list">{upcoming.map((event,index)=><button className="jyc-editorial-event" key={event.id||event.title} onClick={()=>nav('/events/'+String(event.title||event.id).toLowerCase().replace(/[^a-z0-9]+/g,'-'))}>
        <span className="event-no">0{index+1}</span>
        <span className="event-date">{formatDate(event.date)}</span>
        <span className="event-photo"><img src={eventMedia(event,index)} alt="" loading="lazy"/></span>
        <span className="event-copy"><small>{event.club||'JYC'} · {event.eventType||'JYC EXPERIENCE'}</small><strong>{event.title}</strong><em>{event.venue||'Venue TBA'}{event.start?' · '+event.start:''}</em></span>
        <span className="event-arrow">↗</span>
      </button>)}</div>:<div className="jyc-editorial-empty">No published upcoming experiences are currently available.</div>}
    </section>

    <FlagshipExperience data={data}/>

    <section className="jyc-editorial-section jyc-editorial-archive" aria-labelledby="jyc-archive-title">
      <div className="jyc-editorial-section-head">
        <div><span className="jyc-editorial-eyebrow">THE LIVING ARCHIVE</span><h2 id="jyc-archive-title">Don't just browse JYC.<br/><em>Remember it.</em></h2></div>
        <div className="jyc-editorial-head-copy"><p>Real photography turns the archive into a record of people, stages, teams, workshops and campus life.</p><button onClick={()=>nav('/gallery')}>Open the full gallery →</button></div>
      </div>
      <div className="jyc-editorial-mosaic">
        {gallery.slice(0,7).map((g,index)=><button key={g.id||index} className={'archive-photo archive-photo-'+index} onClick={()=>nav('/gallery')} aria-label={'Open JYC gallery: '+(g.caption||g.title||'archive photo')}>
          <img src={g.url} alt={g.caption||g.title||'JIIT Youth Club archive photograph'} loading={index<3?'eager':'lazy'}/>
          <span>{g.association||g.title||'JYC Archive'}</span>
        </button>)}
      </div>
    </section>

    <section className="jyc-editorial-section jyc-editorial-people" aria-labelledby="jyc-people-title">
      <div className="jyc-editorial-section-head">
        <div><span className="jyc-editorial-eyebrow">THE PEOPLE</span><h2 id="jyc-people-title">The campus is made<br/><em>by people.</em></h2></div>
        <button className="jyc-editorial-head-link" onClick={()=>nav('/team')}>Meet the team →</button>
      </div>
      <div className="jyc-editorial-people-grid">
        {team.map((member,index)=><article key={member.id||index}><div className="person-photo"><img src={member.photo||member.image||'/jyc-logo-official.webp'} alt={member.name||'JYC team member'} loading="lazy"/></div><div><small>{member.role||member.position||'JYC Team'}</small><h3>{member.name||'JYC Team Member'}</h3></div></article>)}
      </div>
    </section>

    <section className="jyc-editorial-final">
      <div><span className="jyc-editorial-eyebrow">ONE CAMPUS · MANY WAYS TO BELONG</span><h2>Find your people.<br/><em>Make something happen.</em></h2></div>
      <div><p>Explore the communities, events and memories that make JIIT 128 feel like a campus.</p><button className="jyc-editorial-btn" onClick={()=>nav('/clubs')}>Start exploring ↗</button></div>
    </section>
  </main>;
}
