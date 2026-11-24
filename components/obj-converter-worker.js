import {convertOBJ} from '../lib/obj-to-stl.mjs';
self.onmessage=({data})=>{try{const result=convertOBJ(data.text,data);self.postMessage(result,result.data instanceof ArrayBuffer?[result.data]:[]);}catch(e){self.postMessage({error:e.message});}};
