import { test, expect } from '@playwright/test';

const base = (process.env.JYC_BASE_URL || 'http://127.0.0.1:5173').replace(/\/$/, '');
const routes = ['/', '/about', '/history', '/clubs', '/events', '/team', '/gallery', '/achievements', '/announcements', '/recruitment', '/calendar', '/archive', '/updates', '/contact', '/fests','/best-of-jyc'];

async function waitForImagesToSettle(page) {
  await page.locator('img').evaluateAll(images => Promise.all(images.map(img => new Promise(resolve => {
    if (img.complete) return resolve();
    const done = () => { img.removeEventListener('load', done); img.removeEventListener('error', done); resolve(); };
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
    setTimeout(done, 8000);
  }))));
}

async function waitForAppMount(page, label='page') {
  try {
    await page.waitForFunction(() => Boolean(document.querySelector('#root .app-frame, #root .app, #root .public-app')) && document.documentElement.dataset.jycContentReady === 'true', { timeout: 30000 });
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


test('history, achievements and Best of JYC render their dedicated pages', async ({ page }) => {
  const cases = [
    ['/history', /A living record of JYC\./i],
    ['/achievements', /What the community has built\./i],
    ['/best-of-jyc', /The Best of JYC\./i]
  ];
  for (const [route, heading] of cases) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await waitForAppMount(page, route);
    await expect(page.locator('h1').first()).toContainText(heading);
    await expect.poll(() => new URL(page.url()).pathname).toBe(route);
  }
});

test('contact form validates required fields and email accessibly before submission', async ({ page }) => {
  await page.goto(base + '/contact', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'contact form validation');

  const form = page.locator('form.contact-form');
  await expect(form).toBeVisible();
  const submit = form.getByRole('button', { name: /Send message/i });

  // Empty form: report all required fields and focus the first invalid control.
  await submit.click();
  await expect(form.locator('#contact-name-error')).toHaveText('Enter your name.');
  await expect(form.locator('#contact-email-error')).toHaveText('Enter your email address.');
  await expect(form.locator('#contact-message-error')).toHaveText('Enter a message.');
  await expect(form.locator('input[name="name"]')).toBeFocused();

  // Editing a field clears only that field's error.
  await form.locator('input[name="name"]').fill('JYC QA');
  await expect(form.locator('#contact-name-error')).toHaveCount(0);

  // A malformed email is rejected client-side; do not submit a real message in QA.
  await form.locator('input[name="email"]').fill('not-an-email');
  await form.locator('textarea[name="message"]').fill('Validation-only browser test.');
  await submit.click();
  await expect(form.locator('#contact-email-error')).toHaveText('Enter a valid email address.');
  await expect(form.locator('input[name="email"]')).toHaveAttribute('aria-invalid', 'true');
  await expect(form.locator('.contact-form-error')).toHaveCount(0);

  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
    const contrast = await form.locator('#contact-email-error').evaluate(el => {
      const parse = value => {
        const match = String(value || '').match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)/i);
        return match ? [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])] : null;
      };
      const luminance = rgb => rgb.slice(0, 3).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
      let background = [255, 255, 255, 1];
      let node = el;
      while (node && node !== document.documentElement) {
        const candidate = parse(getComputedStyle(node).backgroundColor);
        if (candidate && candidate[3] > .95) { background = candidate; break; }
        node = node.parentElement;
      }
      const foreground = parse(getComputedStyle(el).color);
      if (!foreground) return null;
      const a = luminance(foreground), b = luminance(background);
      return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    });
    expect(contrast, theme + ' contact validation error contrast').toBeGreaterThanOrEqual(4.5);
  }
});
 
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

test('admin routes stay outside the public experience', async ({ page }) => {
  for (const route of ['/admin', '/admin/', '/admin/users', '/admin/settings']) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await waitForAppMount(page, 'admin redirect');
    await expect.poll(() => new URL(page.url()).pathname, { timeout: 3000 }).toBe('/');
    await expect(page.getByText('JYC CONTROL CENTER')).toHaveCount(0);
  }
});

test('public entry routes mount directly', async ({ page }) => {
  for (const route of ['/join-jyc', '/recruitment', '/leadership']) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await waitForAppMount(page, route);
    await expect(page.locator('body')).toBeVisible();
  }
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
  await page.locator('.jyc-home').waitFor({ state: 'visible', timeout: 15000 });
  const motion = await page.locator('.jyc-home').evaluate(root => [...root.querySelectorAll('*')].map(node => getComputedStyle(node).animationName).filter(name => name && name !== 'none'));
  expect(motion).toEqual([]);
});


test('brand text contrast stays readable in both light and dark themes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'brand contrast');
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
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
          if(bg && bg[3]>.95)return bg;
          node=node.parentElement;
        }
        return parse(getComputedStyle(document.documentElement).backgroundColor)||[250,247,239,1];
      };
      const selectors=['.jh-hero h1','.jh-lead','.jh-overline','.nav a'];
      return selectors.map(selector=>{
        const el=document.querySelector(selector);
        if(!el||getComputedStyle(el).display==='none'||getComputedStyle(el).visibility==='hidden')return {selector,ratio:null};
        const fg=parse(getComputedStyle(el).color);
        const bg=effectiveBg(el);
        return {selector,ratio:fg&&bg?ratio(fg,bg):null};
      });
    });
    for(const item of contrast){
      if(item.ratio!==null) expect(item.ratio, theme+' '+item.selector).toBeGreaterThanOrEqual(4.5);
    }
  }
});

test('mobile visual guardrails keep core content centered and inside viewport', async ({ page }) => {
  test.setTimeout(120000);
  for (const width of [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
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
            if (el.closest('.jyc57-collection-scroller,.jyc57-photo-story-scrubber')) return false;
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
      const textOverflow = await page.evaluate(() => [...document.querySelectorAll('h1,h2,h3,h4,p,button,a,span')].filter(el => {
        const s=getComputedStyle(el), r=el.getBoundingClientRect(), text=(el.textContent||'').trim();
        if(!text||s.display==='none'||s.visibility==='hidden'||r.width<=0||r.height<=0)return false;
        return el.scrollWidth > el.clientWidth + 2 && s.overflowWrap !== 'anywhere' && s.whiteSpace !== 'nowrap';
      }).slice(0,8).map(el => ({tag:el.tagName,cls:String(el.className||''),text:String(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,100),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth})));
      expect(textOverflow, 'text clipping/overflow ' + width + 'px ' + route).toEqual([]);
    }
  }
});

test('event and gallery navigation use canonical, shareable URLs', async ({ page }) => {
  await page.goto(base + '/events', { waitUntil: 'domcontentloaded' });
  const eventCard = page.locator('.jyc57-event-card').first();
  if (await eventCard.count()) {
    await eventCard.click();
    await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/events\/[a-z0-9-]+$/);
    await expect.poll(() => new URL(page.url()).pathname).not.toMatch(/^[0-9a-f-]{20,}$/i);
  }
  await page.goto(base + '/gallery', { waitUntil: 'domcontentloaded' });
  const eagerImages = await page.locator('img[loading="eager"]').count();
  expect(eagerImages).toBeLessThanOrEqual(4);
});

test('club detail route opens from a directory card', async ({ page }) => {
  await page.goto(base + '/clubs', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'club directory');
  const card = page.locator('.jyc57-club-card').first();
  await expect(card, 'published club card is available').toBeVisible();
  await card.click();
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 7000 }).toMatch(/^\/clubs\/[a-z0-9-]+$/);
  await waitForAppMount(page, 'club detail destination');
  await expect(page.locator('h1').first(), 'club detail has a primary heading').toBeVisible();
  await expect(page.locator('h1').first()).not.toBeEmpty();
});

test('event detail route opens from the event directory', async ({ page }) => {
  await page.goto(base + '/events', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'event directory');
  await page.locator('.jyc57-segment').getByRole('button', { name: 'All', exact: true }).click();
  const card = page.locator('.jyc57-event-card').first();
  await expect(card, 'published event card is available').toBeVisible();
  await card.click();
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 7000 }).toMatch(/^\/events\/[a-z0-9-]+$/);
  await waitForAppMount(page, 'event detail destination');
  await expect(page.locator('h1').first(), 'event detail has a primary heading').toBeVisible();
  await expect(page.locator('h1').first()).not.toBeEmpty();
});


