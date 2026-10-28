import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import './style.css';
import { createProductScene } from './product-scene.js';
import { createFilm } from './film.js';

gsap.registerPlugin(ScrollTrigger);
const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;
const money = value => `NOK ${value.toLocaleString('en-GB')}`;
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const features = [
  { name: 'Crack into possibility.', copy: 'That first click. The start of something good.', side: 'right' },
  { name: 'Cold. Down to the detail.', copy: 'A matte-black finish. A fresh-from-the-fridge feeling.', side: 'left' },
  { name: 'Energy from every angle.', copy: 'A bold signature that never fades into the background.', side: 'right' },
  { name: 'Made to stand out.', copy: 'Clean lines. Bright character. One unmistakable can.', side: 'left' },
];
function Arrow({ diagonal = false }) { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>; }
function Bolt(){ return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14 2-9 12h7l-2 8 10-13h-8l2-7Z" fill="currentColor"/></svg> }
function Slot({ id, yaw, roll = 0, pitch = 0, dark = false, className = '' }){ return <div className={`product-slot ${className}`} data-slot={id} data-yaw={yaw} data-rot={roll} data-pitch={pitch} data-dark={dark ? 1 : 0} data-glow={dark ? 1 : 0} data-shadow={dark ? 0 : 1} data-particles="1" data-idle="1" aria-hidden="true"/>; }
function App(){
 const sceneCanvas = useRef(null), filmCanvas = useRef(null), scene = useRef(null), lenis = useRef(null), audio = useRef(null);
 const [ready,setReady]=useState(false), [progress,setProgress]=useState(0), [sound,setSound]=useState(false);
 const [pack,setPack]=useState(1),[quantity,setQuantity]=useState(1),[cart,setCart]=useState([]),[cartOpen,setCartOpen]=useState(false),[notice,setNotice]=useState(''),[feature,setFeature]=useState(0),[info,setInfo]=useState('');
 const [webgl,setWebgl]=useState(true);
 const soundRef=useRef(false), readyRef=useRef(false), noticeTimer=useRef(null);
 const total=cart.reduce((sum,line)=>sum+line.pack*line.quantity*35,0), count=cart.reduce((sum,line)=>sum+line.quantity,0);
 function goTo(id){const el=document.querySelector(id);if(el)lenis.current?.scrollTo(el,{duration:1.3,immediate:reduced()});}
 useEffect(()=>{
  let alive=true;
  const start=performance.now();
  const smooth=new Lenis({duration:1.15,smoothWheel:!reduced(),touchMultiplier:1});lenis.current=smooth;
  smooth.on('scroll',ScrollTrigger.update);
  const tick=t=>smooth.raf(t*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
  const finish=()=>{
    const delay=Math.max(0,1700-(performance.now()-start));
    window.setTimeout(()=>{if(!alive)return;setProgress(100);setReady(true);readyRef.current=true;},delay);
  };
  const film=createFilm(filmCanvas.current, { asset, reduced:reduced(), audio:audio.current, sound:()=>soundRef.current });
  try {
    scene.current=createProductScene(sceneCanvas.current,{asset,reduced:reduced(),onProgress:p=>alive&&setProgress(Math.round(p*95)),onReady:finish,onFeature:i=>alive&&setFeature(i),isReady:()=>readyRef.current});
  } catch(error){ console.warn('3D rendering unavailable; displaying the product photograph.',error);setWebgl(false);finish(); }
  const media=gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)',()=>{
    gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{opacity:0,y:42,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 91%',once:true}}));
    gsap.utils.toArray('.macro-two .macro-image').forEach(el=>gsap.fromTo(el,{scale:1.04},{scale:1,scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1}}));
    gsap.utils.toArray('.marquee-track').forEach((el,i)=>gsap.fromTo(el,{xPercent:i?-18:-3},{xPercent:i?-3:-18,ease:'none',scrollTrigger:{trigger:'.taste',start:'top bottom',end:'bottom top',scrub:1}}));
  });
  let pointerX=0,pointerY=0;const cursor=document.querySelector('.cursor');
  const pointer=e=>{pointerX=e.clientX;pointerY=e.clientY;if(cursor){cursor.style.transform=`translate3d(${pointerX}px,${pointerY}px,0)`;cursor.classList.add('visible');const target=e.target.closest('button,a,[data-drag]');cursor.classList.toggle('over',!!target);cursor.dataset.label=target?.dataset.cursor||'';} const button=e.target.closest('[data-magnetic]');if(button&&!reduced()){const r=button.getBoundingClientRect();gsap.to(button,{x:(e.clientX-r.left-r.width/2)*.16,y:(e.clientY-r.top-r.height/2)*.2,duration:.25});}};
  const leave=e=>{const button=e.target.closest?.('[data-magnetic]');if(button)gsap.to(button,{x:0,y:0,duration:.6,ease:'elastic.out(1,.5)'});};
  document.addEventListener('pointermove',pointer);document.addEventListener('pointerout',leave);
  return()=>{alive=false;scene.current?.dispose();film.dispose();smooth.destroy();gsap.ticker.remove(tick);media.revert();document.removeEventListener('pointermove',pointer);document.removeEventListener('pointerout',leave);clearTimeout(noticeTimer.current);};
 },[]);
 useEffect(()=>{soundRef.current=sound;if(!sound)audio.current?.pause();},[sound]);
 useEffect(()=>{
  if(!cartOpen&&!info)return;
  const previous=document.activeElement;
  lenis.current?.stop();
  const dialog=document.querySelector('[role="dialog"]');
  dialog?.querySelector('button')?.focus();
  const key=e=>{
   if(e.key==='Escape'){setCartOpen(false);setInfo('');}
   if(e.key==='Tab'&&dialog){const controls=[...dialog.querySelectorAll('button,a,input')].filter(el=>!el.disabled);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  };document.addEventListener('keydown',key);
  return()=>{lenis.current?.start();previous?.focus();document.removeEventListener('keydown',key);};
 },[cartOpen,info]);
 function add(){
  setCart(old=>{const existing=old.find(line=>line.pack===pack);return existing?old.map(line=>line.pack===pack?{...line,quantity:Math.min(99,line.quantity+quantity)}:line):[...old,{pack,quantity}];});
  scene.current?.burst();setNotice('Good energy, added.');clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(''),2800);
 }
 return <>
  <div className={`preloader ${ready?'loaded':''}`} aria-hidden={ready}><div className="loader-word"><img src={asset('energitix-wordmark.webp')} width="1955" height="572" alt="ENERGITIX"/></div><div className="loader-can"><div style={{height:`${progress}%`}}/><Bolt/></div><div className="loader-bottom"><span>GOOD THINGS ARE CHARGING.</span><span>{String(progress).padStart(3,'0')}</span></div></div>
  <a className="skip-link" href="#reasons">Skip to content</a>
  <canvas ref={sceneCanvas} className="product-canvas" aria-hidden="true"/>
  {!webgl&&<img className="fallback-product" src={asset('can-cutout.webp')} alt="ENERGITIX energy drink"/>}
  <div className="product-shadow"/><div className="product-glow"/>
  <div id="hotspot" className="hotspot" aria-hidden="true"><span/><svg><defs><marker id="detail-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 1 L6 4 L1 7"/></marker></defs><path className="hotspot-connector" pathLength="1"/><path className="hotspot-caption-rule"/></svg></div>
  <main className={ready?'is-ready':''}>
   <section className="hero studio" id="top" data-section="hero">
    <nav className="nav"><a href="#top" className="brand" aria-label="Energitix home" onClick={e=>{e.preventDefault();goTo('#top')}}><img className="nav-wordmark" src={asset('energitix-wordmark.webp')} width="1955" height="572" alt=""/></a><div className="nav-links"><a href="#reasons" onClick={e=>{e.preventDefault();goTo('#reasons')}}>The energy</a><a href="#film" onClick={e=>{e.preventDefault();goTo('#film')}}>The film</a><a href="#shop" onClick={e=>{e.preventDefault();goTo('#shop')}}>Get yours</a></div><div className="nav-actions"><button className={`sound-button ${sound?'on':''}`} aria-label={sound?'Turn sound off':'Turn sound on'} aria-pressed={sound} onClick={()=>{setSound(s=>!s);if(!sound){audio.current?.play().then(()=>audio.current.pause()).catch(()=>{});}}}><span className="sound-bars"><i/><i/><i/><i/></span><span>Sound {sound?'on':'off'}</span></button><button className="bag-button" onClick={()=>setCartOpen(true)} aria-label={`Open demo bag, ${count} items`} data-cursor="Open"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z" stroke="currentColor" strokeWidth="1.5"/><path d="M8 9V6a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.5"/></svg><span>{count}</span></button></div></nav>
    <div className="hero-topline"><span>FOR THE MOMENTS THAT MOVE YOU.</span><span>ORIGINAL ENERGY / EST. 2026</span></div>
    <h1 className="hero-word" aria-label="ENERGITIX"><span><img className="wordmark-art" src={asset('energitix-wordmark.webp')} width="1955" height="572" alt="" fetchpriority="high"/></span></h1>
    <Slot id="hero" yaw={0} roll={-9} pitch={22}/>
    <div className="drag-zone" data-drag data-cursor="Spin" aria-label="Drag to rotate the can" role="img"/>
    <div className="hero-bottom"><div className="hero-tagline"><span className="eyebrow"><span className="tiny-bolt">↗</span> NOT HERE TO STAND STILL.</span><h2>Bring the<br/><em>energy.</em></h2></div><div className="hero-shop"><p>A little spark.<br/>A whole lot of possibility.</p><a className="button dark-button" href="#shop" data-magnetic data-cursor="Shop" onClick={e=>{e.preventDefault();goTo('#shop')}}>Find your energy <span><Arrow diagonal/></span></a><span className="micro">ONE CAN. ENDLESS POTENTIAL.</span></div></div>
    <div className="hero-footnote"><span>ENERGY WITH A DIFFERENT ATTITUDE.</span><span>330 ML · ORIGINAL CONCEPT</span></div>
   </section>
   <section className="reasons studio" id="reasons" data-section="reasons">
    <div className="section-top"><span className="eyebrow">THE EVERYDAY. TURNED UP.</span><span className="small-star">✳</span></div>
    <Slot id="reasons" yaw={1} roll={14} pitch={18}/>
    <div className="reasons-copy"><h2 className="display reveal">Good energy.<br/><span>Great things.</span></h2><p className="intro reveal">For the big ideas, the late sessions, and everything you’re about to make happen.</p><div className="benefit-list">
     {[['↗','Find your next gear.','A bold little ritual for your next big thing.'],['✳','Make room for the unexpected.','Bright citrus character. A crisp, sparkling finish.'],['⚡','Go your own way.','The can with as much personality as your plans.']].map(([icon,title,copy])=><div className="benefit reveal" key={title}><span className="benefit-icon">{icon}</span><div><h3>{title}</h3><p>{copy}</p></div></div>)}
    </div></div>
    <span className="section-caption">A FRESH PERSPECTIVE, INSIDE AND OUT.</span>
   </section>
   <section className="anatomy" id="details" data-section="anatomy"><div className="anatomy-sticky dark-studio">
    <div className="section-top"><span className="eyebrow">NOT A SINGLE BORING ANGLE.</span><span className="outline-bolt"><Bolt/></span></div>
    <h2 className="anatomy-heading display">All in the<br/><em>details.</em></h2>
    <Slot id="anatomy" yaw={2} pitch={15} dark/>
    <div className="anatomy-floor"/>
    {features.map((f,i)=><div key={f.name} className={`feature-label ${f.side} ${feature===i?'active':''}`} data-feature={i} aria-hidden={feature!==i}><span className="feature-caption-marker" aria-hidden="true"><Arrow diagonal/></span><span className="eyebrow">{['THE FIRST CLICK','THE FINISH','THE SIGNATURE','THE FORM'][i]}</span><h3>{f.name}</h3><p>{f.copy}</p></div>)}
    <div className="anatomy-bottom"><span>DESIGNED TO BE DIFFERENT.</span><div className="feature-dots">{features.map((_,i)=><i key={i} className={feature===i?'active':''}/>)}</div><span>EVERY DETAIL COUNTS.</span></div>
   </div></section>
   <section className="close-up dark-studio" data-section="closeup"><div className="closeup-copy"><span className="eyebrow reveal">GET A LITTLE CLOSER.</span><h2 className="display reveal">Feel the<br/><em>difference.</em></h2><p className="intro reveal">Cold metal. Fine droplets.<br/>Electric from the very first touch.</p></div><Slot id="closeup" yaw={3} roll={-15} pitch={18} dark/>
    <div className="macro-grid"><figure className="macro macro-one reveal"><div><img className="macro-image" src={asset('macro-lid-rimlit.webp')} alt="Silver lid and condensation, outlined by a fine white rim light" loading="lazy"/></div><figcaption><span>A FRESH START.</span><span>↗</span></figcaption></figure><figure className="macro macro-two reveal"><div><img className="macro-image" src={asset('macro-texture.webp?v=2')} alt="Condensation on the black and orange ENERGITIX label" loading="lazy"/></div><figcaption><span>UNMISTAKABLY ENERGITIX.</span><span>↗</span></figcaption></figure></div>
   </section>
   <section className="film" id="film" data-section="film"><div className="film-sticky"><div className="film-top"><span className="eyebrow">THIS IS WHAT ENERGY LOOKS LIKE.</span><span className="film-live"><i/> THE ENERGITIX FILM</span></div><h2 className="film-heading">Make<br/><em>waves.</em></h2><canvas ref={filmCanvas} className="film-canvas" aria-label="ENERGITIX can surrounded by a golden liquid splash; animation follows your scroll" role="img"/><canvas className="film-product-canvas" aria-hidden="true"/><Slot id="film" yaw={4} pitch={7}/><div className="film-bottom"><span>BRIGHT. BOLD. UNCONTAINED.</span><span>FEEL IT IN EVERY FRAME.</span></div></div></section>
   <section className="taste" id="taste" data-section="taste"><div className="section-top"><span className="eyebrow">A DIFFERENT KIND OF BUZZ.</span><Bolt/></div><div className="marquees" aria-hidden="true"><div className="marquee-track">BRING THE ENERGY. BRING THE ENERGY.</div><div className="marquee-track outline">MAKE IT YOURS. MAKE IT YOURS.</div></div><Slot id="taste" yaw={5} roll={21} pitch={8}/><div className="taste-stats"><div><strong>330<span>ml</span></strong><span>GOOD THINGS. GREAT SIZE.</span></div><div><strong>100<span>%</span></strong><span>MAIN CHARACTER ENERGY.</span></div><div><strong>01</strong><span>ORIGINAL ATTITUDE.</span></div></div></section>
   <section className="shop studio" id="shop" data-section="shop"><div className="section-top"><span className="eyebrow">YOUR NEXT GOOD IDEA STARTS HERE.</span><span className="small-star">✳</span></div><Slot id="shop" yaw={6} roll={-7} pitch={20}/><div className="shop-copy"><span className="eyebrow reveal">THE ORIGINAL / CITRUS CONCEPT</span><h2 className="display reveal">Good things.<br/><em>By the can.</em></h2><p className="intro reveal">Meet your new plus-one. Bright citrus energy,<br className="desktop-only"/> wrapped in a little black can.</p><div className="price-row"><span className="price">{money(pack*35)}</span><span>{pack===1?'330 ml · Single can':`${pack} × 330 ml · ${pack===6?'The six-pack':'The full crew'}`}</span></div><fieldset className="pack-picker"><legend>CHOOSE YOUR ENERGY</legend>{[1,6,12].map(n=><button key={n} className={pack===n?'selected':''} aria-pressed={pack===n} onClick={()=>setPack(n)}>{n===1?'Single can':`${n}-pack`}{n===6&&<span>GOOD COMPANY</span>}</button>)}</fieldset><div className="add-row"><div className="quantity" aria-label="Quantity"><button aria-label="Decrease quantity" disabled={quantity===1} onClick={()=>setQuantity(q=>Math.max(1,q-1))}>−</button><output aria-live="polite">{quantity}</output><button aria-label="Increase quantity" disabled={quantity===12} onClick={()=>setQuantity(q=>Math.min(12,q+1))}>+</button></div><button className="button dark-button" onClick={add} data-magnetic data-cursor="Add">Add to bag <span><Arrow diagonal/></span></button></div><p className="demo-note"><span>✳</span> A concept you can play with. No real orders or payments.</p></div><span className="section-caption">BEST SERVED WITH YOUR NEXT BIG IDEA.</span></section>
   <footer className="footer" data-section="footer"><div className="footer-top"><h2>Stay curious.<br/><span>Stay energised.</span></h2><a className="top-button" href="#top" onClick={e=>{e.preventDefault();goTo('#top')}} aria-label="Back to top" data-magnetic data-cursor="Top"><Arrow diagonal/></a></div><div className="footer-word"><span><img className="wordmark-art" src={asset('energitix-wordmark.webp')} width="1955" height="572" alt="ENERGITIX" loading="lazy"/></span></div><div className="footer-bottom"><div className="footer-meta"><a className="creator-credit" href="https://portfolio.ibithun.com" target="_blank" rel="noopener noreferrer">Designed &amp; developed by <strong>iBithun</strong> <span aria-hidden="true">↗</span></a><span>© 2026 ENERGITIX. AN INDEPENDENT CREATIVE CONCEPT.</span></div><div><button onClick={()=>setInfo('about')}>About this concept <span>↗</span></button><a href="https://www.linkedin.com/in/bithun-chatterjee" target="_blank" rel="noopener noreferrer">LinkedIn <span>↗</span></a><a href="https://portfolio.ibithun.com" target="_blank" rel="noopener noreferrer">Let’s make something <span>↗</span></a></div><span>GOOD ENERGY. GREAT DESIGN.</span></div></footer>
  </main>
  <div className="cursor" aria-hidden="true"><span/></div>
  <div className={`toast ${notice?'show':''}`} role="status"><Bolt/>{notice}<button onClick={()=>setCartOpen(true)}>View bag ↗</button></div>
  <audio ref={audio} src={asset('commercial-audio.mp3')} preload="none"/>
  {cartOpen&&<div className="dialog-backdrop" onClick={()=>setCartOpen(false)}><aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" data-lenis-prevent onClick={e=>e.stopPropagation()}><div className="drawer-heading"><span className="eyebrow">A LITTLE GOOD ENERGY.</span><button className="close-button" aria-label="Close bag" onClick={()=>setCartOpen(false)}>×</button></div><h2 id="cart-title">Your bag<span>({count})</span></h2>{cart.length?<><div className="cart-lines">{cart.map(line=><div className="cart-line" key={line.pack}><img src={asset('can-cutout.webp')} alt="ENERGITIX Original"/><div><h3>ENERGITIX Original</h3><p>{line.pack===1?'Single can':`${line.pack}-pack`} · 330 ml</p><div className="cart-line-controls"><button aria-label={`Decrease ${line.pack}-pack quantity`} onClick={()=>setCart(old=>old.flatMap(l=>l.pack!==line.pack?[l]:l.quantity>1?[{...l,quantity:l.quantity-1}]:[]))}>−</button><span>{line.quantity}</span><button aria-label={`Increase ${line.pack}-pack quantity`} disabled={line.quantity>=99} onClick={()=>setCart(old=>old.map(l=>l.pack===line.pack?{...l,quantity:Math.min(99,l.quantity+1)}:l))}>+</button><button className="remove" onClick={()=>setCart(old=>old.filter(l=>l.pack!==line.pack))}>Remove</button></div></div><strong>{money(line.quantity*line.pack*35)}</strong></div>)}</div><div className="cart-total"><span>Subtotal</span><strong>{money(total)}</strong></div><p className="cart-disclaimer">All the energy. None of the checkout.<br/>This is a portfolio concept — nothing will be charged.</p><button className="button dark-button" onClick={()=>{setCartOpen(false);goTo('#shop')}}>Keep exploring <Arrow/></button></>:<div className="empty-cart"><Bolt/><h3>Room for good things.</h3><p>Your bag is waiting for a little energy.</p><button className="button dark-button" onClick={()=>{setCartOpen(false);goTo('#shop')}}>Find your energy <Arrow/></button></div>}</aside></div>}
  {info&&<div className="dialog-backdrop info-backdrop" onClick={()=>setInfo('')}><div className="info-dialog" role="dialog" aria-modal="true" aria-labelledby="info-title" onClick={e=>e.stopPropagation()}><button className="close-button" aria-label="Close" onClick={()=>setInfo('')}>×</button><span className="eyebrow">INDEPENDENT BY DESIGN.</span><h2 id="info-title">{'A brand imagined.\nAn experience built.'}</h2><p>ENERGITIX is a fictional energy drink created to explore what a product website can feel like. The branding, flavour, size and prices are illustrative. The shop is a working demo; no products are sold.</p><p>Designed and built by <a href="https://portfolio.ibithun.com" target="_blank" rel="noopener noreferrer">Bithun Chatterjee</a>. Have a product worth bringing to life? <a href="mailto:bithun@ibithun.com">Let’s talk.</a></p><button className="button dark-button" onClick={()=>setInfo('')}>Keep the energy going <Arrow/></button></div></div>}
 </>;
}
createRoot(document.getElementById('root')).render(<App/>);
