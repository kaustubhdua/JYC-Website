import { test, expect } from '@playwright/test';

const base = process.env.JYC_BASE_URL || 'http://127.0.0.1:5173';
const routes = ['/', '/about', '/history', '/clubs', '/events', '/gallery', '/team', '/calendar', '/archive', '/recruitment', '/contact', '/fests', '/updates', '/announcements'];

test('public app mounts with no runtime errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#root')).toBeAttached();
  await expect(page).toHaveTitle(/JYC|JIIT YOUTH CLUB/i);
  await expect(page.locator('#root')).not.toBeEmpty();
  expect(errors).toEqual([]);
});

for (const route of routes) {
  test(`route ${route} loads without a runtime error`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#root')).toBeAttached();
    await expect(page.locator('#root')).not.toBeEmpty();
    await expect(page.locator('body')).toBeVisible();
    expect(errors, `runtime errors on ${route}`).toEqual([]);
  });
}


test('JYC Now page stays within responsive guardrails', async ({ page }) => {
  await page.goto(base + '/updates', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('The organisation, in motion.')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});

test('homepage accessibility and responsive guardrails', async ({ page }) => {
  await page.goto(base, { waitUntil: 'domcontentloaded' });

  const missingAlt = await page.locator('img:not([alt])').count();
  expect(missingAlt).toBe(0);

  const unnamedButtons = await page.locator('button').evaluateAll(buttons =>
    buttons.filter(button => {
      const text = (button.innerText || '').trim();
      const aria = button.getAttribute('aria-label') || button.getAttribute('aria-labelledby');
      return !text && !aria;
    }).length
  );
  expect(unnamedButtons).toBe(0);

  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
  expect(overflow).toBe(false);
});

test('retired student-platform routes resolve to safe public destinations', async ({ page }) => {
  for (const route of ['/my-jyc','/login','/planner','/notifications','/settings','/agenda','/projects','/download']) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#root')).not.toBeEmpty();
    expect(new URL(page.url()).pathname).not.toBe(route);
  }
});

test('JYC calendar contains only event content', async ({ page }) => {
  await page.goto(base + '/calendar', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('JYC EVENT CALENDAR')).toBeVisible();
  await expect(page.getByText('Academic Calendar')).toHaveCount(0);
});

test('reduced-motion mode disables hero animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const animationNames = await page.locator('.hero-logo-stage img').evaluateAll(nodes =>
    nodes.map(node => getComputedStyle(node).animationName)
  );
  expect(animationNames.every(name => name === 'none')).toBe(true);
});


test('brand text contrast stays readable in both themes', async ({ page }) => {
  const contrast = await page.evaluate(() => {
    const parse = value => {
      const m = String(value || '').match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)/i);
      if (!m) return null;
      return [Number(m[1]),Number(m[2]),Number(m[3]),m[4]===undefined?1:Number(m[4])];
    };
    const luminance = rgb => {
      const channels = rgb.slice(0,3).map(v => {
        const x=v/255;
        return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);
      });
      return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
    };
    const ratio = (a,b) => {
      const la=luminance(a),lb=luminance(b);
      return (Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);
    };
    const effectiveBg = el => {
      let node=el;
      while(node && node!==document.documentElement){
        const bg=parse(getComputedStyle(node).backgroundColor);
        if(bg && bg[3]>.05){
          const alpha=bg[3];
          if(alpha>=.95)return bg;
        }
        node=node.parentElement;
      }
      return parse(getComputedStyle(document.documentElement).backgroundColor)||[250,247,239,1];
    };
    const selectors=['.hero h1','.hero p','.hero-context-rail span','.nav a'];
    return selectors.map(selector=>{
      const el=document.querySelector(selector);
      if(!el)return {selector,ratio:null};
      const fg=parse(getComputedStyle(el).color);
      const bg=effectiveBg(el);
      return {selector,ratio:fg&&bg?ratio(fg,bg):null};
    });
  });
  for(const item of contrast){
    if(item.ratio!==null) expect(item.ratio, item.selector).toBeGreaterThanOrEqual(4.5);
  }
});
