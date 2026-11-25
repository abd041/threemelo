import {LIMITS} from './config.mjs';
const TAU=Math.PI*2;
const sweep=(start,end,cw,full)=>full?(cw?-TAU:TAU):cw?-((start-end+TAU)%TAU||TAU):((end-start+TAU)%TAU||TAU);
/** Right-handed planes XY, ZX, YZ. I/J/K always relative to the starting point. */
export function interpolateArc(from,to,words,clockwise,plane=17,unit=1,tolerance=.1){
 const [u,v,w,cu,cv]=plane===17?[0,1,2,'I','J']:plane===18?[2,0,1,'K','I']:[1,2,0,'J','K'];
 let cx,cy,angle,radius;
 const dx=to[u]-from[u],dy=to[v]-from[v],chord=Math.hypot(dx,dy),full=chord<1e-8;
 if('R'in words){
  if(cu in words||cv in words)throw Error('Arc mixes radius and center offsets.');
  radius=Math.abs(words.R*unit);if(!radius||full||chord>2*radius+1e-7)throw Error('Radius arc has no valid center; full circles require I/J/K offsets.');
  const midx=(from[u]+to[u])/2,midy=(from[v]+to[v])/2,h=Math.sqrt(Math.max(0,radius*radius-chord*chord/4));
  for(const sign of [1,-1]){const x=midx-sign*dy/chord*h,y=midy+sign*dx/chord*h,a=Math.atan2(from[v]-y,from[u]-x),b=Math.atan2(to[v]-y,to[u]-x),s=sweep(a,b,clockwise,false);if((words.R>=0&&Math.abs(s)<=Math.PI+1e-8)||(words.R<0&&Math.abs(s)>=Math.PI-1e-8)){cx=x;cy=y;angle=s;break;}}
 }else{
  if(!(cu in words)&&!(cv in words))throw Error('Arc needs center offsets or a radius.');
  cx=from[u]+(words[cu]||0)*unit;cy=from[v]+(words[cv]||0)*unit;radius=Math.hypot(from[u]-cx,from[v]-cy);
  if(radius<1e-8)throw Error('Arc radius is zero.');
  if(Math.abs(Math.hypot(to[u]-cx,to[v]-cy)-radius)>Math.max(.02,radius*.001))throw Error('Arc endpoints do not share a radius.');
  angle=sweep(Math.atan2(from[v]-cy,from[u]-cx),Math.atan2(to[v]-cy,to[u]-cx),clockwise,full);
 }
 if(!Number.isFinite(angle)||radius>LIMITS.coordinate)throw Error('Invalid or excessively large arc.');
 const step=Math.min(Math.PI/12,2*Math.acos(Math.max(-1,1-tolerance/radius))),count=Math.max(1,Math.ceil(Math.abs(angle)/Math.max(step,1e-6)));
 if(count>LIMITS.arcSegments)throw Error('Arc exceeds the 4,096-segment interpolation limit.');
 const start=Math.atan2(from[v]-cy,from[u]-cx);
 const points=Array.from({length:count},(_,i)=>{const f=(i+1)/count,p=[...from];p[u]=cx+radius*Math.cos(start+angle*f);p[v]=cy+radius*Math.sin(start+angle*f);p[w]=from[w]+(to[w]-from[w])*f;if(p.some(n=>!Number.isFinite(n)||Math.abs(n)>LIMITS.coordinate))throw Error('Arc leaves the supported coordinate range.');return p;});
 points[count-1]=[...to];
 return {points,length:Math.hypot(radius*Math.abs(angle),to[w]-from[w])};
}
