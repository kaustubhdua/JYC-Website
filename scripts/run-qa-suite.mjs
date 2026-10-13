import { spawnSync } from 'node:child_process';

/*
 * Canonical release gate.
 *
 * Historical V1–V63 QA scripts remain in the repository as migration/reference
 * material, but they must not block the current release with retired UI
 * assumptions. Current contracts below are the release source of truth.
 */
const scripts = [
  'qa-source-media-completeness.mjs',
  'qa-source-integrity.mjs',
  'qa-hub-registry.mjs',
  'qa-resource-content-pass.mjs',
  'qa-search.mjs',
  'qa-security.mjs',
  'qa-seo.mjs',
  'qa-build-preflight.mjs',
  'qa-production.mjs',
  'qa-runtime-contract.mjs',
  'qa-functional.mjs',
  'qa-accessibility-contract.mjs',
  'qa-repo-hygiene.mjs',
  'qa-media-architecture.mjs',
  'qa-photo-integrity.mjs',
  'qa-local-assets.mjs',
  'qa-react-bits.mjs',
  'qa-animation-performance.mjs',
  'qa-jyc-social-scope.mjs',
  'qa-trust-contract.mjs',
  'qa-dependency-lock.mjs',
  'qa-zero-glitch-contract.mjs',
  'qa-media-layout.mjs',
  'qa-v1-public-journey.mjs',
  'qa-reference-archive-readiness.mjs',
  'qa-current-release-coherence.mjs',
  'qa-current-release-integrity.mjs',
  'qa-public-ux-refinements.mjs',
  'qa-p0-editorial-routes.mjs'
];

for (const script of scripts) {
  console.log(`\n===== QA: ${script} =====`);
  const result = spawnSync(process.execPath, [`scripts/${script}`], {
    stdio: 'inherit',
    env: process.env
  });
  if (result.status !== 0) {
    console.error(`::error file=scripts/${script}::QA script failed: ${script} (exit ${result.status ?? 'unknown'})`);
    process.exit(result.status || 1);
  }
}

console.log(`\nALL CURRENT RELEASE QA PASSED (${scripts.length} contracts)`);
