import { defineConfig } from '@playwright/test';

const baseURL = process.env.JYC_BASE_URL || 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: './scripts',
  timeout: 30000,
  expect: { timeout: 7000 },
  workers: process.env.CI ? 1 : undefined,
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
      use: { viewport: { width: 390, height: 844 }, isMobile: true }
    },
    {
      name: 'mobile-430',
      use: { viewport: { width: 430, height: 932 }, isMobile: true }
    },
    {
      name: 'tablet-768',
      use: { viewport: { width: 768, height: 1024 } }
    },
    {
      name: 'desktop-1280',
      use: { viewport: { width: 1280, height: 900 } }
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
