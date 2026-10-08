try { await import('@playwright/test'); }
catch {
  console.error('BROWSER QA NOT RUN: Playwright is not installed. Run `npm install`, then `npx playwright install chromium`.');
  process.exit(2);
}
const {spawnSync}=await import('node:child_process');
const r=spawnSync(process.platform==='win32'?'npx.cmd':'npx',['playwright','test','scripts/browser-smoke.spec.js scripts/zero-glitch-browser.spec.js'],{stdio:'inherit',env:{...process.env,JYC_BASE_URL:process.env.JYC_BASE_URL||'http://127.0.0.1:5173'}});
process.exit(r.status??1);
