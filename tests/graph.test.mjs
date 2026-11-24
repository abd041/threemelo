import test from 'node:test';import assert from 'node:assert/strict';import {compile,graphMesh,presets} from '../lib/graph.mjs';
test('operator precedence',()=>assert.equal(compile('-2^2+3*4')({}),8));
test('right associative power',()=>assert.equal(compile('2^3^2')({}),512));
test('functions and variables',()=>assert.ok(Math.abs(compile('sin(pi/2)+sqrt(x)')({x:4})-3)<1e-10));
test('rejects executable syntax and implicit multiplication',()=>{for(const e of ['alert(1)','x.constructor','2x','sin(x','1;2',''])assert.throws(()=>compile(e));});
test('all four presets produce finite triangles',()=>{for(const p of Object.values(presets)){const m=graphMesh({...p,resolution:20});assert.equal(m.triangles,800);assert.ok(m.positions.every(Number.isFinite));}});
test('undefined samples omitted',()=>{const m=graphMesh({...presets.wave,z:'sqrt(x)',resolution:20});assert.ok(m.skipped>0&&m.triangles>0);});
test('invalid domains and resolution rejected',()=>{assert.throws(()=>graphMesh({...presets.wave,a:7,resolution:20}));assert.throws(()=>graphMesh({...presets.wave,resolution:200}));});
test('all undefined rejected',()=>assert.throws(()=>graphMesh({...presets.wave,z:'sqrt(-1)',resolution:20})));
