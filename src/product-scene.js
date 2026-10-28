import { getFilmLayout } from './film-layout.js';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const mix=THREE.MathUtils.lerp;
export function createProductScene(canvas,{asset,reduced,onProgress,onReady,onFeature,isReady}){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(30,innerWidth/innerHeight,1,20000);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
 const env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();
 const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(-350,650,700);scene.add(key);
 const rim=new THREE.DirectionalLight(0xffffff,1.6);rim.position.set(550,200,-100);scene.add(rim);
 scene.add(new THREE.AmbientLight(0xffffff,.8));
 const placement=new THREE.Group(),pitch=new THREE.Group(),yaw=new THREE.Group(),model=new THREE.Group();
 scene.add(placement);placement.add(pitch);pitch.add(yaw);yaw.add(model);
 const manager=new THREE.LoadingManager();manager.onProgress=(_,loaded,total)=>onProgress(loaded/total);manager.onLoad=onReady;
 const loader=new THREE.TextureLoader(manager);
 const label=loader.load(asset('can-label.webp'));label.colorSpace=THREE.SRGBColorSpace;label.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
 const bump=loader.load(asset('can-bump.webp'));bump.anisotropy=4;
 const mat=new THREE.MeshPhysicalMaterial({map:label,metalness:.22,roughness:.47,clearcoat:.85,clearcoatRoughness:.22,envMapIntensity:.3,emissive:0xffffff,emissiveMap:label,emissiveIntensity:.14,bumpMap:bump,bumpScale:.012});
 const points=[ [.84,-2.28],[.91,-2.24],[.965,-2.17],[.99,-2.09],[1,-1.98],[1,1.82],[.995,1.94],[.98,2.01],[.93,2.12],[.875,2.23],[.862,2.28] ].map(p=>new THREE.Vector2(...p));
 const bodyGeo=new THREE.LatheGeometry(points,160,-Math.PI);
 const uv=bodyGeo.attributes.uv,pos=bodyGeo.attributes.position;
 for(let i=0;i<uv.count;i++)uv.setY(i,(pos.getY(i)+2.28)/4.56);
 const body=new THREE.Mesh(bodyGeo,mat);model.add(body);
 const metal=new THREE.MeshStandardMaterial({color:0xcaccca,metalness:1,roughness:.27,envMapIntensity:1.3,side:THREE.DoubleSide});
 const darkMetal=new THREE.MeshStandardMaterial({color:0x747772,metalness:1,roughness:.37,envMapIntensity:1.1,side:THREE.DoubleSide});
 function ring(radius,tube,y,material=metal){const mesh=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,12,96),material);mesh.rotation.x=Math.PI/2;mesh.position.y=y;model.add(mesh);return mesh;}
 ring(.88,.048,2.31);ring(.875,.029,2.36);ring(.80,.012,2.303,darkMetal);
 ring(.872,.05,-2.30);ring(.88,.022,-2.35);ring(.80,.017,-2.35,darkMetal);
 const lid=new THREE.Mesh(new THREE.CylinderGeometry(.875,.875,.022,96),metal);lid.position.y=2.30;model.add(lid);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(.84,.80,.028,80),darkMetal);base.position.y=-2.32;model.add(base);
 const depression=new THREE.Mesh(new THREE.CircleGeometry(.75,80),darkMetal);depression.rotation.x=-Math.PI/2;depression.position.y=2.314;model.add(depression);
 const lidInner=new THREE.Mesh(new THREE.CircleGeometry(.727,80),metal);lidInner.rotation.x=-Math.PI/2;lidInner.position.y=2.316;model.add(lidInner);
 const scored=new THREE.Mesh(new THREE.TorusGeometry(.29,.009,8,60),darkMetal);scored.rotation.x=Math.PI/2;scored.scale.set(.78,1.35,1);scored.position.set(0,2.325,-.32);model.add(scored);
 const tabShape=new THREE.Shape();tabShape.absellipse(0,0,.21,.36,0,TAU,false,0);
 const hole=new THREE.Path();hole.absellipse(0,.08,.115,.17,0,TAU,true,0);tabShape.holes.push(hole);
 const tab=new THREE.Mesh(new THREE.ExtrudeGeometry(tabShape,{depth:.035,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.012,bevelThickness:.009,curveSegments:32}),metal);
 tab.rotation.x=-Math.PI/2;tab.rotation.z=-.15;tab.position.set(.015,2.34,.08);model.add(tab);
 const rivet=new THREE.Mesh(new THREE.SphereGeometry(.058,20,12),metal);rivet.scale.y=.3;rivet.position.set(.015,2.37,-.13);model.add(rivet);
 // Tiny raised droplets catch the environment as the can turns.
 const dropletMat=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:.08,roughness:.06,transparent:true,opacity:.32,clearcoat:1,envMapIntensity:.6});
 const droplets=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),dropletMat,150);
 const dummy=new THREE.Object3D();let seed=72;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 for(let i=0;i<150;i++){const a=rand()*TAU,h=rand()*3.85-1.92,r=.012+rand()*.023;dummy.position.set(Math.sin(a)*1.002,h,Math.cos(a)*1.002);dummy.scale.set(r,r*(1.1+rand()*.6),r*.55);dummy.rotation.set(0,a,0);dummy.updateMatrix();droplets.setMatrixAt(i,dummy.matrix);}model.add(droplets);
 const bubbleMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{dark:{value:0},alpha:{value:.5}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;vec4 center=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);float sx=length(instanceMatrix[0].xyz);float sy=length(instanceMatrix[1].xyz);center.xy+=position.xy*vec2(sx,sy);gl_Position=projectionMatrix*center;}`,fragmentShader:`varying vec2 vUv;uniform float dark;uniform float alpha;void main(){vec2 p=vUv*2.-1.;float d=length(p);float ring=smoothstep(.72,.91,d)*(1.-smoothstep(.91,1.,d));float shine=exp(-length(p-vec2(-.3,.4))*15.);float a=(ring*.35+shine*.8)*alpha;if(a<.005)discard;gl_FragColor=vec4(mix(vec3(.12),vec3(.97,.95,.91),dark),a);}`});
 const bubbles=new THREE.InstancedMesh(new THREE.PlaneGeometry(2,2),bubbleMat,38);bubbles.frustumCulled=false;scene.add(bubbles);
 const seeds=Array.from({length:38},()=>({x:(rand()-.5)*450,y:rand()*700,z:rand()*110,r:2+rand()*5,s:.25+rand()*.6}));
 let W=innerWidth,H=innerHeight,frame=0,disposed=false,dragging=false,lastDrag=0,dragRotation=0,dragVelocity=0,burstTime=-100,lastTime=performance.now(),lastScroll=scrollY,scrollSpeed=0,lastFeature=-1;
 let entrance=0,previousY=0,pointer={x:0,y:0};
 const shadow=document.querySelector('.product-shadow'),glow=document.querySelector('.product-glow'),hotspot=document.getElementById('hotspot');
 const connector=hotspot.querySelector('.hotspot-connector'),captionRule=hotspot.querySelector('.hotspot-caption-rule');
 let connectorAnimation=null,lastConnectorFeature=-1;
 const slots=[...document.querySelectorAll('[data-slot]')],anatomy=document.querySelector('.anatomy'),film=document.querySelector('.film'),filmCanvas=film.querySelector('.film-canvas'),footer=document.querySelector('.footer');
 const state={x:0,y:0,h:500,yaw:0,roll:0,pitch:.40,dark:0};
 const resize=()=>{W=innerWidth;H=innerHeight;renderer.setSize(W,H,false);camera.aspect=W/H;camera.position.z=H/2/Math.tan(Math.PI/12);camera.updateProjectionMatrix();};resize();window.addEventListener('resize',resize);
 const pointerMove=e=>{pointer.x=e.clientX/W-.5;pointer.y=e.clientY/H-.5;if(dragging){const delta=(e.clientX-lastDrag)*.012;dragRotation+=delta;dragVelocity=delta;lastDrag=e.clientX;}};
 const dragZone=document.querySelector('.drag-zone');
 const dragStart=e=>{if(e.pointerType==='touch')return;dragging=true;lastDrag=e.clientX;dragZone.setPointerCapture(e.pointerId);};
 const dragEnd=()=>{dragging=false;};
 document.addEventListener('pointermove',pointerMove);dragZone?.addEventListener('pointerdown',dragStart);dragZone?.addEventListener('pointerup',dragEnd);dragZone?.addEventListener('lostpointercapture',dragEnd);
 function measure(){
  const keys=[];
  for(const slot of slots){const r=slot.getBoundingClientRect(),id=slot.dataset.slot;const basic={x:r.left+r.width/2,y:r.top+r.height/2,h:r.height,yaw:Number(slot.dataset.yaw)*TAU,roll:Number(slot.dataset.rot)*Math.PI/180,pitch:Number(slot.dataset.pitch)*Math.PI/180,dark:Number(slot.dataset.dark),id};
   if(id==='anatomy'){
    const top=anatomy.getBoundingClientRect().top+scrollY,range=anatomy.offsetHeight-H;
    for(let i=0;i<4;i++)keys.push({...basic,at:top+range*i/3,yaw:TAU*(2+[0,.13,.5,.98][i]),pitch:[.60,.08,.18,-.5][i],roll:[-.07,.08,-.08,.1][i],feature:i});
   }else if(id==='film'){
    const top=film.getBoundingClientRect().top+scrollY,range=film.offsetHeight-H;
    const layout=getFilmLayout(W,H);
    const b={...basic,x:layout.productX,y:layout.productY+Math.max(0,top-scrollY)+Math.min(0,top+range-scrollY),h:layout.productHeight,roll:0,pitch:.40};
    keys.push({...b,at:top},{...b,at:top+range,yaw:4*TAU});
   }else keys.push({...basic,at:id==='hero'?0:r.top+scrollY+r.height/2-H/2});
  }
  return keys;
 }
 const localPoint=new THREE.Vector3(),worldPoint=new THREE.Vector3(),normal=new THREE.Vector3(),quat=new THREE.Quaternion();
 function animate(now){
  if(disposed)return;frame=requestAnimationFrame(animate);
  const dt=Math.min((now-lastTime)/1000,.25);lastTime=now;
  const damping=1-Math.pow(.84,dt*60),elapsed=now/1000;
  const keys=measure();let index=0;
  while(index<keys.length-2&&scrollY>keys[index+1].at)index++;
  const a=keys[index],b=keys[index+1],raw=clamp((scrollY-a.at)/Math.max(1,b.at-a.at)),e=reduced?raw:ease(raw),fly=a.id===b.id?0:Math.sin(raw*Math.PI);
  const end=scrollY>=keys.at(-1).at;
  const target=end?keys.at(-1):{x:mix(a.x,b.x,e),y:mix(a.y,b.y,e),h:mix(a.h,b.h,e),yaw:mix(a.yaw,b.yaw,e),roll:mix(a.roll,b.roll,e),pitch:mix(a.pitch,b.pitch,e),dark:mix(a.dark,b.dark,e)};
  const aRect=anatomy.getBoundingClientRect(),aActive=aRect.top<=0&&aRect.bottom>=H;
  const fRect=film.getBoundingClientRect(),fActive=fRect.top<=0&&fRect.bottom>=H;
  const calm=aActive||fActive;
  scrollSpeed=mix(scrollSpeed,clamp((scrollY-lastScroll)/Math.max(dt,.01),-2400,2400),.08);lastScroll=scrollY;
  for(const prop of ['x','y','h','yaw','roll','pitch','dark'])state[prop]=mix(state[prop],target[prop],damping);
  if(!dragging){dragRotation+=dragVelocity;dragVelocity*=Math.pow(.9,dt*60);dragRotation*=Math.pow(.965,dt*60);}
  if(isReady())entrance=Math.min(1,entrance+dt*.8);
  const entry=reduced?1:1-Math.pow(1-entrance,4);
  const bob=reduced||calm?0:Math.sin(elapsed*1.1)*3;
  placement.position.set(state.x-W/2,H/2-state.y+bob+(1-entry)*H*.9,reduced?0:fly*H*.08);
  placement.rotation.z=state.roll+(reduced?0:fly*.13*Math.sign(b.x-a.x)-scrollSpeed*.000012);
  pitch.rotation.x=state.pitch+(reduced?0:fly*.32)+(calm||reduced?0:pointer.y*.025);
  yaw.rotation.y=(reduced?0:state.yaw)+(calm||reduced?0:Math.sin(elapsed*.55)*.045+pointer.x*.08)+(scrollY<H*.7?dragRotation:0)+(1-entry)*TAU;
  const s=state.h/4.8;placement.scale.setScalar(s*(1+fly*.025));
  // Fade only while the measured first-frame photograph replaces the model.
  // Follow the actual, decoded film layers, including delayed/failed media.
  const videoOpacity=Number(filmCanvas.style.opacity)||0;
  const footerFade=clamp(footer.getBoundingClientRect().top/H);
  renderer.domElement.style.opacity=String((1-videoOpacity)*footerFade*entry);
  shadow.style.opacity=String((1-fly)*(1-state.dark)*(1-videoOpacity)*footerFade*entry);
  shadow.style.transform=`translate(${state.x-140}px,${state.y+state.h/2-12}px) scale(${state.h/550},${state.h/550})`;
  glow.style.opacity=String((.4+state.dark*.6)*(1-videoOpacity)*footerFade);
  glow.style.transform=`translate(${state.x-300}px,${state.y-300}px) scale(${state.h/650})`;
  bubbleMat.uniforms.dark.value=state.dark;
  bubbleMat.uniforms.alpha.value=(reduced?0:.55)*(1-videoOpacity)*entry*footerFade;
  const burstAge=elapsed-burstTime,burst=burstAge>=0&&burstAge<1.5?Math.sin(burstAge/1.5*Math.PI)*120:0;
  for(let i=0;i<seeds.length;i++){const p=seeds[i],cycle=((elapsed*p.s*(16+Math.abs(scrollSpeed)*.008)+p.y)%700)-350;
   dummy.position.set(state.x-W/2+p.x*(state.h/620)*(1+burst/180),H/2-state.y+cycle*(state.h/700)+Math.sign(cycle)*burst*.4,p.z-80);
   dummy.scale.setScalar(p.r*(1+burst/500));dummy.rotation.set(0,0,0);dummy.updateMatrix();bubbles.setMatrixAt(i,dummy.matrix);
  }bubbles.instanceMatrix.needsUpdate=true;
  if(aActive){
   const progress=clamp(-aRect.top/(anatomy.offsetHeight-H)),fi=Math.min(3,Math.floor(progress*4));
   if(fi!==lastFeature){onFeature(fi);lastFeature=fi;}
   const points=[[0,2.35,.25],[-.35,.35,.94],[.25,.4,-.97],[.25,-2.2,.7]];
   localPoint.set(...points[fi]);model.updateWorldMatrix(true,false);worldPoint.copy(localPoint);model.localToWorld(worldPoint);worldPoint.project(camera);
   const sx=(worldPoint.x*.5+.5)*W,sy=(-worldPoint.y*.5+.5)*H;
   normal.set(points[fi][0],fi===0?1:fi===3?-1:0,points[fi][2]).normalize();model.getWorldQuaternion(quat);normal.applyQuaternion(quat);
   const facing=normal.z>-.1;
   hotspot.style.opacity=facing?'1':'0';hotspot.style.transform=`translate(${sx-4}px,${sy-4}px)`;
   const caption=document.querySelector(`[data-feature="${fi}"]`),r=caption.getBoundingClientRect();
   if(W<=700){
    // Route through the outside gutter, leaving the model and caption text unobstructed.
    const gutter=fi%2===0?W*.92:W*.08;
    const endX=r.left+r.width/2,endY=r.top-9;
    const railY=endY-17,elbowY=Math.min(sy+18,railY-12);
    connector.setAttribute('d',`M0 0 L${gutter-sx} ${elbowY-sy} L${gutter-sx} ${railY-sy} L${endX-sx} ${railY-sy} L${endX-sx} ${endY-sy}`);
    connector.setAttribute('marker-end','url(#detail-arrow)');
    captionRule.setAttribute('d',`M${endX-sx-17} ${endY-sy+7} H${endX-sx+17}`);
    if(fi!==lastConnectorFeature&&!reduced){
     connectorAnimation?.cancel();
     connectorAnimation=connector.animate([{strokeDashoffset:1,opacity:0},{strokeDashoffset:0,opacity:.65}],{duration:550,easing:'ease-out',fill:'forwards'});
    }
   }else{
    const ex=(fi%2===0?r.left-18:r.right+18)-sx,ey=r.top+30-sy;
    connector.setAttribute('d',`M0 0 L${ex*.4} ${ey} L${ex} ${ey}`);
    connector.removeAttribute('marker-end');captionRule.setAttribute('d','');
    connectorAnimation?.cancel();connectorAnimation=null;
   }
   lastConnectorFeature=fi;
  }else {hotspot.style.opacity='0';lastConnectorFeature=-1;}
  renderer.render(scene,camera);
  window.__energitix={...(window.__energitix||{}),modelReady:isReady(),activeSlot:a.id,videoOpacity,feature:lastFeature,webgl:true,product:{x:state.x,y:state.y,height:state.h}};
 }
 frame=requestAnimationFrame(animate);
 return {burst(){burstTime=performance.now()/1000;},dispose(){disposed=true;connectorAnimation?.cancel();cancelAnimationFrame(frame);window.removeEventListener('resize',resize);document.removeEventListener('pointermove',pointerMove);dragZone?.removeEventListener('pointerdown',dragStart);dragZone?.removeEventListener('pointerup',dragEnd);dragZone?.removeEventListener('lostpointercapture',dragEnd);scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});label.dispose();bump.dispose();env.dispose();pmrem.dispose();renderer.dispose();}};
}
