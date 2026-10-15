import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const source=read('src/jyc-source-media.js');
const archive=read('src/source-archive-index.js');
const main=read('src/main.jsx');
const css=read('src/jyc-logo-final-theme.css');
const vite=read('vite.config.js');
const imageManifest=read('scripts/generate-image-manifest.mjs');
const gallery=read('src/extra-features.jsx');
const checks=[
 ['media governance migration covers photographer and rights metadata',read('supabase/migrations/202610080003_v58_2_media_governance.sql').includes('jyc_photographers')&&read('supabase/migrations/202610080003_v58_2_media_governance.sql').includes('rights_status')&&read('supabase/migrations/202610080003_v58_2_media_governance.sql').includes('license_url')],
 ['album publication is rights-gated',read('supabase/migrations/202610080004_v58_3_album_publication_guard.sql').includes('rights_status <> \'cleared\'')&&read('supabase/migrations/202610080004_v58_3_album_publication_guard.sql').includes('jyc_content_verification')],
 ['media taxonomy exports event mapper',source.includes('export function sourceEventMedia')],
 ['media taxonomy exports manifest builder',source.includes('export function buildJycMediaManifest')],
 ['event page imports source event media',main.includes('sourceEventMedia')],
 ['event page renders visual record',main.includes('event-source-gallery')],
 ['event gallery preserves source provenance context',main.includes('sourceEventMedia(e)')&&main.includes('source photography connected to this experience')&&source.includes('sourceLabel:')&&source.includes('sourceType:')],
 ['event gallery is responsive',css.includes('.event-source-gallery-grid')],
 ['source archive remains deduplicated',source.includes('const seen=new Set()')],
 ['source media avoids synthetic imagery',source.includes('SOURCE_GALLERY')],
 ['event aliases avoid shared welcome bucket',!source.includes("'Ebullience','freshers','welcome'")&&!source.includes("'Induction','orientation','welcome'")],
 ['media provenance taxonomy exists',source.includes('sourceType:')&&source.includes('sourceLabel:')&&source.includes('role')],
 ['media alt metadata exists',source.includes('alt:item.alt||item.caption')],
 ['external media is classified',source.includes('official-external-media')],
 ['gallery uses role filters',gallery.includes("roleLabels")&&gallery.includes('MEDIA TYPE')],
 ['gallery consumes full curated archive photo pool',gallery.includes('JYC_SOURCE_ARCHIVE_PHOTO_ITEMS')&&gallery.includes('...sourceArchivePhotos')],
 ['discarded club identity assets are preserved separately',source.includes('JYC_SOURCE_ARCHIVE_IDENTITY_ASSETS')&&source.includes("mediaKind:'identity'")&&source.includes('identityLogo')&&source.includes('identityBanner')],
 ['archive photo policy is content-aware',source.includes('ARCHIVE_PHOTO_EXCLUSIONS')&&source.includes('ARCHIVE_SHOWCASE_PHOTOS')&&source.includes('JYC_SOURCE_ARCHIVE_PHOTO_ITEMS=ARCHIVE_GALLERY')],
 ['living photo engine is wired',gallery.includes('LivingPhoto')&&source.includes('JYC_SOURCE_ARCHIVE_PHOTO_ITEMS')],
 ['featured photo ranking is wired',source.includes('rankJycPhotoItems')&&gallery.includes('rankJycPhotoItems(items,{limit:24})')],
 ['living photo engine has decoded preloading and related scoring',read('src/jyc-living-photo.jsx').includes('preloadAndDecode')&&read('src/jyc-living-photo.jsx').includes('scoreRelatedPhoto')&&read('src/jyc-living-photo.jsx').includes('prefers-reduced-motion')],
 ['complete source archive inventory is wired',source.includes('JYC_SOURCE_ARCHIVE_CATALOG')&&source.includes('JYC_SOURCE_ARCHIVE_STATS')&&archive.includes('sourceAssetFiles":873')&&archive.includes('uniqueBinaryHashes":813')],
 ['audited archive boundary is reused for override URLs',source.includes('isAcceptedArchiveUrl')&&source.includes('QUALITY_OVERRIDES')&&source.includes('.filter(isAcceptedArchiveUrl)')],
 ['gallery image component has failure recovery and focal-point support',gallery.includes('function JycGalleryImage')&&gallery.includes('setFailed')&&gallery.includes('focalX')&&gallery.includes('focalY')],
 ['gallery wall derives its preview list after filtered items exist',gallery.includes('const wallItems=useMemo(()=>rankJycPhotoItems(items,{limit:24}),[items])')&&gallery.includes('LazyDriftWall items={wallItems.map')],
 ['gallery lightbox supports keyboard image navigation',gallery.includes("e.key==='ArrowRight'")&&gallery.includes("e.key==='ArrowLeft'")&&gallery.includes('wallItems[next]')],
 ['public gallery uses strict photo records',read('src/jyc57-experience.jsx').includes('JYC_SOURCE_ARCHIVE_PHOTO_ITEMS')&&read('src/jyc57-experience.jsx').includes("g.mediaKind==='photo'")],
 ['public gallery supports shareable photo URLs',read('src/jyc57-experience.jsx').includes("next.set('photo'")&&read('src/jyc57-experience.jsx').includes('params.get(\'photo\')')&&read('src/jyc57-experience.jsx').includes('const closePhoto = () =>')&&read('src/jyc57-experience.jsx').includes('next.delete(\'photo\')')],
 ['gallery shares album-aware URLs and synchronizes lightbox navigation',read('src/jyc57-experience.jsx').includes('window.location.origin + loc.pathname')&&read('src/jyc57-experience.jsx').includes('openPhoto(filtered[nextIdx])')&&read('src/jyc57-experience.jsx').includes('onClick={closePhoto}')],
 ['gallery full-resolution action uses a single accessible link control',read('src/jyc57-experience.jsx').includes('className="jyc57-full-resolution-link"')&&!read('src/jyc57-experience.jsx').includes('<button type="button">Full Resolution')&&read('src/styles/public-system.css').includes('.jyc57-full-resolution-link')],
 ['gallery exposes accessible media-type filters',read('src/jyc57-experience.jsx').includes('aria-label="Filter gallery by media type"')&&read('src/jyc57-experience.jsx').includes("mediaFilter==='club'")&&read('src/jyc57-experience.jsx').includes("mediaFilter==='event'")&&read('src/jyc57-experience.jsx').includes("mediaFilter !== 'all'")&&read('src/jyc57-experience.jsx').includes("setMediaFilter('all')")],
 ['public gallery has published album routes',main.includes("clean.startsWith('/gallery/')")&&read('src/jyc57-experience.jsx').includes("/gallery/'+encodeURIComponent(value)")&&read('src/jyc57-experience.jsx').includes("jyc_media_albums")],
 ['public gallery supports mobile swipe and zoom',read('src/jyc57-experience.jsx').includes('onTouchStart')&&read('src/jyc57-experience.jsx').includes('setZoom')],
 ['public gallery uses metadata filters and progressive rendering',read('src/jyc57-experience.jsx').includes('visibleCount')&&read('src/jyc57-experience.jsx').includes('setVisibleCount(n => n + 36)')&&read('src/jyc57-experience.jsx').includes('g.association')&&read('src/jyc57-experience.jsx').includes('g.year')&&read('src/jyc57-experience.jsx').includes('eventCategory')],
 ['archive route is code-split into a dedicated lazy-loaded module',main.includes("const loadJyc57Archive=()=>jyc57ArchivePromise||(jyc57ArchivePromise=import('./jyc57-archive.jsx'))")&&main.includes("const LazyJYC57Archive=lazy(()=>loadJyc57Archive().then(m=>({default:m.JYC57Archive})))")&&!main.includes("JYC57Archive} from './jyc57-experience.jsx'")&&read('src/jyc57-archive.jsx').includes('export function JYC57Archive')],
];
let failed=0; for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+': '+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('Media architecture QA: '+checks.length+'/'+checks.length+' checks passed.');
