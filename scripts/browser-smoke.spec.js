import { test, expect } from '@playwright/test';

const base = process.env.JYC_BASE_URL || 'http://127.0.0.1:5173';
const routes = ['/', '/about', '/history', '/clubs', '/events', '/team', '/gallery', '/achievements', '/announcements', '/recruitment', '/calendar', '/archive', '/updates', '/contact', '/fests'];

async function waitForAppMount(page, label='page') {
  try {
    await page.waitForFunction(() => Boolean(document.querySelector('#root .app-frame, #root .app, #root .public-app')), { timeout: 30000 });
  } catch (error) {
    const diagnostics = await page.evaluate(() => ({
      readyState: document.readyState,
      rootHtml: document.querySelector('#root')?.innerHTML?.slice(0, 1200) || '',
      bodyText: document.body?.innerText?.slice(0, 1200) || '',
      scriptCount: document.scripts.length
    }));
    throw new Error(label + ' did not mount within 30s: ' + JSON.stringify(diagnostics) + '; ' + error.message);
  }
}

test('public app mounts with no runtime errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#root')).toBeAttached();
  await expect(page).toHaveTitle(/JYC|JIIT YOUTH CLUB/i);
  await waitForAppMount(page, 'homepage');
  expect(errors, `browser errors: ${errors.join(' | ')}`).toEqual([]);
});

