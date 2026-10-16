import React,{useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';

const FEATURED_EVENT_DISMISS_KEY='jyc-featured-jai-2026-dismissed-until';
const FEATURED_EVENT_DISMISS_MS=3*24*60*60*1000;
const EVENT_END=Date.parse('2026-10-31T23:59:59+05:30');
const EVENT_REGISTRATION_DEADLINE=Date.parse('2026-10-10T23:59:00+05:30');
const EVENT_POPUP_DELAY_MS=10000;
const EVENT_PATH='/events/jai-2026-jaypee-agentic-ai-hackathon';
const EVENT={
  title:'JAI 2026 · Jaypee Agentic AI Hackathon',
  dates:'30–31 October 2026',
  venue:'JIIT Wish Town Campus · Sector 128, Noida',
  poster:'/assets/events/jai-2026.webp',
  official:'https://www.jiityouthclub128.in/',
  register:'https://unstop.com/o/XAfa40i?lb=yRvSl6Vl&utm_medium=Share&utm_source=online_coding_challenge&utm_campaign=Jyc128tf6988',
  discord:'https://discord.gg/K6vrFAhMA',
  tracks:['Cybersecurity','Healthcare','Natural Language Processing','Open Innovation']
};

const focusable='a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function FeaturedEventPopup(){
  const onHome=typeof window==='undefined'||window.location.pathname==='/'||window.location.pathname==='';
  const registrationOpen=Date.now()<=EVENT_REGISTRATION_DEADLINE;
  const [open,setOpen]=useState(false);
  const closeRef=useRef(null);
  const dialogRef=useRef(null);
  const triggerRef=useRef(null);
  useEffect(()=>{
    if(!onHome||Date.now()>EVENT_END||!window.matchMedia('(min-width: 761px) and (pointer: fine)').matches)return;
    let cancelled=false;
    const timer=window.setTimeout(()=>{
      if(cancelled)return;
      try{
        if(Number(localStorage.getItem(FEATURED_EVENT_DISMISS_KEY)||0)>=Date.now())return;
      }catch{}
      setOpen(true);
    },EVENT_POPUP_DELAY_MS);
    return()=>{cancelled=true;window.clearTimeout(timer)};
  },[onHome]);

  const dismiss=()=>{
    try{
      const expiry=Date.now()+FEATURED_EVENT_DISMISS_MS;
      if(Number.isSafeInteger(expiry))localStorage.setItem(FEATURED_EVENT_DISMISS_KEY,String(expiry));
    }catch{}
    setOpen(false);
  };

  useEffect(()=>{
    if(!open)return;
    const previousActive=document.activeElement;
    const previousOverflow=document.body.style.overflow;
    const onKey=e=>{
      if(e.key==='Escape'){e.preventDefault();dismiss();return}
      if(e.key!=='Tab')return;
      const nodes=[...dialogRef.current?.querySelectorAll(focusable)||[]];
      if(!nodes.length)return;
      const first=nodes[0],last=nodes[nodes.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    };
    const onMouseDown=e=>{if(e.target===e.currentTarget)dismiss()};
    document.body.style.overflow='hidden';
    document.addEventListener('keydown',onKey);
    const frame=requestAnimationFrame(()=>closeRef.current?.focus());
    return()=>{
      cancelAnimationFrame(frame);
      document.body.style.overflow=previousOverflow;
      document.removeEventListener('keydown',onKey);
      if(previousActive instanceof HTMLElement)previousActive.focus();
    };
  },[open]);

  if(!onHome||Date.now()>EVENT_END||!open)return null;

  return createPortal(<div className="jyc-featured-event-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)dismiss()}}>
    <section ref={dialogRef} className="jyc-featured-event" role="dialog" aria-modal="true" aria-labelledby="jyc-featured-event-title" aria-describedby="jyc-featured-event-description">
      <button ref={closeRef} type="button" className="jyc-featured-event-close" onClick={dismiss} aria-label="Close featured event">×</button>
      <div className="jyc-featured-event-media">
        <img src={EVENT.poster} alt="JAI 2026 official Agentic AI Hackathon artwork" loading="lazy" decoding="async"/>
      </div>
      <div className="jyc-featured-event-copy">
        <span className="eyebrow">FEATURED EVENT · JYC 128</span>
        <h2 id="jyc-featured-event-title">{EVENT.title}</h2>
        <p id="jyc-featured-event-description">Build autonomous agents that reason, use tools, work with APIs and solve real-world challenges across four tracks.</p>
        <div className="jyc-featured-event-meta">
          <span><b>WHEN</b>{EVENT.dates}</span>
          <span><b>WHERE</b>{EVENT.venue}</span>
          <span><b>TEAM</b>2–5 members · inter-college & international</span>
        </div>
        <div className="jyc-featured-track-row">{EVENT.tracks.map(track=><span key={track}>{track}</span>)}</div>
        <div className="jyc-featured-event-actions">
          <a className="btn" href={EVENT_PATH}>View JAI 2026 ↗</a>
          {registrationOpen?<a className="btn secondary" href={EVENT.register} target="_blank" rel="noopener noreferrer">Register on Unstop ↗</a>:<span className="jyc-featured-registration-closed" role="status">Registration closed · deadline passed</span>}
          <a className="btn secondary" href={EVENT.official} target="_blank" rel="noopener noreferrer">Official site ↗</a>
          <a className="jyc-featured-discord" href={EVENT.discord} target="_blank" rel="noopener noreferrer">Join Discord</a>
        </div>
        <p className="jyc-featured-event-note">This announcement is shown periodically to keep flagship event details visible. Registration actions appear only while the verified registration window is open.</p>
      </div>
    </section>
    <style>{`
.jyc-featured-event-overlay{position:fixed;inset:0;z-index:9000;display:grid;place-items:center;pointer-events:auto;padding:18px;background:rgba(16,15,13,.66);backdrop-filter:blur(16px);animation:jycFeaturedIn .24s ease both}.jyc-featured-event{position:relative;pointer-events:auto;display:grid;grid-template-columns:minmax(230px,.78fr) minmax(0,1.22fr);width:min(980px,calc(100vw - 28px));max-height:min(760px,calc(100dvh - 28px));overflow:hidden;overscroll-behavior:contain;border:1px solid rgba(210,180,140,.35);border-radius:28px;background:#fffaf1;color:#171513;box-shadow:0 38px 110px rgba(0,0,0,.34)}html[data-theme="dark"] .jyc-featured-event{background:#161412;color:#f6eee3}.jyc-featured-event-media{min-height:100%;background:#171513;display:grid;place-items:center;overflow:hidden}.jyc-featured-event-media img{width:100%;height:100%;min-height:340px;object-fit:cover}.jyc-featured-event-copy{padding:32px;display:flex;overflow:auto;overscroll-behavior:contain;flex-direction:column;justify-content:center}.jyc-featured-event-copy h2{font-size:clamp(30px,4vw,54px);line-height:1.02;letter-spacing:-.045em;margin:9px 0 13px;max-width:12ch}.jyc-featured-event-copy>p{line-height:1.65;color:#6e655c;max-width:62ch}.jyc-featured-event-meta{display:grid;gap:8px;margin:15px 0}.jyc-featured-event-meta span{display:grid;gap:3px;padding:9px 11px;border:1px solid rgba(23,21,19,.1);border-radius:12px}.jyc-featured-event-meta b{font-size:9px;letter-spacing:.12em;color:#8b683d}.jyc-featured-track-row{display:flex;flex-wrap:wrap;gap:6px;margin:3px 0 16px}.jyc-featured-track-row span{font-size:11px;padding:7px 9px;border:1px solid rgba(164,123,67,.24);border-radius:999px;background:rgba(164,123,67,.07)}.jyc-featured-event-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.jyc-featured-event-actions .btn{min-height:44px}.jyc-featured-discord{display:inline-flex;align-items:center;min-height:44px;padding:0 12px;border:1px solid rgba(23,21,19,.14);border-radius:11px;color:inherit;text-decoration:none}.jyc-featured-event-note{font-size:10px!important;line-height:1.45!important;margin:15px 0 0!important;color:#8a8178!important}.jyc-featured-event-close{position:absolute;right:13px;top:13px;z-index:2;width:44px;height:44px;border:1px solid rgba(23,21,19,.16);border-radius:50%;background:rgba(255,250,241,.9);font-size:24px;color:#171513;cursor:pointer}.jyc-featured-event-close:focus-visible,.jyc-featured-event-actions a:focus-visible{outline:2px solid #8b683d;outline-offset:3px}@keyframes jycFeaturedIn{from{opacity:0;transform:scale(.985)}to{opacity:1;transform:none}}@media(max-width:760px){.jyc-featured-event-overlay{align-items:end;padding:18px 14px 138px}.jyc-featured-event{grid-template-columns:1fr;max-height:calc(100dvh - 154px);border-radius:20px}.jyc-featured-event-media{max-height:240px;min-height:0}.jyc-featured-event-media img{min-height:0;height:240px}.jyc-featured-event-copy{padding:21px}.jyc-featured-event-copy h2{font-size:32px;max-width:none}.jyc-featured-event-actions{display:grid;grid-template-columns:1fr}.jyc-featured-event-actions .btn,.jyc-featured-discord{justify-content:center;width:100%}}@media(prefers-reduced-motion:reduce){.jyc-featured-event-overlay{animation:none}}
`}</style>
  </div>,document.body);
}