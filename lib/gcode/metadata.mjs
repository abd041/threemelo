import {FEATURES} from './config.mjs';
const features={
 'WALL-OUTER':1,'EXTERNAL PERIMETER':1,'OUTER WALL':1,'OUTER PERIMETER':1,
 'WALL-INNER':2,'PERIMETER':2,'INNER WALL':2,'INNER PERIMETER':2,
 'FILL':3,'INTERNAL INFILL':3,'SPARSE INFILL':3,'INFILL':3,
 'SOLID INFILL':4,'INTERNAL SOLID INFILL':4,'SKIN':4,'SOLID LAYER':4,
 'TOP SOLID INFILL':5,'TOP SURFACE':5,'BOTTOM SURFACE':6,
 'SUPPORT':7,'SUPPORT MATERIAL':7,'SUPPORT INTERFACE':8,'SUPPORT MATERIAL INTERFACE':8,
 'SKIRT':9,'SKIRT/BRIM':9,'BRIM':10,'BRIDGE':11,'BRIDGE INFILL':11,'INTERNAL BRIDGE INFILL':11
};
export function readMetadata(comment,state){
 const value=comment.trim(),upper=value.toUpperCase();
 if(/^LAYER\s*:\s*-?\d+/.test(upper)||/^(LAYER_CHANGE|CHANGE_LAYER)\b/.test(upper)){state.hint++;state.layerMarkers++;}
 const type=/^(?:TYPE|FEATURE)\s*:\s*(.+)$/i.exec(value);
 if(type){state.feature=features[type[1].trim().toUpperCase()]||0;if(state.feature)state.featureNames.add(FEATURES[state.feature]);}
 else if(features[upper]){state.feature=features[upper];state.featureNames.add(FEATURES[state.feature]);}
 const time=/^TIME:\s*([\d.]+)\s*$/i.exec(value);
 if(time&&Number(time[1])<1e9)state.reportedSeconds=Number(time[1]);
 const human=/estimated printing time[^=]*=\s*(.*)/i.exec(value);
 if(human){let seconds=0,found=false;for(const m of human[1].matchAll(/(\d+(?:\.\d+)?)\s*(d|h|m|s)\b/gi)){seconds+=Number(m[1])*({d:86400,h:3600,m:60,s:1}[m[2].toLowerCase()]);found=true;}if(found&&seconds<1e9)state.reportedSeconds=seconds;}
 for(const name of ['Cura','PrusaSlicer','OrcaSlicer','BambuStudio','Bambu Studio','Simplify3D'])if(upper.includes(name.toUpperCase()))state.slicer=name;
}
