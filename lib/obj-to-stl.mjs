// Geometry-only OBJ conversion. Fan triangulation is restricted to convex planar faces.
export function convertOBJ(text,{scale=1,format='binary'}={}) {
 if(!Number.isFinite(scale)||scale<1e-6||scale>1e6) throw Error('Scale must be between 0.000001 and 1000000.');
 if(!['binary','ascii'].includes(format)) throw Error('Invalid output format.');
 const vertices=[], triangles=[];
 const cross=(a,b,c)=>{const u=b.map((x,i)=>x-a[i]),v=c.map((x,i)=>x-a[i]);return [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];};
 const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
 for(const raw of text.replace(/\\\r?\n/g,' ').split(/\r?\n/)){
  const line=raw.split('#')[0].trim(); if(!line)continue; const [kind,...args]=line.split(/\s+/);
  if(kind==='v'){if(args.length<3)throw Error('Invalid vertex.');const p=args.slice(0,3).map(x=>Math.fround(Number(x)*scale));if(!p.every(Number.isFinite))throw Error('Invalid vertex coordinates.');vertices.push(p);if(vertices.length>3000000)throw Error('Vertex limit exceeded.');}
  if(kind==='f'){
   if(args.length<3||args.length>1024)throw Error('Invalid face size.');
   const ids=args.map(x=>{const s=x.split('/')[0];if(!/^-?\d+$/.test(s))throw Error('Invalid face index.');const n=Number(s),i=n<0?vertices.length+n:n-1;if(!Number.isSafeInteger(n)||i<0||i>=vertices.length)throw Error('Face index out of range.');return i;});
   const p=ids.map(i=>vertices[i]);const n=cross(p[0],p[1],p[2]);const len=Math.hypot(...n);if(!len)throw Error('Degenerate face.');const unit=n.map(x=>x/len);
   const extent=Math.max(...p.map(q=>Math.hypot(...q.map((x,i)=>x-p[0][i]))));
   for(let j=0;j<p.length;j++){if(Math.abs(dot(unit,p[j].map((x,i)=>x-p[0][i])))>extent*1e-5||dot(unit,cross(p[j],p[(j+1)%p.length],p[(j+2)%p.length]))< -extent*extent*1e-8)throw Error('Concave or non-planar face: triangulate the OBJ first.');}
   for(let j=1;j<p.length-1;j++){const pts=[p[0],p[j],p[j+1]],normal=cross(...pts),l=Math.hypot(...normal);if(!l)throw Error('Degenerate triangle.');triangles.push({pts,n:normal.map(x=>x/l)});if(triangles.length>1000000)throw Error('Triangle limit exceeded.');}
  }
 }
 if(!triangles.length)throw Error('No polygon faces found.');
 let data;
 if(format==='binary'){data=new ArrayBuffer(84+50*triangles.length);const v=new DataView(data);v.setUint32(80,triangles.length,true);triangles.forEach(({pts,n},i)=>{[...n,...pts.flat()].forEach((x,j)=>v.setFloat32(84+i*50+j*4,x,true));});}
 else {data='solid threemelo\n'+triangles.map(({pts,n})=>`  facet normal ${n.join(' ')}\n    outer loop\n${pts.map(p=>'      vertex '+p.join(' ')).join('\n')}\n    endloop\n  endfacet`).join('\n')+'\nendsolid threemelo\n';}
 return {data,triangles:triangles.length,vertices:vertices.length,format};
}
