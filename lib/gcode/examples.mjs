export const EXAMPLES=[{id:'cube',name:'Calibration cube'},{id:'cylinder',name:'Cylinder'},{id:'vase',name:'Spiral vase'},{id:'infill',name:'Infill demonstration'},{id:'layers',name:'Variable-layer test'}];
/** Original, programmatically generated visualization fixtures. Not printer-ready files. */
export function exampleGcode(id='cube'){
 if(!EXAMPLES.some(e=>e.id===id))throw Error('Unknown example.');
 const rows=['; ThreeMelo original visualization example. NOT printer-ready.','; Generated for inspection, not a real printer profile.','G21','G90','M83','M104 S205','M140 S60','G1 X30 Y30 Z0.2 F3000'];
 if(id==='vase'){
  rows.push(';TYPE:WALL-OUTER');
  for(let i=0;i<2400;i++){const a=i*Math.PI/36,z=.2+i*.003,r=16+3*Math.sin(i/400);rows.push(`G1 X${(60+r*Math.cos(a)).toFixed(4)} Y${(60+r*Math.sin(a)).toFixed(4)} Z${z.toFixed(4)} E0.045 F1500`);}
 }else for(let layer=0;layer<(id==='layers'?12:30);layer++){
  const z=id==='layers'?.2+layer*.15+Math.floor(layer/3)*.1:.2+layer*.2;
  rows.push(`;LAYER:${layer}`,`G1 Z${z.toFixed(3)} F900`,';TYPE:WALL-OUTER');
  if(id==='cylinder'){rows.push('G1 X80 Y60 F6000','G3 X80 Y60 I-20 J0 E3 F1800');}
  else {rows.push('G1 X30 Y30 F6000','G1 X60 Y30 E1 F1500','G1 X60 Y60 E1','G1 X30 Y60 E1','G1 X30 Y30 E1');}
  if(id==='infill'||id==='cube'){
   rows.push(';TYPE:FILL');
   for(let i=0;i<10;i++)rows.push(`G1 X${32+i*2.7} Y32 F6000`,`G1 Y58 E0.8 F2400`);
  }
  rows.push('G1 E-0.7 F1800',`G1 Z${(z+.5).toFixed(3)} F900`,'G1 X30 Y30 F6000',`G1 Z${z.toFixed(3)} F900`,'G1 E0.7 F1800');
 }
 return rows.join('\n');
}
export const SAMPLE='; Sample two-layer square\nG21\nG90\nM82\nG1 Z0.2 F600\nG1 X10 Y10 F3000\nG1 X40 E1 F1200\nG1 Y40 E2\nG1 X10 E3\nG1 Y10 E4\nG1 Z0.4 F600\nG1 X40 E5 F1200\nG1 Y40 E6\nG1 X10 E7\nG1 Y10 E8\n';
