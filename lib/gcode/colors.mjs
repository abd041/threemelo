import {FEATURES,TYPES} from './config.mjs';
export const PALETTE=['#a78bfa','#22d3ee','#fb7185','#fbbf24','#34d399','#94a3b8','#fb923c','#60a5fa','#e879f9','#a3e635','#f472b6','#2dd4bf'];
export function colorFor(data,i,mode){
 if(mode==='movement')return PALETTE[data.types[i]];
 if(mode==='feature')return data.features[i]===0?'#94a3b8':PALETTE[data.features[i]%PALETTE.length];
 if(mode==='tool')return PALETTE[data.tools[i]%PALETTE.length];
 const v=mode==='speed'?data.speeds[i]:mode==='layer'?data.layerIds[i]:mode==='nozzle'?data.nozzles[i]:data.beds[i];
 if(!Number.isFinite(v)||mode==='speed'&&v<=0)return '#94a3b8';
 const lo=mode==='speed'?data.minSpeed:0,hi=mode==='speed'?data.maxSpeed:mode==='layer'?Math.max(1,data.layers.length-1):mode==='nozzle'?300:120;
 const t=Math.max(0,Math.min(1,(v-lo)/(hi-lo||1)));
 return 'hsl('+Math.round(210-t*210)+',85%,60%)';
}
export function legend(data,mode){
 if(mode==='movement')return TYPES.map((label,i)=>({label,color:PALETTE[i]}));
 if(mode==='feature')return [...new Set(data.features)].map(i=>({label:FEATURES[i],color:i===0?'#94a3b8':PALETTE[i%12]}));
 if(mode==='tool')return [...new Set(data.tools)].map(i=>({label:'Tool '+i,color:PALETTE[i%12]}));
 return [{label:mode==='speed'?'Blue: '+data.minSpeed.toFixed(1)+' / red: '+data.maxSpeed.toFixed(1)+' mm/s':mode==='layer'?'Blue: first / red: last':mode==='nozzle'?'Commanded temperature: 0-300 °C':'Commanded temperature: 0-120 °C',color:'linear-gradient(90deg,#26b2f0,#f02626)'},{label:'Gray: unavailable',color:'#94a3b8'}];
}
