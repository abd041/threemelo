import test from 'node:test';import assert from 'node:assert/strict';import {boxDefaults,boxDimensions,faceRatio,faces,presets,finishes} from '../lib/box-utils.mjs';
test('normalized dimensions preserve proportions',()=>assert.deepEqual(boxDimensions({width:10,height:20,depth:5}),[1.5,3,.75]));
test('invalid dimensions rejected',()=>{for(const v of [0,101,NaN,Infinity])assert.throws(()=>boxDimensions({...boxDefaults,width:v}));});
test('six faces in Three box material order',()=>assert.deepEqual(faces,['right','left','top','bottom','front','back']));
test('face ratios',()=>{const s={width:10,height:20,depth:5};assert.equal(faceRatio('front',s),.5);assert.equal(faceRatio('right',s),.25);assert.equal(faceRatio('top',s),2);assert.throws(()=>faceRatio('unknown',s));});
test('five presets valid',()=>{assert.equal(Object.keys(presets).length,5);for(const [width,height,depth] of Object.values(presets))assert.equal(Math.max(...boxDimensions({width,height,depth})),3);});
test('glossy smoother than matte and kraft',()=>assert.ok(finishes.glossy<finishes.matte&&finishes.matte<finishes.kraft));