test('JAI event does not advertise an expired registration QR as open', async ({ page }) => {
  await page.goto(base + '/events/jai-2026-jaypee-agentic-ai-hackathon', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'JAI expired registration state');

  const qr = page.locator('.event-jai-qr');
  await expect(qr.locator('.event-jai-registration-closed')).toBeVisible();
  await expect(qr.locator('.event-jai-registration-closed')).toContainText('Registration closed');
  await expect(qr.locator('img')).toHaveCount(0);
  await expect(qr.getByText('Scan to register', { exact: true })).toHaveCount(0);
  await expect(qr.getByRole('link', { name: /Open registration/i })).toHaveCount(0);
  await expect(page.locator('#event-register').getByRole('button', { name: /REGISTRATION LINK UNAVAILABLE/i })).toBeDisabled();
});

test('homepage renders the official logo through Dither Veil and a magnetic activity Bento', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'homepage identity and activity design');
  await expect(page.locator('.jh-dither-mark .dither-veil')).toHaveCount(1, { timeout: 15000 });
  await expect(page.getByRole('img', { name: 'Official JIIT Youth Club 128 logo with an interactive Dither Veil effect' })).toBeVisible();
  const ditherSource=page.locator('.jh-dither-mark .dither-veil__fallback');
  await expect(ditherSource).toHaveAttribute('src', '/assets/jyc-logo-medium.avif');
  await expect.poll(()=>ditherSource.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);

  const themeSamples = {};
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
    themeSamples[theme] = await page.evaluate(() => {
      const parse = value => { const match=String(value||'').match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i); return match?[+match[1],+match[2],+match[3]]:null; };
      const luminance = rgb => rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
      const contrast = (a,b) => {const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
      const home=document.querySelector('.jyc-home'),heading=home?.querySelector('.jh-hero h1'),cta=home?.querySelector('.jh-btn-primary'),finalSection=home?.querySelector('.jh-final'),finalHeading=finalSection?.querySelector('h2'),finalCopy=finalSection?.querySelector('p'),finalCta=finalSection?.querySelector('.jh-btn-primary');
      const bg=parse(getComputedStyle(home).backgroundColor),fg=parse(getComputedStyle(heading).color),ctaBg=parse(getComputedStyle(cta).backgroundColor),ctaFg=parse(getComputedStyle(cta).color),finalBg=parse(getComputedStyle(finalSection).backgroundColor),finalFg=parse(getComputedStyle(finalHeading).color),finalCopyFg=parse(getComputedStyle(finalCopy).color),finalCtaBg=parse(getComputedStyle(finalCta).backgroundColor),finalCtaFg=parse(getComputedStyle(finalCta).color);
      return {background:getComputedStyle(home).backgroundColor,headingContrast:bg&&fg?contrast(bg,fg):null,ctaContrast:ctaBg&&ctaFg?contrast(ctaBg,ctaFg):null,finalContrast:finalBg&&finalFg?contrast(finalBg,finalFg):null,finalCopyContrast:finalBg&&finalCopyFg?contrast(finalBg,finalCopyFg):null,finalButtonContrast:finalCtaBg&&finalCtaFg?contrast(finalCtaBg,finalCtaFg):null};
    });
    expect(themeSamples[theme].headingContrast, theme+' homepage heading contrast').toBeGreaterThanOrEqual(4.5);
    expect(themeSamples[theme].ctaContrast, theme+' primary CTA contrast').toBeGreaterThanOrEqual(4.5);
    expect(themeSamples[theme].finalContrast, theme+' final CTA section contrast').toBeGreaterThanOrEqual(4.5);
    expect(themeSamples[theme].finalCopyContrast, theme+' final CTA body copy contrast').toBeGreaterThanOrEqual(4.5);
    expect(themeSamples[theme].finalButtonContrast, theme+' final CTA primary button contrast').toBeGreaterThanOrEqual(4.5);
  }
  expect(themeSamples.light.background, 'light theme uses the light editorial surface').not.toBe(themeSamples.dark.background);

  await page.locator('.jh-activity-bento-shell').scrollIntoViewIfNeeded();
  await expect(page.locator('.jh-activity-bento-shell .magic-bento-card').first()).toBeVisible({ timeout: 15000 });

  const result = await page.evaluate(() => {
    const story = [...document.querySelectorAll('.jyc-home .jh-story-card')];
    const familyImages = document.querySelectorAll('.jyc-home .jh-family-image, .jyc-home .jh-family img').length;
    const archiveWalls = document.querySelectorAll('.jyc-home .jh-archive-section, .jyc-home .jyc-photo-chapters-section').length;
    const heroDitherMarks = document.querySelectorAll('.jyc-home .jh-dither-mark .dither-veil').length;
    const heroDriftWalls = document.querySelectorAll('.jyc-home .jh-hero-drift-wall .drift-wall').length;
    const bentoCards = document.querySelectorAll('.jyc-home .jh-activity-bento-shell .magic-bento-card').length;
    const activityImages = document.querySelectorAll('.jyc-home .jh-activity-bento-shell img').length;
    const storyOverflow = [...document.querySelectorAll('.jyc-home .jh-photo-story-grid')].some(el => el.scrollWidth > el.clientWidth + 1);
    return { storyTiles: story.length, familyImages, archiveWalls, heroDitherMarks, heroDriftWalls, bentoCards, activityImages, storyOverflow };
  });
  expect(result.heroDitherMarks, 'one lazy Dither Veil for the actual JYC logo').toBe(1);
  expect(result.heroDriftWalls, 'continuous hero photo-wall engine removed to reduce load').toBe(0);
  expect(result.bentoCards, 'magnetic activity cards').toBeGreaterThan(0);
  const activityPhotoSources = await page.locator('.jh-activity-bento-shell .magic-bento-card__media img').evaluateAll(images => images.map(img => img.getAttribute('src') || ''));
  expect(activityPhotoSources.filter(src => src.startsWith('/assets/') && !/logo/i.test(src)).length, 'activity cards use real local archive photography, not logo placeholders').toBeGreaterThanOrEqual(4);
  expect(result.familyImages, 'homepage family image duplicates').toBe(0);
  expect(result.archiveWalls, 'homepage retired archive/photo-chapter surfaces').toBe(0);
  expect(result.activityImages, 'activity discovery uses curated source photography instead of text-only cards').toBeGreaterThanOrEqual(4);
  expect(result.storyOverflow, 'homepage photo-story horizontal overflow').toBe(false);
  expect(result.storyTiles).toBeLessThanOrEqual(3);
});

test('gallery archive uses deterministic responsive image frames', async ({ page }) => {
  await page.goto(base + '/gallery', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'gallery layout');
  await page.locator('.jyc-gallery-hero').waitFor({ state: 'visible', timeout: 10000 });
  const result = await page.evaluate(() => {
    const grid = document.querySelector('.public-app .jyc57-masonry');
    const items = [...document.querySelectorAll('.public-app .jyc57-masonry .jyc57-photo')].slice(0, 12);
    return {
      display: grid ? getComputedStyle(grid).display : null,
      overflow: grid ? grid.scrollWidth > grid.clientWidth + 1 : null,
      itemCount: items.length,
      ratios: items.map(item => {
        const r = item.getBoundingClientRect();
        return r.width > 0 && r.height > 0 ? r.width / r.height : null;
      }).filter(Boolean)
    };
  });
  expect(result.display, 'current JYC gallery masonry is present').toBe('grid');
  expect(result.itemCount, 'gallery contains responsive photo frames').toBeGreaterThan(0);
  expect(result.overflow, 'gallery frame grid does not overflow').toBe(false);
  for (const ratio of result.ratios) expect(ratio).toBeGreaterThan(0.45);
  for (const ratio of result.ratios) expect(ratio).toBeLessThan(2.3);
});

test('photo-led pages render real image content without broken assets', async ({ page }) => {
  test.setTimeout(120000);
  for (const route of ['/', '/about', '/clubs', '/events', '/team', '/gallery', '/achievements', '/best-of-jyc']) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    const images = page.locator('img');
    expect(await images.count(), route).toBeGreaterThan(0);
    await expect(page.locator('img:visible').first()).toBeVisible();
    await waitForImagesToSettle(page);
    await expect.poll(async () => images.evaluateAll(nodes => nodes.filter(img => img.complete && img.naturalWidth > 0).length), { timeout: 8000 }).toBeGreaterThan(0);
    const emptyPictureSources = await page.locator('picture.jyc-responsive-picture > img').evaluateAll(nodes => nodes.filter(img => img.getAttribute('src') === '').map(img => img.outerHTML));
    expect(emptyPictureSources, 'responsive photos must not request the current document as an image on '+route).toEqual([]);
    const broken = await images.evaluateAll(nodes => nodes.filter(img => img.complete && img.naturalWidth === 0).map(img => ({src:img.getAttribute('src'),alt:img.getAttribute('alt'),loading:img.loading})));
    expect(broken, 'broken images on '+route).toEqual([]);
  }
});



