function readNamedKey(envName,fallbackEnv){const raw=Deno.env.get(envName);if(raw){try{const parsed=JSON.parse(raw);if(parsed?.default)return parsed.default}catch{}}return Deno.env.get(fallbackEnv)||''}
const getPublishableKey=()=>readNamedKey('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY');
const getSecretKey=()=>readNamedKey('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY');
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.2';

const origins = new Set((Deno.env.get('SITE_ORIGINS') || Deno.env.get('SITE_ORIGIN') || 'https://jyc-website-eight.vercel.app,http://localhost:5173')
  .split(',').map(x=>x.trim()).filter(Boolean));
const allowedOrigin = (origin:string|null) => origin && (origins.has(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) ? origin : null;
const json=(body:unknown,status=200,origin:string|null=null)=>new Response(JSON.stringify(body),{status,headers:{
  'Access-Control-Allow-Origin':allowedOrigin(origin)||'null',
  'Access-Control-Allow-Headers':'content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Vary':'Origin',
  'Content-Type':'application/json',
  'Cache-Control':'no-store, no-cache, must-revalidate, max-age=0',
  'X-Content-Type-Options':'nosniff'
}});

async function fingerprint(req:Request){
  const ip=(req.headers.get('x-forwarded-for')||req.headers.get('x-real-ip')||'unknown').split(',')[0].trim();
  const ua=(req.headers.get('user-agent')||'unknown').slice(0,300);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+'|'+ua));
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
const cleanText=(v:unknown,max:number)=>String(v??'').trim().slice(0,max);
const validEmail=(v:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validUrl=(v:string)=>{if(!v)return true;if(/[\u0000-\u001f\u007f]/.test(v))return false;try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password&&Boolean(u.hostname)}catch{return false}};

Deno.serve(async req=>{
  const origin=req.headers.get('Origin');
  if(req.method==='OPTIONS') return new Response('ok',{headers:json({},200,origin).headers});
  if(req.method!=='POST') return json({error:'POST only.'},405,origin);
  if(!allowedOrigin(origin)) return json({error:'Origin not allowed.'},403,origin);
  let raw='';
  try{
    raw=await req.text();
  }catch{return json({error:'Invalid request body.'},400,origin)}
  if(new TextEncoder().encode(raw).byteLength>18000) return json({error:'Request is too large.'},413,origin);
  let body:any; try{body=JSON.parse(raw)}catch{return json({error:'Invalid JSON request.'},400,origin)}
  if(cleanText(body?.website,120)) return json({ok:true},200,origin);
  const type=body?.type==='project'?'project':body?.type==='contact'?'contact':'';
  if(!type) return json({error:'Unsupported submission type.'},400,origin);
  const url=Deno.env.get('SUPABASE_URL'),key=getSecretKey();
  if(!url||!key) return json({error:'Submission service is not configured.'},503,origin);
  const db=createClient(url,key);
  const {data:allowed,error:limitError}=await db.rpc('jyc_allow_public_submission',{p_fingerprint:await fingerprint(req),p_limit:type==='project'?4:6,p_window_seconds:3600});
  if(limitError) return json({error:'Submission protection is unavailable.'},503,origin);
  if(!allowed) return json({error:'Too many submissions from this connection. Please try again later.'},429,origin);
  if(type==='contact'){
    const name=cleanText(body.name,120),email=cleanText(body.email,320).toLowerCase(),message=cleanText(body.message,4000);
    if(name.length<2||message.length<5||!validEmail(email)) return json({error:'Please provide a valid name, email and message.'},400,origin);
    const {error}=await db.from('jyc_contact_submissions').insert({name,email,message,source:'public-contact'});
    if(error) return json({error:'Could not submit your message.'},500,origin);
    return json({ok:true},200,origin);
  }
  const name=cleanText(body.name,160),description=cleanText(body.description,5000),link=cleanText(body.link,1000),club=cleanText(body.club,160),submitter=cleanText(body.submitter,120),email=cleanText(body.email,320).toLowerCase();
  if(name.length<2||description.length<10||submitter.length<2||!validEmail(email)||!validUrl(link)) return json({error:'Please complete the required project fields with a valid link.'},400,origin);
  const {error}=await db.from('jyc_project_submissions').insert({name,description,link:link||null,club_name:club||null,submitter_name:submitter,submitter_email:email,status:'submitted'});
  if(error) return json({error:'Could not submit the project.'},500,origin);
  return json({ok:true},200,origin);
});