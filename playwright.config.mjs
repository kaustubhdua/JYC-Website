import { defineConfig } from '@playwright/test';

const baseURL = process.env.JYC_BASE_URL || 'http://127.0.0.1:5173';

// Full functional and route coverage runs on desktop. Smaller viewports run a
// focused responsive/interaction matrix to avoid repeating exhaustive media scans.
const responsiveMatrix = /homepage accessibility and responsive guardrails|reduced-motion mode disables|brand text contrast|mobile visual guardrails|event and gallery navigation|official logo|gallery archive uses deterministic|photo-led pages render real image|empty media frames|gallery deep-link|gallery album routes|gallery lightbox supports|constrained mobile network|gallery lightbox traps focus|Search and More surfaces|keyboard can reach the skip link|public images load|team profiles flip|responsive photos|featured event poster|team flip-card biographies|magnetic bento motion|featured event popup|JYC assistant remains interactive|GLB stays on capable|mobile fixed controls|fixed public controls|Join JYC exposes|gallery interaction contract|gallery load-more|JYC Assistant search|JYC Assistant traps keyboard focus|external registration route|published JAI event detail|tablet events hero|Best of JYC frames|updates API returns|JYC Now fallback cards|featured accordion gallery|sitewide routes|mobile pages remain centered|gallery lightbox opens|React Bits and Motion surfaces|search and More sheets|static boot screen|public route shells|assistant quick routes|Core Web Vitals|fallback|filter|gallery|team|registration|touch-safe|focus|theme/i;

export default defineConfig({
  testDir: './scripts',
  timeout: 30000,
  expect: { timeout: 7000 },
  workers: process.env.CI ? 2 : undefined,
  fullyParallel: false,
  reporter: [['line']],
  // The public site exercises WebGL, image decoding and multiple lazy React surfaces. CI runners are memory-constrained; serializing projects prevents browser-context OOM cascades while retaining every viewport check.
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'mobile-390',
      use: { viewport: { width: 390, height: 844 }, isMobile: true },
      grep: responsiveMatrix,
    },
    {
      name: 'mobile-430',
      use: { viewport: { width: 430, height: 932 }, isMobile: true },
      grep: responsiveMatrix,
    },
    {
      name: 'tablet-768',
      use: { viewport: { width: 768, height: 1024 } },
      grep: responsiveMatrix,
    },
    {
      name: 'desktop-1280',
      use: { viewport: { width: 1280, height: 900 } }
    },
    {
      name: 'desktop-1440',
      use: { viewport: { width: 1440, height: 900 } }
    }
  ],
  webServer: {
    // CI has already built the production bundle; exercise that exact artifact instead of
    // paying Vite's cold dev-transform cost on every parallel browser project.
    command: process.env.CI
      ? 'npm run preview -- --host 127.0.0.1 --port 5173'
      : 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
