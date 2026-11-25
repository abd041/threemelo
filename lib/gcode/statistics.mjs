import {TYPES} from './config.mjs';
export function materialEstimate(data,diameter,density){
 if(!data?.filamentAvailable)return null;
 if(!Number.isFinite(diameter)||diameter<.5||diameter>5||!Number.isFinite(density)||density<.5||density>3)throw Error('Use diameter 0.5 to 5 mm and density 0.5 to 3 g/cm³.');
 const volume=data.filament*Math.PI*(diameter/2)**2;
 return {lengthMm:data.filament,volumeMm3:volume,weightGrams:volume/1000*density,diameterMm:diameter,densityGcm3:density};
}
export function boundaryCheck(data,p){
 const depth=p.shape==='circle'?p.width:p.depth,cx=p.origin==='center'?0:p.width/2,cy=p.origin==='center'?0:depth/2;
 let outside=0;
 for(let i=0;i<data.count;i++){let bad=false;for(const offset of [0,3]){const j=i*6+offset,x=data.positions[j],y=data.positions[j+1],z=data.positions[j+2];if(z<-.001||z>p.height+.001||(p.shape==='circle'?Math.hypot(x-cx,y-cy)>p.width/2+.001:Math.abs(x-cx)>p.width/2+.001||Math.abs(y-cy)>depth/2+.001))bad=true;}if(bad)outside++;}
 return outside;
}
export function movementVisible(data,i,settings){
 const kind=['extrusion','travel','retraction','unretraction','hop','unknown'][data.types[i]];
 const low=settings.rangeMode==='range'?settings.rangeStart:settings.rangeMode==='current'?settings.layer:0;
 const high=settings.rangeMode==='all'?data.layers.length-1:settings.rangeMode==='range'?settings.rangeEnd:settings.layer;
 return settings[kind]!==false&&i<settings.progress&&data.layerIds[i]>=low&&data.layerIds[i]<=high;
}
export function statisticsReport(data,p){
 return {schemaVersion:1,scope:'Supported G-code commands only; not a printer safety validation',sourceLines:data.sourceLines,parsedCommands:data.commands,unsupportedCommands:data.unsupported,malformedLines:data.malformed,movements:data.count,layerMode:data.layerMode,detectedLayers:data.layerMode==='height'?null:data.layers.length,zRangeMm:[data.minZ,data.maxZ],modelDimensionsMm:data.printBounds?.size??null,motionBoundsMm:data.bounds,extrusionPathMm:data.extrusion,travelPathMm:data.travel,totalSupportedDistanceMm:data.distance,retractions:data.retractions,estimatedMovementSeconds:data.seconds,unknownFeedMoves:data.unknownFeed,reportedSlicerSeconds:data.metadata.reportedSeconds,supportedDwellSeconds:data.dwellSeconds,filament:materialEstimate(data,p.diameter,p.density),toolCount:data.toolCount,outsideBuildVolume:boundaryCheck(data,p),assumptions:{firmware:data.firmware,arcToleranceMm:data.arcTolerance,filamentDiameterMm:p.diameter,densityGcm3:p.density,initialOrigin:'0,0,0',toolOffsets:'zero',timeExcludes:'Acceleration, heating, cooling, firmware delays and unsupported commands'},warnings:data.warnings};
}
export function reportCsv(report){const escape=value=>'"'+String(value??'Unavailable').replaceAll('"','""')+'"';return 'Metric,Value\r\n'+Object.entries(report).map(([k,v])=>escape(k)+','+escape(typeof v==='object'&&v!==null?JSON.stringify(v):v)).join('\r\n');}
export function summaryText(data,p){const m=materialEstimate(data,p.diameter,p.density);return `ThreeMelo G-Code analysis\n${data.count.toLocaleString()} supported movements; ${data.layerMode==='height'?'Z-height inspection (layer count unavailable)':data.layers.length+' '+data.layerMode+' layers'}\nExtrusion path: ${data.extrusion.toFixed(2)} mm; travel: ${data.travel.toFixed(2)} mm\nEstimated movement time: ${(data.seconds/60).toFixed(2)} min (excludes heating and acceleration)\nFilament: ${m?(m.lengthMm/1000).toFixed(3)+' m; '+m.weightGrams.toFixed(2)+' g at '+p.density+' g/cm³':'unavailable'}\nPreview only; not a printer safety check.`;}
export function movementInfo(data,index){const i=Math.max(0,Math.min(data.count-1,index));return {index:i,line:data.lines[i],type:TYPES[data.types[i]],layer:data.layerIds[i],position:Array.from(data.positions.slice(i*6+3,i*6+6)),speed:data.speeds[i],tool:data.tools[i],nozzle:Number.isFinite(data.nozzles[i])?data.nozzles[i]:null,bed:Number.isFinite(data.beds[i])?data.beds[i]:null};}
