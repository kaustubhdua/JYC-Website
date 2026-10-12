import fs from 'node:fs';
import path from 'node:path';
import {JYC_HUB_SOURCE_REGISTRY} from '../src/jyc-hub-registry.js';
import {JYC_HUB_CONTENT} from '../src/v21-hub-content.js';

const root=process.cwd();
const dist=path.join(root,'dist');
const index=path.join(dist,'index.html');

if(!fs.existsSync(index)){
  console.error('dist/index.html not found; run vite build first.');
  process.exit(1);
}

const html=fs.readFileSync(index,'utf8');
const siteOrigin=new URL(process.env.VITE_CANONICAL_ORIGIN||process.env.JYC_CANONICAL_ORIGIN||process.env.VITE_SITE_URL||'https://jyc-website-eight.vercel.app').origin;
const routes={
  '/':{
    title:'JIIT Youth Club 128 — Official JYC Website | JIIT Wish Town, Noida',
    description:'Official JIIT Youth Club 128 website for JIIT Wish Town Campus, Sector 128, Noida — discover JYC clubs, events, leadership, achievements and official campus memories.'
  },
  '/about':{
    title:'About JIIT Youth Club 128 | JYC',
    description:'Learn about JIIT Youth Club 128, its purpose, community families, activities and role across the JIIT Wish Town campus.'
  },
  '/clubs':{
    title:'JYC Communities & Clubs | JIIT Youth Club 128',
    description:'Explore JIIT Youth Club 128 communities, technical and cultural clubs, activities, events and official connections.'
  },
  '/events':{
    title:'JYC Events | JIIT Youth Club 128',
    description:'Discover published JYC events, programmes, organisers, dates, venues and official event details at JIIT Wish Town.'
  },
  '/gallery':{
    title:'JYC Moments & Photography | JIIT Youth Club 128',
    description:'Explore the official JYC visual archive, photographic moments, collections and campus stories.'
  },
  '/archive':{
    title:'JYC Archive | JIIT Youth Club 128',
    description:'Browse the JIIT Youth Club archive of published events, communities and official campus memories.'
  },
  '/team':{
    title:'JYC Leadership & People | JIIT Youth Club 128',
    description:'Meet the people behind JIIT Youth Club 128: faculty guidance, student leadership, core teams and communities.'
  },
  '/contact':{
    title:'Contact JIIT Youth Club 128 | JYC',
    description:'Connect with JIIT Youth Club 128 through official contact channels and community links.'
  },
  '/history':{
    title:'JYC History | JIIT Youth Club 128',
    description:'Explore the history, purpose and evolution of JIIT Youth Club 128.'
  },
  '/announcements':{
    title:'JYC Announcements | JIIT Youth Club 128',
    description:'Official JYC announcements, notices, registrations and published community updates.'
  },
  '/updates':{
    title:'JYC Now — Community Updates | JIIT Youth Club 128',
    description:'Recent verified public updates from JIIT Youth Club 128 and its official community channels.'
  },
  '/calendar':{
    title:'JYC Event Calendar | JIIT Youth Club 128',
    description:'Plan around published JYC events, dates, venues and campus experiences.'
  },
  '/fests':{
    title:'JYC Fests | JIIT Youth Club 128',
    description:'Explore JYC fest experiences, programmes, live status, results and published fest archives.'
  },
  '/recruitment':{
    title:'JYC Recruitment | JIIT Youth Club 128',
    description:'Find JYC communities with published recruitment opportunities and official application links.'
  },
  '/join-jyc':{
    title:'Join JYC | JIIT Youth Club 128',
    description:'Learn how to get involved with JIIT Youth Club 128 and discover the next way to participate.'
  },
  '/achievements':{
    title:'JYC Achievements | JIIT Youth Club 128',
    description:'Explore published JYC achievements, community outcomes and official source records.'
  },
  '/best-of-jyc':{
    title:'Best of JYC | JIIT Youth Club 128',
    description:'A curated editorial selection of standout JYC communities, events and campus moments.'
  },
  '/events/jai-2026-jaypee-agentic-ai-hackathon':{
    title:'JAI 2026 — Jaypee Agentic AI Hackathon | JYC',
    description:'Official JYC event record for JAI 2026, the Jaypee Agentic AI Hackathon.'
  },
  '/events/ride-hack-2026':{
    title:'RIDE Hack 26 | JIIT Youth Club 128',
    description:'Official JYC event record for RIDE Hack 26 and the JIIT innovation ecosystem.'
  },
  '/events/converge-2026':{
    title:'Converge 2026 | JIIT Youth Club 128',
    description:'Official JYC event record for Converge 2026 at JIIT Wish Town.'
  },
  '/events/drono-o-war-2026':{
    title:'Drono-O-War 2026 | JIIT Youth Club 128',
    description:'Official JYC event record for Drono-O-War 2026 and the JYC technical community.'
  },
  '/events/innovate-3-0-2026':{
    title:'Innovate 3.0 2026 | JIIT Youth Club 128',
    description:'Official JYC event record for Innovate 3.0 2026 at JIIT Wish Town.'
  },
  '/events/bitbox-6-0-2026':{
    title:'BitBox 6.0 2026 | JIIT Youth Club 128',
    description:'Official JYC event record for BitBox 6.0 2026 and the JYC technical community.'
  },
  '/events/sih-college-internals-26':{
    title:'SIH College Internals 2026 | JIIT Youth Club 128',
    description:'Official JYC event record for the Smart India Hackathon college internals at JIIT Wish Town.'
  },
  '/events/jyc-function-2026':{
    title:'JYC Function 2026 | JIIT Youth Club 128',
    description:'Official JYC event record for the JYC Function 2026.'
  }
};

