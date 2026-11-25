import {LIMITS} from './config.mjs';
const FIELDS={positions:[Float32Array,6],speeds:[Float32Array,1],types:[Uint8Array,1],lines:[Uint32Array,1],hints:[Int32Array,1],features:[Uint8Array,1],tools:[Uint16Array,1],nozzles:[Float32Array,1],beds:[Float32Array,1]};
export class MovementBuffer{
 constructor(){this.count=0;this.capacity=4096;this.arrays={};for(const[k,[Type,stride]]of Object.entries(FIELDS))this.arrays[k]=new Type(this.capacity*stride);}
 push(from,to,{speed,type,line,hint,feature,tool,nozzle,bed}){
  if(this.count>=LIMITS.segments)throw Error('This file exceeds 750,000 rendered movements (including arc chords). Export a smaller file or use a desktop slicer.');
  if(this.count===this.capacity){this.capacity=Math.min(LIMITS.segments,this.capacity*2);for(const[k,[Type,stride]]of Object.entries(FIELDS)){const next=new Type(this.capacity*stride);next.set(this.arrays[k]);this.arrays[k]=next;}}
  const i=this.count++;this.arrays.positions.set([...from,...to],i*6);
  for(const[k,value]of Object.entries({speeds:speed,types:type,lines:line,hints:hint,features:feature,tools:tool,nozzles:nozzle,beds:bed}))this.arrays[k][i]=value;
 }
 finish(){const out={count:this.count};for(const[k,[,stride]]of Object.entries(FIELDS))out[k]=this.arrays[k].slice(0,this.count*stride);this.arrays={};return out;}
}
