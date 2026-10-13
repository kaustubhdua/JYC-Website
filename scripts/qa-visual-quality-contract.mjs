import fs from 'node:fs';
import assert from 'node:assert/strict';

const entry = fs.readFileSync('src/styles/public-entry.css', 'utf8');
const visual = fs.readFileSync('src/styles/jyc-visual-quality.css', 'utf8');
const experience = fs.readFileSync('src/jyc57-experience.jsx', 'utf8');
const home = fs.readFileSync('src/jyc-editorial-home.css', 'utf8');
const homeComponent = fs.readFileSync('src/jyc-editorial-home.jsx', 'utf8');
const main = fs.readFileSync('src/main.jsx', 'utf8');

const importIndex = entry.indexOf("@import './jyc-visual-quality.css';");
const firstRuleIndex = entry.indexOf('.public-app :where');
assert.ok(importIndex >= 0 && firstRuleIndex >= 0 && importIndex < firstRuleIndex,
  'visual quality stylesheet must be imported before public-entry rules');
assert.ok(visual.includes('--jyc-font-display') && visual.includes('--jyc-font-body'),
  'shared typography tokens must be defined');
assert.ok(visual.includes('.jyc57-masonry > .jyc57-photo:nth-child(8n+1)') && visual.includes('grid-template-columns: repeat(12, minmax(0, 1fr)) !important') && visual.includes('grid-auto-rows: clamp(28px, 8.5vw, 38px) !important'), 'gallery archive must use varied responsive collage spans');
assert.ok(visual.includes('.jyc57-masonry > .jyc57-photo:hover img') && visual.includes('@media (prefers-reduced-motion:reduce)'), 'gallery hover motion must be capability-gated and reduced-motion-safe');
assert.ok(visual.includes('.jyc-best-of-page .jyc57-featured-grid') &&
  visual.includes('grid-row: span 2') && visual.includes('@media (max-width: 620px)'),
  'Best of JYC collage must have desktop and mobile compositions');
assert.ok(visual.includes('@media (prefers-reduced-motion:reduce)'),
  'photo collage motion must respect reduced-motion preferences');
assert.ok(fs.readFileSync('src/jyc-responsive-photo.jsx', 'utf8').includes("fallbackSrc=PHOTO_FALLBACK,fallbackAlt='Photograph unavailable'") &&
  fs.readFileSync('src/jyc-responsive-photo.jsx', 'utf8').includes('const candidatePool=preferOriginal?[source,normalizedFallbackSrc]:[normalizedFallbackSrc];'),
  'generic photo failures must never silently fall back to the JYC logo');
assert.ok(experience.includes('fallbackSrc="/assets/photo-unavailable.svg"') &&
  experience.includes('fallbackAlt="Photograph unavailable"'),
  'gallery and Best of JYC photos must use a non-logo unavailable-photo fallback');
assert.ok(visual.includes('.event-identity-page') && visual.includes('--event-accent: var(--hub-accent'),
  'published event identities must receive scoped visual accents rather than a global fest skin');

assert.ok(entry.includes('.fests-page .compact-page-head') && entry.includes('.fests-social-rail'), 
  'flagship fests must have a scoped responsive art direction');
assert.ok(main.includes("['/best-of-jyc','Best of JYC','A curated visual selection of published JYC moments']") &&
  main.includes("['/achievements','Achievements','Source-backed milestones and community outcomes']"),
  'More sheet must surface editorial routes');
assert.ok(main.includes("['Best of JYC','Curated published JYC photography and memories.','PAGE','/best-of-jyc']") &&
  main.includes("['Achievements','Source-backed JYC milestones and community outcomes.','PAGE','/achievements']"),
  'Global search must surface editorial routes');
assert.ok(home.includes('.jh-photo-story-grid.has-three') &&
  home.includes('.jh-story-card-1') && home.includes('@media (max-width: 680px)'),
  'homepage editorial photo collage must retain responsive art direction');
assert.ok(homeComponent.includes("nav('/gallery?q=' + encodeURIComponent(story.association || story.caption || ''))"),
  'homepage photo stories must deep-link to their matching filtered gallery results');
assert.ok(experience.includes('across {clubs.length} published communities'),
  'club directory count must be derived from the current published list');

assert.ok(!main.includes('Alert Registered — We will remind you!') &&
  !main.includes('Notify Me When Recruitment Opens') &&
  !main.includes('Explore All 23 Communities') &&
  !main.includes('23 named communities'),
  'public copy must not claim unimplemented notifications or stale fixed community counts');
assert.ok(main.includes('function parseEventMoment(date,time,fallback=') &&
  main.includes('const deadlineAllowsRegistration=!deadlineRaw||(Number.isFinite(deadlineMs)&&deadlineMs>Date.now())') &&
  experience.includes('const eventMoment=') && experience.includes('const safeDate=(e)=>{const t=eventMoment'),
  'event sorting and registration availability must use normalized date/time parsing');
assert.ok(main.includes('deadlineMs>Date.now()') &&
  main.includes("e.publicStatus==='planned'&&e.registrationVerified!==true"),
  'announcement registration notices must exclude expired or unverified planned events');

console.log('Visual quality contract: PASS (type, collage, reduced motion, image fallback, live counts)');
