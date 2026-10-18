import fs from 'node:fs';
import assert from 'node:assert/strict';

const entry = fs.readFileSync('src/styles/public-entry.css', 'utf8');
const main = fs.readFileSync('src/main.jsx', 'utf8');
const layer = fs.readFileSync('src/styles/jyc-editorial-motion-system.css', 'utf8');
const home = fs.readFileSync('src/jyc-editorial-home.jsx', 'utf8');
const bot = fs.readFileSync('src/jyc-bot.jsx', 'utf8');
const theme = fs.readFileSync('src/jyc-logo-final-theme.css', 'utf8');
const themeBase = theme.split('/* V56.15.2 visual resilience:')[0];
const sharedHeadingRules = theme.slice(theme.indexOf('.public-app .section-head,'), theme.indexOf('.public-app .card-grid,'));
const sharedGridRules = theme.slice(theme.indexOf('.public-app .card-grid,'), theme.indexOf('.public-app .card,'));
const checks = [
  [bot.includes('window.setTimeout') && bot.includes('14000+Math.floor(Math.random()*9000)'), 'Falcon idle behavior uses bounded delayed scheduling rather than a perpetual interval'],
  [bot.includes("document.addEventListener('visibilitychange',onVisibilityChange)") && bot.includes("document.removeEventListener('visibilitychange',onVisibilityChange)"), 'Falcon idle scheduling pauses and cleans up on page visibility changes'],
  [bot.includes('[assistantOpen,loc.pathname]') && bot.includes('window.clearTimeout(idleTimer.current)'), 'Falcon idle behavior is cancelled when the assistant opens or route changes'],
  [bot.includes('window.clearTimeout(idleTimer.current)') && !bot.includes('window.clearInterval(idleTimer.current)'), 'Falcon timeout lifecycle uses timeout cleanup consistently'],
  [bot.includes("{intent:'peek',weight:4}") && !bot.includes("const animPool=['wave','dance','bounce','tap','celebrate','peek','think']"), 'Falcon idle behavior uses restrained weighted choices and excludes surprise dance/celebration'],
  [!sharedHeadingRules.includes('justify-items:center!important') && !sharedHeadingRules.includes('text-align:center!important'), 'shared public section headings do not receive blanket forced centering'],
  [!sharedGridRules.includes('justify-content:center!important'), 'shared public grids do not receive blanket forced centering'],
  [themeBase.includes('--jyc-shadow:0 8px 24px') && themeBase.includes('--jyc-shadow-dark:0 12px 32px'), 'shared card elevation uses restrained shadows instead of oversized global shadows'],
  [home.includes("import './jyc-editorial-home.css';") && home.includes("import './styles/jyc-editorial-motion-system.css';") && home.indexOf("import './styles/jyc-editorial-motion-system.css';") > home.indexOf("import './jyc-editorial-home.css';"), 'motion layer is loaded after the editorial home stylesheet'],
  [home.includes('jh-hero-dither-visual') && home.includes('LazyDitherVeil'), 'existing branded Dither Veil hero is retained'],
  [layer.includes('@media(max-width:700px)'), 'single-column mobile hero is explicitly supported'],
  [layer.includes('@media(max-width:980px)'), 'tablet hero layout is explicitly supported'],
  [layer.includes('prefers-reduced-motion:reduce'), 'reduced-motion preferences are honored'],
  [layer.includes(':focus-visible'), 'visible keyboard focus is defined'],
  [layer.includes('--jyc-oxblood') && layer.includes('--jyc-champagne'), 'JYC identity tokens are defined'],
  [layer.includes('.jh-overline{color:var(--jh-muted,var(--jyc-muted-ink));font-size:12px;letter-spacing:.16em}'), 'hero eyebrow text stays at the 12px minimum readable type size'],
  [layer.includes('translateY(-3px)') && layer.includes('hover:hover'), 'card motion is restricted to fine pointers'],
];
for (const [ok, name] of checks) { console.log((ok ? 'PASS: ' : 'FAIL: ') + name); assert.ok(ok, name); }
console.log('JYC editorial motion system contract: PASS');