import test from 'node:test';import assert from 'node:assert/strict';import {initialRoom,makeItem,constrain,validateRoom} from '../lib/room.mjs';
test('default room valid',()=>assert.deepEqual(validateRoom(initialRoom),initialRoom));
test('furniture constrained to walls',()=>{const i=makeItem('bed','1',initialRoom);assert.equal(constrain({...i,x:100},initialRoom).x,1.7);});
test('rotated footprint constrained',()=>{const i=makeItem('bed','1',initialRoom);assert.ok(Math.abs(constrain({...i,rotation:90,x:100},initialRoom).x-1.5)<1e-8);});
test('invalid room rejected',()=>assert.throws(()=>validateRoom({...initialRoom,width:0})));
test('duplicate ids rejected',()=>{const i=makeItem('bed','1',initialRoom);assert.throws(()=>validateRoom({...initialRoom,items:[i,i]}));});
test('invalid color rejected',()=>assert.throws(()=>validateRoom({...initialRoom,wall:'bad'})));
