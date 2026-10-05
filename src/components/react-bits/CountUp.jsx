'use client';
import {useInView,useMotionValue,useSpring} from 'motion/react';
import {useCallback,useEffect,useRef} from 'react';
import './CountUp.css';
export default function CountUp({to,from=0,direction='up',delay=0,duration=1.4,className='',startWhen=true,separator='',onStart,onEnd}){
 const ref=useRef(null); const motionValue=useMotionValue(direction==='down'?to:from);
 const damping=20+40*(1/duration); const stiffness=100*(1/duration);
 const springValue=useSpring(motionValue,{damping,stiffness}); const isInView=useInView(ref,{once:true,margin:'0px'});
 const decimals=n=>{const s=String(n);if(!s.includes('.'))return 0;const d=s.split('.')[1];return parseInt(d,10)!==0?d.length:0};
 const maxDecimals=Math.max(decimals(from),decimals(to));
 const formatValue=useCallback(latest=>{const has=maxDecimals>0;const formatted=new Intl.NumberFormat('en-US',{useGrouping:Boolean(separator),minimumFractionDigits:has?maxDecimals:0,maximumFractionDigits:has?maxDecimals:0}).format(latest);return separator?formatted.replace(/,/g,separator):formatted},[maxDecimals,separator]);
 useEffect(()=>{if(ref.current)ref.current.textContent=formatValue(direction==='down'?to:from)},[from,to,direction,formatValue]);
 useEffect(()=>{if(!isInView||!startWhen)return;onStart?.();const t=setTimeout(()=>motionValue.set(direction==='down'?from:to),delay*1000);const end=setTimeout(()=>onEnd?.(),delay*1000+duration*1000);return()=>{clearTimeout(t);clearTimeout(end)}},[isInView,startWhen,motionValue,direction,from,to,delay,onStart,onEnd,duration]);
 useEffect(()=>springValue.on('change',latest=>{if(ref.current)ref.current.textContent=formatValue(latest)}),[springValue,formatValue]);
 return <span ref={ref} className={className}/>;
}
