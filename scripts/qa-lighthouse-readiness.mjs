import assert from 'node:assert/strict';
import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync(new URL('../.lighthouserc.json', import.meta.url), 'utf8'));
const pattern = config.ci?.collect?.startServerReadyPattern;
assert.equal(typeof pattern, 'string', 'Lighthouse CI must define a server readiness pattern');
assert.ok(pattern.length > 0, 'Lighthouse CI server readiness pattern must not be empty');

// Vite 8 wraps "Local" and its following colon in ANSI reset sequences.
// Match the same-line banner through its colon without stripping ANSI output.
const vitePreviewOutput = '\u001b[32m➜\u001b[39m  \u001b[1mLocal\u001b[22m:   \u001b[36mhttp://127.0.0.1:\u001b[1m4173\u001b[22m/\u001b[39m';
assert.match(
  vitePreviewOutput,
  new RegExp(pattern, 'i'),
  `Lighthouse readiness pattern /${pattern}/i must match the observed Vite preview banner`,
);

const incompleteBanner = '\u001b[1mLocal\u001b[22m server starting';
assert.doesNotMatch(
  incompleteBanner,
  new RegExp(pattern, 'i'),
  'Lighthouse readiness must not match the word Local without the banner delimiter',
);

console.log('PASS: Lighthouse server readiness pattern matches the observed ANSI-colored Vite preview banner.');
