import fs from 'node:fs';
import assert from 'node:assert/strict';

const entry = fs.readFileSync('src/styles/public-entry.css', 'utf8');
const palette = fs.readFileSync('src/styles/jyc-color-system-v1.css', 'utf8');
const checks = [
  [entry.includes("@import './jyc-color-system-v1.css';"), 'authoritative colour system is imported after legacy CSS'],
  [palette.includes('--jyc-color-primary: #2855D9') && palette.includes('--jyc-color-secondary: #E65D4F'), 'cobalt primary and controlled coral secondary tokens exist'],
  [palette.includes('--jyc-color-bg: #F3F6FC') && palette.includes('--jyc-color-ink: #14203A'), 'light theme uses cool surfaces and deep navy text'],
  [palette.includes('--jyc-color-bg: #0C1222') && palette.includes('--jyc-color-primary: #86A7FF'), 'dark theme uses a distinct navy palette'],
  [palette.includes('--jyc-color-focus: #D5E76D') && palette.includes('outline: 3px solid var(--jyc-color-focus)'), 'focus indicator is tokenized'],
  [palette.includes('--jyc-color-success') && palette.includes('--jyc-color-warning') && palette.includes('--jyc-color-danger') && palette.includes('--jyc-color-info'), 'semantic feedback tokens exist'],
  [palette.includes('--jyc-final-bg: var(--jyc-color-bg)') && palette.includes('--tech-bg: var(--jyc-color-bg)'), 'existing token families map to the new palette'],
  [palette.includes('prefers-reduced-motion: reduce') && palette.includes('forced-colors: active'), 'reduced-motion and forced-colour safeguards remain'],
  [palette.includes('Event posters and approved documentary photography retain their original colours'), 'brand photography and poster art are explicitly protected'],
];
for (const [ok, name] of checks) { console.log((ok ? 'PASS: ' : 'FAIL: ') + name); assert.ok(ok, name); }
console.log('JYC colour-system contract: PASS');
