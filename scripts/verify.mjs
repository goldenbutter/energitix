import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const root=new URL('../analysis/screenshots/',import.meta.url);await fs.mkdir(root,{recursive:true});
const browser=await chromium.launch({headless:true});const report={viewports:[],interactions:[],errors:[]};
for(const [name,width,height] of [['desktop',1440,900],['phone',390,844]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:name==='phone',hasTouch:name==='phone'});
 page.on('pageerror',e=>report.errors.push(`${name}: ${e.message}`));page.on('console',msg=>{if(msg.type()==='error')report.errors.push(`${name}: ${msg.text()}`)});
 await page.goto(process.env.BASE_URL||'http://localhost:5173/',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__energitix?.modelReady);await page.waitForTimeout(2400);
 const targets=await page.evaluate(()=>{
  const top=s=>document.querySelector(s).offsetTop;
  const pin=(s,p)=>top(s)+(document.querySelector(s).offsetHeight-innerHeight)*p;
  const slot=s=>{const r=document.querySelector(`[data-slot="${s}"]`).getBoundingClientRect();return r.top+scrollY+r.height/2-innerHeight/2;};
  return [0,450,slot('reasons'),pin('.anatomy',.02),pin('.anatomy',.3),pin('.anatomy',.58),pin('.anatomy',.86),slot('closeup'),pin('.film',.01),pin('.film',.18),pin('.film',.50),pin('.film',.83),slot('taste'),top('.shop')+180,document.documentElement.scrollHeight-innerHeight];
 });
 const states=[];
 for(let i=0;i<targets.length;i++){
  await page.evaluate(y=>window.scrollTo(0,y),targets[i]);await page.waitForTimeout(850);
  await page.screenshot({path:new URL(`${name}-${String(i).padStart(2,'0')}.png`,root).pathname});
  const state=await page.evaluate(()=>({y:scrollY,...window.__energitix,overflow:document.documentElement.scrollWidth>innerWidth,heroWord:{width:document.querySelector('.hero-word span').getBoundingClientRect().width,available:document.querySelector('.hero-word').clientWidth}}));
  if(state.overflow)report.errors.push(`${name}: horizontal overflow at ${i}`);states.push(state);
 }
 report.viewports.push({name,width,height,states});
 // Verify pack pricing and both product/bag quantity controls.
 await page.locator('#shop').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
 await page.getByRole('button',{name:'6-pack',exact:false}).click();
 if((await page.locator('.price').textContent())!=='NOK 210')throw Error('Incorrect six-pack price');
 await page.getByRole('button',{name:'Increase quantity',exact:true}).click();
 await page.getByRole('button',{name:'Add to bag',exact:false}).click();
 await page.getByRole('button',{name:'View bag',exact:false}).click();
 if((await page.locator('.cart-total strong').textContent())!=='NOK 420')throw Error('Incorrect cart subtotal');
 await page.getByRole('button',{name:'Increase 6-pack quantity',exact:true}).click();
 if((await page.locator('.cart-total strong').textContent())!=='NOK 630')throw Error('Incorrect cart quantity update');
 await page.screenshot({path:new URL(`${name}-cart.png`,root).pathname});
 await page.keyboard.press('Escape');
 if(await page.getByRole('dialog').count())throw Error('Escape did not close dialog');
 await page.locator('.bag-button').evaluate(el=>el.click());
 await page.getByRole('button',{name:'Remove',exact:true}).click();
 if(!await page.getByText('Room for good things.').isVisible())throw Error('Cart empty state missing');
 await page.keyboard.press('Escape');report.interactions.push(`${name}: pack price, quantity, add, subtotal, bag increment, Escape, removal passed`);
 await page.close();
}
const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
await reduced.goto(process.env.BASE_URL||'http://localhost:5173');await reduced.waitForFunction(()=>window.__energitix?.modelReady);await reduced.waitForTimeout(1000);
report.reducedMotion=await reduced.evaluate(()=>({ready:window.__energitix.modelReady,overflow:document.documentElement.scrollWidth>innerWidth,media:matchMedia('(prefers-reduced-motion: reduce)').matches}));
await reduced.close();await browser.close();await fs.writeFile(new URL('../analysis/verification.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({screenshots:32,interactions:report.interactions,errors:report.errors,reducedMotion:report.reducedMotion},null,2));
if(report.errors.length)process.exitCode=1;
