import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {JYC_SOURCE_MEDIA_STATS,mergeSourceGallery,sourceEventMedia,sourceHubMedia,buildJycMediaManifest,JYC_SOURCE_ARCHIVE_PHOTO_ITEMS,JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS} from '../src/jyc-source-media.js';
import {isDerivativeDimensionEligible,orientedImageDimensions,parseImageDimensions} from '../src/jyc-photo-intelligence.js';
import {isValidJycImageManifest} from '../src/jyc-image-manifest.js';
import {JYC_HUB_CONTENT} from '../src/v21-hub-content.js';

const assert=(name,ok,detail='')=>{console.log((ok?'PASS: ':'FAIL: ')+name+(detail?' — '+detail:''));if(!ok)process.exitCode=1};
const validManifestFixture={version:1,images:{'/assets/hub-photos/example.webp':{width:960,height:640,aspectRatio:1.5,orientation:'landscape',derivativesEligible:true}}};
assert('image manifest schema accepts a valid intrinsic-dimension record',isValidJycImageManifest(validManifestFixture));
assert('image manifest schema rejects missing version, empty lists and non-object images',!isValidJycImageManifest({images:validManifestFixture.images})&&!isValidJycImageManifest({version:1,images:{}})&&!isValidJycImageManifest({version:1,images:[]}));
assert('image manifest schema rejects non-positive dimensions and malformed aspect ratios',!isValidJycImageManifest({version:1,images:{'/assets/bad.webp':{width:0,height:640,aspectRatio:0,orientation:'landscape',derivativesEligible:true}}})&&!isValidJycImageManifest({version:1,images:{'/assets/bad.webp':{width:960,height:640,aspectRatio:9,orientation:'landscape',derivativesEligible:true}}}));
assert('image manifest schema rejects numeric dimensions encoded as strings',!isValidJycImageManifest({version:1,images:{'/assets/bad.webp':{width:'960',height:640,aspectRatio:1.5,orientation:'landscape',derivativesEligible:true}}}));
assert('image manifest schema rejects unsafe URLs and false orientation labels',!isValidJycImageManifest({version:1,images:{'/assets/../secret.webp':validManifestFixture.images['/assets/hub-photos/example.webp']}})&&!isValidJycImageManifest({version:1,images:{'/assets/bad.webp':{...validManifestFixture.images['/assets/hub-photos/example.webp'],orientation:'portrait'}}}));
assert('image manifest schema rejects encoded traversal, encoded separators, backslashes and controls',[
 '/assets/%2e%2e/secret.webp','/assets/%2E%2E/secret.webp','/assets/%252e%252e/secret.webp','/assets/photo%2fsecret.webp','/assets/photo%5csecret.webp','/assets/photo\\secret.webp','/assets/photo.webp?width=100','/assets/photo.webp#preview','/assets/photo'+String.fromCharCode(10)+'.webp'
].every(url=>!isValidJycImageManifest({version:1,images:{[url]:validManifestFixture.images['/assets/hub-photos/example.webp']}})));
const mediaSource=fs.readFileSync('src/jyc-source-media.js','utf8');
const hubPresentationSource=fs.readFileSync('src/pdf-hub-content.js','utf8');
const mainSource=fs.readFileSync('src/main.jsx','utf8');
const browserSource=fs.readFileSync('scripts/browser-smoke.spec.js','utf8');
const editorialHomeSource=fs.readFileSync('src/jyc-editorial-home.jsx','utf8');
const homeCssSource=fs.readFileSync('src/jyc-editorial-home.css','utf8');
const finalThemeCss=fs.readFileSync('src/jyc-logo-final-theme.css','utf8');
const designUpgradeSource=fs.readFileSync('src/jyc-design-upgrades.css','utf8');
const gallerySource=fs.readFileSync('src/jyc57-experience.jsx','utf8');
const responsiveSource=fs.readFileSync('src/jyc-responsive-photo.jsx','utf8');
const jycNowSource=fs.readFileSync('src/jyc-now.jsx','utf8');
const driftWallSource=fs.readFileSync('src/components/react-bits/DriftWall.jsx','utf8');
const livingPhotoSource=fs.readFileSync('src/jyc-living-photo.jsx','utf8');
const depthCarouselSource=fs.readFileSync('src/components/react-bits/DepthCarousel.jsx','utf8');
const magicBentoSource=fs.readFileSync('src/components/react-bits/MagicBento.jsx','utf8');
const manifestLoaderSource=fs.readFileSync('src/jyc-image-manifest.js','utf8');
const serviceWorkerSource=fs.readFileSync('public/sw.js','utf8');
const imageManifestSource=fs.readFileSync('scripts/generate-image-manifest.mjs','utf8');
const auditedCategories=['clubs/abhivyakti','clubs/panache','clubs/cypherx','festivals/aakriti','gallery/campus-events'];
const auditedExclusionIds=auditedCategories.flatMap(cat=>{
  const start=mediaSource.indexOf(`'${cat}':new Set([`);
  const end=mediaSource.indexOf('])',start);
  return start>=0&&end>start?[...mediaSource.slice(start,end).matchAll(/'([^']+)'/g)].map(x=>x[1]):[];
});


