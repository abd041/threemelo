import test from 'node:test';import assert from 'node:assert/strict';import {initialPlan,validatePlan,area,wallPieces} from '../lib/floor-plan.mjs';
test('default plan valid',()=>assert.equal(validatePlan(initialPlan),initialPlan));
test('area sums rooms',()=>assert.equal(area(initialPlan),32));
test('overlap rejected',()=>{const p=structuredClone(initialPlan);p.rooms[1].x=4;assert.throws(()=>validatePlan(p),/overlap/);});
test('opening outside wall rejected',()=>{const p=structuredClone(initialPlan);p.openings[0].offset=5;assert.throws(()=>validatePlan(p),/fit/);});
test('door leaves lintel and wall sections',()=>assert.deepEqual(wallPieces(5,3,[{kind:'door',offset:1,width:1}]),[[0,1,0,3],[1,1,2.05,.9500000000000002],[2,3,0,3]]));
test('window leaves sill',()=>assert.deepEqual(wallPieces(4,3,[{kind:'window',offset:0,width:1}])[0],[0,1,0,.85]));
test('invalid import rejected',()=>assert.throws(()=>validatePlan({rooms:[]})));
