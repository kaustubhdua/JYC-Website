import { spawnSync } from 'node:child_process';

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
  'qa-v26-beige-signature.mjs',
  'qa-v1-seniors.mjs',
  'qa-production-hardening.mjs',
  'qa-sql-contract.mjs',
  'qa-architecture.mjs',
  'qa-logo-theme.mjs',
  'qa-v41-club-experience.mjs',
  'qa-v42-public-pages.mjs',
  'qa-final-product.mjs',
  'qa-data-integrity.mjs',
  'qa-accessibility-contract.mjs',
  'qa-repo-hygiene.mjs',
  'qa-v52-final-contract.mjs',
  'qa-media-architecture.mjs',
  'qa-photo-integrity.mjs',
  'qa-local-assets.mjs',
  'qa-v54-next-experience.mjs',
  'qa-v55-visual-polish.mjs',
  'qa-v56-depth.mjs',
  'qa-v56-9-editorial.mjs',
  'qa-final-hygiene.mjs',
  'qa-react-bits.mjs',
  'qa-animation-performance.mjs',
  'qa-final.mjs',
  'qa-jyc-release-guard.mjs'
];

for (const script of scripts) {
  console.log(`\n===== QA: ${script} =====`);
  const result = spawnSync(process.execPath, [`scripts/${script}`], { stdio: 'inherit', env: process.env });
  if (result.status !== 0) {
    console.error(`::error file=scripts/${script}::QA script failed: ${script} (exit ${result.status ?? 'unknown'})`);
    process.exit(result.status || 1);
  }
}
console.log('\nALL STATIC QA PASSED');
