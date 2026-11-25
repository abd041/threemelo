import test from 'node:test';
import assert from 'node:assert/strict';
import {initialRoom, makeItem} from '../lib/room.mjs';
import {CATEGORIES, FURNITURE, OPENINGS, TEMPLATES, addOpening, blankProject, createHistory, createMemoryStorage, footprintsOverlap, formatArea, formatLength, lPoints, metrics, migrateLegacy, parseLength, pdfBytes, placementIssues, polygonArea, rectPoints, roomPoints, selfIntersects, snapToWall, templateProject, validateOpening, validatePolygon, validateProject} from '../lib/room-planner.mjs';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);

test('unit display changes do not resize stored meters', () => {
  const feet = parseLength('12 ft 6 in', 'ft-in');
  near(feet, 12 * 0.3048 + 6 * 0.0254);
  near(parseLength('10', 'ft'), 3.048);
  near(parseLength('250', 'cm'), 2.5);
  near(parseLength('3.5', 'm'), 3.5);
  assert.equal(formatLength(feet, 'm'), '3.81 m');
  assert.match(formatArea(feet * 3, 'ft-in'), /sq ft/);
  const project = validateProject({...blankProject(), width: feet});
  assert.equal(project.width, feet);
  assert.equal(validateProject({...project, units: 'cm'}).width, feet);
});

test('rectangle, L and polygon areas reject invalid outlines', () => {
  near(polygonArea(rectPoints(4, 3)), 12);
  near(polygonArea(lPoints(6, 5, 2, 2)), 26);
  near(metrics({...blankProject(), shape: 'l', width: 6, depth: 5, cutW: 2, cutD: 2}).area, 26);
  assert.throws(() => lPoints(4, 4, 3.5, 1));
  const bowtie = [{x: 0, z: 0}, {x: 2, z: 2}, {x: 0, z: 2}, {x: 2, z: 0}];
  assert.equal(selfIntersects(bowtie), true);
  assert.throws(() => validatePolygon(bowtie));
  assert.throws(() => validatePolygon([{x: 0, z: 0}, {x: 0.1, z: 0}, {x: 0, z: 1}]));
  const valid = validatePolygon([{x: -2, z: -1}, {x: 2, z: -1}, {x: 2, z: 1}, {x: -2, z: 1}]);
  near(polygonArea(valid), 8);
});

test('rotated footprints and elevation rules', () => {
  const bed = {id: 'a', type: 'queen-bed', place: 'floor', x: 0, z: 0, width: 1.5, depth: 2, height: 0.6, rotation: 45, elevation: 0};
  const other = {...bed, id: 'b', x: 0.2, z: 0.2};
  assert.equal(footprintsOverlap(bed, other), true);
  assert.equal(footprintsOverlap(bed, {...other, x: 4, z: 4}), false);
  const room = validateProject(blankProject());
  const rug = {...room.items[0], id: 'rug', type: 'rug-rect', place: 'under', x: 0, z: 0, width: 2, depth: 1.6, height: 0.02, rotation: 0, elevation: 0};
  const table = {id: 'table', type: 'coffee-table', place: 'floor', x: 0, z: 0, width: 1.2, depth: 0.6, height: 0.42, rotation: 0, elevation: 0};
  const lamp = {id: 'lamp', type: 'table-lamp', place: 'surface', x: 0, z: 0, width: 0.25, depth: 0.25, height: 0.45, rotation: 0, elevation: 0.75};
  const project = {...room, items: [rug, table, lamp]};
  assert.deepEqual(placementIssues(project, rug), []);
  assert.deepEqual(placementIssues(project, lamp), []);
  assert.ok(placementIssues(project, {...table, x: 20}).includes('extends outside the room'));
});

test('openings must fit a wall and cannot overlap', () => {
  let project = validateProject(blankProject());
  project = addOpening(project, 'door-single');
  assert.equal(project.openings[0].kind, 'door');
  const points = roomPoints(project);
  assert.throws(() => validateOpening(project, {...project.openings[0], id: 'second', offset: project.openings[0].offset}, points));
  assert.throws(() => validateOpening(project, {...project.openings[0], id: 'wide', offset: 0.1, width: 30}, points));
});

test('history, migration, templates and storage failures', async () => {
  const history = createHistory({value: 1});
  history.commit({value: 2});
  assert.deepEqual(history.undo(), {value: 1});
  assert.deepEqual(history.redo(), {value: 2});
  history.commit({value: 3});
  assert.equal(history.canRedo(), false);
  const legacy = migrateLegacy({...initialRoom, items: [makeItem('bed', 'bed-1', initialRoom)]});
  assert.equal(legacy.version, 2);
  assert.equal(legacy.items[0].type, 'queen-bed');
  assert.equal(legacy.items[0].x, 0);
  assert.equal(Object.keys(FURNITURE).length, 51);
  assert.equal(Object.keys(OPENINGS).length, 6);
  assert.equal(CATEGORIES.length, 8);
  assert.equal(TEMPLATES.length, 10);
  for (const template of TEMPLATES) {
    const project = templateProject(template.id);
    assert.equal(project.items.length > 0, true);
    for (const item of project.items) assert.equal(placementIssues(project, item).includes('extends outside the room'), false, template.id);
  }
  const storage = createMemoryStorage();
  await storage.save({id: 'one', name: 'Room'});
  storage.fail = true;
  await assert.rejects(storage.save({id: 'two'}), /Browser storage refused/);
  assert.throws(() => validateProject({version: 2, width: Number.NaN}));
});

test('wall snap pulls a nearby footprint flush and leaves a distant one', () => {
  const project = blankProject();
  const half = project.depth / 2;
  const item = {width: 1, depth: 1, rotation: 0, x: 0, z: half - 0.5 - 0.08};
  const snapped = snapToWall(project, item);
  near(snapped.z, half - 0.5);
  near(snapped.x, 0);
  near(snapToWall(project, {...item, z: 0}).z, 0);
  near(snapToWall({...project, wallSnap: false}, item).z, item.z);
});

test('pdf export is a real document and metrics distinguish estimates', () => {
  const project = templateProject('modern-living');
  const stats = metrics(project);
  near(stats.area, 4.8768 * 4.2672);
  assert.equal(typeof stats.occupiedIsEstimate, 'boolean');
  assert.ok(stats.netWall < stats.grossWall || project.openings.length === 0);
  const pdf = pdfBytes(project, {paper: 'Letter', landscape: true});
  assert.equal(Buffer.from(pdf).subarray(0, 8).toString(), '%PDF-1.4');
  assert.match(Buffer.from(pdf).toString(), /not to scale/);
  assert.equal(pdfBytes(project, {paper: 'A4', landscape: false})[0], 37);
});
