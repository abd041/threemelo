export const units = ['px', '%', 'rem', 'em', 'vw', 'vh', 'vmin', 'vmax', 'cm', 'mm', 'in', 'pt', 'pc', 'ch', 'ex'] as const;
export type Unit = typeof units[number];
export const operations = ['perspective', 'translate', 'rotate', 'scale', 'skew'] as const;
export type Operation = typeof operations[number];
export const shapes = ['cube', 'card', 'layers', 'text', 'browser', 'book'] as const;
export type Shape = typeof shapes[number];
export interface Pose {
  rx: number; ry: number; rz: number; tx: number; ty: number; tz: number;
  sx: number; sy: number; sz: number; kx: number; ky: number;
  ax: number; ay: number; az: number; angle: number;
}
export interface Config {
  version: 1;
  pose: Pose;
  units: {tx: Unit; ty: Unit; tz: Exclude<Unit, '%'>; ox: Unit; oy: Unit; oz: Exclude<Unit, '%'>};
  perspective: {mode: 'parent' | 'function' | 'none'; distance: number; x: number; y: number};
  origin: {x: number; y: number; z: number};
  order: Operation[];
  enabled: Record<Operation, boolean>;
  rotateMode: 'euler' | 'axis'; linkedScale: boolean;
  rendering: {style: 'flat' | 'preserve-3d'; backface: 'visible' | 'hidden'};
  object: {shape: Shape; primary: string; secondary: string; background: string; width: number; height: number; depth: number; radius: number; border: string; borderWidth: number; shadow: boolean; labels: boolean; text: string};
  animation: {mode: 'static' | 'hover' | 'keyframes'; end: Pose; duration: number; delay: number; easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'custom'; bezier: [number, number, number, number]; infinite: boolean; iterations: number; direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'; fill: 'none' | 'forwards' | 'backwards' | 'both'; playState: 'running' | 'paused'};
}
export const identity: Pose = {rx:0,ry:0,rz:0,tx:0,ty:0,tz:0,sx:1,sy:1,sz:1,kx:0,ky:0,ax:0,ay:1,az:0,angle:0};
export function defaultConfig(): Config {
  return {version:1,pose:{...identity,rx:25,ry:-30},units:{tx:'px',ty:'px',tz:'px',ox:'%',oy:'%',oz:'px'},perspective:{mode:'parent',distance:700,x:50,y:50},origin:{x:50,y:50,z:0},order:[...operations],enabled:{perspective:true,translate:true,rotate:true,scale:true,skew:true},rotateMode:'euler',linkedScale:false,rendering:{style:'preserve-3d',backface:'visible'},object:{shape:'cube',primary:'#7c3aed',secondary:'#43317d',background:'#101624',width:150,height:150,depth:150,radius:0,border:'#c4b5fd',borderWidth:1,shadow:false,labels:true,text:'ThreeMelo'},animation:{mode:'static',end:{...identity,rx:25,ry:330},duration:3,delay:0,easing:'ease-in-out',bezier:[.25,.1,.25,1],infinite:true,iterations:1,direction:'normal',fill:'both',playState:'running'}};
}
export const poseLimits: Record<keyof Pose, [number, number, number]> = {
  rx:[-360,360,1],ry:[-360,360,1],rz:[-360,360,1],tx:[-300,300,1],ty:[-300,300,1],tz:[-300,300,1],sx:[-3,3,.01],sy:[-3,3,.01],sz:[-3,3,.01],kx:[-85,85,1],ky:[-85,85,1],ax:[-1,1,.1],ay:[-1,1,.1],az:[-1,1,.1],angle:[-360,360,1]
};
export function poseBounds(key: keyof Pose): [number,number] {return key==='kx'||key==='ky'?[-85,85]:key.startsWith('s')?[-100,100]:[-100000,100000];}

/** Strict, allowlisted validation: never merge arbitrary imported objects into state. */
export function validateConfig(input: unknown): Config {
  const candidate = defaultConfig();
  function walk(value: unknown, template: unknown, path: string): unknown {
    if (Array.isArray(template)) {
      if (!Array.isArray(value) || value.length !== template.length) throw new Error(`Invalid ${path}.`);
      return template.map((v,i)=>walk(value[i],v,`${path}.${i}`));
    }
    if (template !== null && typeof template === 'object') {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid ${path || 'configuration'}.`);
      return Object.fromEntries(Object.entries(template).map(([k,v])=>[k,walk((value as Record<string,unknown>)[k],v,path?`${path}.${k}`:k)]));
    }
    if (typeof value !== typeof template || (typeof value === 'number' && (!Number.isFinite(value) || Math.abs(value)>100000))) throw new Error(`Invalid ${path}.`);
    if (typeof value === 'string' && value.length>200) throw new Error(`${path} is too long (maximum 200 characters).`);
    return value;
  }
  const c = walk(input,candidate,'') as Config;
  const member = (v:string, allowed: readonly string[], label:string) => {if(!allowed.includes(v))throw new Error(`Invalid ${label}.`);};
  const bound = (v:number,min:number,max:number,label:string) => {if(v<min||v>max)throw new Error(`${label} must be between ${min} and ${max}.`);};
  if(c.version!==1)throw new Error('Unsupported configuration version.');
  for(const p of [c.pose,c.animation.end])for(const k of Object.keys(identity) as (keyof Pose)[])bound(p[k],...poseBounds(k),k);
  for(const [k,v] of Object.entries(c.units)) member(v,k==='tz'||k==='oz'?units.filter(u=>u!=='%'):units,k+' unit');
  member(c.perspective.mode,['parent','function','none'],'perspective mode');bound(c.perspective.distance,1,100000,'Perspective');
  member(c.rotateMode,['euler','axis'],'rotation mode');
  if(new Set(c.order).size!==operations.length||c.order.some(v=>!operations.includes(v)))throw new Error('Invalid transform order.');
  member(c.rendering.style,['flat','preserve-3d'],'transform style');member(c.rendering.backface,['visible','hidden'],'backface');
  member(c.object.shape,shapes,'preview object');
  for(const k of ['primary','secondary','background','border'] as const)if(!/^#[\da-f]{6}$/i.test(c.object[k]))throw new Error(`Invalid ${k} color.`);
  for(const k of ['width','height','depth'] as const)bound(c.object[k],1,1200,k);
  bound(c.object.radius,0,600,'Border radius');bound(c.object.borderWidth,0,30,'Border width');
  member(c.animation.mode,['static','hover','keyframes'],'animation mode');
  member(c.animation.easing,['linear','ease','ease-in','ease-out','ease-in-out','custom'],'easing');
  member(c.animation.direction,['normal','reverse','alternate','alternate-reverse'],'direction');
  member(c.animation.fill,['none','forwards','backwards','both'],'fill');member(c.animation.playState,['running','paused'],'play state');
  bound(c.animation.duration,.05,300,'Duration');bound(c.animation.delay,-300,300,'Delay');bound(c.animation.iterations,1,1000,'Iterations');
  if(!Number.isInteger(c.animation.iterations))throw new Error('Iterations must be a whole number.');
  c.animation.bezier.forEach((v,i)=>bound(v,i===0||i===2?0:-10,i===0||i===2?1:10,'Bezier coordinate'));
  return c;
}
export function parseConfig(text:string): Config {
  if(text.length>20000)throw new Error('Configuration is too large (maximum 20 KB).');
  let data:unknown;try{data=JSON.parse(text);}catch{throw new Error('Choose a valid JSON configuration exported by this studio.');}return validateConfig(data);
}
