"""Generate source-aligned alpha silhouettes that mask both headline colours behind the can."""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import median_filter, gaussian_filter1d, gaussian_filter, distance_transform_edt
ROOT=Path(__file__).resolve().parents[1]
paths=sorted((ROOT/'public/assets/frames').glob('*.webp'))
out=ROOT/'public/assets/can-masks';out.mkdir(exist_ok=True)
bounds=[]
for path in paths:
 a=np.array(Image.open(path).convert('RGB'))
 dark=a.max(2)<140;dark[:,:500]=False;dark[:,800:]=False;dark[:30]=False;dark[705:]=False
 ys=np.where(dark.sum(1)>18)[0];top,bottom=int(ys[0]),int(ys[-1]);edges=[]
 for y in range(top+80,bottom-40):
  xs=np.where(dark[y])[0]
  if len(xs)>30:edges.append((xs[0],xs[-1]))
 left,right=np.median(edges,axis=0);bounds.append([top,bottom,left,right])
bounds=np.array(bounds)
for c in range(4):bounds[:,c]=gaussian_filter1d(median_filter(bounds[:,c],size=5),1)
Y,X=np.mgrid[:720,:1280]
for path,(top,bottom,left,right) in zip(paths,bounds):
 a=np.array(Image.open(path).convert('RGB'))
 cx=(left+right)/2;radius=(right-left)/2;h=Y-top
 lid=.84*radius*np.sqrt(np.clip(1-((h-21)/22)**2,0,1))
 shoulder=radius*(.82+.18*np.clip((h-23)/43,0,1))
 base=np.sqrt(np.clip(1-((Y-(bottom-40))/40)**2,0,1))*.96*radius
 body=np.where((h>=23)&(Y<=bottom-40),shoulder,0)
 body=np.where(Y>bottom-40,base,body)
 extent=np.maximum(body,lid)
 alpha=np.clip((extent-np.abs(X-cx))/.9,0,1)
 alpha[(Y<top-1)|(Y>bottom+2)]=0
 # Follow the narrowing bottom rim row by row; fill its interior highlights.
 for row in range(max(0,int(bottom)-75),min(720,int(bottom)+3)):
  xs=np.where((a[row].mean(1)<200)&(np.abs(np.arange(1280)-cx)<radius))[0]
  if len(xs)>5:
   alpha[row,:xs[0]+1]=0;alpha[row,xs[-1]:]=0
  else:alpha[row]=0
 # Keep silver/white reflections opaque: brightness is not transparency.
 # Inset and feather only the outside contour to avoid studio-background fringes.
 alpha=gaussian_filter(np.clip(distance_transform_edt(alpha>.5)-1.5,0,1),.55)
 rgba=np.dstack([np.full_like(a,255),np.uint8(alpha*255)])
 Image.fromarray(rgba).save(out/path.name,quality=92,method=4)
print('Created',len(paths),'aligned can masks')
