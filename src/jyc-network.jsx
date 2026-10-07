import React,{useMemo,useState} from 'react';
import {useNavigate} from 'react-router-dom';

export function JYCNetwork({data}){
 const nav=useNavigate();
 const [active,setActive]=useState('JYC');
 const families=Array.isArray(data?.clubs)?[...new Set(data.clubs.filter(c=>c?.published&&c.status!=='archived').map(c=>c.family||c.category).filter(Boolean))].slice(0,5):[];
 const events=(data?.events||[]).filter(e=>e?.published&&!e?.archived).slice(0,4);
 const people=(data?.team||[]).filter(m=>m?.published===true).slice(0,4);
 const groups=useMemo(()=>[
  {id:'communities',label:'COMMUNITIES',items:(families.length?families:['CULTURAL','TECHNICAL','LITERARY','CREATIVE','SPORTS']).map((x,i)=>({id:'f'+i,label:x,href:'/clubs'}))},
  {id:'events',label:'EVENTS',items:(events.length?events:[{title:'JYC EVENTS'}]).map((x,i)=>({id:'e'+i,label:x.title||'JYC EVENT',href:x.title?'/events/'+String(x.title).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''):'/events'}))},
  {id:'people',label:'PEOPLE',items:(people.length?people:[{name:'JYC LEADERSHIP'}]).map((x,i)=>({id:'p'+i,label:x.name||'JYC PEOPLE',href:'/leadership'}))}
 ],[families,events,people]);
 return <section className="jyc-network editorial-reveal" aria-labelledby="jyc-network-title">
  <div className="jh-container">
   <div className="jyc-network-head"><div><div className="jh-section-number">06 / THE JYC NETWORK</div><h2 id="jyc-network-title">Everything connects<br/><em>back to people.</em></h2></div><p>JYC is not a collection of isolated pages. Communities create events, people lead them, and the archive keeps the moments.</p></div>
   <div className="jyc-network-map">
    <div className="jyc-network-lines" aria-hidden="true"><span className="line l1"/><span className="line l2"/><span className="line l3"/><span className="line l4"/><span className="line l5"/><span className="line l6"/></div>
    <button type="button" className="jyc-network-core" onClick={()=>nav('/about')} onMouseEnter={()=>setActive('JYC')}><span>JYC</span><small>JIIT · 128</small></button>
    {groups.map(group=><div className={'jyc-network-group '+group.id} key={group.id}><span className="jyc-network-label">{group.label}</span>{group.items.slice(0,4).map(item=><button type="button" key={item.id} className={active===item.id?'is-active':''} onMouseEnter={()=>setActive(item.id)} onFocus={()=>setActive(item.id)} onClick={()=>nav(item.href)}><b>{item.label}</b><span>↗</span></button>)}</div>)}
    <div className="jyc-network-note"><span className="jh-section-number">EXPLORE THE RELATIONSHIPS</span><strong>{families.length||5} families · {events.length} events · {people.length} published people</strong></div>
   </div>
  </div>
 </section>;
}