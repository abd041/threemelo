import {test} from 'node:test';import assert from 'node:assert/strict';import {meshMetrics,inspectSTL} from '../lib/mesh-metrics.mjs';
test('triangle area and open mesh',()=>{const r=meshMetrics([0,0,0,3,0,0,0,4,0]);assert.equal(r.area,6);assert.deepEqual(r.dimensions,[3,4,0]);assert.equal(r.volume,null);assert.equal(r.closed,false);});
test('oriented tetrahedron volume',()=>{const a=[0,0,0],b=[1,0,0],c=[0,1,0],d=[0,0,1];const r=meshMetrics([...a,...c,...b,...a,...b,...d,...a,...d,...c,...b,...c,...d]);assert.equal(r.closed,true);assert.equal(r.uniqueVertices,4);assert.ok(Math.abs(r.volume-1/6)<1e-12);});
test('invalid coordinates rejected',()=>assert.throws(()=>meshMetrics([NaN,0,0,1,0,0,0,1,0])));
test('binary STL including solid header',()=>{const b=new ArrayBuffer(134);new Uint8Array(b).set(new TextEncoder().encode('solid binary'));new DataView(b).setUint32(80,1,true);assert.equal(inspectSTL(b),'Binary');});
test('ASCII STL detection',()=>assert.equal(inspectSTL(new TextEncoder().encode('solid x\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid x').buffer),'ASCII'));
test('truncated file rejected',()=>assert.throws(()=>inspectSTL(new ArrayBuffer(100))));
