import test from 'node:test';import assert from 'node:assert/strict';import {dimensions,validateSVG,sampleSVG} from '../lib/svg-stl.mjs';
test('sample accepted',()=>assert.equal(validateSVG(sampleSVG),sampleSVG));
test('external references rejected',()=>assert.throws(()=>validateSVG('<svg><image href="https://example.com/a.png"/></svg>')));
test('text rejected',()=>assert.throws(()=>validateSVG('<svg><text>hello</text></svg>')));
test('wide aspect preserved',()=>assert.deepEqual(dimensions(100,50,60,3),{width:60,height:30,depth:3,scale:.6}));
test('tall aspect preserved',()=>assert.equal(dimensions(50,100,60,3).width,30));
test('invalid dimensions rejected',()=>{for(const a of [[0,1,60,3],[1,1,301,3],[1,1,60,0],[1,1,NaN,3]])assert.throws(()=>dimensions(...a));});
