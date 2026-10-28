import {chromium,webkit} from 'playwright';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const base=process.env.BASE_URL||'http://localhost:5173';
const out=new URL('../analysis/splash-verification/',import.meta.url);await fs.mkdir(out,{recursive:true});
const checks=[];
const frames=process.env.SPLASH_BEFORE?[100]:[0,16,32,48,64,72,80,88,96,100,104,112,120,128,144,160,176,191];
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 if(process.env.SPLASH_BEFORE&&name!=='chromium')continue;
 const browser=await engine.launch();
 try{
  for(const [width,height] of [[1440,900],[390,844]]){
   if(process.env.SPLASH_BEFORE&&width!==1440)continue;
   const page=await browser.newPage({viewport:{width,height}});
   await page.goto(base,{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__energitix?.modelReady);
   await page.locator('.preloader').waitFor({state:'hidden'});
   await page.evaluate(()=>{const el=document.querySelector('.film');scrollTo(0,el.offsetTop+300);});
   await page.waitForFunction(()=>window.__energitix?.loadedFrames===192,{},{timeout:60000});
   for(const index of frames){
    await page.evaluate(index=>{const el=document.querySelector('.film');scrollTo(0,el.offsetTop+(el.offsetHeight-innerHeight)*(.065+index/191*.87));},index);
    await page.waitForFunction(index=>window.__energitix?.filmFrame===index,index);
    // Keep the comparison away from the solid can: this is the part of the
    // background lettering that should never be occluded by the product.
    const clip=await page.locator('.film-heading').evaluate(el=>{const r=el.getBoundingClientRect();return {x:Math.ceil(r.left),y:Math.ceil(r.top),width:Math.floor(Math.min(r.width,innerWidth*.25)),height:Math.floor(r.height)};});
    const actual=new URL(`${name}-${width}-${index}-actual.png`,out).pathname;
    const reference=new URL(`${name}-${width}-${index}-reference.png`,out).pathname;
    await page.screenshot({path:actual,clip});
    const hide=await page.addStyleTag({content:'.film-canvas,.film-product-canvas,.product-canvas{visibility:hidden!important}'});
    await page.screenshot({path:reference,clip});await hide.evaluate(el=>el.remove());
    checks.push({name,width,index,actual,reference});
   }
   await page.screenshot({path:new URL(`${name}-${width}-end.png`,out).pathname});await page.close();
   console.log(`${name}/${width}: captured ${frames.length} splash frames`);
  }
 }finally{await browser.close();}
}
await fs.writeFile(new URL('captures.json',out),JSON.stringify(checks,null,2));
const python=new URL('../.venv/bin/python',import.meta.url).pathname;
const result=execFileSync(python,['-c',`
import json,sys
from PIL import Image
import numpy as np
checks=json.load(open(sys.argv[1]));results=[]
for c in checks:
 actual=np.asarray(Image.open(c['actual']).convert('RGB')).astype(int)
 reference=np.asarray(Image.open(c['reference']).convert('RGB')).astype(int)
 # Use solid black/ivory letter interiors, not antialiased edge/background pixels.
 letters=(np.abs(reference-np.array([246,243,235])).max(2)<=2)|(np.abs(reference-np.array([23,23,19])).max(2)<=2)
 count=int(letters.sum())
 changed=int(((np.abs(actual-reference).max(2)>4)&letters).sum())
 result={**{k:c[k] for k in ['name','width','index']},'letterPixels':count,'changedLetterPixels':changed}
 results.append(result)
print(json.dumps(results))
if any(c['letterPixels']<100 or c['changedLetterPixels']/max(1,c['letterPixels'])>.005 for c in results):sys.exit(1)
`,new URL('captures.json',out).pathname],{encoding:'utf8'});
await fs.writeFile(new URL('report.json',out),result);console.log(`Passed ${checks.length} stable-lettering pixel checks.`);
