import {readPrintMesh} from '../lib/print-cost.mjs';
self.onmessage=({data})=>{try{self.postMessage({mesh:readPrintMesh(data)});}catch(e){self.postMessage({error:e.message});}};