test('lazy-loaded media decodes across long-form public routes', async ({ page }) => {
  test.setTimeout(180000);
  test.skip([430, 1280].includes(page.viewportSize()?.width), 'Run the exhaustive lazy-media decode sweep at mobile, tablet and large-desktop breakpoints; the other projects still run the full interaction suite.');
  for (const route of ['/about', '/clubs', '/events', '/team', '/gallery', '/achievements', '/best-of-jyc']) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#root .public-app, #root main', { timeout: 15000 }).catch(() => {});
    const initialCount = await page.locator('img').count();
    expect(initialCount, route + ' should render image elements').toBeGreaterThan(0);

    await page.evaluate(async () => {
      const step = Math.max(480, Math.floor(window.innerHeight * 0.75));
      for (let attempt = 0, y = 0; y < document.documentElement.scrollHeight && attempt < 40; attempt++, y += step) {
        window.scrollTo(0, y);
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      window.scrollTo(0, 0);
      const images = [...document.images];
      images.forEach(img => { img.loading = 'eager'; });
      await Promise.all(images.map(img => img.decode().catch(() => undefined)));
    });

    const media = await page.locator('img').evaluateAll(images => images.map(img => ({
      src: img.currentSrc || img.getAttribute('src') || img.getAttribute('srcset') || '',
      loaded: img.complete && img.naturalWidth > 0 && img.naturalHeight > 0,
      hasAlt: img.hasAttribute('alt'),
      loading: img.loading,
      width: img.naturalWidth,
      height: img.naturalHeight
    })));
    const broken = media.filter(img => img.src && !img.loaded);
    const missingAlt = media.filter(img => !img.hasAlt);
    expect(broken, 'unloaded/broken media after lazy-load audit on ' + route).toEqual([]);
    expect(missingAlt, 'images without an explicit alt attribute on ' + route).toEqual([]);
  }
});

test('public pages have no empty media frames or normal-flow section overlaps', async ({ page }) => {
  test.setTimeout(120000);
  test.skip(page.viewportSize()?.width !== 1280, 'This exhaustive route/overlap scan explicitly checks both 390px and 1280px layouts, so run it once rather than repeating the same scan in every browser project.');
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
          if(el.classList.contains('jyc-photo-chapters-head'))return false;
          if(el.classList.contains('jyc-now-media')&&el.querySelector('.jyc-now-media-fallback'))return false;
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

test('legacy JAI event slug redirects to the canonical event route', async ({ page }) => {
  await page.goto(base + '/events/agentic-ai-2026', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'legacy JAI redirect');
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 5000 }).toBe('/events/jai-2026-jaypee-agentic-ai-hackathon');
});

test('gallery deep-link opens the requested photograph', async ({ page }) => {
  await page.goto(base + '/gallery', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'gallery deep-link');
  const trigger=page.locator('.jyc57-photo,.jyc57-feature-card').first();
  await expect(trigger).toBeVisible();
  const photoId=await trigger.getAttribute('data-photo-id');
  const src=await trigger.locator('img').getAttribute('src');
  const key=photoId||src;
  expect(key).toBeTruthy();
  await page.goto(base + '/gallery?photo=' + encodeURIComponent(key), { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'gallery photo deep-link');
  const dialog=page.locator('.jyc57-lightbox[role="dialog"]');
  await expect(dialog).toBeVisible();
  // Verify the lightbox opened the requested photo, not just any photo.
  const requestedId=photoId;
  if (requestedId) {
    await expect(dialog).toHaveAttribute('data-photo-id', requestedId);
  } else {
    const requestedSrc=new URL(src, base).pathname;
    await expect.poll(async () => {
      const actual=await dialog.locator('.jyc57-lightbox-media img').getAttribute('src');
      return actual ? new URL(actual, base).pathname : '';
    }).toBe(requestedSrc);
  }
});


test('gallery album routes are shareable and filter the archive', async ({ page }) => {
  await page.goto(base + '/gallery', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'gallery album route');
  const albumButton=page.locator('.jyc-memories-grid .jyc-memory-card').first();
  await expect(albumButton).toBeVisible();
  const label=(await albumButton.locator('.jyc-memory-title').innerText()).trim();
  await albumButton.click();
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 5000 }).toMatch(/^\/gallery\/[^/]+$/);
  await expect(page.locator('h1').first()).toContainText(label);
  await expect(page.locator('.jyc57-gallery-meta').first()).toContainText('photographs');
});

test('gallery lightbox supports next/previous keyboard navigation', async ({ page }) => {
  await page.goto(base + '/gallery', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'gallery keyboard navigation');
  const trigger=page.locator('.jyc57-photo,.jyc57-feature-card').first();
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await trigger.press('Enter');
  const dialog=page.locator('.jyc57-lightbox[role="dialog"]');
  await expect(dialog).toBeVisible();
  const counter=dialog.locator('.jyc57-counter');
  const before=(await counter.innerText()).trim();
  await page.keyboard.press('ArrowRight');
  await expect.poll(async()=> (await counter.innerText()).trim(), {timeout:3000}).not.toBe(before);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async()=> (await counter.innerText()).trim(), {timeout:3000}).toBe(before);
  await page.keyboard.press('Escape');
});

test('homepage records Core Web Vitals under the browser harness', async ({ page }) => {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'web vitals');
  // Keep the measurement passive: the current editorial homepage has no
  // legacy .search-trigger control, and a failed locator click can consume the
  // entire test timeout without measuring any vitals.
  await page.waitForTimeout(1800);
  const vitals=await page.evaluate(() => {
    const entries=performance.getEntriesByType('navigation');
    const nav=entries[0];
    const lcp=performance.getEntriesByType('largest-contentful-paint').at(-1)?.startTime ?? null;
    const layoutShift=performance.getEntriesByType('layout-shift').reduce((sum,e)=>sum+(e.hadRecentInput?0:e.value),0);
    const interactionEntries=performance.getEntriesByType('event');
    const inp=interactionEntries.length ? Math.max(...interactionEntries.map(e=>Number(e.duration)||0)) : 0;
    return {lcp,cls:layoutShift,inp,domContentLoaded:nav?.domContentLoadedEventEnd||null,load:nav?.loadEventEnd||null};
  });
  console.log('JYC WEB VITALS', JSON.stringify(vitals));
  expect(vitals.domContentLoaded).not.toBeNull();
  if(vitals.lcp!==null) expect(vitals.lcp).toBeLessThan(10000);
  expect(vitals.cls).toBeLessThan(0.25);
  expect(vitals.inp).toBeLessThan(1000);
});

test('homepage remains usable on constrained mobile network', async ({ page }) => {
  test.skip(!/chromium/i.test(test.info().project.name), 'CDP network emulation requires Chromium');
  const client=await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline:false,
    downloadThroughput:1.5*1024*1024/8,
    uploadThroughput:750*1024/8,
    latency:150
  });
  const started=Date.now();
  await page.setViewportSize({width:390,height:844});
  await page.goto(base, { waitUntil:'domcontentloaded', timeout:45000 });
  await waitForAppMount(page, 'constrained mobile');
  const elapsed=Date.now()-started;
  const visibleImages=await page.locator('main img').evaluateAll(nodes => nodes.filter(img => {
    const r=img.getBoundingClientRect();
    return r.width>0&&r.height>0;
  }).length);
  expect(visibleImages).toBeGreaterThan(0);
  expect(elapsed).toBeLessThan(45000);
});