assert('non-photographic club override cleanup',mediaSource.includes("CypherX:[]")&&mediaSource.includes("Zencoders:[]")&&mediaSource.includes("NeuralNexus:[]")&&mediaSource.includes("Arcadia:[]")&&mediaSource.includes("Dronotics:[]")&&mediaSource.includes("Eloquence:[]"));
const aakritiPhotoUrls=sourceHubMedia('Aakriti').photoItems.map(item=>item.url);
const neuralNexusPhotoUrls=sourceHubMedia('Neural Nexus').photoItems.map(item=>item.url);
assert('ultra-wide hub wordmarks stay out of club photo cards',!aakritiPhotoUrls.includes('/assets/hub-photos/aakriti-01.webp')&&!neuralNexusPhotoUrls.includes('/assets/hub-photos/neural-01.webp')&&hubPresentationSource.includes('1311×25 wordmark/banner')&&hubPresentationSource.includes('neural-01 (1500×211) is also an ultra-wide graphic')&&hubPresentationSource.includes("Aakriti:['/assets/hub-photos/aakriti-02.webp','/assets/hub-photos/aakriti-03.webp']")&&!hubPresentationSource.includes("'Neural Nexus':['/assets/hub-photos/neural-01.webp']"));
const hubPhotoUrls=[...new Set(Object.keys(JYC_HUB_CONTENT).flatMap(name=>sourceHubMedia(name).photoItems.map(item=>item.url)))];
const hubPhotoAspectOutliers=[];
for(const url of hubPhotoUrls){
 const file=path.join('public',String(url||'').slice(1));
 try{const metadata=await sharp(file).metadata();const dimensions=orientedImageDimensions(metadata.width,metadata.height,metadata.orientation);if(dimensions&&(dimensions.width/dimensions.height>5||dimensions.width/dimensions.height<.25))hubPhotoAspectOutliers.push({url,width:dimensions.width,height:dimensions.height})}catch{hubPhotoAspectOutliers.push({url,error:'missing or unreadable image'})}
}
assert('all hub photo-only pools exclude banner-like aspect ratios and unreadable sources',hubPhotoAspectOutliers.length===0,hubPhotoAspectOutliers.slice(0,10).map(item=>JSON.stringify(item)).join('; ')||hubPhotoUrls.length+' unique photos checked');
assert('visual archive exclusions include Aakriti and Panache',mediaSource.includes("'festivals/aakriti':new Set")&&mediaSource.includes("'clubs/panache':new Set"));
assert('event gallery placements include Dron-O-War and Converge',mediaSource.includes("'Dron-O-War'")&&mediaSource.includes("'Converge'"));
const gallery=mergeSourceGallery([]);
const galleryUiSource=fs.readFileSync('src/extra-features.jsx','utf8');
const manifest=buildJycMediaManifest([]);
const urls=gallery.map(x=>x.url).filter(Boolean);
const duplicateUrls=urls.filter((url,i)=>urls.indexOf(url)!==i);
const missing=gallery.filter(x=>!x.url||!x.association||!x.alt||!x.role||!x.sourceLabel);
const presentationWithoutPage=gallery.filter(x=>x.sourceType==='presentation-export'&&!x.page);
const event=sourceEventMedia('Ebullience');
const induction=sourceEventMedia('Induction');
const normalizedEvents=['Converge 2026','JAI 2026 · Jaypee Agentic AI Hackathon',"RIDE Hack'26",'DRONO-O-WAR 1.0','CodeAI Hackathon','Code Clash 25.1','Code Clash 25.2','TechTonic 2.0'];
const normalizedEventMappings=normalizedEvents.map(name=>[name,sourceEventMedia(name).collection]);
const eventUrls=new Set(event.items.map(x=>x.url));
const inductionUrls=new Set(induction.items.map(x=>x.url));
const archivePhotoUrls=new Set(JYC_SOURCE_ARCHIVE_PHOTO_ITEMS.map(x=>x.url));
const eventPhotoItems=event.photoItems||[];
const auditedArchiveIds=new Set(auditedExclusionIds);
const qualityOverrideUrls=[...(mediaSource.match(/'([^']+\\.webp)'/g)||[])].map(x=>x.slice(1,-1));
const qualityOverrideViolations=qualityOverrideUrls.filter(url=>[...auditedArchiveIds].some(id=>url.endsWith('/'+id+'.webp')));

assert('curated archive photography pool is exposed',JYC_SOURCE_ARCHIVE_PHOTO_ITEMS.length>350,`found ${JYC_SOURCE_ARCHIVE_PHOTO_ITEMS.length}`);
assert('audited identity assets are preserved outside photography',JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS.some(x=>x.association==='CICR'&&/logo/i.test(x.sourcePath))&&JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS.some(x=>x.association==='JODC'&&/logo/i.test(x.sourcePath)),JSON.stringify(JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS.map(x=>x.sourcePath)));
assert('identity assets remain excluded from photo pool',JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS.every(x=>!JYC_SOURCE_ARCHIVE_PHOTO_ITEMS.some(p=>p.url===x.url)));
assert('audited archive exclusions are declared before validation',auditedExclusionIds.length===277,`found ${auditedExclusionIds.length}`);
assert('audited archive exclusions never re-enter through source overrides',auditedExclusionIds.every(id=>![...archivePhotoUrls].some(url=>url.includes('/'+id+'.webp'))),auditedExclusionIds.filter(id=>[...archivePhotoUrls].some(url=>url.includes('/'+id+'.webp'))).join(', '));
assert('source overrides cannot reference audited archive exclusions',qualityOverrideViolations.length===0,qualityOverrideViolations.join(', '));
assert('curated featured overrides remain explicit',mediaSource.includes('const QUALITY_OVERRIDES=')&&mediaSource.includes("Aakriti:[")&&mediaSource.includes("Panache:[")&&mediaSource.includes("CICR:[")&&mediaSource.includes("Innovation:["));
assert('source gallery has maintained communities',JYC_SOURCE_MEDIA_STATS.maintainedCommunities>0);
assert('source gallery is non-empty',gallery.length>0);
assert('responsive runtime emits derivative URLs only after manifest-confirmed intrinsic dimensions',responsiveSource.includes('entry?.derivativesEligible===true')&&responsiveSource.includes('measured>0')&&responsiveSource.includes('derivativesEnabled&&intrinsicWidth>0?photoDerivativeUrls(source,intrinsicWidth):null')&&responsiveSource.includes('If the manifest is unavailable, keep the original source'));
assert('responsive photo and gallery share one deployment-fresh manifest loader',manifestLoaderSource.includes("fetch('/image-manifest.json',{cache:'no-cache'})")&&responsiveSource.includes('loadJycImageManifest()')&&gallerySource.includes("import {ResponsivePhoto} from './jyc-responsive-photo.jsx'")&&!responsiveSource.includes("fetch('/image-manifest.json'")&&!gallerySource.includes("fetch('/image-manifest.json'")&&!responsiveSource.includes("cache:'force-cache'")&&!gallerySource.includes("cache:'force-cache'"));
assert('responsive photo manifest promise resets after transient HTTP or network failures',manifestLoaderSource.includes("if(!response.ok)throw new Error('Image manifest unavailable')")&&manifestLoaderSource.includes('.catch(()=>{')&&manifestLoaderSource.includes('imageManifestPromise=null;')&&manifestLoaderSource.includes('return null;')&&browserSource.includes('responsive photo manifest retries after a transient request failure')&&browserSource.includes("await expect.poll(() => page.locator('.jyc-gallery-hub-container picture source').count()).toBeGreaterThan(0)"));
assert('service worker revalidates the image manifest before serving cached metadata',serviceWorkerSource.includes("requestUrl.pathname === '/image-manifest.json'")&&serviceWorkerSource.includes("fetch(new Request(request, { cache: 'no-cache' }))")&&serviceWorkerSource.includes('caches.match(request)'));
assert('service worker refuses HTML or wrong-MIME responses under image cache keys',serviceWorkerSource.includes('IMAGE_MIME_BY_EXTENSION')&&serviceWorkerSource.includes('isExpectedImageResponse(requestUrl.pathname, response)')&&serviceWorkerSource.includes("'.avif': 'image/avif'")&&serviceWorkerSource.includes("'.webp': 'image/webp'")&&serviceWorkerSource.includes('return actual === expected')&&serviceWorkerSource.includes('const extension = pathname.match')&&serviceWorkerSource.includes('?.[0]?.toLowerCase()'));
assert('service worker and shared loader reject the same unsafe encoded asset paths',manifestLoaderSource.includes('isSafeManifestAssetUrl')&&serviceWorkerSource.includes('isSafeManifestAssetUrl')&&manifestLoaderSource.includes('%(?:25)*(?:2e|2f|5c)')&&serviceWorkerSource.includes('%(?:25)*(?:2e|2f|5c)')&&manifestLoaderSource.includes('x00-')&&manifestLoaderSource.includes('x1f')&&manifestLoaderSource.includes('x7f')&&serviceWorkerSource.includes('x00-')&&serviceWorkerSource.includes('x1f')&&serviceWorkerSource.includes('x7f'));
assert('image manifest loader validates the full schema, derivative dimensions and resets invalid payloads for retry',manifestLoaderSource.includes('export function isValidJycImageManifest(payload)')&&manifestLoaderSource.includes('payload.version!==1')&&manifestLoaderSource.includes('entry.derivativesEligible!==\'boolean\'')&&manifestLoaderSource.includes('isDerivativeDimensionEligible(width,height)')&&manifestLoaderSource.includes('isDerivativeManifestPath')&&manifestLoaderSource.includes('imageManifestPromise=null;'));
assert('browser QA retries malformed non-empty manifest schemas on the next route',browserSource.includes('responsive photo manifest retries after a successful but malformed payload')&&browserSource.includes('width: 0, height: 640')&&browserSource.includes("page.locator('.jyc-gallery-hub-container picture source[srcset]').count()).toBeGreaterThan(0)"));
assert('original image remains the format-compatibility fallback behind AVIF/WebP sources',responsiveSource.includes('const resolvedSrc=stage===0?source:!failed?candidates[stage-1]:undefined;')&&responsiveSource.includes('<img src={resolvedSrc')&&responsiveSource.includes('<source type="image/avif"')&&responsiveSource.includes('<source type="image/webp"')&&!responsiveSource.includes('variants?.webp?.at(-1)?.url||src'));
assert('gallery opens in photography mode',galleryUiSource.includes("const [filter,setFilter]=useState('All'); const [role,setRole]=useState('All'); const [visual,setVisual]=useState('photo');"));
assert('complete supplied archive is represented',manifest.total>=873,`manifest=${manifest.total}`);
assert('manifest total matches merged source gallery',manifest.total===gallery.length);
assert('source gallery has no duplicate URLs',duplicateUrls.length===0,duplicateUrls.slice(0,3).join(', '));
assert('every published media item has provenance and alt metadata',missing.length===0,missing.slice(0,3).map(x=>x.id||x.url).join(', '));
assert('presentation exports preserve source-page context',presentationWithoutPage.length===0,presentationWithoutPage.slice(0,3).map(x=>x.id).join(', '));
assert('Ebullience maps to its own source collection',event.items.length>0);
assert('Induction does not inherit Ebullience photography',[...inductionUrls].every(url=>!eventUrls.has(url)));
assert('manifest exposes visual roles',manifest.roles.includes('club')&&manifest.roles.includes('event')&&manifest.roles.includes('archive'));
assert('manifest exposes source types',manifest.sourceTypes.includes('presentation-export')&&manifest.sourceTypes.includes('maintained-jyc-media'));
assert('normalized event names resolve to deterministic collections',normalizedEventMappings.every(([name,collection])=>collection&&collection!=='JYC Archive'),JSON.stringify(normalizedEventMappings));
assert('newly audited non-photo archive assets stay out of photo pool',auditedExclusionIds.every(id=>![...archivePhotoUrls].some(url=>url.includes('/'+id+'.webp'))),auditedExclusionIds.filter(id=>[...archivePhotoUrls].some(url=>url.includes('/'+id+'.webp'))).join(', '));
assert('event photo rail exposes only explicit photography',eventPhotoItems.every(x=>x?.mediaKind==='photo'));
assert('identity assets are preserved in the broader source gallery',gallery.some(x=>x.mediaKind==='identity'));
assert('event media still retains broader source records separately',event.items.length>=eventPhotoItems.length);
const teamMediaSource=fs.readFileSync('src/jyc-team-media.js','utf8');
const teamPhotoBlock=teamMediaSource.match(/const TEAM_LOCAL_PHOTOS = Object\.freeze\(\{([\s\S]*?)\}\);/);
const teamPhotoEntries=teamPhotoBlock?[...teamPhotoBlock[1].matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)].map(match=>({name:match[1],url:match[2]})):[];
const invalidTeamPhotoPaths=teamPhotoEntries.filter(item=>!item.url.startsWith('/assets/team/')||!item.url.endsWith('.webp')||!fs.existsSync('public'+item.url));
assert('team portrait map is explicit, shared and non-empty',teamPhotoEntries.length>=10&&mainSource.includes("import { teamPhotoFor } from './jyc-team-media.js';")&&fs.readFileSync('src/jyc-editorial-home.jsx','utf8').includes("import { teamPhotoFor } from './jyc-team-media.js';"),'found '+teamPhotoEntries.length);
assert('every mapped team portrait is a committed local WebP',invalidTeamPhotoPaths.length===0,invalidTeamPhotoPaths.map(x=>x.name+': '+x.url).join(', '));
assert('team flip cards use lazy responsive portraits and safe public profile links',mainSource.includes('className="team-photo-editorial"')&&mainSource.includes('loading="lazy" decoding="async" sizes=')&&mainSource.includes('safeExternalUrl(m.linkedin||m.linkedinUrl||m.linkedin_url||m.socials?.linkedin)')&&mainSource.includes('team-back-content'));
const responsivePhotoSource=fs.readFileSync('src/jyc-responsive-photo.jsx','utf8');
const productionMediaSource=fs.readFileSync('scripts/optimize-production-media.mjs','utf8');

