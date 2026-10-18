import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=path=>fs.readFileSync(path,'utf8');
const home=read('src/jyc-editorial-home.jsx');
const media=read('src/jyc-source-media.js');
const gallery=read('src/jyc57-experience.jsx');
const responsive=read('src/jyc-responsive-photo.jsx');
const manifest=read('src/jyc-image-manifest.js');
const config=read('src/public-v1/config.js');
const hubContent=read('src/v21-hub-content.js');
const checks=[
  ['homepage stories require an explicit image URL and a named source association',home.includes("const url = String(item?.url || '').trim()")&&home.includes("const association = String(item?.association || item?.albumName || '').trim()")],
  ['homepage stories only use photo media classified as event or club photography',home.includes("item?.mediaKind !== 'photo'")&&home.includes("!['event','club'].includes(role)")],
  ['homepage stories exclude archived/unpublished items and source-archive labels',home.includes('item?.published === false')&&home.includes('item?.archived === true')&&home.includes('/jyc(?:\\s+photo)?\\s+archive|source archive/i.test(association)')],
  ['homepage stories deduplicate associations before selecting a small editorial set',home.includes('seen.has(association.toLowerCase())')&&home.includes('seen.add(association.toLowerCase())')&&home.includes('if (selected.length === 3) break;')],
  ['homepage story images use the shared responsive image component',home.includes('<ResponsivePhoto')&&home.includes('className="jh-story-photo"')&&(home.includes('fallbackSrc={FALLBACK}')||home.includes('fallbackSrc="/assets/photo-unavailable.svg"'))],
  ['homepage story images are lazy loaded with descriptive fallback text',home.includes('loading="lazy"')&&home.includes('decoding="async"')&&(home.includes('fallbackAlt="Official JYC logo placeholder; photograph unavailable"')||home.includes('fallbackAlt="Photograph unavailable"'))],
  ['event hero images use source-backed event mapping and a neutral unavailable-media fallback',home.includes('sourceEventMedia(e)?.photoItems')&&home.includes('fallbackSrc="/assets/photo-unavailable.svg"')&&home.includes('fallbackAlt="Event media unavailable"')],
  ['archive records retain provenance and distinguish photo from visual/identity assets',media.includes("sourceType:'source-archive'")&&media.includes("mediaKind:'identity'")&&media.includes("return 'visual'")&&media.includes("return 'photo'")],
  ['archive exclusions are applied to source photography and quality overrides',media.includes('ARCHIVE_PHOTO_EXCLUSIONS')&&media.includes('ARCHIVE_SHOWCASE_PHOTOS')&&media.includes('.filter(isAcceptedArchiveUrl)')],
  ['gallery defaults to photo mode and keeps visual asset types distinct',gallery.includes("g.mediaKind === 'photo'")&&gallery.includes('JYC_SOURCE_ARCHIVE_PHOTO_ITEMS')&&gallery.includes('jyc_media_albums')],
  ['responsive image delivery never guesses derivatives without manifest confirmation',responsive.includes('entry?.derivativesEligible===true')&&responsive.includes('photoDerivativeUrls(source,intrinsicWidth)')&&responsive.includes('If the manifest is unavailable, keep the original source')],
  ['responsive image manifest rejects malformed or unsafe asset paths',manifest.includes('export function isValidJycImageManifest(payload)')&&manifest.includes('isSafeManifestAssetUrl')&&manifest.includes('isDerivativeDimensionEligible')],
  ['historical content policy labels supplied archive material as historical',config.includes("archiveLabel:'Supplied / historical JYC material'")],
  ['hub records are maintained as structured data instead of PDF screenshots',hubContent.includes('export const JYC_HUB_CONTENT')&&!hubContent.includes('data:image/')],
  ['JYC content taxonomy retains official campus context without importing reference-app assumptions',config.includes("organisation:'JIIT Youth Club 128'")&&config.includes("campus:'JIIT Wish Town Campus · Sector 128, Noida'")&&config.includes("'attendance/check-in system'")],
  ['homepage hero keeps the identity effect optional behind a Suspense fallback',home.includes('const LazyDitherVeil = lazy(')&&home.includes('Suspense fallback={<img className="jh-hero-logo jh-dither-suspense-fallback"')&&home.includes('fallbackSrc={FALLBACK}')&&home.includes('originalFallbackSrc={ORIGINAL_LOGO}')],
  ['homepage visual activity cards have a non-WebGL fallback and deferred activation',home.includes("if (typeof IntersectionObserver === 'undefined')")&&home.includes('jh-bento-loading')&&home.includes("rootMargin:'360px 0px'")&&home.includes('observer.disconnect()')&&home.includes('enableMagnetism={false}')&&home.includes('enableTilt={false}')&&home.includes('enableStars={false}')],
  ['activity taxonomy remains structured and avoids inventing event dates or metrics',config.includes('export const JYC_PUBLIC_ACTIVITIES=')&&config.includes("title:'Workshops'")&&config.includes("title:'Competitions'")&&!home.includes('registrationUrl:"https://example.com')],
];
let failed=0;
for(const [name,ok] of checks){console.log((ok?'PASS: ':'FAIL: ')+name);if(!ok)failed++}
if(failed)process.exit(1);
console.log('Reference archive readiness QA: '+(checks.length-failed)+'/'+checks.length+' checks passed.');
