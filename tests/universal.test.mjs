import test from 'node:test';import assert from 'node:assert/strict';import {selectModel} from '../lib/universal-utils.mjs';
const f=(name,size=10)=>({name,size});
for(const format of ['stl','obj','glb','gltf','fbx'])test('detect '+format,()=>assert.equal(selectModel([f('MODEL.'+format.toUpperCase())]).format,format));
test('companion assets',()=>assert.equal(selectModel([f('mesh.gltf'),f('mesh.bin'),f('a.png')]).format,'gltf'));
test('reject multiple roots',()=>assert.throws(()=>selectModel([f('a.obj'),f('b.stl')])));
test('reject bad assets',()=>assert.throws(()=>selectModel([f('a.stl'),f('b.png')])));
test('reject oversized',()=>assert.throws(()=>selectModel([f('a.obj',51*1024*1024)])));
test('reject duplicate filenames',()=>assert.throws(()=>selectModel([f('a.obj'),f('x.png'),f('X.PNG')])));
