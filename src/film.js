import { getFilmLayout } from './film-layout.js';
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export function createFilm(canvas,{asset,reduced,audio,sound}){
 const context=canvas.getContext('2d',{alpha:false});const section=canvas.closest('.film'),heading=section.querySelector('.film-heading');
 const productCanvas=section.querySelector('.film-product-canvas'),productContext=productCanvas.getContext('2d');
 const cutout=document.createElement('canvas');cutout.width=1280;cutout.height=720;
 const cutoutContext=cutout.getContext('2d');
 // The solid product canvas provides occlusion. Never erase the headline:
 // its video silhouette is in a different position during the 3D handoff.
 for(const property of ['mask-image','mask-size','mask-position'])heading.style.removeProperty(property);
 const canFrames=new Map();let lastMask=null;
 const frames=new Map(),loading=new Set(),queue=[];let active=0,disposed=false,frame=0,lastDraw=-1,lastW=0,lastH=0,lastScroll=scrollY,wasPlaying=false;
 function load(index){if(frames.has(index)||loading.has(index)||queue.includes(index))return;queue.push(index);pump();}
 function loadImage(src){
  return new Promise((resolve,reject)=>{
   const image=new Image();
   image.onload=()=>image.decode().then(()=>resolve(image),reject);
   image.onerror=reject;image.src=src;
  });
 }
 function pump(){
  while(active<5&&queue.length&&!disposed){
   const index=queue.shift(),name=String(index).padStart(4,'0');active++;loading.add(index);
   // Publish a frame only when BOTH layers are decoded. A late matte must not
   // expose text through the can or fade the 3D fallback out prematurely.
   Promise.all([loadImage(asset(`frames/${name}.webp`)),loadImage(asset(`can-masks/${name}.webp`))])
    .then(([image,matte])=>{if(!disposed){frames.set(index,image);canFrames.set(index,matte);}},()=>{})
    .finally(()=>{loading.delete(index);active--;pump();});
  }
 }
 // First frame and coarse coverage load before the complete sequence.
 load(0);load(191);for(let i=8;i<192;i+=8)load(i);
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){for(let i=0;i<192;i++)load(i);observer.disconnect();}},{rootMargin:'1800px'});observer.observe(section);
 function draw(index){
  if(!frames.size)return false;
  const W=innerWidth,H=innerHeight,ratio=Math.min(devicePixelRatio,1.5);
  if(W!==lastW||H!==lastH){canvas.width=productCanvas.width=W*ratio;canvas.height=productCanvas.height=H*ratio;lastW=W;lastH=H;lastDraw=-1;}
  let nearest=index;if(!frames.has(index)){nearest=[...frames.keys()].reduce((best,k)=>Math.abs(k-index)<Math.abs(best-index)?k:best,frames.keys().next().value);}
  const matte=canFrames.get(nearest);
  if(lastDraw===nearest&&lastMask===matte)return true;lastDraw=nearest;lastMask=matte;
  const image=frames.get(nearest),layout=getFilmLayout(W,H);
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
  if(layout.y>1){
   // The source film crops its splash at row zero. Continue that edge into the
   // exposed mobile margin, then dissolve to white (neutral under multiply).
   // Only the liquid-only top band is used; the can keeps its original geometry.
   const extension=Math.min(layout.y,layout.scale*96)*ratio;
   const x=layout.x*ratio,y=layout.y*ratio,w=layout.width*ratio;
   context.save();
   context.translate(x,y);context.scale(1,-1);
   context.drawImage(image,0,0,image.width,64,0,0,w,extension);
   context.restore();
   const dissolve=context.createLinearGradient(0,y-extension,0,y);
   dissolve.addColorStop(0,'#fff');
   dissolve.addColorStop(.15,'#fff');
   dissolve.addColorStop(.7,'rgba(255,255,255,.2)');
   dissolve.addColorStop(1,'rgba(255,255,255,0)');
   context.fillStyle=dissolve;context.fillRect(x,y-extension,w,extension);
  }
  context.drawImage(image,layout.x*ratio,layout.y*ratio,layout.width*ratio,layout.height*ratio);
  // Render the solid product normally so silver highlights cannot dissolve into
  // the orange background. The liquid outside the matte retains multiply blending.
  productContext.clearRect(0,0,productCanvas.width,productCanvas.height);
  if(matte){
   cutoutContext.clearRect(0,0,1280,720);
   cutoutContext.globalCompositeOperation='source-over';
   cutoutContext.drawImage(image,0,0);
   cutoutContext.globalCompositeOperation='destination-in';
   cutoutContext.drawImage(matte,0,0);
   cutoutContext.globalCompositeOperation='source-over';
   productContext.drawImage(cutout,layout.x*ratio,layout.y*ratio,layout.width*ratio,layout.height*ratio);
  }
  return true;
 }
 function tick(){
  if(disposed)return;frame=requestAnimationFrame(tick);
  const r=section.getBoundingClientRect(),progress=clamp(-r.top/(section.offsetHeight-innerHeight));
  const visible=r.top<innerHeight&&r.bottom>0,activeScene=r.top<=0&&r.bottom>=innerHeight;
  const movieProgress=clamp((progress-.065)/.87),index=reduced?0:Math.round(movieProgress*191);
  if(visible)load(index);
  const hasFrame=visible&&draw(index);
  canvas.style.opacity=String(hasFrame&&activeScene?(progress<.06?clamp(progress/.06):progress>.94?clamp((1-progress)/.06):1):0);
  productCanvas.style.opacity=canvas.style.opacity;
  if(!reduced){const backgroundDrift=innerWidth<=700?progress*innerHeight*.08:0;heading.style.transform=`translateY(${(1-clamp(progress*10))*25-backgroundDrift}px)`;heading.style.opacity=String(.75+clamp(progress*8)*.25);}
  const moving=Math.abs(scrollY-lastScroll)>.2;lastScroll=scrollY;
  if(sound()&&activeScene&&moving&&!reduced){
   if(Math.abs(audio.currentTime-movieProgress*8)>.4)audio.currentTime=movieProgress*8;
   if(audio.paused)audio.play().catch(()=>{});wasPlaying=true;
  }else if(wasPlaying){audio.pause();wasPlaying=false;}
  window.__energitix={...(window.__energitix||{}),loadedFrames:frames.size,filmFrame:lastDraw,filmProgress:progress};
 }
 frame=requestAnimationFrame(tick);
 return{dispose(){disposed=true;observer.disconnect();cancelAnimationFrame(frame);frames.clear();canFrames.clear();audio.pause();}};
}