const teamThemeSource=fs.readFileSync('src/jyc-logo-final-theme.css','utf8');
const publicSystemSource=fs.readFileSync('src/styles/public-system.css','utf8');
assert('team portraits reserve intrinsic dimensions and fall back to the optimized official JYC logo',mainSource.includes('width={600} height={720}')&&mainSource.includes('fallbackSrc={logo}')&&mainSource.includes("const logo='/assets/jyc-logo.avif'")&&mainSource.includes('fallbackAlt="Official JYC logo placeholder; portrait unavailable"'));
assert('team members without a portrait display the official logo contained, never cropped as a face photo',mainSource.includes('className="team-photo-missing-logo" alt="Official JYC logo placeholder; portrait unavailable"')&&designUpgradeSource.includes('.team-photo-editorial img.team-photo-missing-logo{object-fit:contain!important')&&designUpgradeSource.includes('.team-photo-editorial .jyc-logo-fallback.team-photo-missing-logo{display:grid;place-items:center'));
assert('responsive derivatives use intrinsic dimensions and only approved photo assets',manifestLoaderSource.includes("fetch('/image-manifest.json',{cache:'no-cache'})")&&responsiveSource.includes('loadJycImageManifest()')&&responsiveSource.includes('const entry=manifest?.images?.[source]')&&responsiveSource.includes('entry?.derivativesEligible===true')&&responsiveSource.includes('photoDerivativeUrls(source,intrinsicWidth)')&&responsiveSource.includes('if(!derivativesEnabled||!isDerivativeSource(source))')&&responsiveSource.includes('source-archive|hub-photos|hub-photos-extra|events|home|team')&&imageManifestSource.includes('derivativesEligible:derivativeEligible(url,display.width,display.height)')&&imageManifestSource.includes('isDerivativeDimensionEligible(width,height)')&&imageManifestSource.includes('orientedImageDimensions(d.width,d.height,metadata.orientation)')&&imageManifestSource.includes("'/assets/events/'")&&imageManifestSource.includes("'/assets/team/'")&&imageManifestSource.includes('derivativeArchiveUrls.has(url)'));
assert('responsive photo fallback labels stay declarative and avoid redundant mount renders',responsivePhotoSource.includes('fallbackAlt')&&responsivePhotoSource.includes('alt={activeFallback?fallbackAlt:alt}')&&responsivePhotoSource.includes('useLayoutEffect(()=>{setFallbackState(previous=>previous.src===source&&previous.fallbackSrc===normalizedFallbackSrc?previous:{src:source,fallbackSrc:normalizedFallbackSrc,stage:0,preferOriginal:false})},[source,normalizedFallbackSrc])')&&responsivePhotoSource.includes("useState(()=>({src:source,width:0,derivativesEligible:false}))")&&!responsivePhotoSource.includes('setSourceDimensions({src,width:0,derivativesEligible:false})'));
assert('empty responsive photo sources normalize to a neutral photo fallback before rendering',responsivePhotoSource.includes("const PHOTO_FALLBACK='/assets/photo-unavailable.svg'")&&responsivePhotoSource.includes("const normalizedFallbackSrc=typeof fallbackSrc==='string'&&fallbackSrc.trim()?fallbackSrc.trim():PHOTO_FALLBACK;")&&responsivePhotoSource.includes("const source=typeof src==='string'&&src.trim()?src.trim():normalizedFallbackSrc;")&&responsivePhotoSource.includes('const resolvedSrc=stage===0?source:!failed?candidates[stage-1]:undefined')&&responsivePhotoSource.includes('manifest?.images?.[source]'));
assert('JYC Now images use shared responsive loading and branded fallback',jycNowSource.includes("import {ResponsivePhoto} from './jyc-responsive-photo.jsx'")&&jycNowSource.includes('<ResponsivePhoto className="jyc-now-source-image"')&&jycNowSource.includes('<ResponsivePhoto className="jyc-now-hero-logo"')&&jycNowSource.includes('<ResponsivePhoto className="jyc-now-spotlight-image"')&&jycNowSource.includes('fallbackSrc="/assets/jyc-logo.avif"')&&jycNowSource.includes('decoding="async"')&&!jycNowSource.includes('<img src={item.image}')&&!jycNowSource.includes('<img src={story.image}'));
assert('JYC Now responsive picture wrappers preserve media geometry and contain all branded fallbacks',jycNowSource.includes('.jyc-now-media .jyc-responsive-picture{display:block;width:100%;height:100%}')&&jycNowSource.includes('.jyc-now-media img{width:100%;height:100%;object-fit:cover;display:block}')&&jycNowSource.includes('img[data-image-fallback-stage]:not([data-image-fallback-stage=\"failed\"]){object-fit:contain;background:#f8f1e5;padding:clamp(12px,3vw,28px)}')&&jycNowSource.includes('.jyc-now-hero-mark>.jyc-responsive-picture{display:block;width:min(150px,55%);height:auto}')&&jycNowSource.includes('.jyc-spotlight-grid button .jyc-responsive-picture{display:block;width:100%;height:100%}')&&jycNowSource.includes('.jyc-spotlight-grid img[data-image-fallback-stage]:not([data-image-fallback-stage=\"failed\"]){object-fit:contain;background:#f8f1e5;padding:16px}'));
assert('DriftWall failures use the official contained JYC logo, never an unrelated archive photo',driftWallSource.includes("image.src='/assets/jyc-logo.webp'")&&driftWallSource.includes("image.alt='Official JYC logo placeholder; archive photo unavailable'")&&driftWallSource.includes("image.style.objectFit='contain'")&&driftWallSource.includes("image.setAttribute('aria-hidden','true')")&&!driftWallSource.includes("image.src='/assets/hub-photos/jyc-06.webp'"));
assert('Living Photo recovers broken current images with source-aware WebP and PNG logo fallbacks',livingPhotoSource.includes('data-source={current.url}')&&livingPhotoSource.includes('image.dataset.fallbackSource!==source')&&livingPhotoSource.includes('image.src="/assets/jyc-logo.avif"')&&livingPhotoSource.includes('image.src="/JYC%20Logo(4).png"')&&livingPhotoSource.includes('image.style.objectFit="contain"')&&livingPhotoSource.includes('A photo could not load; the current image or official JYC mark remains in place.'));
assert('Living Photo outgoing failures stay decorative and hidden',livingPhotoSource.includes('className="jyc-living-photo-image is-outgoing"')&&livingPhotoSource.includes('image.setAttribute("aria-hidden","true")')&&livingPhotoSource.includes('image.style.opacity="0"'));
assert('DepthCarousel images fall back to the official logo and original PNG',depthCarouselSource.includes('onError=')&&depthCarouselSource.includes("image.src='/assets/jyc-logo.webp'")&&depthCarouselSource.includes("image.src='/JYC%20Logo(4).png'")&&depthCarouselSource.includes("image.style.objectFit='contain'"));
assert('MagicBento photos use shared responsive delivery, lazy decoding and a safe branded fallback',magicBentoSource.includes("import{ResponsivePhoto}from'../../jyc-responsive-photo.jsx'")&&magicBentoSource.includes('<ResponsivePhoto src={item.image} alt="" loading="lazy" decoding="async"')&&magicBentoSource.includes('fallbackSrc="/assets/jyc-logo.webp"')&&magicBentoSource.includes('fallbackAlt=""')&&magicBentoSource.includes('sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw"'));
assert('every photo fallback stage is React-state driven and removes derivative sources',responsivePhotoSource.includes('setFallbackState(previous=>')&&responsivePhotoSource.includes('const candidatePool=preferOriginal?[source,normalizedFallbackSrc]:[normalizedFallbackSrc]')&&responsivePhotoSource.includes('const candidates=candidatePool.filter')&&responsivePhotoSource.includes('const variants=stage===0&&derivativesEnabled&&intrinsicWidth>0?photoDerivativeUrls(source,intrinsicWidth):null')&&responsivePhotoSource.includes("data-image-fallback-stage={failed?'failed':usingOriginalRetry?'original':activeFallback?String(stage):undefined}"));
assert('generic photo fallback is neutral and explicit branded surfaces can select their own fallback',responsivePhotoSource.includes("const PHOTO_FALLBACK='/assets/photo-unavailable.svg'")&&responsivePhotoSource.includes('const candidatePool=preferOriginal?[source,normalizedFallbackSrc]:[normalizedFallbackSrc]')&&responsivePhotoSource.includes('const candidates=candidatePool.filter')&&responsivePhotoSource.includes('const resolvedSrc=')&&responsivePhotoSource.includes('setFallbackState(previous=>'));
assert('failed generated derivatives retry the original photo before switching to the chosen fallback',responsivePhotoSource.includes('const candidatePool=preferOriginal?[source,normalizedFallbackSrc]:[normalizedFallbackSrc]')&&responsivePhotoSource.includes("failedUrl.includes('/assets/photo-derivatives/')")&&responsivePhotoSource.includes("usingOriginalRetry?'original'")&&responsivePhotoSource.includes('alt={activeFallback?fallbackAlt:alt}'));
assert('whitespace-only fallback URLs normalize to the safe local neutral photo placeholder',responsivePhotoSource.includes("const normalizedFallbackSrc=typeof fallbackSrc==='string'&&fallbackSrc.trim()?fallbackSrc.trim():PHOTO_FALLBACK;")&&responsivePhotoSource.includes(':normalizedFallbackSrc;')&&responsivePhotoSource.includes('fallbackSrc:normalizedFallbackSrc'));
assert('exhausted image fallback leaves a visible branded placeholder with accessible alternate text',responsivePhotoSource.includes('data-image-failed={failed?')&&responsivePhotoSource.includes("data-image-fallback-label={failed?(alt?'Image unavailable':''):undefined}")&&responsivePhotoSource.includes("role={failed&&alt?'img':undefined}")&&responsivePhotoSource.includes("aria-label={failed&&alt?alt+' (image unavailable)':undefined}")&&publicSystemSource.includes('.jyc-responsive-picture[data-image-failed="true"]::before')&&publicSystemSource.includes('.jyc-responsive-picture[data-image-failed="true"]::after'));
assert('failed portrait logo fallback is contained rather than cropped',teamThemeSource.includes('img[data-image-fallback-stage="1"]')&&teamThemeSource.includes('object-fit:contain!important'));
assert('responsive image fallback state is controlled and never silently injects a logo into a photo frame',responsivePhotoSource.includes("const PHOTO_FALLBACK='/assets/photo-unavailable.svg'")&&responsivePhotoSource.includes('const candidatePool=preferOriginal?[source,normalizedFallbackSrc]:[normalizedFallbackSrc]')&&responsivePhotoSource.includes('const candidates=candidatePool.filter')&&responsivePhotoSource.includes('const resolvedSrc=')&&responsivePhotoSource.includes('setFallbackState(previous=>'));
assert('branded fallback images are contained across editorial surfaces',teamThemeSource.includes('.jyc-responsive-picture img[data-image-fallback-stage="2"]')&&teamThemeSource.includes('.jyc-responsive-picture img[data-image-fallback-stage="3"]')&&teamThemeSource.includes('Any failed editorial image becomes an identity mark'));
assert('club photo failures prefer the club logo and preserve decorative alt text',gallerySource.includes('fallbackSrc={c.logo||LOGO_FALLBACK} fallbackAlt=""')&&gallerySource.includes("const LOGO_FALLBACK='/assets/jyc-logo.avif'"));
assert('supplied hub programme artwork uses responsive loading, a branded fallback and contained geometry',mainSource.includes('<ResponsivePhoto className="supplied-programme-photo"')&&mainSource.includes('fallbackAlt="Official JYC logo placeholder; supplied programme artwork unavailable"')&&finalThemeCss.includes('.public-app .supplied-programme-card>.supplied-programme-photo')&&finalThemeCss.includes('object-fit:contain!important;padding:12px!important')&&finalThemeCss.includes('.public-app .supplied-programme-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important;min-width:0}'));
assert('event timeline posters use responsive fallback without cropping the logo',mainSource.includes('<ResponsivePhoto className="event-timeline-poster"')&&mainSource.includes('fallbackAlt="Official JYC logo placeholder; event poster unavailable"')&&finalThemeCss.includes('.public-app .event-timeline-media>.event-timeline-poster')&&finalThemeCss.includes('img[data-image-fallback-stage]:not([data-image-fallback-stage="failed"]){object-fit:contain'));
assert('failed club logos update their alt text when falling back to the JYC mark',mainSource.includes('Official JYC logo placeholder; \${c.name} logo unavailable')&&mainSource.includes("image.style.objectFit='contain'"));
assert('JAI QR failure leaves a direct registration link and accessible status',mainSource.includes('registrationTarget=safeExternalUrl(e.registrationUrl)||safeExternalUrl(e.officialUrl)')&&mainSource.includes('event-jai-qr-link')&&mainSource.includes('QR unavailable — use the link below')&&finalThemeCss.includes('.public-app .event-jai-qr-link:focus-visible'));
assert('event photo failures prefer the event poster then the JYC logo',gallerySource.includes('fallbackSrc={e.poster||LOGO_FALLBACK} fallbackAlt=""')&&gallerySource.includes("const LOGO_FALLBACK='/assets/jyc-logo.avif'"));
assert('club cards fall back to their own logo before the official JYC mark',mainSource.includes('fallbackSrc={c.logo||logo} fallbackAlt=""'));
assert('event cards never substitute unrelated JYC archive photography for a failed event image',mainSource.includes('fallbackSrc={e.poster&&e.poster!==eventVisualFor(e,index)?e.poster:logo} fallbackAlt=""')&&!mainSource.includes('fallbackSrc="/assets/hub-photos/jyc-06.webp"'));
assert('homepage featured event uses shared responsive photo fallback and branded identity styling',editorialHomeSource.includes("const ORIGINAL_LOGO = '/JYC%20Logo(4).png';")&&editorialHomeSource.includes("const FALLBACK = import.meta.env.PROD ? '/assets/jyc-logo.webp' : ORIGINAL_LOGO")&&editorialHomeSource.includes('<ResponsivePhoto')&&editorialHomeSource.includes('className="jh-featured-event-photo"')&&editorialHomeSource.includes("Official JYC logo placeholder; event media unavailable")&&homeCssSource.includes('.jh-featured-event-photo')&&homeCssSource.includes('@media (max-width: 760px)'));
assert('production build generates WebP and compact AVIF derivatives from the original official logo',productionMediaSource.includes("const logoSource=path.resolve('public/JYC Logo(4).png')")&&productionMediaSource.includes("const logoOutput=path.join(root,'assets','jyc-logo.webp')")&&productionMediaSource.includes("const logoAvifOutput=path.join(root,'assets','jyc-logo.avif')")&&productionMediaSource.includes("webp({quality:92,effort:5,alphaQuality:100})")&&productionMediaSource.includes("avif({quality:80,effort:6})"));
assert('offline app shell caches the compact logo and advances its versioned cache namespace',serviceWorkerSource.includes("const CACHE_NAME = 'jyc-cache-v64-5-9'")&&serviceWorkerSource.includes("const APP_SHELL = ['/', '/offline.html', '/manifest.json', '/assets/jyc-logo.avif'];")&&!serviceWorkerSource.includes("const APP_SHELL = ['/', '/offline.html', '/manifest.json', '/JYC%20Logo(4).png'];")&&productionMediaSource.includes("path.join(root,'assets','jyc-logo.webp')"));
assert('service worker fetches the image manifest network-first and caches only schema-valid payloads',serviceWorkerSource.includes("requestUrl.pathname === '/image-manifest.json'")&&serviceWorkerSource.includes("fetch(new Request(request, { cache: 'no-cache' }))")&&serviceWorkerSource.includes("response.headers.get('content-type')?.includes('application/json')")&&serviceWorkerSource.includes('const validManifest = isValidImageManifest(payload)')&&serviceWorkerSource.includes('entry.derivativesEligible !== \'boolean\'')&&serviceWorkerSource.includes('!isDerivativeDimensionEligible(width, height)')&&serviceWorkerSource.includes('isDerivativeManifestPath')&&serviceWorkerSource.includes('if (validManifest) await caches.open(CACHE_NAME)')&&serviceWorkerSource.includes('.catch(() => null)')&&serviceWorkerSource.includes('caches.match(request)'));

