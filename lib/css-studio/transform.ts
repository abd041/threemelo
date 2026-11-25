import type {Config,Pose,Operation} from './model.ts';
export const number = (v:number) => String(Math.round(v*10000)/10000);
export function transformParts(c:Config,p:Pose=c.pose): Record<Operation,string> {
  const n=number;
  return {perspective:`perspective(${n(c.perspective.distance)}px)`,translate:`translate3d(${n(p.tx)}${c.units.tx}, ${n(p.ty)}${c.units.ty}, ${n(p.tz)}${c.units.tz})`,rotate:c.rotateMode==='axis'?`rotate3d(${n(p.ax)}, ${n(p.ay)}, ${n(p.az)}, ${n(p.angle)}deg)`:`rotateX(${n(p.rx)}deg) rotateY(${n(p.ry)}deg) rotateZ(${n(p.rz)}deg)`,scale:`scale3d(${n(p.sx)}, ${n(p.sy)}, ${n(p.sz)})`,skew:`skew(${n(p.kx)}deg, ${n(p.ky)}deg)`};
}
export function transform(c:Config,p:Pose=c.pose):string {const parts=transformParts(c,p);return c.order.filter(k=>c.enabled[k]&&(k!=='perspective'||c.perspective.mode==='function')).map(k=>parts[k]).join(' ')||'none';}
export const origin=(c:Config)=>`${number(c.origin.x)}${c.units.ox} ${number(c.origin.y)}${c.units.oy} ${number(c.origin.z)}${c.units.oz}`;
export const easing=(c:Config)=>c.animation.easing==='custom'?`cubic-bezier(${c.animation.bezier.map(number).join(', ')})`:c.animation.easing;
export function motionCSS(c:Config,selector='.tm-object',scene='.tm-scene',name='tm-motion'):string {
  const a=c.animation;if(a.mode==='static')return '';
  const start=transform(c),end=transform(c,a.end);
  const motion=a.mode==='hover'?`${selector} { transition: transform ${a.duration}s ${easing(c)} ${a.delay}s; }\n${scene}:hover ${selector}, ${scene}:focus-within ${selector} { transform: ${end}; }`:`${selector} { animation: ${name} ${a.duration}s ${easing(c)} ${a.delay}s ${a.infinite?'infinite':a.iterations} ${a.direction} ${a.fill} ${a.playState}; }\n@keyframes ${name} {\n  from { transform: ${start}; }\n  to { transform: ${end}; }\n}`;
  return `${motion}\n@media (prefers-reduced-motion: reduce) {\n  ${selector}, ${scene}:hover ${selector}, ${scene}:focus-within ${selector} { animation: none; transition: none; transform: ${start}; }\n}`;
}
export function transformCSS(c:Config):string {
  return `.tm-scene {\n  perspective: ${c.perspective.mode==='parent'?number(c.perspective.distance)+'px':'none'};\n  perspective-origin: ${number(c.perspective.x)}% ${number(c.perspective.y)}%;\n}\n.tm-object {\n  transform: ${transform(c)};\n  transform-origin: ${origin(c)};\n  transform-style: ${c.rendering.style};\n  backface-visibility: ${c.rendering.backface};\n}\n.tm-face { backface-visibility: ${c.rendering.backface}; }\n${motionCSS(c)}`;
}
