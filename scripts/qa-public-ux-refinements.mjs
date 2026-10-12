import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=path=>fs.readFileSync(path,'utf8');
const css=read('src/jyc-design-upgrades.css');
const main=read('src/main.jsx');
const publicEntry=read('src/styles/public-entry.css');
const registration=read('src/extra-features.jsx');
const home=read('src/jyc-editorial-home.css');
const gallery=read('src/jyc57-experience.jsx');
const flip=read('src/components/react-bits/FlipCard.jsx');
const checks=[
  ['public UX refinement stylesheet is loaded by the application entry',main.includes("import './styles/public-entry.css';")&&publicEntry.includes("@import '../jyc-design-upgrades.css';")],
  ['refinement layer preserves responsive gallery filter grouping',css.includes('.jyc57-filterbar')&&css.includes('@media (max-width: 620px)')],
  ['gallery lightbox has narrow viewport and safe-area treatment',css.includes('.jyc57-lightbox-inner')&&css.includes('100dvh')&&css.includes('env(safe-area-inset-top)')],
  ['gallery controls have explicit keyboard focus styling',css.includes('.jyc57-photo:focus-visible')&&css.includes('outline: 3px solid var(--jyc-ux-focus)')],
  ['gallery action controls meet touch-target sizing',css.includes('.jyc57-lightbox-actions button')&&css.includes('--jyc-ux-tap: 48px')],
  ['team card content has long-name and copy overflow safeguards',css.includes('.team-member-name')&&css.includes('overflow-wrap: anywhere')&&flip.includes('aria-hidden={flipped}')&&flip.includes('aria-live="polite"')&&flip.includes("e.key === 'Escape'")],
  ['registration and public form controls receive mobile tap-target styles',css.includes('.btn')&&css.includes('min-height: 48px')&&registration.includes('Open official registration ↗')&&registration.includes('target="_blank" rel="noopener noreferrer"')],
  ['homepage hero keeps copy and visual columns from overflowing',css.includes('.jh-hero-copy')&&css.includes('.jh-hero-visual')&&home.includes('.jh-hero')],
  ['coarse-pointer interactions do not depend on hover transforms',css.includes('@media (hover: none), (pointer: coarse)')&&css.includes('.jh-story-card:hover')],
  ['reduced-motion preference disables decorative transitions',css.includes('@media (prefers-reduced-motion: reduce)')&&css.includes('transition-duration: 0.01ms')],
  ['gallery already exposes keyboard/touch navigation controls',gallery.includes('aria-label="Previous photo"')&&gallery.includes('onTouchStart=')&&gallery.includes('onTouchEnd=')],
  ['reduced motion disables team flip animation without disabling the flipped state',css.includes('.team-member-flip .flip-card__inner{transition:none!important}')&&!css.split('\n').some(line=>line.includes('prefers-reduced-motion:reduce')&&line.includes('.team-member-flip .flip-card__inner')&&line.includes('transform:none!important'))],
  ['no curated project or achievement spotlight feature was added',!css.includes('project-spotlight')&&!css.includes('achievement-spotlight')]
];
for(const [name,ok] of checks){
  console.log(`${ok?'PASS':'FAIL'}: ${name}`);
  assert.ok(ok,name);
}
console.log(`PUBLIC UX REFINEMENTS QA PASS (${checks.length} checks)`);
