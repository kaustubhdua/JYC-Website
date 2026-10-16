import { defineConfig } from '@playwright/test';

const baseURL = process.env.JYC_BASE_URL || 'http://127.0.0.1:5173';
const mobileCore = /homepage accessibility and responsive guardrails|brand text contrast stays readable in both light and dark themes|mobile visual guardrails|mobile pages remain centered and controls meet touch-safe sizing|fixed public controls|Search and More surfaces follow the light\/dark theme with readable text|featured event announcement never blocks mobile navigation|responsive photos retry the original source when a derivative returns HTML with HTTP 200|featured event poster uses the shared responsive image fallback contract|gallery interaction contract covers filters, album routes, navigation, zoom and share controls|gallery lightbox traps focus and restores focus after close|Join JYC explains the published recruitment journey|Best of JYC frames navigate into the matching gallery photo/i;
const mobile430 = /homepage accessibility and responsive guardrails|brand text contrast stays readable in both light and dark themes|mobile pages remain centered and controls meet touch-safe sizing|Search and More surfaces follow the light\/dark theme with readable text|featured event announcement never blocks mobile navigation|featured event poster uses the shared responsive image fallback contract/i;
const tabletCore = /homepage accessibility and responsive guardrails|brand text contrast stays readable in both light and dark themes|tablet events hero keeps the headline inside its text frame|mobile pages remain centered and controls meet touch-safe sizing|responsive photos retry the original source when a derivative returns HTML with HTTP 200|featured event poster uses the shared responsive image fallback contract/i;
const desktop1440 = /homepage accessibility and responsive guardrails|team accent and gallery album titles stay readable on the paper theme|brand text contrast stays readable in both light and dark themes|sitewide routes have no overflow, clipping, off-screen content or fixed-control overlap|sitewide routes load every visible image successfully and expose alt text|gallery archive uses deterministic responsive image frames|homepage records Core Web Vitals under the browser harness|featured event announcement never blocks mobile navigation/i;
const mobile320 = /320px viewport keeps public routes and gallery cards inside the page/i;
const desktopCore = /capture route matrix|homepage accessibility and responsive guardrails|brand text contrast stays readable in both light and dark themes|sitewide routes have no overflow, clipping, off-screen content or fixed-control overlap|sitewide routes load every visible image successfully and expose alt text|gallery archive uses deterministic responsive image frames|homepage records Core Web Vitals under the browser harness|featured event announcement never blocks mobile navigation/i;

export default defineConfig({
  testDir: './scripts',
  timeout: 30000,
  expect: { timeout: 7000 },
  workers: process.env.CI ? Math.max(1, Number(process.env.JYC_PLAYWRIGHT_WORKERS || 2)) : undefined,
  fullyParallel: false,
  reporter: [['line']],
  use: {
    baseURL,
    serviceWorkers: 'block',
    trace: process.env.CI ? 'off' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'off' : 'retain-on-failure'
  },
  projects: [
    { name: 'mobile-320', use: { viewport: { width: 320, height: 740 }, isMobile: true }, grep: mobile320 },
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 }, isMobile: true }, grep: mobileCore },
    { name: 'mobile-430', use: { viewport: { width: 430, height: 932 }, isMobile: true }, grep: mobile430 },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 } }, grep: tabletCore },
    { name: 'desktop-1280', grep: desktopCore, use: { viewport: { width: 1280, height: 900 } } },
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } }, grep: desktop1440 }
  ],
  webServer: {
    command: process.env.CI
      ? 'npm run preview -- --host 127.0.0.1 --port 5173'
      : 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
