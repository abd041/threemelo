import type {Config} from './model.ts';
export interface ObjectNode {tag:'div'|'span'|'strong';className:string;text?:string;children?:ObjectNode[];}
export function objectNodes(c:Config):ObjectNode[] {
  const o=c.object;
  const face=(name:string,text:string):ObjectNode=>({tag:'div',className:`tm-face tm-${name}`,text});
  if(o.shape==='cube'||o.shape==='book')return ['front','back','right','left','top','bottom'].map(name=>face(name,o.labels?(name==='front'?o.text:name.toUpperCase()):''));
  if(o.shape==='text')return Array.from({length:9},(_,i)=>({tag:'span',className:`tm-text-layer tm-text-${i}`,text:o.text}));
  if(o.shape==='layers')return [0,1,2].map(i=>({tag:'div',className:`tm-face tm-panel tm-panel-${i}`,children:[{tag:'span',className:'tm-eyebrow',text:o.labels?`LAYER 0${i+1}`:''},{tag:'strong',className:'tm-title',text:i===2?o.text:''},{tag:'div',className:'tm-skeleton'},{tag:'div',className:'tm-skeleton tm-short'}]}));
  const front:ObjectNode={tag:'div',className:'tm-face tm-front tm-surface',children:[...(o.shape==='browser'?[{tag:'div' as const,className:'tm-browser-bar',text:'● ● ●   threemelo.local'}]:[]),{tag:'span',className:'tm-eyebrow',text:o.labels?'CSS / THREE DIMENSIONS':''},{tag:'strong',className:'tm-title',text:o.text},{tag:'span',className:'tm-caption',text:o.labels?'A new perspective.':''}]};
  return [front,face('back',o.labels?'BACK':'')];
}
// Both the live object and every complete export use this exact geometry stylesheet.
export function geometryCSS(c:Config):string {
  const o=c.object,w=o.width,h=o.height,d=o.depth;
  return `.tm-object { position: relative; width: ${w}px; height: ${h}px; font-family: system-ui, sans-serif; }
.tm-face { backface-visibility: ${c.rendering.backface}; }
.tm-object *, .tm-object *::before { box-sizing: border-box; }
.tm-face { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 12px; overflow-wrap: anywhere; text-align: center; border: ${o.borderWidth}px solid ${o.border}; border-radius: ${o.radius}px; background: ${o.primary}; color: ${contrastText(o.primary)}; font-size: 14px; font-weight: 600; ${o.shadow?'box-shadow: 0 16px 32px #0004;':''} }
.tm-front { transform: translateZ(0.1px); }
.tm-back { background: ${o.secondary}; color: ${contrastText(o.secondary)}; transform: rotateY(180deg) translateZ(0.1px); }
.tm-object[data-shape="cube"] .tm-front, .tm-object[data-shape="book"] .tm-front { transform: translateZ(${d/2}px); }
.tm-object[data-shape="cube"] .tm-back, .tm-object[data-shape="book"] .tm-back { transform: rotateY(180deg) translateZ(${d/2}px); }
.tm-right, .tm-left { inset: auto; top: 0; left: ${(w-d)/2}px; width: ${d}px; height: ${h}px; background: ${o.secondary}; color: ${contrastText(o.secondary)}; }
.tm-right { transform: rotateY(90deg) translateZ(${w/2}px); }
.tm-left { transform: rotateY(-90deg) translateZ(${w/2}px); }
.tm-top, .tm-bottom { inset: auto; top: ${(h-d)/2}px; left: 0; width: ${w}px; height: ${d}px; }
.tm-top { transform: rotateX(90deg) translateZ(${h/2}px); }
.tm-bottom { transform: rotateX(-90deg) translateZ(${h/2}px); background: ${o.secondary}; color: ${contrastText(o.secondary)}; }
.tm-object[data-shape="book"] .tm-right, .tm-object[data-shape="book"] .tm-top, .tm-object[data-shape="book"] .tm-bottom { background: repeating-linear-gradient(0deg,#fff 0 2px,#ddd 2px 3px); color: #242424; }
.tm-surface { gap: 16px; align-items: flex-start; text-align: left; padding: 20px; }
.tm-title { font-size: ${Math.max(16,Math.min(w/8,32))}px; line-height: 1.2; }
.tm-eyebrow { font-size: 10px; letter-spacing: .08em; }
.tm-caption { font-size: 12px; font-weight: 400; }
.tm-browser-bar { align-self: stretch; border-bottom: 1px solid currentColor; padding-bottom: 12px; font: 10px monospace; }
.tm-panel { gap: 12px; align-items: flex-start; text-align: left; }
.tm-panel-0 { transform: translateZ(${-d/2}px); background: ${o.secondary}; color: ${contrastText(o.secondary)}; }
.tm-panel-1 { transform: translateZ(0); }
.tm-panel-2 { transform: translateZ(${d/2}px); }
.tm-skeleton { width: 85%; height: 8px; border-radius: 4px; background: currentColor; opacity: .3; }
.tm-short { width: 55%; }
.tm-text-layer { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; overflow-wrap: anywhere; font-size: ${Math.max(20,Math.min(w/4,72))}px; font-weight: 900; line-height: 1.1; color: ${o.secondary}; backface-visibility: ${c.rendering.backface}; }
${Array.from({length:9},(_,i)=>`.tm-text-${i} { transform: translateZ(${i*d/8}px); ${i===8?`color: ${o.primary};`:''} }`).join('\n')}`;
}
export function contrastText(hex:string):string {const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>.179?'#101624':'#ffffff';}
