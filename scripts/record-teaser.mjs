import { chromium } from 'playwright';
import { finalizeTeaser } from './finalize-teaser.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const temp=path.join(root,'analysis/teaser-recording');
const out=path.join(root,'public/media');
await fs.mkdir(temp,{recursive:true});await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1600,height:900},deviceScaleFactor:1,recordVideo:{dir:temp,size:{width:1600,height:900}}});
const page=await context.newPage();const errors=[];
page.on('pageerror',error=>errors.push(error.message));
try {
 await page.goto(process.env.TEASER_URL||'http://localhost:5173/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.__energitix?.modelReady);
 await page.evaluate(async()=>{
  await document.fonts.ready;
  // Warm the film cache before recording, without changing the page's layout.
  for(let start=0;start<192;start+=16){
   await Promise.all(Array.from({length:Math.min(16,192-start)},async(_,j)=>{
    const name=String(start+j).padStart(4,'0');
    await Promise.all(['frames','can-masks'].map(folder=>new Promise((resolve,reject)=>{
     const image=new Image();image.onload=resolve;image.onerror=reject;image.src=`/assets/${folder}/${name}.webp`;
    })));
   }));
  }
 });
 await page.waitForTimeout(1800);
 await page.screenshot({path:path.join(out,'teaser-poster.jpg'),type:'jpeg',quality:92});
 const started=Date.now();
 console.log('Recording desktop tour: hero → details → film → shop → footer');
 const schedule=await page.evaluate(async()=>{
  const top=selector=>document.querySelector(selector).offsetTop;
  const pin=(selector,p)=>top(selector)+(document.querySelector(selector).offsetHeight-innerHeight)*p;
  const bottom=document.documentElement.scrollHeight-innerHeight;
  const stages=[
   [0,2.5,'Hero'],
   [top('.reasons')+80,4.5,'The energy'],
   [pin('.anatomy',0),4,'All in the details'],
   [pin('.anatomy',1),11,'Four product details'],
   [top('.close-up')+80,4.5,'Close-up'],
   [pin('.film',0),4,'Film entrance'],
   [pin('.film',.94),11,'Scroll-controlled commercial'],
   [top('.taste')+70,4,'Bring the energy'],
   [top('.shop')+100,4,'Demo shop'],
   [bottom,4,'iBithun footer'],
   [bottom,2.5,'Closing hold'],
  ];
  const result=[];
  for(const [target,seconds,label] of stages){
   const from=scrollY,start=performance.now();
   await new Promise(resolve=>{
    const frame=now=>{
     const t=Math.min(1,(now-start)/(seconds*1000));
     const eased=t*t*(3-2*t);
     scrollTo(0,from+(target-from)*eased);
     if(t<1)requestAnimationFrame(frame);else resolve();
    };requestAnimationFrame(frame);
   });
   result.push({label,seconds,scrollY});
  }
  return result;
 });
 const duration=(Date.now()-started)/1000;
 await page.close();await context.close();
 const raw=await page.video().path();
 const rawDuration=Number(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',raw],{encoding:'utf8'}).trim());
 const trim=Math.max(0,rawDuration-duration);
 const mp4=path.join(temp,'recorded-tour.mp4');
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(trim),'-i',raw,'-t',String(duration),'-an','-c:v','libx264','-preset','slow','-crf','20','-pix_fmt','yuv420p','-r','30','-movflags','+faststart',mp4],{stdio:'inherit'});
 const final=await finalizeTeaser(mp4,out);
 await fs.writeFile(path.join(temp,'receipt.json'),JSON.stringify({viewport:[1600,900],duration,trim,schedule,errors,final},null,2));
 if(errors.length)throw new Error(errors.join('\n'));
 console.log(`Saved ${final.duration.toFixed(1)}s MP4 and README GIF preview to public/media/`);
}finally{await browser.close();}