assert('browser QA forces both portrait and optimized-logo failure before validating the original PNG fallback',browserSource.includes('failed team portraits fall through the optimized logo to the original PNG safely')&&browserSource.includes("page.route('**/assets/team/**', route => route.abort())")&&browserSource.includes("page.route('**/assets/jyc-logo.avif', route => route.abort())")&&browserSource.includes("toBe('/JYC%20Logo(4).png')")&&browserSource.includes('portrait unavailable'));
assert('browser QA aborts all generated derivatives and verifies the original or branded fallback still decodes',browserSource.includes('responsive pictures recover when generated AVIF and WebP derivatives all fail')&&browserSource.includes("page.route('**/assets/photo-derivatives/**', route => route.abort())")&&browserSource.includes("failedVariants.length")&&browserSource.includes("state.currentSrc, 'a failed derivative must not remain the displayed image'")&&browserSource.includes('state.naturalWidth'));
assert('browser QA decodes lazy media on every long-form public route',browserSource.includes("lazy-loaded media decodes across long-form public routes")&&browserSource.includes("const broken = media.filter(img => img.src && !img.loaded)")&&browserSource.includes("const missingAlt = media.filter(img => !img.hasAlt)"));
assert('archive stories, hub preview and album covers use responsive photo delivery',mainSource.includes('ResponsivePhoto')&&gallerySource.includes('ResponsivePhoto src={album.cover_url')&&gallerySource.includes('ResponsivePhoto src={g.url')&&gallerySource.includes('export function JYC57Archive')&&gallerySource.includes('export function JYCBestOf'));
assert('responsive picture wrappers retain the archive, hub-preview and album frame geometry',teamThemeSource.includes('.archive-story-photo .archive-story-image img')&&teamThemeSource.includes('.hub-preview-image .hub-preview-source-image img')&&publicSystemSource.includes('.jyc57-archive-head .jyc57-album-hero img')&&publicSystemSource.includes('.jyc57-collection-cover .jyc-responsive-picture img'));
assert('homepage editorial story uses only published event/club photo records',editorialHomeSource.includes('const photoStories = useMemo')&&editorialHomeSource.includes("item?.mediaKind !== 'photo'")&&editorialHomeSource.includes("!['event','club'].includes(role)")&&editorialHomeSource.includes('item?.published === false')&&editorialHomeSource.includes('seen.has(association.toLowerCase())'));
assert('homepage editorial story uses responsive lazy images with branded fallback',editorialHomeSource.includes('<ResponsivePhoto')&&editorialHomeSource.includes('className="jh-story-photo"')&&editorialHomeSource.includes('loading="lazy"')&&editorialHomeSource.includes('decoding="async"')&&editorialHomeSource.includes('fallbackSrc={FALLBACK}')&&editorialHomeSource.includes("onClick={() => nav('/gallery')}"));
assert('homepage photo story keeps responsive geometry and reduced motion support',homeCssSource.includes('.jh-photo-story-grid.has-three .jh-story-card-1')&&homeCssSource.includes('@media (max-width: 680px)')&&homeCssSource.includes('@media (prefers-reduced-motion: reduce)'));
assert('team, event and homepage photo directories participate in responsive derivatives',fs.readFileSync('src/jyc-photo-intelligence.js','utf8').includes("'/assets/events/'")&&fs.readFileSync('src/jyc-photo-intelligence.js','utf8').includes("'/assets/home/'")&&fs.readFileSync('src/jyc-photo-intelligence.js','utf8').includes("'/assets/team/'")&&fs.readFileSync('scripts/generate-photo-derivatives.mjs','utf8').includes("'events','home','team'"));
assert('photo derivative eligibility rejects logo strips, tiny thumbnails and extreme panoramas',isDerivativeDimensionEligible(1600,900)&&isDerivativeDimensionEligible(600,1200)&&!isDerivativeDimensionEligible(1311,25)&&!isDerivativeDimensionEligible(126,68)&&!isDerivativeDimensionEligible(1500,211)&&!isDerivativeDimensionEligible(100,200));
assert('image manifest only marks images eligible when their intrinsic dimensions are derivative-safe',fs.readFileSync('scripts/generate-image-manifest.mjs','utf8').includes('derivativeEligible(url,display.width,display.height)')&&fs.readFileSync('scripts/generate-image-manifest.mjs','utf8').includes('isDerivativeDimensionEligible(width,height)'));
assert('photo derivative generator skips unsuitable intrinsic dimensions before encoding',fs.readFileSync('scripts/generate-photo-derivatives.mjs','utf8').includes('!display||!isDerivativeDimensionEligible(display.width,display.height)'));

