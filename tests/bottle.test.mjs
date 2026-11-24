import test from 'node:test';import assert from 'node:assert/strict';import {bottleDefaults as d,bottleDimensions,bottleProfile,artworkRatio,bottlePresets} from '../lib/bottle-utils.mjs';
test('normalized total height',()=>{const x=bottleDimensions(d);assert.ok(Math.abs(x.h+x.cap-3)<1e-10)});
test('neck ratio preserved',()=>{const x=bottleDimensions(d);assert.equal(x.neck/x.r,d.neck)});
test('invalid dimensions rejected',()=>{assert.throws(()=>bottleDimensions({...d,radius:0}));assert.throws(()=>bottleDimensions({...d,labelHeight:NaN}))});
test('label ratio',()=>{assert.ok(Math.abs(artworkRatio(d)-2*Math.PI*d.radius*.75/(d.height*d.labelHeight))<1e-10)});
test('all presets valid',()=>{for(const [radius,height,neck,capHeight] of Object.values(bottlePresets))assert.ok(bottleDimensions({...d,radius,height,neck,capHeight}).r>0)});
test('profile closed at axis',()=>{const p=bottleProfile(d);assert.equal(p[0][0],0);assert.equal(p.at(-1)[0],0);assert.ok(p.every(([r,y])=>r>=0&&Number.isFinite(y)))});
