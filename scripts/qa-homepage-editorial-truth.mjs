import fs from 'node:fs';
import assert from 'node:assert/strict';

const home = fs.readFileSync('src/jyc-editorial-home.jsx', 'utf8');
const css = fs.readFileSync('src/jyc-editorial-home.css', 'utf8');

assert.match(home, /Find your people\.[\s\S]*?Make your mark\./i, 'homepage headline must have a clear student benefit');
assert.match(home, /JYC helps you find the people and experiences/i, 'homepage lead must explain JYC in plain language');
assert.doesNotMatch(home, /new Date\(['"]2026-11-15T09:00:00/, 'homepage must not hard-code an unverified countdown date');
assert.doesNotMatch(home, /jh-flagship-countdown-strip|jh-countdown-timer/, 'homepage must not present an unverified flagship countdown');
assert.doesNotMatch(home, /Fortissmo|OSDC|Knuth|uCR|Jhankaar|Crescendo/, 'homepage activity pillars must not name unregistered legacy clubs or misspell a published club');
assert.doesNotMatch(home, /5,000<i>\+<\/i>|50<i>\+<\/i>|15<i>\+<\/i>/, 'homepage must not publish unverified reach, event or legacy counters');
assert.doesNotMatch(home, /jh-ambient-backdrop|jh-ambient-orb/, 'homepage must not use generic ambient cyber decoration');
assert.match(home, /rimColor="#a82420"/i, 'Dither Veil rim must use JYC red rather than cyan');
assert.match(css, /--jh-bg:\s*#F5F1E6/i, 'homepage background token must use the editorial paper palette');
assert.match(css, /--jh-accent:\s*#A82420/i, 'homepage accent must use JYC red');
assert.match(css, /prefers-reduced-motion:\s*reduce/, 'homepage motion must respect reduced-motion preferences');

console.log('JYC homepage editorial-truth contract: PASS');
