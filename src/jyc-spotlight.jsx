import React,{useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {PDF_HUB_STORIES} from './pdf-hub-content.js';

const slug=value=>String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const mediaUrl=item=>item?.url||item?.src||item?.image||item?.imageUrl||'';
const photoKey=value=>String(value||'').trim().split(/[?#]/,1)[0].toLowerCase();

const photoFor=(gallery,clubName,event)=>{
  const rows=Array.isArray(gallery)?gallery:[];
  const eventId=String(event?.id||'');
  const eventTitle=String(event?.title||'').toLowerCase();
  const club=String(clubName||'').toLowerCase();
  return mediaUrl(rows.find(g=>String(g.eventId||'')===eventId))
    || mediaUrl(rows.find(g=>{
      const hay=String(g.association||g.caption||'').toLowerCase();
      return (club&&hay.includes(club))||(eventTitle&&hay.includes(eventTitle));
    }))
    || mediaUrl(rows.find(g=>g.url||g.src||g.image||g.imageUrl))
    || PDF_HUB_STORIES.find(s=>String(s.name||'').toLowerCase()===club)?.image
    || '';
};

export function JYCSpotlight({data}){
  const nav=useNavigate();
  const clubs=useMemo(()=>Array.isArray(data?.clubs)?data.clubs.filter(c=>c?.published&&c?.status!=='archived'):[],[data?.clubs]);
  const events=useMemo(()=>Array.isArray(data?.events)?data.events.filter(e=>e?.published&&!e?.archived):[],[data?.events]);
  const gallery=Array.isArray(data?.gallery)?data.gallery:[];
  const spotlight=useMemo(()=>{
    const live=events.find(e=>String(e.publicStatus||'').toLowerCase()==='live');
    const today=new Date(); today.setHours(0,0,0,0);
    const upcoming=events.filter(e=>{const d=e?.date?new Date(`${e.date}T23:59:59`):null;return d&&!Number.isNaN(d.getTime())&&d>=today;});
    const next=[...upcoming].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.start||'').localeCompare(String(b.start||'')))[0];
    const event=live||next||null;
    const eventClub=event?.clubId?clubs.find(c=>String(c.id)===String(event.clubId)):clubs.find(c=>String(c.name||'').toLowerCase()===String(event?.club||'').toLowerCase());
    const community=eventClub||clubs.find(c=>c.pinned)||clubs[0]||null;
    const communityPhoto=photoFor(gallery,community?.name,event);
    const communityPhotoKey=photoKey(communityPhoto);
    const eventPosterKey=photoKey(event?.poster);
    const archiveCandidates=gallery.filter(g=>{
      const url=mediaUrl(g),key=photoKey(url);
      return url&&key&&key!==communityPhotoKey&&key!==eventPosterKey;
    });
    const archive=archiveCandidates.find(g=>event?.id&&String(g.eventId||'')===String(event.id))||archiveCandidates[0]||null;
    return {event,community,communityPhoto,archive};
  },[clubs,events,gallery]);

  if(!spotlight.event&&!spotlight.community&&!spotlight.archive)return null;

  return <section className="section jyc-living-spotlight reveal" aria-labelledby="jyc-living-spotlight-title">
    <div className="jyc-living-spotlight-head">
      <div>
        <span className="eyebrow">JYC SPOTLIGHT · LIVE ECOSYSTEM</span>
        <h2 id="jyc-living-spotlight-title">One community. One experience. One moment.</h2>
        <p>This window changes with the public JYC record — connecting the next event, the community behind it and the photography that gives the ecosystem a memory.</p>
      </div>
      <button className="reference-view-all" type="button" onClick={()=>nav('/updates')}>Open JYC Now →</button>
    </div>
    <div className="jyc-living-spotlight-grid">
      <button type="button" className="jyc-living-spotlight-card is-event" onClick={()=>spotlight.event&&nav('/events/'+slug(spotlight.event.slug||spotlight.event.title))}>
        <div className="jyc-living-spotlight-media">
          {spotlight.event?.poster?<img src={spotlight.event.poster} alt="" loading="lazy"/>:<div className="jyc-living-spotlight-fallback">NOW</div>}
          <span>01 · NEXT EXPERIENCE</span>
        </div>
        <div className="jyc-living-spotlight-copy">
          <small>{spotlight.event?.eventType||'JYC EXPERIENCE'}</small>
          <h3>{spotlight.event?.title||'The next JYC experience'}</h3>
          <p>{spotlight.event?.description||'Explore the latest published JYC experience.'}</p>
          <b>Open event ↗</b>
        </div>
      </button>
      <button type="button" className="jyc-living-spotlight-card" onClick={()=>spotlight.community&&nav('/clubs/'+slug(spotlight.community.name))}>
        <div className="jyc-living-spotlight-media">
          {spotlight.communityPhoto?<img src={spotlight.communityPhoto} alt="" loading="lazy"/>:<div className="jyc-living-spotlight-fallback">{String(spotlight.community?.name||'JYC').slice(0,2).toUpperCase()}</div>}
          <span>02 · COMMUNITY</span>
        </div>
        <div className="jyc-living-spotlight-copy">
          <small>{spotlight.community?.category||spotlight.community?.type||'JYC COMMUNITY'}</small>
          <h3>{spotlight.community?.name||'JYC community'}</h3>
          <p>{spotlight.community?.description||spotlight.community?.about||'Discover the people and work behind the experience.'}</p>
          <b>Explore community →</b>
        </div>
      </button>
      <button type="button" className="jyc-living-spotlight-card is-photo" onClick={()=>nav('/gallery')}>
        <div className="jyc-living-spotlight-media">
          {mediaUrl(spotlight.archive)?<img src={mediaUrl(spotlight.archive)} alt="" loading="lazy"/>:<div className="jyc-living-spotlight-fallback">ARCHIVE</div>}
          <span>03 · VISUAL MEMORY</span>
        </div>
        <div className="jyc-living-spotlight-copy">
          <small>JYC PHOTO ARCHIVE</small>
          <h3>From the campus, not a template.</h3>
          <p>Published photography keeps the living ecosystem connected to the moments students actually created.</p>
          <b>Enter the archive →</b>
        </div>
      </button>
    </div>
  </section>;
}
