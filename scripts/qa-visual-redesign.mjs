import fs from 'node:fs';
import assert from 'node:assert/strict';

const entry = fs.readFileSync('src/styles/public-entry.css', 'utf8');
const main = fs.readFileSync('src/main.jsx', 'utf8');
const layer = fs.readFileSync('src/styles/jyc-editorial-motion-system.css', 'utf8');
const home = fs.readFileSync('src/jyc-editorial-home.jsx', 'utf8');
const checks = [
  [home.includes("import './jyc-editorial-home.css';") && home.includes("import './styles/jyc-editorial-motion-system.css';") && home.indexOf("import './styles/jyc-editorial-motion-system.css';") > home.indexOf("import './jyc-editorial-home.css';"), 'motion layer is loaded after the editorial home stylesheet'],
  [home.includes('jh-hero-dither-visual') && home.includes('LazyDitherVeil'), 'existing branded Dither Veil hero is retained'],
  [layer.includes('@media(max-width:700px)'), 'single-column mobile hero is explicitly supported'],
  [layer.includes('@media(max-width:980px)'), 'tablet hero layout is explicitly supported'],
  [layer.includes('prefers-reduced-motion:reduce'), 'reduced-motion preferences are honored'],
  [layer.includes(':focus-visible'), 'visible keyboard focus is defined'],
  [layer.includes('--jyc-oxblood') && layer.includes('--jyc-champagne'), 'JYC identity tokens are defined'],
  [layer.includes('.jh-overline{color:var(--jh-muted,var(--jyc-muted-ink));font-size:12px;letter-spacing:.16em}'), 'hero eyebrow text stays at the 12px minimum readable type size'],
  [layer.includes('translateY(-3px)') && layer.includes('hover:hover'), 'card motion is restricted to fine pointers'],
  [!home.includes('across OSDC, Knuth, CICR, GDG & uCR') && home.includes('CICR, JODC, Dronotics and Zencoders'), 'homepage community copy uses verified JIIT-128 hub identities'],
  [/`/.test('`') && !fs.readFileSync('index.html', 'utf8').includes('<link rel="icon" href="/JYC%20Logo(4).png"') && fs.readFileSync('index.html', 'utf8').includes('<link rel="icon" type="image/webp" href="/assets/jyc-logo.webp" />'), 'browser favicon uses the optimized logo rather than the oversized original PNG'],
];
for (const [ok, name] of checks) { console.log((ok ? 'PASS: ' : 'FAIL: ') + name); assert.ok(ok, name); }
console.log('JYC editorial motion system contract: PASS');