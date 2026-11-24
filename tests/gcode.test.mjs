import test from 'node:test';import assert from 'node:assert/strict';import {parseGcode,visiblePaths,SAMPLE} from '../lib/gcode.mjs';
test('sample layers and distance',()=>{const d=parseGcode(SAMPLE);assert.deepEqual(d.layers,[.2,.4]);assert.equal(d.extrusion,240);assert.equal(d.filament,8);});
test('relative positioning',()=>{const d=parseGcode('G91\nM83\nG1 X10 E1 F600\nG1 X10 E1');assert.equal(d.extrusion,20);assert.equal(d.seconds,2);});
test('reset extrusion',()=>assert.equal(parseGcode('G1 X10 E2\nG92 E0\nG1 X20 E1').filament,3));
test('inches',()=>assert.equal(parseGcode('G20\nG1 X1 F60').travel,25.4));
test('layer filter',()=>{const d=parseGcode(SAMPLE);assert.equal(visiblePaths(d,0,false).print.length,24);assert.equal(visiblePaths(d,1,false,true).print.length,24);});
test('invalid input',()=>assert.throws(()=>parseGcode(';empty'),/No supported/));
test('unsupported commands',()=>{const d=parseGcode('G1 X1\nG2 X3\nG1 X4');assert.equal(d.unsupported,1);assert.equal(d.unknownFeed,2);});
