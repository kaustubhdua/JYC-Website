import { test, expect } from '@playwright/test';

const base = process.env.JYC_BASE_URL || 'http://127.0.0.1:5173';
const routes = ['/', '/about', '/history', '/clubs', '/events', '/team', '/gallery', '/achievements', '/announcements', '/recruitment', '/calendar', '/archive', '/updates', '/contact', '/fests'];

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
    await expect.poll(() => new URL(page.url()).pathname, { timeout: 3000 }).not.toBe(route);
  }
});

test('JYC calendar contains only event content', async ({ page }) => {
  await page.goto(base + '/calendar', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('JYC EVENT CALENDAR')).toBeVisible();
  await expect(page.getByText('Academic Calendar')).toHaveCount(0);
});

test('reduced-motion mode disables homepage motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const motion = await page.locator('.jyc-editorial-home').evaluate(root => [...root.querySelectorAll('*')].map(node => getComputedStyle(node).animationName).filter(name => name && name !== 'none'));
  expect(motion).toEqual([]);
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
    const selectors=['.jyc-v1-hero h1','.jyc-v1-hero-copy>p','.jyc-v1-eyebrow','.nav a'];
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


test('mobile visual guardrails keep core content centered and inside viewport', async ({ page }) => {
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/', '/clubs', '/events', '/gallery']) {
      await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(250);
      const result = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const bodyOverflow = document.documentElement.scrollWidth > vw + 1;
        const badRects = [...document.querySelectorAll('main *, section.page > *, .section > *')]
          .filter(el => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && (r.left < -1 || r.right > vw + 1);
          }).slice(0, 8)
          .map(el => ({ tag: el.tagName, cls: String(el.className || ''), left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right }));
        const invisibleTextDetails = [...document.querySelectorAll('h1,h2,h3,p,button,a,span')]
          .filter(el => {
            const text = (el.textContent || '').trim();
            if (!text) return false;
            // The skip link is intentionally parked off-screen until keyboard focus.
            // It is an accessibility affordance, not an accidentally clipped visible node.
            if (el.classList.contains('skip-link') && document.activeElement !== el) return false;
            const s = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0 &&
              (r.right < -1 || r.left > vw + 1 || r.bottom < -1);
          }).slice(0,8)
          .map(el => ({
            tag: el.tagName,
            cls: String(el.className || ''),
            text: String(el.textContent || '').trim().replace(/\\s+/g,' ').slice(0,120),
            left: Math.round(el.getBoundingClientRect().left),
            right: Math.round(el.getBoundingClientRect().right),
            top: Math.round(el.getBoundingClientRect().top),
            bottom: Math.round(el.getBoundingClientRect().bottom)
          }));
        return { bodyOverflow, badRects, invisibleText: invisibleTextDetails.length, invisibleTextDetails };
      });
      expect(result.bodyOverflow, 'horizontal overflow ' + width + 'px ' + route).toBe(false);
      expect(result.badRects, 'off-screen elements ' + width + 'px ' + route).toEqual([]);
      expect(result.invisibleText, 'off-screen visible text ' + width + 'px ' + route + ' :: ' + JSON.stringify(result.invisibleTextDetails)).toBe(0);
    }
  }
});

test('photo-led pages render real image content', async ({ page }) => {
  for (const route of ['/', '/clubs', '/events', '/gallery']) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    const images = page.locator('img');
    expect(await images.count(), route).toBeGreaterThan(0);
    await expect(images.first()).toBeVisible();
    await expect.poll(async () => images.evaluateAll(nodes => nodes.filter(img => img.complete && img.naturalWidth > 0).length), { timeout: 5000 }).toBeGreaterThan(0);
    const broken = await images.evaluateAll(nodes => nodes.filter(img => img.complete && img.naturalWidth === 0).map(img => img.getAttribute('src')));
    expect(broken, 'broken images on '+route).toEqual([]);
  }
});


