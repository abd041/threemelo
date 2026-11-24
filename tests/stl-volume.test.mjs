import test from 'node:test';import assert from 'node:assert/strict';import {analyzeSTL,convertMetrics,sampleSTL} from '../lib/stl-volume.mjs';
test('cube metrics',()=>{const m=analyzeSTL(sampleSTL());assert.ok(Math.abs(m.volume-1000)<1e-9);assert.equal(m.area,600);assert.deepEqual(m.dimensions,[10,10,10]);assert.equal(m.closed,true)});
test('millimeters and mass',()=>{const r=convertMetrics(analyzeSTL(sampleSTL()),'mm',1.24);assert.ok(Math.abs(r.volume-1)<1e-9);assert.ok(Math.abs(r.weight-1.24)<1e-9);assert.ok(Math.abs(r.area-6)<1e-10)});
test('scale powers',()=>{const r=convertMetrics(analyzeSTL(sampleSTL()),'cm',1,2);assert.ok(Math.abs(r.volume-8000)<1e-9);assert.equal(r.area,2400)});
test('inch conversion',()=>{const r=convertMetrics(analyzeSTL(sampleSTL()),'in',1);assert.ok(Math.abs(r.volume-16387.064)<1e-8)});
test('open ASCII surface retains area only',()=>{const b=new TextEncoder().encode('solid x\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid x').buffer;const m=analyzeSTL(b);assert.equal(m.closed,false);assert.equal(m.area,.5);assert.equal(convertMetrics(m,'cm',1).weight,null)});
test('invalid input',()=>{assert.throws(()=>analyzeSTL(new ArrayBuffer(10)));assert.throws(()=>convertMetrics(analyzeSTL(sampleSTL()),'mm',0));assert.throws(()=>convertMetrics(analyzeSTL(sampleSTL()),'mm',1,0))});