test('gallery lightbox traps focus and restores it after close', async ({ page }) => {
  await page.goto(base + '/gallery', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'gallery');
  const trigger=page.locator('.jyc57-photo,.jyc57-feature-card').first();
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await trigger.press('Enter');
  const dialog=page.locator('.jyc57-lightbox[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('button').first()).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const escapedFocus=await page.evaluate(() => {
    const dialog=document.querySelector('.jyc57-lightbox[role="dialog"]');
    return Boolean(dialog && !dialog.contains(document.activeElement));
  });
  expect(escapedFocus).toBe(false);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('legacy redirects and unknown routes resolve safely', async ({ page }) => {
  test.setTimeout(60000);
  const redirects = {
    '/leadership': '/team',
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
    '/projects': '/clubs',
    '/projects/submit': '/clubs',
    '/map': '/events',
    '/qr/example': '/events',
    '/guide': '/about',
    '/resources': '/about'
  };
  const localBrowserHarness= /^https?:\/\/(127\.0\.0\.1|localhost)(?::\d+)?$/i.test(base);
  for (const [from, to] of Object.entries(redirects)) {
    await page.goto(base + from, { waitUntil: 'domcontentloaded' });
    await expect.poll(() => new URL(page.url()).pathname, { timeout: localBrowserHarness ? 5000 : 3000 }).toBe(to);
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

test('global search opens, accepts keyboard input, and closes cleanly', async ({ page }) => {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.locator('.jyc-home').waitFor({ state: 'visible', timeout: 15000 });
  const trigger=page.locator('.search-trigger').first();
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await trigger.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
  const dialog = page.locator('[role="dialog"]').filter({ hasText: /JYC search/i }).first();
  await expect(dialog).toBeVisible();
  const input = page.getByRole('textbox', { name: /Search JYC/i }).first();
  await expect(input).toBeVisible();
  await input.fill('CICR');
  await page.waitForTimeout(150);
  await expect(page.getByText(/CICR/i).first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});


test('Search and More surfaces follow the light/dark theme with readable text', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'theme-aware search and More');

  const samples = {};
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);

    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
    const search = page.locator('.search-modal');
    await expect(search).toBeVisible();
    samples[theme] = {
      search: await search.evaluate(el => {
        const parse = value => { const match=String(value||'').match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)/i); return match?[Number(match[1]),Number(match[2]),Number(match[3]),match[4]===undefined?1:Number(match[4])]:null; };
        const luminance = rgb => rgb.slice(0,3).map(v=>v/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
        const bg=parse(getComputedStyle(el).backgroundColor),fg=parse(getComputedStyle(el).color);
        const contrast=bg&&fg?(Math.max(luminance(bg),luminance(fg))+.05)/(Math.min(luminance(bg),luminance(fg))+.05):null;
        return { background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color, contrast };
      }),
    };
    await page.keyboard.press('Escape');
    await expect(page.locator('.search-overlay')).toHaveCount(0);

    await page.getByRole('button', { name: 'More' }).click();
    const more = page.locator('.more-sheet');
    await expect(more).toBeVisible();
    samples[theme].more = await more.evaluate(el => {
      const parse = value => { const match=String(value||'').match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)/i); return match?[Number(match[1]),Number(match[2]),Number(match[3]),match[4]===undefined?1:Number(match[4])]:null; };
      const luminance = rgb => rgb.slice(0,3).map(v=>v/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
      const bg=parse(getComputedStyle(el).backgroundColor),fg=parse(getComputedStyle(el).color);
      const contrast=bg&&fg?(Math.max(luminance(bg),luminance(fg))+.05)/(Math.min(luminance(bg),luminance(fg))+.05):null;
      return { background: getComputedStyle(el).backgroundColor, color: getComputedStyle(el).color, contrast };
    });
    await page.keyboard.press('Escape');
    await expect(page.locator('.more-sheet-overlay')).toHaveCount(0);
  }

  expect(samples.light.search.background).not.toBe(samples.dark.search.background);
  expect(samples.light.more.background).not.toBe(samples.dark.more.background);
  for (const theme of ['light', 'dark']) {
    for (const surface of ['search', 'more']) {
      expect(samples[theme][surface].color, theme + ' ' + surface + ' text should be visible').not.toBe('rgba(0, 0, 0, 0)');
      expect(samples[theme][surface].background, theme + ' ' + surface + ' background should be painted').not.toBe('rgba(0, 0, 0, 0)');
      expect(samples[theme][surface].contrast, theme + ' ' + surface + ' contrast should be readable').toBeGreaterThanOrEqual(4.5);
    }
  }
});


test('keyboard can reach the skip link and primary navigation', async ({ page }) => {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.locator('.jyc-home').waitFor({ state: 'visible', timeout: 15000 });
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link').first()).toBeFocused();
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
    await page.waitForTimeout(1200);
    await page.locator('main img, footer img').evaluateAll(images => Promise.all(images
      .filter(img => { const r=img.getBoundingClientRect(); return r.bottom>0 && r.top<window.innerHeight && r.width>0 && r.height>0; })
      .map(img => img.complete ? true : new Promise(resolve => { const done=()=>resolve(true); img.addEventListener('load',done,{once:true}); img.addEventListener('error',done,{once:true}); setTimeout(done,10000); }))));
    const result = await page.locator('main img, footer img').evaluateAll(images => images
      .filter(img => {
        if(['/JYC%20Logo(4).png','/assets/jyc-logo.webp','/jyc-logo-official.webp','/assets/jyc-logo.avif'].includes(new URL(img.currentSrc||img.src,window.location.href).pathname)) return false;
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
  await page.locator('.jyc-home').waitFor({ state: 'visible', timeout: 15000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  const hidden = await page.locator('.jyc-home section').evaluateAll(nodes =>
    nodes.filter(node => {
      const r=node.getBoundingClientRect(), s=getComputedStyle(node);
      return r.width>0 && r.height>0 && (s.opacity==='0' || s.visibility==='hidden' || s.display==='none');
    }).length
  );
  expect(hidden).toBe(0);
});

test('V1 homepage keeps the JYC palette and readable dark mode', async ({ page }) => {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('.jyc-home').waitFor({ state: 'visible', timeout: 15000 });
  // The featured-event dialog intentionally captures input while open.
  // Dismiss it before testing the independent global theme control.
  await page.waitForTimeout(550);
  const featuredClose = page.locator('.jyc-featured-event-close');
  if (await featuredClose.isVisible().catch(() => false)) {
    await featuredClose.click();
    await expect(page.locator('.jyc-featured-event-overlay')).toHaveCount(0);
  }
  const light = await page.locator('.jyc-home').evaluate(el => {
    const s = getComputedStyle(el);
    return { bg:s.backgroundColor, color:s.color };
  });
  await page.locator('.theme-toggle').click();
  await page.waitForTimeout(120);
  const dark = await page.locator('.jyc-home').evaluate(el => {
    const s = getComputedStyle(el);
    return { bg:s.backgroundColor, color:s.color };
  });
  expect(light.bg).not.toBe(dark.bg);
  expect(dark.color).not.toBe('rgba(0, 0, 0, 0)');
});

test('legacy public cards stay flat outside the intentional magnetic bento', async ({ page }) => {
  await page.goto(base + '/clubs', { waitUntil: 'domcontentloaded' });
  const transforms = await page.locator('.club-card-v41,.club-card-premium,.event-card-premium,.gallery-card').evaluateAll(nodes =>
    nodes.map(node => getComputedStyle(node).transform)
  );
  expect(transforms.filter(value => value && value !== 'none' && value.includes('matrix3d')).length).toBe(0);
});

test('homepage hero uses the official JYC logo through Dither Veil without a continuous photo wall', async ({ page }) => {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'JYC hero identity');
  await expect(page.locator('.jh-hero-copy h1')).toBeVisible();
  await expect(page.locator('.jh-dither-mark')).toBeVisible();
  await expect(page.locator('.jh-dither-mark .dither-veil')).toHaveCount(1, { timeout: 15000 });
  await expect(page.getByRole('img', { name: 'Official JIIT Youth Club 128 logo with an interactive Dither Veil effect' })).toBeVisible();
  await expect(page.locator('.jh-hero-drift-wall')).toHaveCount(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});


test('Dither Veil keeps the official logo visible when AVIF is unavailable', async ({ page }) => {
  await page.route('**/assets/jyc-logo-medium.avif', route => route.abort('failed'));
  await page.route('**/assets/jyc-logo.avif', route => route.abort('failed'));
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'Dither logo format fallback');
  const fallback = page.locator('.jh-dither-mark .dither-veil__fallback');
  await expect(fallback).toHaveAttribute('src', '/assets/jyc-logo.webp');
  await expect.poll(() => fallback.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
});


test('search and More sheets keep their surfaces readable in light and dark themes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + '/clubs', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'theme-aware overlays');
  const theme = page.locator('.theme-toggle');
  const currentTheme = await page.locator('html').getAttribute('data-theme');
  if (currentTheme === 'dark') await theme.click();

  await page.locator('.search-trigger').click();
  const search = page.locator('.search-modal');
  await expect(search).toBeVisible();
  const lightSearch = await search.evaluate(el => ({ bg:getComputedStyle(el).backgroundColor, color:getComputedStyle(el).color }));
  await page.locator('.search-close').click();
  await theme.click();
  await page.locator('.search-trigger').click();
  await expect(search).toBeVisible();
  const darkSearch = await search.evaluate(el => ({ bg:getComputedStyle(el).backgroundColor, color:getComputedStyle(el).color }));
  expect(darkSearch.bg).not.toBe(lightSearch.bg);
  expect(darkSearch.color).not.toBe('rgba(0, 0, 0, 0)');
  await page.locator('.search-close').click();

  await page.locator('.nav-more-trigger').click();
  const more = page.locator('.more-sheet');
  await expect(more).toBeVisible();
  const darkMore = await more.evaluate(el => ({ bg:getComputedStyle(el).backgroundColor, color:getComputedStyle(el).color }));
  await page.locator('.sheet-close').click();
  await theme.click();
  await page.locator('.nav-more-trigger').click();
  await expect(more).toBeVisible();
  const lightMore = await more.evaluate(el => ({ bg:getComputedStyle(el).backgroundColor, color:getComputedStyle(el).color }));
  expect(darkMore.bg).not.toBe(lightMore.bg);
  expect(lightMore.color).not.toBe('rgba(0, 0, 0, 0)');
});

test('team profiles flip to readable biographies and verified LinkedIn links', async ({ page }) => {
  await page.goto(base + '/team', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'JYC team profiles');
  const card = page.locator('.team-member-flip:has(.team-back-actions a[href*="linkedin.com"])').first();
  await expect(card).toBeVisible();
  await expect(card.locator('.team-name-front').first()).toBeVisible();
  await expect(card.locator('.team-member-face-content .team-role-tag').first()).toBeVisible();
  await expect(card.locator('.team-photo-editorial img').first()).toBeVisible();
  await card.click({ position: { x: 18, y: 18 } });
  await expect(card).toHaveClass(/is-flipped/);
    await expect(card).toHaveAttribute('aria-expanded', 'true');
    await expect(card.locator('.flip-card__back')).toHaveAttribute('aria-hidden', 'false');
  await expect(card).toHaveAttribute('aria-expanded', 'true');
  await expect(card.locator('.team-back-content .team-back-bio')).toBeVisible();
  await expect(card.locator('.team-back-content a[href*="linkedin.com"]').first()).toHaveAttribute('href', /^https:\/\/(?:www\.|in\.)?linkedin\.com\//);
  await card.locator('.flip-card__back-trigger').click();
  await expect(card).not.toHaveClass(/is-flipped/);
  await card.locator('.flip-card__front').focus();
  await page.keyboard.press('Enter');
  await expect(card).toHaveClass(/is-flipped/);
});



test('responsive photos do not guess AVIF/WebP derivative URLs when the manifest fails', async ({ page }) => {
  const guessedDerivatives = [];
  page.on('request', request => {
    const pathname = new URL(request.url()).pathname;
    if ( /-(?:480|960|1600)\.(?:avif|webp)$/i.test(pathname)) guessedDerivatives.push(pathname);
  });
  await page.route('**/image-manifest.json', route => route.abort());
  await page.goto(base + '/team', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'responsive photo manifest fallback');

  const portrait = page.locator('.team-photo-editorial img').first();
  await expect(portrait).toBeVisible();
  await portrait.scrollIntoViewIfNeeded();
  await expect.poll(() => portrait.evaluate(img => img.complete && img.naturalWidth > 0), { timeout: 10000 }).toBe(true);
  const fallbackContract = await portrait.evaluate(img => ({
    src: img.getAttribute('src'),
    sourceCount: img.parentElement?.querySelectorAll('source').length || 0
  }));
  expect(fallbackContract.src).not.toContain('/photo-derivatives/');
  expect(fallbackContract.sourceCount).toBe(0);
  expect(guessedDerivatives, 'a missing image manifest must not trigger guessed variant requests').toEqual([]);
});





test('responsive photo manifest retries after a transient request failure', async ({ page }) => {
  let attempts = 0;
  await page.route('**/image-manifest.json', route => {
    attempts += 1;
    if (attempts === 1) return route.abort();
    return route.continue();
  });

  await page.goto(base + '/team', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'transient image manifest failure');
  await expect.poll(() => attempts).toBe(1);
  // Let the first aborted request reject and clear the shared promise before mounting new photos.
  await page.waitForTimeout(200);

  await page.locator('a[href="/gallery"]').first().click();
  await expect(page.locator('.jyc-gallery-hub-container')).toBeVisible();
  await expect.poll(() => attempts).toBeGreaterThan(1);
  await expect.poll(() => page.locator('.jyc-gallery-hub-container picture source').count()).toBeGreaterThan(0);
});



test('responsive photo manifest retries after a successful but malformed payload', async ({ page }) => {
  let attempts = 0;
  await page.route('**/image-manifest.json', route => {
    attempts += 1;
    if (attempts === 1) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ version: 1, images: { '/assets/hub-photos/not-real.webp': { width: 0, height: 640, aspectRatio: 0, orientation: 'landscape', derivativesEligible: true } } }) });
    }
    return route.continue();
  });

  await page.goto(base + '/team', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'malformed image manifest payload');
  await expect.poll(() => attempts).toBe(1);
  await page.waitForTimeout(150);
  await page.locator('a[href="/gallery"]').first().click();
  await expect(page.locator('.jyc-gallery-hub-container')).toBeVisible();
  await expect.poll(() => attempts).toBeGreaterThan(1);
  await expect.poll(() => page.locator('.jyc-gallery-hub-container picture source[srcset]').count()).toBeGreaterThan(0);
});