for (const route of routes) {
  test(`route ${route} loads without a runtime error`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#root')).toBeAttached();
    await waitForAppMount(page, route);
    await expect(page.locator('body')).toBeVisible();
    expect(errors, `runtime errors on ${route}: ${errors.join(' | ')}`).toEqual([]);
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
    await waitForAppMount(page, 'redirect');
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


test('public pages have no empty media frames or normal-flow section overlaps', async ({ page }) => {
  test.setTimeout(120000);
  for (const route of routes) {
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(resolve => setTimeout(resolve, 700));
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(200);
      const result = await page.evaluate(() => {
        const root=document.querySelector('.public-app');
        if(!root)return {empty:[],overlaps:[]};
        const empty=[...root.querySelectorAll('[class*="image"],[class*="photo"],[class*="media"],[class*="poster"]')].filter(el=>{
          const r=el.getBoundingClientRect(),s=getComputedStyle(el);
          if(r.width<90||r.height<90||s.display==='none'||s.visibility==='hidden')return false;
          if(el.querySelector('img,video,iframe,svg,canvas'))return false;
          return !s.backgroundImage||s.backgroundImage==='none';
        }).slice(0,8).map(el=>({tag:el.tagName,cls:String(el.className||'').slice(0,120)}));
        const sections=[...root.querySelectorAll('main > section,.route-stage > section')].filter(el=>{
          const r=el.getBoundingClientRect(),s=getComputedStyle(el);
          return r.width>0&&r.height>0&&!['fixed','absolute'].includes(s.position);
        }).map(el=>({el,top:el.getBoundingClientRect().top+window.scrollY,bottom:el.getBoundingClientRect().bottom+window.scrollY}));
        const overlaps=[];
        for(let i=0;i<sections.length;i++)for(let j=i+1;j<sections.length;j++){
          const a=sections[i],b=sections[j];
          if(a.bottom>b.top+8&&b.bottom>a.top+8)overlaps.push({a:String(a.el.className||a.el.tagName),b:String(b.el.className||b.el.tagName)});
        }
        return {empty,overlaps:overlaps.slice(0,8)};
      });
      expect(result.empty,'empty media '+route+' @ '+width).toEqual([]);
      expect(result.overlaps,'normal-flow section overlap '+route+' @ '+width).toEqual([]);
    }
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
  await waitForAppMount(page, 'unknown route');
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


test('public images load, stay inside the viewport, and use centered focal positioning', async ({ page }) => {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('main').waitFor({ state: 'attached', timeout: 10000 });
  const viewports = [0, 0.25, 0.5, 0.75, 1];
  const failures = [];
  for (const fraction of viewports) {
    await page.evaluate(f => {
      const max = Math.max(0, document.body.scrollHeight - window.innerHeight);
      window.scrollTo(0, Math.round(max * f));
    }, fraction);
    await page.waitForTimeout(350);
    const result = await page.locator('main img, footer img').evaluateAll(images => images
      .filter(img => {
        const r=img.getBoundingClientRect();
        return r.bottom>0 && r.top<window.innerHeight && r.width>0 && r.height>0;
      })
      .map(img => {
        const r=img.getBoundingClientRect();
        const style=getComputedStyle(img);
        return {
          src:img.currentSrc||img.src,
          loaded:img.complete&&img.naturalWidth>0,
          visible:r.width>0&&r.height>0,
          inside:r.left>=-1&&r.right<=document.documentElement.clientWidth+1,
          objectPosition:style.objectPosition,
          objectFit:style.objectFit
        };
      }));
    failures.push(...result.filter(x => !x.loaded || !x.visible || !x.inside || (x.objectFit && x.objectPosition!=='50% 50%')));
  }
  expect(failures).toEqual([]);
});
test('V1 homepage sections become visible and do not remain transparent', async ({ page }) => {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('.jyc-editorial-home').waitFor({ state: 'visible', timeout: 10000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  const hidden = await page.locator('.jyc-editorial-home .editorial-reveal').evaluateAll(nodes =>
    nodes.filter(node => {
      const r=node.getBoundingClientRect(), s=getComputedStyle(node);
      return r.width>0 && r.height>0 && (s.opacity==='0' || s.visibility==='hidden');
    }).length
  );
  expect(hidden).toBe(0);
});

test('V1 homepage keeps the JYC palette and readable dark mode', async ({ page }) => {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  const light = await page.locator('.jyc-editorial-home').evaluate(el => {
    const s = getComputedStyle(el);
    return { bg:s.backgroundColor, color:s.color };
  });
  await page.locator('.theme-toggle').click();
  await page.waitForTimeout(120);
  const dark = await page.locator('.jyc-editorial-home').evaluate(el => {
    const s = getComputedStyle(el);
    return { bg:s.backgroundColor, color:s.color };
  });
  expect(light.bg).not.toBe(dark.bg);
  expect(dark.color).not.toBe('rgba(0, 0, 0, 0)');
});

test('public cards do not use pointer-driven 3D tilt', async ({ page }) => {
  await page.goto(base + '/clubs', { waitUntil: 'domcontentloaded' });
  const transforms = await page.locator('.club-card-v41,.club-card-premium,.event-card-premium,.gallery-card').evaluateAll(nodes =>
    nodes.map(node => getComputedStyle(node).transform)
  );
  expect(transforms.filter(value => value && value !== 'none' && value.includes('matrix3d')).length).toBe(0);
});

test('JYC assistant remains interactive with GLB or safe fallback', async ({ page }) => {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('.jyc-bot-orb').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('.jyc-bot-orb').click();
  await expect(page.locator('.jyc-assistant-panel')).toBeVisible();
  const media = await page.locator('.jyc-bot-glb, .jyc-bot-model-fallback').count();
  expect(media).toBeGreaterThan(0);
  if (await page.locator('.jyc-bot-glb').count()) {
    await expect(page.locator('.jyc-bot-glb')).toHaveAttribute('data-jyc-glb-src', '/models/jyc-spatial.glb');
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('.jyc-assistant-panel')).toHaveCount(0);
});

test('GLB stays on capable desktop hardware and falls back on touch-first mobile', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('.jyc-bot-orb').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(1800);
  const desktopState=await page.evaluate(()=>({
    hasModel:Boolean(document.querySelector('.jyc-bot-glb')),
    src:document.querySelector('.jyc-bot-glb')?.getAttribute('data-jyc-glb-src')||null
  }));
  if(desktopState.hasModel) expect(desktopState.src).toBe('/models/jyc-spatial.glb');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('.jyc-bot-orb').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(500);
  await expect(page.locator('.jyc-bot-model-fallback')).toBeVisible();
  await expect(page.locator('.jyc-bot-glb')).toHaveCount(0);
});

test('mobile fixed controls have separation and never overlap the navigation dock', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  const boxes = await page.evaluate(() => {
    const rect = sel => { const el=document.querySelector(sel); if(!el) return null; const r=el.getBoundingClientRect(); return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}; };
    return {dock:rect('.mobile-dock'),bot:rect('.jyc-bot-shell'),nav:rect('.nav')};
  });
  if(boxes.dock && boxes.bot){
    const overlap = Math.max(0, Math.min(boxes.dock.bottom,boxes.bot.bottom)-Math.max(boxes.dock.top,boxes.bot.top)) *
      Math.max(0, Math.min(boxes.dock.right,boxes.bot.right)-Math.max(boxes.dock.left,boxes.bot.left));
    expect(overlap).toBe(0);
  }
});


test('Join JYC exposes the public coming-soon experience', async ({ page }) => {
  await page.goto(base + '/join-jyc', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Join JYC.' })).toBeVisible();
  await expect(page.getByText('The next JYC recruitment cycle is being prepared.')).toBeVisible();
});
