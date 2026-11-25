/** Only depositing movements create layers; travel and Z hops do not. */
export function detectLayers(data){
 const {count,positions:p,types,hints}=data,ids=new Uint32Array(count),layers=[],map=new Map();
 const depositing=i=>types[i]===0&&Math.hypot(p[i*6+3]-p[i*6],p[i*6+4]-p[i*6+1],p[i*6+5]-p[i*6+2])>1e-8;
 let continuous=false,lastZ=null,hasHints=false,allHints=true;
 for(let i=0;i<count;i++)if(depositing(i)){if(Math.abs(p[i*6+5]-p[i*6+2])>.001)continuous=true;if(hints[i]>=0)hasHints=true;else allHints=false;}
 let mode=continuous?'height':hasHints&&allHints?'metadata':'inferred';
 // Conflicting Z within a slicer layer is not presented as an exact physical layer.
 if(mode==='metadata'){const zs=new Map();for(let i=0;i<count;i++)if(depositing(i)){const z=p[i*6+5],h=hints[i];if(zs.has(h)&&Math.abs(zs.get(h)-z)>.02){mode='height';break;}zs.set(h,z);}}
 let minZ=Infinity,maxZ=-Infinity;
 for(let i=0;i<count;i++)if(depositing(i)){minZ=Math.min(minZ,p[i*6+2],p[i*6+5]);maxZ=Math.max(maxZ,p[i*6+2],p[i*6+5]);}
 if(!Number.isFinite(minZ)){mode='height';for(let i=0;i<count;i++){minZ=Math.min(minZ,p[i*6+2],p[i*6+5]);maxZ=Math.max(maxZ,p[i*6+2],p[i*6+5]);}}
 if(mode==='height'){
  const bins=Math.max(1,Math.min(128,Math.ceil((maxZ-minZ)/.2))),step=(maxZ-minZ)/bins;
  for(let j=0;j<bins;j++)layers.push(minZ+(j+1)*step);
  for(let i=0;i<count;i++)ids[i]=step?Math.max(0,Math.min(bins-1,Math.floor((p[i*6+5]-minZ)/step))):0;
 }else{
  let active=0,pending=0;
  for(let i=0;i<count;i++)if(depositing(i)){
   const z=p[i*6+5],key=mode==='metadata'?hints[i]:Math.round(z*10000);
   if(!map.has(key)){map.set(key,layers.length);layers.push(Math.round(z*10000)/10000);}
   const id=map.get(key);
   if(id!==active||lastZ===null){for(let j=pending;j<=i;j++)ids[j]=id;}else ids[i]=active;
   active=id;lastZ=z;pending=i+1;
  }else ids[i]=active;
 }
 delete data.hints;
 return {layers,layerIds:ids,layerMode:mode,layerConfidence:mode==='metadata'?'Slicer markers (validated against deposition height)':mode==='inferred'?'Inferred from planar depositing moves':'Z-height bands; physical layer count unavailable',minZ,maxZ};
}
