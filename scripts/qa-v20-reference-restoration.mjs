import fs from 'node:fs';
import assert from 'node:assert/strict';

const main=fs.readFileSync('src/main.jsx','utf8');
const css=fs.readFileSync('src/styles/v20-reference-restoration.css','utf8');
const gallery=fs.readFileSync('src/jyc57-experience.jsx','utf8');
const fallback=fs.readFileSync('src/content/jyc-public-fallbacks.js','utf8');
const browser=fs.readFileSync('scripts/browser-smoke.spec.js','utf8');

assert.ok(main.includes("import './styles/v20-reference-restoration.css';"), 'V20 restoration stylesheet must load after the existing design system');
for (const token of ['--jyc20-paper: #f4ead5','--jyc20-paper-2: #fbf4e3','--jyc20-ink: #211a13','--jyc20-brass: #9a7038','--jyc20-brass-2: #c29a59']) {
  assert.ok(css.includes(token), `V20 approved palette token missing: ${token}`);
}
assert.ok(css.includes('radial-gradient(circle at 52% 35%') || css.includes('radial-gradient(circle at 74% 42%'), 'warm editorial radial backdrop must be present');
assert.ok(css.includes('.jh-photo-story-grid.has-three .jh-story-card-1') && css.includes('grid-row: 1 / span 2'), 'homepage photos must form a deliberate lead/supporting collage');
assert.ok(css.includes('.jyc57-masonry > .jyc57-photo') && css.includes('object-fit: cover'), 'archive photos must fill consistent crop frames');
assert.ok(css.includes('@media (max-width: 760px)') && css.includes('@media (prefers-reduced-motion:reduce)'), 'responsive and reduced-motion contracts must be present');
assert.ok(css.includes('.team-photo-editorial img') && css.includes('.event-detail-poster-image-wrap img'), 'team and event image framing must be explicitly styled');
assert.ok(gallery.includes('className="jyc57-masonry"') && gallery.includes('className={`jyc57-photo photo-'), 'gallery uses the expected responsive collage components');
assert.ok(main.includes('event-jai-registration-closed') && main.includes('regOpen&&registrationTarget'), 'expired JAI registration must not expose an active QR/link');
assert.ok(fallback.includes("registrationDeadline:'2026-10-10T23:59:00+05:30'"), 'JAI fallback must retain the verified deadline');
assert.ok(gallery.includes('jyc-memory-cover-fallback') && gallery.includes('cover unavailable'), 'album cards must retain a designed fallback when cover and logo assets fail');
assert.ok(css.includes('.team-hero-panel h1 em') && css.includes('-webkit-text-fill-color: #8d642f !important'), 'team hero accent must remain readable on the light paper theme');
assert.ok(css.includes('.jyc-memories-grid .jyc-memory-title') && css.includes('color: #fff9eb !important'), 'gallery album titles must have high contrast over the photo scrim');
assert.ok(css.includes('.jyc-brand-editorial-mark') && css.includes('linear-gradient(145deg,#fff9eb,#f4ead5)'), 'About identity panel must use the warm V20 brand surface rather than an empty black slab');
assert.ok(css.includes('.clubs-page-v41 .club-card-v41 .card-body h3') && css.includes('color: #211a13 !important'), 'club-card headings must stay dark on the light content plane');
assert.ok(css.includes('.contact-page .contact-card p') && css.includes('height: auto !important') && css.includes('min-height: 0 !important'), 'contact cards must size to their content instead of reserving blank height');


assert.ok(browser.includes('JAI event does not advertise an expired registration QR as open'), 'browser regression for expired registration must exist');

console.log('PASS: V20 palette, photo framing, responsive motion and expired registration contracts');
