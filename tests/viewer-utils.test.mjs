import test from 'node:test';import assert from 'node:assert/strict';import {validateOBJ,localAssetKey,panoramaDimensions} from '../lib/viewer-utils.mjs';
test('OBJ triangle and polygon counts',()=>assert.deepEqual(validateOBJ('v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nf 1 2 3 4'),{vertices:4,triangles:2}));
test('invalid OBJ rejected',()=>{assert.throws(()=>validateOBJ('v NaN 0 0\nf 1 2 3'));assert.throws(()=>validateOBJ('v 0 0 0'));});
test('local asset normalization',()=>assert.equal(localAssetKey('folder\\My%20Texture.PNG'),'my texture.png'));
test('full panorama and ratio warning',()=>{assert.equal(panoramaDimensions(2048,1024).warning,false);assert.equal(panoramaDimensions(1000,1000).warning,true);});
test('image pixel budget',()=>assert.throws(()=>panoramaDimensions(16000,8000)));
