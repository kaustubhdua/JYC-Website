/* JYC SOURCE MEDIA INDEX · V34
   All imagery in this module is sourced from the maintained JYC hub presentation
   exports already committed to public/assets. It never invents a hub photograph.
*/
import {JYC_HUB_CONTENT} from './v21-hub-content.js';
import {PDF_HUB_GALLERY,PDF_HUB_STORIES,HUB_PHOTO_MAP} from './pdf-hub-content.js';
import {PDF_HUB_EXTRA_GALLERY} from './pdf-hub-extra.js';
import {JYC_SOURCE_ARCHIVE_CATALOG,JYC_SOURCE_ARCHIVE_STATS} from './source-archive-index.js';
import {rankDiverseJycPhotos} from './jyc-photo-intelligence.js';

const normalise=v=>String(v||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');
const HUB_ALIASES={
  innovationclub:'Innovation',
  innovation:'Innovation',
  jiityouthclub:'JYC',
  jiityouthclub128:'JYC'
};
export const canonicalHubName=name=>{
  const raw=typeof name==='object'&&name!==null?String(name.name||name.label||name.title||'').trim():String(name||'').trim();
  const alias=HUB_ALIASES[normalise(raw)];
  if(alias)return alias;
  return Object.keys(JYC_HUB_CONTENT).find(k=>normalise(k)===normalise(raw))||raw;
};
const SOURCE_GALLERY=[...PDF_HUB_GALLERY,...PDF_HUB_EXTRA_GALLERY];

// The five archives were visually audited before publication. The archive intentionally contains
// posters, slides, logos, QR codes, textures and other graphics alongside real photographs.
// These conservative exclusions keep the default photography stream editorial rather than
// treating every binary as a photograph. All excluded assets remain available in the full archive.
const ARCHIVE_PHOTO_EXCLUSIONS={
  'festivals/aakriti':new Set(['p1-image135','p1-image136','p1-image138','p1-image140','p1-image129','p1-image130','p1-image131','p1-image132','p1-image117','p1-image118','p1-image119','p1-image120','p1-image121','p1-image122','p1-image123','p1-image124','p1-image125','p1-image128','p1-image133','p1-image134','p1-image139','p1-image141','p1-image142','p1-image143','p1-image146','p1-image147','p1-image148','p1-image152','p1-image153','p1-image154','p1-image155','p1-image156','p1-image158','p1-image159','p1-image151','p1-image162','p1-image167','p1-image182','p1-image183','p1-image184','p1-image187','p1-image188','p1-image192','p1-image193','p1-image196','p1-image197','p1-image198','p1-image199','p1-image200','p1-image201','p1-image203','p1-image206','p1-image213','p1-image214','p1-image216','p1-image218','p1-image219','p1-image220']),
  'clubs/panache':new Set(['p1-image240','p1-image336','p1-image339','p2-image342','p1-image228','p1-image230','p1-image231','p1-image232','p1-image233','p1-image274','p1-image226','p1-image227','p1-image229','p1-image221','p1-image222','p1-image224','p1-image234','p1-image235','p1-image236','p1-image237','p1-image238','p1-image239','p1-image242','p1-image244','p1-image245','p1-image246','p1-image247','p1-image248','p1-image249','p1-image250','p1-image251','p1-image252','p1-image253','p1-image254','p1-image255','p1-image256','p1-image257','p1-image258','p1-image259','p1-image268','p1-image269','p1-image271','p1-image276','p1-image277','p1-image278','p1-image281','p1-image282','p1-image283','p1-image285','p1-image286','p1-image288','p1-image290','p1-image294','p1-image295','p1-image296','p1-image297','p1-image299','p1-image300','p1-image304','p1-image305','p1-image308','p1-image309','p1-image310','p1-image311','p1-image312','p1-image315','p1-image317','p1-image320','p1-image322','p1-image325','p1-image327','p1-image331','p1-image334','p2-image336','p2-image339','p2-image340','p2-image341']),
  'clubs/abhivyakti':new Set(['p4-image796','p4-image820','p4-image828','p4-image830','p4-image841','p4-image867','p4-image869','p4-image871','p4-image875','p4-image898','p4-image907','p4-image913','p4-image914','p4-image917','p4-image921','p4-image926','p4-image927','p4-image928','p4-image930','p4-image931','p4-image932','p3-image685','p3-image686','p3-image687','p3-image688','p3-image689','p3-image690','p3-image691','p3-image692','p3-image693','p3-image694','p3-image695','p3-image696','p3-image697','p3-image698','p3-image699','p3-image700']),
  'gallery/campus-events':new Set(['p2-image494','p2-image495','p2-image499','p2-image500','p2-image502','p2-image520','p2-image530','p2-image543','p2-image550','p2-image591','p2-image608','p2-image515','p2-image516','p2-image517','p2-image518','p2-image521','p2-image522','p2-image523','p2-image524','p2-image525','p2-image526','p2-image527','p2-image528','p2-image529','p2-image531','p2-image532','p2-image533','p2-image534','p2-image535','p2-image536','p2-image541','p2-image542','p2-image544','p2-image545','p2-image546','p2-image547','p2-image549','p2-image553','p2-image556','p2-image563','p2-image564','p2-image565','p2-image566','p2-image567','p2-image568','p2-image574','p2-image575','p2-image584','p2-image592','p2-image593','p2-image594','p2-image598','p2-image601','p2-image602','p2-image603','p2-image605','p2-image606']),
  'clubs/cypherx':new Set(['p4-image746','p4-image748','p4-image749','p4-image750','p4-image751','p4-image752','p4-image753','p4-image754','p4-image755','p4-image756','p4-image757','p4-image758','p4-image759','p4-image760','p4-image762','p4-image763','p4-image764','p4-image765','p4-image768','p4-image770','p4-image771','p4-image772','p4-image773','p4-image774','p4-image775','p4-image776','p4-image777','p4-image778','p4-image779','p4-image780','p4-image781','p4-image782','p4-image783','p4-image784','p4-image785','p4-image786','p4-image787','p4-image788','p4-image790','p4-image791','p4-image792','p4-image793','p4-image794']),
  'clubs/cicr':new Set(['p3-image611','p3-image612','p3-image613','p3-image614','p3-image615','p3-image616','p3-image617','p3-image618','p3-image619','p3-image620','p3-image621','p3-image622','p3-image623','p3-image624','p3-image625','p3-image626','p3-image627','p3-image628','p3-image629','p3-image630','p3-image631','p3-image632','p5-logo']),
  'clubs/cine-film':new Set(['p2-image440','p2-image441','p2-image442','p2-image443','p2-image444','p2-image445','p2-image446','p2-image447']),
  'clubs/jodc':new Set(['p3-image634','p3-image635','p3-image636','p3-image637','p3-image638','p3-image639','p3-image640','p3-image642','p3-image643','p3-image645','p3-image650','p3-image651','p3-image652','p3-image656','p3-image661','p3-image662']),
  'clubs/innovation':new Set(['p3-image701','p3-image702','p4-image703','p4-image704','p4-image705','p4-image706','p4-image707','p4-image708','p4-image709','p4-image710','p4-image711','p4-image712','p4-image713','p4-image714','p5-showcase-1','p5-showcase-2','p5-showcase-3','p5-showcase-4']),
  'sports':new Set(['p2-image381','p2-image382','p2-image383','p2-image388','p2-image389','p2-image390','p2-image428','p2-image429','p2-image430']),
  'clubs/aura':new Set(['p5-showcase-1','p5-showcase-4']),
  'clubs/bds':new Set(['p5-showcase-3','p5-showcase-4']),
  'clubs/eloquence':new Set(['p5-showcase-1','p5-showcase-2','p5-showcase-3','p5-showcase-4']),
  'clubs/jsa':new Set(['p5-showcase-1','p5-showcase-2','p5-showcase-3','p5-showcase-4']),
  'clubs/prismatic':new Set(['p5-showcase-1','p5-showcase-2','p5-showcase-3','p5-showcase-4']),
  'clubs/vamunique':new Set(['p5-showcase-2','p5-showcase-3','p5-showcase-4'])
};
const ARCHIVE_SHOWCASE_PHOTOS=new Set(['clubs/aura/p5-showcase-2','clubs/aura/p5-showcase-3','clubs/bds/p5-showcase-1','clubs/bds/p5-showcase-2','clubs/vamunique/p5-showcase-1']);
const archivePhotoKind=item=>{
  const cat=String(item.category||'');
  const stem=String(item.sourcePath||item.url||'').split('/').pop().replace(/\.[^.]+$/,'');
  if(/^archive\/presentation-assets|^design-assets/.test(cat))return 'visual';
  if(/^p5-showcase-/i.test(stem))return ARCHIVE_SHOWCASE_PHOTOS.has(cat+'/'+stem)?'photo':'visual';
  if(/(?:logo|banner)/i.test(stem))return 'identity';
  if(/qr/i.test(stem))return 'utility';
  if(ARCHIVE_PHOTO_EXCLUSIONS[cat]?.has(stem))return 'visual';
  return cat.startsWith('clubs/')||cat==='festivals/aakriti'||cat==='gallery/campus-events'||cat==='sports'?'photo':(item.mediaKind||'visual');
};
const ARCHIVE_GALLERY=JYC_SOURCE_ARCHIVE_CATALOG.map(item=>({...item,mediaKind:archivePhotoKind(item),sourceType:'source-archive',sourceLabel:'JYC supplied image archive',role:item.association?'club':'archive',caption:item.association?item.association+' · supplied archive image':item.category.replaceAll('/',' · '),alt:item.association?item.association+' · JYC supplied archive image':'JIIT Youth Club 128 supplied archive image'}));
const ARCHIVE_BY_URL=new Map(JYC_SOURCE_ARCHIVE_CATALOG.map(item=>[String(item.url),item]));
const isAcceptedArchiveUrl=url=>{const item=ARCHIVE_BY_URL.get(String(url||''));return !item||archivePhotoKind(item)==='photo';};

const QUALITY_OVERRIDES={
  Aakriti:['/assets/hub-photos-extra/aakriti-04.webp','/assets/source-archive/festivals/aakriti/p1-image126.webp','/assets/source-archive/festivals/aakriti/p1-image127.webp','/assets/source-archive/festivals/aakriti/p1-image137.webp','/assets/source-archive/festivals/aakriti/p1-image149.webp','/assets/source-archive/festivals/aakriti/p1-image150.webp'],
  Aura:['/assets/hub-photos-extra/aura-08.webp','/assets/hub-photos-extra/aura-09.webp','/assets/hub-photos-extra/aura-10.webp','/assets/hub-photos-extra/aura-11.webp','/assets/hub-photos-extra/aura-12.webp','/assets/hub-photos-extra/aura-13.webp'],
  BDS:[],
  Innovation:['/assets/source-archive/clubs/innovation/p5-DSC02902.webp','/assets/source-archive/clubs/innovation/p5-DSC02924.webp','/assets/source-archive/clubs/innovation/p5-DSC03006.webp','/assets/source-archive/clubs/innovation/p5-DSC03268.webp','/assets/source-archive/clubs/innovation/p5-DSC03304.webp','/assets/source-archive/clubs/innovation/p5-DSC03380.webp'],
  CICR:['/assets/source-archive/clubs/cicr/p3-image609.webp','/assets/source-archive/clubs/cicr/p3-image610.webp'],
  CypherX:[],
  Dronotics:[],
  Eloquence:[],
  Panache:['/assets/source-archive/clubs/panache/p1-image272.webp','/assets/source-archive/clubs/panache/p1-image273.webp'],
  Prismatic:[],
  RPH:[],
  VamUnique:['/assets/hub-photos-extra/vamunique-61.webp','/assets/hub-photos-extra/vamunique-63.webp'],
  Zencoders:[],
  Arcadia:[],
  NeuralNexus:[],
  Sports:['/assets/hub-photos/sports-02.webp','/assets/hub-photos/sports-03.webp','/assets/hub-photos/sports-04.webp']
};

const QUALITY_BY_KEY=new Map(Object.entries(QUALITY_OVERRIDES).map(([name,photos])=>[normalise(name),photos]));
const storyByKey=new Map(PDF_HUB_STORIES.map(s=>[normalise(s.name),s]));

export function sourceHubMedia(name){
  const labelFromAlias=canonicalHubName(name);
  const key=normalise(labelFromAlias);
  const canonical=Object.keys(JYC_HUB_CONTENT).find(k=>normalise(k)===key);
  const label=canonical||name;
  const quality=(QUALITY_BY_KEY.get(normalise(label))||[]).filter(isAcceptedArchiveUrl);
  const mapped=(HUB_PHOTO_MAP[label]||[]).filter(isAcceptedArchiveUrl);
  const archiveGallery=ARCHIVE_GALLERY.filter(g=>g.association&&normalise(canonicalHubName(g.association))===key).map(enrichMediaItem).filter(Boolean);
  const gallery=SOURCE_GALLERY.filter(g=>normalise(canonicalHubName(g.association))===key).map(enrichMediaItem).filter(Boolean);
  const story=storyByKey.get(key)||storyByKey.get(normalise(name));
  const storyImage=story?.image?[story.image]:[];
  const media=[
    ...quality.map((url,i)=>({url,association:label,mediaKind:'photo',caption:`${label} · ${JYC_HUB_CONTENT[label]?.focus||'community story'} · archive photograph ${String(i+1).padStart(2,'0')}`,alt:`${label} ${JYC_HUB_CONTENT[label]?.focus||'community'} JYC photograph ${i+1}`,sourceLabel:'JYC supplied hub archive'})),
    ...mapped.map((url,i)=>({url,association:label,mediaKind:'photo',caption:`${label} · supplied archive photograph ${String(i+1).padStart(2,'0')}`,alt:`${label} supplied JYC photograph ${i+1}`,sourceLabel:'JYC supplied hub archive'})),
    ...gallery.map(item=>({...item,association:label})),
    ...archiveGallery.map(item=>({...item,association:label})),
    ...storyImage.map(url=>({url,association:label,mediaKind:'artwork',sourceLabel:'JYC supplied hub story'}))
  ].filter(x=>x.url);
  const uniqueMedia=[...new Map(media.filter(x=>x?.url).map(x=>[String(x.url),x])).values()];
  const photoItems=uniqueMedia.filter(x=>x.mediaKind==='photo');
  const photos=photoItems.map(x=>x.url);
  const visuals=uniqueMedia.map(x=>x.url);
  return {name:label,family:JYC_HUB_CONTENT[label]?.family||story?.family||'',photoItems,visuals,focus:JYC_HUB_CONTENT[label]?.focus||story?.focus||'',summary:JYC_HUB_CONTENT[label]?.summary||'',detail:JYC_HUB_CONTENT[label]?.detail||story?.text||'',story:story||null,photos};
}

export const JYC_SOURCE_ARCHIVE_GALLERY=ARCHIVE_GALLERY;
export const JYC_SOURCE_ARCHIVE_CATALOG_STATS=JYC_SOURCE_ARCHIVE_STATS;

const albumSlugify=value=>String(value||'').trim().toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'jyc-archive';
export const JYC_SOURCE_ARCHIVE_ALBUMS=Object.values([...new Set(ARCHIVE_GALLERY.filter(item=>item.mediaKind==='photo'&&item.association).map(item=>item.association))].reduce((acc,association)=>{const slug=albumSlugify(association);if(!acc[slug]){const cover=ARCHIVE_GALLERY.find(item=>item.mediaKind==='photo'&&item.association===association);acc[slug]={id:'source-'+slug,name:association,slug,description:`Verified photography collection from the JYC supplied archive for ${association}.`,scope_type:'source-archive',cover_url:cover?.url||'',is_published:true,source:'source-archive'};}return acc},{}));

// Brand assets are deliberately kept outside the photography pool, but they are still valuable
// source material: club logos/banners can fill identity slots when a maintained club record
// has no verified logo/banner of its own.
export const JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS=ARCHIVE_GALLERY
  .filter(item=>item.mediaKind==='identity')
  .map(item=>({
    id:item.id,url:item.url,association:item.association||'JYC Archive',category:item.category,
    sourcePath:item.sourcePath||'',mediaKind:'identity',sourceType:'source-archive',
    sourceLabel:'Five-volume JYC source archive',alt:item.association?item.association+' identity asset':'JYC source identity asset',
    caption:item.association?item.association+' identity asset · supplied archive':'JYC supplied identity asset'
  }));
const IDENTITY_BY_ASSOCIATION=new Map();
JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS.forEach(item=>{const key=normalise(item.association);const rows=IDENTITY_BY_ASSOCIATION.get(key)||[];rows.push(item);IDENTITY_BY_ASSOCIATION.set(key,rows)});

const AUTHENTIC_HUB_LOGOS = {
  cicr: '/assets/logos/cicr.png',
  jodc: '/assets/logos/jodc.svg',
  aura: '/assets/logos/aura.png',
  auraphotography: '/assets/logos/aura.png',
  aurathefashionhub: '/assets/logos/aura.png',
  dronotics: '/assets/logos/dronotics.png',
  dronoticshub: '/assets/logos/dronotics.png',
  rph: '/assets/logos/rph.png',
  rapidprogramming: '/assets/logos/rph.png',
  rapidprogramminghub: '/assets/logos/rph.png',
  cypherx: '/assets/logos/cypherx.png',
  cypherxhub: '/assets/logos/cypherx.png',
  vamunique: '/assets/logos/vamunique.png',
  neuralnexus: '/assets/logos/neuralnexus.png',
  panache: '/assets/logos/panache.png',
  panachefashionsociety: '/assets/logos/panache.png',
  aakriti: '/assets/logos/aakriti.png',
  aakritifineartssociety: '/assets/logos/aakriti.png',
  zencoders: '/assets/logos/zencoders.png',
  zencodershub: '/assets/logos/zencoders.png',
  jsa: '/assets/logos/jsa.png',
  jaypeestudentassociation: '/assets/logos/jsa.png',
  eloquence: '/assets/logos/eloquence.png',
  eloquencesociety: '/assets/logos/eloquence.png',
  prismatic: '/assets/logos/prismatic.png',
  prismatichub: '/assets/logos/prismatic.png',
  bds: '/assets/logos/bds.png',
  bhangradancesociety: '/assets/logos/bds.png',
  fortissimo: '/assets/logos/fortissimo.png',
  fortissimomusicsociety: '/assets/logos/fortissimo.png',
  abhivyakti: '/assets/logos/abhivyakti.png',
  abhivyaktidramatics: '/assets/logos/abhivyakti.png',
  arcadia: '/assets/logos/arcadia.png',
  arcadiaesports: '/assets/logos/arcadia.png',
  arcadiagaminghub: '/assets/logos/arcadia.png',
};
const AUTHENTIC_HUB_BANNERS = {
  cicr: '/assets/hub-stories/cicr.webp',
  cicrhub: '/assets/hub-stories/cicr.webp',
  jodc: '/assets/hub-stories/jodc.webp',
  jodchub: '/assets/hub-stories/jodc.webp',
  dronotics: '/assets/banners/dronotics-banner.jpg',
  dronoticshub: '/assets/banners/dronotics-banner.jpg',
  innovation: '/assets/events/innovation/ridehack.jpeg',
  cypherx: '/assets/banners/cypherx-banner.jpg',
  cypherxhub: '/assets/banners/cypherx-banner.jpg',
  vamunique: '/assets/banners/vamunique-banner.jpg',
  arcadia: '/assets/banners/arcadia-banner.jpg',
  arcadiagaminghub: '/assets/banners/arcadia-banner.jpg',
  neuralnexus: '/assets/banners/neuralnexus-banner.jpg',
  aakriti: '/assets/banners/aakriti-banner.jpg',
  aakritifineartssociety: '/assets/banners/aakriti-banner.jpg',
  panache: '/assets/banners/panache-banner.jpg',
  panachefashionsociety: '/assets/banners/panache-banner.jpg',
  zencoders: '/assets/banners/zencoders-banner.jpg',
  zencodershub: '/assets/banners/zencoders-banner.jpg',
  bds: '/assets/banners/bds-banner.jpg',
  bhangradancesociety: '/assets/banners/bds-banner.jpg',
  aura: '/assets/banners/aura-banner.jpg',
  auraphotography: '/assets/banners/aura-banner.jpg',
  jsa: '/assets/banners/jsa-banner.jpg',
  jaypeestudentassociation: '/assets/banners/jsa-banner.jpg',
  eloquence: '/assets/banners/eloquence-banner.jpg',
  eloquencesociety: '/assets/banners/eloquence-banner.jpg',
  fortissimo: '/assets/banners/fortissimo-banner.jpg',
  abhivyakti: '/assets/banners/abhivyakti-banner.jpg',
  prismatic: '/assets/banners/prismatic-banner.jpg',
  rph: '/assets/banners/rph-banner.jpg',
  rapidprogramminghub: '/assets/banners/rph-banner.jpg',
};

export function enrichSourceClub(club){
  const media=sourceHubMedia(club?.name);
  const normKey=normalise(media.name);
  const rawKey=normalise(club?.name);
  const identityAssets=IDENTITY_BY_ASSOCIATION.get(normKey)||IDENTITY_BY_ASSOCIATION.get(rawKey)||[];
  const identityLogo=identityAssets.find(item=>/logo/i.test(item.sourcePath||item.url))||identityAssets[0];
  const identityBanner=identityAssets.find(item=>/banner/i.test(item.sourcePath||item.url))||null;
  const photos=[...new Set([...(Array.isArray(club?.hubPhotos)?club.hubPhotos:[]),...media.photos])];
  const profile=JYC_HUB_CONTENT[media.name]||JYC_HUB_CONTENT[club?.name];
  const isGenericLogo=!club?.logo||/jyc[-_ ]?logo/i.test(club.logo);
  const isGenericBanner=!club?.banner||/jyc[-_ ]?logo/i.test(club.banner);
  const resolvedLogo=AUTHENTIC_HUB_LOGOS[normKey]||AUTHENTIC_HUB_LOGOS[rawKey]||(!isGenericLogo&&club?.logo)||identityLogo?.url||club?.logo||'';
  const resolvedBanner=AUTHENTIC_HUB_BANNERS[normKey]||AUTHENTIC_HUB_BANNERS[rawKey]||(!isGenericBanner&&club?.banner)||photos[0]||identityBanner?.url||identityLogo?.url||'';
  return {...club,description:club?.description||profile?.summary||media.summary,about:club?.about||profile?.detail||media.detail,hubPhotos:photos,logo:resolvedLogo,banner:resolvedBanner,identityAsset:identityLogo||null,identityAssets,sourceMediaCount:photos.length,sourceMediaLabel:photos.length?'JYC source archive · '+photos.length+' visual'+(photos.length===1?'':'s'):(resolvedLogo?'JYC source archive · verified identity asset':'Identity-led profile · source photography not yet extracted')};
}

export function enrichSourceClubs(clubs){return (Array.isArray(clubs)?clubs:[]).map(enrichSourceClub);}

export function mergeSourceGallery(gallery){
  const map=new Map();
  const put=(item)=>{const enriched=enrichMediaItem(item);if(enriched?.url)map.set(String(enriched.url),enriched)};
  SOURCE_GALLERY.forEach(put);
  ARCHIVE_GALLERY.forEach(put);
  (Array.isArray(gallery)?gallery:[]).forEach(put);
  return [...map.values()];
}

const ARCHIVE_CATEGORY_ASSOCIATIONS={
  'clubs/abhivyakti':'Abhivyakti','clubs/arcadia':'Arcadia','clubs/aura':'Aura','clubs/bds':'BDS','clubs/cicr':'CICR',
  'clubs/cine-film':'Cinekala','clubs/cypherx':'CypherX','clubs/dronotics':'Dronotics','clubs/eloquence':'Eloquence',
  'clubs/innovation':'Innovation','clubs/jodc':'JODC','clubs/jsa':'JSA','clubs/neural-nexus':'Neural Nexus',
  'clubs/panache':'Panache','clubs/prismatic':'Prismatic','clubs/rph':'RPH','clubs/vamunique':'VamUnique','clubs/zencoders':'Zencoders',
  'festivals/aakriti':'Aakriti','sports':'JSA','gallery/campus-events':'JYC Archive','archive/presentation-assets':'JYC Archive','design-assets':'JYC Archive'
};
export const JYC_SOURCE_ARCHIVE_PHOTO_ITEMS=ARCHIVE_GALLERY
  .filter(item=>item.mediaKind==='photo')
  .map((item,index)=>{
    const association=ARCHIVE_CATEGORY_ASSOCIATIONS[item.category]||item.association||'JYC Archive';
    return {
      id:item.id,url:item.url,association,year:item.year||'',caption:item.caption||`${association} · source archive photograph`,
      alt:item.alt||`${association} source archive photograph ${index+1}`,
      mediaKind:'photo',role:association==='JYC Archive'?'archive':'club',
      sourceType:'source-archive',sourceLabel:'Five-volume JYC source archive',sourcePath:item.sourcePath||'',published:true
    };
  });
const EVENT_ALIASES={
  'Converge':['Converge','Converge 2026'],
  'Ebullience':['Ebullience',"Ebullience '25",'Ebullience’25'],
  'Dron-O-War':['Dron-O-War','DRONO-O-WAR 1.0','Drono War'],
  'Induction':['Induction','orientation'],
  'Ethnic Day':['Ethnic Day'],
  'Farewell':['Farewell'],
  'Hackathons':['Hackathons','hackathon'],
  "JAI 2026":["JAI 2026","JAI 2026 · Jaypee Agentic AI Hackathon","Jaypee Agentic AI International Summit"],
  "RIDE Hack'26":["RIDE Hack'26","RIDE Hack 26","RIDE Hack"],
  'CodeAI Hackathon':['CodeAI Hackathon','CodeAI'],
  'Code Clash 25.1':['Code Clash 25.1','Code Clash 25.1 · RPH'],
  'Code Clash 25.2':['Code Clash 25.2','Code Clash 25.2 · RPH'],
  'TechTonic 2.0':['TechTonic 2.0','TechTonic']
};
const EVENT_ASSOCIATIONS=new Map(Object.entries(EVENT_ALIASES).flatMap(([event,aliases])=>aliases.map(alias=>[normalise(alias),event])));
const sourceEventAlias=name=>{
  const key=normalise(name);
  return Object.keys(EVENT_ALIASES).find(event=>normalise(event)===key)||EVENT_ASSOCIATIONS.get(key)||Object.keys(EVENT_ALIASES).find(event=>EVENT_ALIASES[event].some(alias=>normalise(alias)===key))||'';
};
const mediaKind=item=>{
  const text=String(item?.caption||'').toLowerCase();
  if(/logo|banner|poster|illustration|graphic|design society|visual identity|artwork|fine.?art|creative work|story material/.test(text))return 'artwork';
  if(/photograph|photo|campus event moment|student collaboration|community moment|group|team|performance|stage|sports|event coverage|workshop and student learning/.test(text))return 'photo';
  return 'visual';
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
    albumSlug:item.albumSlug||albumSlugify(association),
    albumName:item.albumName||association,
    association,
    year:year||item.year||'',
    role,
    sourceType:item.page?'presentation-export':/^https?:\/\//i.test(String(item.url))?'official-external-media':item.sourceType||'maintained-jyc-media',
    sourceLabel:item.sourceLabel||(/^https?:\/\//i.test(String(item.url))?`${association} · official external media`:'JYC maintained source archive'),
    alt:item.alt||item.caption||`${association} · JYC visual archive`,
    mediaKind:item.mediaKind||mediaKind(item),
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
  const uniqueItems=items.filter(item=>{if(seen.has(item.url))return false;seen.add(item.url);return true});
  return {
    name:name||alias||'JYC',
    collection:alias||name||'JYC Archive',
    items:uniqueItems,
    photoItems:uniqueItems.filter(item=>item.mediaKind==='photo')
  };
}
export const JYC_SOURCE_MEDIA_STATS={maintainedCommunities:Object.keys(JYC_HUB_CONTENT).length,storyBackedCommunities:PDF_HUB_STORIES.length,galleryItems:SOURCE_GALLERY.length,sourcePhotography:SOURCE_GALLERY.filter(item=>mediaKind(item)==='photo').length,qualityOverrideCommunities:Object.keys(QUALITY_OVERRIDES).length,eventCollections:Object.keys(EVENT_ALIASES).length};

export function rankJycPhotoItems(items=[],{limit=24,seed=0}={}){return rankDiverseJycPhotos(items,{limit,seed,maxPerAssociation:3})}

export function buildJycMediaManifest(gallery=[]){
  const merged=[...mergeSourceGallery(gallery)].reduce((acc,item)=>{const key=String(item?.url||item?.id||'');if(key&&!acc.some(x=>String(x?.url||x?.id||'')===key))acc.push(item);return acc},[]);
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
