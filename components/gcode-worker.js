import {parseToolpath} from '../lib/gcode/parser.mjs';
import {exampleGcode} from '../lib/gcode/examples.mjs';
let source='',offsets=null;
function sourceLine(line){const start=offsets[line-1],end=offsets[line]??source.length;return source.slice(start,end).replace(/[\r\n]+$/,'').slice(0,16384);}
self.onmessage=async({data:message})=>{
 const {id,kind}=message;
 try{
  if(kind==='source'){
   if(!offsets)return;
   const start=Math.max(1,Math.min(offsets.length,Math.floor(message.start||1))),count=Math.max(1,Math.min(80,message.count||40));
   self.postMessage({id,kind:'source',start,total:offsets.length,rows:Array.from({length:Math.min(count,offsets.length-start+1)},(_,i)=>({line:start+i,text:sourceLine(start+i)}))});return;
  }
  if(kind==='search'){
   if(!offsets)return;const query=String(message.query||'').slice(0,120).toLowerCase();if(!query)return;
   const matches=[];for(let i=Math.max(1,message.start||1);i<=offsets.length;i++){if(sourceLine(i).toLowerCase().includes(query)){matches.push(i);if(matches.length===100)break;}}
   self.postMessage({id,kind:'search',matches,capped:matches.length===100});return;
  }
  self.postMessage({id,kind:'status',phase:'Reading file locally'});
  source=message.example?exampleGcode(message.example):await message.file.text();
  self.postMessage({id,kind:'status',phase:'Parsing G-code'});
  const started=performance.now(),result=parseToolpath(source,{...message.options,onProgress:progress=>self.postMessage({id,kind:'progress',...progress})});
  offsets=result.lineOffsets;delete result.lineOffsets;
  const transfer=Object.values(result).filter(v=>ArrayBuffer.isView(v)).map(v=>v.buffer);
  self.postMessage({id,kind:'result',result,parseMs:performance.now()-started},transfer);
 }catch(error){self.postMessage({id,kind:'error',error:error instanceof RangeError?'Memory allocation failed. Try a smaller file or close other tabs.':error.message||'Parsing failed. Try another file.'});}
};
