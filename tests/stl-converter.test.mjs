import {test} from 'node:test';import assert from 'node:assert/strict';import {convertSTL} from '../lib/stl-to-obj.mjs';
const ascii=new TextEncoder().encode('solid t\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid t').buffer;
test('ASCII geometry',()=>{const r=convertSTL(ascii);assert.equal(r.triangles,1);assert.match(r.text,/v 1 0 0\n/);assert.match(r.text,/f 1 2 3/);});
test('scale',()=>assert.match(convertSTL(ascii,{scale:2}).text,/v 2 0 0/));
test('binary geometry',()=>{const b=new ArrayBuffer(134),v=new DataView(b);v.setUint32(80,1,true);v.setFloat32(108,1,true);v.setFloat32(124,1,true);assert.equal(convertSTL(b).format,'Binary');assert.match(convertSTL(b).text,/f 1 2 3/);});
test('reject bad scale',()=>assert.throws(()=>convertSTL(ascii,{scale:0})));test('reject malformed input',()=>assert.throws(()=>convertSTL(new ArrayBuffer(5))));
test('merge shared coordinates',()=>{const b=new ArrayBuffer(184),v=new DataView(b);v.setUint32(80,2,true);for(const o of [84,134]){v.setFloat32(o+24,1,true);v.setFloat32(o+40,1,true);}assert.equal(convertSTL(b,{weld:true}).vertices,3);assert.equal(convertSTL(b).vertices,6);});
