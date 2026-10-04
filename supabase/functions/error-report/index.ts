function readNamedKey(envName,fallbackEnv){const raw=Deno.env.get(envName);if(raw){try{const parsed=JSON.parse(raw);if(parsed?.default)return parsed.default}catch{}}return Deno.env.get(fallbackEnv)||''}
const getPublishableKey=()=>readNamedKey('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY');
const getSecretKey=()=>readNamedKey('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY');
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.117.2';

const allowedOrigin = (origin:string|null) => {
  const configured = (Deno.env.get('SITE_ORIGINS') || Deno.env.get('SITE_ORIGIN') || '')
    .split(',').map(x=>x.trim()).filter(Boolean);
  const known = new Set(configured);
  if (origin && known.has(origin)) return origin;
  if (origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  return known.values().next().value || 'null';
};

const json=(body:unknown,status=200,origin:string|null=null)=>new Response(JSON.stringify(body),{
  status,
  headers:{
    'Access-Control-Allow-Origin':allowedOrigin(origin),
    'Access-Control-Allow-Headers':'content-type',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Vary':'Origin',
    'Content-Type':'application/json'
  }
});

async function fingerprint(req:Request){
  const ip=(req.headers.get('x-forwarded-for')||req.headers.get('x-real-ip')||'unknown').split(',')[0].trim();
  const ua=(req.headers.get('user-agent')||'unknown').slice(0,300);
  const bytes=new TextEncoder().encode(ip+'|'+ua);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

Deno.serve(async req=>{
  const origin=req.headers.get('Origin');
  if(req.method==='OPTIONS') return new Response('ok',{headers:{...json({},200,origin).headers}});
  if(req.method!=='POST') return json({error:'POST only.'},405,origin);
  const configuredOrigins=(Deno.env.get('SITE_ORIGINS') || Deno.env.get('SITE_ORIGIN') || '').split(',').map(x=>x.trim()).filter(Boolean);
  const originAllowed=origin && (configuredOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  if(!originAllowed) return json({error:'Origin not allowed.'},403,origin);

  const contentLength=Number(req.headers.get('content-length')||0);
  if(contentLength>18000) return json({error:'Request is too large.'},413,origin);

  let raw='';
  try{raw=await req.text()}catch{return json({error:'Invalid request body.'},400,origin)}
  if(new TextEncoder().encode(raw).byteLength>18000) return json({error:'Request is too large.'},413,origin);
  let body:any;
  try{body=JSON.parse(raw)}catch{return json({error:'Invalid JSON request.'},400,origin)}

  const message=typeof body?.message==='string'?body.message.slice(0,2000):'';
  if(!message) return json({error:'Error message is required.'},400,origin);

  const supabaseUrl=Deno.env.get('SUPABASE_URL');
  const serviceKey=getSecretKey();
  if(!supabaseUrl||!serviceKey) return json({error:'Error reporting service is not configured.'},503,origin);

  const db=createClient(supabaseUrl,serviceKey);
  const {data,error}=await db.rpc('jyc_ingest_error_report',{
    p_fingerprint:await fingerprint(req),
    p_message:message,
    p_stack:typeof body?.stack==='string'?body.stack.slice(0,12000):null,
    p_path:typeof body?.path==='string'?body.path.slice(0,500):null,
    p_user_agent:typeof body?.user_agent==='string'?body.user_agent.slice(0,1000):null,
    p_metadata:body?.metadata&&typeof body.metadata==='object'?body.metadata:{}
  });

  if(error) return json({error:'Could not record the application error.'},500,origin);
  return json({ok:Boolean(data)},data?200:429,origin);
});
