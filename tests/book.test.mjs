import test from 'node:test';import assert from 'node:assert/strict';import {bookDefaults,bookDimensions,exportDimensions} from '../lib/book-utils.mjs';
test('book aspect ratio',()=>{const d=bookDimensions(bookDefaults);assert.equal(d.w,2);assert.equal(d.h,3);});
test('hardcover board thicker',()=>assert.ok(bookDimensions({...bookDefaults,binding:'hardcover'}).board>bookDimensions(bookDefaults).board));
test('reject invalid thickness',()=>assert.throws(()=>bookDimensions({...bookDefaults,depth:0})));
test('reject invalid binding',()=>assert.throws(()=>bookDimensions({...bookDefaults,binding:'other'})));
test('export landscape ratio',()=>assert.deepEqual(exportDimensions(1920,960,480),[1920,960]));
test('export portrait cap',()=>assert.deepEqual(exportDimensions(3840,100,200),[2048,4096]));
