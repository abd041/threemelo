import test from 'node:test';import assert from 'node:assert/strict';import {presets,outline,cutterMesh,settings,normalize} from '../lib/cookie-cutter.mjs';import {meshMetrics} from '../lib/mesh-metrics.mjs';
const opts={size:70,height:15,wall:1.2,rim:2};
for(const kind of presets)test(`${kind} default cutter is closed and nondegenerate`,()=>{const m=meshMetrics(cutterMesh(outline(kind),opts));assert.equal(m.closed,true);assert.equal(m.degenerate,0);assert.equal(m.dimensions[2],15);assert.ok(m.volume>0);});
test('zero rim remains closed',()=>assert.equal(meshMetrics(cutterMesh(outline('circle'),{...opts,rim:0})).closed,true));
test('invalid settings rejected',()=>assert.throws(()=>settings(10,15,1,2)));
test('normalized longest side',()=>{const p=normalize([[0,0],[4,0],[4,2],[0,2],[0,0]],80);assert.equal(Math.max(...p.map(a=>a[0]))-Math.min(...p.map(a=>a[0])),80);});
test('self crossing rejected',()=>assert.throws(()=>cutterMesh([[0,0],[4,4],[0,4],[4,0]],opts)));
