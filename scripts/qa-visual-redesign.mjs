import fs from 'node:fs';
import assert from 'node:assert/strict';

const entry = fs.readFileSync('src/styles/public-entry.css', 'utf8');
const main = fs.readFileSync('src/main.jsx', 'utf8');
const layer = fs.readFileSync('src/styles/jyc-editorial-motion-system.css', 'utf8');
const home = fs.readFileSync('src/jyc-editorial-home.jsx', 'utf8');
const homeCss = fs.readFileSync('src/jyc-editorial-home.css', 'utf8');
const homeMobile = homeCss.slice(homeCss.indexOf('/* Responsive mobile composition:'), homeCss.indexOf('/* Exact browser-matrix regression fix:'));
const dither = fs.readFileSync('src/react-bits/DitherVeil.jsx', 'utf8');
const bot = fs.readFileSync('src/jyc-bot.jsx', 'utf8');
const theme = fs.readFileSync('src/jyc-logo-final-theme.css', 'utf8');
const sharedHeadingRules = theme.slice(theme.indexOf('.public-app .section-head,'), theme.indexOf('.public-app .card-grid,'));
const sharedGridRules = theme.slice(theme.indexOf('.public-app .card-grid,'), theme.indexOf('.public-app .card,'));
const themeBase = theme.split('/* V56.15.2 visual resilience:')[0];
const sharedCardSurfaceRules = theme.slice(theme.indexOf('.public-app .card,\n'), theme.indexOf('html[data-theme="dark"] .public-app .card,'));
const designSystem = fs.readFileSync('src/styles/jyc-design-system.css', 'utf8');

const checks = [
  [bot.includes('window.setTimeout') && bot.includes('14000+Math.floor(Math.random()*9000)'), 'Falcon idle behavior uses bounded delayed scheduling rather than a perpetual interval'],
  [bot.includes("document.addEventListener('visibilitychange',onVisibilityChange)") && bot.includes("document.removeEventListener('visibilitychange',onVisibilityChange)"), 'Falcon idle scheduling pauses and cleans up on page visibility changes'],
  [bot.includes('[assistantOpen,loc.pathname]') && bot.includes('window.clearTimeout(idleTimer.current)'), 'Falcon idle behavior is cancelled when the assistant opens or route changes'],
  [bot.includes('window.clearTimeout(idleTimer.current)') && !bot.includes('window.clearInterval(idleTimer.current)'), 'Falcon timeout lifecycle uses timeout cleanup consistently'],
  [bot.includes("{intent:'peek',weight:4}") && !bot.includes("const animPool=['wave','dance','bounce','tap','celebrate','peek','think']"), 'Falcon idle behavior uses restrained weighted choices and excludes surprise dance/celebration'],
  [!sharedHeadingRules.includes('justify-items:center!important') && !sharedHeadingRules.includes('text-align:center!important'), 'shared public section headings do not receive blanket forced centering'],
  [!sharedGridRules.includes('justify-content:center!important'), 'shared public grids do not receive blanket forced centering'],
  [themeBase.includes('--jyc-shadow:0 8px 24px') && themeBase.includes('--jyc-shadow-dark:0 12px 32px'), 'shared card elevation uses restrained shadows instead of oversized global shadows'],
  [sharedCardSurfaceRules.includes('background:var(--jyc-surface)!important;') && !sharedCardSurfaceRules.includes('linear-gradient(145deg'), 'shared public cards use clean surfaces instead of a repeated brass gradient'],
  [home.includes("import './jyc-editorial-home.css';") && home.includes("import './styles/jyc-editorial-motion-system.css';") && home.indexOf("import './styles/jyc-editorial-motion-system.css';") > home.indexOf("import './jyc-editorial-home.css';"), 'motion layer is loaded after the editorial home stylesheet'],
  [home.includes('jh-hero-dither-visual') && home.includes('LazyDitherVeil'), 'existing branded Dither Veil hero is retained'],
  [home.includes('enableMagnetism={false} enableTilt={false} enableStars={false} enableSpotlight={true} enableBorderGlow={false} clickEffect={false} particleCount={0}'), 'Magic Bento uses a single restrained spotlight interaction'],
  [dither.includes("addEventListener('webglcontextlost', handleContextLost, false)") && dither.includes("removeEventListener('webglcontextlost', handleContextLost, false)") && dither.includes("container.dataset.static = '1'"), 'Dither Veil falls back to the static logo when WebGL context is lost'],
  [dither.includes("document.addEventListener('visibilitychange', handleDocumentVisibility)") && dither.includes("document.removeEventListener('visibilitychange', handleDocumentVisibility)") && dither.includes('if (raf || !visible || document.hidden) return;'), 'Dither Veil pauses RAF while the document is hidden and resumes safely when visible'],
  [!homeCss.includes('.jh-ambient-orb') && !homeCss.includes('.jh-ambient-backdrop') && !homeCss.includes('@keyframes jh-float-1') && !homeCss.includes('@keyframes jh-float-2') && !homeCss.includes('background-image: radial-gradient(ellipse at 88% 4%'), 'unused ambient orb CSS, perpetual keyframes and residual ambient gradient are removed from the homepage'],
  [homeMobile.includes('font-size: 12px !important;') && homeMobile.includes('font-size: 15px !important;') && homeMobile.includes('clamp(36px, 9vw, 48px)') && homeMobile.includes('width: min(100%, 240px) !important;') && !homeMobile.includes('font-size: 8px !important;') && !homeMobile.includes('font-size: 7px !important;') && !homeCss.includes('jh-hero-actions .jh-btn:nth-child(3)'), 'mobile hero preserves readable type, a recognisable logo plaque and two-action layout'],
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
  [designSystem.includes('outline: 3px solid var(--color-focus)') && designSystem.includes('outline-offset: 3px'), 'the final shared design layer preserves visible keyboard focus'],
  [designSystem.includes('@media (max-width: 420px)') && designSystem.includes('overflow-wrap: anywhere'), 'narrow mobile layouts handle long headings without forcing overflow'],
  [designSystem.includes('@media (prefers-reduced-motion: reduce)') && designSystem.includes('transition-delay: 0ms !important'), 'the final shared design layer honors reduced-motion preferences'],

];
for (const [ok, name] of checks) { console.log((ok ? 'PASS: ' : 'FAIL: ') + name); assert.ok(ok, name); }
console.log('JYC editorial motion system contract: PASS');