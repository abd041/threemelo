import test from 'node:test';import assert from 'node:assert/strict';import {outputScale,outputName} from '../lib/glb-to-stl.mjs';
test('meters to millimeters',()=>assert.equal(outputScale('mm',1),1000));
test('meters to centimeters',()=>assert.equal(outputScale('cm',1),100));
test('custom multiplier',()=>assert.equal(outputScale('m',2.5),2.5));
test('invalid values rejected',()=>{for(const v of [0,-1,Infinity,'bad',10001])assert.throws(()=>outputScale('mm',v));assert.throws(()=>outputScale('unknown',1));});
test('filename extension',()=>assert.equal(outputName('test.GLB'),'test.stl'));
