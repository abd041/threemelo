import {newProject,makeRoom,entity,validateProject} from './project.ts';
import {furnitureLibrary} from './library.ts';
import type {Project} from './types.ts';
type Layout=[string,number,number,number,number];
const definitions:{name:string;category:string;description:string;layout:Layout[]}[]=[
  {name:'Studio apartment',category:'Apartment',description:'A flexible living and sleeping space with a separate bathroom.',layout:[['Living & sleeping',0,0,6,5],['Bathroom',6,0,2,2.5],['Kitchen',6,2.5,2,2.5]]},
  {name:'One-bedroom apartment',category:'Apartment',description:'Separate bedroom, living area, kitchen and bathroom.',layout:[['Living room',0,0,5,4],['Bedroom',5,0,3.5,4],['Kitchen',0,4,5,2.5],['Bathroom',5,4,3.5,2.5]]},
  {name:'Two-bedroom apartment',category:'Apartment',description:'Two bedrooms around a generous shared living space.',layout:[['Living room',0,0,5,4],['Bedroom 1',5,0,3.5,4],['Bedroom 2',5,4,3.5,3.5],['Kitchen',0,4,3,3.5],['Bathroom',3,4,2,3.5]]},
  {name:'Three-bedroom house',category:'House',description:'Three bedrooms with a connected kitchen and living area.',layout:[['Living room',0,0,6,5],['Kitchen',0,5,4,3],['Bathroom',4,5,2,3],['Bedroom 1',6,0,4,3],['Bedroom 2',6,3,4,2.5],['Bedroom 3',6,5.5,4,2.5]]},
  {name:'Four-bedroom family house',category:'House',description:'A larger starting layout for family space planning.',layout:[['Living room',0,0,6,5],['Kitchen',0,5,4,4],['Bathroom',4,5,2,4],['Bedroom 1',6,0,4,4.5],['Bedroom 2',6,4.5,4,4.5],['Bedroom 3',10,0,4,4.5],['Bedroom 4',10,4.5,4,4.5]]},
  {name:'Tiny house',category:'House',description:'Compact living with a separate sleeping area and bathroom.',layout:[['Living & kitchen',0,0,3,4],['Bedroom',0,4,3,2.5],['Bathroom',0,6.5,3,1.5]]},
  {name:'Open-plan living space',category:'Room',description:'One large space for living, dining and furniture experiments.',layout:[['Open-plan living',0,0,8,6]]},
  {name:'Single-room layout',category:'Room',description:'A simple rectangular room, ready for exact measurements.',layout:[['Room',0,0,4,3.5]]},
  {name:'Kitchen layout',category:'Room',description:'A kitchen footprint with an island and base cabinetry.',layout:[['Kitchen',0,0,5,4]]},
  {name:'Small office',category:'Office',description:'Two work areas with a small meeting room.',layout:[['Workspace',0,0,5,4],['Meeting room',5,0,3,4]]},
  {name:'Open-plan office',category:'Office',description:'Shared desk space plus a meeting room and kitchenette.',layout:[['Workspace',0,0,8,6],['Meeting room',8,0,4,4],['Kitchenette',8,4,4,2]]},
  {name:'Guest house',category:'House',description:'An independent bedroom, living room and compact bathroom.',layout:[['Living room',0,0,4,4],['Bedroom',4,0,3,4],['Kitchen',0,4,4,2],['Bathroom',4,4,3,2]]},
];
export const templates=definitions.map((d,index)=>({...d,id:`template-${index}`}));
export function makeTemplate(index:number):Project {const definition=definitions[index];if(!definition)throw Error('Unknown template.');const p=newProject(definition.name);
  p.rooms=definition.layout.map(([name,x,z,w,d])=>makeRoom(name,x,z,w,d));
  // One entrance and a north-facing window. Shared connections are generated
  // from the actual collinear boundaries, never duplicated on both rooms.
  p.openings.push({...entity('Entrance'),host:p.rooms[0].id,edge:3,kind:'door',style:'Front entrance',offset:.3,width:.9,height:2.05,sill:0,flip:false,frame:.05,color:'#846d56'});
  p.openings.push({...entity('Window'),host:p.rooms[0].id,edge:0,kind:'window',style:'Standard window',offset:1.2,width:1.2,height:1.2,sill:.9,flip:false,frame:.05,color:'#e5e7eb'});
  for(let i=1;i<p.rooms.length;i++){const r=p.rooms[i],a=definition.layout[i];let connected=false;for(let j=0;j<i&&!connected;j++){const b=definition.layout[j];if(Math.abs(a[1]-(b[1]+b[3]))<.001){const lo=Math.max(a[2],b[2]),hi=Math.min(a[2]+a[4],b[2]+b[4]);if(hi-lo>1.2){p.openings.push({...entity('Interior door'),host:r.id,edge:3,kind:'door',style:'Interior door',offset:a[2]+a[4]-(lo+.2+.8),width:.8,height:2.05,sill:0,flip:false,frame:.05,color:'#c4ac8c'});connected=true;}}else if(Math.abs(a[2]-(b[2]+b[4]))<.001){const lo=Math.max(a[1],b[1]),hi=Math.min(a[1]+a[3],b[1]+b[3]);if(hi-lo>1.2){p.openings.push({...entity('Interior door'),host:r.id,edge:0,kind:'door',style:'Interior door',offset:lo-a[1]+.2,width:.8,height:2.05,sill:0,flip:false,frame:.05,color:'#c4ac8c'});connected=true;}}}}
  for(const [i,layout] of definition.layout.entries()){const [name,x,z,w,d]=layout;const type=/Bedroom/.test(name)?'queen-bed':/Kitchen/.test(name)?'island':/Bathroom/.test(name)?'toilet':/office|Workspace|Meeting/.test(name)?'desk':'sofa';const item=furnitureLibrary.find(f=>f[0]===type)!;p.furniture.push({...entity(item[1]),level:'ground',type,x:x+w/2,z:z+d/2,width:item[3],depth:item[4],height:item[5],rotation:0,color:i%2?'#7d9293':'#80969a',material:'neutral-paint'});}
  return validateProject(p);
}
