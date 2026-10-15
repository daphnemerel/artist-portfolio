# Cuts the two parrots (body + wing) out of work-5/images/01.jpg and makes a clean plate.
# Only the work's own photograph is used. Output: public/images/works/work-5/.
import cv2, numpy as np
from scipy import ndimage
src=cv2.imread('/home/claude/artist-portfolio/content/works/work-5/images/01.jpg')
x0,y0,x1,y1=400,440,740,630
sub=src[y0:y1,x0:x1]
lab=cv2.cvtColor(sub,cv2.COLOR_BGR2LAB).astype(float)
d=np.sqrt(((lab-np.median(lab.reshape(-1,3),axis=0))**2).sum(-1))
m=(d>19).astype(np.uint8)*255
m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((2,2),np.uint8))
n,l,st,_=cv2.connectedComponentsWithStats(m)
keep=np.zeros_like(m)
for i in range(1,n):
    if st[i,4]>40: keep[l==i]=255
keep=cv2.morphologyEx(keep,cv2.MORPH_CLOSE,np.ones((4,4),np.uint8))
keep=ndimage.binary_fill_holes(keep>0).astype(np.uint8)*255
n,l,st,_=cv2.connectedComponentsWithStats(keep)
order=sorted(range(1,n),key=lambda i:-st[i,4])[:2]
birds={}
for i in order:
    x,y,w,h,a=st[i]
    name='a' if y<40 else 'b'
    birds[name]=(l==i).astype(np.uint8)*255
full=np.zeros(src.shape[:2],np.uint8)
for k,mm in birds.items(): full[y0:y1,x0:x1]|=mm
# clean plate: inpaint where the birds are
plate=cv2.inpaint(src,cv2.dilate(full,np.ones((13,13),np.uint8)),11,cv2.INPAINT_TELEA)
cv2.imwrite('plate.jpg',plate,[cv2.IMWRITE_JPEG_QUALITY,93])
wings={'a':np.array([(258,50),(304,46),(302,72),(294,120),(268,120),(256,88)]),
       'b':np.array([(100,74),(140,72),(146,104),(142,128),(112,146),(100,118)])}
pivot={'a':(284,56),'b':(128,132)}
meta={}
for k,mm in birds.items():
    soft=cv2.GaussianBlur(cv2.dilate(mm,np.ones((2,2),np.uint8)),(3,3),0)
    wing=np.zeros_like(mm); cv2.fillPoly(wing,[wings[k]],255); wing=cv2.bitwise_and(wing,mm)
    wing_soft=cv2.GaussianBlur(wing,(3,3),0)
    body_soft=np.minimum(soft, 255-cv2.GaussianBlur(cv2.erode(wing,np.ones((3,3),np.uint8)),(3,3),0))
    ys,xs=np.where(mm>0); bx0,by0,bx1,by1=xs.min()-3,ys.min()-3,xs.max()+4,ys.max()+4
    for part,alpha in (('body',body_soft),('wing',wing_soft)):
        rgba=np.dstack([sub,alpha])[by0:by1,bx0:bx1]
        cv2.imwrite(f'{k}-{part}.png',rgba)
    meta[k]=dict(x=int(x0+bx0),y=int(y0+by0),w=int(bx1-bx0),h=int(by1-by0),px=int(pivot[k][0]-bx0),py=int(pivot[k][1]-by0))
print(meta)
import json; json.dump(meta,open('meta.json','w'))
# preview frames: wing rotations
def comp(angle_a,angle_b,dy):
    out=plate.copy().astype(float)
    for k,ang in (('a',angle_a),('b',angle_b)):
        mt=meta[k]
        for part in ('body','wing'):
            img=cv2.imread(f'{k}-{part}.png',cv2.IMREAD_UNCHANGED).astype(float)
            if part=='wing':
                M=cv2.getRotationMatrix2D((mt['px'],mt['py']),ang,1)
                img=cv2.warpAffine(img,M,(mt['w'],mt['h']))
            yy=mt['y']+dy; xx=mt['x']
            a=img[...,3:]/255
            out[yy:yy+mt['h'],xx:xx+mt['w']]=out[yy:yy+mt['h'],xx:xx+mt['w']]*(1-a)+img[...,:3]*a
    return out.astype(np.uint8)
frames=[comp(-8,8,0),comp(0,0,-2),comp(8,-8,-3)]
crops=[cv2.resize(f[430:640,390:750],None,fx=1.6,fy=1.6) for f in frames]
cv2.imwrite('frames.png',np.vstack(crops+[cv2.resize(plate[430:640,390:750],None,fx=1.6,fy=1.6)]))
