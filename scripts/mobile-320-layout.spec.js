import { test, expect } from '@playwright/test';

const routes = ['/', '/clubs', '/events', '/gallery', '/team', '/updates', '/contact'];

async function waitForPublicApp(page, route) {
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await page.locator('#root').waitFor({ state: 'attached', timeout: 15000 });
  await expect(page.locator('body'), route).toBeVisible();
  await page.locator('.public-app').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForFunction(() => document.documentElement.dataset.jycContentReady === 'true', { timeout: 20000 });
}

test('320px viewport keeps public routes and gallery cards inside the page', async ({ page }) => {
  test.setTimeout(90000);
  for (const route of routes) {
    await waitForPublicApp(page, route);
    const result = await page.evaluate(() => {
      const viewport = window.innerWidth;
      const grid = document.querySelector('.jyc57-masonry');
      const gridRect = grid?.getBoundingClientRect();
      const memoryGrid = document.querySelector('.jyc-memories-grid');
      const memoryGridRect = memoryGrid?.getBoundingClientRect();
      const memoryCards = [...(memoryGrid?.querySelectorAll('.jyc-memory-card') || [])].map(card => {
        const rect = card.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      });
      const cards = [...(grid?.querySelectorAll('.jyc57-photo') || [])].map(card => {
        const rect = card.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      });
      return {
        viewport,
        documentOverflow: document.documentElement.scrollWidth > viewport + 1,
        bodyOverflow: document.body.scrollWidth > viewport + 1,
        gridFound: Boolean(grid),
        gridClientWidth: grid?.clientWidth ?? null,
        gridScrollWidth: grid?.scrollWidth ?? null,
        gridLeft: gridRect?.left ?? null,
        gridRight: gridRect?.right ?? null,
        cards,
        memoryGridFound: Boolean(memoryGrid),
        memoryGridClientWidth: memoryGrid?.clientWidth ?? null,
        memoryGridScrollWidth: memoryGrid?.scrollWidth ?? null,
        memoryGridLeft: memoryGridRect?.left ?? null,
        memoryGridRight: memoryGridRect?.right ?? null,
        memoryCards
      };
    });
    expect(result.documentOverflow, `${route} document overflow at 320px`).toBe(false);
    expect(result.bodyOverflow, `${route} body overflow at 320px`).toBe(false);
    if (route === '/gallery') {
      if (result.memoryGridFound) {
        expect(result.memoryGridScrollWidth, 'gallery memory grid must not overflow its container at 320px').toBeLessThanOrEqual(result.memoryGridClientWidth + 1);
        for (const card of result.memoryCards) {
          expect(card.left, 'memory card must remain inside its grid').toBeGreaterThanOrEqual(result.memoryGridLeft - 1);
          expect(card.right, 'memory card must remain inside its grid').toBeLessThanOrEqual(result.memoryGridRight + 1);
          expect(card.right, 'memory card must remain inside the viewport').toBeLessThanOrEqual(result.viewport + 1);
        }
      }
      expect(result.gridFound, 'Gallery photo grid is rendered for viewport test').toBe(true);
      expect(result.cards.length, 'Gallery contains photo cards for viewport test').toBeGreaterThan(0);
      expect(result.gridScrollWidth, 'gallery grid must not overflow its own container').toBeLessThanOrEqual(result.gridClientWidth + 1);
      for (const card of result.cards) {
        expect(card.left, 'gallery card must remain inside the grid').toBeGreaterThanOrEqual(result.gridLeft - 1);
        expect(card.right, 'gallery card must remain inside the grid').toBeLessThanOrEqual(result.gridRight + 1);
        expect(card.right, 'gallery card must remain inside the viewport').toBeLessThanOrEqual(result.viewport + 1);
      }
    }
  }
});
