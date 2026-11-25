import type {Unit} from './types.ts';
export const units: Unit[] = ['ft-in', 'ft', 'in', 'm', 'cm'];
export const unitNames = {'ft-in': 'Feet & inches', ft: 'Feet', in: 'Inches', m: 'Meters', cm: 'Centimeters'};
const factors = {ft: .3048, in: .0254, m: 1, cm: .01};
export function parseLength(input: string, unit: Unit = 'ft-in'): number {
  const text = input.trim().toLowerCase().replace(/[′’]/g, "'").replace(/[″“”]/g, '"');
  if (!text || text.length > 80) throw Error('Enter a length, such as 12 ft 6 in or 3.81 m.');
  const plain = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text);
  if (plain) return Number(text) * factors[unit === 'ft-in' ? 'ft' : unit];
  const combined = /^([-+]?)(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|')\s*(\d+(?:\.\d+)?)?\s*(?:in|inches|inch|")?$/.exec(text);
  if (combined) {const inches=Number(combined[3] || 0); if(inches>=12) throw Error('Use fewer than 12 inches after feet.'); return (combined[1]==='-'?-1:1)*(Number(combined[2])*.3048+inches*.0254);}
  const one = /^([-+]?(?:\d+(?:\.\d*)?|\.\d+))\s*(ft|in|m|cm|")$/.exec(text);
  if (!one) throw Error('Use feet/inches or metric lengths, for example 12\' 6" or 381 cm.');
  return Number(one[1]) * factors[one[2] === '"' ? 'in' : one[2] as keyof typeof factors];
}
export function formatLength(m: number, unit: Unit): string {
  if (unit === 'ft-in') {const total=Math.round(Math.abs(m)/.0254*8)/8;return `${m<0?'-':''}${Math.floor(total/12)}′ ${+(total%12).toFixed(3)}″`;}
  return `${+(m/factors[unit]).toFixed(unit==='cm'?1:3)} ${unit}`;
}
export const formatArea = (area: number, unit: Unit) => ['ft-in','ft','in'].includes(unit) ? `${(area/.09290304).toFixed(1)} sq ft` : `${area.toFixed(2)} m²`;
