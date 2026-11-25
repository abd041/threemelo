import {defaultConfig,identity} from './model.ts';
import type {Config,Pose,Shape} from './model.ts';
export interface Preset {name:string;description:string;config:Config;}
function preset(name:string,description:string,pose:Partial<Pose>,shape:Shape='cube',motion?:Partial<Pose>,mode:'keyframes'|'hover'='keyframes'):Preset {
  const c=defaultConfig();c.pose={...identity,...pose};c.object.shape=shape;
  if(shape==='card'||shape==='browser')c.rendering.backface='hidden';
  if(shape!=='cube'){c.object.width=240;c.object.height=160;c.object.depth=shape==='book'?30:70;c.object.radius=shape==='text'?0:10;}
  if(shape==='book'){c.object.width=160;c.object.height=220;c.object.radius=2;}
  if(shape==='text'){c.object.text='HELLO';c.object.depth=16;}
  if(motion){c.animation.mode=mode;c.animation.end={...c.pose,...motion};c.animation.direction=name.includes('Spin')||name==='Spinning Cube'?'normal':'alternate';c.animation.easing=name.includes('Spin')||name==='Spinning Cube'?'linear':'ease-in-out';}
  return {name,description,config:c};
}
export const presets:Preset[]=[
  preset('Identity / Default','A clean starting point with no rotation.',{}),
  preset('Isometric Cube','Equal visual emphasis on three cube faces.',{rx:35.264,ry:-45}),
  preset('Perspective Tilt','Tilt a card around two axes.',{rx:15,ry:25,rz:-8},'card'),
  preset('Floating Card','Lift a UI card toward the viewer.',{rx:20,ry:-20,tz:45},'card'),
  preset('Card Flip','Inspect the reverse side of a card.',{ry:180},'card'),
  preset('Reverse Card Flip','Turn a card in the opposite direction.',{ry:-180},'card'),
  preset('Side Rotation','Explore rotation around the vertical axis.',{ry:65}),
  preset('Top Rotation','Look down on the top face.',{rx:65}),
  preset('3D Poster','Give a flat design a dimensional presentation.',{rx:8,ry:-30,rz:5},'card'),
  preset('Layered Interface','Separate interface planes along the Z axis.',{rx:45,ry:0,rz:-25},'layers'),
  preset('Angled Browser','Present an interface in a CSS browser frame.',{rx:10,ry:-25},'browser'),
  preset('3D Book','A six-sided cover with a visible spine.',{rx:10,ry:-30},'book'),
  preset('Skewed Panel','Combine skew and a small rotation.',{kx:-15,rz:-5},'card'),
  preset('Spinning Cube','A continuous full turn; motion is optional.',{rx:25,ry:-30},'cube',{ry:330}),
  preset('Hover Lift','Hover or focus the scene to lift the card.',{rx:0},'card',{ty:-20,rx:12,tz:40},'hover'),
  preset('3D Text','Stack real text layers to create depth.',{rx:15,ry:-25},'text')
];
export const animationPresets:Preset[]=[
  preset('Continuous Spin','Full rotation with linear timing.',{rx:25},'cube',{ry:360}),
  preset('Card Flip','Turn between the front and reverse.',{},'card',{ry:180}),
  preset('Floating Motion','A subtle vertical drift.',{rx:12,ry:-15},'card',{ty:-24}),
  preset('Gentle Tilt','Alternate between two small angles.',{rx:-8,ry:-8},'card',{rx:8,ry:8}),
  preset('Swing','Swing around the Z axis.',{rz:-15},'book',{rz:15}),
  presets[14],
  preset('Perspective Entrance','Move a card forward from depth.',{tz:-200,rx:50,sx:.6,sy:.6,sz:.6},'card',{tz:0,rx:0,sx:1,sy:1,sz:1}),
  preset('3D Reveal','Rotate an interface into view.',{ry:-90},'browser',{ry:0})
];
animationPresets[4].config.origin={x:50,y:0,z:0};
for(const p of animationPresets.slice(6)){p.config.animation.infinite=false;p.config.animation.direction='normal';}
