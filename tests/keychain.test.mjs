import test from 'node:test';import assert from 'node:assert/strict';import {defaults,layout} from '../lib/keychain-utils.mjs';
test('default keychain layout leaves space for hole and text',()=>{const l=layout(defaults);assert.ok(l.left>l.holeX+l.r);assert.ok(l.right>l.left);});
test('oval leaves additional edge clearance',()=>{assert.ok(layout({...defaults,shape:'oval'}).right<layout(defaults).right);});
test('invalid size rejected',()=>assert.throws(()=>layout({...defaults,width:0})));test('empty text rejected',()=>assert.throws(()=>layout({...defaults,text:' '})));test('long text rejected',()=>assert.throws(()=>layout({...defaults,text:'a'.repeat(21)})));test('invalid hole rejected',()=>assert.throws(()=>layout({...defaults,hole:20})));