const imageRoot=path.resolve('public/assets');
const imageFiles=[];
const walkImageFiles=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walkImageFiles(file);else if(/\\.(?:png|jpe?g|webp)$/i.test(file))imageFiles.push(file)}};
walkImageFiles(imageRoot);
const dimensionMismatches=[];
let dimensionCursor=0;
const dimensionWorkers=Array.from({length:Math.min(6,imageFiles.length)},async()=>{
 while(true){
  const index=dimensionCursor++;
  if(index>=imageFiles.length)return;
  const file=imageFiles[index];
  try{
   const [parsed,metadata]=await Promise.all([Promise.resolve(parseImageDimensions(fs.readFileSync(file))),sharp(file).metadata()]);
   if(!parsed||parsed.width!==metadata.width||parsed.height!==metadata.height)dimensionMismatches.push({file:path.relative('public',file),parsed,actual:{width:metadata.width,height:metadata.height}});
  }catch(error){dimensionMismatches.push({file:path.relative('public',file),error:error?.message||String(error)})}
 }
});
await Promise.all(dimensionWorkers);
assert('image-header dimensions match Sharp metadata across all committed/generated PNG JPEG and WebP assets',dimensionMismatches.length===0,dimensionMismatches.slice(0,8).map(item=>JSON.stringify(item)).join('; ')||imageFiles.length+' files checked');


