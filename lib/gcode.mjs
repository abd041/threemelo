// Stable public facade for existing consumers; the worker uses the packed parser directly.
import {parseToolpath} from './gcode/parser.mjs';
export {SAMPLE} from './gcode/examples.mjs';
export function parseGcode(text,options){
 const data=parseToolpath(text,options);
 Object.defineProperty(data,'segments',{enumerable:false,get(){return Array.from({length:data.count},(_,i)=>({from:Array.from(data.positions.slice(i*6,i*6+3)),to:Array.from(data.positions.slice(i*6+3,i*6+6)),print:data.types[i]===0,z:data.positions[i*6+5]}));}});
 return data;
}
export function visiblePaths(data,index,showTravel=true,only=false){
 const out={print:[],travel:[]};if(data.layers[index]===undefined)return out;
 for(let i=0;i<data.count;i++){if(only?data.layerIds[i]!==index:data.layerIds[i]>index)continue;const print=data.types[i]===0;if(!print&&!showTravel)continue;out[print?'print':'travel'].push(...data.positions.slice(i*6,i*6+6));}return out;
}
