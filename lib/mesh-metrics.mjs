// Metrics in native STL coordinate units. STL does not encode units.
export function meshMetrics(p){
 if(!p.length||p.length%9)throw Error('No complete triangles found.');
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<p.length;i++){if(!Number.isFinite(p[i]))throw Error('Invalid vertex coordinate.');const k=i%3;min[k]=Math.min(min[k],p[i]);max[k]=Math.max(max[k],p[i]);}
 let area=0,volume=0,degenerate=0;const edges=new Map(),vertices=new Set();const check=p.length<=900000;
 for(let i=0;i<p.length;i+=9){const a=[p[i],p[i+1],p[i+2]],b=[p[i+3],p[i+4],p[i+5]],c=[p[i+6],p[i+7],p[i+8]];const u=b.map((v,k)=>v-a[k]),v=c.map((v,k)=>v-a[k]);const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const s=Math.hypot(...n)/2;area+=s;if(s===0)degenerate++;volume+=a.reduce((sum,x,k)=>sum+(x-min[k])*n[k],0)/6;
 if(check){const keys=[a,b,c].map(x=>x.join(','));keys.forEach(x=>vertices.add(x));for(let j=0;j<3;j++){const x=keys[j],y=keys[(j+1)%3],forward=x<y,key=forward?x+'|'+y:y+'|'+x;const e=edges.get(key)||[0,0];e[0]++;e[1]+=forward?1:-1;edges.set(key,e);}}}
 const closed=check?degenerate===0&&[...edges.values()].every(e=>e[0]===2&&e[1]===0):null;
 return {triangles:p.length/9,vertices:p.length/3,uniqueVertices:check?vertices.size:null,dimensions:max.map((v,k)=>v-min[k]),area,volume:closed?Math.abs(volume):null,closed,degenerate};
}
export function inspectSTL(buffer){if(buffer.byteLength<15)throw Error('File is too short to be an STL.');if(buffer.byteLength>=84){const count=new DataView(buffer).getUint32(80,true);if(84+count*50===buffer.byteLength){if(!count||count>1000000)throw Error('Unsupported triangle count (maximum 1 million).');return 'Binary';}}
 const text=new TextDecoder().decode(buffer);if(!/^\s*solid\b/i.test(text)||! /endsolid/i.test(text))throw Error('Invalid or truncated STL file.');const count=(text.match(/\bfacet\s+normal\b/gi)||[]).length;if(!count||count>1000000)throw Error('Unsupported triangle count.');return 'ASCII';}
