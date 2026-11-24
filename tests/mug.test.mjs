import test from 'node:test';import assert from 'node:assert/strict';import {mugDefaults,mugDimensions,artworkRatio,mugPresets} from '../lib/mug-utils.mjs';
test('normalizes height',()=>assert.equal(mugDimensions(mugDefaults).h,3));
test('preserves radius to height ratio',()=>{const {r,h}=mugDimensions(mugDefaults);assert.ok(Math.abs(r/h-4/9.5)<1e-12)});
test('rejects invalid radius',()=>assert.throws(()=>mugDimensions({...mugDefaults,radius:0})));
test('rejects invalid handle',()=>assert.throws(()=>mugDimensions({...mugDefaults,handle:Infinity})));
test('wrap ratio scales with angle',()=>assert.equal(artworkRatio({...mugDefaults,wrap:180})*2,artworkRatio({...mugDefaults,wrap:360})));
test('all presets valid',()=>Object.values(mugPresets).forEach(([radius,height,handle])=>assert.ok(mugDimensions({...mugDefaults,radius,height,handle}).r>0)));
