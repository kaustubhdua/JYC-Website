import { spawnSync } from 'node:child_process';

try { await import('@playwright/test'); }
catch {
  console.error('BROWSER QA NOT RUN: Playwright is not installed. Run `npm install`, then `npx playwright install chromium`.');
  process.exit(2);
}

// Playwright's webServer owns the dev/production-preview lifecycle. Starting
// another Vite preview here duplicated the server in CI and wasted memory.
const baseUrl=process.env.JYC_BASE_URL||'http://127.0.0.1:5173';
const result=spawnSync(process.platform==='win32'?'npx.cmd':'npx',['playwright','test','scripts/browser-smoke.spec.js','scripts/zero-glitch-browser.spec.js','scripts/mobile-320-layout.spec.js'],{
  stdio:'inherit',
  env:{...process.env,JYC_BASE_URL:baseUrl}
});
process.exitCode=result.status??1;
