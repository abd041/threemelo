export const LIMITS = Object.freeze({fileBytes:25*1024*1024,segments:750000,lines:2000000,lineLength:16384,coordinate:100000,arcSegments:4096});
export const TYPES=['Extrusion','Travel','Retraction','Unretraction','Z-hop','Unknown'];
export const FEATURES=['Unknown','Outer wall','Inner wall','Infill','Solid infill','Top surface','Bottom surface','Support','Support interface','Skirt','Brim','Bridge'];
export const DENSITIES={PLA:1.24,PETG:1.27,ABS:1.04,ASA:1.07,TPU:1.21,Nylon:1.14};
export const DEFAULTS={version:1,color:'movement',projection:'perspective',camera:'isometric',grid:true,axes:true,plate:true,extrusion:true,travel:true,retraction:true,unretraction:true,hop:true,unknown:true,width:220,depth:220,height:250,shape:'rectangle',origin:'corner',spacing:10,diameter:1.75,density:1.24,material:'PLA',arcTolerance:.1,firmware:'marlin'};
export function validatePreferences(raw){
 const p={...DEFAULTS};
 if(!raw||typeof raw!=='object'||raw.version!==1)return p;
 const choices={color:['movement','speed','layer','feature','tool','nozzle','bed'],projection:['perspective','orthographic'],camera:['isometric','top','bottom','front','back','left','right'],shape:['rectangle','circle'],origin:['corner','center'],material:[...Object.keys(DENSITIES),'Custom'],firmware:['marlin','independent']};
 for(const [k,v]of Object.entries(choices))if(v.includes(raw[k]))p[k]=raw[k];
 for(const k of ['grid','axes','plate','extrusion','travel','retraction','unretraction','hop','unknown'])if(typeof raw[k]==='boolean')p[k]=raw[k];
 for(const [k,min,max]of [['width',10,2000],['depth',10,2000],['height',10,3000],['spacing',1,100],['diameter',.5,5],['density',.5,3],['arcTolerance',.02,1]])if(Number.isFinite(raw[k])&&raw[k]>=min&&raw[k]<=max)p[k]=raw[k];
 return p;
}
export function validateFile(file){if(!file)throw Error('Choose a plain-text G-code file.');if(!/\.(gcode|gco|gc|g)$/i.test(file.name))throw Error('Supported plain-text extensions: .gcode, .gco, .gc and .g. Binary and compressed files are not supported.');if(!file.size)throw Error('This file is empty. Choose a file containing printer movements.');if(file.size>LIMITS.fileBytes)throw Error('This file exceeds the 25 MiB limit. Export a smaller plain-text file or inspect it in your slicer.');}