test('responsive pictures recover when generated AVIF and WebP derivatives all fail', async ({ page }) => {
  const failedVariants = [];
  page.on('request', request => {
    const pathname = new URL(request.url()).pathname;
    if (pathname.startsWith('/assets/photo-derivatives/')) failedVariants.push(pathname);
  });
  await page.route('**/assets/photo-derivatives/**', route => route.abort());
  await page.goto(base + '/team', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'responsive picture derivative failure');

  const portrait = page.locator('.team-photo-editorial img').first();
  await expect(portrait).toBeVisible();
  await portrait.scrollIntoViewIfNeeded();
  await expect.poll(() => portrait.evaluate(img => img.parentElement?.querySelectorAll('source').length || 0), { timeout: 15000 }).toBeGreaterThan(0);
  await expect.poll(() => portrait.evaluate(img => img.complete && img.naturalWidth > 0), { timeout: 15000 }).toBe(true);

  const state = await portrait.evaluate(img => ({
    naturalWidth: img.naturalWidth,
    currentSrc: new URL(img.currentSrc || img.src, window.location.href).pathname,
    originalSrc: new URL(img.src, window.location.href).pathname,
    fallbackStage: img.getAttribute('data-image-fallback-stage'),
    alt: img.alt,
    pictureSources: img.parentElement?.querySelectorAll('source').length || 0
  }));
  expect(failedVariants.length, 'test must exercise the generated responsive candidates').toBeGreaterThan(0);
  expect(state.naturalWidth).toBeGreaterThan(0);
  expect(state.currentSrc, 'a failed derivative must not remain the displayed image').not.toContain('/photo-derivatives/');
  expect(state.originalSrc).not.toContain('/photo-derivatives/');
  expect(state.alt.length).toBeGreaterThan(0);
  expect(state.fallbackStage).not.toBe('failed');
});


test('featured JAI popup does not show registration after the verified deadline', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-16T12:00:00.000Z') });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'featured JAI popup deadline');
  await page.clock.runFor(10000);

  const dialog = page.getByRole('dialog', { name: /JAI 2026/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: /Register on Unstop/i })).toHaveCount(0);
  await expect(dialog.getByText('Registration closed · deadline passed')).toBeVisible();
  await expect(dialog.getByRole('link', { name: /Official site/i })).toBeVisible();
});

test('featured event poster uses the shared responsive image fallback contract', async ({ page }) => {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'featured event photo fallback');

  const poster = page.locator('.jh-featured-event-photo img');
  if (await poster.count()) {
    await expect(poster.first()).toBeVisible();
    const state = await poster.first().evaluate(img => ({
      loading: img.loading,
      alt: img.alt,
      hasPictureParent: img.parentElement?.tagName.toLowerCase() === 'picture',
      sourceCount: img.parentElement?.querySelectorAll('source').length || 0
    }));
    expect(state.loading).toBe('lazy');
    expect(state.hasPictureParent).toBeTruthy();
    expect(state.alt.length).toBeGreaterThan(0);
  }
});



