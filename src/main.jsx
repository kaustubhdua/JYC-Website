import React,{lazy,Suspense,useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createPortal} from 'react-dom';
import {BrowserRouter,Navigate,useLocation,useNavigate} from 'react-router-dom';
import {supabase} from './lib/supabase';
import {uploadJycMedia} from './lib/media.js';
import {jycToast} from './lib/ui';
import './styles/public-system.css';
import {JYC_HUB_CONTENT, JYC_HUB_FAMILIES, hubProfile} from './v21-hub-content.js';
import {JYC_ORIENTATION_FAMILIES,JYC_ORIENTATION_LAYERS,JYC_ORIENTATION_EVENTS,JYC_ORIENTATION_AT_A_GLANCE} from './jyc-orientation-insights.js';
import {hubDetails} from './v23.6-hub-details.js';
import {hubIdentity,eventIdentity} from './hub-identities.js';
import {PDF_HUB_GALLERY,PDF_HUB_STORIES,HUB_PHOTO_MAP} from './pdf-hub-content.js';
import {PDF_HUB_EXTRA_GALLERY,PDF_HUB_PROGRAMME} from './pdf-hub-extra.js';
import {enrichSourceClubs,mergeSourceGallery,sourceHubMedia,sourceEventMedia,buildJycMediaManifest} from './jyc-source-media.js';
import {JYC_EVENT_CATEGORIES,JYC_COMMUNITY_DISCOVERY,JYC_PUBLIC_ACTIVITIES} from './public-v1/config.js';
import {JYC_SOCIALS,festSocialProfile,socialProfile} from './jyc-socials.js';
import {JYCNowStrip,JYCNowPage,HubLatestUpdates} from './jyc-now.jsx';
import JYCHistory,{HistoryTeaser} from './jyc-history-page.jsx';

