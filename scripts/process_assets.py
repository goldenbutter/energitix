"""Reproducible processing of the supplied ENERGITIX photo and commercial."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
from scipy.ndimage import map_coordinates, gaussian_filter
import subprocess, json

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/assets'; OUT.mkdir(exist_ok=True,parents=True)
A=ROOT/'analysis'; A.mkdir(exist_ok=True)
im=Image.open(ROOT/'bottle.png').convert('RGB'); photo=np.array(im); W,H=im.size
print('Photo dimensions:', W,H,flush=True)
# Measured silhouette: preserve the full silver lip and base, excluding the floor shadow.
mask=Image.new('L',im.size); d=ImageDraw.Draw(mask)
d.ellipse((676,14,996,101),fill=255)
d.polygon([(681,53),(992,53),(996,81),(1018,119),(1024,159),(1020,798),(1008,844),(988,873),(957,891),(903,898),(784,898),(728,888),(692,867),(666,838),(651,803),(648,163),(654,124),(674,84)],fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(.65))
cut=im.copy().convert('RGBA');cut.putalpha(mask)
cut.crop((640,7,1033,908)).save(OUT/'can-cutout.webp',quality=96)
for color,name in [('#171713','dark'),('#f56b19','accent')]:
 bg=Image.new('RGBA',cut.size,color);bg.alpha_composite(cut);bg.resize((836,470)).convert('RGB').save(A/f'cutout-on-{name}.jpg',quality=92)
# Preserve the complete lid and shoulder; keep the native crop aspect ratio.
im.crop((630,0,1046,275)).save(OUT/'macro-lid.webp',quality=96)
# Isolate the lower lightning / condensation detail without clipping through letters.
im.crop((720,535,1005,852)).save(OUT/'macro-texture.webp',quality=96)
# 360-degree label: cylindrical resampling on the front, designed graphics on the back.
TW,TH=2048,2048
u=np.linspace(0,1,TW)[None,:]; v=np.linspace(0,1,TH)[:,None]
theta=(u-.5)*2*np.pi
# Photo front samples compensate the visible elliptical rim and vertical perspective.
y=83+v*752+(21+v*24)*np.cos(theta)
r=185-12*np.exp(-v*30)-8*np.exp(-(1-v)*30)
x=837+r*np.sin(theta)+np.zeros_like(v)
y=np.broadcast_to(y,(TH,TW))
front=np.stack([map_coordinates(photo[:,:,c],[y,x],order=1,mode='nearest') for c in range(3)],axis=-1).astype(float)
rng=np.random.default_rng(42)
back=np.zeros((TH,TW,3))+np.array([19,20,18]); back+=rng.normal(0,1.9,(TH,TW,1))
# Sweeping orange / gold / red stripes continue the actual label's visual language.
xx=np.arange(TW)[None,:];yy=np.arange(TH)[:,None]
for offset,width,color in [(0,39,[241,91,16]),(55,17,[248,161,25]),(97,7,[193,40,15])]:
 stripe=((xx+yy*.34+offset)%620)<width
 back[stripe]=np.array(color)
back=Image.fromarray(np.uint8(np.clip(back,0,255)))
db=ImageDraw.Draw(back)
try: font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf',58)
except OSError: font=ImageFont.load_default()
# Back is split over the texture seam, so the typography is kept on its side panels.
for bx in [105,1760]:
 db.rounded_rectangle((bx-45,580,bx+165,1390),radius=8,fill=(19,20,18))
 for j,word in enumerate(['BRING','THE','ENERGY.']): db.text((bx-22,635+j*76),word,font=font,fill=(242,103,23),stroke_width=0)
 for k in range(20):
  xp=bx-20+k*7
  db.rectangle((xp,1020,xp+(2 if k%3 else 4),1140),fill=(231,230,217))
 db.text((bx-22,1200),'CONCEPT',font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',24),fill=(231,230,217))
blend=np.clip((1.33-np.abs(theta))/.23,0,1)[...,None]
tex=np.uint8(front*blend+np.array(back)*(1-blend))
Image.fromarray(tex).save(OUT/'can-label.webp',quality=96)
# Subtle bump detail retains the photo's fine condensation without embossing the lettering.
gray=np.mean(tex,axis=2); detail=gray-gaussian_filter(gray,5)
Image.fromarray(np.uint8(np.clip(128+detail*.22,0,255))).save(OUT/'can-bump.webp',quality=92)
# Product-region quantile match; monochrome highlights and background are protected.
vid=next(ROOT.glob('*.mp4'))
first=np.array(Image.open(A/'video-first-frame.png').convert('RGB'))
ref=photo[110:840,665:1007].reshape(-1,3); sample=first[155:570,546:738].reshape(-1,3)
ref=ref[ref.max(1)-ref.min(1)>20]; sample=sample[sample.max(1)-sample.min(1)>20]
quant=np.linspace(0,1,256)
luts=[]
for c in range(3):
 sq=np.quantile(sample[:,c],quant);rq=np.quantile(ref[:,c],quant)
 luts.append(np.interp(np.arange(256),sq,rq))
frames=OUT/'frames';frames.mkdir(exist_ok=True)
pipe=subprocess.Popen(['ffmpeg','-hide_banner','-loglevel','error','-i',str(vid),'-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
for i in range(192):
 data=pipe.stdout.read(1280*720*3)
 if not data:break
 f=np.frombuffer(data,dtype=np.uint8).reshape(720,1280,3).copy()
 matching=np.stack([luts[c][f[:,:,c]] for c in range(3)],axis=-1)
 saturation=(f.max(2).astype(float)-f.min(2))/255
 weight=np.clip(saturation*2,0,1)[...,None]*.30
 graded=f*(1-weight)+matching*weight
 # Lift the neutral studio to white, keeping neutral metal inside the can intact.
 Y,X=np.mgrid[:720,:1280]
 product_region=(X>530)&(X<753)&(Y>95)&(Y<614)
 neutral=(saturation<.09)&(f.mean(2)>155)
 # Continuous neutral curve avoids a rectangular boundary around the can.
 lifted=np.clip((f.astype(float)-100)*255/120,0,255)
 graded[neutral]=lifted[neutral]
 avg=graded.mean(2,keepdims=True);graded=avg+(graded-avg)*1.035
 result=Image.fromarray(np.uint8(np.clip(graded,0,255)))
 result.save(frames/f'{i:04d}.webp',quality=86,method=4)
 if i==0:result.save(A/'graded-first-frame.jpg',quality=93)
 if i%48==0: print('Frames',i,flush=True)
pipe.wait()
subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(vid),'-vn','-codec:a','libmp3lame','-q:a','3',str(OUT/'commercial-audio.mp3')],check=True)
metadata={'width':1280,'height':720,'fps':24,'frames':192,'duration':8,'productBox':{'x':536,'y':103,'width':215,'height':507},'photoBox':{'x':648,'y':14,'width':376,'height':884},'palette':{'light':'#f6f3eb','dark':'#171713','accent':'#f56b19'}}
(OUT/'asset-manifest.json').write_text(json.dumps(metadata,indent=2))
print('Asset processing complete',flush=True)
