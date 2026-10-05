import React,{useEffect,useRef} from 'react';
import {Renderer,Program,Mesh,Triangle,Texture} from 'ogl';
import './DitherVeil.css';

const vertex=`#version 300 es
in vec2 position; in vec2 uv; out vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}
`;
const fragment=`#version 300 es
precision highp float;
uniform sampler2D tImage; uniform vec2 uResolution,uCover,uPointer;
uniform float uRadius,uSoftness,uPixel,uIntro,uTime;
uniform vec3 uInk,uPaper;
in vec2 vUv; out vec4 fragColor;
float bayer(vec2 p){ivec2 q=ivec2(mod(floor(p),8.));int x=q.x,y=q.y,v=x^y;int m=((v&1)<<5)|((y&1)<<4)|((v&2)<<2)|((y&2)<<1)|((v&4)>>1)|((y&4)>>2);return(float(m)+.5)/64.;}
vec2 imageUv(vec2 uv){return(uv-.5)*uCover+.5;}
float inside(vec2 p){return step(0.,p.x)*step(0.,p.y)*step(p.x,1.)*step(p.y,1.);}
void main(){
 vec2 px=vec2(gl_FragCoord.x,uResolution.y-gl_FragCoord.y),cell=floor(px/max(uPixel,1.));
 vec2 center=(cell+.5)*max(uPixel,1.),uv=vec2(center.x/uResolution.x,1.-center.y/uResolution.y);
 vec2 suv=imageUv(uv);float framed=inside(suv);vec3 raw=texture(tImage,suv).rgb;
 float lum=dot(raw,vec3(.2126,.7152,.0722)),dither=step(bayer(cell),lum);
 vec3 ink=mix(uInk,uPaper,dither);vec2 p=vec2(uv.x,1.-uv.y)*uResolution;
 float dist=distance(p,uPointer),edge=max(.02,1.-uSoftness);
 float reveal=smoothstep(uRadius,uRadius*edge,dist),intro=smoothstep(0.,1.,uIntro);
 float shimmer=.012*sin(uTime*.8+cell.x*.05+cell.y*.03);
 vec3 color=mix(ink,raw,1.-reveal);color=mix(uInk,color,framed);color=mix(uInk,color,intro);color+=shimmer*(1.-reveal);
 fragColor=vec4(color,1.);
}
`;
const fit=(w,h,iw,ih)=>{const r=w/h/(iw/ih);return r>1?[1,1/r]:[r,1];};
const rgb=h=>{let s=String(h||'').replace('#','');if(s.length===3)s=s.split('').map(x=>x+x).join('');const n=parseInt(s.slice(0,6),16);return Number.isFinite(n)?[((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255]:[0,0,0];};

export default function DitherVeil({src='/jyc-logo-official.webp',pixelSize=2,inkColor='#18161d',paperColor='#f5f1e6',revealRadius=78,softness=.7,className='',style}){
 const ref=useRef(null),fallbackRef=useRef(null);
 useEffect(()=>{
  const el=ref.current;if(!el)return;
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let renderer,raf=0,ro,io,img,alive=true;
  const fallback=()=>{el.dataset.fallback='true';if(fallbackRef.current)fallbackRef.current.dataset.visible='true';};
  try{
   renderer=new Renderer({dpr:Math.min(window.devicePixelRatio||1,1.75),alpha:true,antialias:false});
   const gl=renderer.gl,canvas=gl.canvas;canvas.style.cssText='display:block;position:absolute;inset:0;width:100%;height:100%;z-index:1;';
   el.appendChild(canvas);
   const tex=new Texture(gl,{minFilter:gl.LINEAR,magFilter:gl.LINEAR}),geometry=new Triangle(gl);
   const uniforms={tImage:{value:tex},uResolution:{value:[1,1]},uCover:{value:[1,1]},uPointer:{value:[0,0]},uRadius:{value:revealRadius},uSoftness:{value:softness},uPixel:{value:pixelSize},uInk:{value:rgb(inkColor)},uPaper:{value:rgb(paperColor)},uIntro:{value:0},uTime:{value:0}};
   const program=new Program(gl,{vertex,fragment,uniforms,depthTest:false,depthWrite:false});
   const mesh=new Mesh(gl,{geometry,program});
   let w=1,h=1,start=performance.now(),pointer={x:0,y:0,inside:false};
   const layout=()=>{w=Math.max(1,el.clientWidth);h=Math.max(1,el.clientHeight);renderer.setSize(w,h);uniforms.uResolution.value=[canvas.width,canvas.height];if(img)uniforms.uCover.value=fit(canvas.width,canvas.height,img.naturalWidth,img.naturalHeight);if(!pointer.inside)pointer={x:w/2,y:h/2,inside:false};};
   const frame=now=>{raf=0;if(!alive)return;const elapsed=(now-start)/1000;uniforms.uTime.value=elapsed;uniforms.uIntro.value=Math.min(1,elapsed);uniforms.uPointer.value=[pointer.x,pointer.y];renderer.render({scene:mesh});if(!reduce&&(pointer.inside||elapsed<1.05))raf=requestAnimationFrame(frame);};
   const wake=()=>{if(!raf&&alive)raf=requestAnimationFrame(frame);};
   const move=e=>{const r=el.getBoundingClientRect();pointer={x:e.clientX-r.left,y:e.clientY-r.top,inside:true};wake();};
   const leave=()=>{pointer.inside=false;wake();};
   img=new Image();img.decoding='async';img.onload=()=>{if(!alive)return;tex.image=img;tex.needsUpdate=true;layout();wake();};img.onerror=fallback;img.src=src;
   el.addEventListener('pointermove',move,{passive:true});el.addEventListener('pointerenter',move,{passive:true});el.addEventListener('pointerleave',leave,{passive:true});
   ro=new ResizeObserver(()=>{layout();wake();});ro.observe(el);io=new IntersectionObserver(([e])=>{if(e.isIntersecting)wake();});io.observe(el);
   layout();wake();
   return()=>{alive=false;cancelAnimationFrame(raf);ro?.disconnect();io?.disconnect();img.onload=null;img.onerror=null;el.removeEventListener('pointermove',move);el.removeEventListener('pointerenter',move);el.removeEventListener('pointerleave',leave);gl.getExtension('WEBGL_lose_context')?.loseContext();canvas.remove();};
  }catch(error){console.warn('DitherVeil fallback:',error);fallback();}
 },[src,pixelSize,inkColor,paperColor,revealRadius,softness]);
 return <div ref={ref} className={`dither-veil \${className}`.trim()} style={style} aria-hidden="true"><img ref={fallbackRef} className="dither-veil-fallback" src={src} alt="" data-visible="false"/></div>;
}
