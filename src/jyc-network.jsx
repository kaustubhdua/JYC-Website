import React,{useEffect,useRef} from 'react';
import './jyc-network.css';

const nodes=[
  {id:'jyc',label:'JYC',x:50,y:18,root:true},
  {id:'clubs',label:'HUBS',x:18,y:48},
  {id:'events',label:'EVENTS',x:50,y:58},
  {id:'people',label:'PEOPLE',x:82,y:48},
  {id:'archive',label:'ARCHIVE',x:50,y:86},
];
const edges=[['jyc','clubs'],['jyc','events'],['jyc','people'],['clubs','events'],['events','people'],['events','archive']];
export function JYCNetwork(){
 const ref=useRef(null);
 useEffect(()=>{const el=ref.current;if(!el)return;const onMove=e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;el.style.setProperty('--nx',String(x*5)+'px');el.style.setProperty('--ny',String(y*5)+'px')};const onLeave=()=>{el.style.setProperty('--nx','0px');el.style.setProperty('--ny','0px')};el.addEventListener('pointermove',onMove);el.addEventListener('pointerleave',onLeave);return()=>{el.removeEventListener('pointermove',onMove);el.removeEventListener('pointerleave',onLeave)}},[]);
 const by=Object.fromEntries(nodes.map(n=>[n.id,n]));
 return <div ref={ref} className="jyc-network" aria-label="JYC relationship network" role="img"><svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">{edges.map(([a,b])=><line key={a+b} x1={by[a].x} y1={by[a].y} x2={by[b].x} y2={by[b].y}/>)}</svg>{nodes.map(n=><span key={n.id} className={'jyc-network-node '+(n.root?'root':'')} style={{left:n.x+'%',top:n.y+'%'}}>{n.label}</span>)}<span className="jyc-network-caption">HOW JYC CONNECTS<br/>COMMUNITIES · EVENTS · PEOPLE · MEMORY</span></div>;
}
