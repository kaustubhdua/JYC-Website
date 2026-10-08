import { test, expect } from '@playwright/test';

const routes=[
  '/','/about','/history','/clubs','/events','/gallery','/team',
  '/best-of-jyc','/archive','/recruitment','/announcements','/updates',
  '/calendar','/fests','/contact','/join-jyc'
];

async function waitForPublicApp(page,label){
  await page.locator('#root').waitFor({state:'attached',timeout:15000});
  await expect(page.locator('body'),label).toBeVisible();
  await page.waitForTimeout(250);
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
    for(let y=0;y<max;y+=Math.max(240,innerHeight*.75)){
      window.scrollTo(0,y);
      await new Promise(r=>setTimeout(r,80));
    }
    window.scrollTo(0,0);
  });
  await page.waitForTimeout(500);
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

test('sitewide routes have no overflow, clipping, off-screen content or fixed-control overlap', async ({page})=>{\n  test.skip(!['mobile-390','desktop-1280'].includes(test.info().project.name));
  for(const route of routes){
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

test('sitewide routes load every visible image successfully and expose alt text', async ({page})=>{\n  test.skip(!['mobile-390','desktop-1280'].includes(test.info().project.name));
  for(const route of ['/', '/clubs', '/events', '/gallery', '/team']){
    await page.goto(route,{waitUntil:'domcontentloaded'});
    await waitForPublicApp(page,route);
    const images=await loadAllImages(page);
    const broken=images.filter(x=>!x.complete||x.naturalWidth===0);
    const missingAlt=images.filter(x=>x.alt===null);
    expect(broken,route+' broken images').toEqual([]);
    expect(missingAlt,route+' images without alt attribute').toEqual([]);
  }
});

test('mobile pages remain centered and controls meet touch-safe sizing', async ({page})=>{\n  test.skip(test.info().project.name!=='mobile-390');
  for(const route of ['/', '/clubs', '/events', '/gallery', '/contact']){
    await page.setViewportSize({width:390,height:844});
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

test('reduced-motion mode disables meaningful public animations', async ({page})=>{\n  test.skip(test.info().project.name!=='desktop-1280');
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

test('gallery lightbox opens, navigates, closes and restores focus without geometry failure', async ({page})=>{\n  test.skip(!['mobile-390','desktop-1280'].includes(test.info().project.name));
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

test('React Bits and Motion surfaces are present without horizontal overflow', async ({page})=>{\n  test.skip(test.info().project.name!=='desktop-1280');
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await waitForPublicApp(page,'motion surfaces');
  const result=await page.evaluate(()=>{
    const selectors=['.rb-rubber','.rb-bell','.depth-carousel','.drift-wall','.flip-card','.jyc-network','.jyc-innovation-motion'];
    return selectors.map(selector=>({selector,count:document.querySelectorAll(selector).length}))
      .filter(x=>x.count>0);
  });
  expect(result.length).toBeGreaterThan(0);
  const geometry=await inspectViewport(page);
  expect(geometry.bodyOverflow).toBe(false);
  expect(geometry.offscreen).toEqual([]);
});
