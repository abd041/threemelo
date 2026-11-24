export const defaults={profile:'classic',height:120,diameter:80,wall:2,base:3,ribs:8,ripple:0.08,twist:0};
export function vaseMesh(o){
 const {profile,height,diameter,wall,base,ribs,ripple,twist}=o;
 if(!['classic','straight','tapered','bulb'].includes(profile)||![[height,30,250],[diameter,30,180],[wall,.8,5],[base,1,10],[ribs,3,16],[ripple,0,.15],[twist,-180,180]].every(([v,a,b])=>Number.isFinite(v)&&v>=a&&v<=b)||!Number.isInteger(ribs))throw Error('Check profile and dimension limits.');
 const n=128,m=48, R=diameter/2, verts=[],out=[];
 const radius=t=>R*({classic: .72+.22*Math.sin(Math.PI*t)-.12*t,straight:1,tapered:.65+.35*t,bulb:.55+.45*Math.sin(Math.PI*t)}[profile]);
 for(let layer=0;layer<2;layer++)for(let j=0;j<=m;j++)for(let i=0;i<n;i++){
  const z=layer?base+(height-base)*j/m:height*j/m,t=z/height,a=2*Math.PI*i/n;
  const r=radius(t)*(1+ripple*Math.cos(ribs*(a-t*twist*Math.PI/180)))-(layer?wall:0);
  if(r<=0)throw Error('Wall is too thick.');verts.push([r*Math.cos(a),z,-r*Math.sin(a)]);
 }
 const k=(m+1)*n, id=(l,j,i)=>l*k+j*n+(i+n)%n;
 const tri=(a,b,c)=>out.push(...a,...b,...c), q=(a,b,c,d)=>{tri(a,b,c);tri(a,c,d);};
 for(let j=0;j<m;j++)for(let i=0;i<n;i++){q(verts[id(0,j,i)],verts[id(0,j,i+1)],verts[id(0,j+1,i+1)],verts[id(0,j+1,i)]);q(verts[id(1,j,i)],verts[id(1,j+1,i)],verts[id(1,j+1,i+1)],verts[id(1,j,i+1)]);}
 for(let i=0;i<n;i++){q(verts[id(0,m,i)],verts[id(0,m,i+1)],verts[id(1,m,i+1)],verts[id(1,m,i)]);tri([0,0,0],verts[id(0,0,i+1)],verts[id(0,0,i)]);tri([0,base,0],verts[id(1,0,i)],verts[id(1,0,i+1)]);}
 return new Float32Array(out);
}
