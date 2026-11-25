import type {Project, Room, Point, Entity, Unit} from './types.ts';
import {validatePolygon, distance, deriveWalls, hostEdge, EPS, bounds, rotatePoints} from './geometry.ts';
import {units} from './units.ts';
import {furnitureLibrary, materials, doorStyles, windowStyles} from './library.ts';
export const MAX_FILE_BYTES=2_000_000;
export const uid=()=>globalThis.crypto.randomUUID();
export const entity=(name:string):Entity=>({id:uid(),name,hidden:false,locked:false});
export function makeRoom(name='New room',x=0,z=0,w=4,d=3,shape='Rectangle'): Room {
  let points:Point[]=[{x:0,z:0},{x:w,z:0},{x:w,z:d},{x:0,z:d}];
  if(shape==='L-shaped')points=[{x:0,z:0},{x:w,z:0},{x:w,z:d*.5},{x:w*.5,z:d*.5},{x:w*.5,z:d},{x:0,z:d}];
  if(shape==='U-shaped')points=[{x:0,z:0},{x:w,z:0},{x:w,z:d},{x:w*.7,z:d},{x:w*.7,z:d*.4},{x:w*.3,z:d*.4},{x:w*.3,z:d},{x:0,z:d}];
  return {...entity(name),level:'ground',points:points.map(p=>({x:p.x+x,z:p.z+z})),height:2.7,thickness:.15,color:'#d4bc95',wallColor:'#f1f0ea',floorMaterial:'light-wood',wallMaterial:'white-paint',roomType:'Living'};
}
export function newProject(name='Untitled floor plan'): Project {const date=new Date().toISOString();return {schemaVersion:2,id:uid(),name,createdAt:date,updatedAt:date,units:'ft-in',levels:[{id:'ground',name:'Ground floor',elevation:0}],rooms:[],walls:[],openings:[],furniture:[],materials:materials.map(([id,,color,roughness])=>({id,color,roughness})),preferences:{grid:true,snap:true,gridSize:.25,dimensions:true},camera:{preset:'Isometric',style:'Dollhouse'}};}
const number=(n:unknown,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
const text=(s:unknown,max=80):s is string=>typeof s==='string'&&s.trim().length>0&&s.length<=max;
const color=(s:unknown)=>typeof s==='string'&&/^#[a-f\d]{6}$/i.test(s);
function fail(message:string):never{throw Error(message);}
// Unknown input is checked before being treated as the schema; no arbitrary
// imported keys are merged into application settings or DOM attributes.
export function validateProject(value:unknown): Project {
  if(!value||typeof value!=='object')fail('Invalid project file.');
  const p=value as Project;
  if(p.schemaVersion!==2)fail('Unsupported project version.');
  if(!text(p.id)||!text(p.name)||!Number.isFinite(Date.parse(p.createdAt))||!Number.isFinite(Date.parse(p.updatedAt))||!units.includes(p.units))fail('Invalid project details or measurement units.');
  if(!Array.isArray(p.levels)||p.levels.length!==1||p.levels[0]?.id!=='ground'||p.levels[0]?.elevation!==0||!text(p.levels[0]?.name))fail('This editor supports one ground-floor level per project.');
  if(!Array.isArray(p.rooms)||p.rooms.length>60||!Array.isArray(p.walls)||p.walls.length>100||!Array.isArray(p.openings)||p.openings.length>200||!Array.isArray(p.furniture)||p.furniture.length>250)fail('Project limit: 60 rooms, 100 custom walls, 200 openings and 250 furniture items.');
  const ids=new Set<string>();const check=(e:Entity)=>{if(!e||!text(e.id)||ids.has(e.id)||!text(e.name)||typeof e.hidden!=='boolean'||typeof e.locked!=='boolean')fail('Invalid or duplicate object ID, name or visibility.');ids.add(e.id);};
  let vertices=0;
  for(const r of p.rooms){check(r);validatePolygon(r.points);vertices+=r.points.length;if(r.level!=='ground'||!number(r.height,1,8)||!number(r.thickness,.05,.8)||!color(r.color)||!color(r.wallColor)||!materials.some(m=>m[0]===r.floorMaterial)||!materials.some(m=>m[0]===r.wallMaterial)||!text(r.roomType))fail('Invalid room height, material or wall thickness.');}
  if(vertices>600)fail('Project limit: 600 room vertices. Split a large design into separate projects.');
  for(const w of p.walls){check(w);if(w.level!=='ground'||!w.a||!w.b||![w.a.x,w.a.z,w.b.x,w.b.z].every(n=>number(n,-500,500))||distance(w.a,w.b)<.1||!number(w.height,1,8)||!number(w.thickness,.05,.8)||!color(w.color)||!materials.some(m=>m[0]===w.material))fail('Invalid custom wall.');}
  for(const f of p.furniture){check(f);if(f.level!=='ground'||!furnitureLibrary.some(v=>v[0]===f.type)||![f.x,f.z].every(n=>number(n,-500,500))||![f.width,f.depth,f.height].every(n=>number(n,.01,30))||!number(f.rotation,-360,360)||!color(f.color)||!materials.some(m=>m[0]===f.material))fail('Invalid furniture dimensions or type.');}
  for(const o of p.openings){check(o);const e=hostEdge(p,o);if(!e||!Number.isInteger(o.edge)||!['door','window'].includes(o.kind)||!(o.kind==='door'?doorStyles:windowStyles).includes(o.style)||!number(o.offset,0,1000)||!number(o.width,.2,8)||!number(o.height,.2,8)||!number(o.sill,0,8)||!number(o.frame,.01,.2)||!color(o.color)||typeof o.flip!=='boolean'||o.offset+o.width>distance(e.a,e.b)+EPS||o.sill+o.height>e.height+EPS)fail('Opening does not fit its wall. Adjust its offset, width, sill or height first.');}
  for(const w of deriveWalls(p,true))for(let i=0;i<w.openings.length;i++)for(const b of w.openings.slice(i+1)){const a=w.openings[i];if(a.offset<b.offset+b.width-EPS&&b.offset<a.offset+a.width-EPS)fail('Openings overlap on a shared wall. Move or remove one opening.');}
  const v=p.preferences;if(!v||typeof v.grid!=='boolean'||typeof v.snap!=='boolean'||typeof v.dimensions!=='boolean'||!number(v.gridSize,.05,2))fail('Invalid editor preferences.');
  if(!p.camera||!['Isometric','Top','Front','Back','Left','Right','Perspective'].includes(p.camera.preset)||!['Standard','Dollhouse','Transparent','Walkthrough'].includes(p.camera.style))fail('Invalid camera preferences.');
  if(!Array.isArray(p.materials)||p.materials.length>40||p.materials.some(m=>!m||!text(m.id)||!color(m.color)||!number(m.roughness,0,1)))fail('Invalid material settings.');
  return p;
}
export function importProject(raw:string):Project {if(new TextEncoder().encode(raw).length>MAX_FILE_BYTES)fail('Project file exceeds the 2 MB limit.');let value;try{value=JSON.parse(raw);}catch{fail('This file is not valid JSON.');}if(value?.schemaVersion===undefined&&value?.rooms&&value?.height)return migrateLegacy(value);return validateProject(value);}
export function migrateLegacy(raw:unknown):Project {
  const p=raw as {height:number;rooms:{id:string;name:string;x:number;z:number;w:number;d:number;color:string}[];openings:{id:string;room:string;side:string;kind:'door'|'window';offset:number;width:number}[]};
  if(!Array.isArray(p.rooms)||!Array.isArray(p.openings))fail('Invalid legacy project.');const next=newProject('Imported floor plan');next.units='m';
  next.rooms=p.rooms.map(r=>({...makeRoom(r.name,r.x,r.z,r.w,r.d),id:r.id,color:r.color,height:p.height}));
  next.openings=p.openings.map(o=>{const room=next.rooms.find(r=>r.id===o.room);if(!room)fail('Opening refers to a missing room.');const edge=['north','east','south','west'].indexOf(o.side),b=bounds(room.points),len=edge%2?b.depth:b.width;return {...entity(o.kind),id:o.id,host:o.room,edge,kind:o.kind,style:o.kind==='door'?'Single door':'Standard window',offset:edge>=2?len-o.offset-o.width:o.offset,width:o.width,height:o.kind==='door'?2.05:1.05,sill:o.kind==='door'?0:.85,flip:false,frame:.05,color:'#e5e7eb'};});
  return validateProject(next);
}
export function moveObjects(p:Project,ids:string[],dx:number,dz:number):Project {const selected=new Set(ids);return {...p,rooms:p.rooms.map(r=>selected.has(r.id)&&!r.locked?{...r,points:r.points.map(v=>({x:v.x+dx,z:v.z+dz}))}:r),furniture:p.furniture.map(f=>selected.has(f.id)&&!f.locked?{...f,x:f.x+dx,z:f.z+dz}:f),walls:p.walls.map(w=>selected.has(w.id)&&!w.locked?{...w,a:{x:w.a.x+dx,z:w.a.z+dz},b:{x:w.b.x+dx,z:w.b.z+dz}}:w)};}
export function deleteObjects(p:Project,ids:string[]):Project {const selected=new Set(ids);const unlocked=(e:Entity)=>!selected.has(e.id)||e.locked;const rooms=p.rooms.filter(unlocked),walls=p.walls.filter(unlocked),hosts=new Set([...rooms,...walls].map(e=>e.id));return {...p,rooms,walls,furniture:p.furniture.filter(unlocked),openings:p.openings.filter(o=>unlocked(o)&&hosts.has(o.host))};}
export function duplicateObjects(p:Project,ids:string[]):{project:Project;ids:string[]} {const map=new Map<string,string>();const copy=<T extends Entity>(e:T):T=>{const id=uid();map.set(e.id,id);return {...structuredClone(e),id,name:`${e.name.slice(0,70)} copy`,locked:false};};const rooms=p.rooms.filter(r=>ids.includes(r.id)).map(copy),walls=p.walls.filter(r=>ids.includes(r.id)).map(copy),furniture=p.furniture.filter(r=>ids.includes(r.id)).map(copy);const openings=p.openings.filter(o=>map.has(o.host)).map(o=>({...copy(o),host:map.get(o.host)!}));const next={...p,rooms:[...p.rooms,...rooms],walls:[...p.walls,...walls],furniture:[...p.furniture,...furniture],openings:[...p.openings,...openings]};const newIds=[...rooms,...walls,...furniture].map(e=>e.id);return {project:moveObjects(next,newIds,1,1),ids:newIds};}
export function rotateObjects(p:Project,ids:string[],degrees:number):Project{return {...p,rooms:p.rooms.map(r=>ids.includes(r.id)&&!r.locked?{...r,points:rotatePoints(r.points,degrees)}:r),furniture:p.furniture.map(f=>ids.includes(f.id)&&!f.locked?{...f,rotation:(f.rotation+degrees)%360}:f)};}
export function setUnits(p:Project,unit:Unit):Project{return {...p,units:unit};}
