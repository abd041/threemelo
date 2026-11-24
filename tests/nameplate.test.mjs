import test from 'node:test';import assert from 'node:assert/strict';import {defaults,layout} from '../lib/nameplate-utils.mjs';
test('nameplate default usable area',()=>assert.deepEqual(layout(defaults),{left:-55,right:55,textHeight:27}));
test('nameplate minimum usable area',()=>assert.deepEqual(layout({...defaults,width:60,height:20}),{left:-25,right:25,textHeight:12}));
test('nameplate invalid stand',()=>assert.throws(()=>layout({...defaults,depth:0})));
test('nameplate invalid thickness',()=>assert.throws(()=>layout({...defaults,thickness:NaN})));
test('nameplate rejects blank text',()=>assert.throws(()=>layout({...defaults,text:' '})));
test('nameplate rejects long text',()=>assert.throws(()=>layout({...defaults,text:'a'.repeat(25)})));