const slugify=value=>String(value||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const plainText=value=>String(value||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/\s+/g,' ').trim();
const metaDescription=(value,fallback)=>{const text=plainText(value)||fallback;return text.length>160?text.slice(0,157).trimEnd()+'...':text;};
const escapeHtml=value=>String(value||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escapeAttr=value=>escapeHtml(value).replace(/\"/g,'&quot;');

// Public records may be edited after this source bundle was authored. Add
// route-specific shells for every currently published record available to the
// build, while keeping the curated metadata above authoritative for flagships.
async function loadDynamicRoutes(){
  const supabaseUrl=(process.env.VITE_SUPABASE_URL||'').replace(/\/$/,'');
  const key=process.env.VITE_SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_ANON_KEY||'';
  if(!supabaseUrl||!key){
    console.log('Route shells: Supabase build credentials unavailable; using curated route metadata.');
    return;
  }
  try{
    const response=await fetch(`${supabaseUrl}/rest/v1/rpc/jyc_read_site_data`,{
      method:'POST',
      headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=representation'},
      body:'{}',
      signal:AbortSignal.timeout(8000)
    });
    if(!response.ok) throw new Error(`public site data returned HTTP ${response.status}`);
    const data=await response.json();
    let dynamicCount=0;
    for(const event of (Array.isArray(data?.events)?data.events:[])){
      if(!event?.published||event?.archived===true)continue;
      const name=plainText(event.title||event.name);
      const slug=slugify(event.slug||name)||String(event.id||'');
      if(!name||!slug)continue;
      const route='/events/'+slug;
      if(routes[route])continue;
      const summary=event.summary||event.description||event.shortDescription;
      routes[route]={
        title:`${name} | JIIT Youth Club 128`,
        description:metaDescription(summary,`Official JYC event details for ${name} at JIIT Wish Town Campus, Sector 128, Noida.`)
      };
      dynamicCount++;
    }
    for(const club of (Array.isArray(data?.clubs)?data.clubs:[])){
      if(!club?.published||club?.status==='archived')continue;
      const name=plainText(club.name);
      const slug=slugify(name)||String(club.id||'');
      if(!name||!slug)continue;
      const route='/clubs/'+slug;
      if(routes[route])continue;
      const summary=club.summary||club.description||club.about;
      routes[route]={
        title:`${name} | JIIT Youth Club 128`,
        description:metaDescription(summary,`Official JYC community profile for ${name} at JIIT Wish Town Campus, Sector 128, Noida.`)
      };
      dynamicCount++;
    }
    console.log(`Route shells: added ${dynamicCount} published database route(s).`);
  }catch(error){
    // A temporary CMS/API outage must not break the public production build.
    console.warn('Route shells: dynamic metadata unavailable; using curated route metadata.',error?.message||error);
  }
}

function shellFor(meta,route){
  let out=html;
  const tags=[
    ['title',meta.title],
    ['meta[name="description"]',meta.description],
    ['meta[property="og:title"]',meta.title],
    ['meta[property="og:description"]',meta.description],
    ['meta[name="twitter:title"]',meta.title],
    ['meta[name="twitter:description"]',meta.description]
  ];
  out=out.replace(/<title>[^<]*<\/title>/i,`<title>${escapeHtml(meta.title)}</title>`);
  for(const [selector,value] of tags.slice(1)){
    const esc=escapeAttr(value);
    if(selector.startsWith('meta[name="description"]')){
      out=out.replace(/<meta name="description" content="[^"]*"\s*\/>/i,`<meta name="description" content="${esc}" />`);
    }else if(selector.includes('og:title')){
      out=out.replace(/<meta property="og:title" content="[^"]*"\s*\/>/i,`<meta property="og:title" content="${esc}" />`);
    }else if(selector.includes('og:description')){
      out=out.replace(/<meta property="og:description" content="[^"]*"\s*\/>/i,`<meta property="og:description" content="${esc}" />`);
    }else if(selector.includes('twitter:title')){
      out=out.replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/i,`<meta name="twitter:title" content="${esc}" />`);
    }else if(selector.includes('twitter:description')){
      out=out.replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/i,`<meta name="twitter:description" content="${esc}" />`);
    }
  }
  const canonicalUrl=`${siteOrigin}${route}`;
  const canonicalTag=`<link rel="canonical" href="${canonicalUrl}" />`;
  if(/<link rel="canonical" href="[^"]*"\s*\/>/i.test(out)){
    out=out.replace(/<link rel="canonical" href="[^"]*"\s*\/>/i,canonicalTag);
  }else{
    out=out.replace('</head>',`  ${canonicalTag}\n  </head>`);
  }
  const ogUrlTag=`<meta property="og:url" content="${canonicalUrl}" />`;
  if(/<meta property="og:url" content="[^"]*"\s*\/>/i.test(out)){
    out=out.replace(/<meta property="og:url" content="[^"]*"\s*\/>/i,ogUrlTag);
  }else{
    out=out.replace('</head>',`  ${ogUrlTag}\n  </head>`);
  }
  const escapedTitle=meta.title.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  out=out.replace(/(<h1\b[^>]*>)JIIT Youth Club — Clubs, Events &amp; Fests \| JIIT Noida(<\/h1>)/g,`$1${escapedTitle}$2`);
  out=out.replace(/(<h1\b[^>]*>)Preparing the JYC experience…(<\/h1>)/g,`$1${escapedTitle}$2`);
  out=out.replace(/(<noscript\b[^>]*>[\s\S]*?)<h1\b([^>]*)>([\s\S]*?)<\/h1>/i,'$1<p$2>$3</p>');
  const pageSchema=JSON.stringify({
    '@context':'https://schema.org',
    '@type':'WebPage',
    name:meta.title,
    description:meta.description,
    url:`${siteOrigin}${route}`,
    isPartOf:{'@id':`${siteOrigin}/#website`},
    about:{'@id':`${siteOrigin}/#organization`}
  }).replaceAll('<','\\u003c');
  out=out.replace('</head>',`<script type="application/ld+json">${pageSchema}</script>\n  </head>`);
  return out;
}

for(const hub of JYC_HUB_SOURCE_REGISTRY.filter(item=>item.publicationStatus==='published')){
  const content=JYC_HUB_CONTENT[hub.name]||{};
  routes['/clubs/'+String(hub.name).toLowerCase().replace(/[^a-z0-9]+/g,'-')]={
    title: hub.name+' | JIIT Youth Club 128',
    description: content.summary || 'Official JYC community profile for '+hub.name+' at JIIT Wish Town Campus, Sector 128, Noida.'
  };
}
await loadDynamicRoutes();

for(const [route,meta] of Object.entries(routes)){
  const dir=path.join(dist,...route.replace(/^\//,'').split('/'));
  fs.mkdirSync(dir,{recursive:true});
  let shell=shellFor(meta,route);
  fs.writeFileSync(path.join(dir,'index.html'),shell);
}
console.log(`Generated ${Object.keys(routes).length} route-specific HTML shells.`);
