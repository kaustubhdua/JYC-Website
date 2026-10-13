import fs from 'node:fs';
import assert from 'node:assert/strict';

const entry = fs.readFileSync('src/styles/public-entry.css', 'utf8');
const visual = fs.readFileSync('src/styles/jyc-visual-quality.css', 'utf8');
const experience = fs.readFileSync('src/jyc57-experience.jsx', 'utf8');
const home = fs.readFileSync('src/jyc-editorial-home.css', 'utf8');
const homeComponent = fs.readFileSync('src/jyc-editorial-home.jsx', 'utf8');

const importIndex = entry.indexOf("@import './jyc-visual-quality.css';");
const firstRuleIndex = entry.indexOf('.public-app :where');
assert.ok(importIndex >= 0 && firstRuleIndex >= 0 && importIndex < firstRuleIndex,
  'visual quality stylesheet must be imported before public-entry rules');
assert.ok(visual.includes('--jyc-font-display') && visual.includes('--jyc-font-body'),
  'shared typography tokens must be defined');
assert.ok(visual.includes('.jyc-best-of-page .jyc57-featured-grid') &&
  visual.includes('grid-row: span 2') && visual.includes('@media (max-width: 620px)'),
  'Best of JYC collage must have desktop and mobile compositions');
assert.ok(visual.includes('@media (prefers-reduced-motion:reduce)'),
  'photo collage motion must respect reduced-motion preferences');
assert.ok(experience.includes('fallbackSrc="/assets/photo-unavailable.svg"') &&
  experience.includes('fallbackAlt="Photograph unavailable"'),
  'gallery and Best of JYC photos must use a non-logo unavailable-photo fallback');
assert.ok(visual.includes('.event-identity-page') && visual.includes('--event-accent: var(--hub-accent'),
  'published event identities must receive scoped visual accents rather than a global fest skin');
assert.ok(home.includes('.jh-photo-story-grid.has-three') &&
  home.includes('.jh-story-card-1') && home.includes('@media (max-width: 680px)'),
  'homepage editorial photo collage must retain responsive art direction');
assert.ok(homeComponent.includes("nav('/gallery?q=' + encodeURIComponent(story.association || story.caption || ''))"),
  'homepage photo stories must deep-link to their matching filtered gallery results');
assert.ok(experience.includes('across {clubs.length} published communities'),
  'club directory count must be derived from the current published list');

console.log('Visual quality contract: PASS (type, collage, reduced motion, image fallback, live counts)');