test('team flip-card biographies and LinkedIn links remain readable in both themes', async ({ page }) => {
  await page.goto(base + '/team', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'team flip-card theme contrast');

  const card = page.locator('.team-member-flip:has(.team-social-row a[href*="linkedin.com"])').first();
  await expect(card).toBeVisible();
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
    await card.locator('.flip-card__front').click();
    await expect(card).toHaveClass(/is-flipped/);
    const contrast = await card.locator('.flip-card__back').evaluate(back => {
      const parse = value => {
        const match = String(value || '').match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)/i);
        return match ? [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])] : null;
      };
      const luminance = rgb => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      const composite = (foreground, background) => foreground.slice(0, 3).map((value, i) => value * foreground[3] + background[i] * (1 - foreground[3]));
      const ratio = (foreground, background) => {
        const a = luminance(foreground), b = luminance(background);
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      };
      const background = parse(getComputedStyle(back).backgroundColor);
      const bio = parse(getComputedStyle(back.querySelector('.team-back-bio')).color);
      const link = parse(getComputedStyle(back.querySelector('a[href*="linkedin.com"]')).color);
      return { bio: background && bio ? ratio(composite(bio, background), background.slice(0, 3)) : null,
        link: background && link ? ratio(composite(link, background), background.slice(0, 3)) : null };
    });
    expect(contrast.bio, theme + ' team biography contrast').toBeGreaterThanOrEqual(4.5);
    expect(contrast.link, theme + ' LinkedIn contrast').toBeGreaterThanOrEqual(4.5);
    await card.locator('.flip-card__back-trigger').click();
    await expect(card).not.toHaveClass(/is-flipped/);
    await expect(card).toHaveAttribute('aria-expanded', 'false');
    await expect(card.locator('.flip-card__front')).toBeFocused();
    await expect(card.locator('.flip-card__back')).toHaveAttribute('inert', '');
  }
});


test('failed team portraits fall through the optimized logo to the original PNG safely', async ({ page }) => {
  await page.route('**/assets/team/**', route => route.abort());
  await page.route('**/assets/jyc-logo.avif', route => route.abort());
  await page.goto(base + '/team', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'team portrait fallback');

  const portrait = page.locator('.team-photo-editorial img').first();
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute('data-image-fallback-stage', '2');
  await expect(portrait).toHaveAttribute('alt', 'Official JYC logo placeholder; portrait unavailable');
  await expect.poll(() => portrait.evaluate(img => new URL(img.currentSrc || img.src).pathname)).toBe('/JYC%20Logo(4).png');
  await expect.poll(() => portrait.evaluate(img => getComputedStyle(img).objectFit)).toBe('contain');
  await expect.poll(() => portrait.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);

  // A parent/theme render must not restore the failed original portrait URL.
  const themeToggle = page.locator('.theme-toggle').first();
  await expect(themeToggle).toBeVisible();
  await themeToggle.click();
  await expect(portrait).toHaveAttribute('data-image-fallback-stage', '2');
  await expect(portrait).toHaveAttribute('alt', 'Official JYC logo placeholder; portrait unavailable');
  await expect.poll(() => portrait.evaluate(img => new URL(img.currentSrc || img.src).pathname)).toBe('/JYC%20Logo(4).png');
});


test('magnetic bento motion is limited to intended club and event cards', async ({ page }) => {
  await page.goto(base + '/clubs', { waitUntil: 'domcontentloaded' });
  const card = page.locator('.jyc57-club-card').first();
  await expect(card).toBeVisible();
  await card.hover({ position: { x: 12, y: 12 } });
  const offset = await card.evaluate(el => el.style.getPropertyValue('--magnetic-x'));
  expect(offset).not.toBe('');
  await page.mouse.move(0, 0);
  await expect.poll(() => card.evaluate(el => el.style.getPropertyValue('--magnetic-x'))).toBe('');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});

test('featured event popup never blocks the JYC assistant control', async ({ page }) => {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('.jyc-bot-orb').waitFor({ state: 'visible', timeout: 10000 });
  const popup = page.locator('.jyc-featured-event-overlay');
  if (await popup.count()) {
    await expect(popup).toBeVisible();
    const overlayZ = await popup.evaluate(el => Number.parseInt(getComputedStyle(el).zIndex || '0', 10));
    const botZ = await page.locator('.jyc-bot-shell').evaluate(el => Number.parseInt(getComputedStyle(el).zIndex || '0', 10));
    expect(botZ).toBeGreaterThan(overlayZ);
  }
  await page.locator('.jyc-bot-orb').click();
  await expect(page.locator('.jyc-assistant-panel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.jyc-assistant-panel')).toHaveCount(0);
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
test('fixed public controls have no accidental pairwise overlap on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  const result = await page.evaluate(() => {
    const selectors=['.mobile-dock','.jyc-bot-shell'];
    const boxes=selectors.map(sel=>{
      const el=document.querySelector(sel); if(!el) return null;
      const r=el.getBoundingClientRect(); const s=getComputedStyle(el);
      return {sel,left:r.left,right:r.right,top:r.top,bottom:r.bottom,visible:s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
    }).filter(Boolean).filter(x=>x.visible);
    const overlaps=[];
    for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
      const a=boxes[i],b=boxes[j];
      const area=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
      if(area>0)overlaps.push({a:a.sel,b:b.sel,area});
    }
    return overlaps;
  });
  expect(result).toEqual([]);
});



test('Join JYC explains the published recruitment journey and current status', async ({ page }) => {
  await page.goto(base + '/join-jyc', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'Join JYC');
  await expect(page.getByRole('heading', { name: /Ready to Soar\. Join the JYC Student Ecosystem\./ })).toBeVisible();
  await expect(page.getByText(/Explore the published JYC communities and current recruitment notices\./)).toBeVisible();
});



