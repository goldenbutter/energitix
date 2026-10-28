import { chromium, webkit } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://localhost:5173';
const dir=new URL('../analysis/film-verification/',import.meta.url);await fs.mkdir(dir,{recursive:true});
const report={base,cases:[],errors:[]};
const sizes=[['small-phone',320,693],['phone',390,844],['large-phone',430,932],['tablet',768,1024],['landscape',844,390],['desktop',1440,900],['wide',1920,1080]];
const engines=[['chromium',chromium],['webkit',webkit]].filter(([name])=>!process.env.FILM_ENGINES||process.env.FILM_ENGINES.split(',').includes(name));
for(const [engineName,engine] of engines){
 const browser=await engine.launch({headless:true});
 try{
  if(!process.env.FILM_SPECIAL_ONLY)for(const [name,width,height] of sizes.filter(([name])=>!process.env.FILM_SIZES||process.env.FILM_SIZES.split(',').includes(name))){
   const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
   page.on('pageerror',e=>report.errors.push(`${engineName}/${name}: ${e.message}`));
   await page.goto(base,{waitUntil:'networkidle'});
   await page.waitForFunction(()=>window.__energitix?.modelReady);
   await page.locator('.preloader').waitFor({state:'hidden'});
   await page.evaluate(()=>document.fonts.ready);
   const bounds=await page.evaluate(()=>{const el=document.querySelector('.film');return {top:el.offsetTop,range:el.offsetHeight-innerHeight};});
   const positions=[bounds.top-60,...[0,.015,.03,.059,.065,.3,.65,.935,.97,.995,1].map(p=>bounds.top+bounds.range*p),bounds.top+bounds.range+60];
   const states=[];
   for(const [direction,ys] of [['down',positions],['up',[...positions].reverse()]]){
    for(let i=0;i<ys.length;i++){
     await page.evaluate(y=>scrollTo(0,y),ys[i]);await page.waitForTimeout(160);
     const state=await page.evaluate(()=>{const c=document.querySelector('.film-canvas'),p=document.querySelector('.film-product-canvas'),h=document.querySelector('.film-heading');return {y:scrollY,filmTop:document.querySelector('.film').getBoundingClientRect().top,opacity:Number(c.style.opacity),productOpacity:Number(p.style.opacity),mask:getComputedStyle(h).maskImage,overflow:document.documentElement.scrollWidth>innerWidth,modelOpacity:window.__energitix?.videoOpacity};});
     assert.equal(state.overflow,false,`${engineName}/${name}/${direction}/${i}: overflow`);
     assert.equal(state.opacity,state.productOpacity,'Film and solid can must fade together');
     assert.ok(Math.abs(state.opacity-state.modelOpacity)<.02,'3D handoff must follow actual film visibility');
     if(state.opacity===0)assert.equal(state.mask,'none',`${engineName}/${name}/${direction}/${i}: invisible film must not cut holes in the title`);
     states.push({direction,...state});
     if([0,4,7,12].includes(i))await page.screenshot({path:new URL(`${engineName}-${name}-${direction}-${i}.png`,dir).pathname});
    }
   }
   // Pixel oracle: before the film appears, the title must match its complete,
   // unoccluded rendering. Hide the moving 3D model in both captures only.
   await page.evaluate(y=>scrollTo(0,y),bounds.top-60);await page.waitForTimeout(350);
   const hide=await page.addStyleTag({content:'.product-canvas,.product-shadow,.product-glow,.hotspot{visibility:hidden!important}'});
   const actual=await page.locator('.film-heading').screenshot();
   const clear=await page.addStyleTag({content:'.film-heading{mask-image:none!important;-webkit-mask-image:none!important}'});
   const expected=await page.locator('.film-heading').screenshot();
   assert.ok(actual.equals(expected),`${engineName}/${name}: title pixels differ from the unoccluded reference`);
   await clear.evaluate(el=>el.remove());await hide.evaluate(el=>el.remove());
   report.cases.push({engine:engineName,name,width,height,samples:states.length,titlePixels:'identical',states});
   console.log(`${engineName}/${name}: ${states.length} forward/reverse samples + title pixel comparison passed`);
   await page.close();
  }
  if(!process.env.FILM_SKIP_SPECIAL){
  for(const reduced of [false,true]){
   const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:reduced?'reduce':'no-preference'});
   let release;const gate=new Promise(resolve=>{release=resolve;});
   await page.route('**/assets/can-masks/*.webp',async route=>{await gate;await route.continue();});
   await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__energitix?.modelReady);
   await page.evaluate(()=>{const el=document.querySelector('.film');scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*.4);});
   await page.waitForTimeout(1100);
   const waiting=await page.evaluate(()=>({film:Number(document.querySelector('.film-canvas').style.opacity),model:Number(document.querySelector('.product-canvas').style.opacity)}));
   assert.equal(waiting.film,0,'Do not show the film before its solid product matte is ready');
   assert.ok(waiting.model>.9,`Keep the 3D can visible while media loads: ${JSON.stringify(waiting)}`);
   release();await page.waitForFunction(()=>Number(document.querySelector('.film-canvas').style.opacity)===1);
   await page.screenshot({path:new URL(`${engineName}-delayed-${reduced?'reduced':'normal'}.png`,dir).pathname});
   report.cases.push({engine:engineName,name:`delayed-media-${reduced?'reduced':'normal'}`,passed:true});await page.close();
  }
  // A real mobile pixel density plus live orientation/viewport changes.
  const resized=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await resized.goto(base,{waitUntil:'networkidle'});await resized.waitForFunction(()=>window.__energitix?.modelReady);
  for(const [width,height] of [[390,844],[844,390],[390,740]]){
   await resized.setViewportSize({width,height});
   await resized.evaluate(()=>{const el=document.querySelector('.film');scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*.4);});
   await resized.waitForFunction(()=>Number(document.querySelector('.film-canvas').style.opacity)===1);
   await resized.waitForTimeout(400);
   const state=await resized.evaluate(()=>{const a=document.querySelector('.film-canvas'),b=document.querySelector('.film-product-canvas');return {a:[a.width,a.height],b:[b.width,b.height],expected:[Math.trunc(innerWidth*Math.min(devicePixelRatio,1.5)),Math.trunc(innerHeight*Math.min(devicePixelRatio,1.5))],overflow:document.documentElement.scrollWidth>innerWidth};});
   assert.deepEqual(state.a,state.expected);assert.deepEqual(state.b,state.a);assert.equal(state.overflow,false);
   await resized.screenshot({path:new URL(`${engineName}-resize-${width}-${height}.png`,dir).pathname});
  }
  await resized.close();report.cases.push({engine:engineName,name:'mobile-dpr2-resize',passed:true});
  }
 }finally{await browser.close();}
}
assert.deepEqual(report.errors,[]);
await fs.writeFile(new URL(`report-${engines.map(([name])=>name).join('-')}${process.env.FILM_SPECIAL_ONLY?'-special':''}.json`,dir),JSON.stringify(report,null,2));
console.log(`Passed ${report.cases.length} cases; no browser exceptions.`);
