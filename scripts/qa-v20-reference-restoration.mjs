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
assert.ok(fallback.includes("registrationDeadline:'2026-10-15T23:59:00+05:30'"), 'JAI fallback must retain the verified deadline');
assert.ok(browser.includes('JAI event does not advertise an expired registration QR as open'), 'browser regression for expired registration must exist');
assert.ok(main.includes("if(saved==='dark'||saved==='light')return saved;") && main.includes("return 'light';"), 'first visit must retain the approved warm V20 palette even when the OS requests dark mode');
assert.ok(css.includes('grid-auto-flow: row dense !important') && css.includes('align-content: start !important'), 'photo wall must pack variable-height frames without avoidable empty grid tracks');
assert.ok(css.includes('repeat(auto-fit, minmax(min(100%, 260px), 1fr))') && css.includes('.jyc-memory-card:focus-visible'), 'album cards must adapt to available width and remain keyboard visible');
assert.ok(gallery.includes('const registrationOpen=(e)=>') && gallery.includes('{registrationOpen(e)&&<span className="reg-badge">REGISTRATION OPEN ↗</span>}'), 'event directory must not claim registration is open after its deadline');
assert.ok(gallery.includes('const photoObjectPosition=photo=>') && gallery.includes('objectPosition={photoObjectPosition(g)}') && gallery.includes('objectPosition={photoObjectPosition(selected)}'), 'gallery and lightbox must honor reviewed photo focal points when available');
assert.ok(browser.includes('first visit keeps the V20 light palette even when OS requests dark') && browser.includes('event directory does not label JAI registration open after its deadline'), 'browser regressions must cover theme and registration status');


console.log('PASS: V20 palette, photo framing, responsive motion and expired registration contracts');
