import test from 'node:test';import assert from 'node:assert/strict';import {defaults,normalize,transform,generateCSS,animationFrames,presets} from '../lib/css-transform.mjs';
test('defaults stable',()=>assert.deepEqual(normalize(),defaults));
test('clamps numeric ranges',()=>{assert.equal(normalize({perspective:1,rx:999,sx:0}).perspective,200);assert.equal(normalize({rx:999}).rx,180);assert.equal(normalize({sx:0}).sx,.25)});
test('rejects invalid values',()=>assert.deepEqual(normalize({rx:NaN,ty:Infinity,rz:'bad',animation:'bad'}),defaults));
test('transform order and units',()=>assert.equal(transform({tx:10,rx:30,ry:0,rz:0}),'translate3d(10px, 0px, 0px) rotateX(30deg) rotateY(0deg) rotateZ(0deg) scale3d(1, 1, 1)'));
test('static CSS includes parent and origin',()=>{const css=generateCSS({perspective:500,ox:20,oy:80});assert.match(css,/perspective: 500px/);assert.match(css,/transform-origin: 20% 80%/);assert.doesNotMatch(css,/@keyframes/)});
test('animation frames and accessibility',()=>{for(const a of ['spin','float','flip']){const css=generateCSS({animation:a,duration:3});assert.match(css,/@keyframes threemelo-motion/);assert.match(css,/3s/);assert.match(css,/prefers-reduced-motion/);assert.notEqual(animationFrames({animation:a}),transform({animation:a}))}});
test('all presets valid',()=>{for(const p of Object.values(presets))assert.doesNotMatch(generateCSS(p),/NaN|undefined/)});
