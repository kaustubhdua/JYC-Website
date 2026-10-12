import { test, expect } from '@playwright/test';

const routes=[
  '/','/about','/history','/clubs','/events','/gallery','/team',
  '/best-of-jyc','/achievements','/archive','/recruitment','/announcements','/updates',
  '/calendar','/fests','/contact','/join-jyc'
];

const routesForProject = projectName => ['desktop-1280','desktop-1440'].includes(projectName)
  ? routes
  : ['/','/clubs','/events','/gallery','/team','/updates','/contact'];

const routeMatrix = projectName => ['desktop-1280','desktop-1440'].includes(projectName)
  ? routes
  : ['/','/clubs','/events','/gallery','/team','/updates','/contact'];

async function waitForPublicApp(page,label){
  await page.locator('#root').waitFor({state:'attached',timeout:15000});
  await expect(page.locator('body'),label).toBeVisible();
  // The shell intentionally waits for the data/cache boot gate before mounting
  // .public-app. Waiting only for #root races the loading screen and creates
  // false blank-page/image failures across every viewport.
  await page.locator('.public-app').waitFor({state:'visible',timeout:20000});
  await page.waitForFunction(() => document.documentElement.dataset.jycContentReady === 'true', { timeout: 20000 });
  await expect(page.locator('.public-app h1, .public-app h2, .public-app p, .public-app a, .public-app button').first(),label+' visible public content').toBeVisible({timeout:10000});
}

async function inspectViewport(page){
  return page.evaluate(()=>{
    const vw=window.innerWidth, vh=window.innerHeight;
    const body=document.body;
    const visible=el=>{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0&&r.width>0&&r.height>0;
    };
    const offscreen=[];
    const clipped=[];
    for(const el of document.querySelectorAll('.public-app *')){
      if(!visible(el))continue;
      const r=el.getBoundingClientRect();
      if(r.left < -2 || r.right > vw+2) {
        const overflowX=getComputedStyle(el).overflowX;
        if(overflowX!=='hidden'&&overflowX!=='clip')offscreen.push({tag:el.tagName,cls:String(el.className||'').slice(0,100),left:r.left,right:r.right});
      }
      if(['H1','H2','H3','H4','P','A','BUTTON','SPAN','SMALL','STRONG'].includes(el.tagName)){
        if(el.scrollWidth>el.clientWidth+2 && getComputedStyle(el).whiteSpace!=='nowrap'){
          clipped.push({tag:el.tagName,text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,100),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth});
        }
      }
    }
    const fixed=[...document.querySelectorAll('.mobile-dock,.bottom-nav,.jyc-mobile-nav,.jyc-bot-shell,.toast,.skip-link')].filter(visible).map(el=>{
      const r=el.getBoundingClientRect();return{el:String(el.className||el.tagName),left:r.left,right:r.right,top:r.top,bottom:r.bottom};
    });
    const overlaps=[];
    for(let i=0;i<fixed.length;i++)for(let j=i+1;j<fixed.length;j++){
      const a=fixed[i],b=fixed[j];
      const area=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
      if(area>1)overlaps.push({a:a.el,b:b.el,area});
    }
    const headings=[...document.querySelectorAll('.public-app h1,.public-app h2')].filter(visible).slice(0,20);
    const headingIssues=headings.filter(el=>{
      const r=el.getBoundingClientRect();
      return r.left < 0 || r.right > vw || r.top < -vh || r.bottom > document.documentElement.scrollHeight+2;
    }).map(el=>({text:(el.textContent||'').trim().slice(0,100)}));
    return {
      bodyOverflow:body.scrollWidth>vw+1,
      offscreen:offscreen.slice(0,12),
      clipped:clipped.slice(0,12),
      overlaps,
      headingIssues,
      hasVisibleText:[...document.querySelectorAll('.public-app h1,.public-app h2,.public-app p,.public-app a,.public-app button')].some(visible)
    };
  });
}

async function loadAllImages(page){
  await page.evaluate(async()=>{
    const max=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);
    const step=Math.max(600,Math.floor(innerHeight*1.5));
    for(let y=0;y<max;y+=step){
      window.scrollTo(0,y);
      // Two frames let the viewport and native lazy-image observer settle
      // without sleeping 100ms for every scroll position.
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    }
    window.scrollTo(0,0);
    const visible=img=>{
      const s=getComputedStyle(img),r=img.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
    };
    // Lazy images need a real load/error completion before naturalWidth can
    // distinguish a broken asset from an image that is still downloading.
    await Promise.all([...document.images].filter(visible).map(img=>new Promise(resolve=>{
      if(img.complete)return resolve();
      const done=()=>{img.removeEventListener('load',done);img.removeEventListener('error',done);resolve()};
      img.addEventListener('load',done,{once:true});
      img.addEventListener('error',done,{once:true});
      setTimeout(done,2500);
    })));
  });
  return page.evaluate(()=>{
    const visible=el=>{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
    };
    return [...document.images].filter(visible).map(img=>({
      src:img.currentSrc||img.src,
      complete:img.complete,
      naturalWidth:img.naturalWidth,
      alt:img.getAttribute('alt'),
      loading:img.getAttribute('loading')
    }));
  });
}

test('sitewide routes have no overflow, clipping, off-screen content or fixed-control overlap', async ({page})=>{
  test.skip(!['mobile-390','mobile-430','tablet-768','desktop-1280','desktop-1440'].includes(test.info().project.name));
  for(const route of routeMatrix(test.info().project.name)){
    await page.goto(route,{waitUntil:'domcontentloaded'});
    await waitForPublicApp(page,route);
    const result=await inspectViewport(page);
    expect(result.bodyOverflow,route+' body overflow').toBe(false);
    expect(result.offscreen,route+' offscreen').toEqual([]);
    expect(result.clipped,route+' clipped text').toEqual([]);
    expect(result.overlaps,route+' fixed overlap').toEqual([]);
    expect(result.headingIssues,route+' heading geometry').toEqual([]);
    expect(result.hasVisibleText,route+' visible content').toBe(true);
  }
});

