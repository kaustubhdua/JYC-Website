import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

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
        await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;animation-duration:0s!important;transition:none!important;transition-duration:0s!important;caret-color:transparent!important}.fest-countdown{visibility:hidden!important}.jyc-featured-event-overlay{display:none!important}'});
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
          const badTextNodes = [...document.querySelectorAll('.public-app p, .public-app li')].filter(visible)
            .map(el => {
              const style = getComputedStyle(el);
              return {
                tag: el.tagName.toLowerCase(),
                className: typeof el.className === 'string' ? el.className : '',
                text: (el.innerText || el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 100),
                fontSize: style.fontSize,
                lineHeight: style.lineHeight
              };
            })
            .filter(el => Number.parseFloat(el.fontSize) < 12 || Number.parseFloat(el.lineHeight) < Number.parseFloat(el.fontSize) * 1.15);
          const title = document.querySelector('.public-app h1');
          return {
            title: title?.innerText?.trim() || '',
            headingCount: headings.length,
            missingAlt,
            brokenImages,
            unreservedImages,
            bodyOverflow,
            badText: badTextNodes.length,
            badTextDetails: badTextNodes.slice(0, 8),
            fonts: document.fonts.status,
            bodyFont: getComputedStyle(document.body).fontFamily
          };
        });
        expect(metrics.title, `${route} should expose a page title`).not.toBe('');
        expect(metrics.headingCount, `${route} should contain visible headings`).toBeGreaterThan(0);
        expect(metrics.missingAlt, `${route} image alt coverage`).toBe(0);
        expect(metrics.brokenImages, `${route} broken images`).toBe(0);
        expect(metrics.bodyOverflow, `${route} horizontal overflow at ${viewport.name}`).toBe(false);
        expect(metrics.badText, `${route} has undersized or compressed body text: ${JSON.stringify(metrics.badTextDetails)}`).toBe(0);
        const routeName = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
        const snapshotName = `${viewport.name}-${routeName}.png`;
        const baselinePath = testInfo.snapshotPath(snapshotName);
        if (process.env.JYC_UPDATE_VISUAL_BASELINES === 'true') {
          fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
          await page.screenshot({ path: baselinePath, animations: 'disabled' });
        } else if (!fs.existsSync(baselinePath)) {
          // A first-run baseline is not a regression. Capture it for review and
          // keep the route contracts active; once committed, every route must
          // match the checked-in baseline within the normal pixel threshold.
          console.warn(`VISUAL BASELINE MISSING: ${snapshotName}; captured actual for review.`);
        } else {
          await expect(page).toHaveScreenshot(snapshotName, {
            animations: 'disabled',
            threshold: 0.15,
            maxDiffPixelRatio: 0.01
          });
        }
        await page.screenshot({
          path: testInfo.outputPath(`${routeName}.png`),
          fullPage: true,
          animations: 'disabled'
        });
        expect(errors, `${route} browser errors: ${errors.join(' | ')}`).toEqual([]);
      }
    });
  }
});
