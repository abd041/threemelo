import {test} from 'node:test';import assert from 'node:assert/strict';import {prepareFBX,textureKey} from '../lib/fbx-utils.mjs';
const f=(name,size=10)=>({name,size});
test('FBX and texture selection',()=>{const r=prepareFBX([f('model.FBX'),f('Color.PNG')]);assert.equal(r.root.name,'model.FBX');assert.equal(r.textures.get('color.png').name,'Color.PNG');});
test('one root required',()=>{assert.throws(()=>prepareFBX([f('a.png')]));assert.throws(()=>prepareFBX([f('a.fbx'),f('b.fbx')]));});
test('combined size limit',()=>assert.throws(()=>prepareFBX([f('a.fbx',51*1024*1024)])));
test('duplicate texture names',()=>assert.throws(()=>prepareFBX([f('a.fbx'),f('A.png'),f('a.PNG')])));
test('unsupported texture format',()=>assert.throws(()=>prepareFBX([f('a.fbx'),f('a.exe')])));
test('texture basename and remote blocking',()=>{assert.equal(textureKey('C:\\textures\\A%20B.PNG'),'a b.png');assert.throws(()=>textureKey('https://example.com/a.png'));assert.throws(()=>textureKey('//example.com/a.png'));});
