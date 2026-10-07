import React,{useEffect,useRef,useState} from 'react';

const MODEL='https://cdn.3dassets.dev/assets/38978/v1/model.glb';

export function JYCWebGLShowcase(){
 const ref=useRef(null);
 const [ready,setReady]=useState(false);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const el=ref.current;
  if(!el)return;
  const onLoad=()=>setReady(true);
  const onError=()=>setFailed(true);
  el.addEventListener('load',onLoad);
  el.addEventListener('error',onError);
  return()=>{el.removeEventListener('load',onLoad);el.removeEventListener('error',onError)};
 },[]);
 return <section className="jyc-webgl-showcase editorial-reveal" aria-labelledby="jyc-webgl-title">
   <div className="jyc-webgl-shell">
     <div className="jyc-webgl-copy">
       <div className="jh-section-number">06 / JYC IN MOTION</div>
       <p className="jyc-webgl-kicker">INTERACTIVE WEBGL / JIIT 128</p>
       <h2 id="jyc-webgl-title">A campus that<br/><em>looks forward.</em></h2>
       <p className="jyc-webgl-lead">A small signature WebGL moment for JYC — technical, tactile and deliberately restrained. Drag to orbit, scroll to zoom and watch the campus bot gesture.</p>
       <div className="jyc-webgl-meta">
         <span><b>01</b> ORBIT</span>
         <span><b>02</b> EXPLORE</span>
         <span><b>03</b> DISCOVER</span>
       </div>
       <a className="jyc-webgl-source" href="https://3dassets.dev/assets/robots-and-drones-kit-humanoid-android-88d6d911" target="_blank" rel="noopener noreferrer">Model: Humanoid Android · CC0 ↗</a>
     </div>
     <div className="jyc-webgl-stage">
       <div className="jyc-webgl-grid" aria-hidden="true"/>
       <div className="jyc-webgl-ring ring-one" aria-hidden="true"/>
       <div className="jyc-webgl-ring ring-two" aria-hidden="true"/>
       <div className="jyc-webgl-status" aria-live="polite"><i className={failed?'is-error':ready?'is-ready':''}/>{failed?'3D model unavailable — visual fallback active':ready?'WEBGL ONLINE · INTERACTIVE':'INITIALISING WEBGL'}</div>
       <model-viewer
         ref={ref}
         class="jyc-webgl-model"
         src={MODEL}
         alt="Interactive humanoid android representing the technical spirit of JIIT Youth Club 128"
         camera-controls
         auto-rotate
         rotation-per-second="10deg"
         interaction-prompt="auto"
         animation-name="tilt"
         autoplay
         shadow-intensity="0.7"
         shadow-softness="0.8"
         exposure="0.95"
         tone-mapping="aces"
         camera-orbit="0deg 78deg 2.6m"
         field-of-view="26deg"
         loading="lazy"
         reveal="auto"
         aria-label="Interactive JYC 128 campus bot"
       />
       <div className="jyc-webgl-crosshair" aria-hidden="true"><span/><span/></div>
       <div className="jyc-webgl-fallback" aria-hidden={ready||failed?'true':'false'}>
         <span>JYC</span><b>128</b>
       </div>
       <div className="jyc-webgl-caption"><span>JYC / 128</span><b>TECHNICAL SPIRIT</b></div>
     </div>
   </div>
 </section>;
}