test('legacy redirects and unknown routes resolve safely', async ({ page }) => {
  test.setTimeout(60000);
  const redirects = {
    '/leadership': '/team',
    '/join-jyc': '/join-jyc',
    '/event-calendar': '/calendar',
    '/moments': '/gallery',
    '/planner': '/events',
    '/discover': '/clubs',
    '/my-jyc': '/',
    '/login': '/',
    '/notifications': '/',
    '/settings': '/about',
    '/agenda': '/events',
    '/download': '/about',
    '/projects': '/clubs'
  };
  for (const [from, to] of Object.entries(redirects)) {
    await page.goto(base + from, { waitUntil: 'domcontentloaded' });
    await expect.poll(() => new URL(page.url()).pathname, { timeout: 3000 }).toBe(to);
  }

  await page.goto(base + '/this-route-should-not-exist-404', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#root')).not.toBeEmpty();
  await expect(page.locator('body')).toBeVisible();
});

test('production shell exposes required security headers when run against a deployment', async ({ page }) => {
  test.skip(!/^https?:\/\/(?!127\.0\.0\.1|localhost)/i.test(base), 'Requires JYC_BASE_URL to point at a deployed HTTPS/HTTP origin');
  const response = await page.goto(base, { waitUntil: 'domcontentloaded' });
  expect(response).not.toBeNull();
  const headers = response.headers();
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['permissions-policy']).toContain('camera=()');
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
});

test('keyboard can reach the skip link and primary navigation', async ({ page }) => {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main-content');
});

test('homepage media stays inside the viewport and has no empty image boxes', async ({ page }) => {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  const result = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const imgs = [...document.querySelectorAll('.jyc-editorial-home img')];
    const badImages = imgs.filter(img => img.complete && img.naturalWidth === 0).map(img => img.getAttribute('src'));
    const badRects = imgs.filter(img => { const r = img.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.left < -1 || r.right > vw + 1); }).map(img => img.getAttribute('src'));
    const emptyMedia = [...document.querySelectorAll('.jyc-editorial-home [class*="image"],.jyc-editorial-home [class*="photo"]')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 40 && r.height > 40 && !el.querySelector('img,.jyc-v1-empty'); }).length;
    return { badImages, badRects, emptyMedia };
  });
  expect(result.badImages).toEqual([]);
  expect(result.badRects).toEqual([]);
  expect(result.emptyMedia).toBe(0);
});

test('homepage remains inside viewport at common phone widths', async ({ page }) => {
  for (const width of [320, 360, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(() => [...document.querySelectorAll('.jyc-editorial-home > section')].map(el => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, width: r.width }; }).filter(x => x.width > 0));
    for (const rect of result) { expect(Math.round(rect.left), 'left edge at '+width).toBeGreaterThanOrEqual(0); expect(Math.round(rect.right), 'right edge at '+width).toBeLessThanOrEqual(width); }
  }
});

test('all public routes keep images loaded, centered and inside the viewport', async ({ page }) => {
  test.setTimeout(120000);
  for (const route of routes) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await new Promise(resolve => setTimeout(resolve, 1200));
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(350);
    const result = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const images = [...document.querySelectorAll('main img, .public-app img')];
      const broken = images.filter(img => img.complete && img.naturalWidth === 0).map(img => img.currentSrc || img.src);
      const outside = images.filter(img => {
        const r = img.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && (r.left < -1 || r.right > vw + 1);
      }).map(img => ({src:img.currentSrc||img.src,left:img.getBoundingClientRect().left,right:img.getBoundingClientRect().right}));
      const badlyPositioned = images.filter(img => {
        const r = img.getBoundingClientRect();
        if (!r.width || !r.height) return false;
        const style = getComputedStyle(img);
        return style.objectFit === 'cover' && !/50%\\s+50%/.test(style.objectPosition);
      }).map(img => ({src:img.currentSrc||img.src,position:getComputedStyle(img).objectPosition}));
      return {count:images.length,broken,outside,badlyPositioned};
    });
    expect(result.count).toBeGreaterThan(0);
    expect(result.broken).toEqual([]);
    expect(result.outside).toEqual([]);
    expect(result.badlyPositioned).toEqual([]);
  }
});

