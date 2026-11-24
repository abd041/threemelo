import {validateLogoText} from './logo-utils.mjs';
export const sampleSVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><path fill-rule="evenodd" d="M0 0 H100 V60 H0 Z M20 20 V40 H40 V20 Z"/></svg>';
export function validateSVG(text){validateLogoText(text);if(/<\s*(?:text|tspan|filter|mask|clipPath|pattern|linearGradient|radialGradient|defs)\b/i.test(text))throw Error('Convert text, masks, gradients and effects to plain filled outlines first.');return text;}
export function dimensions(w,h,size,depth){if(![w,h,size,depth].every(Number.isFinite)||w<=0||h<=0||size<5||size>300||depth<.5||depth>50)throw Error('Invalid dimensions. Choose a longest side of 5–300 mm and thickness of 0.5–50 mm.');const scale=size/Math.max(w,h);return {width:w*scale,height:h*scale,depth,scale};}