test('gallery interaction contract covers filters, album routes, navigation, zoom and share controls', async ({ page }) => {
  await page.goto(base + '/gallery', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'gallery interaction');
  const firstPhoto=page.locator('.jyc57-feature-card,.jyc57-photo').first();
  await expect(firstPhoto).toBeVisible();

  const albumButton=page.locator('.jyc57-filter-group').filter({ hasText: 'Album' }).locator('button').nth(1);
  if (await albumButton.count()) {
    await albumButton.click();
    await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/gallery\//);
    await expect(page.locator('.jyc57-archive-head h1')).toBeVisible();
    await page.goto(base + '/gallery', { waitUntil: 'domcontentloaded' });
    await waitForAppMount(page, 'gallery interaction reset');
  }

  const collectionButtons=page.locator('.jyc57-filter-group').filter({ hasText: 'Collection' }).locator('button');
  if (await collectionButtons.count() > 1) {
    await collectionButtons.nth(1).click();
    await expect.poll(() => new URL(page.url()).search).toContain('club=');
    await page.goto(base + '/gallery', { waitUntil: 'domcontentloaded' });
    await waitForAppMount(page, 'gallery collection reset');
  }

  await firstPhoto.focus();
  await firstPhoto.press('Enter');
  const dialog=page.locator('.jyc57-lightbox[role="dialog"]');
  await expect(dialog).toBeVisible();
  const counter=dialog.locator('.jyc57-counter');
  const before=await counter.textContent();
  await dialog.getByRole('button', { name: 'Next photo' }).click();
  await expect(counter).not.toHaveText(before || '');
  const image=dialog.locator('.jyc57-lightbox-media img');
  const beforeTransform=await image.evaluate(el => getComputedStyle(el).transform);
  await dialog.getByRole('button', { name: /Zoom In|Reset Zoom/ }).click();
  await expect.poll(() => image.evaluate(el => getComputedStyle(el).transform)).not.toBe(beforeTransform);
  await expect(dialog.getByRole('button', { name: /Share Photo|Link Copied/ })).toBeVisible();
  await dialog.getByRole('button', { name: /Share Photo|Link Copied/ }).click().catch(()=>{});
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('gallery load-more control expands the archive without replacing the route', async ({ page }) => {
  await page.goto(base + '/gallery', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'gallery load-more');
  const loadMore=page.getByRole('button', { name: 'Load 36 more' });
  if (await loadMore.count()) {
    const before=await page.locator('.jyc57-photo').count();
    await loadMore.click();
    await expect.poll(() => page.locator('.jyc57-photo').count()).toBeGreaterThan(before);
    await expect(new URL(page.url()).pathname).toBe('/gallery');
  }
});


test('JYC Assistant search and keyboard close stay functional', async ({ page }) => {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'JYC assistant');
  const bot = page.getByRole('button', { name: 'Open JYC Assistant' });
  await expect(bot).toBeVisible();
  await bot.click();

  const dialog = page.locator('.jyc-assistant-overlay[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');

  const search = page.getByRole('textbox', { name: 'Search JYC content' });
  await expect(search).toBeFocused();
  await search.fill('JAI 2026');
  await expect(page.locator('.jyc-assistant-result').first()).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(bot).toHaveAttribute('aria-expanded', 'false');
});





test('runtime metadata keeps canonical URLs on the production domain from a preview host', async ({ page }) => {
  const route = '/events/jai-2026-jaypee-agentic-ai-hackathon';
  await page.goto(base + route, { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'canonical metadata on preview host');

  const canonical = 'https://jyc-website-eight.vercel.app' + route;
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
});



test('static boot screen respects the saved light/dark theme before React mounts', async ({ page }) => {
  await page.addInitScript(value => localStorage.setItem('jyc-theme', value), 'light');
  await page.route('**/*', route => {
    const pathname = new URL(route.request().url()).pathname;
    if ((pathname.startsWith('/assets/') && /\.(?:js|jsx|mjs)$/.test(pathname)) || pathname === '/@vite/client') return route.abort();
    return route.continue();
  });

  const samples = {};
  for (const theme of ['light', 'dark']) {
    if (theme !== 'light') await page.addInitScript(value => localStorage.setItem('jyc-theme', value), theme);
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    const boot = page.locator('.boot-fallback');
    await expect(boot).toBeVisible();
    const bootLogo = boot.locator('img.boot-logo');
    await expect(bootLogo).toHaveAttribute('src', '/assets/jyc-logo.webp');
    await expect.poll(() => bootLogo.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    samples[theme] = await boot.evaluate(el => {
      const parse = value => { const match=String(value||'').match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i); return match?[+match[1],+match[2],+match[3]]:null; };
      const luminance = rgb => rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
      const contrast = (a,b) => {const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
      const bg=parse(getComputedStyle(el).backgroundColor);
      const measure=selector=>{const fg=parse(getComputedStyle(el.querySelector(selector)).color);return bg&&fg?contrast(bg,fg):null};
      return { theme: document.documentElement.dataset.theme, background:getComputedStyle(el).backgroundColor,
        contrast:{heading:measure('h1'),eyebrow:measure('p'),body:measure('span')} };
    });
    expect(samples[theme].theme).toBe(theme);
    expect(samples[theme].contrast.heading).toBeGreaterThanOrEqual(7);
    expect(samples[theme].contrast.eyebrow).toBeGreaterThanOrEqual(4.5);
    expect(samples[theme].contrast.body).toBeGreaterThanOrEqual(4.5);
  }
  expect(samples.light.background).not.toBe(samples.dark.background);
});


test('public route shells keep route-specific SEO content and one primary heading without JavaScript', async ({ page }) => {
  await page.route('**/*', route => {
    const pathname = new URL(route.request().url()).pathname;
    if ((pathname.startsWith('/assets/') && /\.(?:js|jsx|mjs)$/.test(pathname)) || pathname === '/@vite/client') return route.abort();
    return route.continue();
  });
  const routes = [
    { path: '/', title: 'JIIT Youth Club 128 — Official JYC Website | JIIT Wish Town, Noida' },
    { path: '/contact', requestPath: '/contact/', title: 'Contact JIIT Youth Club 128 | JYC' },
    { path: '/clubs', requestPath: '/clubs/', title: 'JYC Communities & Clubs | JIIT Youth Club 128' },
    { path: '/events/jai-2026-jaypee-agentic-ai-hackathon', requestPath: '/events/jai-2026-jaypee-agentic-ai-hackathon/', title: 'JAI 2026 — Jaypee Agentic AI Hackathon | JYC' }
  ];

  for (const { path, title, requestPath } of routes) {
    // Vite preview serves the generated dist/<route>/index.html at the trailing-slash path.
    // Keep the canonical assertion on the public, slashless route.
    await page.goto(base + (requestPath || path), { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(title);
    const primaryHeading = page.getByRole('heading', { level: 1 });
    await expect(primaryHeading).toHaveCount(1);
    await expect(primaryHeading).toHaveText(title);
    const canonical = 'https://jyc-website-eight.vercel.app' + path;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    const schemas = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(node => JSON.parse(node.textContent || '{}')));
    expect(schemas.some(schema => schema['@type'] === 'WebPage' && schema.name === title && schema.url === canonical)).toBeTruthy();
  }
});


test('JYC Assistant quick routes are distinct and navigate to their labelled destinations', async ({ page }) => {
  await page.goto(base + '/clubs', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'JYC assistant quick routes');
  await page.getByRole('button', { name: 'Open JYC Assistant' }).click();

  const dialog = page.getByRole('dialog', { name: 'Ask JYC. Find your route.' });
  await expect(dialog).toBeVisible();
  const routes = dialog.locator('.jyc-assistant-quick button');
  await expect(routes).toHaveCount(4);
  await expect(routes).toContainText(['Explore all clubs', 'Upcoming events', 'JYC archive', 'Contact JYC']);

  await routes.filter({ hasText: 'Contact JYC' }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe('/contact');
  await expect(dialog).toHaveCount(0);
});


test('JYC Assistant traps keyboard focus and restores focus after closing', async ({ page }) => {
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'JYC assistant focus management');
  const trigger = page.getByRole('button', { name: 'Open JYC Assistant' });
  await trigger.focus();
  await trigger.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Ask JYC. Find your route.' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search JYC content' })).toBeFocused();

  const focusables = dialog.locator('button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])');
  await focusables.last().focus();
  await page.keyboard.press('Tab');
  await expect(dialog.locator('.jyc-assistant-close')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});


test('published JAI external registration route shows the verified provider without auto-navigation', async ({ page }) => {
  await page.goto(base + '/events/jai-2026-jaypee-agentic-ai-hackathon/register', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'JAI external registration route');
  await expect(page.locator('.feature-page h1')).toContainText(/JAI 2026/i);
  await expect(page.getByText('This event uses an external registration form.')).toBeVisible();
  const registrationLink = page.getByRole('link', { name: 'Open registration ↗' });
  await expect(registrationLink).toHaveAttribute('href', /^https:\/\/unstop\.com\//);
  await expect(registrationLink).toHaveAttribute('target', '_blank');
  await expect(registrationLink).toHaveAttribute('rel', /noopener noreferrer/);
  await expect(page).toHaveURL(/\/events\/jai-2026-jaypee-agentic-ai-hackathon\/register$/);
});

test('published JAI event detail renders without entering the recovery boundary', async ({ page }) => {
  await page.goto(base + '/events/jai-2026-jaypee-agentic-ai-hackathon', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'published JAI event detail');
  await expect(page.locator('.event-detail-page')).toBeVisible();
  await expect(page.locator('.event-detail-page h1')).toContainText(/JAI 2026/i);
  await expect(page.getByText('That page hit a problem.')).toHaveCount(0);
});

test('tablet events hero keeps the headline inside its text frame', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto(base + '/events', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'tablet events directory');
  const geometry = await page.locator('.jyc57-page .jyc57-hero h1').evaluate(el => {
    const rect = el.getBoundingClientRect();
    return { client: el.clientWidth, scroll: el.scrollWidth, left: rect.left, right: rect.right, viewport: innerWidth };
  });
  expect(geometry.scroll, 'event headline text must not clip inside its box').toBeLessThanOrEqual(geometry.client + 2);
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewport + 2);
});

test('closed recruitment state still offers useful next steps', async ({ page }) => {
  await page.goto(base + '/recruitment', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'recruitment directory');
  await expect(page.getByText('No published club has recruitment enabled right now.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Explore clubs/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /See events/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Join JYC updates/ })).toBeVisible();
});

test('featured event announcement never blocks mobile navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'JYC homepage');
  await page.waitForTimeout(700);
  await expect(page.locator('.jyc-featured-event-overlay')).toHaveCount(0);
  await expect(page.locator('.mobile-dock')).toBeVisible();
});

test('Best of JYC frames navigate into the matching gallery photo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + '/best-of-jyc', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'Best of JYC editorial selection');
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
  const card = page.locator('.jyc-best-of-page .jyc57-feature-card').first();
  await expect(card).toBeVisible();
  await card.click({ timeout: 7000 });
  await expect(page).toHaveURL(/\/gallery\?photo=/);
  await expect(page.locator('.jyc-gallery-hub-container')).toBeVisible();
});


test('updates API returns a JSON fallback instead of a function crash', async ({ request }) => {
  test.skip(/^(127\.0\.0\.1|localhost)$/.test(new URL(base).hostname), 'Vite preview does not serve Vercel serverless API routes; run this check against a deployed preview.');
  const response = await request.get(base + '/api/jyc-updates');
  expect(response.status(), 'updates API must remain available even when connectors are not configured').toBe(200);
  const payload = await response.json();
  expect(Array.isArray(payload.items), 'updates API must always return an items array').toBe(true);
});


test('responsive photos retry the original source when a derivative returns HTML with HTTP 200', async ({ page, browser }) => {
  const context = await browser.newContext({
    serviceWorkers: 'block',
    viewport: page.viewportSize() || { width: 390, height: 844 }
  });
  const testPage = await context.newPage();
  let derivativeRequests = 0;

  // Keep the source image deterministic and valid so this test exercises the
  // derivative failure path rather than an unrelated missing portrait in fixture data.
  await testPage.route('**/assets/team/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="720" viewBox="0 0 600 720"><rect width="600" height="720" fill="#f5f1e6"/><circle cx="300" cy="220" r="90" fill="#a82420"/><path d="M120 680c10-180 110-260 180-260s170 80 180 260" fill="#bf9c6f"/></svg>'
    });
  });

  await testPage.route('**/assets/photo-derivatives/**', async route => {
    derivativeRequests += 1;
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><body>Not an image</body></html>'
    });
  });

  await testPage.goto(base + '/team', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(testPage, 'derivative HTTP 200 HTML fallback');
  const picture = testPage.locator('.team-photo-editorial .jyc-responsive-picture').filter({ has: testPage.locator('img[src*="/assets/team/"]') }).first();
  await picture.scrollIntoViewIfNeeded();
  await expect.poll(() => derivativeRequests, { timeout: 12000 }).toBeGreaterThan(0);

  const image = picture.locator('img');
  await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0), { timeout: 12000 }).toBeTruthy();
  await expect(image).toHaveAttribute('data-image-fallback-stage', 'original');
  await expect(image).not.toHaveAttribute('src', /photo-derivatives/);
  await context.close();
});

