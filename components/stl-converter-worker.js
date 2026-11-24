import {convertSTL} from '../lib/stl-to-obj.mjs';
self.onmessage=({data:{buffer,scale,weld}})=>{try{self.postMessage(convertSTL(buffer,{scale,weld}));}catch(e){self.postMessage({error:e.message});}};
