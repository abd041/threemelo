import type {Point, Room, Project, DerivedWall, Opening} from './types.ts';
export const EPS = 1e-7;
export const distance = (a: Point,b: Point) => Math.hypot(b.x-a.x,b.z-a.z);
export const cross = (a: Point,b: Point,c: Point) => (b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x);
export const signedArea = (p: Point[]) => p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a.x*b.z-b.x*a.z;},0)/2;
export const polygonArea = (p: Point[]) => Math.abs(signedArea(p));
export const edges = (p: Point[]) => p.map((a,i)=>({a,b:p[(i+1)%p.length]}));
const onSegment=(a: Point,b: Point,p: Point)=>Math.abs(cross(a,b,p))<EPS&&p.x>=Math.min(a.x,b.x)-EPS&&p.x<=Math.max(a.x,b.x)+EPS&&p.z>=Math.min(a.z,b.z)-EPS&&p.z<=Math.max(a.z,b.z)+EPS;
export function intersects(a: Point,b: Point,c: Point,d: Point): boolean {
  return (cross(a,b,c)*cross(a,b,d)<-EPS&&cross(c,d,a)*cross(c,d,b)<-EPS)||onSegment(a,b,c)||onSegment(a,b,d)||onSegment(c,d,a)||onSegment(c,d,b);
}
export function validatePolygon(p: Point[]): void {
  if(!Array.isArray(p)||p.length<3||p.length>64) throw Error('A room needs 3–64 vertices.');
  for(let i=0;i<p.length;i++) {const a=p[i],b=p[(i+1)%p.length];
    if(!a||!Number.isFinite(a.x)||!Number.isFinite(a.z)||Math.abs(a.x)>500||Math.abs(a.z)>500) throw Error('Room coordinates must be finite and within ±500 m.');
    if(p.some((v,j)=>i!==j&&distance(a,v)<.01)||distance(a,b)<.05) throw Error('Remove duplicate vertices or edges shorter than 5 cm.');
    const c=p[(i+2)%p.length];if(Math.abs(cross(a,b,c))<EPS&&(b.x-a.x)*(c.x-b.x)+(b.z-a.z)*(c.z-b.z)<0) throw Error('Room edges cannot fold back on themselves.');
    for(let j=i+1;j<p.length;j++) if(j!==i+1&&!(i===0&&j===p.length-1)&&intersects(a,b,p[j],p[(j+1)%p.length])) throw Error('Room edges cannot intersect.');
  }
  if(polygonArea(p)<.1) throw Error('A room needs at least 0.1 m² of area.');
}
export function bounds(points: Point[]) {const p=points.length?points:[{x:0,z:0},{x:8,z:6}];const minX=Math.min(...p.map(v=>v.x)),minZ=Math.min(...p.map(v=>v.z)),maxX=Math.max(...p.map(v=>v.x)),maxZ=Math.max(...p.map(v=>v.z));return {minX,minZ,maxX,maxZ,width:maxX-minX,depth:maxZ-minZ};}
export function center(p: Point[]): Point {const b=bounds(p);return {x:(b.minX+b.maxX)/2,z:(b.minZ+b.maxZ)/2};}
export function inside(p: Point, poly: Point[]): boolean {let hit=false;for(const {a,b} of edges(poly)){if(onSegment(a,b,p))return true;if((a.z>p.z)!==(b.z>p.z)&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)hit=!hit;}return hit;}
// Exact polygon union area by vertical decomposition. All crossing x values are
// breakpoints, so the union's vertical length is linear within each slab.
export function unionArea(polygons: Point[][]): number {
  if(!polygons.length)return 0;
  const segments=polygons.flatMap(edges),xs=segments.map(s=>s.a.x);
  for(let i=0;i<segments.length;i++)for(let j=i+1;j<segments.length;j++) {const {a,b}=segments[i],{a:c,b:d}=segments[j];const den=(b.x-a.x)*(d.z-c.z)-(b.z-a.z)*(d.x-c.x);if(Math.abs(den)<EPS)continue;const t=((c.x-a.x)*(d.z-c.z)-(c.z-a.z)*(d.x-c.x))/den,u=((c.x-a.x)*(b.z-a.z)-(c.z-a.z)*(b.x-a.x))/den;if(t>EPS&&t<1-EPS&&u>EPS&&u<1-EPS)xs.push(a.x+t*(b.x-a.x));}
  const sorted=[...new Set(xs)].sort((a,b)=>a-b);let area=0;
  for(let i=1;i<sorted.length;i++){const w=sorted[i]-sorted[i-1];if(w<EPS)continue;const x=(sorted[i]+sorted[i-1])/2,intervals:number[][]=[];
    for(const poly of polygons){const zs=edges(poly).filter(({a,b})=>(a.x>x)!==(b.x>x)).map(({a,b})=>a.z+(x-a.x)*(b.z-a.z)/(b.x-a.x)).sort((a,b)=>a-b);for(let j=0;j<zs.length;j+=2)intervals.push([zs[j],zs[j+1]]);}
    intervals.sort((a,b)=>a[0]-b[0]);let low=0,high=0,length=0,first=true;for(const [a,b] of intervals){if(first){low=a;high=b;first=false;}else if(a<=high+EPS)high=Math.max(high,b);else{length+=high-low;low=a;high=b;}}if(!first)length+=high-low;area+=w*length;
  }return area;
}
export const totalArea=(p: Project)=>p.levels.reduce((s,l)=>s+unionArea(p.rooms.filter(r=>r.level===l.id).map(r=>r.points)),0);
export function resizeRoom(room: Room,width: number,depth: number): Room {const b=bounds(room.points);if(width<.1||depth<.1)throw Error('Room dimensions must be positive.');return {...room,points:room.points.map(p=>({x:b.minX+(p.x-b.minX)*width/b.width,z:b.minZ+(p.z-b.minZ)*depth/b.depth}))};}
export function rotatePoints(points: Point[],degrees: number): Point[] {const c=center(points),a=degrees*Math.PI/180;return points.map(p=>({x:c.x+(p.x-c.x)*Math.cos(a)-(p.z-c.z)*Math.sin(a),z:c.z+(p.x-c.x)*Math.sin(a)+(p.z-c.z)*Math.cos(a)}));}
export const furniturePoints=(f: {x:number;z:number;width:number;depth:number;rotation:number})=>rotatePoints([{x:f.x-f.width/2,z:f.z-f.depth/2},{x:f.x+f.width/2,z:f.z-f.depth/2},{x:f.x+f.width/2,z:f.z+f.depth/2},{x:f.x-f.width/2,z:f.z+f.depth/2}],f.rotation);
export function projectBounds(p: Project) {return bounds([...p.rooms.filter(r=>!r.hidden).flatMap(r=>r.points),...p.walls.filter(w=>!w.hidden).flatMap(w=>[w.a,w.b]),...p.furniture.filter(f=>!f.hidden).flatMap(furniturePoints)]);}
export function hostEdge(p: Project,o: Pick<Opening,'host'|'edge'>) {const room=p.rooms.find(r=>r.id===o.host);if(room){const e=edges(room.points)[o.edge];return e?{...e,height:room.height}:null;}const w=p.walls.find(w=>w.id===o.host);return w&&o.edge===0?{a:w.a,b:w.b,height:w.height}:null;}
export function openingPoints(p: Project,o: Opening) {const edge=hostEdge(p,o);if(!edge)throw Error('Opening wall no longer exists.');const len=distance(edge.a,edge.b),at=(v:number)=>({x:edge.a.x+(edge.b.x-edge.a.x)*v/len,z:edge.a.z+(edge.b.z-edge.a.z)*v/len});return {a:at(o.offset),b:at(o.offset+o.width)};}
export function deriveWalls(p: Project,includeHidden=false): DerivedWall[] {
  const raw=[...p.rooms.filter(r=>includeHidden||!r.hidden).flatMap(r=>edges(r.points).map((e,edge)=>({...e,owner:r.id,edge,height:r.height,thickness:r.thickness,color:r.wallColor,material:r.wallMaterial}))),...p.walls.filter(w=>includeHidden||!w.hidden).map(w=>({...w,owner:w.id,edge:0}))];
  const result=new Map<string,DerivedWall>();
  for(const r of raw){const len=distance(r.a,r.b),ux=(r.b.x-r.a.x)/len,uz=(r.b.z-r.a.z)/len;const cuts=[0,len];
    for(const s of raw)for(const point of [s.a,s.b])if(onSegment(r.a,r.b,point))cuts.push((point.x-r.a.x)*ux+(point.z-r.a.z)*uz);
    for(const s of raw){const vx=s.b.x-s.a.x,vz=s.b.z-s.a.z,den=ux*vz-uz*vx;if(Math.abs(den)>EPS){const dx=s.a.x-r.a.x,dz=s.a.z-r.a.z,t=(dx*vz-dz*vx)/den,u=(dx*uz-dz*ux)/den;if(t>EPS&&t<len-EPS&&u>=-EPS&&u<=1+EPS)cuts.push(t);}}
    const ts=[...new Set(cuts.map(t=>+t.toFixed(7)))].sort((a,b)=>a-b);
    for(let i=1;i<ts.length;i++){const start=ts[i-1],end=ts[i];if(end-start<EPS)continue;let a={x:r.a.x+ux*start,z:r.a.z+uz*start},b={x:r.a.x+ux*end,z:r.a.z+uz*end};const reverse=a.x>b.x+EPS||Math.abs(a.x-b.x)<EPS&&a.z>b.z;if(reverse)[a,b]=[b,a];const key=[a.x,a.z,b.x,b.z].map(n=>n.toFixed(6)).join(',');
      let wall=result.get(key);if(!wall){wall={a,b,length:end-start,height:r.height,thickness:r.thickness,color:r.color,material:r.material,owners:[],openings:[]};result.set(key,wall);}wall.owners.push(r.owner);wall.height=Math.max(wall.height,r.height);wall.thickness=Math.max(wall.thickness,r.thickness);
      for(const o of p.openings.filter(o=>o.host===r.owner&&o.edge===r.edge&&(includeHidden||!o.hidden))){const lo=Math.max(start,o.offset),hi=Math.min(end,o.offset+o.width);if(hi-lo>EPS)wall.openings.push({...o,offset:reverse?end-hi:lo-start,width:hi-lo});}
    }
  }return [...result.values()];
}
export function wallPieces(length: number,height: number,openings: Opening[]): number[][] {const out:number[][]=[];let cursor=0;for(const o of [...openings].sort((a,b)=>a.offset-b.offset)){if(o.offset>cursor+EPS)out.push([cursor,o.offset-cursor,0,height]);if(o.sill>0)out.push([o.offset,o.width,0,o.sill]);const top=o.sill+o.height;if(top<height)out.push([o.offset,o.width,top,height-top]);cursor=o.offset+o.width;}if(cursor<length-EPS)out.push([cursor,length-cursor,0,height]);return out;}
export function warnings(p: Project): string[] {const out:string[]=[];const sum=p.rooms.reduce((s,r)=>s+polygonArea(r.points),0),union=totalArea(p);if(sum-union>.001)out.push(`Rooms overlap by ${(sum-union).toFixed(2)} m². Total area counts the overlap once.`);
  const furniture=p.furniture.filter(f=>!f.hidden&&f.type!=='rug'),walls=deriveWalls(p);let furnitureCollision=false,wallCollision=false;
  for(let i=0;i<furniture.length;i++){const f=furniture[i],poly=furniturePoints(f);for(const w of walls)if(edges(poly).some(e=>intersects(e.a,e.b,w.a,w.b))||inside(w.a,poly))wallCollision=true;
    for(const other of furniture.slice(i+1)){if(other.level!==f.level)continue;const q=furniturePoints(other);if(poly.some(v=>inside(v,q))||q.some(v=>inside(v,poly))||edges(poly).some(a=>edges(q).some(b=>intersects(a.a,a.b,b.a,b.b))))furnitureCollision=true;}}
  if(furnitureCollision)out.push('Furniture footprints intersect. Check clearances; intentional overlaps are allowed.');if(wallCollision)out.push('Furniture intersects a wall. Check placement and door access.');return out;
}
