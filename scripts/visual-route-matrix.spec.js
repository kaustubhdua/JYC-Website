import { test, expect } from '@playwright/test';

const routes = [
  '/', '/about', '/history', '/clubs', '/events', '/team', '/gallery',
  '/achievements', '/recruitment', '/fests', '/contact', '/calendar', '/best-of-jyc'
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 }
];

test.describe('JYC visual capture and measurable design contracts', () => {
  for (const viewport of viewports) {
    test(`capture route matrix — ${viewport.name}`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error' && !/favicon|third.party/i.test(message.text())) errors.push(message.text());
      });

      for (const route of routes) {
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.locator('.public-app').waitFor({ state: 'visible', timeout: 25000 });
        await page.waitForFunction(() => document.documentElement.dataset.jycContentReady === 'true', { timeout: 20000 });
        await page.evaluate(() => document.fonts.ready);
        await page.mouse.move(-1, -1);
        const metrics = await page.evaluate(() => {
          const visible = el => {
            const style = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' &&
              Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
          };
          const headings = [...document.querySelectorAll('.public-app h1, .public-app h2')].filter(visible);
          const images = [...document.querySelectorAll('.public-app img')].filter(visible);
          const missingAlt = images.filter(img => !img.hasAttribute('alt')).length;
          const brokenImages = images.filter(img => img.complete && img.naturalWidth === 0 && !img.src.endsWith('/assets/photo-unavailable.svg')).length;
          const unreservedImages = images.filter(img => {
            const style = getComputedStyle(img);
            return !img.hasAttribute('width') && !img.hasAttribute('height') &&
              !style.aspectRatio && !(img.parentElement && getComputedStyle(img.parentElement).aspectRatio !== 'auto');
          }).length;
          const bodyOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
          const badText = [...document.querySelectorAll('.public-app p, .public-app li')].filter(visible)
            .filter(el => {
              const style = getComputedStyle(el);
              return Number.parseFloat(style.fontSize) < 12 || Number.parseFloat(style.lineHeight) < Number.parseFloat(style.fontSize) * 1.15;
            }).length;
          const title = document.querySelector('.public-app h1');
          return {
            title: title?.innerText?.trim() || '',
            headingCount: headings.length,
            missingAlt,
            brokenImages,
            unreservedImages,
            bodyOverflow,
            badText,
            fonts: document.fonts.status,
            bodyFont: getComputedStyle(document.body).fontFamily
          };
        });
        expect(metrics.title, `${route} should expose a page title`).not.toBe('');
        expect(metrics.headingCount, `${route} should contain visible headings`).toBeGreaterThan(0);
        expect(metrics.missingAlt, `${route} image alt coverage`).toBe(0);
        expect(metrics.brokenImages, `${route} broken images`).toBe(0);
        expect(metrics.bodyOverflow, `${route} horizontal overflow at ${viewport.name}`).toBe(false);
        expect(metrics.badText, `${route} has undersized or compressed body text`).toBe(0);
        await page.screenshot({
          path: testInfo.outputPath(`${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}.png`),
          fullPage: true,
          animations: 'disabled'
        });
        expect(errors, `${route} browser errors: ${errors.join(' | ')}`).toEqual([]);
      }
    });
  }
});
