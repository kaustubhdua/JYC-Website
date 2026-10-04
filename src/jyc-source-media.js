/* JYC SOURCE MEDIA INDEX · V34
   All imagery in this module is sourced from the maintained JYC hub presentation
   exports already committed to public/assets. It never invents a hub photograph.
*/
import {JYC_HUB_CONTENT} from './v21-hub-content.js';
import {PDF_HUB_GALLERY,PDF_HUB_STORIES,HUB_PHOTO_MAP} from './pdf-hub-content.js';
import {PDF_HUB_EXTRA_GALLERY} from './pdf-hub-extra.js';

const normalise=v=>String(v||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
const SOURCE_GALLERY=[...PDF_HUB_GALLERY,...PDF_HUB_EXTRA_GALLERY];

const QUALITY_OVERRIDES={
  Aakriti:['/assets/hub-photos-extra/aakriti-04.webp','/assets/hub-photos-extra/aakriti-05.webp','/assets/hub-photos-extra/aakriti-06.webp'],
  Aura:['/assets/hub-photos-extra/aura-08.webp','/assets/hub-photos-extra/aura-09.webp','/assets/hub-photos-extra/aura-10.webp','/assets/hub-photos-extra/aura-11.webp','/assets/hub-photos-extra/aura-12.webp','/assets/hub-photos-extra/aura-13.webp'],
  BDS:['/assets/hub-photos-extra/bds-34.webp','/assets/hub-photos-extra/bds-35.webp','/assets/hub-photos-extra/bds-36.webp'],
  CypherX:['/assets/hub-photos-extra/cypherx-51.webp','/assets/hub-photos-extra/cypherx-52.webp','/assets/hub-photos-extra/cypherx-53.webp','/assets/hub-photos-extra/cypherx-54.webp','/assets/hub-photos-extra/cypherx-55.webp'],
  Dronotics:['/assets/hub-photos-extra/dronotics-45.webp','/assets/hub-photos-extra/dronotics-46.webp','/assets/hub-photos-extra/dronotics-47.webp','/assets/hub-photos-extra/dronotics-49.webp'],
  Eloquence:['/assets/hub-photos-extra/eloquence-25.webp','/assets/hub-photos-extra/eloquence-26.webp','/assets/hub-photos-extra/eloquence-27.webp','/assets/hub-photos-extra/eloquence-29.webp'],
  Panache:['/assets/hub-photos-extra/panache-16.webp'],
  Prismatic:['/assets/hub-stories/prismatic.webp','/assets/hub-photos-extra/prismatic-72.webp','/assets/hub-photos-extra/prismatic-73.webp'],
  RPH:['/assets/hub-photos-extra/rph-38.webp','/assets/hub-photos-extra/rph-39.webp','/assets/hub-photos-extra/rph-41.webp','/assets/hub-photos-extra/rph-42.webp'],
  VamUnique:['/assets/hub-photos-extra/vamunique-59.webp','/assets/hub-photos-extra/vamunique-61.webp','/assets/hub-photos-extra/vamunique-62.webp','/assets/hub-photos-extra/vamunique-63.webp'],
  Zencoders:['/assets/hub-photos-extra/zencoders-17.webp','/assets/hub-photos-extra/zencoders-18.webp','/assets/hub-photos-extra/zencoders-19.webp','/assets/hub-photos-extra/zencoders-20.webp','/assets/hub-photos-extra/zencoders-21.webp','/assets/hub-photos-extra/zencoders-22.webp','/assets/hub-photos-extra/zencoders-23.webp','/assets/hub-photos-extra/zencoders-24.webp'],
  Arcadia:['/assets/hub-photos-extra/arcadia-64.webp','/assets/hub-photos-extra/arcadia-65.webp','/assets/hub-photos-extra/arcadia-66.webp'],
  NeuralNexus:['/assets/hub-photos-extra/neural-nexus-67.webp','/assets/hub-photos-extra/neural-nexus-68.webp','/assets/hub-photos-extra/neural-nexus-69.webp','/assets/hub-photos-extra/neural-nexus-70.webp','/assets/hub-photos-extra/neural-nexus-71.webp'],
  Sports:['/assets/hub-photos/sports-01.webp','/assets/hub-photos/sports-02.webp','/assets/hub-photos/sports-03.webp','/assets/hub-photos/sports-04.webp']
};

const QUALITY_BY_KEY=new Map(Object.entries(QUALITY_OVERRIDES).map(([name,photos])=>[normalise(name),photos]));
const storyByKey=new Map(PDF_HUB_STORIES.map(s=>[normalise(s.name),s]));

export function sourceHubMedia(name){
  const key=normalise(name);
  const canonical=Object.keys(JYC_HUB_CONTENT).find(k=>normalise(k)===key);
  const label=canonical||name;
  const quality=QUALITY_BY_KEY.get(normalise(label))||[];
  const mapped=HUB_PHOTO_MAP[label]||[];
  const gallery=SOURCE_GALLERY.filter(g=>normalise(g.association)===key).map(g=>g.url);
  const story=storyByKey.get(key);
  const storyImage=story?.image?[story.image]:[];
  const photos=[...new Set([...quality,...mapped,...gallery,...storyImage])];
  return {name:label,family:JYC_HUB_CONTENT[label]?.family||story?.family||'',focus:JYC_HUB_CONTENT[label]?.focus||story?.focus||'',summary:JYC_HUB_CONTENT[label]?.summary||'',detail:JYC_HUB_CONTENT[label]?.detail||story?.text||'',story:story||null,photos};
}

export function enrichSourceClub(club){
  const media=sourceHubMedia(club?.name);
  const photos=[...new Set([...(Array.isArray(club?.hubPhotos)?club.hubPhotos:[]),...media.photos])];
  const profile=JYC_HUB_CONTENT[media.name];
  return {...club,description:club?.description||profile?.summary||media.summary,about:club?.about||profile?.detail||media.detail,hubPhotos:photos,banner:club?.banner||photos[0]||'',sourceMediaCount:photos.length,sourceMediaLabel:photos.length?'JYC source archive · '+photos.length+' visual'+(photos.length===1?'':'s'):'Identity-led profile · source photography not yet extracted'};
}

export function enrichSourceClubs(clubs){return (Array.isArray(clubs)?clubs:[]).map(enrichSourceClub);}

export function mergeSourceGallery(gallery){
  const map=new Map();
  SOURCE_GALLERY.forEach(item=>{
    const enriched=enrichMediaItem(item);
    if(enriched)map.set(enriched.id||enriched.url,enriched);
  });
  (Array.isArray(gallery)?gallery:[]).forEach((item,index)=>{
    const enriched=enrichMediaItem(item);
    if(enriched)map.set(enriched.id||enriched.url||`gallery-${index}-${normalise(enriched.caption||enriched.association||'item')}`,enriched);
  });
  return [...map.values()];
}

const EVENT_ALIASES={
  'Converge':['Converge'],
  'Ebullience':['Ebullience'],
  'Dron-O-War':['Dron-O-War'],
  'Induction':['Induction','orientation'],
  'Ethnic Day':['Ethnic Day'],
  'Farewell':['Farewell'],
  'Hackathons':['Hackathons','hackathon']
};
const token=v=>normalise(v);
const EVENT_ASSOCIATIONS=new Map(Object.entries(EVENT_ALIASES).flatMap(([event,aliases])=>aliases.map(alias=>[normalise(alias),event])));
const sourceEventAlias=name=>{
  const key=normalise(name);
  return Object.keys(EVENT_ALIASES).find(event=>normalise(event)===key)||EVENT_ASSOCIATIONS.get(key)||Object.keys(EVENT_ALIASES).find(event=>EVENT_ALIASES[event].some(alias=>normalise(alias)===key))||'';
};
const mediaRole=item=>{
  const association=String(item?.association||'');
  if(EVENT_ASSOCIATIONS.has(normalise(association))||/converge|ebullience|dron.?o.?war|induction|ethnic.?day|farewell|hackathon|jai\s*2026/i.test(association))return 'event';
  if(/archive/i.test(association))return 'archive';
  if(/team/i.test(association))return 'leadership';
  return 'club';
};
const enrichMediaItem=item=>{
  if(!item?.url)return null;
  const association=String(item.association||'JYC Archive').trim()||'JYC Archive';
  const role=mediaRole({...item,association});
  const year=String(item.year||item.date||'').slice(0,4);
  return {
    ...item,
    association,
    year:year||item.year||'',
    role,
    sourceType:item.page?'presentation-export':/^https?:\/\//i.test(String(item.url))?'official-external-media':item.sourceType||'maintained-jyc-media',
    sourceLabel:item.sourceLabel||(/^https?:\/\//i.test(String(item.url))?`${association} · official external media`:'JYC maintained source archive'),
    alt:item.alt||item.caption||`${association} · JYC visual archive`,
    published:item.published!==false
  };
};
export function sourceEventMedia(eventOrName){
  const name=typeof eventOrName==='string'?eventOrName:eventOrName?.title||'';
  const alias=sourceEventAlias(name);
  const exact=SOURCE_GALLERY.filter(item=>normalise(item.association)===normalise(name));
  const related=alias?SOURCE_GALLERY.filter(item=>{
    const association=normalise(item.association);
    return association===normalise(alias)||EVENT_ALIASES[alias]?.some(a=>association===normalise(a));
  }):[];
  const items=[...exact,...related].map(enrichMediaItem).filter(Boolean);
  const seen=new Set();
  return {
    name:name||alias||'JYC',
    collection:alias||name||'JYC Archive',
    items:items.filter(item=>{if(seen.has(item.url))return false;seen.add(item.url);return true})
  };
}
export const JYC_SOURCE_MEDIA_STATS={maintainedCommunities:Object.keys(JYC_HUB_CONTENT).length,storyBackedCommunities:PDF_HUB_STORIES.length,galleryItems:SOURCE_GALLERY.length,qualityOverrideCommunities:Object.keys(QUALITY_OVERRIDES).length,eventCollections:Object.keys(EVENT_ALIASES).length};

export function buildJycMediaManifest(gallery=[]){
  const merged=mergeSourceGallery(gallery);
  const communities=[...new Set(merged.map(x=>String(x.association||'JYC Archive')).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const years=[...new Set(merged.map(x=>String(x.year||'').slice(0,4)).filter(Boolean))].sort((a,b)=>b.localeCompare(a));
  const roles=[...new Set(merged.map(x=>String(x.role||'club')).filter(Boolean))].sort();
  const sourceTypes=[...new Set(merged.map(x=>String(x.sourceType||'maintained-jyc-media')).filter(Boolean))].sort();
  const byRole=roles.map(role=>({role,count:merged.filter(x=>x.role===role).length}));
  return {
    total:merged.length,
    communities,
    years,
    roles,
    sourceTypes,
    byRole,
    collections:communities.map(association=>({
      association,
      count:merged.filter(x=>String(x.association||'')===association).length,
      items:merged.filter(x=>String(x.association||'')===association)
    }))
  };
}
