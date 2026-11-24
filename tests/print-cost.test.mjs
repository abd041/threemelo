import test from 'node:test';import assert from 'node:assert/strict';import {defaults,calculateCost,estimateGrams,readPrintMesh} from '../lib/print-cost.mjs';
test('default cost breakdown',()=>{const r=calculateCost(defaults);assert.equal(r.material,2.625);assert.ok(Math.abs(r.electricity-.108)<1e-9);assert.ok(Math.abs(r.unit-7.233)<1e-9)});
test('quantity and markup',()=>{const r=calculateCost({...defaults,quantity:3,markup:50});assert.equal(r.total,r.unit*3);assert.equal(r.revenue,r.selling*3);assert.equal(r.selling,r.unit*1.5)});
test('reject invalid costs',()=>{for(const s of [{grams:-1},{lifetime:0},{quantity:1.5},{hours:NaN}])assert.throws(()=>calculateCost({...defaults,...s}))});
test('unit conversions and density',()=>{assert.equal(estimateGrams(1000,'mm',1.24,100),1.24);assert.equal(estimateGrams(1,'cm',1.24,50),.62);assert.equal(estimateGrams(1,'in',1,100),16.387064)});
test('reject invalid volume settings',()=>{assert.throws(()=>estimateGrams(1,'mm',1,101));assert.throws(()=>estimateGrams(1,'x',1,50))});
test('closed binary tetrahedron volume',()=>{const faces=[[0,0,0,0,1,0,1,0,0],[0,0,0,1,0,0,0,0,1],[0,0,0,0,0,1,0,1,0],[1,0,0,0,1,0,0,0,1]];const b=new ArrayBuffer(284),v=new DataView(b);v.setUint32(80,4,true);faces.forEach((f,i)=>f.forEach((x,j)=>v.setFloat32(96+i*50+j*4,x,true)));assert.ok(Math.abs(readPrintMesh(b).volume-1/6)<1e-9)});
test('open mesh rejected',()=>{const b=new ArrayBuffer(134),v=new DataView(b);v.setUint32(80,1,true);v.setFloat32(108,1,true);v.setFloat32(124,1,true);assert.throws(()=>readPrintMesh(b))});
