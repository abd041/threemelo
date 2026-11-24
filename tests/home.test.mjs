import test from 'node:test';import assert from 'node:assert/strict';import {filterTools,featuredTools,homeCategories} from '../lib/home.mjs';import {tools,categories} from '../lib/catalog.mjs';import {readFileSync,existsSync} from 'node:fs';
test('home categories cover registry exactly',()=>assert.deepEqual([...homeCategories].sort(),[...categories].sort()));
test('empty search lists all 30 tools',()=>assert.equal(filterTools().length,30));
test('search is case insensitive and supports multiple terms',()=>assert.ok(filterTools('  STL VIEWER ').some(t=>t.slug==='stl-viewer')));
test('category and search compose',()=>assert.ok(filterTools('STL','File converters').every(t=>t.category==='File converters')));
test('no matching tool returns empty list',()=>assert.deepEqual(filterTools('xyz-no-tool'),[]));
test('featured links are distinct published tools with artwork',()=>{assert.equal(new Set(featuredTools.map(t=>t.slug)).size,4);featuredTools.forEach((t,i)=>{assert.ok(tools.includes(t));assert.ok(existsSync(new URL(`../public/feature-${i}.svg`,import.meta.url)));});});
test('homepage has single H1 and local hero artwork',()=>{const s=readFileSync(new URL('../app/page.jsx',import.meta.url),'utf8');assert.equal((s.match(/<h1\b/g)||[]).length,1);assert.ok(existsSync(new URL('../public/studio-art.svg',import.meta.url)));assert.match(s,/id="all-tools"/);});