test('recruitment empty state stacks its title and description', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + '/recruitment', { waitUntil: 'domcontentloaded' });
  const empty = page.locator('.feature-empty.large');
  await expect(empty).toBeVisible();
  const layout = await empty.evaluate(el => ({ display: getComputedStyle(el).display, direction: getComputedStyle(el).flexDirection, heading: getComputedStyle(el.querySelector('strong')).display, body: getComputedStyle(el.querySelector('span')).display, gap: getComputedStyle(el).rowGap }));
  expect(layout).toEqual({ display: 'flex', direction: 'column', heading: 'block', body: 'block', gap: '8px' });
});

test('feature hero copy stays readable in light theme on its dark surface', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + '/recruitment', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'feature hero contrast');
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
  const styles = await page.locator('.feature-hero').evaluate(el => ({
    heading: getComputedStyle(el.querySelector('h1')).color,
    body: getComputedStyle(el.querySelector('p')).color,
    background: getComputedStyle(el).backgroundImage
  }));
  expect(styles.heading).toBe('rgb(255, 248, 225)');
  expect(styles.body).toBe('rgb(215, 209, 199)');
  expect(styles.background).toContain('linear-gradient(135deg');
});


test('responsive photos keep a visible accessible identity when every image fallback fails', async ({ page }) => {
  await page.route('**/*', route => {
    const pathname = new URL(route.request().url()).pathname;
    if (/\.(?:avif|webp|png|jpe?g)$/i.test(pathname)) return route.abort();
    return route.continue();
  });

  await page.goto(base + '/team', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'fully failed responsive photo fallback');
  const picture = page.locator('.team-photo-editorial .jyc-responsive-picture').first();
  await expect(picture).toBeVisible();
  await expect(picture).toHaveAttribute('data-image-failed', 'true', { timeout: 10000 });
  await expect(picture).toHaveAttribute('data-image-fallback-label', 'Image unavailable');
  await expect(picture).toHaveAttribute('role', 'img');
  await expect(picture).toHaveAttribute('aria-label', /image unavailable/i);
  const visualFallback = await picture.evaluate(el => ({ before: getComputedStyle(el, '::before').content, after: getComputedStyle(el, '::after').content }));
  expect(visualFallback.before).toContain('JYC');
  expect(visualFallback.after).toContain('Image unavailable');
  await expect(picture.locator('img')).toHaveAttribute('data-image-fallback-stage', 'failed');
});


test('JYC Now fallback cards and filters keep readable contrast in light and dark themes', async ({ page }) => {
  await page.goto(base + '/updates', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'JYC Now theme contrast');
  const card = page.locator('.jyc-now-card').first();
  await expect(card).toBeVisible();
  await expect(page.locator('.jyc-now-status-line')).toContainText(/Curated source directory active|Live connectors active/);
  await expect(card.locator('h3')).toContainText(/JAI 2026|RIDE Hack|CICR/);
  const filter = page.locator('.jyc-now-filter-group button').first();
  await expect(filter).toBeVisible();

  const samples = {};
  for (const theme of ['light', 'dark']) {
    await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme);
    samples[theme] = await card.evaluate(el => {
      const rgb = value => {
        const m = String(value || '').match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
        return m ? [+m[1], +m[2], +m[3]] : null;
      };
      const lum = c => c.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
      const contrast = (a, b) => {
        if (!a || !b) return 0;
        const x = lum(a), y = lum(b);
        return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
      };
      const bg = rgb(getComputedStyle(el).backgroundColor);
      const fg = rgb(getComputedStyle(el).color);
      const paragraph = rgb(getComputedStyle(el.querySelector('p')).color);
      const button = el.ownerDocument.querySelector('.jyc-now-filter-group button');
      return {
        cardTextContrast: contrast(fg, bg),
        paragraphContrast: contrast(paragraph, bg),
        filterBackground: button ? getComputedStyle(button).backgroundColor : '',
        filterText: button ? getComputedStyle(button).color : ''
      };
    });
    expect(samples[theme].cardTextContrast, theme + ' card text contrast').toBeGreaterThanOrEqual(4.5);
    expect(samples[theme].paragraphContrast, theme + ' paragraph contrast').toBeGreaterThanOrEqual(4.5);
  }
  expect(samples.dark.filterBackground).not.toBe(samples.light.filterBackground);
});

test('featured accordion gallery keeps five source-backed panels usable without overflow across viewports', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + '/gallery', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'featured accordion gallery');
  const feature = page.locator('.jyc-accordion-feature');
  await expect(feature).toBeVisible();
  const panels = feature.locator('.ag-panel');
  await expect(panels).toHaveCount(5);
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    await expect(feature).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), width + 'px accordion layout should not overflow').toBeTruthy();
    await panels.nth(1).focus();
    await page.keyboard.press('End');
    await expect(panels.nth(4)).toHaveAttribute('aria-pressed', 'true');
    await panels.nth(1).click();
    await expect(panels.nth(1)).toHaveAttribute('aria-pressed', 'true');
  }
  await feature.getByRole('button', { name: /Open full photograph/i }).click();
  await expect(page.locator('.jyc57-lightbox[role="dialog"]')).toBeVisible();
  await page.locator('.jyc57-lightbox .jyc57-close').click();
  await expect(page.locator('.jyc57-lightbox[role="dialog"]')).toHaveCount(0);
});


test('sparse faculty layout uses only populated tracks and mobile home actions stay unobstructed', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + '/team', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'sparse faculty grid');
  const grid = page.locator('.team-layer-grid--two');
  await expect(grid).toBeVisible();
  const desktopLayout = await grid.evaluate(el => ({
    columns: getComputedStyle(el).gridTemplateColumns.split(' ').length,
    cards: el.children.length,
    width: el.getBoundingClientRect().width,
    background: getComputedStyle(el).backgroundColor
  }));
  expect(desktopLayout.cards, 'two faculty profiles should produce exactly two cards').toBe(2);
  expect(desktopLayout.columns, 'two faculty profiles should not leave a third empty grid track').toBe(2);
  expect(desktopLayout.width, 'two-card faculty grid should be centered and bounded').toBeLessThanOrEqual(560);
  expect(desktopLayout.background, 'sparse faculty grid should not paint an empty third track').toBe('rgba(0, 0, 0, 0)');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await waitForAppMount(page, 'mobile homepage action clearance');
  await expect(page.locator('.jyc-editorial-home .hero-actions')).toBeVisible();
  const fixedOverlap = await page.evaluate(() => {
    const box = selector => { const el = document.querySelector(selector); if (!el) return null; const r = el.getBoundingClientRect(); return { left:r.left, right:r.right, top:r.top, bottom:r.bottom }; };
    const intersects = (a,b) => Boolean(a&&b&&Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))>0&&Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))>0);
    const bot = box('.jyc-bot-shell');
    return { action:intersects(bot,box('.jyc-editorial-home .hero-actions')), nav:intersects(bot,box('.nav')) };
  });
  expect(fixedOverlap.action, 'mobile assistant must not cover homepage primary actions').toBe(false);
  expect(fixedOverlap.nav, 'mobile assistant must not cover the navigation controls').toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'mobile homepage should not overflow').toBeTruthy();
});
