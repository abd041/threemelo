import {movementVisible} from '../lib/gcode/statistics.mjs';
import {colorFor} from '../lib/gcode/colors.mjs';
export function createGcodeStudio(host,{onSelect=()=>{}}={}){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas is unavailable in this browser.');host.append(canvas);canvas.tabIndex=0;canvas.setAttribute('aria-label','2D XY toolpath. Drag to pan and scroll to zoom.');
 let data,s,scale=3,cx=0,cy=0,w=1,h=1,frame=0,drag=null,disposed=false;
 const xy=(x,y)=>[(x-cx)*scale+w/2,h/2-(y-cy)*scale];
 function draw(){frame=0;if(!data||disposed)return;const style=getComputedStyle(host);ctx.fillStyle=style.getPropertyValue('--bg').trim();ctx.fillRect(0,0,w,h);
 const width=s.width,depth=s.shape==='circle'?width:s.depth,ox=s.origin==='center'?-width/2:0,oy=s.origin==='center'?-depth/2:0;
 ctx.strokeStyle=style.getPropertyValue('--border').trim();ctx.lineWidth=1;ctx.beginPath();
 const line=(x,y,x2,y2)=>{ctx.moveTo(...xy(x,y));ctx.lineTo(...xy(x2,y2));};
 ctx.save();const corner=xy(ox,oy+depth);if(s.shape==='circle'){ctx.beginPath();ctx.arc(...xy(ox+width/2,oy+depth/2),width*scale/2,0,2*Math.PI);}else{ctx.beginPath();ctx.rect(corner[0],corner[1],width*scale,depth*scale);}if(s.plate)ctx.stroke();ctx.clip();
 if(s.grid){ctx.beginPath();const step=Math.max(s.spacing,Math.max(width,depth)/200);for(let x=0;x<=width;x+=step)line(ox+x,oy,ox+x,oy+depth);for(let y=0;y<=depth;y+=step)line(ox,oy+y,ox+width,oy+y);ctx.stroke();}ctx.restore();
 if(s.axes){ctx.beginPath();ctx.strokeStyle='#fb7185';line(0,0,30,0);ctx.stroke();ctx.beginPath();ctx.strokeStyle='#34d399';line(0,0,0,30);ctx.stroke();}
 // Bound draw work on low-powered devices; statistics and source remain complete.
 const stride=Math.max(1,Math.ceil(data.count/80000)),groups=new Map();
 for(let i=0;i<Math.min(s.progress,data.count);i+=stride){if(!movementVisible(data,i,s))continue;const color=colorFor(data,i,s.color);if(!groups.has(color))groups.set(color,[]);groups.get(color).push(i);}
 for(const [color,indices]of groups){ctx.strokeStyle=color;ctx.fillStyle=color;ctx.beginPath();for(const i of indices){const j=i*6;if(data.types[i]===2||data.types[i]===3){const [x,y]=xy(data.positions[j+3],data.positions[j+4]);ctx.fillRect(x-2,y-2,4,4);}else line(data.positions[j],data.positions[j+1],data.positions[j+3],data.positions[j+4]);}ctx.stroke();}
 if(s.progress>0&&s.progress<data.count){const i=s.progress-1;if(movementVisible(data,i,s)){ctx.fillStyle=style.getPropertyValue('--text').trim();ctx.beginPath();ctx.arc(...xy(data.positions[i*6+3],data.positions[i*6+4]),4,0,Math.PI*2);ctx.fill();}}
 ctx.fillStyle=style.getPropertyValue('--subtle').trim();ctx.font='12px monospace';ctx.fillText('XY / '+(1/scale).toFixed(2)+' mm / px',12,h-14);
 }
 function invalidate(){if(!frame)frame=requestAnimationFrame(draw);}
 function fit(){if(!data)return;const b=data.printBounds||data.bounds;cx=(b.min[0]+b.max[0])/2;cy=(b.min[1]+b.max[1])/2;scale=Math.max(.001,Math.min((w-60)/Math.max(b.size[0],5),(h-60)/Math.max(b.size[1],5)));invalidate();}
 function resize(){w=Math.max(1,host.clientWidth);h=Math.max(1,host.clientHeight);const ratio=Math.min(devicePixelRatio,2);canvas.width=w*ratio;canvas.height=h*ratio;canvas.style.width=w+'px';canvas.style.height=h+'px';ctx.setTransform(ratio,0,0,ratio,0,0);invalidate();}
 const wheel=e=>{e.preventDefault();const r=canvas.getBoundingClientRect(),x=e.clientX-r.left-w/2,y=h/2-(e.clientY-r.top),factor=Math.exp(-e.deltaY*.001);const next=Math.max(.0001,Math.min(10000,scale*factor));cx+=x/scale-x/next;cy+=y/scale-y/next;scale=next;invalidate();};
 const down=e=>{if(e.pointerType==='touch'&&!s.touch)return;canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,cx,cy};},move=e=>{if(!drag)return;cx=drag.cx-(e.clientX-drag.x)/scale;cy=drag.cy+(e.clientY-drag.y)/scale;invalidate();},up=()=>{drag=null;};
 const select=e=>{if(!data)return;const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=12,index=-1;for(let i=0;i<data.count;i++){if(!movementVisible(data,i,s))continue;const p=xy(data.positions[i*6+3],data.positions[i*6+4]),dist=Math.hypot(p[0]-x,p[1]-y);if(dist<best){best=dist;index=i;}}if(index>=0)onSelect(index);};
 canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('dblclick',select);
 const observer=new ResizeObserver(resize);observer.observe(host);const theme=new MutationObserver(invalidate);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});resize();
 return {fit,update(next,settings){const fresh=data!==next;data=next;s=settings;canvas.style.touchAction=s.touch?'none':'pan-y';if(fresh)fit();invalidate();},screenshot:()=>new Promise((resolve,reject)=>{draw();canvas.toBlob(b=>b?resolve(b):reject(Error('Could not capture canvas.')),'image/png');}),dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();theme.disconnect();canvas.remove();}};
}
