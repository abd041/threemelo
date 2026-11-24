import test from 'node:test';import assert from 'node:assert/strict';import {convertOBJ} from '../lib/obj-to-stl.mjs';
const triangle='v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3';
test('binary layout and normals',()=>{const r=convertOBJ(triangle);assert.equal(r.data.byteLength,134);const v=new DataView(r.data);assert.equal(v.getUint32(80,true),1);assert.equal(v.getFloat32(92,true),1);});
test('ASCII scaling',()=>assert.match(convertOBJ(triangle,{format:'ascii',scale:2}).data,/vertex 2 0 0/));
test('negative and slash indices',()=>assert.equal(convertOBJ(triangle.replace('1 2 3','-3/1 -2/2 -1/3')).triangles,1));
test('convex quad',()=>assert.equal(convertOBJ('v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nf 1 2 3 4').triangles,2));
test('bad index',()=>assert.throws(()=>convertOBJ(triangle.replace('1 2 3','1 2 9'))));
test('empty and invalid scale',()=>{assert.throws(()=>convertOBJ(''));assert.throws(()=>convertOBJ(triangle,{scale:0}));});
test('concave face rejected',()=>assert.throws(()=>convertOBJ('v 0 0 0\nv 2 0 0\nv 1 1 0\nv 2 2 0\nv 0 2 0\nf 1 2 3 4 5')));
