import {parseGcode} from '../lib/gcode.mjs';
self.onmessage=({data})=>{try{self.postMessage({result:parseGcode(data)});}catch(e){self.postMessage({error:e.message});}};
