import fs from 'node:fs';
import assert from 'node:assert/strict';

const entry = fs.readFileSync('src/styles/public-entry.css', 'utf8');
const main = fs.readFileSync('src/main.jsx', 'utf8');
const layer = fs.readFileSync('src/styles/jyc-editorial-motion-system.css', 'utf8');
const home = fs.readFileSync('src/jyc-editorial-home.jsx', 'utf8');
const bot = fs.readFileSync('src/jyc-bot.jsx', 'utf8');
const designSystem = fs.readFileSync('src/styles/jyc-design-system.css', 'utf8');
\nconst checks = [
  [bot.includes('window.setTimeout') && bot.includes('14000+Math.floor(Math.random()*9000)'), 'Falcon idle behavior uses bounded delayed scheduling rather than a perpetual interval'],
  [bot.includes("document.addEventListener('visibilitychange',onVisibilityChange)") && bot.includes("document.removeEventListener('visibilitychange',onVisibilityChange)"), 'Falcon idle scheduling pauses and cleans up on page visibility changes'],
  [bot.includes('[assistantOpen,loc.pathname]') && bot.includes('window.clearTimeout(idleTimer.current)'), 'Falcon idle behavior is cancelled when the assistant opens or route changes'],
  [bot.includes('window.clearTimeout(idleTimer.current)') && !bot.includes('window.clearInterval(idleTimer.current)'), 'Falcon timeout lifecycle uses timeout cleanup consistently'],
  [bot.includes("{intent:'peek',weight:4}") && !bot.includes("const animPool=['wave','dance','bounce','tap','celebrate','peek','think']"), 'Falcon idle behavior uses restrained weighted choices and excludes surprise dance/celebration'],
  [home.includes("import './jyc-editorial-home.css';") && home.includes("import './styles/jyc-editorial-motion-system.css';") && home.indexOf("import './styles/jyc-editorial-motion-system.css';") > home.indexOf("import './jyc-editorial-home.css';"), 'motion layer is loaded after the editorial home stylesheet'],
  [home.includes('jh-hero-dither-visual') && home.includes('LazyDitherVeil'), 'existing branded Dither Veil hero is retained'],
  [layer.includes('@media(max-width:700px)'), 'single-column mobile hero is explicitly supported'],
  [layer.includes('@media(max-width:980px)'), 'tablet hero layout is explicitly supported'],
  [layer.includes('prefers-reduced-motion:reduce'), 'reduced-motion preferences are honored'],
  [layer.includes(':focus-visible'), 'visible keyboard focus is defined'],
  [layer.includes('--jyc-oxblood') && layer.includes('--jyc-champagne'), 'JYC identity tokens are defined'],
  [layer.includes('.jh-overline{color:var(--jh-muted,var(--jyc-muted-ink));font-size:12px;letter-spacing:.16em}'), 'hero eyebrow text stays at the 12px minimum readable type size'],
  [(() => { const mobile = layer.slice(layer.lastIndexOf('/* The campus identifier is meaningful content')); return mobile.includes('font-size: 12px !important;') && mobile.includes('line-height: 1.35 !important;') && !mobile.includes('font-size: 9px !important;'); })(), 'final mobile hero overline override remains readable at 12px'],
  [layer.includes('translateY(-3px)') && layer.includes('hover:hover'), 'card motion is restricted to fine pointers'],
  [designSystem.includes('--jyc-paper: var(--jyc-brand-paper)') && designSystem.includes('--jyc-oxblood: var(--jyc-brand-oxblood)') && designSystem.includes('--jyc-champagne: var(--jyc-brand-champagne)'), 'legacy public surfaces resolve through canonical JYC brand tokens'],
  [designSystem.includes('--color-canvas: #f5f1e8') && designSystem.includes('--color-surface: #fffdf8') && designSystem.includes('--color-text: #211d22'), 'semantic light-theme canvas, surface and text tokens are explicit'],
  [designSystem.includes('--color-brand: #8f211f') && designSystem.includes('--color-brand-hover: #741b19') && designSystem.includes('--color-accent: #b99b70'), 'semantic brand and accent tokens use the approved JYC editorial direction'],
  [designSystem.includes('html[data-theme="dark"]') && designSystem.includes('--color-canvas: #141216') && designSystem.includes('--color-text: #f8f1e7'), 'dark theme overrides the semantic palette rather than a parallel token set'],
  [designSystem.includes('--color-focus: #725027') && designSystem.includes('--color-success: #176443') && designSystem.includes('--color-warning: #805000') && designSystem.includes('--color-error: #a51d24'), 'focus and status colors have explicit semantic tokens'],
  [designSystem.includes('--color-surface-raised: #ffffff') && designSystem.includes('--jyc-brand-paper-raised: var(--color-surface-raised)'), 'raised public surfaces use the dedicated semantic raised-surface token'],
  [designSystem.includes('outline: 3px solid var(--color-focus)') && designSystem.includes('outline-offset: 3px'), 'keyboard focus uses the semantic focus color rather than the decorative accent'],

  [designSystem.includes('--jyc-brand-paper: var(--color-canvas)') && designSystem.includes('--jyc-brand-oxblood: var(--color-brand)') && designSystem.includes('--jyc-brand-champagne: var(--color-accent)'), 'legacy brand tokens are aliases of semantic source-of-truth values'],

  [designSystem.includes('html[data-theme="dark"]') && designSystem.includes('--jyc-muted-ink: var(--jyc-brand-muted)'), 'canonical design tokens remain theme-aware'],
  [designSystem.includes('--jyc-reading-width: 68ch') && designSystem.includes('--jyc-page-gutter: clamp(16px, 4vw, 64px)'), 'reading measure and responsive page gutters are centralized'],
  [designSystem.includes('outline: 3px solid var(--jyc-brand-champagne)') && designSystem.includes('outline-offset: 3px'), 'the final shared design layer preserves visible keyboard focus'],
  [designSystem.includes('@media (max-width: 420px)') && designSystem.includes('overflow-wrap: anywhere'), 'narrow mobile layouts handle long headings without forcing overflow'],
  [designSystem.includes('@media (prefers-reduced-motion: reduce)') && designSystem.includes('transition-delay: 0ms !important'), 'the final shared design layer honors reduced-motion preferences'],

];
for (const [ok, name] of checks) { console.log((ok ? 'PASS: ' : 'FAIL: ') + name); assert.ok(ok, name); }
console.log('JYC editorial motion system contract: PASS');