test('homepage has no large empty media frames and no horizontal overflow', async ({ page }) => {
  for (const width of [320, 360, 390, 430, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const result = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const media = [...document.querySelectorAll('.jyc-editorial-home .jyc-v1-hero-photo,.jyc-editorial-home .jyc-v1-event-image,.jyc-editorial-home .jyc-v1-family-media,.jyc-editorial-home .jyc-v1-activity-image,.jyc-editorial-home .jyc-v1-gallery-photo,.jyc-editorial-home .jyc-v1-person>div')];
      const empty = media.filter(box => {
        const r=box.getBoundingClientRect();
        return r.width>80 && r.height>80 && !box.querySelector('img,.jyc-v1-empty');
      }).length;
      const overflow=document.documentElement.scrollWidth>vw+1;
      const offscreen=[...document.querySelectorAll('.jyc-editorial-home > section')].filter(el=>{const r=el.getBoundingClientRect();return r.left<-1||r.right>vw+1}).length;
      return {empty,overflow,offscreen};
    });
    expect(result.empty).toBe(0);
    expect(result.overflow).toBe(false);
    expect(result.offscreen).toBe(0);
  }
});

test('V1 homepage remains readable in dark theme', async ({ page }) => {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const result = await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme','dark');
    const root=document.querySelector('.jyc-editorial-home');
    const parse=v=>{const m=String(v).match(/rgba?\\((\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)/);return m?[+m[1],+m[2],+m[3]]:null};
    const lum=rgb=>{const c=rgb.map(v=>{const x=v/255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
    const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
    const pick=sel=>{const el=root?.querySelector(sel);if(!el)return null;const fg=parse(getComputedStyle(el).color);const bg=parse(getComputedStyle(root).backgroundColor)||[17,16,20];return fg?ratio(fg,bg):null};
    return {background:getComputedStyle(root).backgroundColor,h1:pick('.jyc-v1-hero h1'),body:pick('.jyc-v1-hero-copy>p')};
  });
  expect(result.background).not.toBe('rgb(245, 241, 230)');
  if(result.h1!==null) expect(result.h1).toBeGreaterThanOrEqual(4.5);
  if(result.body!==null) expect(result.body).toBeGreaterThanOrEqual(4.5);
});

test('JYC assistant GLB remains fixed and interaction-driven', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const bot=page.locator('.jyc-bot-shell');
  await expect(bot).toBeVisible();
  const model=page.locator('.jyc-bot-glb');
  if(await model.count()){
    await expect(model).toHaveAttribute('src','/models/jyc-spatial.glb');
    await expect(model).not.toHaveAttribute('camera-controls');
    await expect(model).not.toHaveAttribute('onpointermove');
  }
  await bot.locator('button').click();
  await expect(page.locator('.jyc-assistant-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.jyc-assistant-panel')).toHaveCount(0);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  expect(overflow).toBe(false);
});


test('JYC assistant GLB loads efficiently on desktop and falls back on touch devices', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const model = page.locator('.jyc-bot-glb');
  await expect.poll(async () => await model.count(), { timeout: 10000 }).toBeGreaterThanOrEqual(0);
  if (await model.count()) {
    await expect(model).toHaveAttribute('src', '/models/jyc-spatial.glb');
    await expect.poll(async () => await model.evaluate(el => Boolean(el.loaded)), { timeout: 12000 }).toBe(true);
    const state = await model.evaluate(el => ({
      loaded: Boolean(el.loaded),
      hasCameraControls: el.hasAttribute('camera-controls'),
      hasAutoRotate: el.hasAttribute('auto-rotate'),
      width: el.getBoundingClientRect().width,
      height: el.getBoundingClientRect().height
    }));
    expect(state.loaded).toBe(true);
    expect(state.hasCameraControls).toBe(false);
    expect(state.hasAutoRotate).toBe(false);
    expect(state.width).toBeGreaterThan(40);
    expect(state.height).toBeGreaterThan(40);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await expect(page.locator('.jyc-bot-shell')).toBeVisible();
  await expect(page.locator('.jyc-bot-glb')).toHaveCount(0);
  await expect(page.locator('.jyc-bot-model-fallback')).toBeVisible();
});
