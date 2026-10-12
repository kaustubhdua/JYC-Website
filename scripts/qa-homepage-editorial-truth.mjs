import fs from 'node:fs';
import assert from 'node:assert/strict';

const home = fs.readFileSync('src/jyc-editorial-home.jsx', 'utf8');
const css = fs.readFileSync('src/jyc-editorial-home.css', 'utf8');

assert.match(home, /FIND YOUR[\s\S]*?PEOPLE\.[\s\S]*?MAKE YOUR MARK\./, 'homepage must use the new editorial headline');
assert.match(home, /From ideas taking shape in a workshop[\s\S]*?campus life matter\./, 'homepage lead must explain JYC in human, specific language');
assert.doesNotMatch(home, /new Date\('2026-11-15T09:00:00/, 'homepage must not hard-code an unverified countdown date');
assert.doesNotMatch(home, /jh-flagship-countdown-strip|jh-countdown-timer/, 'homepage must not present an unverified flagship countdown');
assert.doesNotMatch(home, /5,000<i>\+<\/i>|50<i>\+<\/i>|15<i>\+<\/i>/, 'homepage must not publish unverified reach, event or legacy counters');
assert.doesNotMatch(home, /jh-ambient-backdrop|jh-ambient-orb/, 'homepage must not use generic ambient cyber decoration');
assert.match(home, /inkColor="#2b1d1b"/, 'Dither Veil ink must fit the warm editorial palette');
assert.match(home, /paperColor="#f8f0e4"/, 'Dither Veil paper must fit the warm editorial palette');
assert.match(home, /rimColor="#b33a32"/, 'Dither Veil rim must use JYC red rather than cyan');
assert.match(css, /--jh-bg:\s*#f7f1e7/i, 'homepage background token must be warm editorial paper');
assert.match(css, /--jh-accent:\s*#a7352e/i, 'homepage accent must use JYC red');
assert.match(css, /prefers-reduced-motion:\s*reduce/, 'homepage motion must respect reduced-motion preferences');

console.log('JYC homepage editorial-truth contract: PASS');
