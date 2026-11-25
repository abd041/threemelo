import {LIMITS} from './config.mjs';
import {MovementBuffer} from './buffers.mjs';
import {interpolateArc} from './arcs.mjs';
import {detectLayers} from './layers.mjs';
import {readMetadata} from './metadata.mjs';

/** Modal FDM interpreter. Positions are physical coordinates; G92 changes offsets, not geometry.
 * Marlin interpretation: G90/G91 clear the explicit M82/M83 override.
 * Independent interpretation retains that override. Neither interpretation executes code.
 */
export function parseToolpath(text,options={}){
 if(typeof text!=='string'||text.length>LIMITS.fileBytes)throw Error('G-code exceeds the 25 MiB text limit.');
 if(!text.trim())throw Error('This file is empty.');
 if(/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text.slice(0,65536))||/^BGCODE|^\s*(?:<html|<!doctype)/i.test(text))throw Error('Binary, compressed and non-G-code files are unsupported. Export plain-text G-code.');
 const tolerance=Number(options.arcTolerance??.1),firmware=options.firmware??'marlin';
 if(!Number.isFinite(tolerance)||tolerance<.02||tolerance>1)throw Error('Arc tolerance must be 0.02 to 1 mm.');
 if(!['marlin','independent'].includes(firmware))throw Error('Unknown extrusion-mode interpretation.');
 const buffer=new MovementBuffer(),meta={hint:-1,layerMarkers:0,feature:0,featureNames:new Set(),reportedSeconds:null,slicer:null};
 const stats={sourceLines:0,commands:0,unsupported:0,malformed:0,travel:0,extrusion:0,distance:0,filament:0,seconds:0,dwellSeconds:0,unknownFeed:0,retractions:0,unretractions:0,hasExtrusion:false,filamentAvailable:true,partial:false};
 const usedTools=new Set([0]);
 const warnings=[],warningKeys=new Set(),unknown=new Map(),toolStates=new Map([[0,{e:0,debt:0,nozzle:NaN}]]),offsets=[0,0,0];
 const lineOffsets=[0],bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]},printBounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
 let position=[0,0,0],absolute=true,eOverride=null,unit=1,feed=0,modal=null,tool=0,bed=NaN,fan=0,plane=17,arcRelative=true,lastPrintZ=0,known=[true,true,true],nozzleSeen=false,bedSeen=false,minSpeed=Infinity,maxSpeed=0;
 const warn=(key,message)=>{if(!warningKeys.has(key)){warningKeys.add(key);if(warnings.length<40)warnings.push(message);}};
 const skip=(command,line,reason)=>{stats.unsupported++;stats.partial=true;unknown.set(command,(unknown.get(command)||0)+1);if(unknown.size>64)unknown.delete(command);warn(command,reason||`Skipped ${command} at line ${line}; its effects are not simulated.`);};
 const extend=(box,p)=>p.forEach((v,i)=>{box.min[i]=Math.min(box.min[i],v);box.max[i]=Math.max(box.max[i],v);});
 let offset=0;
 while(offset<text.length){
  const newline=text.indexOf('\n',offset),end=newline<0?text.length:newline;
  const raw=text.slice(offset,end).replace(/\r$/,''),line=++stats.sourceLines;
  if(line>LIMITS.lines)throw Error('More than two million source lines. Use a smaller file.');
  offset=newline<0?text.length:newline+1;if(offset<text.length)lineOffsets.push(offset);
  if(line%8192===0)options.onProgress?.({processed:offset,total:text.length});
  if(raw.length>LIMITS.lineLength){stats.malformed++;stats.partial=true;warn('long','Lines longer than 16,384 characters are skipped.');continue;}
  const semi=raw.indexOf(';');if(semi>=0)readMetadata(raw.slice(semi+1),meta);
  let code=(semi<0?raw:raw.slice(0,semi)).replace(/\([^)]*\)/g,'').replace(/^\uFEFF/,'').trim();
  if(!code||code==='%')continue;
  if(code.includes('*')){
   const star=code.indexOf('*'),checksum=code.slice(star+1).trim();let sum=0;for(const char of code.slice(0,star))sum^=char.charCodeAt(0);
   if(!/^\d+$/.test(checksum)||Number(checksum)!==sum){stats.malformed++;stats.partial=true;warn('checksum','Lines with invalid checksums were skipped.');continue;}
   code=code.slice(0,star);
  }
  const words={},tokens=[...code.matchAll(/([A-Z])\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/gi)];
  // Exponents are intentionally not accepted: E is an extrusion address in compact G-code.
  const residue=code.replace(/([A-Z])\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))/gi,'').replace(/\s+/g,'');
  const bareHoming=/^N?\d*\s*G0?28\b/i.test(code)&&/^[XYZ]*$/i.test(residue);
  let malformed=(!tokens.length||(!bareHoming&&!!residue)),command=null,toolWord=null;
  for(const [,letter,value]of tokens){
   const key=letter.toUpperCase(),n=Number(value);
   if(!Number.isFinite(n)||Math.abs(n)>1e9||Object.hasOwn(words,key))malformed=true;
   words[key]=n;
   if(key==='G'||key==='M'){if(command)malformed=true;command=key+n;}
   if(key==='T')toolWord=n;
  }
  if(malformed){stats.malformed++;stats.partial=true;modal=null;warn('malformed','Malformed numeric/command lines were skipped. Use decimal values; scientific notation and multiple G/M commands per line are unsupported.');continue;}
  stats.commands++;
  if(!command&&toolWord!==null){
   if(!Number.isInteger(toolWord)||toolWord<0||toolWord>255){skip('T?',line,'Tool numbers must be integers from 0 to 255.');continue;}
   tool=toolWord;usedTools.add(tool);if(!toolStates.has(tool))toolStates.set(tool,{e:0,debt:0,nozzle:NaN});
   warn('tool-offsets','Tool changes use independent E positions; physical tool offsets are assumed zero.');continue;
  }
  let ts=toolStates.get(tool);
  if(command==='G20'){unit=25.4;continue;}if(command==='G21'){unit=1;continue;}
  if(command==='G90'||command==='G91'){absolute=command==='G90';if(firmware==='marlin')eOverride=null;continue;}
  if(command==='M82'||command==='M83'){eOverride=command==='M82';continue;}
  if(command==='G92'){
   for(const[i,k]of ['X','Y','Z'].entries())if(k in words){if(Math.abs(words[k]*unit)>LIMITS.coordinate)throw Error('Coordinate reset exceeds the supported range.');offsets[i]=position[i]-words[k]*unit;}
   if('E'in words)ts.e=words.E*unit;continue;
  }
  if(command==='G17'||command==='G18'||command==='G19'){plane=Number(command.slice(1));continue;}
  if(command==='G90.1'||command==='G91.1'){arcRelative=command==='G91.1';if(!arcRelative)warn('absolute-arc','Absolute arc centers (G90.1) are unsupported; affected arcs are skipped until G91.1.');continue;}
  if(command==='G4'){
   const seconds='P'in words?words.P/1000:words.S||0;if(seconds<0||seconds>86400){skip('G4',line,'Dwell must be between zero and 24 hours.');continue;}stats.dwellSeconds+=seconds;continue;
  }
  if(['M104','M109'].includes(command)){
   const target=toolWord??tool,value=words.S??words.R;
   if(!Number.isInteger(target)||target<0||target>255||!Number.isFinite(value)||value<0||value>1500){skip(command,line,'Invalid commanded nozzle temperature.');continue;}
   if(!toolStates.has(target))toolStates.set(target,{e:0,debt:0,nozzle:NaN});
   toolStates.get(target).nozzle=value;nozzleSeen=true;continue;
  }
  if(['M140','M190'].includes(command)){
   const value=words.S??words.R;if(!Number.isFinite(value)||value<0||value>600){skip(command,line,'Invalid commanded bed temperature.');continue;}bed=value;bedSeen=true;continue;
  }
  if(command==='M106'){fan=Math.max(0,Math.min(255,words.S??255));continue;}if(command==='M107'){fan=0;continue;}
  if(command==='G28'){
   const axes=['X','Y','Z'].filter(k=>new RegExp(k,'i').test(code.replace(/^.*?G0?28/i,'')));
   known=known.map((v,i)=>axes.length?!axes.includes(['X','Y','Z'][i])&&v:false);modal=null;
   skip(command,line,'Homing is not drawn. Motion resumes after the affected axes receive explicit absolute coordinates. Initial origin is otherwise assumed (0, 0, 0).');continue;
  }
  if(command==='M200'){if((words.D??0)>0){stats.filamentAvailable=false;warn('volumetric','Volumetric extrusion was requested (M200). Filament length, volume and weight estimates are unavailable.');}continue;}
  if(command==='M221'||command==='G10'||command==='G11'){stats.filamentAvailable=false;skip(command,line,'Flow overrides or firmware retraction make filament accounting incomplete; filament estimates are unavailable.');continue;}
  if(['M84','M18','M400','M105','M115','M117','M201','M203','M204','M205','M220'].includes(command)){
   skip(command,line,`Hardware/motion configuration ${command} is not simulated. Programmed movement time excludes these effects.`);continue;
  }
  if(command&&!['G0','G1','G2','G3'].includes(command)){skip(command,line);modal=null;continue;}
  if(command)modal=Number(command.slice(1));if(modal===null)continue;
  if('F'in words){const nextFeed=words.F*unit;if(nextFeed<0||nextFeed>1e7)throw Error('Feed rate is outside the supported range.');feed=nextFeed;}
  const wasKnown=known.every(Boolean);
  const next=position.map((v,i)=>{const k=['X','Y','Z'][i];if(!(k in words))return v;if(absolute){known[i]=true;return words[k]*unit+offsets[i];}return v+words[k]*unit;});
  if(next.some(n=>!Number.isFinite(n)||Math.abs(n)>LIMITS.coordinate))throw Error('Coordinates must stay within +/-100,000 mm.');
  const eAbsolute=eOverride??absolute,ne='E'in words?(eAbsolute?0:ts.e)+words.E*unit:ts.e,de=ne-ts.e;
  if(Math.abs(ne)>1e9||Math.abs(de)>1e7)throw Error('Extrusion values exceed the supported range.');
  let points=[next],distance=Math.hypot(...next.map((v,i)=>v-position[i]));
  if(modal===2||modal===3){
   if(!arcRelative){skip('G'+modal,line);continue;}
   if('P'in words){skip('G'+modal,line,'Multi-turn P arcs are unsupported.');continue;}
   try{const arc=interpolateArc(position,next,words,modal===2,plane,unit,tolerance);points=arc.points;distance=arc.length;}
   catch(error){skip('G'+modal,line,`Arc at line ${line}: ${error.message}`);continue;}
  }
  if(de< -1e-8){ts.debt-=de;stats.retractions++;}
  const recovery=de>0?Math.min(ts.debt,de):0;if(recovery>0){ts.debt-=recovery;stats.unretractions++;}
  const consumed=Math.max(0,de-recovery);stats.filament+=consumed;if('E'in words)stats.hasExtrusion=true;
  let type=consumed>1e-8?0:de< -1e-8?2:recovery>1e-8?3:1;
  if(type===1&&Math.abs(next[2]-position[2])>.0001&&Math.max(position[2],next[2])>lastPrintZ+.001)type=4;
  if(distance>1e-8||Math.abs(de)>1e-8){
   if(wasKnown&&known.every(Boolean)){
    const speed=feed/60;
    if(distance>0){minSpeed=Math.min(minSpeed,speed);maxSpeed=Math.max(maxSpeed,speed);}
    if(feed>0)stats.seconds+=(distance>0?distance:Math.abs(de))/speed;else stats.unknownFeed++;
    stats.distance+=distance;if(type===0){stats.extrusion+=distance;if(distance>0)lastPrintZ=next[2];}else stats.travel+=distance;
    let prev=position;
    for(const end of points){buffer.push(prev,end,{speed,type,line,hint:meta.hint,feature:meta.feature,tool,nozzle:ts.nozzle,bed});extend(bounds,prev);extend(bounds,end);if(type===0&&distance>0){extend(printBounds,prev);extend(printBounds,end);}prev=end;}
   }else warn('position','Movements with unknown coordinates after homing are omitted until absolute axes are known.');
  }
  ts.e=ne;position=next;
 }
 options.onProgress?.({processed:text.length,total:text.length});
 stats.seconds+=stats.dwellSeconds;
 const packed=buffer.finish();if(!packed.count)throw Error('No supported movements found. Choose plain-text FDM G-code containing G0/G1 or supported G2/G3 commands.');
 const layers=detectLayers(packed);
 const finishBox=box=>Number.isFinite(box.min[0])?{...box,size:box.max.map((n,i)=>n-box.min[i])}:null;
 stats.filamentAvailable=stats.filamentAvailable&&stats.hasExtrusion;
 return {...packed,...layers,...stats,bounds:finishBox(bounds),printBounds:finishBox(printBounds),lineOffsets:new Uint32Array(lineOffsets),warnings,unsupportedCommands:Object.fromEntries(unknown),metadata:{slicer:meta.slicer,reportedSeconds:meta.reportedSeconds,layerMarkers:meta.layerMarkers,features:[...meta.featureNames],nozzleAvailable:nozzleSeen,bedAvailable:bedSeen,fanCommand:fan},toolCount:usedTools.size,toolsUsed:[...usedTools],minSpeed:Number.isFinite(minSpeed)?minSpeed:0,maxSpeed,firmware,arcTolerance:tolerance};
}
