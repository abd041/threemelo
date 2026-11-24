import {analyzeSTL} from '../lib/stl-volume.mjs';
self.onmessage=({data})=>{try{self.postMessage({metrics:analyzeSTL(data)});}catch(e){self.postMessage({error:e.message});}};