const derivativeRoot=path.resolve('public/assets/photo-derivatives');
const allowedDerivativeFolders=['hub-photos/','hub-photos-extra/','events/','home/','team/'];
const allowedArchiveSourceUrls=new Set(JYC_SOURCE_ARCHIVE_PHOTO_ITEMS.map(item=>String(item?.url||'')));
const derivativeBaseOwners=new Map(),duplicateDerivativeBases=[];
for(const file of imageFiles){
 if(file.startsWith(derivativeRoot+path.sep))continue;
 const rel=path.relative(imageRoot,file).replaceAll(path.sep,'/'),url='/assets/'+rel;
 const isAllowed=url.startsWith('/assets/source-archive/')?allowedArchiveSourceUrls.has(url):allowedDerivativeFolders.some(prefix=>rel.startsWith(prefix));
 if(!isAllowed)continue;
 const base=rel.replace(/\.(?:png|jpe?g|webp)$/i,'');
 const previous=derivativeBaseOwners.get(base);
 if(previous)duplicateDerivativeBases.push({base,files:[previous,rel]});else derivativeBaseOwners.set(base,rel);
}
assert('derivative-managed source files have unique output basenames',duplicateDerivativeBases.length===0,duplicateDerivativeBases.slice(0,8).map(item=>JSON.stringify(item)).join('; '));
const derivativeFiles=[];
if(fs.existsSync(derivativeRoot)){const walkDerivatives=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walkDerivatives(file);else if(/\.(?:avif|webp)$/i.test(file))derivativeFiles.push(file)}};walkDerivatives(derivativeRoot)}
const derivativeMismatches=[];
let derivativeCursor=0;
const derivativeWorkers=Array.from({length:Math.min(6,derivativeFiles.length)},async()=>{
 while(true){
  const index=derivativeCursor++;
  if(index>=derivativeFiles.length)return;
  const file=derivativeFiles[index];
  try{
   const rel=path.relative(derivativeRoot,file).replaceAll(path.sep,'/');
   const match=rel.match(/-(480|960|1600)\.(avif|webp)$/i);
   if(!match){derivativeMismatches.push({file:path.relative('public',file),error:'unexpected derivative filename'});continue}
   const requestedWidth=Number(match[1]),base=rel.replace(/-\d+\.(?:avif|webp)$/i,'');
   const source=['.png','.jpg','.jpeg','.webp'].map(ext=>path.join(imageRoot,base+ext)).find(candidate=>fs.existsSync(candidate));
   if(!source){derivativeMismatches.push({file:path.relative('public',file),error:'orphan derivative has no source'});continue}
   const [sourceMeta,outputMeta]=await Promise.all([sharp(source).metadata(),sharp(file).metadata()]);
   const display=orientedImageDimensions(sourceMeta.width,sourceMeta.height,sourceMeta.orientation);
   if(!display||!isDerivativeDimensionEligible(display.width,display.height)||requestedWidth>display.width||outputMeta.width!==requestedWidth||Math.abs((outputMeta.height||0)-Math.round(display.height*requestedWidth/display.width))>1)derivativeMismatches.push({file:path.relative('public',file),source:path.relative('public',source),requestedWidth,sourceDisplay:display,output:{width:outputMeta.width,height:outputMeta.height}});
  }catch(error){derivativeMismatches.push({file:path.relative('public',file),error:error?.message||String(error)})}
 }
});
await Promise.all(derivativeWorkers);
assert('every AVIF/WebP derivative has a valid source, eligible dimensions and truthful width/aspect-ratio descriptors',derivativeMismatches.length===0,derivativeMismatches.slice(0,8).map(item=>JSON.stringify(item)).join('; ')||derivativeFiles.length+' variants checked');
const manifestPath='public/image-manifest.json';
if(fs.existsSync(manifestPath)){
 const builtManifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 assert('generated image manifest passes the same strict runtime schema validator',isValidJycImageManifest(builtManifest));
 const manifestMismatches=[];
 for(const [url,entry] of Object.entries(builtManifest.images||{})){
  const display=orientedImageDimensions(entry.rawWidth||entry.width,entry.rawHeight||entry.height,entry.exifOrientation);
  const pathEligible=url.startsWith('/assets/source-archive/')?JYC_SOURCE_ARCHIVE_PHOTO_ITEMS.some(item=>item.url===url):['/assets/hub-photos/','/assets/hub-photos-extra/','/assets/events/','/assets/home/','/assets/team/'].some(prefix=>url.startsWith(prefix));const expectedEligible=pathEligible&&isDerivativeDimensionEligible(display?.width,display?.height);if(!display||display.width!==entry.width||display.height!==entry.height||entry.derivativesEligible!==expectedEligible)manifestMismatches.push({url,entry,display,expectedEligible});
 }
 assert('generated image manifest exposes correct EXIF-oriented display dimensions and eligibility',manifestMismatches.length===0,manifestMismatches.slice(0,8).map(item=>JSON.stringify(item)).join('; ')||Object.keys(builtManifest.images||{}).length+' records checked');
}

if(process.exitCode)process.exit(1);
console.log('Photo integrity QA: all checks passed.');
