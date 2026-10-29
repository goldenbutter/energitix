import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const data=async(path,type)=>`data:${type};base64,${(await fs.readFile(new URL(path,root))).toString('base64')}`;
const [can,logo,font]=await Promise.all([
 data('public/assets/can-cutout.webp','image/webp'),
 data('public/assets/energitix-wordmark.webp','image/webp'),
 data('node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2','font/woff2'),
]);
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
 await page.setContent(`<!doctype html><html><head><style>
 @font-face{font-family:Manrope;src:url('${font}');font-weight:200 800}
 *{box-sizing:border-box}body{margin:0;width:1200px;height:630px;overflow:hidden;background:#f6f3eb;color:#171713;font-family:Manrope,sans-serif}
 .card{position:relative;width:100%;height:100%;overflow:hidden;background:radial-gradient(ellipse at 84% 52%,#ffba714d,transparent 46%)}
 .wordmark{position:absolute;left:62px;top:48px;width:370px;height:auto}
 .eyebrow{position:absolute;left:64px;top:200px;font-size:12px;font-weight:800;letter-spacing:2.5px}
 h1{position:absolute;left:60px;top:242px;margin:0;font-size:90px;line-height:1.02;letter-spacing:-4px;word-spacing:6px;font-weight:800}
 h1 span{color:#f56b19}
 .glow{position:absolute;width:426px;height:426px;left:724px;top:96px;border-radius:50%;background:radial-gradient(circle at 38% 35%,#ffa247,#ff711c 55%,#ec5510);box-shadow:0 0 80px #f56b191c}
 .orbit{position:absolute;left:702px;top:74px;width:470px;height:470px;border:1px solid #f56b1940;border-radius:50%}
 .can{position:absolute;left:816px;top:40px;height:548px;width:auto;transform:rotate(12deg);filter:drop-shadow(14px 20px 14px #4922083b)}
 .bottom{position:absolute;left:64px;right:64px;bottom:43px;border-top:1px solid #17171325;padding-top:20px;display:flex;align-items:center;justify-content:space-between;font-size:14px;font-weight:600;letter-spacing:.2px}
 .credit{display:flex;align-items:center;gap:10px}.dot{width:7px;height:7px;border-radius:50%;background:#f56b19}.credit strong{font-weight:800}.url{font-size:12px;letter-spacing:.5px}
 </style></head><body><main class="card"><div class="orbit"></div><div class="glow"></div><img class="wordmark" src="${logo}" alt="ENERGITIX"><div class="eyebrow">INTERACTIVE PRODUCT CONCEPT</div><h1>Bring the<br><span>energy.</span></h1><img class="can" src="${can}" alt="ENERGITIX energy drink can"><footer class="bottom"><span class="credit"><span class="dot"></span>Designed & developed by <strong>iBithun</strong></span><span class="url">energitix.ibithun.com</span></footer></main></body></html>`);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 const path=new URL('public/media/energitix-og-card.jpg',root).pathname;
 await page.screenshot({path,type:'jpeg',quality:94});console.log(path);
}finally{await browser.close();}
