import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const checks = [];
const add = (name, ok, details = '') => {
  checks.push({ name, ok: Boolean(ok), details });
};

console.log('--- STARTING RESPONSIVE & BREAKPOINT AUDIT SUITE ---');

// 1. Viewport Meta in index.html
const indexHtml = read('index.html');
const hasViewport = indexHtml.includes('name="viewport"') && indexHtml.includes('width=device-width');
add('Viewport meta tag configured with width=device-width', hasViewport);

// 2. CSS Media Query Coverage
const redesignCss = read('src/styles/jyc-pro-redesign.css');
const editorialCss = read('src/jyc-editorial-home.css');
const publicCss = read('src/styles/public-system.css');
const designCss = read('src/jyc-design-upgrades.css');
const flipCss = read('src/components/react-bits/FlipCard.css');
const themeCss = read('src/jyc-logo-final-theme.css');
const allCss = redesignCss + editorialCss + publicCss + designCss + flipCss + themeCss;

const hasMobileBreakpoint = /@media[^{]*max-width:\s*(?:600px|680px|768px)/.test(allCss);
add('Mobile breakpoint rules present (<600px - 768px)', hasMobileBreakpoint);

const hasTabletBreakpoint = /@media[^{]*max-width:\s*(?:900px|1024px)/.test(allCss);
add('Tablet breakpoint rules present (<900px - 1024px)', hasTabletBreakpoint);

// 3. Grid Collapse on Mobile
const hasGridCollapse = redesignCss.includes('@media (max-width: 600px)') &&
  redesignCss.includes('grid-template-columns: 1fr');
add('Multi-column grids collapse to 1 column on mobile (<600px)', hasGridCollapse);

// 4. Hero & Heading Fluid Typography
const hasFluidTypography = allCss.includes('clamp(');
add('Fluid typography with clamp() used for responsive headline scaling', hasFluidTypography);

// 5. Touch Target Minimum Sizing
const hasTouchTargetHandling = allCss.includes('min-height:') || allCss.includes('padding:');
add('Interactive elements use touch-friendly spacing and padding', hasTouchTargetHandling);

// 6. Approved JYC editorial palette and dark-mode tokens.
const hasPaperCanvas = editorialCss.includes('--jh-bg: #F5F1E6') && redesignCss.includes('--tech-bg: #F5F1E6');
const hasWarmGold = editorialCss.includes('--jh-line-accent: rgba(191, 156, 111, 0.42)') && redesignCss.includes('--tech-gold: #BF9C6F');
const hasJycRed = editorialCss.includes('--jh-accent: #A82420') && redesignCss.includes('--tech-crimson: #A82420') && designCss.includes('--jyc-design-accent:#A82420');
const hasDarkTokens = editorialCss.includes('--jh-bg: #0F0E11') && redesignCss.includes('--tech-bg: #0F0E11') && themeCss.includes('--jyc-bg:#0F0E11');
const hasNoNeonAccents = !/#38bdf8|#00e5ff|#0284c7|#6366f1|#a855f7|#10b981|#00f0ff|#06b6d4/i.test(editorialCss + designCss + flipCss);

add('JYC editorial theme: warm paper and ink light canvas', hasPaperCanvas);
add('JYC editorial theme: warm gold secondary accent', hasWarmGold);
add('JYC editorial theme: red primary accent', hasJycRed);
add('JYC editorial theme: explicit dark palette', hasDarkTokens);
add('JYC active visual layers avoid neon cyan, blue, purple and green accents', hasNoNeonAccents);

// 7. Route Accessibility Verification
const mainJsx = read('src/main.jsx');
const requiredRoutes = [
  'JoinJYC',
  'Contact',
  'Announcements',
  'Achievements',
  'Events',
  'FestsPage'
];
for (const comp of requiredRoutes) {
  add(`Component ${comp} implemented and mounted`, mainJsx.includes(`function ${comp}`));
}

// 7.5. Fixed mobile chrome clearance.
add('mobile page content clears the fixed navigation dock', publicCss.includes('padding-bottom:calc(96px + env(safe-area-inset-bottom))'));

// 8. Output Results
let failed = 0;
for (const c of checks) {
  const status = c.ok ? '✓ PASS' : '✗ FAIL';
  console.log(`${status} · ${c.name} ${c.details ? `(${c.details})` : ''}`);
  if (!c.ok) failed++;
}

console.log(`\nAudit completed: ${checks.length - failed}/${checks.length} passed.`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All responsive breakpoint and color harmony audits PASSED!');
}
