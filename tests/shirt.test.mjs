import test from 'node:test';import assert from 'node:assert/strict';import {artworkRect,shirtDefaults,shirtOutline} from '../lib/shirt-utils.mjs';
test('wide print preserves ratio',()=>{const r=artworkRect(1000,500,1,0,0);assert.equal(r.width/r.height,2);assert.equal(r.width,1.3)});
test('tall print preserves ratio',()=>{const r=artworkRect(100,400,1,0,0);assert.equal(r.height,1.6);assert.equal(r.width,.4)});
test('placement stays within print region',()=>{for(const x of [-1,1])for(const y of [-1,1]){const r=artworkRect(500,500,.4,x,y);assert.ok(Math.abs(r.x)+r.width/2<=.650001);assert.ok(Math.abs(r.y+.1)+r.height/2<=.800001)}});
test('invalid dimensions rejected',()=>{assert.throws(()=>artworkRect(0,1,1,0,0));assert.throws(()=>artworkRect(1,1,2,0,0))});
test('default front and back scale valid',()=>{assert.doesNotThrow(()=>artworkRect(500,500,shirtDefaults.scale,0,0));assert.equal(shirtDefaults.scale,shirtDefaults.backScale)});
test('shirt outline finite',()=>{assert.ok(shirtOutline().length>10);assert.ok(shirtOutline().flat().every(Number.isFinite))});
