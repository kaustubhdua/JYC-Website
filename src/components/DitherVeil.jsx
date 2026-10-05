import React,{useEffect,useRef} from 'react';
import {Renderer,Program,Mesh,Triangle,Texture} from 'ogl';
import './DitherVeil.css';

const VERTEX=\`#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position,0.0,1.0);}
\`;

const FRAGMENT=\`#version 300 es
precision highp float;
uniform sampler2D tImage;
uniform vec2 uResolution;
uniform vec2 uCover;
uniform vec2 uPointer;
uniform float uRadius;
uniform float uSoftness;
uniform float uPixel;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform float uIntro;
uniform float uTime;
in vec2 vUv;
out vec4 fragColor;

float bayer(vec2 p){
  ivec2 q=ivec2(mod(floor(p),8.0));
  int x=q.x,y=q.y;
  int v=x^y;
  int m=((v&1)<<5)|((y&1)<<4)|((v&2)<<2)|((y&2)<<1)|((v&4)>>1)|((y&4)>>2);
  return (float(m)+0.5)/64.0;
}
vec2 imageUv(vec2 uv){return (uv-0.5)*uCover+0.5;}
float inside(vec2 p){return step(0.0,p.x)*step(0.0,p.y)*step(p.x,1.0)*step(p.y,1.0);}
void main(){
  vec2 px=vec2(gl_FragCoord.x,uResolution.y-gl_FragCoord.y);
  vec2 cell=floor(px/max(uPixel,1.0));
  vec2 center=(cell+0.5)*max(uPixel,1.0);
  vec2 uv=vec2(center.x/uResolution.x,1.0-center.y/uResolution.y);
  vec2 sampleUv=imageUv(uv);
  float framed=inside(sampleUv);
  vec3 raw=texture(tImage,sampleUv).rgb;
  float lum=dot(raw,vec3(0.2126,0.7152,0.0722));
  float threshold=bayer(cell);
  float dither=step(threshold,lum);
  vec3 ink=mix(uInk,uPaper,dither);
  vec2 p=vec2(uv.x,1.0-uv.y)*uResolution;
  float dist=distance(p,uPointer);
  float reveal=smoothstep(uRadius,uRadius*(1.0-max(0.02,uSoftness)),dist);
  float intro=smoothstep(0.0,1.0,uIntro);
  float shimmer=0.015*sin(uTime*0.9+cell.x*0.05+cell.y*0.03);
  vec3 color=mix(ink,raw,1.0-reveal);
  color=mix(uInk,color,framed);
  color=mix(uInk,color,intro);
  color+=shimmer*(1.0-reveal);
  fragColor=vec4(color,1.0);
}
\`;

const fitScale=(w,h,iw,ih)=>{
 const ratio=w/h/(iw/ih);
 return ratio>1?[1,1/ratio]:[ratio,1];
};

export default function DitherVeil({
 src='/jyc-logo-official.webp',
 pixelSize=2,
 inkColor='#18161d',
 paperColor='#f5f1e6',
 revealRadius=110,
 softness=.62,
 className='',
 style
}){
 const ref=useRef(null);
 const fallbackRef=useRef(null);

 useEffect(()=>{
  const container=ref.current;
  if(!container)return;
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let renderer,raf=0,observer,resizeObserver,img;
  let alive=true;
  const fallback=()=>{if(fallbackRef.current)fallbackRef.current.dataset.visible='true';container.dataset.fallback='true';};
  try{
   renderer=new Renderer({dpr:Math.min(window.devicePixelRatio||1,1.75),alpha:true,antialias:false});
   const gl=renderer.gl;
   const canvas=gl.canvas;
   canvas.style.cssText='display:block;width:100%;height:100%;position:absolute;inset:0;z-index:1;';
   container.appendChild(canvas);
   const geometry=new Triangle(gl);
   const imageTexture=new Texture(gl,{minFilter:gl.LINEAR,magFilter:gl.LINEAR});
   const uniforms={
    tImage:{value:imageTexture},uResolution:{value:[1,1]},uCover:{value:[1,1]},
    uPointer:{value:[0,0]},uRadius:{value:revealRadius},uSoftness:{value:softness},
    uPixel:{value:pixelSize},uInk:{value:[.094,.086,.114]},uPaper:{value:[.961,.945,.902]},
    uIntro:{value:0},uTime:{value:0}
   };
   const hex=h=>{let s=String(h||'').replace('#','');if(s.length===3)s=s.split('').map(x=>x+x).join('');const n=parseInt(s.slice(0,6),16);return Number.isFinite(n)?[((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255]:[0,0,0]};
   uniforms.uInk.value=hex(inkColor);uniforms.uPaper.value=hex(paperColor);
   const program=new Program(gl,{vertex:VERTEX,fragment:FRAGMENT,uniforms,depthTest:false,depthWrite:false,transparent:true});
   const mesh=new Mesh(gl,{geometry,program});
   let w=1,h=1,start=performance.now(),pointer={x:0,y:0,inside:false};
   const layout=()=>{
    w=Math.max(1,container.clientWidth);h=Math.max(1,container.clientHeight);
    renderer.setSize(w,h);uniforms.uResolution.value=[canvas.width,canvas.height];
    if(img)uniforms.uCover.value=fitScale(canvas.width,canvas.height,img.naturalWidth,img.naturalHeight);
    if(!pointer.inside)pointer={x:w/2,y:h/2,inside:false};
   };
   const render=now=>{
    raf=0;if(!alive)return;
    const elapsed=(now-start)/1000;
    uniforms.uTime.value=elapsed;
    uniforms.uIntro.value=Math.min(1,elapsed/1.0);
    uniforms.uPointer.value=[pointer.x,pointer.y];
    renderer.render({scene:mesh});
    if(!reduce&&(pointer.inside||elapsed<1.05))raf=requestAnimationFrame(render);
   };
   const wake=()=>{if(!raf&&alive)raf=requestAnimationFrame(render)};
   const locate=e=>{
    const r=container.getBoundingClientRect();
    pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;pointer.inside=true;wake();
   };
   const leave=()=>{pointer.inside=false;wake()};
   img=new Image();img.decoding='async';img.onload=()=>{if(!alive)return;imageTexture.image=img;imageTexture.needsUpdate=true;layout();wake()};img.onerror=fallback;img.src=src;
   container.addEventListener('pointermove',locate,{passive:true});
   container.addEventListener('pointerenter',locate,{passive:true});
   container.addEventListener('pointerleave',leave,{passive:true});
   resizeObserver=new ResizeObserver(()=>{layout();wake()});resizeObserver.observe(container);
   observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)wake()});observer.observe(container);
   layout();wake();
   return()=>{alive=false;cancelAnimationFrame(raf);observer?.disconnect();resizeObserver?.disconnect();img.onload=null;img.onerror=null;container.removeEventListener('pointermove',locate);container.removeEventListener('pointerenter',locate);container.removeEventListener('pointerleave',leave);gl.getExtension('WEBGL_lose_context')?.loseContext();canvas.remove()};
  }catch(error){console.warn('DitherVeil unavailable; using static logo fallback.',error);fallback()}
 },[src,pixelSize,inkColor,paperColor,revealRadius,softness]);

 return <div ref={ref} className={\`dither-veil \${className}\`.trim()} style={style} aria-hidden="true">
  <img ref={fallbackRef} className="dither-veil-fallback" src={src} alt="" data-visible="false"/>
 </div>;
}
