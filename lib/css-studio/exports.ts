import type {Config} from './model.ts';
import {objectNodes,geometryCSS} from './geometry.ts';
import type {ObjectNode} from './geometry.ts';
import {transformCSS,transform,origin,transformParts} from './transform.ts';
export type Format='CSS'|'HTML + CSS'|'Tailwind'|'React / JSX'|'CSS Variables';
export const formats:Format[]=['CSS','HTML + CSS','Tailwind','React / JSX','CSS Variables'];
export const escapeHTML=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const safeJS=(s:string)=>JSON.stringify(s).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
function markup(nodes:ObjectNode[],jsx=false):string {return nodes.map(n=>`<${n.tag} ${jsx?'className':'class'}="${n.className}">${n.text?(jsx?`{${safeJS(n.text)}}`:escapeHTML(n.text)):''}${n.children?markup(n.children,jsx):''}</${n.tag}>`).join('\n');}
export function objectMarkup(c:Config,jsx=false):string {return `<div ${jsx?'className':'class'}="tm-object" data-shape="${c.object.shape}">\n${markup(objectNodes(c),jsx)}\n</div>`;}
export function sceneCSS(c:Config):string {return `.tm-scene { display: grid; place-items: center; min-height: 420px; padding: 48px; background: ${c.object.background}; overflow: clip; }\n${geometryCSS(c)}\n${transformCSS(c)}`;}
export function htmlExport(c:Config):string {return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>ThreeMelo CSS 3D example</title>\n<style>\nbody { margin: 0; }\n${sceneCSS(c)}\n</style>\n</head>\n<body>\n<div class="tm-scene" tabindex="0" role="img" aria-label="Interactive CSS 3D ${c.object.shape}; hover or focus to animate">\n${objectMarkup(c)}\n</div>\n</body>\n</html>`;}
export function jsxExport(c:Config):string {return `// Self-contained React component. No additional dependencies.\nexport default function TransformExample() {\n  return (\n    <>\n      <style>{${safeJS(sceneCSS(c))}}</style>\n      <div className="tm-scene" tabIndex={0} role="img" aria-label="Interactive CSS 3D ${c.object.shape}; hover or focus to animate">\n        ${objectMarkup(c,true)}\n      </div>\n    </>\n  );\n}\n`;}
export function tailwindExport(c:Config):string {
  const value=(s:string)=>s.replace(/ /g,'_');
  const cls=`[transform:${value(transform(c))}] [transform-origin:${value(origin(c))}] [transform-style:${c.rendering.style}] [backface-visibility:${c.rendering.backface}]`;
  // Arbitrary properties preserve the entire ordered transform in Tailwind v3 and v4.
  return `<!-- Tailwind v3/v4. Include ALL supporting CSS below for geometry and motion. -->\n<div class="tm-scene" tabindex="0" role="img" aria-label="Interactive CSS 3D example">\n${objectMarkup(c).replace('class="tm-object"',`class="tm-object ${cls}"`)}\n</div>\n<style>\n${sceneCSS(c)}\n</style>`;
}
export function variablesExport(c:Config):string {
  const parts=transformParts(c);let css=transformCSS(c);
  const entries=c.order.filter(k=>c.enabled[k]&&(k!=='perspective'||c.perspective.mode==='function'));
  css=css.replace(`transform: ${transform(c)};`,`transform: ${entries.map(k=>`var(--tm-${k})`).join(' ')||'none'};`);
  return `.tm-scene { display: grid; place-items: center; min-height: 420px; padding: 48px; background: ${c.object.background}; overflow: clip; }\n/* Set these properties on .tm-scene. Animation endpoints remain explicit. */\n.tm-scene {\n${entries.map(k=>`  --tm-${k}: ${parts[k]};`).join('\n')}\n}\n${geometryCSS(c)}\n${css}\n/* Usage: complete example markup. */\n/*\n<div class="tm-scene" tabindex="0">\n${objectMarkup(c).replace(/\*\//g,'* /')}\n</div>\n*/`;
}
export function exportCode(c:Config,f:Format):string {switch(f){case 'CSS':return `/* Transformation settings. HTML, JSX and Tailwind exports also include object geometry. */\n${transformCSS(c)}`;case 'HTML + CSS':return htmlExport(c);case 'React / JSX':return jsxExport(c);case 'Tailwind':return tailwindExport(c);case 'CSS Variables':return variablesExport(c);}}
export const extension=(f:Format)=>f==='React / JSX'?'jsx':f==='HTML + CSS'||f==='Tailwind'?'html':'css';