test('sitewide routes load every visible image successfully and expose alt text', async ({page})=>{
  // This audit intentionally visits every public route and waits for all rendered
  // images; allow it more than the default 30s when the media-heavy gallery runs in CI.
  test.setTimeout(90000);
  test.skip(!['mobile-390','mobile-430','tablet-768','desktop-1280','desktop-1440'].includes(test.info().project.name));
  for(const route of routeMatrix(test.info().project.name)){
    await page.goto(route,{waitUntil:'domcontentloaded'});
    await waitForPublicApp(page,route);
    const images=await loadAllImages(page);
    const broken=images.filter(x=>x.complete&&x.naturalWidth===0);
    const missingAlt=images.filter(x=>x.alt===null);
    expect(broken,route+' broken images').toEqual([]);
    expect(missingAlt,route+' images without alt attribute').toEqual([]);
  }
});

test('mobile pages remain centered and controls meet touch-safe sizing', async ({page})=>{
  test.skip(!['mobile-390','mobile-430','tablet-768'].includes(test.info().project.name));
  for(const route of ['/', '/clubs', '/events', '/gallery', '/contact']){
    await page.setViewportSize(test.info().project.name==='mobile-430'?{width:430,height:932}:test.info().project.name==='tablet-768'?{width:768,height:1024}:{width:390,height:844});
    await page.goto(route,{waitUntil:'domcontentloaded'});
    await waitForPublicApp(page,route);
    const result=await page.evaluate(()=>{
      const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0};
      const controls=[...document.querySelectorAll('.public-app button,.public-app .btn,.public-app .filter-toggle,.public-app .nav button')].filter(visible);
      const tooSmall=controls.filter(el=>{const r=el.getBoundingClientRect();return r.width<40||r.height<40}).slice(0,12).map(el=>({tag:el.tagName,text:(el.textContent||'').trim().slice(0,60),w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}));
      const containers=[...document.querySelectorAll('.public-app .section,.public-app .page,.public-app .section-head,.public-app .reference-section-head')].filter(visible);
      const outside=containers.filter(el=>{const r=el.getBoundingClientRect();return r.left<-1||r.right>innerWidth+1}).slice(0,8).map(el=>({cls:String(el.className||''),left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right}));
      return{tooSmall,outside};
    });
    expect(result.tooSmall,route+' small controls').toEqual([]);
    expect(result.outside,route+' non-centered/outside containers').toEqual([]);
  }
});

test('reduced-motion mode disables meaningful public animations', async ({page})=>{
  test.skip(!['tablet-768','desktop-1280','desktop-1440'].includes(test.info().project.name));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await waitForPublicApp(page,'reduced motion');
  const result=await page.evaluate(()=>{
    const samples=[...document.querySelectorAll('.home .hero-copy,.home .hero-art,.home .hero-rule,.home .hero-logo-stage img,.public-app .reveal,.jyc57-photo-story-frame')].filter(el=>{
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return r.width>0&&r.height>0;
    }).map(el=>{
      const s=getComputedStyle(el);
      return{cls:String(el.className||''),animationName:s.animationName,animationDuration:s.animationDuration,transitionDuration:s.transitionDuration};
    });
    return samples;
  });
  const active=result.filter(x=>x.animationName!=='none'&&x.animationDuration!=='0s'&&x.animationDuration!=='0.001ms');
  expect(active,'reduced-motion active animations').toEqual([]);
});

test('gallery lightbox opens, navigates, closes and restores focus without geometry failure', async ({page})=>{
  test.skip(!['mobile-390','desktop-1280'].includes(test.info().project.name));
  await page.goto('/gallery',{waitUntil:'domcontentloaded'});
  await waitForPublicApp(page,'gallery');
  const trigger=page.locator('.jyc57-photo,.jyc57-feature-card').first();
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await trigger.press('Enter');
  const dialog=page.locator('.jyc57-lightbox[role="dialog"]');
  await expect(dialog).toBeVisible();
  const before=(await dialog.locator('.jyc57-counter').innerText()).trim();
  await page.keyboard.press('ArrowRight');
  await expect.poll(async()=>await dialog.locator('.jyc57-counter').innerText()).not.toBe(before);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('React Bits and Motion surfaces are present without horizontal overflow', async ({page})=>{
  test.skip(!['desktop-1280','desktop-1440'].includes(test.info().project.name));
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await waitForPublicApp(page,'motion surfaces');
  const result=await page.evaluate(()=>{
    // The active V1 homepage is editorial-first; assert its real motion/network
    // surfaces rather than retired component class names from earlier designs.
    const selectors=['.jh-hero','.jyc-network','.jyc-innovation-motion','.jyc57-photo-story-frame','.jh-family-grid','.jh-activity-grid'];
    return selectors.map(selector=>({selector,count:document.querySelectorAll(selector).length}))
      .filter(x=>x.count>0);
  });
  expect(result.length,'current editorial motion/content surfaces are mounted').toBeGreaterThan(0);
  expect(result.some(x=>x.selector==='.jh-hero'||x.selector==='.jyc-network'),'V1 homepage hero or network surface is present').toBe(true);
  const geometry=await inspectViewport(page);
  expect(geometry.bodyOverflow).toBe(false);
  expect(geometry.offscreen).toEqual([]);
});
