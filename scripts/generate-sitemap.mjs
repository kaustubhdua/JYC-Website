import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const {JYC_HUB_SOURCE_REGISTRY}=await import('../src/jyc-hub-registry.js');
const {sourceHubMedia}=await import('../src/jyc-source-media.js');
const {JYC_SOURCE_ARCHIVE_PHOTO_ITEMS}=await import('../src/jyc-source-media.js');
const site=new URL(process.env.VITE_CANONICAL_ORIGIN||process.env.JYC_CANONICAL_ORIGIN||process.env.VITE_SITE_URL||'https://jyc-website-eight.vercel.app').origin;
const out=path.join(root,'public','sitemap.xml');
const core=['/','/about','/history','/clubs','/events','/fests','/gallery','/team','/contact','/calendar','/announcements','/updates','/achievements','/best-of-jyc','/join-jyc','/events/jai-2026-jaypee-agentic-ai-hackathon','/events/ride-hack-2026','/events/converge-2026','/events/drono-o-war-2026','/events/innovate-3-0-2026','/events/bitbox-6-0-2026','/events/sih-college-internals-26','/events/jyc-function-2026'];
const dynamicDates=new Map();
const sourceHubNames=JYC_HUB_SOURCE_REGISTRY.map(item=>item.name);
const slug=value=>String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const urls=new Set([...core,...sourceHubNames.map(name=>`/clubs/${slug(name)}`)]);
const imageUrls=new Set();
const hubImages=new Map();
for(const item of JYC_SOURCE_ARCHIVE_PHOTO_ITEMS) if(item?.url) imageUrls.add(item.url);
for(const source of ['src/jyc-source-media.js','src/pdf-hub-content.js']){
  try{
    const text=fs.readFileSync(path.join(root,source),'utf8');
    for(const match of text.matchAll(/['\"](\/assets\/[^'\"]+\.(?:webp|png|jpe?g|avif|svg))['\"]/gi)) imageUrls.add(match[1]);
  }catch{}
}
try{
  for(const meta of JYC_HUB_SOURCE_REGISTRY){
    const urls=sourceHubMedia(meta.name).photoItems.map(item=>item.url).filter(Boolean);
    if(urls.length) hubImages.set(meta.name,urls.slice(0,12));
  }
}catch{}

async function loadDynamic(){
  const supabaseUrl=(process.env.VITE_SUPABASE_URL||'').replace(/\/$/,'');
  const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_ANON_KEY||'';
  if(!supabaseUrl||!key)return;
  try{
    const r=await fetch(`${supabaseUrl}/rest/v1/rpc/jyc_read_site_data`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,Prefer:'return=representation'}});
    if(!r.ok)return;
    const data=await r.json();
    for(const c of (data?.clubs||[])) if(c?.published&&c?.status!=='archived') { const u=`/clubs/${slug(c.name)||encodeURIComponent(String(c.id))}`; urls.add(u); if(c.updated_at) dynamicDates.set(u,String(c.updated_at).slice(0,10)); }
    for(const e of (data?.events||[])) if(e?.published&&!e?.archived) { const u=`/events/${slug(e.slug||e.title)||encodeURIComponent(String(e.id))}`; urls.add(u); if(e.updated_at) dynamicDates.set(u,String(e.updated_at).slice(0,10)); }
  }catch{}
}

if(!site) throw new Error('SEO sitemap: production origin could not be resolved.');
await loadDynamic();
// Only emit lastmod when a real content timestamp is available; build time is not a content-change timestamp.
try{
  const supabaseUrl=(process.env.VITE_SUPABASE_URL||'').replace(/\/$/,'');
  const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_ANON_KEY||'';
  if(supabaseUrl&&key){
    const r=await fetch(`${supabaseUrl}/rest/v1/jyc_site_data?id=eq.main&select=updated_at`,{headers:{apikey:key,Authorization:`Bearer ${key}`}});
    if(r.ok){const rows=await r.json();if(rows?.[0]?.updated_at)dynamicDates.set('/',String(rows[0].updated_at).slice(0,10));}
  }
}catch{}
const slugToHubImages=new Map([...hubImages.entries()].map(([name,imgs])=>[slug(name),imgs]));
const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${[...urls].map(u=>{
  let imgs=[];
  if(u==='/gallery') imgs=[...imageUrls];
  else if(u.startsWith('/clubs/')) imgs=slugToHubImages.get(u.split('/').pop())||[];
  const imageXml=imgs.map(img=>`<image:image><image:loc>${site}${img}</image:loc></image:image>`).join('');
  const lastmod=dynamicDates.get(u);const lastmodXml=lastmod?`<lastmod>${lastmod}</lastmod>`:'';return `  <url><loc>${site}${u}</loc>${lastmodXml}${imageXml}</url>`;
}).join('\n')}\n</urlset>\n`;
fs.writeFileSync(out,xml);
const robots=path.join(root,'public','robots.txt');
if(fs.existsSync(robots)){
  let robotsText=fs.readFileSync(robots,'utf8');
  robotsText=robotsText.replace(/^# Production build:[\s\S]*$/m,'');
  robotsText=robotsText.replace(/\n# Production: add the absolute sitemap URL after the real domain is configured\.\n?/g,'\n');
  robotsText=robotsText.replace(/\n?Sitemap:.*\n?/gi,'\n');
  robotsText=robotsText.trimEnd()+`\n\nSitemap: ${site}/sitemap.xml\n`;
  fs.writeFileSync(robots,robotsText);
}
console.log(`SEO sitemap: wrote ${urls.size} URLs to ${out}`);
