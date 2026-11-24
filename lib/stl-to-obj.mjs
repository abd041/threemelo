import {inspectSTL} from './mesh-metrics.mjs';
export function convertSTL(buffer,{scale=1,weld=false}={}){
 if(buffer.byteLength>50*1024*1024)throw Error('Maximum file size is 50 MB.');
 if(!Number.isFinite(scale)||scale<=0||scale>1000000)throw Error('Scale must be positive and at most 1,000,000.');
 const format=inspectSTL(buffer),vertices=[],faces=[],map=new Map();let triangles=0;
 function triangle(coords){if(coords.length!==9||coords.some(v=>!Number.isFinite(v)))throw Error('Invalid triangle coordinates.');if(++triangles>1000000)throw Error('Maximum one million triangles.');const ids=[];for(let j=0;j<9;j+=3){const p=coords.slice(j,j+3).map(v=>v*scale);if(p.some(v=>!Number.isFinite(v)))throw Error('Scaled coordinate overflow.');const key=p.join(' ');let id=weld?map.get(key):undefined;if(id===undefined){id=vertices.push('v '+key);if(weld)map.set(key,id);}ids.push(id);}faces.push('f '+ids.join(' '));}
 if(format==='Binary'){const view=new DataView(buffer),n=view.getUint32(80,true);for(let i=0;i<n;i++){const p=[];for(let j=0;j<9;j++)p.push(view.getFloat32(84+i*50+12+j*4,true));triangle(p);}}
 else {const text=new TextDecoder().decode(buffer);const facets=text.matchAll(/\bfacet\s+normal\b[^\r\n]*\s+outer\s+loop\s+([\s\S]*?)\s+endloop\s+endfacet\b/gi);for(const f of facets){const p=[];const lines=f[1].trim().split(/\s+/);if(lines.length!==12)throw Error('Invalid ASCII facet.');for(let j=0;j<12;j+=4){if(lines[j].toLowerCase()!=='vertex')throw Error('Invalid ASCII vertex.');p.push(...lines.slice(j+1,j+4).map(Number));}triangle(p);}if(triangles!==(text.match(/\bfacet\s+normal\b/gi)||[]).length)throw Error('Malformed ASCII STL facet.');}
 if(!triangles)throw Error('No triangles found.');return {text:['# Converted locally by ThreeMelo','o ConvertedMesh',...vertices,...faces].join('\n')+'\n',format,triangles,vertices:vertices.length};
}