const PUBLIC_TEAM_FALLBACK=[
 {id:'devansh-tripathi',name:'Devansh Tripathi',role:'General Secretary',published:true,bio:'A prominent face of JYC 128, contributing across student societies spanning leadership, creativity, innovation, culture, literature, design and technology.',photo:'/assets/team/devansh-tripathi.webp'},
 {id:'amrit-kumar',name:'Amrit Kumar Jha',role:'Vice President',published:true,bio:'A planner, coordinator and problem-solver focused on streamlining operations, supporting decisions, bringing teams together and creating structure behind the scenes.',photo:'/assets/team/amrit-kumar.webp'},
 {id:'daksh-sachdeva',name:'Daksh Sachdeva',role:'Finance Secretary / Treasurer',published:true,bio:'Responsible for budgeting, planning and careful resource management across JYC activities.',photo:'/assets/team/daksh-sachdeva.webp'},
 {id:'saksham-kotia',name:'Saksham Kotia',role:'Joint Secretary',published:true,bio:'Supports coordination, execution and cross-team work across the JYC ecosystem.',photo:'/assets/team/saksham-kotia.webp'},
 {id:'asmi-srivastava',name:'Asmi Srivastava',role:'Hospitality Head',published:true,bio:'Executive leadership supporting JYC communities, programmes and student experiences.',photo:'/assets/team/asmi-srivastava.webp'},
 {id:'juhi-hatuka',name:'Juhi Hatuka',role:'Hospitality Head',published:true,bio:'Executive leadership supporting JYC communities, programmes and student experiences.',photo:'/assets/team/juhi-hatuka.webp'},
 {id:'pratik-kumar',name:'Pratik Kumar',role:'Security Head',published:true,bio:'Executive leadership supporting JYC communities, programmes and student experiences.',photo:'/assets/team/pratik-kumar.webp'},
 {id:'divye-bajaj',name:'Divye Bajaj',role:'PR Head',published:true,bio:'Executive leadership supporting JYC communities, programmes and student experiences.',photo:'/assets/team/divye-bajaj.webp'},
 {id:'revant-srivastava',name:'Revant Srivastava',role:'Management Head',published:true,bio:'Executive leadership supporting JYC communities, programmes and student experiences.',photo:'/assets/team/revant-srivastava.webp'},
 {id:'aradhyaa-singh',name:'Aradhyaa Singh',role:'Executive Head',published:true,bio:'Executive leadership supporting JYC communities, programmes and student experiences.',photo:'/assets/team/aradhyaa-singh.webp'},
 {id:'vansh-mahajan',name:'Vansh Mahajan',role:'Security Head',published:true,bio:'Executive leadership supporting JYC communities, programmes and student experiences.',photo:'/assets/team/vansh-mahajan.webp'},
 {id:'shriya-singh',name:'Shriya Singh',role:'Digital Head',published:true,bio:'Executive leadership supporting JYC communities, programmes and student experiences.',photo:'/assets/team/shriya-singh.webp'},
 {id:'faculty-vinay-anand-tikkiwal',name:'Dr. Vinay Anand Tikkiwal',role:'Faculty Advisor',published:true,bio:'Faculty advisor supporting the JYC student ecosystem.',photo:''},
 {id:'faculty-pankaj-kumar-srivastava',name:'Dr. Pankaj Kumar Srivastava',role:'Faculty Advisor',published:true,bio:'Faculty advisor supporting the JYC student ecosystem.',photo:''},
 {id:'harisha',name:'Harisha',role:'Creative Head',published:true,bio:'Leads creative coordination across JYC programmes and campus experiences.',photo:''},
 {id:'dhruv-choudhary',name:'Dhruv Choudhary',role:'Management Head',published:true,bio:'Supports management and execution across JYC activities.',photo:''}
];
const JAI_OFFICIAL_MEDIA=[
 {id:'jai-2026-campus',url:'https://www.jiityouthclub128.in/imgs/jiit-campus-new.png',caption:'JIIT Wish Town Campus · Sector 128',association:'JAI 2026',year:'2026'},
 {id:'jai-2026-summit-identity',url:'https://www.jiityouthclub128.in/imgs/ai-summit.png',caption:'JAI 2026 · Jaypee Agentic AI International Summit identity',association:'JAI 2026',year:'2026'},
 {id:'jai-2026-agentic-hackathon',url:'https://www.jiityouthclub128.in/imgs/ai-agent-face.png',caption:'JAI 2026 · Agentic AI Hackathon official artwork',association:'JAI 2026 · Hackathon',year:'2026'},
 {id:'jai-2026-qr',url:'https://www.jiityouthclub128.in/imgs/unstop-qr.png',caption:'JAI 2026 · Unstop registration QR',association:'JAI 2026 · Hackathon',year:'2026'},
 {id:'jai-2026-ride',url:'https://www.jiityouthclub128.in/imgs/ride.png',caption:'RIDE initiative · JAI 2026 support',association:'JAI 2026',year:'2026'}
];
const PUBLIC_GALLERY_FALLBACK=[
 {id:'hub-ebullience-25',url:'/assets/home/ebullience.webp',caption:"Ebullience '25 · Freshers' welcome experience",association:'JYC · Ebullience',year:'2025'},
 {id:'hub-dronowar-1',url:'/assets/home/dron-o-war-1.webp',caption:'Dron-O-War · glimpses from the JYC hub material',association:'Dronotics · Dron-O-War',year:'2026'},
 {id:'hub-dronowar-2',url:'/assets/home/dron-o-war-2.webp',caption:'Dron-O-War · teams, campus and competition',association:'Dronotics · Dron-O-War',year:'2026'},
 {id:'hub-converge-voices',url:'/assets/home/converge-voices.webp',caption:'Converge 2026 · people, speaking and campus culture',association:'Converge 2026',year:'2026'},
 {id:'hub-converge-moments',url:'/assets/home/converge-moments.webp',caption:'Converge 2026 · student moments',association:'Converge 2026',year:'2026'},
 {id:'hub-jyc-events',url:'/assets/home/jyc-events-collage.webp',caption:'JYC event record · supplied hub material',association:'JYC Archive',year:'2026'},
 {id:'team-devansh-campaign',url:'/assets/team/campaign/devansh-tripathi.webp',caption:'Leadership campaign · Devansh Tripathi',association:'JYC Team · Devansh Tripathi',year:'2026'},
 {id:'team-amrit-campaign',url:'/assets/team/campaign/amrit-kumar.webp',caption:'Leadership campaign · Amrit Kumar',association:'JYC Team · Amrit Kumar',year:'2026'},
 {id:'team-daksh-campaign',url:'/assets/team/campaign/daksh-sachdeva.webp',caption:'Leadership campaign · Daksh Sachdeva',association:'JYC Team · Daksh Sachdeva',year:'2026'},
 {id:'team-saksham-campaign',url:'/assets/team/campaign/saksham-kotia.webp',caption:'Leadership campaign · Saksham Kotia',association:'JYC Team · Saksham Kotia',year:'2026'},
 {id:'team-asmi-campaign',url:'/assets/team/campaign/asmi-srivastava.webp',caption:'Leadership campaign · Asmi Srivastava',association:'JYC Team · Asmi Srivastava',year:'2026'},
 {id:'team-juhi-campaign',url:'/assets/team/campaign/juhi-hatuka.webp',caption:'Leadership campaign · Juhi Hatuka',association:'JYC Team · Juhi Hatuka',year:'2026'},
 {id:'team-revant-campaign',url:'/assets/team/campaign/revant-srivastava.webp',caption:'Leadership campaign · Revant Srivastava',association:'JYC Team · Revant Srivastava',year:'2026'},
 {id:'team-aradhyaa-campaign',url:'/assets/team/campaign/aradhyaa-singh.webp',caption:'Leadership campaign · Aradhyaa Singh',association:'JYC Team · Aradhyaa Singh',year:'2026'},
 {id:'team-vansh-campaign',url:'/assets/team/campaign/vansh-mahajan.webp',caption:'Leadership campaign · Vansh Mahajan',association:'JYC Team · Vansh Mahajan',year:'2026'},
 {id:'team-pratik-campaign',url:'/assets/team/campaign/pratik-kumar.webp',caption:'Leadership campaign · Pratik Kumar',association:'JYC Team · Pratik Kumar',year:'2026'},
 {id:'team-shriya-campaign',url:'/assets/team/campaign/shriya-singh.webp',caption:'Leadership campaign · Shriya Singh',association:'JYC Team · Shriya Singh',year:'2026'}
];
const PUBLIC_ACTIVITIES=JYC_PUBLIC_ACTIVITIES;
function mergePublicFallback(d,{allowContentFallback=true}={}){
 const x=norm(d||{});
 const fallbackClubs=enrichSourceClubs(Object.entries(JYC_HUB_CONTENT).map(([name,p],i)=>({id:'hub-'+slug(name),name,type:p.family==='Technical'?'Technical':'Non-Technical',category:p.focus,description:p.summary,about:p.detail,interests:[p.family,p.focus],published:true,status:'published',pinned:i<5,theme:'jyc'})));
 const baseClubs=allowContentFallback&&x.clubs?.length===0?fallbackClubs:x.clubs;
 const clubs=enrichSourceClubs(baseClubs).map(club=>{const social=socialProfile(club.name);return social?{...club,socials:{...(club.socials||{}),instagram:club.socials?.instagram||social.instagram||'',linkedin:club.socials?.linkedin||social.linkedin||'',website:club.socials?.website||social.website||'',instagramHandle:club.socials?.instagramHandle||social.instagramHandle||'',socialVerifiedBy:social.verifiedBy||'',socialVerifiedOn:social.verifiedOn||''}}:club});
 const sourceGallery=mergeSourceGallery(x.gallery);
 const gallery=[...sourceGallery,...JAI_OFFICIAL_MEDIA,...(allowContentFallback?[...PDF_HUB_GALLERY,...PDF_HUB_EXTRA_GALLERY,...PUBLIC_GALLERY_FALLBACK]:[])].filter((g,i,a)=>a.findIndex(x=>x.id===g.id)===i);
 const fallbackFeatured=PUBLIC_EVENT_FALLBACK.find(e=>e.id==='agentic-ai-2026');
 const liveEvents=Array.isArray(x.events)?x.events:[];
 const events=allowContentFallback&&fallbackFeatured
   ? [fallbackFeatured,...liveEvents.filter(e=>String(e.id)!==String(fallbackFeatured.id)).map(e=>e)]
   : liveEvents;
 return {...x,clubs,events,gallery,team:allowContentFallback&&x.team?.length===0?PUBLIC_TEAM_FALLBACK:x.team,homepage:{...x.homepage,activities:Array.isArray(x.homepage?.activities)&&x.homepage.activities.length?x.homepage.activities:PUBLIC_ACTIVITIES}};
}
const TEAM_LOCAL_PHOTOS={
 'devansh tripathi':'/assets/team/campaign/devansh-tripathi.webp','amrit kumar':'/assets/team/campaign/amrit-kumar.webp','daksh sachdeva':'/assets/team/campaign/daksh-sachdeva.webp','saksham kotia':'/assets/team/campaign/saksham-kotia.webp','asmi srivastava':'/assets/team/campaign/asmi-srivastava.webp','juhi hatuka':'/assets/team/campaign/juhi-hatuka.webp','pratik kumar':'/assets/team/campaign/pratik-kumar.webp','divye bajaj':'/assets/team/divye-bajaj.webp','revant srivastava':'/assets/team/campaign/revant-srivastava.webp','aradhyaa singh':'/assets/team/campaign/aradhyaa-singh.webp','vansh mahajan':'/assets/team/campaign/vansh-mahajan.webp','shriya singh':'/assets/team/campaign/shriya-singh.webp'
};
const teamPhotoFor=m=>{const key=String(m?.name||'').trim().toLowerCase();return TEAM_LOCAL_PHOTOS[key]||m?.photo||m?.image||''};
const PUBLIC_EVENT_FALLBACK=[
 {id:'agentic-ai-2026',title:'JAI 2026 · Jaypee Agentic AI Hackathon',club:'JYC',eventType:'Agentic AI Hackathon',poster:'https://www.jiityouthclub128.in/imgs/ai-agent-face.png',summitLogo:'https://www.jiityouthclub128.in/imgs/ai-summit.png',summitTitle:'Jaypee Agentic AI International Summit 2026',description:'Build autonomous agents that can reason, make decisions, use tools, and take autonomous actions to solve real-world challenges. JAI 2026 is the flagship hackathon within the Jaypee Agentic AI International Summit at JIIT Wish Town Campus.',date:'2026-10-30',dateEnd:'2026-10-31',start:'10:30',end:'18:00',venue:'JIIT Wish Town Campus · Sector 128, Noida',published:true,featured:true,pinned:true,registrationMode:'external',registrationUrl:'https://unstop.com/o/XAfa40i?lb=yRvSl6Vl&utm_medium=Share&utm_source=online_coding_challenge&utm_campaign=Jyc128tf6988',officialUrl:'https://www.jiityouthclub128.in/',discordUrl:'https://discord.gg/K6vrFAhMA',teamSize:'2–5 members',participation:'Inter-college & international teams',eligibility:'Open to inter-college and international teams. Teams should have 2–5 members.',prizes:['INR 15 Lakh hackathon prize pool','INR 1 Crore pre-seed funding pool driven by the RIDE initiative'],highlights:['30–31 October 2026','4 tracks: Cybersecurity · Healthcare · Natural Language Processing · Open Innovation','Build autonomous agents with reasoning, tool use, APIs, data and multi-agent collaboration','Team size: 2–5 members','Inter-college & international participation','Part of the Jaypee Agentic AI International Summit 2026'],tracks:[{name:'Cybersecurity',detail:'Agentic AI for vulnerability detection, automated threat containment and zero-trust workflows.'},{name:'Healthcare',detail:'Clinical decision support, biomedical data synthesis and autonomous patient-monitoring workflows.'},{name:'Natural Language Processing',detail:'Multi-turn agents, language reasoning, autonomous dialogue and semantic workflows.'},{name:'Open Innovation',detail:'Cross-disciplinary applications across society, sustainability, education, economics and robotics.'}],summitStats:['4 thematic tracks','6 summit engagement events','INR 15 Lakh prize pool','INR 1 Crore pre-seed pool'],sponsor:'RIDE Initiative',contact:{sponsorship:'sponsorquery.jai@gmail.com',hackathon:'hackathonquery.jai@gmail.com',secretariat:'jiityouthclub128@gmail.com'},mapUrl:'https://eventss.google.com/?q=Jaypee+Institute+of+Information+Technology+Sector+128+Noida',timeline:[{time:'10:30–12:00',title:'Inauguration & Expo Opening',description:'Day 1 · Friday, 30 October 2026.'},{time:'12:30–13:30',title:'Panel Discussion',description:'Day 1 · industry and thought-leadership session.'},{time:'13:30–14:00',title:'Hackathon Briefing',description:'Day 1 · competition briefing.'},{time:'15:00–17:30',title:'Hackathon · Round 1',description:'Day 1 · first build round.'},{time:'17:30–20:00',title:'Hackathon · Round 2',description:'Day 1 · second build round.'},{time:'10:00–10:30',title:'Expo Visit',description:'Day 2 · Saturday, 31 October 2026.'},{time:'10:30–12:00',title:'Networking & Industry Meet-Up',description:'Day 2 · networking session.'},{time:'12:30–13:30',title:'VIP Interaction & Networking',description:'Day 2 · official summit programme.'},{time:'13:30–16:00',title:'Hackathon · Final Round',description:'Day 2 · final build and presentation round.'},{time:'16:30–17:00',title:'Tech Talk',description:'Day 2 · technology session.'},{time:'17:00–18:00',title:'Closing Ceremony',description:'Day 2 · summit close.'}]},
 {id:'converge-2026',title:'Converge 2026',club:'JYC / CICR',eventType:'Technical Fest',poster:'/assets/events/converge-2026.webp',description:'A major JIIT technical experience featuring robotics and competitive campus challenges.',date:'2026-03-14',start:'09:00',end:'18:00',venue:'JIIT Sector 128',published:true,archived:true,highlights:['14–15 March 2026','RoboSoccer','RoboRace']}
];
function publicDemoData(){
 const clubs=Object.entries(JYC_HUB_CONTENT).map(([name,p],i)=>({id:`hub-${name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,name,type:p.family==='Technical'?'Technical':'Non-Technical',category:p.focus,description:p.summary,about:p.detail,interests:[p.family,p.focus],published:true,status:'published',pinned:i<5,theme:'jyc'}));
 return mergePublicFallback(norm({...empty,clubs,events:PUBLIC_EVENT_FALLBACK,gallery:PUBLIC_GALLERY_FALLBACK,team:PUBLIC_TEAM_FALLBACK,homepage:{...empty.homepage,activities:PUBLIC_ACTIVITIES}}));
}
import { normalizeSearch, rankSearchResults } from './lib/search.js';
import {CREATOR,JYC_CONTACTS} from './lib/site-config.js';

import {MomentsSection} from './v14-platform.jsx';
import {SkipLink,InstallPrompt,MaintenanceGate,ErrorBoundary,EventTools,DownloadICS,JsonLd,usePageMeta,Gallery,GalleryItems,RecruitmentHub} from './extra-features.jsx';
const Admin=lazy(()=>import('./admin-chunk.jsx'));
import {readSiteCache,writeSiteCache,siteCacheAge,formatCacheAge,armStoredReminders,googleCalendarUrl} from './v15-functional.js';

const logo='/jyc-logo-official.webp';
const logoFallback='/jyc-logo-circle.png';
function LogoImage({alt='',...props}){
 return <img {...props} src={logo} alt={alt} onError={e=>{if(e.currentTarget.dataset.fallback==='1')return;e.currentTarget.dataset.fallback='1';e.currentTarget.src=logoFallback}}/>;
}
const isFestMode=data=>String(data?.mode||'events').toLowerCase()==='fest';
const recruitmentEnabled=data=>data?.flags?.recruitmentHub!==false;

const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
const storageGet=(key,fallback=null)=>{try{const value=localStorage.getItem(key);return value===null?fallback:value}catch{return fallback}};
const storageSet=(key,value)=>{try{localStorage.setItem(key,String(value));return true}catch{return false}};
const storageRemove=(key)=>{try{localStorage.removeItem(key);return true}catch{return false}};
const empty={clubs:[],events:[],gallery:[],team:[],categories:{Technical:[], 'Non-Technical':[]},announcement:{on:false,text:'',link:''},maintenance:{on:false,title:'JYC is getting ready.',message:'We’re making a few improvements. Please check back shortly.'},flags:{recruitmentHub:true,pwaInstall:true,eventQr:true,advancedSearch:true,analytics:true},academicCalendar:{public:true,showInCalendar:true,showInSearch:true},mode:'events',fest:null,homepage:{heroEyebrow:'JIIT · SECTOR 128 · NOIDA',heroTitle:'THE VOICE. THE TALENT. THE SPIRIT.',heroSubtitle:'JIIT YOUTH CLUB · JIIT 128',heroLead:'JYC is the student-governed organisation that brings JIIT communities, events, creativity, technology, sport and campus spirit together.',heroPrimaryCta:'Explore Clubs ↗',heroSecondaryCta:"What's Next →",quick1Title:'About JYC',quick1Text:'Know the community →',quick2Title:'Clubs',quick2Text:'Find your community →',quick3Title:'Connect',quick3Text:'Find JYC online →',aboutTitle:'The JYC story belongs here.',aboutText:'JIIT Youth Club (JYC) is the student-led coordinating body for co-curricular life at JIIT Sector 128. It connects the apex student body, hubs and societies, coordinators, volunteers and festival committees so students can discover communities, build skills and create campus experiences together.',principles:[{title:'Student-led, faculty-advised',text:'JYC combines faculty guidance with an apex student body, hub coordinators, volunteers and festival committees.'},{title:'Five community families',text:'The supplied orientation material names 21 communities across Cultural, Technical, Creative, Literary and Sports families; the public count is derived from those named entries.'},{title:'A year-round campus rhythm',text:'Induction, Ebullience, hackathons, Ethnic Day, Converge, Dron-O-War and Farewell sit alongside recurring hub activities.'}],eventsEyebrow:"WHAT'S NEXT",eventsTitle:'What happens next.',eventsText:'Upcoming experiences stay chronological. Live events surface automatically.',clubsEyebrow:'JYC CLUBS',clubsTitle:'Official JYC clubs.',clubsText:'Technical, non-technical, creative, cultural and everything between.',galleryEyebrow:'GALLERY',galleryTitle:'A visual archive in the making.',galleryText:'Official JYC images will appear here as they are published.',activitiesEyebrow:'WHAT WE DO',activitiesTitle:'Make space for participation.',activitiesText:'See how JYC connects communities, events, creativity and participation.',activities:[],ctaEyebrow:'READY TO SOAR',ctaTitle:'One campus. Many ways to belong.',ctaText:'Explore the public JYC experience and find your next community.',ctaButton:'Explore JYC ↗',jtvUrl:'',compactHome:true,layout:['intro','events','activities','clubs','moments','journal','hubPhotoWall','team','cta'],showClubs:true,showEvents:true,showGallery:true},creator:CREATOR,certificates:[],campusMap:{mapUrl:'',locations:[]}};
const clubTemplate={name:'',type:'Technical',category:'',description:'',logo:'',banner:'',about:'',interests:[],instagram:'',whatsapp:'',website:'',linkedin:'',youtube:'',president:'',vicePresident:'',secretary:'',heads:[],recruitment:{on:false,title:'Recruitment Open',link:'',deadline:''},achievements:[],projects:[],customSections:[],theme:'jyc',pinned:false,published:false,status:'draft'};
const eventTemplate={title:'',clubId:'',club:'',eventType:'',poster:'',description:'',date:'',start:'',end:'',venue:'',registrationMode:'external',registrationUrl:'',registrationDeadline:'',map_url:'',contactName:'',contactPhone:'',contactEmail:'',speaker:'',guest:'',highlights:[],rules:[],eligibility:'',prizes:[],faqs:[],galleryIds:[],featured:false,pinned:false,published:false,archived:false};
function norm(d){
  const x=d||{};
  const clubs=Array.isArray(x.clubs)?x.clubs:[];
  const events=Array.isArray(x.events)?x.events:[];
  const gallery=Array.isArray(x.gallery)?x.gallery:[];
  return {
    ...empty,...x,
    clubs,
    events:events.map(e=>({...e,club:e.club||clubs.find(c=>String(c.id)===String(e.clubId))?.name||'JYC'})),
    gallery,
    team:Array.isArray(x.team)?x.team:[],
    categories:x.categories||empty.categories,
    announcement:{...empty.announcement,...(x.announcement||{})},
    academicCalendar:{...empty.academicCalendar,...(x.academicCalendar||{})},
    campusMap:{...empty.campusMap,...(x.campusMap||{}),locations:Array.isArray(x.campusMap?.locations)?x.campusMap.locations:empty.campusMap.locations},
    certificates:Array.isArray(x.certificates)?x.certificates:empty.certificates,
    homepage:{...empty.homepage,...(x.homepage||{}),principles:Array.isArray(x.homepage?.principles)&&x.homepage.principles.length?x.homepage.principles:empty.homepage.principles,layout:Array.isArray(x.homepage?.layout)&&x.homepage.layout.length?x.homepage.layout:empty.homepage.layout},
    creator:CREATOR
  }
}
function stripLegacySeed(d){return norm(d)}
async function loadData(){if(supabase.__configured===false){const cached=readSiteCache();const usable=cached&&((cached.clubs||[]).length||(cached.events||[]).length||(cached.team||[]).length);if(usable)return mergePublicFallback(stripLegacySeed(cached),{allowContentFallback:false});if(import.meta.env.DEV)return publicDemoData();return norm(empty)}const {data,error}=await supabase.rpc('jyc_read_site_data');if(error){const message=String(error.message||'');const missingRpc=/Could not find the function public\.jyc_read_site_data|function public\.jyc_read_site_data|PGRST202|404|Not Found/i.test(message);if(missingRpc){const e=new Error('JYC data service is not deployed. Run supabase/FINAL-PRODUCTION-REPAIR.sql in the connected Supabase project, then refresh.');e.code='JYC_RPC_MISSING';throw e}throw error}return mergePublicFallback(stripLegacySeed(data||empty),{allowContentFallback:false})}
async function saveData(next,user,action,entity='site',id='main'){const payload=norm(next);let result=await supabase.rpc('jyc_save_site_data',{p_data:payload,p_action:action,p_entity_type:entity,p_entity_id:String(id||'main')});if(result.error&&/Could not find the function public\.jyc_save_site_data|schema cache/i.test(result.error.message||'')){result=await supabase.rpc('jyc_save_site_data',{p_action:action,p_data:payload,p_entity_id:String(id||'main'),p_entity_type:entity})}if(result.error)throw result.error;return stripLegacySeed(result.data)}
async function compressImage(file){if(file.size<900*1024)return file;const bitmap=await createImageBitmap(file);const max=2200;const scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.82));return blob?new File([blob],(file.name.replace(/\.[^.]+$/,'')||'image')+'.webp',{type:'image/webp'}):file}
async function uploadMedia(file,folder='general'){if(!file)throw Error('Choose an image first.');if(!file.type.startsWith('image/'))throw Error('Only image files are allowed.');if(file.size>8*1024*1024)throw Error('Image must be 8 MB or smaller.');const optimized=await compressImage(file);return uploadJycMedia(optimized,folder)}
async function enablePushNotifications(){if(!('serviceWorker' in navigator)||!('PushManager' in window))throw Error('Web push is not supported in this browser.');const vapid=import.meta.env.VITE_VAPID_PUBLIC_KEY;if(!vapid)throw Error('VITE_VAPID_PUBLIC_KEY is not configured yet.');const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('Notification permission was not granted.');const registration=await navigator.serviceWorker.ready;let subscription=await registration.pushManager.getSubscription();if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(vapid)});const {data:userData}=await supabase.auth.getUser();const {error}=await supabase.from('jyc_push_subscriptions').upsert({endpoint:subscription.endpoint,subscription:subscription.toJSON(),user_id:userData?.user?.id||null},{onConflict:'endpoint'});if(error)throw error;return true}
function urlBase64ToUint8Array(base64String){const padding='='.repeat((4-base64String.length%4)%4);const base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/');const raw=atob(base64);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))}

function eventState(e){if(!e?.date)return 'draft';const start=Date.parse(`${e.date}T${e.start||'00:00'}`);const effectiveEndDate=e.dateEnd||e.date;const end=Date.parse(`${effectiveEndDate}T${e.end||'23:59'}`);const now=Date.now();if(!Number.isFinite(start)||!Number.isFinite(end))return 'draft';if(now<start)return 'upcoming';if(now<=end)return 'live';return 'past'}
function fmtDate(s){if(!s)return 'Date TBA';return new Date(`${s}T12:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
function safeExternalUrl(value){const raw=String(value||'').trim();if(!raw)return '';try{const u=new URL(raw,window.location.origin);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
function slug(s){return String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
const findEntity=(rows,key)=>rows.find(x=>x.id===key||slug(x.name||x.title)===slug(key));

function SiteAtmosphere(){
 const stars=React.useMemo(()=>Array.from({length:72},(_,i)=>({
  x:`${(i*47+11)%97}%`,y:`${(i*71+7)%94}%`,s:`${i%11===0?2.2:i%4===0?1.5:1}px`,d:`${4.5+(i%9)*.8}s`
 })),[]);
 return <div className="site-atmosphere" aria-hidden="true">
  <div className="site-star-field">{stars.map((star,i)=><i key={i} className="site-star" style={{'--x':star.x,'--y':star.y,'--s':star.s,'--d':star.d}}/> )}</div>
  <div className="constellation-field" aria-hidden="true">
   <svg viewBox="0 0 1200 700" preserveAspectRatio="none">
    <g>
     <polyline points="90,120 155,92 215,132 268,82 330,116"/>
     <circle cx="90" cy="120" r="2"/><circle cx="155" cy="92" r="1.5"/><circle cx="215" cy="132" r="1.8"/><circle cx="268" cy="82" r="2.2"/><circle cx="330" cy="116" r="1.5"/>
    </g>
    <g>
     <polyline points="890,155 940,105 1002,128 1065,78 1125,112 1160,72"/>
     <circle cx="890" cy="155" r="1.6"/><circle cx="940" cy="105" r="2"/><circle cx="1002" cy="128" r="1.5"/><circle cx="1065" cy="78" r="2.1"/><circle cx="1125" cy="112" r="1.5"/><circle cx="1160" cy="72" r="1.8"/>
    </g>
    <g>
     <polyline points="760,520 810,475 870,500 920,445 975,470"/>
     <circle cx="760" cy="520" r="1.6"/><circle cx="810" cy="475" r="1.5"/><circle cx="870" cy="500" r="2"/><circle cx="920" cy="445" r="1.6"/><circle cx="975" cy="470" r="1.5"/>
    </g>
   </svg>
  </div>
  <div className="light-dust"/>
  <div className="atmosphere-glow atmosphere-glow-a"/>
  <div className="atmosphere-glow atmosphere-glow-b"/>
  <div className="shooting-star shooting-one"/>
  <div className="shooting-star shooting-two"/>
 </div>
}

function App(){const loc=useLocation();const nav=useNavigate();const [data,setData]=useState(()=>import.meta.env.DEV?publicDemoData():norm(empty));const [loading,setLoading]=useState(true);const [bootReady,setBootReady]=useState(false);const [bootStage,setBootStage]=useState('INITIALIZING');const [error,setError]=useState('');const [online,setOnline]=useState(()=>navigator.onLine!==false);const [theme,setTheme]=useState(()=>storageGet('jyc-theme','light')==='dark'?'dark':'light');const [session,setSession]=useState(null);const [admin,setAdmin]=useState(null);const [toast,setToast]=useState(null);const [confirm,setConfirm]=useState(null);
 useEffect(()=>{const onToast=e=>notify(e.detail?.message||'',e.detail?.type||'success');const onConfirm=e=>setConfirm(e.detail||null);window.addEventListener('jyc-toast',onToast);window.addEventListener('jyc-confirm',onConfirm);return()=>{window.removeEventListener('jyc-toast',onToast);window.removeEventListener('jyc-confirm',onConfirm)}},[]);
 useEffect(()=>{const on=()=>setOnline(true),off=()=>setOnline(false);window.addEventListener('online',on);window.addEventListener('offline',off);return()=>{window.removeEventListener('online',on);window.removeEventListener('offline',off)}},[]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;storageSet('jyc-theme',theme);document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0f1420':'#efe3cb');},[theme]);
 useEffect(()=>{const low=Boolean(navigator.connection?.saveData||((navigator.deviceMemory||8)<4)||((navigator.hardwareConcurrency||8)<4));document.documentElement.dataset.performance=low?'lite':'full';document.documentElement.dataset.reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'true':'false'},[]);
 useEffect(()=>{const id=setTimeout(()=>setBootStage(readSiteCache()?'SYNCING':'LOADING'),420);return()=>clearTimeout(id)},[]);
 useEffect(()=>{let alive=true;const cached=readSiteCache();if(cached){setData(stripLegacySeed(cached));setLoading(false);setBootStage('SYNCING')}const refresh=async()=>{try{const next=await Promise.race([loadData(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Supabase is taking too long to respond.')),6500))]);if(alive){setData(next);writeSiteCache(next);setError('');setBootStage('READY');armStoredReminders(next.events||[])}}catch(e){if(alive){setError(e?.message||'Could not load JYC content.');setBootStage(cached?'READY':'OFFLINE')}}finally{if(alive)setLoading(false)}};refresh();const retry=()=>refresh();window.addEventListener('jyc-refresh-data',retry);supabase.auth.getSession().then(({data:{session:s}})=>resolve(s)).catch(()=>{});const {data:l}=supabase.auth.onAuthStateChange((_,s)=>resolve(s));return()=>{alive=false;l.subscription.unsubscribe();window.removeEventListener('jyc-refresh-data',retry)}},[]);
 const resolve=async s=>{setSession(s);if(!s?.user){setAdmin(null);return}let q=await supabase.from('jyc_admins').select('role,display_name,is_active,club_id').eq('user_id',s.user.id).eq('is_active',true).maybeSingle();if(q.error){q=await supabase.from('jyc_admins').select('role,display_name,is_active').eq('user_id',s.user.id).eq('is_active',true).maybeSingle()}if(q.data)setAdmin({userId:s.user.id,email:s.user.email||'',name:q.data.display_name||'JYC Administrator',role:q.data.role||'jyc_admin',clubId:q.data.club_id||null});else setAdmin(null)};
 const commit=async(next,action,entity,id)=>{if(!admin?.userId)throw Error('Administrator session expired. Please log in again.');const saved=await saveData(next,admin.userId,action,entity,id);setData(saved);writeSiteCache(saved);try{const latest=await supabase.from('jyc_content_versions').select('version_number').eq('entity_type',entity||'site').eq('entity_id',String(id||'main')).order('version_number',{ascending:false}).limit(1).maybeSingle();const version=(latest.data?.version_number||0)+1;await supabase.from('jyc_content_versions').insert({entity_type:entity||'site',entity_id:String(id||'main'),version_number:version,snapshot:next,changed_by:admin.userId,change_summary:action})}catch{}try{if(admin.role==='club_admin'&&(entity==='club'||entity==='event'))await supabase.from('jyc_content_reviews').insert({entity_type:entity,entity_id:String(id||'main'),submitted_by:admin.userId,status:'submitted',review_note:'Submitted from Club Admin Control Center.'})}catch{}notify('Saved successfully');return saved};
 const notify=(m,type='success')=>{setToast({message:m,type});setTimeout(()=>setToast(null),2800)};
 useEffect(()=>{window.scrollTo({top:0,behavior:'smooth'})},[loc.pathname]);
 useEffect(()=>{
   const nodes=[...document.querySelectorAll('.reveal')];
   if(!nodes.length)return;
   if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
     nodes.forEach(n=>n.classList.add('is-visible'));
     return;
   }
   const observer=new IntersectionObserver((entries)=>{
     entries.forEach(entry=>{
       if(entry.isIntersecting){
         entry.target.classList.add('is-visible');
         observer.unobserve(entry.target);
       }
     });
   },{threshold:.12,rootMargin:'0px 0px -40px'});
   nodes.forEach((node,index)=>{
     node.style.setProperty('--reveal-delay',`${Math.min(index*35,280)}ms`);
     observer.observe(node);
   });
   return()=>observer.disconnect();
 },[loc.pathname,data]);
 useEffect(()=>{if(!('serviceWorker' in navigator))return; if(import.meta.env.DEV){navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))).catch(()=>{}); if('caches' in window)caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).catch(()=>{}); return;} navigator.serviceWorker.register('/sw.js').catch(()=>{})},[]);
 useEffect(()=>{try{const key='jyc-pageviews';const views=JSON.parse(storageGet(key,'{}'));views[loc.pathname]=(views[loc.pathname]||0)+1;views.total=(views.total||0)+1;storageSet(key,JSON.stringify(views))}catch{}},[loc.pathname]);
 useEffect(()=>{if(import.meta.env.VITE_ENABLE_ANALYTICS!=='true'||!data.flags?.analytics)return;let sessionKey=storageGet('jyc-analytics-session');if(!sessionKey){sessionKey=uid();storageSet('jyc-analytics-session',sessionKey)}supabase.from('jyc_page_views').insert({path:loc.pathname,referrer:document.referrer||null,session_key:sessionKey}).then(()=>{}).catch(()=>{})},[loc.pathname,data.flags?.analytics]);
 useEffect(()=>{const report=(message,stack)=>{supabase.functions.invoke('error-report',{body:{message:String(message||'Unknown error').slice(0,2000),stack:stack||null,path:location.pathname,user_agent:navigator.userAgent}}).catch(()=>{})};const onError=e=>report(e.message,e.error?.stack);const onReject=e=>report(e.reason?.message||e.reason,e.reason?.stack);window.addEventListener('error',onError);window.addEventListener('unhandledrejection',onReject);return()=>{window.removeEventListener('error',onError);window.removeEventListener('unhandledrejection',onReject)}},[]);
 useEffect(()=>{if(loading)return;const minimum=readSiteCache()?1450:1800;const id=setTimeout(()=>setBootReady(true),minimum);return()=>clearTimeout(id)},[loading]);
  if(!bootReady)return <Loading stage={bootStage} cached={Boolean(readSiteCache())}/>;
  const connectionNotice=(!online||error)?<div className={`connection-notice ${readSiteCache()?'cached':'offline'} ${error==='JYC data service is not deployed. Run supabase/FINAL-PRODUCTION-REPAIR.sql in the connected Supabase project, then refresh.'?'setup-needed':''}`} role="status"><span>{!online?'You are offline. JYC will keep using cached content until the connection returns.':error==='JYC data service is not deployed. Run supabase/FINAL-PRODUCTION-REPAIR.sql in the connected Supabase project, then refresh.'?'JYC data service needs setup.':readSiteCache()?`Showing the last saved JYC snapshot · ${formatCacheAge(siteCacheAge())}.`:'JYC content is currently offline.'}</span><button onClick={()=>window.dispatchEvent(new CustomEvent('jyc-refresh-data'))}>Refresh</button></div>:null;
 const isAdmin=loc.pathname.startsWith('/admin');
 const content=<div className="app-frame"><ScrollProgress/><BackToTop/><SkipLink/>{!isAdmin&&<><Navbar data={data} admin={admin} theme={theme} setTheme={setTheme}/></>} {connectionNotice}<div id="main-content" className={isAdmin?'app admin-app':'app public-app'}><div className="route-stage" key={`${loc.pathname}${loc.search}`}><Routes data={data} admin={admin} session={session} setAdmin={setAdmin} commit={commit} notify={notify} theme={theme} setTheme={setTheme}/></div></div>{!isAdmin&&<Footer data={data} admin={admin}/>} {toast&&<div className={`toast toast-${toast.type||'success'}`} role="status"><span>{toast.type==='error'?'!':'✓'}</span>{toast.message}</div>} {confirm&&<ConfirmDialog request={confirm} onClose={ok=>{confirm.resolve?.(ok);setConfirm(null)}}/>}<InstallPrompt/></div>;
 return <MaintenanceGate data={isAdmin?{maintenance:{on:false}}:data}>{content}</MaintenanceGate>}

function ClubDetail({data,id,virtualName}){
 const liveClub=findEntity(data.clubs,id);
 const virtualProfile=virtualName?JYC_HUB_CONTENT[virtualName]:null;
 const c=liveClub|| (virtualProfile?{id:`hub-${slug(virtualName)}`,name:virtualName,type:virtualProfile.family==='Technical'?'Technical':'Non-Technical',category:virtualProfile.family,description:virtualProfile.summary,about:virtualProfile.detail,interests:[virtualProfile.focus],theme:'jyc',published:true,status:'published',heads:[],achievements:[],projects:[],customSections:[],recruitment:{on:false},...(JYC_SOCIALS[virtualName]||{})}:null);
 if(!c||(!virtualProfile&&(!c.published||c.status==='archived')))return <section className="section page"><Back label="Back to clubs" to="/clubs"/><State title="Club not found." text="This club may be unpublished or archived."/></section>;
 const sections=[...(c.customSections||[])].filter(s=>s.visible!==false);
 const events=data.events.filter(e=>e.published&&!e.archived&&(e.clubId===c.id||e.club===c.name)).sort((a,b)=>`${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
 const sourceStory=PDF_HUB_STORIES.find(x=>String(x.name).toLowerCase()===String(c.name).toLowerCase());
 const sourceGallery=[...PDF_HUB_GALLERY,...PDF_HUB_EXTRA_GALLERY].filter(g=>String(g.association||'').trim().toLowerCase()===String(c.name).trim().toLowerCase());
 const gallery=[...data.gallery.filter(g=>g.clubId===c.id||g.association===c.name||g.association==='club:'+c.id),...sourceGallery].filter((g,i,a)=>a.findIndex(x=>x.id===g.id)===i);
 const links=[['Instagram',c.instagram],['WhatsApp',c.whatsapp],['Website',c.website],['LinkedIn',c.linkedin],['YouTube',c.youtube]].filter(x=>x[1]);
 const leadership=[['President',c.president],['Vice President',c.vicePresident],['Secretary',c.secretary]].filter(x=>x[1]);
 const clubTheme='jyc';
 const profile=hubProfile(c);
 const detail=hubDetails(c.name);
 const identity=hubIdentity(c.name);
 const identityStyle={'--hub-accent':identity.accent,'--hub-accent-soft':`color-mix(in srgb, ${identity.accent} 16%, transparent)`,'--hub-accent-line':`color-mix(in srgb, ${identity.accent} 34%, transparent)`,'--identity-shape':`var(--jyc-shape-${identity.shape||'community'})`};
 const relatedHubs=profile?Object.entries(JYC_HUB_CONTENT).filter(([name,p])=>p.family===profile.family&&name.toLowerCase()!==c.name.toLowerCase()).slice(0,4):[];
 return <section className={`section page club-detail club-detail-v41 club-theme-${clubTheme} club-identity-page`} data-hub={slug(c.name)} style={identityStyle}><Breadcrumbs items={[{label:'Clubs',href:'/clubs'},{label:c.name}]}/>
  <Back label="Back to clubs" to="/clubs"/>
  <div className="club-detail-hero reveal" style={{...identityStyle,'--club-banner':c.banner?`url(${c.banner})`:'none',...(c.banner?{backgroundImage:`linear-gradient(90deg,var(--jyc-light-surface) 0%,color-mix(in srgb,var(--jyc-light-surface) 88%,transparent) 48%,transparent 100%),url(${c.banner})`}: {})}}>
   <div className="club-hero-copy"><span className="eyebrow">{c.type} · {c.category||'COMMUNITY'}</span><h1>{c.name}</h1><p>{c.description||'An official JYC community.'}</p><div className="club-hero-actions">{links[0]&&safeExternalUrl(links[0][1])&&<a className="btn secondary" href={safeExternalUrl(links[0][1])} target="_blank" rel="noopener noreferrer">Connect ↗</a>}<ShareButton title={`Share ${c.name}`}/></div></div>
   <div className="detail-logo-wrap"><div className="detail-logo">{c.logo?<img src={c.logo} alt={c.name}/>:<LogoImage alt="JYC"/>}</div><span>JIIT · SECTOR 128</span></div>
  </div>
  {socialProfile(c.name)&&<section className="club-social-proof reveal" aria-label={`${c.name} official social links`}><div><span className="eyebrow">OFFICIAL CONNECTIONS</span><h2>Find {c.name} where the community is active.</h2><p>These links were checked against public club, Linktree, LinkedIn or official event material. JYC keeps the profile here as the structured source of truth.</p></div><div className="club-social-proof-links">{socialProfile(c.name).instagram&&<a href={socialProfile(c.name).instagram} target="_blank" rel="noopener noreferrer"><b>Instagram</b><span>{socialProfile(c.name).instagramHandle||'Official profile'} ↗</span></a>}{socialProfile(c.name).linkedin&&<a href={socialProfile(c.name).linkedin} target="_blank" rel="noopener noreferrer"><b>LinkedIn</b><span>Official organisation page ↗</span></a>}{socialProfile(c.name).website&&<a href={socialProfile(c.name).website} target="_blank" rel="noopener noreferrer"><b>Website</b><span>{socialProfile(c.name).label||'Official website'} ↗</span></a>}</div></section>}
  {profile&&<div className="hub-profile-banner reveal"><div><span className="eyebrow">HUB PROFILE · {profile.family}</span><h2>{profile.name}</h2><p className="large-copy">{profile.detail}</p></div><div className="hub-profile-meta"><span>Focus</span><strong>{profile.focus}</strong><span>{profile.summary}</span><span>Source: supplied JYC hub orientation material; current operational details should be updated through the Control Center.</span></div></div>}
  <section className="hub-identity-rail reveal" aria-label={`${c.name} community identity`}><div className="hub-identity-mark"><span className="hub-identity-display"><i className="hub-identity-glyph">{identity.glyph||'◆'}</i>{identity.motif}</span><b>{identity.signature}</b><small>{c.sourceMediaLabel||'Source-grounded identity'}</small></div><div className="hub-identity-traits">{identity.traits.map((t,i)=><span key={t}><small>0{i+1}</small>{t}</span>)}</div><span className="hub-identity-display">{identity.display||'JYC COMMUNITY'}</span></section>
  <section className="hub-evidence-rail reveal" aria-label={`${c.name} public profile evidence`}><div><span className="eyebrow">AT A GLANCE</span><h3>Know the community before you join.</h3><p>Orientation and hub material provide the context layer. Published JYC records provide the live layer for events, recruitment and current people.</p></div><div className="hub-evidence-stats"><span><b>{profile?.family||c.type||'JYC'}</b><small>FAMILY</small></span><span><b>{profile?.focus||c.category||'Community'}</b><small>FOCUS</small></span><span><b>{detail?.activities?.length||0}</b><small>ACTIVITY AREAS</small></span><span><b>{gallery.length}</b><small>ARCHIVE ITEMS</small></span></div></section>
  {detail&&<section className="hub-detail-system reveal"><div className="hub-detail-intro"><span className="eyebrow">WHAT YOU'LL FIND HERE</span><h2>{detail.label}</h2><p>{detail.experience}</p></div><div className="hub-detail-columns"><div><span className="eyebrow">ACTIVITIES</span><div className="hub-detail-tags">{detail.activities.map(x=><span key={x}>{x}</span>)}</div></div>{detail.signature?.length>0&&<div><span className="eyebrow">SIGNATURE EXPERIENCES</span><ul className="hub-signature-list">{detail.signature.map((x,i)=><li key={x}><b>{String(i+1).padStart(2,'0')}</b><span>{x}</span></li>)}</ul></div>}</div>{sourceHubMedia(c.name).photos.length>0&&<div className="hub-source-photo-strip" aria-label={`${c.name} source photography`}>{sourceHubMedia(c.name).photos.slice(0,8).map((src,i)=><figure key={src}><img src={src} alt={`${c.name} supplied JYC material ${i+1}`} loading="lazy"/><figcaption>Source visual {String(i+1).padStart(2,"0")}</figcaption></figure>)}</div>}</section>}
  {sourceStory&&<section id="club-source" className="club-source-story reveal"><div className="club-source-story-copy"><span className="eyebrow">JYC STORY · SUPPLIED HUB MATERIAL</span><h2>{sourceStory.name}: {sourceStory.focus}</h2><p className="large-copy">{sourceStory.text}</p><a className="text-link" href="/archive">See the wider JYC archive →</a></div><div className="club-source-story-image"><img src={sourceStory.image} alt={`${sourceStory.name} supplied hub story`} loading="lazy"/></div></section>}
  <div className="club-detail-nav reveal"><a href="#club-about">About</a><a href="#club-source">Source</a>{leadership.length||(c.heads||[]).length?<a href="#club-team">Team</a>:null}{c.recruitment?.on?<a href="#club-join">Join</a>:null}{events.length?<a href="#club-events">Events</a>:null}{gallery.length?<a href="#club-gallery">Gallery</a>:null}</div>
  <div className="club-detail-layout">
   <main>
    {c.about&&<section id="club-about" className="club-section-card reveal"><span className="eyebrow">ABOUT THE CLUB</span><h2>{'About '+c.name}</h2><p className="large-copy">{c.about}</p></section>}
    {(c.interests||[]).length>0&&<section className="club-section-card reveal"><span className="eyebrow">AREAS OF INTEREST</span><h2>What this club explores.</h2><div className="interest-cloud">{c.interests.map(x=><span key={x}>{x}</span>)}</div></section>}
    {(leadership.length||(c.heads||[]).length>0)&&<section id="club-team" className="club-section-card reveal"><span className="eyebrow">PEOPLE</span><h2>The people behind the club.</h2><div className="leadership-grid">{leadership.map(([r,n])=><div className="leader-card" key={r}><span>{r}</span><strong>{n}</strong></div>)}{(c.heads||[]).map((h,i)=><div className="leader-card" key={i}><span>{h.role||'Head'}</span><strong>{h.name||h}</strong></div>)}</div></section>}
    {c.recruitment?.on&&<section id="club-join" className="club-section-card join-section reveal"><span className="eyebrow">JOIN THE CLUB</span><h2>There is a place for you here.</h2><div className="join-grid"><div className="join-card recruitment-card"><span className="tag">RECRUITMENT</span><h3>{c.recruitment.title||'Recruitment is open'}</h3>{c.recruitment.deadline&&<p>Deadline · {c.recruitment.deadline}</p>}{safeExternalUrl(c.recruitment.link)?<a className="btn" href={safeExternalUrl(c.recruitment.link)} target="_blank" rel="noopener noreferrer">Registration ↗</a>:<span className="muted-note">Application details will be published by the club.</span>}</div></div></section>}
    {c.achievements?.length>0&&<section className="club-section-card reveal"><span className="eyebrow">ACHIEVEMENTS</span><h2>What the club has built.</h2><ul className="feature-list">{c.achievements.map((x,i)=><li key={i}>{typeof x==='string'?x:x.text}</li>)}</ul></section>}
    {sections.map((x,i)=><section className="club-section-card reveal" key={x.id||x.title||i}><span className="eyebrow">CLUB SECTION</span><h2>{x.title}</h2>{x.type==='image'&&x.image&&<img className="section-image" src={x.image} alt=""/>}<p className="large-copy">{x.content}</p></section>)}
    {events.length>0&&<section id="club-events" className="club-section-card reveal"><div className="section-inline-head"><div><span className="eyebrow">EVENTS</span><h2>Featured experiences from {c.name}.</h2></div><a className="text-link" href="/events">All events →</a></div><div className="card-grid">{events.slice(0,4).map(e=><EventCard e={e} key={e.id}/>)}</div></section>}
    {gallery.length>0&&<section id="club-gallery" className="club-section-card reveal"><span className="eyebrow">GALLERY</span><h2>Moments from the club.</h2><GalleryItems items={gallery}/></section>}<HubLatestUpdates hub={c.name}/>
    {relatedHubs.length>0&&<section className="club-section-card reveal hub-related-section"><div className="section-inline-head"><div><span className="eyebrow">SAME JYC FAMILY</span><h2>Explore nearby communities.</h2></div><a className="text-link" href="/clubs">All communities →</a></div><div className="hub-related-grid">{relatedHubs.map(([name,p])=><a key={name} className="hub-related-card" href={`/clubs/${slug(name)}`}><small>{p.focus}</small><strong>{name}</strong><span>{p.summary}</span><b>Explore →</b></a>)}</div></section>}
   </main>
   <aside className="club-side-panel reveal"><span className="eyebrow">THE COMMUNITY</span><h3>{c.name}</h3><p>Explore this JYC community, its work, events and official connections.</p>{events.length>0&&<div className="club-next-event"><span>NEXT UP</span><strong>{events[0].title}</strong><small>{fmtDate(events[0].date)} · {events[0].start||'TBA'}</small></div>}{links.map(([n,u])=>safeExternalUrl(u)?<a className="side-link" key={n} href={safeExternalUrl(u)} target="_blank" rel="noopener noreferrer"><span>{n}</span><b>↗</b></a>:null)}<div className="side-divider"/><span className="eyebrow">JYC</span><p className="small-copy">JIIT Youth Club · Sector 128, Noida</p></aside>
  </div>
 </section>
}
function Team({data}){
 const nav=useNavigate();
 const members=data.team.filter(m=>m.published===true);
 const faculty=members.filter(m=>/faculty|advisor|coordinator/i.test(String(m.role||m.position||'')));
 const apex=members.filter(m=>/president|vice president|general secretary|joint secretary|finance secretary|treasurer/i.test(String(m.role||m.position||''))&&!/faculty/i.test(String(m.role||'')));
 const core=members.filter(m=>!faculty.includes(m)&&!apex.includes(m));
 const MemberCard=({m,index})=><article className="team-layer-card reveal" key={m.id||m.name||index}>
   <div className="team-photo-editorial">{teamPhotoFor(m)?<img src={teamPhotoFor(m)} alt={m.name||'JYC team member'} loading="lazy"/>:<LogoImage alt="JIIT Youth Club logo"/>}</div>
   <span className="tag">{m.role||m.position||'JYC Team'}</span>
   <h3>{m.name||'JYC Team Member'}</h3>
   {(m.bio||m.description)&&<p>{m.bio||m.description}</p>}
   <div className="team-social-row">{safeExternalUrl(m.linkedin)&&<a href={safeExternalUrl(m.linkedin)} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>}{safeExternalUrl(m.instagram)&&<a href={safeExternalUrl(m.instagram)} target="_blank" rel="noopener noreferrer">Instagram ↗</a>}</div>
  </article>;
 const roleFallback=members.length?null:<State title="The JYC team is being prepared." text="Official team profiles will appear here when JYC publishes them from the Control Center."><Button secondary onClick={()=>nav('/about')}>Learn about JYC →</Button></State>;
 return <section className="section page team-page jyc-team-page unified-public-page">
  <Breadcrumbs items={[{label:'Team'}]}/><EcosystemContextRail/>
  <div className="team-hero-panel reveal">
   <div><span className="eyebrow">JYC 128 · AY 2026–27</span><h1>Meet the people<br/><em>who move JYC.</em></h1><p>Faculty guidance, student leadership and committee heads form the people layer behind JYC communities, events and campus experiences.</p></div>
   <div className="team-hero-identity" aria-hidden="true"><div className="team-hero-logo"><LogoImage alt=""/></div><b>PEOPLE · PURPOSE · PARTICIPATION</b></div>
  </div>
  <div className="team-command-strip reveal">
   <article><b>{faculty.length}</b><span>Faculty guidance</span></article>
   <article><b>{apex.length}</b><span>Apex leadership</span></article>
   <article><b>{core.length}</b><span>Core / heads</span></article>
   <article><b>{JYC_HUB_FAMILIES.length}</b><span>Community families</span></article>
  </div>
  <section className="team-structure-visual reveal"><span className="eyebrow">ORGANIZATIONAL STRUCTURE</span><h2>Faculty → Apex → Core → Clubs & Hubs.</h2><div className="team-structure-flow"><div><b>01</b><strong>Faculty Coordinators</strong><span>Guidance & institutional support</span></div><i>↓</i><div><b>02</b><strong>JYC Apex</strong><span>Student leadership & coordination</span></div><i>↓</i><div><b>03</b><strong>Core Team</strong><span>Committee heads & operations</span></div><i>↓</i><div><b>04</b><strong>Clubs & Hubs</strong><span>Communities · coordinators · volunteers</span></div></div></section>
  {faculty.length>0&&<section className="team-layer reveal"><div className="team-layer-head"><span className="eyebrow">01 · FACULTY COORDINATORS</span><h2>Institutional guidance.</h2><p>Faculty advisors provide guidance and institutional support to the student ecosystem.</p></div><div className="team-layer-grid">{faculty.map((m,i)=><MemberCard m={m} index={i} key={m.id||m.name||i}/>)}</div></section>}
  {apex.length>0&&<section className="team-layer reveal"><div className="team-layer-head"><span className="eyebrow">02 · JYC APEX</span><h2>Student leadership.</h2><p>The apex body coordinates the wider JYC ecosystem and its campus-facing execution.</p></div><div className="team-layer-grid">{apex.map((m,i)=><MemberCard m={m} index={i} key={m.id||m.name||i}/>)}</div></section>}
  {core.length>0&&<section className="team-layer reveal"><div className="team-layer-head"><span className="eyebrow">03 · CORE TEAM</span><h2>Heads who make programmes happen.</h2><p>Media, creative, PR, hospitality, security, management, digital and executive responsibilities sit here.</p></div><div className="team-layer-grid">{core.map((m,i)=><MemberCard m={m} index={i} key={m.id||m.name||i}/>)}</div></section>}
  <section className="team-layer reveal"><div className="team-layer-head"><span className="eyebrow">04 · CLUBS & HUBS</span><h2>One leadership layer. {Object.keys(JYC_HUB_CONTENT).length} named communities.</h2><p>Explore the five JYC families and open any community to see its profile, activities, events and official links.</p></div><div className="team-hub-directory">{Object.entries(JYC_HUB_CONTENT).map(([name,p])=><a href={'/clubs/'+slug(name)} key={name}><small>{p.family}</small><strong>{name}</strong></a>)}</div></section>
  {roleFallback}
  <div className="team-closeout reveal"><div className="team-closeout-mark"><LogoImage alt="JIIT Youth Club logo"/></div><div><span className="eyebrow">DIFFERENT ROLES · DIFFERENT COMMUNITIES</span><h2>One JYC.</h2><p>Explore the people, communities and experiences that make the JYC ecosystem visible on campus.</p><div className="hero-actions"><Button onClick={()=>nav('/clubs')}>Find your community ↗</Button><Button secondary onClick={()=>nav('/events')}>See events →</Button></div></div></div>
 </section>
}


function Contact({data}){
 const [form,setForm]=useState({name:'',email:'',message:''});
 const [sent,setSent]=useState(false);
 const [sending,setSending]=useState(false);
 const [submitError,setSubmitError]=useState('');
 const submit=async e=>{e.preventDefault();setSubmitError('');if(!form.name.trim()||!form.email.trim()||!form.message.trim())return;setSending(true);try{
   if(!supabase.__configured){
     setSubmitError('The live contact inbox is not configured yet. Please use Instagram, LinkedIn or WhatsApp below.');
     return;
   }
   const {data:result,error}=await supabase.functions.invoke('public-submission',{body:{type:'contact',name:form.name.trim(),email:form.email.trim(),message:form.message.trim(),website:''}});if(error||!result?.ok)throw error||new Error(result?.error||'Could not submit your message.');
   setSent(true);
 }catch(err){
   console.warn('JYC contact submission unavailable:',err);
   setSubmitError('The live contact inbox is not configured yet. Please use Instagram or WhatsApp below.');
 }finally{setSending(false)}};
 return <section className="section page contact-page"><Back label="Back to home" to="/"/><SectionHead eyebrow="CONTACT" title="Stay connected with JYC." text="Follow official channels for updates, events and opportunities."/><div className="contact-grid"><a className="contact-card" href={JYC_CONTACTS.instagram} target="_blank" rel="noreferrer"><span>01</span><h3>Instagram</h3><p>@jiityouthclub</p>↗</a><a className="contact-card" href={JYC_CONTACTS.linkedin} target="_blank" rel="noreferrer"><span>02</span><h3>LinkedIn</h3><p>Official JYC organisation page.</p>↗</a><a className="contact-card" href={JYC_CONTACTS.whatsapp} target="_blank" rel="noreferrer"><span>03</span><h3>WhatsApp Community</h3><p>Join the JYC community.</p>↗</a><div className="contact-card"><span>04</span><h3>Website Creator</h3><p>{data.creator.name} · {data.creator.role}</p><div className="social-row"><a href={data.creator.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href={data.creator.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href={data.creator.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a></div><p>{data.creator.email}</p></div></div><div className="contact-location reveal"><span className="eyebrow">JYC 128 · OFFICIAL CAMPUS</span><h3>Jaypee Institute of Information Technology, Sector 128</h3><p>Jaypee Wish Town Village, Sultanpur, Noida–201304, Uttar Pradesh, India.</p><a className="text-link" href="https://www.jiit.ac.in/contact-us" target="_blank" rel="noopener noreferrer">Verify campus contact details on JIIT ↗</a></div><div className="contact-form-container reveal"><div className="contact-form-card"><div className="contact-form-head"><span className="eyebrow">SEND A MESSAGE</span><h3>Write to JYC.</h3><p>Use this form to reach JYC when public submissions are enabled. Official social channels remain available below.</p></div>{sent?<div className="contact-form-success" role="status"><b>Thanks, {form.name.split(' ')[0]||'friend'}!</b><p>Your message has been received. JYC channels are also available below if you need a faster response.</p><button className="btn" onClick={()=>{setSent(false);setForm({name:'',email:'',message:''})}}>Send another message</button></div>:<form className="contact-form" onSubmit={submit} noValidate><label><span>Name</span><input name="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name" required autoComplete="name"/></label><label><span>Email</span><input name="email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@email.com" required autoComplete="email"/></label><label><span>Message</span><textarea name="message" rows="5" value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="How can JYC help you?" required/></label>{submitError&&<p className="contact-form-error" role="alert">{submitError}</p>}<button className="btn primary" type="submit" disabled={sending}>{sending?'Sending…':'Send message →'}</button></form>}</div></div></section>}
function FestsPage({data}){
 const nav=useNavigate();
 const fests=data.events.filter(e=>e.published&&(/fest|impressions|converge|ebullience/i.test(`${e.title} ${e.eventType||''}`))).sort((a,b)=>`${b.date} ${b.start}`.localeCompare(`${a.date} ${a.start}`));
 return <section className="section page fests-page"><div className="compact-page-head reveal"><div><span className="eyebrow">JIIT Fests · JYC 128</span><h1>Fests that bring campus together.</h1><p>Browse published flagship experiences, including completed editions. Each record keeps its organiser, venue, media and external links visible when supplied.</p></div><div className="page-stat-row"><span><b>{fests.length}</b> published fest records</span></div></div><div className="seo-topic-panel reveal"><span className="eyebrow">CAMPUS FESTS</span><h2>One place for the JYC fest trail.</h2><p>Converge is the Sector 128 annual cultural and technical fest, while older JIIT material also documents Impressions and other JYC-led campus programmes. Current records are labelled by date and status rather than mixed together.</p><button className="btn secondary" onClick={()=>nav('/events')}>Browse all events →</button></div><div className="fests-social-rail reveal"><span className="eyebrow">OFFICIAL FEST / ORGANISER LINKS</span><div>{fests.slice(0,8).map(e=>{const sp=festSocialProfile(e.title);return sp?<a key={e.id} href={sp.website||sp.instagram||sp.linkedin} target="_blank" rel="noopener noreferrer"><b>{e.title}</b><span>{sp.instagramHandle||sp.label||'Official link'} ↗</span></a>:null})}</div></div>{fests.length?<div className="card-grid event-grid-premium">{fests.map((e,i)=><EventCard e={e} key={e.id} index={i}/>)}</div>:<State title="No published fest events yet." text="When JYC publishes a fest or flagship event, it will appear here automatically."/>}</section>
}
function EventDirectoryList({events}){
 const nav=useNavigate();
 return <div className="event-directory-list">{events.map((event,index)=><button className="event-directory-row" key={event.id||event.title} onClick={()=>nav('/events/'+slug(event.title))}><span className="event-row-number">{String(index+1).padStart(2,'0')}</span><span className="event-row-date"><b>{fmtDate(event.date)}</b><small>{event.start||'TIME TBA'}</small></span><span className="event-row-copy"><small>{event.club||'JYC'}{event.venue?` · ${event.venue}`:''}</small><strong>{event.title}</strong><em>{event.description||'Open the official event record.'}</em></span><span className="event-row-state">{eventState(event).toUpperCase()}</span><b className="event-row-arrow" aria-hidden="true">↗</b></button>)}</div>
}
function Events({data}){
 const location=useLocation();
 const [view,setView]=useState('cards'),[q,setQ]=useState(''),[filter,setFilter]=useState('All'),[family,setFamily]=useState('All'),[scope,setScope]=useState('upcoming'),[filtersOpen,setFiltersOpen]=useState(false);
 const queryYear=new URLSearchParams(location.search||'').get('year')||'';
 if(data.mode==='fest'&&data.fest?.active)return <Fest data={data}/>;
 const all=data.events.filter(e=>e.published&&!e.archived).filter(e=>!queryYear||String(e.date||'').startsWith(queryYear)).sort((a,b)=>(Number(!!b.pinned)-Number(!!a.pinned))||`${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
 const clubs=[...new Set(all.map(e=>e.club).filter(Boolean))];
 const eventFamily=name=>{const raw=String(name||'').trim().toLowerCase();const key=Object.keys(JYC_HUB_CONTENT).find(k=>raw===k.toLowerCase()||raw.includes(k.toLowerCase()));return key?JYC_HUB_CONTENT[key].family:''};
 const eventCategories=JYC_EVENT_CATEGORIES;
 const eventCategoryOf=e=>{const raw=String(e.category||e.eventCategory||e.eventType||eventFamily(e.club)||'').trim();return raw.toLowerCase()==='social outreach'?'Social':raw;};
 const filtered=all.filter(e=>filter==='All'||e.club===filter).filter(e=>family==='All'||eventCategoryOf(e).toLowerCase()===family.toLowerCase()).filter(e=>!q||`${e.title} ${e.club} ${e.venue} ${eventCategoryOf(e)} ${(e.highlights||[]).join(' ')}`.toLowerCase().includes(q.toLowerCase()));
 const upcoming=filtered.filter(e=>eventState(e)!=='past'),live=filtered.filter(e=>eventState(e)==='live'),past=filtered.filter(e=>eventState(e)==='past');
 const shown=scope==='upcoming'?upcoming:scope==='live'?live:scope==='past'?past:filtered;
 return <section className="section page events-page v40-events-page"><Breadcrumbs items={[{label:'Events'}]}/><EcosystemContextRail/><div className="compact-page-head events-page-head reveal"><div><span className="eyebrow">JYC EVENTS{queryYear?` · ${queryYear}`:''}</span><h1>What's happening.</h1><p>Upcoming, live and past JIIT events — workshops, competitions, cultural activities, club programmes and campus experiences published by JYC.</p></div><div className="page-stat-row"><span><b>{upcoming.length}</b> upcoming</span><span><b>{live.length}</b> live</span><span><b>{past.length}</b> past</span></div></div>
  <div className="event-program-band reveal"><div><span className="eyebrow">JYC EVENT PROGRAMME</span><h2>From induction to flagship experiences.</h2><p>The supplied JYC material highlights Induction, Ebullience, Hackathons, Ethnic Day, Converge, Dron-O-War and Farewell alongside periodic activities. Published event records below are the source of truth for current dates.</p></div><div className="event-program-list"><span>INDUCTION</span><span>EBULLIENCE</span><span>HACKATHONS</span><span>ETHNIC DAY</span><span>CONVERGE</span><span>DRON-O-WAR</span><span>FAREWELL</span></div></div>
  {live.length>0&&<div className="events-live-strip reveal"><span className="live-dot"/><div><small>HAPPENING NOW</small><strong>{live[0].title}</strong><span>{live[0].venue||'Venue TBA'} · {live[0].club||'JYC'}</span></div><a className="text-link" href={'/events/'+slug(live[0].title)}>Open event →</a></div>}
  <SearchTopicBand eyebrow="JIIT EVENTS · JYC 128" title="JIIT events, workshops and campus experiences" text="Discover officially published JYC events at JIIT Wish Town Campus, Sector 128, Noida — from technical programmes and competitions to cultural and student-community experiences." links={[["JYC clubs","/clubs"],["Event calendar","/calendar"],["JYC fests","/fests"]]}/>
   <EventTimelinePreview events={filtered}/>
  <div className="event-toolbar events-toolbar-premium reveal"><label className="event-search"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search events..." aria-label="Search events"/>{q&&<button type="button" onClick={()=>setQ('')} aria-label="Clear event search">×</button>}</label><button type="button" className={`filter-toggle ${filtersOpen?'active':''}`} onClick={()=>setFiltersOpen(v=>!v)} aria-expanded={filtersOpen}>Filters <span>{filtersOpen?'−':'+'}</span></button><div className="seg"><button className={view==='cards'?'active':''} onClick={()=>setView('cards')}>Cards</button><button className={view==='list'?'active':''} onClick={()=>setView('list')}>List</button><button className={view==='calendar'?'active':''} onClick={()=>setView('calendar')}>Calendar</button></div></div>{filtersOpen&&<div className="event-filter-panel reveal"><label><span>Category</span><select value={family} onChange={e=>setFamily(e.target.value)}><option value="All">All categories</option>{eventCategories.slice(1).map(f=><option key={f}>{f}</option>)}</select></label><label><span>Club</span><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="All">All clubs</option>{clubs.map(c=><option key={c}>{c}</option>)}</select></label><button className="filter-clear" onClick={()=>{setFamily('All');setFilter('All');setQ('');setScope('upcoming')}}>Clear filters</button></div>}
  <section className="supplied-event-programme reveal"><div className="section-inline-head"><div><span className="eyebrow">FROM THE SUPPLIED HUB PRESENTATIONS</span><h2>The wider JYC programme.</h2><p>Programme names and visual material preserved from the supplied hub presentations. Current dates and registration remain controlled by published event records above.</p></div></div><div className="supplied-programme-grid">{PDF_HUB_PROGRAMME.map((p,i)=>{const identity=eventIdentity(p.name);return <article key={p.name} className="supplied-programme-card" style={{'--hub-accent':identity.accent,'--hub-accent-soft':`color-mix(in srgb, ${identity.accent} 12%, transparent)`}}><img src={p.image} alt={`${p.name} · supplied JYC material`} loading="lazy"/><div><span>{identity.motif}</span><h3>{p.name}</h3><p>{p.text}</p><b>{identity.signature}</b></div></article>})}</div></section>
  {view==='calendar'?<Calendar events={filtered}/>:<><div className="event-scope-tabs reveal">{[['upcoming','Upcoming',upcoming.length],['live','Ongoing',live.length],['past','Completed',past.length],['all','All',filtered.length]].map(([id,label,count])=><button key={id} className={scope===id?'active':''} onClick={()=>setScope(id)}>{label}<b>{count}</b></button>)}</div>{view==='list'?(shown.length?<EventDirectoryList events={shown}/>:<State title={scope==='live'?'Nothing is ongoing right now.':scope==='past'?'No completed events in the archive.':'No published experiences in this view.'} text="The JYC archive and supplied programme material keep the page useful until new official event records are published."/>):(shown.length?<div className="card-grid event-grid-premium">{shown.map((e,i)=><EventCard e={e} key={e.id} index={i}/>)}</div>:<State title={scope==='live'?'Nothing is live right now.':scope==='past'?'No past events in the archive.':'No published experiences in this view.'} text="The JYC archive and supplied programme material keep the page useful until new official event records are published."/>)}</>}
 </section>
}



function JYCCalendarPage({data}){
 const events=(Array.isArray(data.events)?data.events:[]).filter(e=>e.published&&!e.archived).sort((a,b)=>`${a.date||''}${a.start||''}`.localeCompare(`${b.date||''}${b.start||''}`));
 const [month,setMonth]=useState(()=>new Date());
 const year=month.getFullYear(), m=month.getMonth();
 const monthEvents=events.filter(e=>{const d=new Date(`${e.date}T12:00:00`);return d.getFullYear()===year&&d.getMonth()===m});
 const label=month.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
 const shift=n=>setMonth(new Date(year,m+n,1));
 return <section className="section page unified-public-page jyc-calendar-page">
  <Breadcrumbs items={[{label:'Event Calendar'}]}/><EcosystemContextRail/>
  <div className="compact-page-head reveal"><div><span className="eyebrow">JYC EVENT CALENDAR</span><h1>Find the next JYC experience.</h1><p>A calendar for JYC events only. Academic schedules and campus utilities do not live here.</p></div><div className="page-stat-row"><span><b>{events.length}</b> published events</span><span><b>{monthEvents.length}</b> this month</span></div></div>
  <div className="calendar-controls reveal"><button className="btn secondary" onClick={()=>shift(-1)}>← Previous</button><strong>{label}</strong><button className="btn secondary" onClick={()=>shift(1)}>Next →</button></div>
  <div className="calendar"><Calendar events={monthEvents}/></div>
  <div className="calendar-footer-note reveal"><span className="eyebrow">JYC WEBSITE</span><p>For complete event details, registration links and official media, open the event record.</p><a className="text-link" href="/events">Browse all events →</a></div>
 </section>
}

function Routes({data,admin,session,setAdmin,commit,notify,theme,setTheme}){
 const nav=useNavigate();
 const p=useLocation().pathname;
 const clean=p.replace(/\/$/,'')||'/';
 if(clean==='/my-jyc'||clean==='/login'||clean==='/planner'||clean==='/notifications'||clean==='/settings'||clean==='/agenda'||clean==='/projects'||clean==='/download'||clean==='/projects/submit'||clean.startsWith('/qr/'))return <Navigate to="/" replace/>;
 const parts=clean.split('/').filter(Boolean);
 const slugId=parts[1]||'';
 const liveClub=clean.startsWith('/clubs/')?data.clubs.find(c=>String(c.id)===String(slugId)||slug(c.name)===slug(slugId)):null;const hubKey=clean.startsWith('/clubs/')?Object.keys(JYC_HUB_CONTENT).find(k=>slug(k)===slug(slugId)):null;const club=liveClub||(!clean.startsWith('/clubs/')||!hubKey?null:{id:`hub-${slug(hubKey)}`,name:hubKey,type:JYC_HUB_CONTENT[hubKey].family==='Technical'?'Technical':'Non-Technical',category:JYC_HUB_CONTENT[hubKey].family,description:JYC_HUB_CONTENT[hubKey].summary,about:JYC_HUB_CONTENT[hubKey].detail,interests:[JYC_HUB_CONTENT[hubKey].focus],published:true,status:'published',theme:'jyc',customSections:[],achievements:[],projects:[],heads:[],recruitment:{on:false},logo:'',banner:'',instagram:'',whatsapp:'',website:'',linkedin:'',youtube:''});
 const event=clean.startsWith('/events/')?data.events.find(e=>String(e.id)===String(slugId)||slug(e.title)===slug(slugId)):null;
 const titles={
  '/':'JIIT Youth Club (JYC) — Clubs, Events & Fests | JIIT Noida',
  '/about':'What is JIIT Youth Club (JYC)? | JIIT Noida',
  '/history':'The History of JIIT Youth Club | JYC 128',
  '/clubs':'JIIT Clubs & Student Communities | JIIT Youth Club',
  '/events':'JIIT Events & Campus Activities | JIIT Youth Club',
  '/fests':'JIIT Fests & Flagship Events | JIIT Youth Club',
  '/team':'JYC 128 Leadership | Faculty, Apex & Core Team',
  '/leadership':'JYC 128 Leadership | Faculty, Apex & Core Team',
  '/gallery':'JYC Gallery | JIIT Youth Club 128',
  '/contact':'Contact JIIT Youth Club | JYC',
  '/recruitment':'JIIT Club Recruitment & Auditions | JIIT Youth Club',
  '/calendar':'JYC 128 Event Calendar | JIIT Youth Club',
  '/event-calendar':'JYC 128 Event Calendar | JIIT Youth Club',

  '/achievements':'JYC Achievements & Wall of Fame | JIIT Noida',
  '/join-jyc':'Join JYC | JIIT Youth Club',
  '/announcements':'JYC Announcements & Updates | JIIT Noida',
  '/updates':'JYC Now · Recent JYC & Hub Updates | JIIT Youth Club',
  '/resources':'JIIT Youth Club | JYC Clubs & Events',
  '/guide':'About JIIT Youth Club | JYC',
  '/admin':'JYC Control Center'
 };
 const descriptions={
  '/':'Official JIIT Youth Club (JYC) website for JIIT Noida. Discover JIIT clubs, student communities, JIIT events, annual fests and co-curricular activities.',
  '/history':'Read the evidence-led public history of JIIT Youth Club, from hub coordination and induction programmes to flagship JIIT campus experiences.',
  '/clubs':'Explore the official JIIT club list and student communities across technical, cultural, literary, creative, sports and other campus interests through JIIT Youth Club.',
  '/events':'Find JIIT events, workshops, competitions, cultural activities and campus events published by JIIT Youth Club at JIIT Noida.',
  '/fests':'Explore JIIT fests and flagship campus events such as officially published JYC programmes, with dates, venues, clubs and registration details when available.',
  '/resources':'JIIT Youth Club — official clubs, events, fests and community information.',
  '/guide':'About JIIT Youth Club — purpose, communities, events and campus life.',
    '/calendar':'Browse the JYC 128 event calendar by date, category and event status.',
  '/recruitment':'Find published JIIT club recruitment opportunities, auditions and official application links through JIIT Youth Club.',
  '/about':'Learn about JYC 128, its history and role at JIIT, its vision, mission and student-community values.',
  '/contact':'Official JYC 128 contact details, social channels and query form.',
  '/archive':'JYC archive of published events, clubs, gallery moments and campus stories from JIIT.',
  '/announcements':'Official JYC announcements, notices, registration updates and published student-community updates.',
  '/updates':'Recent verified public updates from JYC and its published community channels, presented as an editorial JYC feed.',
  '/gallery':'Browse the JYC 128 visual archive by event, year and published source media.',
  '/leadership':'Meet the JYC 128 faculty advisors, apex leadership and core team.',
  '/achievements':'JYC 128 achievements, Wall of Fame, community milestones and published outcomes.',
  '/join-jyc':'Join JYC 128 is currently coming soon. Recruitment and application opportunities will be published here when the next official cycle opens.'
 };
 const privateRoute=clean==='/admin';
 const knownPublic=['/','/about','/history','/clubs','/events','/fests','/gallery','/team','/leadership','/contact','/archive','/calendar','/event-calendar','/achievements','/announcements','/updates','/recruitment','/join-jyc'].includes(clean)&&(clean!=='/fests'||isFestMode(data));
 const knownDetail=Boolean(club||event);
 const unknownRoute=!privateRoute&&!knownPublic&&!knownDetail;
 const pageType=club?'club':event?'event':clean==='/fests'?'fests':clean==='/clubs'?'clubs':clean==='/events'?'events':clean==='/gallery'?'gallery':clean==='/team'||clean==='/leadership'?'team':clean==='/history'?'history':clean==='/announcements'?'announcements':clean==='/updates'?'updates':clean==='/achievements'?'achievements':clean==='/calendar'||clean==='/event-calendar'?'calendar':clean==='/recruitment'?'recruitment':clean==='/join-jyc'?'join-jyc':clean==='/about'?'about':clean==='/contact'?'contact':'home';
 const canonicalPath=club?`/clubs/${slug(club.name)}`:event?`/events/${slug(event.title)}${parts[2]==='register'?'/register':''}`:clean;
 useEffect(()=>{if((club||event)&&slugId!==slug((club||event).name||(club||event).title)){const target=event?`/events/${slug(event.title)}${parts[2]==='register'?'/register':''}`:`/clubs/${slug(club.name)}`;nav(target,{replace:true});}},[slugId,club?.id,event?.id,parts[2],nav]);
 const title=club?`${club.name} | JIIT Club · JYC`:event?`${event.title} | JIIT Event · JYC`:titles[clean]||'JIIT Youth Club';
 const description=club?(club.description||club.about||`${club.name} — official JIIT student community profile on JIIT Youth Club.`):event?(event.description||`${event.title} — official JIIT Youth Club event at JIIT Noida.`):(descriptions[clean]||'Official JIIT Youth Club website for JIIT Noida. Discover clubs, events, fests, recruitment and student activities.');
 usePageMeta(title,description,canonicalPath,{noindex:privateRoute||unknownRoute,type:event?'event':'website'});
 const schema=<JsonLd data={data} pageType={pageType} item={club||event} path={canonicalPath}/>;
 if(clean==='/')return <>{schema}<Home data={data}/></>;
 if(clean==='/history')return <><JYCHistory data={data}/></>;
 if(clean==='/about')return <>{schema}<About data={data}/></>;if(clean==='/clubs')return <>{schema}<Clubs data={data}/></>;if(club)return <>{schema}<ClubDetail data={data} id={slugId} virtualName={hubKey||undefined}/></>;
 if(clean==='/events')return <>{schema}<Events data={data}/></>;if(clean==='/fests')return isFestMode(data)?<>{schema}<FestsPage data={data}/></>:<Navigate to="/events" replace/>;if(event&&parts[2]==='register')return <Navigate to={`/events/${slug(event.title)}`} replace/>;if(event)return <>{schema}<EventDetail data={data} id={slugId} session={session}/></>;
 if(clean==='/gallery')return <>{schema}<Gallery data={data}/></>;if(clean==='/team'||clean==='/leadership')return <>{schema}<Team data={data}/></>;if(clean==='/contact')return <>{schema}<Contact data={data}/></>;if(clean==='/archive')return <ArchivePage data={data}/>;
 if(clean==='/announcements')return <Announcements data={data}/>;
 if(clean==='/updates')return <><JYCNowPage data={data}/></>;
 if(clean==='/achievements')return <Achievements data={data}/>;if(clean==='/join-jyc')return <Navigate to="/recruitment" replace/>;if(clean==='/recruitment')return recruitmentEnabled(data)?<>{schema}<RecruitmentHub data={data}/></>:<Navigate to="/clubs" replace/>;if(clean==='/calendar'||clean==='/event-calendar')return <>{schema}<JYCCalendarPage data={data}/></>;if(clean==='/event-calendar')return <Navigate to="/calendar" replace/>;if(clean==='/moments')return <Navigate to="/gallery" replace/>;if(clean==='/discover')return <Navigate to="/clubs" replace/>;if(clean==='/resources')return <Navigate to="/about" replace/>;if(clean==='/guide')return <Navigate to="/about" replace/>;if(clean==='/my-jyc'||clean==='/planner'||clean==='/notifications'||clean==='/login'||clean==='/download'||clean==='/agenda'||clean==='/settings'||clean==='/projects'||clean==='/projects/submit'||clean.startsWith('/qr/'))return <Navigate to="/" replace/>;if(clean==='/admin')return <Suspense fallback={<section className="section page"><span className="eyebrow">JYC CONTROL CENTER</span><h1>Loading Control Center…</h1><p>Preparing the administrative workspace.</p></section>}><Admin data={data} admin={admin} setAdmin={setAdmin} commit={commit} notify={notify} theme={theme} setTheme={setTheme}/></Suspense>;return <section className="section page not-found-page"><div className="not-found-art"><span>404</span><i aria-hidden="true">JYC</i></div><span className="eyebrow">JYC · ROUTE MISSED</span><h1>This route is not part of the published JYC experience.</h1><p>The page you requested is not part of the published JYC experience.</p><div className="detail-actions"><Button onClick={()=>nav('/')}>Return home</Button><Button secondary onClick={()=>nav('/clubs')}>Explore clubs</Button></div></section>
}
function NavIcon({kind}){const paths={home:'M3 10.5 12 3l9 7.5M5.5 9.5V21h13V9.5M9 21v-6h6v6',clubs:'M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-1.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20a5.5 5.5 0 0 1 11 0M14 20a6 6 0 0 1 7.5 0',events:'M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',gallery:'M4 5h16v14H4zM4 16l4-4 3 3 2-2 5 5M15 9h.01',team:'M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-1.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2.5 20a5.5 5.5 0 0 1 11 0M14 20a6 6 0 0 1 7.5 0',more:'M5 7h14M5 12h14M5 17h14',search:'M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm5.5-2 5 5'};return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={paths[kind]||paths.more}/></svg>}


function Navbar({data,admin,theme,setTheme}){
 const nav=useNavigate();const loc=useLocation();
 const [open,setOpen]=useState(false),[moreOpen,setMoreOpen]=useState(false),[search,setSearch]=useState(false),[homeSection,setHomeSection]=useState('hero');
 const shortcutRef=React.useRef('');
 const routeLinks=[['Home','/'],['About','/about'],['Clubs','/clubs'],['Events','/events'],['Gallery','/gallery'],['Leadership','/team'],['Contact','/contact']];
 const homeLinks=[['Home','hero'],['About','about'],['Clubs','clubs'],['Events','events'],['Gallery','moments'],['Leadership','team']];
 useEffect(()=>{
   const onKey=e=>{
     if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearch(true);return}
     if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();setSearch(true);return}
     if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
     if(e.key.toLowerCase()==='g'){shortcutRef.current='g';window.clearTimeout(shortcutRef._timer);shortcutRef._timer=window.setTimeout(()=>shortcutRef.current='',700);return}
     if(shortcutRef.current==='g'){const routes={c:'/clubs',e:'/events',t:'/team',a:'/archive',m:'/gallery'};if(routes[e.key.toLowerCase()]){e.preventDefault();shortcutRef.current='';nav(routes[e.key.toLowerCase()]);return}}
     if(e.key==='Escape'){setOpen(false);setSearch(false);setMoreOpen(false)}
   };
   const openSearch=()=>setSearch(true);window.addEventListener('keydown',onKey);window.addEventListener('jyc-open-search',openSearch);
   return()=>{window.removeEventListener('keydown',onKey);window.removeEventListener('jyc-open-search',openSearch)}
 },[]);
 useEffect(()=>{setOpen(false);setMoreOpen(false);const query=new URLSearchParams(loc.search||'').get('q');setSearch(Boolean(query));},[loc.pathname,loc.search]);
 useEffect(()=>{document.body.classList.toggle('menu-open',open);return()=>document.body.classList.remove('menu-open')},[open]);
 useEffect(()=>{
   if(loc.pathname!=='/') return;
   const ids=['hero','about','clubs','events','moments','team'];
   const nodes=ids.map(id=>document.getElementById(id)).filter(Boolean);
   if(!nodes.length)return;
   const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(visible[0])setHomeSection(visible[0].target.id)},{rootMargin:'-22% 0px -58% 0px',threshold:[0,.2,.45,.7]});
   nodes.forEach(n=>observer.observe(n));
   const syncHash=()=>{const id=window.location.hash.replace('#','');if(ids.includes(id))requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}))};
   syncHash();
   return()=>observer.disconnect();
 },[loc.pathname]);
 const goHomeSection=id=>{setOpen(false);setMoreOpen(false);if(loc.pathname!=='/') {nav('/#'+id);return}document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});setHomeSection(id)};
 const dockItems=[['Home','/','home'],['Clubs','/clubs','clubs'],['Events','/events','events'],['Leadership','/team','team'],['More','__more','more']];
 const dockActive=loc.pathname==='/'?0:loc.pathname.startsWith('/clubs')?1:loc.pathname.startsWith('/events')?2:(loc.pathname.startsWith('/team')||loc.pathname.startsWith('/leadership'))?3:4;
 const dock=<div className="mobile-dock" style={{'--dock-index':dockActive}} aria-label="Mobile navigation"><i className="dock-active-pill" aria-hidden="true"/>{dockItems.map(([n,p,icon],i)=>{const active=i===dockActive;return <button key={n} className={active?'active':''} onClick={()=>p==='__more'?setMoreOpen(v=>!v):nav(p)} aria-current={active?'page':undefined}><span><NavIcon kind={icon}/></span><b>{n}</b></button>})}</div>;
 const more=moreOpen?<MobileMoreSheet data={data} admin={admin} close={()=>setMoreOpen(false)} openSearch={()=>{setMoreOpen(false);setSearch(true)}}/>:null;
 const searchView=search?<Search data={data} admin={admin} close={()=>setSearch(false)}/>:null;
 const isHome=loc.pathname==='/';
 const navButtons=isHome?homeLinks.map(([n,id])=><button key={n} className={homeSection===id?'active':''} onClick={()=>{setOpen(false);goHomeSection(id)}}>{n}</button>):routeLinks.map(([n,p])=><button key={n} className={loc.pathname===p||(p!=='/'&&loc.pathname.startsWith(p+'/'))?'active':''} onClick={()=>{setOpen(false);nav(p)}}>{n}</button>);
 return <>
 <header className="nav"><div className="nav-inner">
   <button type="button" className="brand" onClick={()=>{setOpen(false);nav('/')}}><span className="brand-mark"><LogoImage alt="JIIT Youth Club logo"/></span><span>JIIT YOUTH CLUB</span></button>
   <nav className={open?'open':''}>{navButtons}<button className={`nav-more-trigger ${moreOpen?'active':''}`} onClick={()=>{setOpen(false);setMoreOpen(v=>!v)}} aria-expanded={moreOpen}>More <span aria-hidden="true">⌄</span></button></nav>
   <Theme theme={theme} setTheme={setTheme}/><button className={`hamb ${open?'open':''}`} onClick={()=>setOpen(v=>!v)} type="button" aria-label="Menu" aria-expanded={open}><i/><i/><i/></button>
   {open&&<button className="mobile-nav-scrim" aria-label="Close navigation" onClick={()=>setOpen(false)}/>}<button className="search-trigger" onClick={()=>setSearch(true)} aria-label="Search JYC" title="Search JYC (Ctrl/Cmd + K)"><span className="search-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></svg></span><span className="search-label">Search</span><kbd>Ctrl K</kbd></button>
 </div></header>
 {createPortal(dock,document.body)}{createPortal(more,document.body)}{searchView}</>
}
function MobileMoreSheet({data,admin,close,openSearch}){
 const nav=useNavigate();
 const sheetRef=React.useRef(null);
 useEffect(()=>{
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const timer=setTimeout(()=>sheetRef.current?.querySelector('button,a')?.focus(),30);
  const onKey=e=>{
   if(e.key==='Escape'){e.preventDefault();close();return}
   if(e.key!=='Tab')return;
   const root=sheetRef.current;if(!root)return;
   const focusable=[...root.querySelectorAll('button,a,input,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled&&el.offsetParent!==null);
   if(!focusable.length)return;
   const first=focusable[0],last=focusable[focusable.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  };
  document.addEventListener('keydown',onKey);
  return()=>{clearTimeout(timer);document.body.style.overflow=previous;document.removeEventListener('keydown',onKey)};
 },[close]);
 const go=p=>{close();nav(p)};
const explore=[
   ['/about','About JYC','Vision, mission and values'],
   ['/history','JYC History','Evidence-led milestones and the organisation’s story'],
   ['/team','Leadership','Faculty, Apex and Core Team'],
   ['/clubs','Clubs & Communities','Explore the official hub ecosystem'],
   ['/events','Events','Upcoming, ongoing and completed experiences'],
   ['/calendar','Event Calendar','Browse JYC events by date'],
   ['/gallery','Gallery','Event memories, years and visual archive'],
   ['/achievements','Achievements','Wall of Fame and community outcomes'],
   ['/updates','JYC Now','Recent verified updates from JYC and the hubs'],
   ['/announcements','Announcements','Registrations, notices and JYC updates'],
   ['/recruitment','Join JYC','Official recruitment destination'],
   ['/archive','Archive','The published JYC story by year'],
   ['/contact','Contact','Official public channels and query form']
  ];
 return <div ref={sheetRef} className="more-sheet-overlay" role="dialog" aria-modal="true" aria-label="More JYC" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}>
  <div className="more-sheet jyc-more-club-sheet">
   <div className="sheet-grabber"/>
   <div className="more-sheet-head"><div><span className="eyebrow">MORE JYC</span><h3>Useful pages. Nothing repeated.</h3><p>About, communities, events, archive and official JYC channels live here.</p></div><button className="sheet-close" onClick={close}>×</button></div>
   <div className="more-sheet-section"><span className="eyebrow">JYC</span><div className="more-sheet-grid jyc-more-grid">{explore.map(([path,title,text])=><button key={path} onClick={()=>go(path)}><b>{title}</b><span>{text} →</span></button>)}</div></div>
   <div className="more-sheet-section"><span className="eyebrow">SEARCH JYC</span><div className="more-sheet-grid more-sheet-guide"><button onClick={openSearch}><b>Search JYC</b><span>Find a page, club or event →</span></button>{safeExternalUrl(data.homepage?.jtvUrl)&&<a className="more-sheet-link" href={safeExternalUrl(data.homepage.jtvUrl)} target="_blank" rel="noopener noreferrer"><b>JTV</b><span>Official JYC media ↗</span></a>}</div></div>
   <div className="more-sheet-staff"><span className="eyebrow">STAFF</span><button onClick={()=>go('/admin')}><b>Control Center</b><span>Publish, review & operate JYC ↗</span></button></div>
   <div className="more-sheet-connect"><span className="eyebrow">CONNECT WITH JYC</span><div><a href={JYC_CONTACTS.instagram} target="_blank" rel="noreferrer">Instagram ↗</a><a href={JYC_CONTACTS.whatsapp} target="_blank" rel="noreferrer">WhatsApp ↗</a><a href={'mailto:'+data.creator.email}>Email ↗</a></div></div>
  </div>
 </div>
}

function Search({data,admin,close}){
 const nav=useNavigate();
 const [q,setQ]=useState(()=>{try{return new URLSearchParams(window.location.search).get('q')||''}catch{return ''}});
 const [selected,setSelected]=useState(0);
 const [recent,setRecent]=useState(()=>{try{return JSON.parse(storageGet('jyc-search-recent','[]')).filter(Boolean).slice(0,5)}catch{return []}});
 const inputRef=React.useRef(null);
 const term=normalizeSearch(q);
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';const timer=setTimeout(()=>inputRef.current?.focus(),40);const onKeyDown=e=>{if(e.key!=='Tab')return;const root=document.querySelector('.search-modal');if(!root)return;const focusable=[...root.querySelectorAll('button,input,a,[tabindex]:not([tabindex="-1"])')].filter(el=>!el.disabled&&el.offsetParent!==null);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}};document.addEventListener('keydown',onKeyDown);return()=>{clearTimeout(timer);document.body.style.overflow=previous;document.removeEventListener('keydown',onKeyDown)}},[]);
 useEffect(()=>{setSelected(0)},[term]);
 const remember=value=>{if(!value)return;try{const next=[value,...recent.filter(x=>x!==value)].slice(0,5);storageSet('jyc-search-recent',JSON.stringify(next));setRecent(next)}catch{}};
 const clubs=data.clubs.filter(c=>c.published&&c.status!=='archived');
 const events=data.events.filter(e=>e.published&&!e.archived);
 const team=data.team.filter(m=>m.published===true);
 const pageIndex=[
  ['JIIT Youth Club','Official JYC website for JIIT Noida clubs, events, people and campus experiences.','PAGE','/'],
  ['About JYC','About the JIIT Youth Club community, purpose and student-led work.','PAGE','/about'],
  ['Clubs','Explore official JIIT student clubs, societies, communities and interests.','PAGE','/clubs'],
  ['Events','Upcoming, live and past JYC events, workshops, competitions and campus activities.','PAGE','/events'],
  ...(isFestMode(data)?[['Fests','Flagship JYC fest experiences.','PAGE','/fests']]:[]),
  ['JYC Team','Meet the people behind JYC.','PAGE','/team'],
  ['Contact JYC','Official JYC contact information.','PAGE','/contact'],
  ['JYC Archive','Published JYC events, clubs, gallery moments and campus stories.','PAGE','/archive'],
  ['Announcements','JYC announcements, registration notices and updates.','PAGE','/announcements'],
  ['Achievements','JYC achievements, wall of fame and published outcomes.','PAGE','/achievements'],
  ['JYC Event Calendar','Published JYC events by date.','PAGE','/calendar'],
  ['Events & venues','Find published JYC event locations.','PAGE','/events']
 ];
 const adminPages=admin?[['Control Center','Staff publishing, reviews, registrations and operations.','ADMIN','/admin']]:[];
 const rawResults=[
  ...adminPages.map(x=>({key:'a'+x[3]+x[0],type:x[2],title:x[0],meta:x[1],searchText:`${x[0]} ${x[1]} JYC JIIT`,icon:'⚙',go:()=>nav(x[3])})),
  ...pageIndex.map(x=>({key:'p'+x[3],type:x[2],title:x[0],meta:x[1],searchText:`${x[0]} ${x[1]} JYC JIIT Noida`,icon:'⌘',go:()=>nav(x[3])})),
  ...clubs.map(c=>({key:'c'+c.id,type:'CLUB',title:c.name,meta:c.category||'Community',searchText:`${c.name} ${c.category||''} ${(c.interests||[]).join(' ')} ${c.description||''}`,icon:'◈',go:()=>nav('/clubs/'+encodeURIComponent(c.id||slug(c.name)))})),
  ...events.map(e=>({key:'e'+e.id,type:'EVENT',title:e.title,meta:e.club||'JYC',searchText:`${e.title} ${e.club||''} ${e.venue||''} ${(e.highlights||[]).join(' ')}`,icon:'◷',go:()=>nav('/events/'+encodeURIComponent(e.id||slug(e.title)))})),
  ...team.map(m=>({key:'t'+m.id,type:'TEAM',title:m.name,meta:m.role||'JYC Team',searchText:`${m.name} ${m.role||''} ${m.bio||''}`,icon:'✦',go:()=>nav('/team')})),
 ];
 const intentResults=term?(
  /(tomorrow|today|this week|upcoming|events)/.test(term)?[{key:'intent-events',type:'QUICK ACTION',title:'Upcoming events',meta:'Open the JYC event calendar',searchText:'upcoming events today tomorrow this week',icon:'◷',priority:120,go:()=>nav('/events')}]:
  /(sector\s*62|62 campus|sector\s*128|128 campus|venue|where)/.test(term)?[{key:'intent-map',type:'QUICK ACTION',title:'Events & venues',meta:'Find event venues from published JYC events',searchText:'venue event location',icon:'⌖',priority:100,go:()=>nav('/events')}]:
  false?[]:
  []
 ):[];
 const ranked=rankSearchResults(rawResults,term).map(r=>({...r, _score:r._score+(r.priority||0)}));
 const results=term?ranked.sort((a,b)=>b._score-a._score).slice(0,16):[];
 const searchResults=[...results,...(results.length<16?intentResults:[])];
 const total=results.length;
 const goResult=r=>{remember(term);r.go();close()};
 const runRecent=x=>{setQ(x);setTimeout(()=>inputRef.current?.focus(),0)};
 const onInputKeyDown=e=>{
   if(e.key==='Escape'){e.preventDefault();close();return;}
   if(e.key==='ArrowDown'&&searchResults.length){e.preventDefault();setSelected(i=>(i+1)%searchResults.length);return}
   if(e.key==='ArrowUp'&&searchResults.length){e.preventDefault();setSelected(i=>(i-1+searchResults.length)%searchResults.length);return}
   if(e.key==='Enter'&&searchResults[selected]){e.preventDefault();goResult(searchResults[selected]);}
 };
 const content=<div className="overlay search-overlay" role="dialog" aria-modal="true" aria-label="JYC search" onMouseDown={close} onTouchStart={e=>{if(e.target===e.currentTarget)close()}}>
  <div className="search-modal" onMouseDown={e=>e.stopPropagation()}>
   <div className="search-mobile-grabber"/>
   <div className="modal-head"><div><span className="eyebrow">JYC SEARCH</span><span className="search-subtitle">Search the whole public JYC experience.</span></div><button className="icon-btn search-close" onClick={close} aria-label="Close search"><span>ESC</span><b>×</b></button></div>
   <div className="search-input-wrap"><span className="search-field-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></svg></span><input ref={inputRef} autoFocus role="combobox" aria-autocomplete="list" aria-expanded={Boolean(q&&searchResults.length)} aria-controls="jyc-search-results" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={onInputKeyDown} placeholder={isFestMode(data)?"Search clubs, events, people, fests…":"Search clubs, events and people…"} aria-label="Search JYC" aria-activedescendant={searchResults[selected]?`jyc-search-result-${selected}`:undefined}/><kbd>↑↓</kbd>{q&&<button type="button" className="search-clear" onClick={()=>{setQ('');inputRef.current?.focus()}} aria-label="Clear search">×</button>}</div>
   {!q&&<div className="search-suggestions"><span>EXPLORE</span>{[['EXPLORE CLUBS','/clubs'],['FIND EVENTS','/events'],...(isFestMode(data)?[['JIIT FESTS','/fests']]:[]),['JYC TEAM','/team'],['JYC ARCHIVE','/archive']].map(([label,path])=><button key={path} onClick={()=>{remember(label.toLowerCase());nav(path);close()}}>{label}<b>↗</b></button>)}</div>}
   {!q&&recent.length>0&&<div className="search-recent"><span>RECENT</span>{recent.map(x=><button key={x} onClick={()=>runRecent(x)}>{x}<b>×</b></button>)}</div>}
   {!q&&<div className="search-admin-tools"><span>STAFF</span><button onClick={()=>{nav('/admin');close()}}><b>⚙ Control Center</b><small>Publishing, reviews, registrations & operations</small><strong>↗</strong></button></div>}
   <div className="search-meta"><span>{q?`${total} ranked result${total===1?'':'s'}`:'Search published JYC content'}</span><span className="search-shortcuts"><kbd>↑↓</kbd><span>move</span><kbd>Enter</kbd><span>open</span><kbd>Esc</kbd><span>close</span></span></div>
   <div className="search-list" id="jyc-search-results" role="listbox" aria-label="JYC search results">{q&&searchResults.length>0&&searchResults.map((r,i)=><button id={`jyc-search-result-${i}`} role="option" aria-selected={i===selected} className={i===selected?'search-result-active':''} key={r.key} style={{'--result-delay':`${Math.min(i*25,180)}ms`}} onMouseEnter={()=>setSelected(i)} onClick={()=>goResult(r)}><small>{i===0?'BEST MATCH · ':''}{r.icon} {r.type}</small><strong>{r.title}</strong><span>{r.meta}</span><b>↗</b></button>)}{q&&!searchResults.length&&<div className="search-no-results"><span>⌕</span><strong>No matches for “{q}”</strong><p>Try the exact club name, event title, person, fest or venue.</p><button onClick={()=>setQ('')}>Clear search</button></div>}{!q&&<div className="search-empty"><span className="search-empty-icon">⌕</span><strong>Start with a JYC route.</strong><p>Search exact club names, event titles, people, fests or venues — or jump straight into a section.</p><div className="search-empty-actions"><button onClick={()=>{remember('clubs');nav('/clubs');close()}}>Clubs <b>↗</b></button><button onClick={()=>{remember('events');nav('/events');close()}}>Events <b>↗</b></button><button onClick={()=>{remember('archive');nav('/archive');close()}}>Archive <b>↗</b></button></div><div className="search-key-hints"><kbd>Ctrl K</kbd><kbd>/</kbd><kbd>↑↓</kbd><kbd>Enter</kbd></div></div>}</div>
   <div className="search-footer"><span>JIIT YOUTH CLUB · SECTOR 128</span><span>RELEVANCE FIRST</span></div>
  </div>
 </div>;
 return createPortal(content,document.body)
}
function ConfirmDialog({request,onClose}){useEffect(()=>{const onKey=e=>{if(e.key==='Escape')onClose(false);if(e.key==='Enter')onClose(true)};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[onClose]);return <div className="confirm-overlay" role="presentation" onMouseDown={e=>{if(e.currentTarget===e.target)onClose(false)}}><div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="jyc-confirm-title" aria-describedby="jyc-confirm-text"><span className="eyebrow">JYC · CONFIRM</span><h2 id="jyc-confirm-title">{request.title||'Are you sure?'}</h2><p id="jyc-confirm-text">{request.text||''}</p><div className="confirm-actions"><button className="btn secondary" onClick={()=>onClose(false)}>Cancel</button><button className={`btn ${request.danger?'danger':''}`} onClick={()=>onClose(true)}>{request.confirmLabel||'Confirm'}</button></div></div></div>}

function Footer({data,admin}){const nav=useNavigate();return <footer className="jyc-footer jyc-club-footer"><div className="footer-top"><div className="footer-brand"><div className="footer-logo-lockup"><LogoImage alt="JYC logo"/></div><div><strong>JIIT YOUTH CLUB</strong><span>READY TO SOAR · JIIT SECTOR 128</span><p>The student-led club behind JIIT's communities, events and campus experiences.</p></div></div><div className="footer-nav"><span className="eyebrow">JYC</span><div><button onClick={()=>nav('/about')}>About</button><button onClick={()=>nav('/clubs')}>Clubs</button><button onClick={()=>nav('/events')}>Events</button>{isFestMode(data)&&<button onClick={()=>nav('/fests')}>Fests</button>}<button onClick={()=>nav('/team')}>Team</button><button onClick={()=>nav('/recruitment')}>Join JYC</button><button onClick={()=>nav('/calendar')}>Event calendar</button><button onClick={()=>nav('/archive')}>Archive</button><button onClick={()=>nav('/history')}>History</button><button onClick={()=>nav('/contact')}>Contact</button></div></div><div className="footer-connect creator-card"><span className="eyebrow">BUILT FOR JYC</span><strong>JYC public experience</strong><p>Official club information, communities and experiences in one public home.</p><span className="eyebrow">CONNECT</span><a href={JYC_CONTACTS.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href={JYC_CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a><a href={'mailto:'+data.creator.email}>Email ↗</a></div></div><div className="footer-bottom"><small>© {new Date().getFullYear()} JYC 128 · Website by {data.creator.name}</small><span>JIIT YOUTH CLUB</span><button className="footer-admin-link" onClick={()=>nav('/admin')} aria-label="JYC staff access">Staff Control Center ↗</button></div></footer>}

function Loading({stage='INITIALIZING',cached=false}){ 
 const labels={INITIALIZING:['INITIALIZING','CONNECTING TO JYC'],LOADING:['LOADING','PREPARING THE CAMPUS ECOSYSTEM'],SYNCING:['SYNCING',cached?'USING YOUR LATEST SAVED SNAPSHOT':'CHECKING THE LATEST CAMPUS DATA'],READY:['READY','BUILDING YOUR EXPERIENCE'],OFFLINE:['OFFLINE','OPENING THE LAST AVAILABLE JYC EXPERIENCE']};
 const current=labels[stage]||labels.INITIALIZING;
 const progress={INITIALIZING:18,LOADING:44,SYNCING:72,READY:100,OFFLINE:88}[stage]||18;
 return <div className="loading loading-v41" role="status" aria-live="polite" aria-label="Loading JYC"><div className="loading-v41-backdrop" aria-hidden="true"><span/><i/><b/></div><div className="loading-center-v41"><div className="loading-kicker"><i/> JIIT · SECTOR 128 · NOIDA</div><div className="loading-v41-mark-wrap"><span className="loading-v41-line loading-v41-line-a"/><span className="loading-v41-line loading-v41-line-b"/><div className="loading-mark"><LogoImage alt="JIIT Youth Club"/></div></div><div className="loading-logo"><span>JIIT YOUTH CLUB</span><strong>READY TO SOAR</strong></div><p className="loading-tagline">One campus. Many communities. One JYC.</p><div className="loading-v41-steps" aria-hidden="true"><span className={progress>=18?'done':''}>01</span><i/><span className={progress>=44?'done':''}>02</span><i/><span className={progress>=72?'done':''}>03</span><i/><span className={progress>=100?'done':''}>04</span></div><div className="loadline" style={{'--boot-progress':`${progress}%`}}><i/></div><div className="loading-status"><span>{current[0]} · {progress}%</span><span>{current[1]}</span></div></div><div className="loading-foot">JYC · 128 <span>NOIDA · 2026</span></div></div>
}
function BackToTop(){const [show,setShow]=useState(false);useEffect(()=>{const onScroll=()=>setShow(window.scrollY>520);window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll)},[]);if(!show)return null;return <button className="back-to-top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} aria-label="Back to top" title="Back to top">↑</button>}
function ScrollProgress(){const [progress,setProgress]=useState(0);useEffect(()=>{const update=()=>{const d=document.documentElement;const max=d.scrollHeight-d.clientHeight;setProgress(max>0?Math.min(100,(d.scrollTop/max)*100):0)};update();window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);return()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}},[]);return <div className="scroll-progress" aria-hidden="true" style={{'--scroll-progress-width':`${progress}%`}}><i/></div>}
function Theme({theme,setTheme}){
 const switchMode=()=>setTheme(theme==='dark'?'light':'dark');
 return <button className="theme-toggle" onClick={switchMode} aria-label={`Switch to ${theme==='dark'?'light':'dark'} mode`} title={`Switch to ${theme==='dark'?'light':'dark'} mode`}>
  <span className="theme-icon" aria-hidden="true">{theme==='dark'?'☀':'☾'}</span><span className="theme-label">{theme==='dark'?'Day':'Night'}</span>
 </button>
}
function State({title,text,children,compact=false}){return <section className={`state ${compact?'compact':''}`}><span className="eyebrow">JYC</span><h1>{title}</h1><p>{text}</p>{children}</section>}
function Button({children,onClick,secondary=false,danger=false,disabled=false}){return <button disabled={disabled} className={`btn ${secondary?'secondary':''} ${danger?'danger':''}`} onClick={onClick}>{children}</button>}
function Back({to,label='Back'}){const nav=useNavigate();return <button className="back" onClick={()=>to?nav(to):nav(-1)}>← {label}</button>}
function SectionHead({eyebrow,title,text}){return <div className="section-head reveal"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text&&<p>{text}</p>}</div>}
function SearchTopicBand({eyebrow='JYC · JIIT NOIDA',title,text,links=[]}){return <section className="search-topic-band reveal" aria-label="About this JYC page"><style>{`.search-topic-band{display:grid;grid-template-columns:1.5fr .8fr;gap:16px;margin:20px 0;padding:24px;border:1px solid var(--jyc-line);border-radius:18px;background:var(--jyc-surface)}.search-topic-copy h2{margin:5px 0 7px;font-size:clamp(1.3rem,2.2vw,2rem);line-height:1.1}.search-topic-copy p{margin:0;color:var(--jyc-muted);line-height:1.6}.search-topic-links{display:grid;grid-template-columns:1fr 1fr;gap:7px;align-content:center}.search-topic-links a{display:flex;align-items:center;justify-content:space-between;min-height:44px;padding:9px 11px;border:1px solid var(--jyc-line);border-radius:10px;color:inherit;text-decoration:none}.search-topic-links a span{color:var(--jyc-accent)}@media(max-width:760px){.search-topic-band{grid-template-columns:1fr;padding:19px}.search-topic-links{grid-template-columns:1fr}}`}</style><div className="search-topic-copy"><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>{links.length>0&&<nav className="search-topic-links" aria-label="Related JYC pages">{links.map(([label,href])=><a key={href} href={href}>{label}<span aria-hidden="true">↗</span></a>)}</nav>}</section>}
function Breadcrumbs({items=[]}){if(!items.length)return null;return <nav className="visible-breadcrumbs reveal" aria-label="Breadcrumb"><a href="/">JYC</a>{items.map((item,i)=><React.Fragment key={`${item.href||item.label}-${i}`}><span aria-hidden="true">/</span>{item.href&&i<items.length-1?<a href={item.href}>{item.label}</a>:<span aria-current="page">{item.label}</span>}</React.Fragment>)}</nav>}
function EcosystemContextRail(){
 const nav=useNavigate();
 const items=[
  ['/assets/hub-photos/rph-01.webp','COMMUNITY','RPH','/clubs/rph'],
  ['/assets/hub-photos/vamunique-01.webp','CULTURE','VamUnique','/clubs/vamunique'],
  ['/assets/hub-photos/aura-01.webp','ARCHIVE','Aura','/clubs/aura']
 ];
 return <div className="ecosystem-context-rail" aria-label="JYC ecosystem shortcuts">{items.map(([src,kicker,name,path])=><button key={name} onClick={()=>nav(path)}><img src={src} alt="" loading="lazy"/><span><small>{kicker}</small><strong>{name}</strong></span><b aria-hidden="true">↗</b></button>)}</div>
}
function DetailSection({title,eyebrow='JYC DETAIL',children}){return <section className="detail-section reveal"><div className="detail-section-head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div></div>{children}</section>}
function ShareButton({title='Share JYC'}){const share=async()=>{try{if(navigator.share){await navigator.share({title,text:title,url:window.location.href});return}await navigator.clipboard?.writeText(window.location.href);jycToast('Link copied to clipboard.')}catch{}};return <button type="button" className="btn secondary share-button" onClick={share} aria-label={title}>Share ↗</button>}

function Card({children,className='',onClick}){const interactive=typeof onClick==='function';const ref=React.useRef(null);const handleClick=e=>{if(!interactive)return;if(e.target instanceof Element&&e.target.closest('button,a,input,textarea,select,[data-no-card-nav]'))return;onClick(e)};const handleKey=e=>{if(interactive&&e.currentTarget===e.target&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onClick(e)}};const tilt=className.includes('tilt-card');const move=e=>{if(!tilt||!window.matchMedia?.('(hover:hover) and (pointer:fine)').matches)return;const el=ref.current;if(!el)return;const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;el.style.setProperty('--pointer-x',`${((x+.5)*100).toFixed(1)}%`);el.style.setProperty('--pointer-y',`${((y+.5)*100).toFixed(1)}%`);el.style.transform=`perspective(900px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-2px)`};const leave=()=>{if(ref.current){ref.current.style.transform='';ref.current.style.removeProperty('--pointer-x');ref.current.style.removeProperty('--pointer-y')}};return <article ref={ref} className={`card ${className}`} onClick={handleClick} onKeyDown={handleKey} onPointerMove={move} onPointerLeave={leave} tabIndex={interactive?0:undefined}>{children}</article>}

function useCountUp(target,active){const [value,setValue]=useState(0);useEffect(()=>{if(!active){setValue(0);return}let raf;const start=performance.now();const duration=1500;const tick=now=>{const p=Math.min(1,(now-start)/duration);const eased=1-Math.pow(1-p,3);setValue(Math.round(target*eased));if(p<1)raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[target,active]);return value}
function HeroStats({communities=21,families=5,programmes=7,campus='128'}){
 const ref=React.useRef(null);const [active,setActive]=useState(false);
 useEffect(()=>{const el=ref.current;if(!el)return;if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){setActive(true);return}
 const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setActive(true);observer.disconnect()}},{threshold:.4});
 observer.observe(el);return()=>observer.disconnect()},[]);
 const values=[useCountUp(communities,active),useCountUp(families,active),useCountUp(programmes,active)];
 const items=[['Communities',values[0],'+'],['Families',values[1],''],['Major programmes',values[2],'+'],['Campus',campus,'']];
 return <div ref={ref} className="hero-stats" aria-label="JYC at a glance">
  {items.map(([label,value,suffix])=><div key={label}><strong>{value}<span className="stat-suffix">{suffix}</span></strong><span>{label}</span></div>)}
 </div>
}
function ImpactStats({data}){const ref=React.useRef(null);const [active,setActive]=useState(false);const events=data.events.filter(e=>e.published&&!e.archived).length;const clubs=data.clubs.filter(c=>c.published&&c.status!=='archived').length;const moments=data.gallery.length;const total=events+clubs+moments;const e=useCountUp(events,active),c=useCountUp(clubs,active),g=useCountUp(moments,active);useEffect(()=>{const el=ref.current;if(!el)return;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setActive(true);return}const o=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setActive(true);o.disconnect()}},{threshold:.35});o.observe(el);return()=>o.disconnect()},[]);if(!total)return <section ref={ref} className="impact-strip impact-empty reveal"><div><span className="eyebrow">JYC IS READY</span><h2>The platform is ready for its next chapter.</h2><p>Official clubs, events and campus moments will appear here as JYC publishes them.</p></div><span className="impact-empty-mark">READY TO SOAR</span></section>;return <section ref={ref} className="impact-strip reveal"><div className="impact-heading"><span className="eyebrow">JYC IN NUMBERS</span><h2>Built by participation.</h2><p>Live counts from published JYC content.</p></div><div className="impact-stat"><strong>{e}</strong><span>Published events</span></div><div className="impact-stat"><strong>{c}</strong><span>Active clubs</span></div><div className="impact-stat"><strong>{g}</strong><span>Published gallery images</span></div></section>}
function JYCPulse({data}){const published=data.events.filter(e=>e.published&&!e.archived);const upcoming=published.filter(e=>eventState(e)!=='past').length;const live=published.filter(e=>eventState(e)==='live').length;const now=new Date();const todayKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;const today=published.filter(e=>e.date===todayKey).length;const clubs=data.clubs.filter(c=>c.published&&c.status!=='archived').length;const recruitment=data.clubs.filter(c=>c.published&&c.recruitment?.on).length;const hasActivity=upcoming||live||today||clubs||recruitment;if(!hasActivity)return null;return <section className="pulse-strip reveal"><div className="pulse-brand"><i/> <span>JYC PULSE</span></div><div className="pulse-items">{live?<span>{live} live now</span>:today?<span>{today} {today===1?'event':'events'} today</span>:upcoming?<span>{upcoming} upcoming</span>:null}{clubs>0&&<span>{clubs} active {clubs===1?'club':'clubs'}</span>}{recruitment>0&&<span>{recruitment} recruitment {recruitment===1?'window':'windows'}</span>}</div></section>}
function TodayAtJYC({data}){
 const todayKey=(()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`})();
 const rows=data.events.filter(e=>e.published&&!e.archived&&e.date===todayKey).sort((a,b)=>String(a.start||'').localeCompare(String(b.start||'')));
 return <section className="section today-at-jyc reveal"><div className="today-head"><div><span className="eyebrow">TODAY AT JYC</span><h2>What is happening today.</h2><p>Published JYC experiences scheduled for today. If nothing is published, the archive stays quiet.</p></div><span className="today-date">{new Date(`${todayKey}T12:00`).toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short'})}</span></div>{rows.length?<div className="today-list">{rows.map((e,i)=><button key={e.id||i} className="today-row" onClick={()=>window.location.assign(`/events/${slug(e.title)}`)}><span className="today-time">{e.start||'TBA'}</span><span className="today-main"><strong>{e.title}</strong><small>{e.club||'JYC'} · {e.venue||'Venue TBA'}</small></span><span className="today-arrow">↗</span></button>)}</div>:<div className="today-empty"><span>NO PUBLISHED EVENTS TODAY</span><strong>Nothing scheduled for today.</strong><p>Visit Events or the JYC archive for the next published experience.</p></div>}</section>
}
function ArchivePage({data}){
 const nav=useNavigate();
 const years=[...new Set([...data.events.filter(e=>e.published&&!e.archived).map(e=>e.date?.slice(0,4)),...data.gallery.map(g=>g.year||g.date?.slice(0,4)),...data.clubs.filter(c=>c.published&&c.status!=='archived').map(c=>c.year||c.created_at?.slice(0,4))].filter(Boolean))].sort((a,b)=>String(b).localeCompare(String(a)));
 const past=data.events.filter(e=>e.published&&!e.archived&&eventState(e)==='past').sort((a,b)=>`${b.date} ${b.start}`.localeCompare(`${a.date} ${a.start}`));
 const publishedClubs=data.clubs.filter(c=>c.published&&c.status!=='archived');
 return <section className="section page archive-page unified-public-page"><Breadcrumbs items={[{label:'Archive'}]}/><EcosystemContextRail/><div className="archive-hero reveal"><div><span className="eyebrow">JYC ARCHIVE</span><h1>The story we keep.</h1><p>A living record of officially published JYC events, communities and moments. Nothing is invented here; the archive grows with JYC.</p></div><div className="archive-seal"><LogoImage alt="JIIT Youth Club logo"/><span>JYC · NOIDA</span></div></div><div className="archive-year-strip"><span className="eyebrow">YEARS IN THE RECORD</span><div>{years.length?years.map(y=><a key={y} href={`#year-${y}`}>{y}</a>):<span>Awaiting published archive data</span>}</div></div><div className="archive-summary"><div><b>{publishedClubs.length}</b><span>published clubs</span></div><div><b>{past.length}</b><span>past events</span></div><div><b>{data.gallery.length}</b><span>gallery moments</span></div></div><section className="archive-section" id={past[0]?.date?`year-${past[0].date.slice(0,4)}`:undefined}><div className="section-head"><span className="eyebrow">EVENT RECORD</span><h2>Past JYC experiences.</h2><p>Open any published event to revisit its official details.</p></div>{past.length?<div className="archive-event-list">{past.slice(0,12).map((e,i)=><button className="archive-event" key={e.id} onClick={()=>nav('/events/'+slug(e.title))}><span>{String(i+1).padStart(2,'0')}</span><div><small>{fmtDate(e.date)} · {e.club||'JYC'}</small><strong>{e.title}</strong><p>{e.venue||'Venue TBA'}</p></div><b>↗</b></button>)}</div>:<State compact title="The archive is waiting." text="Published past events will appear here when JYC adds them."/>}</section><section className="archive-section archive-stories"><div className="section-head"><span className="eyebrow">JYC STORIES</span><h2>People, places, performances and making.</h2><p>Selected visual stories drawn from the supplied hub presentations.</p></div><div className="archive-story-collage">{PDF_HUB_EXTRA_GALLERY.slice(0,12).map((g,i)=><figure className={`archive-story-photo story-photo-${i%6}`} key={g.id}><img src={g.url} alt={g.caption} loading="lazy"/><figcaption><small>{g.association}</small><span>{g.caption.split(" · ")[1]||g.caption}</span></figcaption></figure>)}</div></section><section className="archive-section"><div className="section-head"><span className="eyebrow">COMMUNITY RECORD</span><h2>Communities in the ecosystem.</h2><p>Official published club profiles remain part of the JYC record.</p></div>{publishedClubs.length?<div className="archive-club-grid">{publishedClubs.slice(0,12).map(c=><button key={c.id} className="archive-club" onClick={()=>nav('/clubs/'+slug(c.name))}><span>{c.type||'JYC'}</span><strong>{c.name}</strong><small>{c.category||'Community'}</small></button>)}</div>:<State compact title="No published clubs yet." text="Published club profiles will appear here automatically."/>}</section></section>
}

function Home({data}){
 const nav=useNavigate();
 const heroArtRef=React.useRef(null);
 useEffect(()=>{const el=heroArtRef.current;if(!el||!window.matchMedia?.('(hover:hover) and (pointer:fine)').matches)return;const move=e=>{const r=el.getBoundingClientRect();const x=((e.clientX-r.left)/r.width-.5)*2;const y=((e.clientY-r.top)/r.height-.5)*2;el.style.setProperty('--hero-mx',`${x*7}px`);el.style.setProperty('--hero-my',`${y*7}px`);el.style.setProperty('--glow-x',`${(x+.5)*100}%`);el.style.setProperty('--glow-y',`${(y+.5)*100}%`);};const reset=()=>{el.style.setProperty('--hero-mx','0px');el.style.setProperty('--hero-my','0px');el.style.setProperty('--glow-x','50%');el.style.setProperty('--glow-y','50%')};el.addEventListener('pointermove',move);el.addEventListener('pointerleave',reset);return()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',reset)}},[]);
 const h=data.homepage||{};
 const [eventFilter,setEventFilter]=useState('ALL');
 const [clubFilter,setClubFilter]=useState('ALL');
 const upcoming=data.events.filter(e=>e.published&&!e.archived&&eventState(e)!=='past').sort((a,b)=>(Number(!!b.pinned)-Number(!!a.pinned))||`${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
 const clubs=data.clubs.filter(c=>c.published&&c.status!=='archived').sort((a,b)=>(Number(!!b.pinned)-Number(!!a.pinned))||String(a.name).localeCompare(String(b.name)));
 const eventFamilies=['ALL',...[...new Set(upcoming.map(e=>String(e.eventType||'JYC EXPERIENCE').trim()).filter(Boolean))].slice(0,7)];
 const filteredEvents=eventFilter==='ALL'?upcoming:upcoming.filter(e=>String(e.eventType||'JYC EXPERIENCE').trim()===eventFilter);
 const featured=filteredEvents.find(e=>e.featured)||filteredEvents[0];
 const clubFamilies=['ALL',...[...new Set(clubs.flatMap(c=>[c.type,c.category]).map(x=>String(x||'').trim()).filter(Boolean))].slice(0,5)];
 const filteredClubs=clubFilter==='ALL'?clubs:clubs.filter(c=>String(c.type||'').trim()===clubFilter||String(c.category||'').trim()===clubFilter);
 const principles=h.principles||[];
 const render={
  intro:<section id="about" className="section intro reveal" key="intro"><SectionHead eyebrow="ABOUT JYC" title={h.aboutTitle||'The student ecosystem behind campus life.'} text={h.aboutText||'JIIT Youth Club connects the apex student body, hubs, societies, volunteers, festival committees and campus experiences at JIIT Sector 128.'}/><div className="principles">{principles.map((p,i)=><div key={i}><b>{String(i+1).padStart(2,'0')}</b><strong>{p.title}</strong><span>{p.text}</span></div>)}</div><div className="home-about-ecosystem"><div className="home-about-family"><span className="eyebrow">FIVE FAMILIES · {Object.keys(JYC_HUB_CONTENT).length} NAMED COMMUNITIES</span><div>{JYC_HUB_FAMILIES.map((family,i)=><span key={family}><b>{String(i+1).padStart(2,'0')}</b>{family}</span>)}</div></div><div className="home-about-programmes"><span className="eyebrow">MAJOR PROGRAMMES</span><div>{PDF_HUB_PROGRAMME.map(p=><span key={p.name}>{p.name}</span>)}</div></div></div></section>,
  ecosystem:<section className="section jyc-orientation-section reveal" key="ecosystem"><div className="jyc-orientation-head"><div><span className="eyebrow">JYC 2026–27 · ORIENTATION</span><h2>The campus ecosystem, mapped clearly.</h2><p>The supplied orientation material describes JYC as a student-governed organisation that brings together talent, communities, activities and major campus experiences.</p></div><button className="reference-view-all" onClick={()=>nav('/clubs')}>Explore all communities →</button></div><div className="jyc-glance-grid">{JYC_ORIENTATION_AT_A_GLANCE.map((x,i)=><article key={x.label}><span>{String(i+1).padStart(2,'0')}</span><small>{x.label}</small><strong>{x.value}</strong><p>{x.detail}</p></article>)}</div><div className="jyc-family-explorer">{JYC_ORIENTATION_FAMILIES.map((family,i)=><article key={family.name} className="jyc-family-card"><div className="jyc-family-number">{String(i+1).padStart(2,'0')}</div><span className="eyebrow">{family.name}</span><h3>{family.label}</h3><p>{family.description}</p><div className="jyc-family-examples">{family.examples.map(name=><button key={name} onClick={()=>nav('/clubs/'+slug(name))}>{name}<b>↗</b></button>)}</div></article>)}</div><div className="jyc-structure-strip"><div><span className="eyebrow">ORGANIZATIONAL MODEL</span><h3>How the ecosystem moves.</h3></div><div className="jyc-structure-steps">{JYC_ORIENTATION_LAYERS.map(x=><div key={x.step}><b>{x.step}</b><strong>{x.title}</strong><span>{x.text}</span></div>)}</div></div><div className="jyc-major-rhythm"><div><span className="eyebrow">MAJOR PROGRAMME RHYTHM</span><h3>From welcome to farewell.</h3></div><div className="jyc-rhythm-list">{JYC_ORIENTATION_EVENTS.map((e,i)=><button key={e.name} onClick={()=>nav('/events')}><span>{String(i+1).padStart(2,'0')}</span><strong>{e.name}</strong><small>{e.type}</small></button>)}</div></div></section>,
  activities:<section className="section activities-section reveal" key="activities"><SectionHead eyebrow={h.activitiesEyebrow||'WHAT WE DO'} title={h.activitiesTitle||'Make space for participation.'} text={h.activitiesText||'Discover the ways JYC connects communities, events, creativity and opportunities.'}/>{(h.activities||PUBLIC_ACTIVITIES).length?<div className="activity-grid">{(h.activities||PUBLIC_ACTIVITIES).map((a,i)=><article className="activity-card" key={i}><span>{String(i+1).padStart(2,'0')}</span><h3>{a.title}</h3><p>{a.text}</p>{a.link&&<button onClick={()=>nav(a.link)}>Explore →</button>}</article>)}</div>:null}</section>,

  today:<TodayAtJYC data={data}/>,

  events:<section id="events" className="section home-events reveal" key="events"><div className="reference-section-head"><div><span className="eyebrow">{h.eventsEyebrow||"WHAT'S NEXT"}</span><h2>{h.eventsTitle||'The next JYC moment.'}</h2><p>{h.eventsText||'Upcoming experiences stay chronological.'}</p></div><button className="reference-view-all" onClick={()=>nav('/events')}>View all events <span>→</span></button></div>{upcoming.length?<><div className="jyc-now-strip">{(()=>{const live=upcoming.find(e=>eventState(e)==='live');const next=upcoming.find(e=>eventState(e)==='upcoming');const active=live||next;return active?<><span className={live?'jyc-now-status live':'jyc-now-status'}><i/>{live?'LIVE NOW':'NEXT UP'}</span><strong>{active.title}</strong><small>{fmtDate(active.date)} · {active.start||'Time TBA'} · {active.venue||'Venue TBA'}</small><button onClick={()=>nav('/events/'+slug(active.title))}>Open →</button></>:null})()}</div><div className="jyc-festival-index" aria-label="JYC event families"><span className="jyc-festival-label">EXPLORE BY EXPERIENCE</span>{eventFamilies.map((type,i)=><button type="button" className={eventFilter===type?'is-active':''} key={type} onClick={()=>setEventFilter(type)}>{type==='ALL'?<b>ALL</b>:<><b>{String(i).padStart(2,'0')}</b>{type}</>}</button>)}</div>{featured&&<div className="jyc-feature-event"><div className="jyc-feature-copy"><span className="eyebrow">{eventState(featured)==='live'?'LIVE NOW · ':''}{featured.eventType||'JYC EXPERIENCE'}</span><h3>{featured.title}</h3><p>{featured.description||'Open the published event page for official details, timing and venue.'}</p>{featured.summitStats?.length>0&&<div className="jyc-feature-stats">{featured.summitStats.slice(0,4).map((x,i)=><span key={i}><b>{String(i+1).padStart(2,'0')}</b>{x}</span>)}</div>}<div className="jyc-feature-meta"><span>{fmtDate(featured.date)}{featured.dateEnd?' – '+fmtDate(featured.dateEnd):''}</span><span>{featured.teamSize||'Team details TBA'}</span><span>{featured.venue||'Venue TBA'}</span></div><div className="jyc-feature-actions"><button className="btn" onClick={()=>nav('/events/'+slug(featured.title))}>Open experience ↗</button>{featured.registrationUrl&&<a className="btn secondary" href={safeExternalUrl(featured.registrationUrl)||'#'} target="_blank" rel="noopener noreferrer">Register ↗</a>}</div></div>{featured.poster?<div className="jyc-feature-poster"><img src={featured.poster} alt={featured.title+' poster'} loading="lazy"/></div>:<div className="jyc-feature-poster jyc-feature-poster-fallback"><LogoImage alt="" /></div>}</div>}<div className="reference-event-grid">{filteredEvents.filter(e=>e.id!==featured?.id).slice(0,3).map((e,i)=><EventCard key={e.id} e={e} index={i}/>)}</div>{!filteredEvents.length&&<div className="feature-empty"><strong>No published experiences in this category.</strong><span>Choose another experience family or open all events.</span></div>}</>:<div className="home-programme-grid">{PDF_HUB_PROGRAMME.map((e,i)=><article className={'home-programme-card home-programme-'+(i%4)} key={e.name}><img src={e.image} alt={e.name+' · JYC programme'} loading="lazy"/><div><span className="tag">{e.type}</span><h3>{e.name}</h3><p>{e.text}</p><button onClick={()=>nav('/events')}>Open events →</button></div></article>)}</div>}</section>,
  past:<section className="section past-section reveal" key="past"><SectionHead eyebrow="ARCHIVE" title="What JYC has already created." text="Published past events remain part of the JYC story."/>{(()=>{const pastEvents=data.events.filter(e=>e.published&&!e.archived&&eventState(e)==='past').sort((a,b)=>`${b.date} ${b.start}`.localeCompare(`${a.date} ${a.start}`)).slice(0,3);return pastEvents.length?<div className="past-grid">{pastEvents.map((e,i)=><button className="past-card" key={e.id} onClick={()=>nav('/events/'+e.id)}><span>{String(i+1).padStart(2,'0')}</span><div><small>{fmtDate(e.date)} · {e.club||'JYC'}</small><h3>{e.title}</h3><p>{e.description||'Open the event archive.'}</p></div><b>↗</b></button>)}</div>:<State compact title="The archive is waiting." text="Past JYC events will appear here once they are published."/>})()}</section>,
  clubs:<section id="clubs" className="section dark-band reveal" key="clubs"><SectionHead eyebrow={h.clubsEyebrow||'DISCOVER'} title={h.clubsTitle||'Explore the JYC ecosystem.'} text={h.clubsText||'Technical, non-technical, creative, cultural and everything between.'}/>{clubs.length>0&&<div className="jyc-club-index" aria-label="JYC club categories"><span>FIND BY TYPE</span>{clubFamilies.map(type=><button type="button" className={clubFilter===type?'is-active':''} key={type} onClick={()=>setClubFilter(type)}>{type}</button>)}</div>}<div className="club-grid">{filteredClubs.slice(0,4).map(c=><ClubCard key={c.id} c={c}/>)}</div>{!filteredClubs.length&&<State compact title="No clubs in this category yet." text="Choose another category or view the full club directory."/>}<Button secondary onClick={()=>nav('/clubs')}>View all clubs →</Button></section>,
  updates:<section className="section home-latest-updates reveal" key="updates"><div className="latest-update-head"><div><span className="eyebrow">LATEST UPDATES</span><h2>What needs your attention.</h2><p>Registrations, notices and the next published JYC experiences.</p></div><button className="reference-view-all" onClick={()=>nav('/announcements')}>All announcements →</button></div><div className="latest-update-grid">{[...(data.announcement?.on&&data.announcement?.text?[{title:'JYC Update',text:data.announcement.text,href:data.announcement.link||'/announcements'}]:[]),...upcoming.slice(0,3).map(e=>({title:e.title,text:fmtDate(e.date)+' · '+(e.venue||'Venue TBA')+' · '+(e.club||'JYC'),href:'/events/'+slug(e.title)}))].slice(0,3).map((u,i)=><a className="latest-update-card" key={u.title+i} href={u.href.startsWith('/')?u.href:safeExternalUrl(u.href)||'/announcements'} target={u.href.startsWith('/')?'_self':'_blank'} rel={u.href.startsWith('/')?undefined:'noopener noreferrer'}><span className="latest-index">{String(i+1).padStart(2,'0')}</span><span><strong>{u.title}</strong><small>{u.text}</small></span><b>↗</b></a>)}</div></section>,  moments:<MomentsSection data={data}/>,
  hubStories:<section id="hub-stories" className="section hub-stories-section reveal" key="hubStories"><div className="reference-section-head"><div><span className="eyebrow">FROM THE SUPPLIED HUB MATERIAL</span><h2>More of JYC, from the communities themselves.</h2><p>Stories, programmes and visual material gathered from the supplied JYC hub presentations.</p></div><button className="reference-view-all" onClick={()=>nav('/clubs')}>Explore all hubs <span>→</span></button></div><div className="hub-story-grid">{PDF_HUB_STORIES.map((story,i)=><article className={`hub-story-card hub-story-${i%6}`} key={story.name}><img src={story.image} alt={`${story.name} · ${story.focus}`} loading="lazy"/><div className="hub-story-copy"><span className="tag">{story.family} · {story.focus}</span><h3>{story.name}</h3><p>{story.text}</p><button onClick={()=>nav('/clubs/'+slug(story.name))}>Open hub →</button></div></article>)}</div></section>,
  hubPhotoWall:<section className="section hub-photo-wall-section reveal" key="hubPhotoWall"><div className="reference-section-head"><div><span className="eyebrow">FROM THE HUB ARCHIVE</span><h2>More faces, stages, teams and work.</h2><p>A compact visual wall assembled from the supplied JYC hub presentations.</p></div><button className="reference-view-all" onClick={()=>nav("/gallery")}>Open full gallery <span>→</span></button></div><div className="hub-photo-wall">{PDF_HUB_EXTRA_GALLERY.slice(0,18).map((g,i)=><button className={`hub-photo-wall-item wall-${i%8}`} key={g.id} onClick={()=>nav("/gallery")}><img src={g.url} alt={g.caption} loading="lazy"/><span><small>{g.association}</small><strong>{g.caption.split(" · ")[1]||g.caption}</strong></span></button>)}</div></section>,
  journal:<section className="section jyc-journal-section reveal" key="journal"><div className="reference-section-head"><div><span className="eyebrow">JYC STORIES</span><h2>Communities, captured in their own work.</h2><p>A visual editorial record built from the supplied JYC hub presentations — clubs, performances, technical work and campus experiences.</p></div><button className="reference-view-all" onClick={()=>nav("/archive")}>Open JYC archive <span>→</span></button></div><div className="jyc-journal-grid">{PDF_HUB_STORIES.slice(0,8).map((story,i)=><article className={`jyc-journal-card journal-${i%8}`} key={story.name}><img src={story.image} alt={`${story.name} · ${story.focus}`} loading="lazy"/><div><span className="tag">{story.family} · {story.focus}</span><h3>{story.name}</h3><p>{story.text}</p><button onClick={()=>nav("/clubs/"+slug(story.name))}>Read hub story ↗</button></div></article>)}</div></section>,
  agentic:<section className="section agentic-home-band reveal" key="agentic"><div className="agentic-home-inner"><div><span className="eyebrow">FEATURED EXPERIENCE · OCTOBER 2026</span><h2>Jaypee Agentic AI 2026.</h2><p>Human intelligence meets agentic possibilities. Open the dedicated experience for highlights, areas, audience and participation.</p></div><a className="btn" href="/events/jai-2026-jaypee-agentic-ai-hackathon">Explore Agentic AI ↗</a></div></section>,
  team:<section id="team" className="section home-team-preview reveal" key="team"><div className="reference-section-head"><div><span className="eyebrow">THE PEOPLE BEHIND JYC</span><h2>Meet the people who move JYC.</h2><p>Student leadership and the people behind the communities, events and campus experiences.</p></div><button className="reference-view-all" onClick={()=>nav('/team')}>Meet the team <span>→</span></button></div>{data.team.filter(m=>m.published===true).slice(0,6).map((m,i)=><article className={`home-team-card home-team-collage-${i%6}`} key={m.id||i}><div className="home-team-photo">{teamPhotoFor(m)?<img src={teamPhotoFor(m)} alt={m.name||'JYC team member'} loading="lazy"/>:<LogoImage alt="JIIT Youth Club logo"/>}</div><div><span className="tag">{m.role||m.position||'JYC Team'}</span><h3>{m.name||'JYC Team Member'}</h3>{(m.bio||m.description)&&<p>{m.bio||m.description}</p>}</div></article>)}</section>,
  cta:<section className="section cta reveal" key="cta"><span className="eyebrow">{h.ctaEyebrow||'READY TO SOAR'}</span><h2>{h.ctaTitle||'One campus. Many ways to belong.'}</h2><p>{h.ctaText||'Explore the public JYC experience and find your next community.'}</p><Button onClick={()=>nav('/clubs')}>{h.ctaButton||'Explore JYC ↗'}</Button></section>
 };
 const configured=Array.isArray(h.layout)&&h.layout.length?h.layout:['intro','agentic','events','activities','clubs','moments','hubPhotoWall','hubStories','team','cta']; const normalizedLayout=configured.map(x=>x==='gallery'?'moments':x); const enhancedLayout=[...normalizedLayout,'updates','ecosystem','activities','journal','hubPhotoWall','hubStories']; const baseLayout=[...new Set(enhancedLayout.filter(x=>render[x]))]; const hasAgentic=upcoming.some(e=>e.id==='agentic-ai-2026'); const layout=hasAgentic&&!baseLayout.includes('agentic')?[...baseLayout.slice(0,1),'agentic',...baseLayout.slice(1)]:baseLayout; const visibleLayout=layout.filter(x=>x!=='hubStories'&&!(x==='events'&&h.showEvents===false)&&!(x==='clubs'&&h.showClubs===false)&&!((x==='moments'||x==='hubPhotoWall')&&h.showGallery===false));
 return <div className="home v40-home">
 <section id="hero" className="hero v40-hero">
  <div className="v40-hero-copy hero-copy">
   <div className="v40-hero-kicker"><span className="eyebrow">{h.heroEyebrow||'JIIT · SECTOR 128 · NOIDA'}</span><span className="v40-live-dot"><i/>{data.events.some(e=>e.published&&!e.archived&&eventState(e)==='live')?'LIVE ON CAMPUS':'STUDENT LED'}</span></div>
   <h1><span>THE VOICE.</span><span>THE TALENT.</span><em>THE SPIRIT.</em></h1>
   <div className="v40-hero-rule"/>
   <h4>{h.heroSubtitle||'JIIT YOUTH CLUB'}</h4>
   <p>{h.heroLead||'The student-led ecosystem connecting communities, events, creativity, technology, sport and campus spirit at JIIT Sector 128.'}</p>
   <div className="hero-actions v40-hero-actions"><Button onClick={()=>nav('/clubs')}>Explore JYC ↗</Button><Button secondary onClick={()=>nav('/events')}>What’s next →</Button><button className="btn hero-join-soon" type="button" onClick={()=>nav('/recruitment')} title="JYC recruitment">Join JYC · Coming Soon</button></div>
   <div className="v40-hero-micro"><span>01 <b>COMMUNITIES</b></span><span>02 <b>EXPERIENCES</b></span><span>03 <b>MEMORIES</b></span></div>
   <HeroStats communities={clubs.length} families={JYC_HUB_FAMILIES.length} programmes={PDF_HUB_PROGRAMME.length} campus="128"/>
  </div>
  <div className="v40-hero-visual" ref={heroArtRef}>
   <div className="v40-visual-frame">
    <div className="v40-visual-top"><span>JYC / 128</span><span>01 — IDENTITY</span></div>
    <button className="v40-interactive-logo hero-logo-stage" type="button" aria-label="Interact with the JYC emblem" onClick={e=>{e.currentTarget.classList.remove('is-active');requestAnimationFrame(()=>e.currentTarget.classList.add('is-active'))}}>
      <span className="v40-logo-halo"/><img src={logo} alt="JIIT Youth Club official emblem" fetchPriority="high" decoding="async" onError={e=>{if(e.currentTarget.dataset.fallback==="1")return;e.currentTarget.dataset.fallback="1";e.currentTarget.src=logoFallback}}/>
      <span className="v40-logo-pulse" aria-hidden="true"/>
    </button>
    <div className="v40-visual-bottom"><span>CLICK THE EMBLEM</span><span className="v40-scroll-arrow">↓</span></div>
   </div>
   <div className="v40-visual-caption"><strong>JIIT YOUTH CLUB</strong><span>Student communities · campus experiences · Sector 128</span></div>
  </div>
 </section>{data.announcement.on&&data.announcement.text&&<div className="announcement reveal"><span>JYC UPDATE</span><p>{data.announcement.text}</p>{safeExternalUrl(data.announcement.link)&&<a href={safeExternalUrl(data.announcement.link)} target="_blank" rel="noopener noreferrer">Open ↗</a>}</div>}<JYCPulse data={data}/><JYCNowStrip data={data}/><ImpactStats data={data}/><HistoryTeaser/><div className="home-layout">{visibleLayout.map(k=>render[k])}</div></div>
}
function JoinJYC(){
 const nav=useNavigate();
 return <section className="section page unified-public-page join-jyc-page">
  <Breadcrumbs items={[{label:'Join JYC'}]}/><EcosystemContextRail/>
  <div className="join-soon-hero reveal">
   <div className="join-soon-mark"><LogoImage alt="JIIT Youth Club logo"/></div>
   <span className="eyebrow">JYC · 2026–27</span>
   <h1>Join JYC.</h1>
   <p>The next JYC recruitment cycle is being prepared. When applications open, this page will become the official starting point for opportunities across the JYC apex body, committees and communities.</p>
   <div className="hero-actions" style={{justifyContent:'center',marginTop:24}}>
    <Button onClick={()=>nav('/clubs')}>Explore communities ↗</Button>
    <Button secondary onClick={()=>nav('/events')}>See JYC in action →</Button>
   </div>
  </div>
  <div className="join-benefits reveal">
   <article><b>01</b><h3>Leadership</h3><p>Discover how students coordinate people, programmes and campus experiences.</p></article>
   <article><b>02</b><h3>Communities</h3><p>Find the cultural, technical, creative, literary and sports spaces that fit you.</p></article>
   <article><b>03</b><h3>Opportunities</h3><p>Official application links and deadlines will appear here once the next cycle is published.</p></article>
  </div>
  <section className="section-inline-head reveal" style={{marginTop:40,textAlign:'center'}}>
   <div><span className="eyebrow">UNTIL THEN</span><h2>Explore first. Join when the door opens.</h2><p>Use Clubs and Events to understand the JYC ecosystem before applications go live.</p></div>
  </section>
 </section>
}

function About({data}){
 const nav=useNavigate();
 const h=data.homepage||{};
 const principles=h.principles||[];
 return <section className="section page unified-public-page about-page">
  <Breadcrumbs items={[{label:'About JYC'}]}/><EcosystemContextRail/><SearchTopicBand eyebrow="ABOUT JYC · JIIT NOIDA" title="What is JIIT Youth Club?" text="JIIT Youth Club (JYC) is the student-led community ecosystem at JIIT Wish Town Campus, Sector 128, Noida, connecting clubs, hubs, events, leadership and campus experiences beyond academics." links={[["JYC clubs","/clubs"],["JYC events","/events"],["JYC leadership","/team"]]}/>
  <div className="about-hero-v28 v40-about-hero reveal">
   <div className="about-hero-copy"><span className="eyebrow">ABOUT JYC · JIIT 128</span><h1>The student ecosystem behind campus life.</h1><p>{h.aboutText||'JIIT Youth Club connects students, communities, leadership and campus experiences across JIIT Sector 128.'}</p><div className="about-hero-actions"><Button onClick={()=>nav('/clubs')}>Find your community ↗</Button><Button secondary onClick={()=>nav('/events')}>See what is happening →</Button></div></div>
   <div className="about-hero-mark"><div><LogoImage alt="JIIT Youth Club"/></div><span>VOICE · TALENT · SPIRIT</span></div>
  </div>
  <section className="v40-about-snapshot reveal" aria-label="JYC at a glance">
   <div className="v40-about-snapshot-intro"><span className="eyebrow">JYC AT A GLANCE</span><h2>One coordinating body. A whole campus ecosystem.</h2><p>JYC connects faculty guidance, student leadership, communities, volunteers and experiences so students can move from discovering an interest to actually participating.</p></div>
   <div className="v40-about-metrics"><article><strong>{JYC_HUB_FAMILIES.length}</strong><span>community families</span></article><article><strong>{Object.keys(JYC_HUB_CONTENT).length}</strong><span>named communities</span></article><article><strong>{PDF_HUB_PROGRAMME.length}</strong><span>programme strands</span></article><article><strong>{data.team.filter(m=>m.published===true).length}</strong><span>published people</span></article></div>
   <div className="v40-about-leadership"><div><span className="eyebrow">LEADERSHIP LAYERS</span><strong>Faculty → Apex → Core → Communities</strong><p>The public structure reflects the supplied orientation material instead of inventing a parallel hierarchy.</p></div><button className="reference-view-all" onClick={()=>nav('/team')}>Meet the team →</button></div>
  </section>
  <section className="about-intro-v28 reveal"><span className="eyebrow">WHY JYC EXISTS</span><h2>A place to participate, create, lead and belong.</h2><p>JYC is a student-governed organisation that gives students a platform to display their talents, organises inter- and intra-institutional activities and helps first-year students acclimate to campus life.</p><div className="about-principles-v28">{(principles.length?principles:[{title:'Student-led, faculty-advised',text:'Student leadership works with faculty guidance and institutional support.'},{title:'Communities with purpose',text:'Clubs and hubs give students focused spaces to learn, create, compete and perform.'},{title:'Experiences that connect',text:'Events turn those communities into shared campus moments.'}]).map((p,i)=><article key={i}><b>{String(i+1).padStart(2,'0')}</b><h3>{p.title}</h3><p>{p.text}</p></article>)}</div></section>
  <section className="about-families-v28 reveal"><div className="about-section-title-v28"><span className="eyebrow">THE JYC ECOSYSTEM</span><h2>Five families. Many ways to belong.</h2><p>The supplied JYC material groups communities across Cultural, Technical, Creative, Literary and Sports families. The current named list on this site is derived directly from that supplied orientation material.</p></div><div className="about-family-grid-v28">{JYC_HUB_FAMILIES.map((family,i)=><button key={family} onClick={()=>nav('/clubs')}><span>{String(i+1).padStart(2,'0')}</span><strong>{family}</strong><small>Explore community →</small></button>)}</div></section>
  <section className="about-flow-v28 reveal"><div className="about-section-title-v28"><span className="eyebrow">HOW JYC WORKS</span><h2>Guidance → leadership → communities → experiences.</h2></div><div className="about-flow-grid-v28">{[['01','Faculty guidance','Institutional support and direction'],['02','Apex Body','Student leadership and coordination'],['03','Hubs & Societies','Communities built around interests and talent'],['04','Coordinators & Volunteers','People who turn plans into execution'],['05','Events & Experiences','The campus moments students actually join']].map(x=><article key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong><p>{x[2]}</p></article>)}</div></section>
  <section className="about-programmes-v28 reveal"><div className="about-section-title-v28"><span className="eyebrow">THE CAMPUS RHYTHM</span><h2>From welcome to farewell.</h2><p>The supplied JYC programme material highlights recurring major experiences. Current dates and registrations remain controlled by published event records.</p></div><div className="about-programme-grid-v28">{PDF_HUB_PROGRAMME.map((p,i)=><article key={p.name}><div className="about-programme-image"><img src={p.image} alt={p.name+' · JYC programme'} loading="lazy"/><span>{String(i+1).padStart(2,'0')}</span></div><div><small>{p.type}</small><h3>{p.name}</h3><p>{p.text}</p><button onClick={()=>nav('/events')}>Open events →</button></div></article>)}</div></section>
  <section className="about-vision-v28 reveal"><article><span className="eyebrow">VISION</span><h2>A campus where every student can find a place to participate, create, lead and belong.</h2></article><article><span className="eyebrow">MISSION</span><p>Connect students with clubs and communities, create meaningful experiences, develop leadership and teamwork, and make campus life more participatory.</p><div className="about-inline-links"><button onClick={()=>nav('/team')}>Meet the people →</button><button onClick={()=>nav('/gallery')}>See the archive →</button></div></article></section>
  <section className="about-section-title-v28 reveal" style={{marginTop:28,textAlign:'center'}}>
   <span className="eyebrow">WHAT WE STAND FOR</span>
   <h2>Seven principles that shape the JYC experience.</h2>
   <p>These are presented as the public-facing values of the student ecosystem; operational details remain controlled by JYC.</p>
  </section>
  <section className="about-principles-v33 reveal">
   {[
    ['01','Student voice','Students have a platform to participate, contribute and shape campus life.'],
    ['02','Creativity','Performance, design, writing, media and making belong in the same ecosystem.'],
    ['03','Leadership','Responsibility grows through real coordination, execution and teamwork.'],
    ['04','Innovation','Technical communities turn curiosity into projects, competitions and learning.'],
    ['05','Collaboration','Hubs, committees and volunteers create experiences together.'],
    ['06','Inclusivity','There should be a place to discover, learn, contribute and belong.'],
    ['07','Campus spirit','JYC turns participation, celebration and shared responsibility into a stronger campus community.']
   ].map(([n,t,p])=><article className="about-principle-v33" key={t}><span>{n}</span><strong>{t}</strong><p>{p}</p></article>)}
  </section>
  <div className="about-source-note reveal">Content scope: JYC 128 hub orientation material + current public JIIT information. Current event, recruitment and team records are published separately through the JYC Control Center.</div>
  <section className="about-next-v28 reveal"><span className="eyebrow">YOUR NEXT STEP</span><h2>See the organisation in action.</h2><div><Button onClick={()=>nav('/clubs')}>Explore clubs ↗</Button><Button secondary onClick={()=>nav('/events')}>Explore events →</Button><Button secondary onClick={()=>nav('/team')}>Meet JYC →</Button></div></section>
 </section>
}
function Clubs({data}){
 const [family,setFamily]=useState('All'),[type,setType]=useState('All'),[cat,setCat]=useState('All'),[interest,setInterest]=useState('All'),[q,setQ]=useState(''),[filtersOpen,setFiltersOpen]=useState(false);
 const visible=data.clubs.filter(c=>c.published&&c.status!=='archived').sort((a,b)=>(Number(!!b.pinned)-Number(!!a.pinned))||String(a.name).localeCompare(String(b.name)));
 const familyOf=c=>hubProfile(c)?.family||c.family||'';
 const familyVisible=visible.filter(c=>family==='All'||familyOf(c)===family);
 const cats=[...new Set(familyVisible.filter(c=>type==='All'||c.type===type).map(c=>c.category).filter(Boolean))];
 const ints=[...new Set(familyVisible.filter(c=>type==='All'||c.type===type).flatMap(c=>c.interests||[]))];
 const discoveryAliases=Object.fromEntries(Object.entries(JYC_COMMUNITY_DISCOVERY).map(([key,terms])=>[key.toLowerCase(),terms]));
 const query=String(q||'').trim().toLowerCase();
 const discoveryTerms=discoveryAliases[query]||[];
 const list=familyVisible.filter(c=>type==='All'||c.type===type).filter(c=>cat==='All'||c.category===cat).filter(c=>interest==='All'||(c.interests||[]).includes(interest)).filter(c=>{if(!query)return true;const hay=`${c.name} ${c.category} ${familyOf(c)} ${(c.interests||[]).join(' ')} ${c.description||''} ${c.about||''}`.toLowerCase();return hay.includes(query)||discoveryTerms.some(term=>hay.includes(term))});
 const clear=()=>{setQ('');setFamily('All');setType('All');setCat('All');setInterest('All')};
 return <section className="section page clubs-page clubs-page-v41 unified-public-page"><Breadcrumbs items={[{label:'Clubs'}]}/><EcosystemContextRail/><SearchTopicBand eyebrow="JIIT CLUBS · JYC 128" title="Official JIIT clubs and student communities" text="Explore JYC's published technical, cultural, literary, creative and sports communities at JIIT Wish Town Campus, Sector 128, Noida. Open a community to see its story, people, events, links and published media." links={[["JYC events","/events"],["JYC leadership","/team"],["JYC archive","/archive"]]}/><div className="compact-page-head clubs-page-head reveal"><div><span className="eyebrow">JYC CLUBS</span><h1>Explore the JYC ecosystem.</h1><p>Explore the official JYC community list through the five families defined in the supplied orientation material — then narrow by type, category or interest.</p></div><div className="page-stat-row"><span><b>{visible.length}</b> named communities</span><span><b>{JYC_HUB_FAMILIES.length}</b> families</span><span><b>{visible.filter(c=>c.type==='Technical').length}</b> technical</span></div></div>
  <div className="hub-spectrum reveal"><div><span className="eyebrow">THE JYC HUB SPECTRUM</span><h2>Start with what interests you.</h2><p>Culture, technology, creative work, literature and sport all sit inside the same JYC ecosystem. The filters below are derived from the supplied orientation list.</p></div><div className="hub-spectrum-tags">{JYC_HUB_FAMILIES.map((x,i)=><button type="button" className={family===x?'is-active':''} key={x} onClick={()=>{setFamily(x);setCat('All');setInterest('All')}}><b>{String(i+1).padStart(2,'0')}</b>{x}</button>)}</div></div>
  <section className="find-community-panel reveal" aria-labelledby="find-community-title"><div><span className="eyebrow">JYC COMMUNITY MAP</span><h2 id="find-community-title">Explore by craft, culture, technology and sport.</h2><p>Use the themes below to browse the JYC ecosystem. This is a discovery aid—not a ranking of clubs.</p></div><div className="find-community-chips">{['Build & code','AI & robotics','Music & dance','Theatre & performance','Writing & debate','Design & media','Sports & fitness','Social impact','Leadership & events'].map(label=><button type="button" key={label} className={q.toLowerCase().includes(label.toLowerCase())?'is-active':''} onClick={()=>setQ(label)}>{label}</button>)}</div><div className="find-community-actions"><button type="button" className="btn" onClick={()=>{setQ('');setFamily('All');setType('All');setCat('All');setInterest('All');setFiltersOpen(true)}}>View full directory</button><span>{visible.length} published communities · {JYC_HUB_FAMILIES.length} families</span></div></section>
  <div className="discover-panel discover-panel-compact reveal"><label className="club-search"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search communities..." aria-label="Search communities"/>{q&&<button type="button" onClick={()=>setQ('')} aria-label="Clear club search">×</button>}</label><button type="button" className={`filter-toggle ${filtersOpen?'active':''}`} onClick={()=>setFiltersOpen(v=>!v)} aria-expanded={filtersOpen}>More filters <span>{filtersOpen?'−':'+'}</span></button></div>
  {filtersOpen&&<div className="club-filter-panel reveal"><div className="discover"><span>FAMILY</span>{['All',...JYC_HUB_FAMILIES].map(x=><button className={family===x?'active':''} onClick={()=>{setFamily(x);setCat('All');setInterest('All')}} key={x}>{x==='All'?'Everything':x}</button>)}</div><label><span>Type</span><select value={type} onChange={e=>setType(e.target.value)}><option value="All">All types</option>{['Technical','Non-Technical'].map(x=><option key={x}>{x}</option>)}</select></label><label><span>Category</span><select value={cat} onChange={e=>setCat(e.target.value)}><option value="All">All categories</option>{cats.map(x=><option key={x}>{x}</option>)}</select></label><label><span>Interest</span><select value={interest} onChange={e=>setInterest(e.target.value)}><option value="All">All interests</option>{ints.map(x=><option key={x}>{x}</option>)}</select></label><button className="filter-clear" onClick={clear}>Clear filters</button></div>}
  <div className="results-line"><span>{list.length} {list.length===1?'community':'communities'} found</span>{(q||family!=='All'||type!=='All'||cat!=='All'||interest!=='All')&&<button onClick={clear}>Clear filters</button>}</div>
  {list.length?<div className="club-grid clubs-grid-premium">{list.map((c,i)=><ClubCard key={c.id} c={c} index={i}/>)}</div>:<State title="No published communities match those filters." text="Try another family or clear the filters."/>}
 <HubDirectory data={data}/>
 </section>
}
function HubDirectory({data}){
 const nav=useNavigate();
 const entries=Object.entries(JYC_HUB_CONTENT);
 const [active,setActive]=useState(entries[0]?.[0]||'');
 const [family,setFamily]=useState('All');
 const activeMedia=sourceHubMedia(active);
 const visibleEntries=family==='All'?entries:entries.filter(([,p])=>p.family===family);
 const photoBacked=entries.filter(([name])=>sourceHubMedia(name).photos.length>0).length;
 const activeIdentity=hubIdentity(active);
 useEffect(()=>{if(!visibleEntries.some(([name])=>name===active))setActive(visibleEntries[0]?.[0]||'')},[family]);
 return <section className="hub-directory hub-directory-v41 reveal">
  <div className="hub-directory-head">
   <div><span className="eyebrow">JYC HUB DIRECTORY · SOURCE MEDIA</span><h2>Twenty-one communities. Twenty-one identities.</h2><p className="small-copy">Move through the maintained All Hubs archive. The directory separates verified source photography from identity-led profiles instead of substituting unrelated images.</p></div>
   <div className="hub-directory-stats"><span><b>{entries.length}</b> communities</span><span><b>{photoBacked}</b> photo-backed</span><span><b>{entries.length-photoBacked}</b> profile-led</span></div>
  </div>
  <div className="hub-family-row" role="tablist" aria-label="Filter communities by family">
   <button type="button" className={family==='All'?'is-active':''} onClick={()=>setFamily('All')}>All <b>{entries.length}</b></button>
   {JYC_HUB_FAMILIES.map(x=><button type="button" className={family===x?'is-active':''} key={x} onClick={()=>setFamily(x)}>{x} <b>{entries.filter(([,p])=>p.family===x).length}</b></button>)}
  </div>
  <div className="hub-directory-stage">
   <div className="hub-directory-list" role="list">
    {visibleEntries.map(([name,p],i)=>{
      const live=data.clubs.find(c=>String(c.name||'').trim().toLowerCase()===name.toLowerCase());
      const identity=hubIdentity(name); const media=sourceHubMedia(name);
      return <button type="button" key={name} className={`hub-directory-card ${active===name?'is-active':''}`} style={{'--hub-accent':identity.accent,'--hub-accent-soft':`color-mix(in srgb, ${identity.accent} 12%, transparent)`}} onMouseEnter={()=>setActive(name)} onFocus={()=>setActive(name)} onClick={()=>nav(live?'/clubs/'+slug(live.name):'/clubs/'+slug(name))}>
       <span className="hub-directory-index">{String(entries.findIndex(([n])=>n===name)+1).padStart(2,'0')}</span>
       <span className="hub-directory-copy"><small>{p.family} · {p.focus}</small><strong>{name}</strong><em>{identity.signature}</em></span>
       <span className="hub-directory-count">{media.photos.length?media.photos.length+' photos':'profile-led'} ↗</span>
      </button>
    })}
   </div>
   <aside className="hub-directory-preview" aria-live="polite" style={{'--hub-accent':activeIdentity.accent,'--hub-accent-soft':`color-mix(in srgb, ${activeIdentity.accent} 14%, transparent)`}}>
    <div className="hub-preview-image">
     {activeMedia.photos[0]?<img src={activeMedia.photos[0]} alt={active+' supplied JYC visual'} loading="lazy"/>:<div className="hub-preview-fallback"><span className="hub-identity-glyph">{activeIdentity.glyph}</span><strong>{active}</strong><small>Source profile is available; standalone photography has not been extracted for this community.</small></div>}
     <span>{activeMedia.photos.length?activeMedia.photos.length+' source visuals':'PROFILE-LED SOURCE'}</span>
    </div>
    <div className="hub-preview-copy"><span className="eyebrow">{activeMedia.family||'JYC COMMUNITY'} · {activeMedia.focus||'COMMUNITY'}</span><h3>{active}</h3><p>{activeMedia.summary||'Source-grounded community profile.'}</p><div>{(activeIdentity.traits||[]).slice(0,4).map(x=><span key={x}>{x}</span>)}</div><button type="button" className="text-link" onClick={()=>nav('/clubs/'+slug(active))}>Open full profile →</button></div>
   </aside>
  </div>
 </section>
}
function ClubCard({c,index=0}){
 const nav=useNavigate();
 const identity=hubIdentity(c.name);
 const social=socialProfile(c.name);
 const identityStyle={'--hub-accent':identity.accent,'--hub-accent-soft':`color-mix(in srgb, ${identity.accent} 14%, transparent)`,'--hub-accent-line':`color-mix(in srgb, ${identity.accent} 30%, transparent)`};
 return <Card className="club-card club-card-premium club-card-v41 tilt-card reveal club-identity-card" data-hub={slug(c.name)} style={identityStyle} onClick={()=>nav('/clubs/'+slug(c.name))}><div className="club-card-visual" style={c.banner?{backgroundImage:`linear-gradient(135deg,var(--bg-card),transparent 65%),url(${c.banner})`}:{}}><div className="club-logo">{c.logo?<img src={c.logo} alt={`${c.name} logo`} loading="lazy"/>:<LogoImage alt="JIIT Youth Club logo"/>}</div><span className="club-index">{String(index+1).padStart(2,'0')}</span></div><div className="card-body"><div className="club-identity-mini"><span><b className="hub-identity-glyph">{identity.glyph}</b>{identity.motif}</span><b>{identity.signature}</b>{c.sourceMediaLabel&&<small>{c.sourceMediaLabel}</small>}</div><div className="card-topline"><span className="tag">{c.type} · {c.category||'Community'}</span>{c.pinned&&<span className="pin-badge">PINNED</span>}</div><h3>{c.name}</h3><p>{c.description||'Official JYC club information will appear here.'}</p><div className="chips">{(c.interests||[]).slice(0,4).map(i=><span key={i}>{i}</span>)}</div><div className="club-card-footer"><span className="text-link">Explore club</span><span>↗</span></div>{(c.socials?.instagram||c.socials?.linkedin||c.socials?.website)&&<div className="club-socials" onClick={ev=>ev.stopPropagation()}>{c.socials?.instagram&&<a href={safeExternalUrl(c.socials.instagram)||'#'} target="_blank" rel="noopener noreferrer" aria-label={`${c.name} Instagram`}>IG {c.socials.instagramHandle||'Instagram'} ↗</a>}{c.socials?.linkedin&&<a href={safeExternalUrl(c.socials.linkedin)||'#'} target="_blank" rel="noopener noreferrer" aria-label={`${c.name} LinkedIn`}>LinkedIn ↗</a>}{c.socials?.website&&<a href={safeExternalUrl(c.socials.website)||'#'} target="_blank" rel="noopener noreferrer" aria-label={`${c.name} website`}>Website ↗</a>}{social?.verifiedOn&&<small>Verified {social.verifiedOn}</small>}</div>}</div></Card>
}

function eventVisualFor(e,index=0){
 const explicit=safeExternalUrl(e?.poster)||'';
 if(explicit)return explicit;
 const hay=`${e?.title||''} ${e?.club||''}`.toLowerCase();
 const candidates=[...PDF_HUB_GALLERY,...PDF_HUB_EXTRA_GALLERY,...PUBLIC_GALLERY_FALLBACK];
 const matched=candidates.find(g=>{const a=String(g.association||'').toLowerCase();const cap=String(g.caption||'').toLowerCase();return (a&&hay.includes(a.split(' · ')[0]))||(cap&&hay.split(/\\s+/).some(w=>w.length>4&&cap.includes(w)));});
 if(matched?.url)return matched.url;
 return candidates.length?candidates[Math.abs(String(e?.id||e?.title||index).split('').reduce((n,ch)=>n+ch.charCodeAt(0),0))%candidates.length]?.url:'';
}
function EventCard({e,index=0}){
 const nav=useNavigate();
 const state=eventState(e);
 const identity=eventIdentity(e);
 const identityStyle={'--hub-accent':identity.accent,'--hub-accent-soft':`color-mix(in srgb, ${identity.accent} 12%, transparent)`,'--hub-accent-line':`color-mix(in srgb, ${identity.accent} 28%, transparent)`,'--identity-shape':`var(--jyc-shape-${identity.shape||'event'})`};
 return <Card className="event-card event-card-premium tilt-card reveal event-identity-card" data-hub={slug(e.club||'JYC')} style={identityStyle} onClick={()=>nav('/events/'+slug(e.title))}><div className="event-poster" style={eventVisualFor(e,index)?{backgroundImage:`linear-gradient(180deg,rgba(20,25,39,.08),rgba(20,25,39,.64)),url(${eventVisualFor(e,index)})`}:{}}><span className={state==='live'?'live':''}>{state==='live'?'LIVE NOW':fmtDate(e.date)}</span><span className="event-number">{String(index+1).padStart(2,'0')}</span><span className="event-domain-mark">{identity.glyph||'◆'}</span><span className="event-domain-label">{identity.motif}</span></div><div className="card-body"><div className="event-identity-mini"><span>{identity.motif}</span><b>{identity.signature}</b><i>{identity.traits?.join(' · ')}</i></div><div className="card-topline"><span className="tag">{e.club||'JYC'}</span>{e.pinned&&<span className="pin-badge">FEATURED</span>}</div><h3>{e.title}</h3><p>{e.description||'Official JYC event details.'}</p><div className="event-card-meta"><span><b>{e.start||'TBA'}</b>{e.end?` – ${e.end}`:''}</span><span>{e.venue||'Venue TBA'}</span></div><span className="text-link">Open event details →</span></div></Card>
}
function EventTimelinePreview({events}){
 const nav=useNavigate();
 const items=[...events].slice(0,8);
 return <section className="event-timeline-preview reveal"><div className="event-timeline-head"><div><span className="eyebrow">EVENT TIMELINE</span><h2>Experiences with their own visual language.</h2><p>Every published event carries its own identity. Hover a row to see its organiser, date and source poster when one exists.</p></div><a className="text-link" href="/events">Open full archive →</a></div><div className="event-timeline-list">{items.map((e,i)=>{const identity=eventIdentity(e);return <button key={e.id||i} className="event-timeline-row" style={{'--hub-accent':identity.accent,'--hub-accent-soft':`color-mix(in srgb, ${identity.accent} 12%, transparent)`}} onClick={()=>nav('/events/'+slug(e.title))}><span className="event-timeline-number">{String(i+1).padStart(2,'0')}</span><span className="event-timeline-date">{fmtDate(e.date)}</span><span className="event-timeline-title"><small>{identity.motif}</small><strong>{e.title}</strong></span><span className="event-timeline-club">{e.club||'JYC'}</span><span className="event-timeline-media">{e.poster?<img src={e.poster} alt="" loading="lazy"/>:<i>{identity.glyph}</i>}</span><b>↗</b></button>})}</div></section>
}
function EventDetail({data,id,session}){
 const e=findEntity(data.events,id);
 if(!e||!e.published||e.archived)return <section className="section page"><Back label="Back to events" to="/events"/><State title="Event not found." text="This event may be unpublished or archived."/></section>;
 const state=eventState(e);
 const related=[...data.gallery.filter(g=>e.galleryIds?.includes(g.id)||g.eventId===e.id),...PDF_HUB_EXTRA_GALLERY.filter(g=>{const a=String(g.association||'').toLowerCase();const t=String(e.title||'').toLowerCase();const club=String(e.club||'').toLowerCase();return (t&&a&&t.includes(a))||(club&&a&&club.includes(a))||(a&&t.includes(a.split(' · ')[0]||'___'));})].filter((g,i,a)=>a.findIndex(x=>x.id===g.id)===i).slice(0,18);
 const relatedClub=data.clubs.find(c=>String(c.id)===String(e.clubId)||String(c.name||'').trim().toLowerCase()===String(e.club||'').trim().toLowerCase());
 const identity=eventIdentity(e);
 const identityStyle={'--hub-accent':identity.accent,'--hub-accent-soft':`color-mix(in srgb, ${identity.accent} 12%, transparent)`,'--hub-accent-line':`color-mix(in srgb, ${identity.accent} 28%, transparent)`,'--identity-shape':`var(--jyc-shape-${identity.shape||'event'})`};
 const regOpen=!e.registrationDeadline||new Date(e.registrationDeadline)>new Date();
 const timeline=Array.isArray(e.timeline)?e.timeline:(Array.isArray(e.schedule)?e.schedule:[]);
 const relatedEvents=data.events.filter(x=>x.published&&!x.archived&&x.id!==e.id&&((e.clubId&&String(x.clubId)===String(e.clubId))||(e.club&&String(x.club||'').toLowerCase()===String(e.club).toLowerCase()))).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).slice(0,3);
 return <section className="section page event-detail-page event-identity-page" data-hub={slug(e.club||'JYC')} style={identityStyle}><Breadcrumbs items={[{label:'Events',href:'/events'},{label:e.title}]}/><Back label="Back to events" to="/events"/>
  <div className="event-detail-hero reveal" data-event={slug(e.title)}><div className="event-detail-poster" style={{...identityStyle,...(e.poster?{backgroundImage:`linear-gradient(135deg,rgba(255,253,248,.06),transparent 60%),url(${e.poster})`}:{})}}>{state==='live'&&<span className="live">LIVE NOW</span>}<span className="event-detail-badge">{fmtDate(e.date)}</span><span className="event-domain-mark">{identity.motif}</span></div><div className="event-copy">{e.summitLogo&&<div className="event-summit-logo"><img src={e.summitLogo} alt={e.summitTitle||'JAI 2026 summit'} loading="eager"/></div>}<div className="card-topline"><span className="tag">{e.club||'JYC'}</span><span className={`state-label ${state}`}>{state.toUpperCase()}</span></div><div className="event-identity-lockup"><span className="event-identity-glyph">{identity.glyph||'◆'}</span><div><span className="event-identity-signature">{identity.signature}</span><small>{identity.motif}</small></div></div><h1>{e.title}</h1><div className="event-facts"><span>◷ {fmtDate(e.date)}{e.dateEnd?(' – '+fmtDate(e.dateEnd)):''} · {e.start||'TBA'}{e.end?(' – '+e.end):''}</span>{e.capacity&&<span>◉ Capacity {e.capacity}{e.waitlist?' · Waitlist enabled':''}</span>}<span>⌖ {e.venue||'Venue TBA'}{safeExternalUrl(e.map_url)&&<a className="inline-map" href={safeExternalUrl(e.map_url)} target="_blank" rel="noopener noreferrer">Map ↗</a>}</span></div><p className="large-copy">{e.description||'Official JYC event details.'}</p>{e.highlights?.length>0&&<div className="event-highlight-block"><span className="eyebrow">HIGHLIGHTS</span><ul className="feature-list">{e.highlights.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}{e.tracks?.length>0&&<div className="event-highlight-block event-track-grid"><span className="eyebrow">AGENTIC AI TRACKS</span><div className="event-track-cards">{e.tracks.map((x,i)=><article key={i}><b>0{i+1}</b><h3>{x.name}</h3><p>{x.detail}</p></article>)}</div></div>}{e.summitStats?.length>0&&<div className="event-highlight-block event-summit-stats"><span className="eyebrow">SUMMIT AT A GLANCE</span><div>{e.summitStats.map((x,i)=><span key={i}><b>{String(i+1).padStart(2,'0')}</b>{x}</span>)}</div></div>}{(e.rules?.length||e.eligibility||e.prizes?.length||e.faqs?.length)&&<section className="event-extended-info reveal"><div className="event-extended-grid">{e.eligibility&&<article><span className="eyebrow">ELIGIBILITY</span><h3>Who can participate?</h3><p>{e.eligibility}</p></article>}{e.rules?.length>0&&<article><span className="eyebrow">RULES</span><h3>Before you register.</h3><ul className="feature-list">{e.rules.map((x,i)=><li key={i}>{typeof x==='string'?x:x.text||x.title}</li>)}</ul></article>}{e.prizes?.length>0&&<article><span className="eyebrow">PRIZES</span><h3>Recognition & prizes.</h3><ul className="feature-list">{e.prizes.map((x,i)=><li key={i}>{typeof x==='string'?x:x.title||x.text}</li>)}</ul></article>}{e.faqs?.length>0&&<article><span className="eyebrow">FAQS</span><h3>Common questions.</h3><div className="event-faq-list">{e.faqs.map((x,i)=><details key={i}><summary>{x.question||x.q||'Question'}</summary><p>{x.answer||x.a||''}</p></details>)}</div></article>}</div></section>}{(e.speaker||e.guest)&&<div className="speaker"><span>FEATURED</span><strong>{e.speaker||e.guest}</strong><small>{e.speaker?'Speaker':'Guest'}</small></div>}{e.id==='agentic-ai-2026'&&<><div className="event-external-links"><a href={safeExternalUrl(e.officialUrl)||'#'} target="_blank" rel="noopener noreferrer">Official JAI website ↗</a><a href={safeExternalUrl(e.discordUrl)||'#'} target="_blank" rel="noopener noreferrer">Discord ↗</a><a href={safeExternalUrl(e.mapUrl)||'#'} target="_blank" rel="noopener noreferrer">Venue map ↗</a></div><section className="event-jai-support"><div className="event-jai-qr"><img src="https://www.jiityouthclub128.in/imgs/unstop-qr.png" alt="JAI 2026 Unstop registration QR" loading="lazy"/><span>Scan to register</span></div><div><span className="eyebrow">OFFICIAL SUMMIT CONTACT</span><h3>Need help before you build?</h3><p>For team formation, participant questions and challenge submissions, contact the Hackathon Desk.</p><div className="event-jai-contact"><a href="mailto:hackathonquery.jai@gmail.com">hackathonquery.jai@gmail.com</a><a href="mailto:sponsorquery.jai@gmail.com">Sponsorship Desk</a></div><small>Supported by {e.sponsor||'RIDE Initiative'} · JIIT Wish Town, Sector 128, Noida.</small></div></section></>}<div className="detail-actions">{e.registrationMode==='native'?<a className="btn" href={`/events/${slug(e.title)}/register`}>{regOpen?'REGISTER NOW':'REGISTRATIONS CLOSED'}</a>:regOpen&&e.registrationUrl?<a className="btn" href={safeExternalUrl(e.registrationUrl)||'#'} target="_blank" rel="noopener noreferrer" onClick={ev=>{if(!safeExternalUrl(e.registrationUrl))ev.preventDefault()}}>REGISTER NOW ↗</a>:e.registrationUrl?<Button secondary disabled>REGISTRATIONS CLOSED</Button>:null}<ShareButton title={`Share ${e.title}`}/><EventTools event={e}/><DownloadICS event={e}/></div>{(()=>{const media=sourceEventMedia(e);return media.items.length>0?<section className="event-source-gallery reveal" aria-label={`${e.title} source photography`}><div className="section-inline-head"><div><span className="eyebrow">VISUAL RECORD</span><h2>Moments from the JYC archive.</h2><p>Published source photography connected to this experience. Images retain their available collection and page context.</p></div><span className="event-source-count">{media.items.length} source visuals</span></div><div className="event-source-gallery-grid">{media.items.slice(0,8).map((m,i)=><figure key={m.id||m.url||i}><img src={m.url} alt={m.caption||`${e.title} JYC source visual ${i+1}`} loading="lazy"/><figcaption><span>{m.caption||'JYC source visual'}</span>{m.page&&<small>Source page {m.page}</small>}</figcaption></figure>)}</div></section>:null})()}{(e.contactName||e.contactEmail||e.contactPhone)&&<div className="contact-line"><b>Contact</b><span>{e.contactName}</span><span>{e.contactEmail}</span><span>{e.contactPhone}</span></div>}</div></div>
  {(timeline.length>0||relatedClub)&&<div className="event-context-grid reveal"><aside className="event-identity-panel"><span className="eyebrow">EVENT DNA</span><strong>{identity.display||'JYC EVENT'}</strong><span>{identity.traits?.join(' · ')}</span><small>{identity.motif}</small></aside>{timeline.length>0&&<section className="event-context-card"><span className="eyebrow">PROGRAMME</span><h2>How the experience unfolds.</h2><div className="event-timeline">{timeline.map((x,i)=><div key={x.id||i}><b>{x.time||x.date||String(i+1).padStart(2,'0')}</b><div><strong>{x.title||x.name||'Programme item'}</strong>{(x.description||x.venue)&&<span>{x.description||x.venue}</span>}</div></div>)}</div></section>}{relatedClub&&<section className="event-context-card event-related-club"><span className="eyebrow">COMMUNITY CONNECTION</span><h2>Presented with {relatedClub.name}.</h2><p>{relatedClub.description||relatedClub.about||identity.signature}</p><a className="text-link" href={`/clubs/${slug(relatedClub.name)}`}>Explore the hub →</a></section>}</div>}
  {related.length>0&&<DetailSection title="Event gallery"><GalleryItems items={related}/></DetailSection>}
  {relatedEvents.length>0&&<section className="event-related-events reveal"><div className="section-inline-head"><div><span className="eyebrow">MORE FROM {e.club||'JYC'}</span><h2>Other experiences.</h2></div><a className="text-link" href="/events">All events →</a></div><div className="event-related-grid">{relatedEvents.map(x=><a className="event-related-card" key={x.id} href={`/events/${slug(x.title)}`}><small>{fmtDate(x.date)} · {x.start||'TBA'}</small><strong>{x.title}</strong><span>{x.venue||'Venue TBA'}</span><b>Open →</b></a>)}</div></section>}
  </section>
}

function Announcements({data}){
 const updates=[];
 if(data.announcement?.on&&data.announcement?.text) updates.push({title:'JYC Update',text:data.announcement.text,link:data.announcement.link||''});
 const upcoming=data.events.filter(e=>e.published&&!e.archived&&eventState(e)!=='past').sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).slice(0,8);
 upcoming.forEach(e=>{if(e.registrationUrl||e.registrationMode==='native')updates.push({title:`Registration · ${e.title}`,text:`${fmtDate(e.date)} · ${e.venue||'Venue TBA'} · ${e.club||'JYC'}`,link:`/events/${slug(e.title)}`})});
 return <section className="section page announcements-page unified-public-page"><Breadcrumbs items={[{label:'Announcements'}]}/><EcosystemContextRail/><div className="announcements-hero reveal"><div><span className="eyebrow">JYC UPDATES</span><h1>Know what needs your attention.</h1><p>Registrations, notices and published updates — kept simple, current and action-oriented.</p></div><div className="announcements-mark"><LogoImage alt="JIIT Youth Club"/><span>STAY UPDATED · STAY CONNECTED</span></div></div><div className="announcement-index reveal">{updates.length?updates.map((u,i)=><article key={i} className="announcement-card"><span>{String(i+1).padStart(2,'0')}</span><div><small>JYC UPDATE</small><h2>{u.title}</h2><p>{u.text}</p>{u.link&&<a className="text-link" href={u.link.startsWith('/')?u.link:safeExternalUrl(u.link)||'#'} target={u.link.startsWith('/')?'_self':'_blank'} rel={u.link.startsWith('/')?undefined:'noopener noreferrer'}>Open update →</a>}</div></article>):<State title="No announcements published." text="When JYC publishes a notice, registration update or important announcement, it will appear here."/>}</div><div className="announcement-footer-card reveal"><span className="eyebrow">OFFICIAL SOURCE OF TRUTH</span><h2>Follow JYC without missing the campus rhythm.</h2><p>Use Events for full event details, Clubs for communities and Gallery for the visual record.</p><div className="hero-actions"><Button onClick={()=>window.location.assign('/events')}>Explore events →</Button><Button secondary onClick={()=>window.location.assign('/clubs')}>Explore clubs →</Button></div></div></section>
}
function Achievements({data}){
 const nav=useNavigate();
 return <section className="section page achievements-page unified-public-page"><Breadcrumbs items={[{label:'Achievements'}]}/><EcosystemContextRail/><div className="achievements-hero reveal"><div><span className="eyebrow">JYC WALL OF FAME</span><h1>What the community has built.</h1><p>Published outcomes, recognition and evidence-backed milestones belong in the public JYC record.</p></div><div className="achievements-seal"><span>WALL</span><strong>OF FAME</strong><small>JYC · 128</small></div></div><section className="achievement-feature reveal"><div><span className="eyebrow">SUPPLIED JYC MATERIAL</span><h2>SIH Finalist</h2><p>The supplied JYC hub material includes a Wall of Fame section recording an SIH Finalist achievement. New outcomes should be published with their event, year and supporting source.</p></div><span className="achievement-number">01</span></section><div className="achievement-footer-card reveal"><span className="eyebrow">SOURCE-FIRST RECORD</span><h2>Recognition without invented claims.</h2><p>JYC can expand this page with verified awards, competition results and community milestones as the organisation publishes them. Certificates and student-verification systems are intentionally outside this public website.</p><div className="hero-actions"><Button onClick={()=>nav('/archive')}>Open archive →</Button><Button secondary onClick={()=>nav('/contact')}>Contact JYC ↗</Button></div></div></section>
}

function addCalendar(e){const dt=(s,t)=>{const [y,m,d]=String(s||'').split('-');const raw=String(t||'00:00').trim();const parts=raw.split(':');const hh=String(Math.max(0,Math.min(23,Number(parts[0]||0)))).padStart(2,'0');const mm=String(Math.max(0,Math.min(59,Number(parts[1]||0)))).padStart(2,'0');return `${y}${m}${d}T${hh}${mm}00`};if(!e?.date)return;const startTime=e.start||'09:00';const start=dt(e.date,startTime);const startDate=new Date(`${e.date}T${startTime}:00`);const endDate=e.dateEnd||e.date;const endTime=e.end||(e.dateEnd?'23:59':new Date(startDate.getTime()+60*60*1000).toTimeString().slice(0,5));const end=dt(endDate,endTime);const url=`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title||'JYC Event')}&dates=${start}/${end}&details=${encodeURIComponent(e.description||'')}&location=${encodeURIComponent(e.venue||'')}`;window.open(url,'_blank','noopener')}
function Calendar({events}){const by=events.reduce((a,e)=>{(a[e.date]??=[]).push(e);return a},{});return <div className="calendar">{Object.keys(by).sort().map(d=><div className="calendar-day" key={d}><div><span>{fmtDate(d)}</span><b>{by[d].length}</b></div>{by[d].map(e=><div className="calendar-event" key={e.id}><strong>{e.start||'TBA'}</strong><span>{e.title}</span><small>{e.club||'JYC'} · {e.venue||'TBA'}</small></div>)}</div>)}{!events.length&&<State compact title="Calendar is empty." text="Published events will appear here."/>}</div>}
function Fest({data}){
 const f=data.fest||{};
 const rows=Array.isArray(f.events)?f.events:[];
 const [tab,setTab]=useState('now');
 const [q,setQ]=useState('');
 const [category,setCategory]=useState('All');
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);
 const allowedFestThemes=['jyc'];
 const storedFestTheme=storageGet(`jyc-fest-theme-${f.id||f.name||'default'}`,null);
 const [festTheme,setFestTheme]=useState(()=>allowedFestThemes.includes(storedFestTheme)?storedFestTheme:(allowedFestThemes.includes(f.theme)?f.theme:'jyc'));
 const theme=festTheme;
 const categories=[...new Set(['All',...(Array.isArray(f.categories)?f.categories:[]),...rows.map(e=>e.category).filter(Boolean)])];
 const normalizeStatus=e=>String(e.status||'Upcoming').toLowerCase();
 const searchText=q.trim().toLowerCase();
 const filtered=rows.filter(e=>category==='All'||String(e.category||'')===category).filter(e=>!searchText||`${e.name||''} ${e.venue||''} ${e.category||''} ${e.day||''}`.toLowerCase().includes(searchText));
 const liveRows=filtered.filter(e=>normalizeStatus(e)==='live');
 const upcomingRows=filtered.filter(e=>!['past','live'].includes(normalizeStatus(e)));
 const pastRows=filtered.filter(e=>normalizeStatus(e)==='past');
 const current=liveRows[0]||((f.liveNow||f.liveVenue)?{id:'live-now',name:f.liveNow||'Happening now',venue:f.liveVenue||'Venue TBA',status:'Live'}:null);
 const tabRows=tab==='past'?pastRows:tab==='schedule'?filtered:[...liveRows,...upcomingRows].slice(0,10);
 const splitLines=value=>Array.isArray(value)?value.filter(Boolean):String(value||'').split(/\n+/).map(x=>x.trim()).filter(Boolean);
 const updates=splitLines(f.announcements);
 const results=splitLines(f.results);
 const startMs=f.startDate?new Date(`${f.startDate}T00:00:00`).getTime():NaN;
 const endMs=f.endDate?new Date(`${f.endDate}T23:59:59`).getTime():NaN;
 const countdownTarget=Number.isFinite(startMs)&&now<startMs?startMs:(Number.isFinite(endMs)&&now<endMs?endMs:null);
 const countdown=countdownTarget?Math.max(0,countdownTarget-now):0;
 const cd={days:Math.floor(countdown/86400000),hours:Math.floor(countdown%86400000/3600000),minutes:Math.floor(countdown%3600000/60000),seconds:Math.floor(countdown%60000/1000)};
 const share=async()=>{try{if(navigator.share)await navigator.share({title:f.name||'JYC Fest',text:f.description||'JYC Fest',url:location.href});else{await navigator.clipboard?.writeText(location.href);jycToast('Fest link copied.')}}catch{}};
 const changeFestTheme=next=>{
  if(!allowedFestThemes.includes(next)||next===festTheme)return;
  const apply=()=>{setFestTheme(next);storageSet(`jyc-fest-theme-${f.id||f.name||'default'}`,next)};
  document.body.classList.add('fest-theme-switching');
  try{
   if(document.startViewTransition){const t=document.startViewTransition(apply);t.finished?.finally(()=>window.setTimeout(()=>document.body.classList.remove('fest-theme-switching'),260))}
   else{apply();window.setTimeout(()=>document.body.classList.remove('fest-theme-switching'),720)}
  }catch{apply();window.setTimeout(()=>document.body.classList.remove('fest-theme-switching'),720)}
 };
 const programmeEvent=e=>({...eventTemplate,title:e.name||'JYC Fest Programme',date:e.date||f.startDate||'',start:e.time||'00:00',end:e.end||e.time||'23:59',venue:e.venue||'',description:`${e.category||'JYC Fest'} · ${e.day||''}`});
 const addProgrammeCalendar=e=>{if(e.date||f.startDate)addCalendar(programmeEvent(e));else jycToast('Add a date to this programme item first.','error')};
 const navLabel=tab==='schedule'?'FULL SCHEDULE':tab==='past'?'FEST ARCHIVE':'NEXT ON THE PROGRAMME';
 return <div className={`fest-shell fest-theme-${theme}`}>
  <span key={festTheme} className="fest-theme-sheen" aria-hidden="true"/>
  <div className="fest-global-nav"><span className="fest-mark">JYC</span><strong>{f.name||'JYC FEST'}</strong><span className="fest-live-indicator"><i/>FEST EXPERIENCE</span><div className="fest-theme-switcher" aria-label="Fest visual themes">{allowedFestThemes.map(id=><button key={id} className={festTheme===id?'active':''} onClick={()=>changeFestTheme(id)} title={`Use ${id} fest theme`} aria-label={`Use ${id} fest theme`}><i className={`fest-theme-dot dot-${id}`}/></button>)}</div><button className="fest-share-btn" onClick={share}>Share ↗</button></div>
  <section className="fest-hero-full" style={f.banner?{backgroundImage:`linear-gradient(90deg,var(--fest-bg) 0%,color-mix(in srgb,var(--fest-bg) 82%,transparent) 48%,transparent),url(${f.banner})`}:{}}><div className="fest-hero-inner"><div className="fest-logo-wrap">{f.logo?<img src={f.logo} alt=""/>:<LogoImage alt="JYC"/>}</div><span className="eyebrow">JYC · FEST EXPERIENCE</span><h1>{f.name||'JYC Fest Experience'}</h1><p>{f.description||'The JYC campus is getting ready for a new experience.'}</p><div className="fest-date-line">{f.startDate&&fmtDate(f.startDate)}{f.endDate&&` — ${fmtDate(f.endDate)}`}</div>{countdownTarget&&<div className="fest-countdown" aria-label="Fest countdown"><div><b>{String(cd.days).padStart(2,'0')}</b><span>DAYS</span></div><div><b>{String(cd.hours).padStart(2,'0')}</b><span>HOURS</span></div><div><b>{String(cd.minutes).padStart(2,'0')}</b><span>MINUTES</span></div><div><b>{String(cd.seconds).padStart(2,'0')}</b><span>SECONDS</span></div></div>}{current&&<div className="fest-live-pulsebar"><i/> LIVE PROGRAMME · {current.name}{current.venue?` · ${current.venue}`:''}</div>}</div></section>
  <section className="fest-content">
   <div className="fest-controlbar"><label className="fest-search"><span>⌕</span><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search programme, venue or category..." aria-label="Search fest programme"/></label><button className="fest-nav-theme" onClick={share}>Share fest ↗</button></div>
   <div className="fest-category-scroll" aria-label="Programme categories">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
   <div className="fest-board"><div className="fest-live-card">{current?<><div className="live-label"><i/> LIVE NOW</div><h2>{current.name}</h2><p>{current.venue||'Venue TBA'}{current.day?` · ${current.day}`:''}{current.time?` · ${current.time}`:''}</p><div className="fest-live-actions"><button className="primary" onClick={()=>setTab('schedule')}>Open live board →</button>{current.id!=='live-now'&&<button onClick={()=>addProgrammeCalendar(current)}>Add to calendar</button>}</div></>:<><span className="eyebrow">FEST LIVE BOARD</span><h2>The stage is getting ready.</h2><p>Live programme updates will appear here when the fest schedule is published.</p><div className="fest-empty-actions"><button onClick={()=>setTab('schedule')}>View schedule</button><button onClick={share}>Share fest</button></div></>}</div><div className="fest-upnext-card"><span className="eyebrow">UP NEXT</span>{upcomingRows[0]?<><h3>{upcomingRows[0].name}</h3><p>{upcomingRows[0].day||''}{upcomingRows[0].time?` · ${upcomingRows[0].time}`:''}{upcomingRows[0].venue?` · ${upcomingRows[0].venue}`:''}</p><button className="fest-nav-theme" onClick={()=>addProgrammeCalendar(upcomingRows[0])}>Add to calendar</button></>:<p>No upcoming programme published.</p>}<div className="fest-stats"><div><b>{liveRows.length}</b><span>Live</span></div><div><b>{upcomingRows.length}</b><span>Upcoming</span></div><div><b>{pastRows.length}</b><span>Archived</span></div></div></div></div>
   <div className="fest-tabs"><button className={tab==='now'?'active':''} onClick={()=>setTab('now')}>Now</button><button className={tab==='schedule'?'active':''} onClick={()=>setTab('schedule')}>Full Schedule</button><button className={tab==='announcements'?'active':''} onClick={()=>setTab('announcements')}>Announcements</button><button className={tab==='results'?'active':''} onClick={()=>setTab('results')}>Results</button><button className={tab==='gallery'?'active':''} onClick={()=>setTab('gallery')}>Gallery</button><button className={tab==='past'?'active':''} onClick={()=>setTab('past')}>Archive</button></div>
   {tab==='announcements'?<div className="fest-update-grid"><section className="fest-update-card"><span className="eyebrow">FEST UPDATES</span><h3>Latest announcements</h3><div className="fest-update-list">{updates.length?updates.map((x,i)=><article key={i}><strong>UPDATE {String(i+1).padStart(2,'0')}</strong><span>{x}</span></article>):<State compact title="No announcements yet." text="Published fest updates will appear here."/>}</div></section><section className="fest-update-card"><span className="eyebrow">QUICK ACTIONS</span><h3>Stay connected.</h3><p>Share the official fest page and keep the live board close while the programme changes.</p><div className="fest-empty-actions"><button onClick={share}>Share fest ↗</button><button onClick={()=>setTab('schedule')}>View schedule →</button></div></section></div>:tab==='results'?<div className="fest-update-grid"><section className="fest-update-card"><span className="eyebrow">RESULTS</span><h3>Winners & outcomes</h3><div className="fest-update-list">{results.length?results.map((x,i)=><article key={i}><strong>RESULT {String(i+1).padStart(2,'0')}</strong><span>{x}</span></article>):<State compact title="Results will appear here." text="Publish winners or outcomes from the JYC Control Center."/>}</div></section><section className="fest-update-card"><span className="eyebrow">ARCHIVE</span><h3>Keep the story alive.</h3><p>Past programme items remain available in the archive, while published fest photos can live in the Gallery tab.</p><button className="fest-nav-theme" onClick={()=>setTab('past')}>Open archive →</button></section></div>:tab==='gallery'?<div className="fest-gallery-panel"><span className="eyebrow">FEST GALLERY</span><h2>Moments from the experience.</h2><GalleryItems items={data.gallery.filter(g=>g.festId===f.id||g.association===f.name||g.association==='fest:'+f.id)}/>{!data.gallery.some(g=>g.festId===f.id||g.association===f.name||g.association==='fest:'+f.id)&&<State compact title="Gallery coming soon." text="Fest photos will appear here when published."/>}</div>:<DetailSection title={navLabel}><div className="fest-programme-grid">{tabRows.map((e,i)=><article className="fest-programme-row" key={e.id||i}><div className="fest-programme-time"><b>{e.time||'—'}</b><span>{e.day||'Date TBA'}</span></div><div className="fest-programme-main"><strong>{e.name||'Untitled programme'}</strong><span>{e.venue||'Venue TBA'}{e.category?` · ${e.category}`:''}</span></div><div className="fest-programme-meta"><em className={normalizeStatus(e)==='live'?'live':''}>{String(e.status||'Upcoming').toUpperCase()}</em>{safeExternalUrl(e.link)&&<a className="fest-nav-theme" href={safeExternalUrl(e.link)} target="_blank" rel="noopener noreferrer">Details ↗</a>}{(e.date||f.startDate)&&<button className="fest-nav-theme" onClick={()=>addProgrammeCalendar(e)}>＋ Calendar</button>}</div></article>)}{!tabRows.length&&<State compact title={tab==='past'?'No archived programme.':'Schedule coming soon.'} text="The fest programme has not been published yet."/>}</div></DetailSection>}
  </section><nav className="fest-mobile-dock" aria-label="Fest navigation">{[['now','Now','●'],['schedule','Schedule','☷'],['announcements','Updates','!'],['results','Results','◇'],['gallery','Gallery','▧']].map(([id,label,icon])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><span>{icon}</span>{label}</button>)}</nav>
 </div>
}


const rootElement=document.getElementById('root');
if(rootElement){createRoot(rootElement).render(<ErrorBoundary><BrowserRouter><App/></BrowserRouter></ErrorBoundary>);}
