import {furniture as legacyFurniture, validateRoom} from './room.mjs';

export const UNITS = ['ft-in', 'ft', 'm', 'cm'];
export const SHAPES = ['rectangle', 'square', 'l', 'polygon'];
const FACTOR = {ft: 0.3048, in: 0.0254, m: 1, cm: 0.01};
const finite = value => typeof value === 'number' && Number.isFinite(value);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function metersFrom(value, unit = 'm') {
  if (!finite(value) || !FACTOR[unit === 'ft-in' ? 'ft' : unit]) throw Error('Enter a finite measurement.');
  return value * FACTOR[unit === 'ft-in' ? 'ft' : unit];
}

export function parseLength(input, unit = 'ft-in') {
  const text = String(input ?? '').trim().toLowerCase().replace(/[′’]/g, "'").replace(/[″“”]/g, '"');
  if (!text || text.length > 40) throw Error('Enter a length such as 12 ft 6 in or 3.8 m.');
  if (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return metersFrom(Number(text), unit);
  const feet = /^([-+]?)(\d+(?:\.\d+)?)\s*(?:ft|feet|foot|')\s*(\d+(?:\.\d+)?)?\s*(?:in|inches|inch|")?$/.exec(text);
  if (feet) {
    const inches = Number(feet[3] || 0);
    if (inches >= 12) throw Error('Keep the inch part below 12.');
    return (feet[1] === '-' ? -1 : 1) * (Number(feet[2]) * 0.3048 + inches * 0.0254);
  }
  const one = /^([-+]?(?:\d+(?:\.\d*)?|\.\d+))\s*(ft|in|m|cm|")$/.exec(text);
  if (!one) throw Error('Use a number in the selected unit, or a value such as 12\' 6".');
  return metersFrom(Number(one[1]), one[2] === '"' ? 'in' : one[2]);
}

export function formatLength(meters, unit = 'ft-in') {
  if (!finite(meters)) return '';
  if (unit === 'ft-in') {
    const sign = meters < 0 ? '-' : '';
    const total = Math.round(Math.abs(meters) / 0.0254);
    return `${sign}${Math.floor(total / 12)} ft ${total % 12} in`;
  }
  const places = unit === 'cm' ? 0 : 2;
  return `${(meters / FACTOR[unit]).toFixed(places)} ${unit}`;
}

export function formatArea(squareMeters, unit = 'ft-in') {
  if (!finite(squareMeters)) return '';
  return ['ft-in', 'ft'].includes(unit) ? `${(squareMeters / 0.09290304).toFixed(1)} sq ft` : `${squareMeters.toFixed(2)} m²`;
}

const rows = [
  ['sofa-2', 'Two-seat sofa', 'living', 'sofa', 'floor', 1.6, 0.9, 0.85],
  ['sofa-3', 'Three-seat sofa', 'living', 'sofa', 'floor', 2.2, 0.95, 0.85],
  ['sectional', 'Sectional sofa', 'living', 'sectional', 'floor', 2.7, 1.7, 0.85],
  ['sofa-l', 'L-shaped sofa', 'living', 'sectional', 'floor', 2.5, 1.6, 0.85],
  ['armchair', 'Armchair', 'living', 'chair', 'floor', 0.85, 0.85, 0.9],
  ['recliner', 'Recliner', 'living', 'chair', 'floor', 0.95, 1.0, 1.05],
  ['coffee-table', 'Coffee table', 'living', 'table', 'floor', 1.2, 0.6, 0.42],
  ['side-table', 'Side table', 'living', 'table', 'floor', 0.5, 0.5, 0.55],
  ['tv-stand', 'TV stand', 'living', 'storage', 'floor', 1.6, 0.42, 0.5],
  ['television', 'Television', 'living', 'screen', 'surface', 1.2, 0.08, 0.7],
  ['bookshelf', 'Bookshelf', 'living', 'storage', 'floor', 0.9, 0.35, 1.8],
  ['single-bed', 'Single bed', 'bedroom', 'bed', 'floor', 0.99, 1.9, 0.55],
  ['twin-bed', 'Twin bed', 'bedroom', 'bed', 'floor', 0.99, 1.9, 0.6],
  ['full-bed', 'Full bed', 'bedroom', 'bed', 'floor', 1.37, 1.9, 0.6],
  ['queen-bed', 'Queen bed', 'bedroom', 'bed', 'floor', 1.52, 2.03, 0.62],
  ['king-bed', 'King bed', 'bedroom', 'bed', 'floor', 1.93, 2.03, 0.62],
  ['nightstand', 'Nightstand', 'bedroom', 'storage', 'floor', 0.5, 0.4, 0.55],
  ['dresser', 'Dresser', 'bedroom', 'storage', 'floor', 1.2, 0.5, 0.8],
  ['wardrobe', 'Wardrobe', 'bedroom', 'storage', 'floor', 1.2, 0.6, 2.1],
  ['storage-bench', 'Storage bench', 'bedroom', 'storage', 'floor', 1.1, 0.4, 0.48],
  ['dining-round', 'Round dining table', 'dining', 'table', 'floor', 1.2, 1.2, 0.75],
  ['dining-rect', 'Rectangular dining table', 'dining', 'table', 'floor', 1.8, 0.9, 0.75],
  ['dining-chair', 'Dining chair', 'dining', 'chair', 'floor', 0.46, 0.5, 0.92],
  ['dining-bench', 'Dining bench', 'dining', 'chair', 'floor', 1.4, 0.4, 0.46],
  ['sideboard', 'Sideboard', 'dining', 'storage', 'floor', 1.6, 0.45, 0.8],
  ['writing-desk', 'Writing desk', 'office', 'table', 'floor', 1.2, 0.6, 0.75],
  ['computer-desk', 'Computer desk', 'office', 'table', 'floor', 1.4, 0.65, 0.75],
  ['corner-desk', 'Corner desk', 'office', 'table', 'floor', 1.4, 1.4, 0.75],
  ['office-chair', 'Office chair', 'office', 'chair', 'floor', 0.65, 0.65, 1.05],
  ['filing-cabinet', 'Filing cabinet', 'office', 'storage', 'floor', 0.45, 0.6, 0.7],
  ['office-shelf', 'Office bookshelf', 'office', 'storage', 'floor', 0.8, 0.3, 1.8],
  ['refrigerator', 'Refrigerator', 'kitchen', 'appliance', 'floor', 0.75, 0.75, 1.8],
  ['kitchen-island', 'Kitchen island', 'kitchen', 'storage', 'floor', 1.6, 0.9, 0.9],
  ['base-cabinet', 'Base cabinet', 'kitchen', 'storage', 'floor', 0.8, 0.6, 0.9],
  ['wall-cabinet', 'Wall cabinet', 'kitchen', 'storage', 'wall', 0.8, 0.35, 0.7],
  ['kitchen-counter', 'Kitchen counter', 'kitchen', 'storage', 'floor', 2.0, 0.6, 0.9],
  ['bar-stool', 'Bar stool', 'kitchen', 'chair', 'floor', 0.4, 0.4, 0.75],
  ['stove', 'Stove', 'kitchen', 'appliance', 'floor', 0.76, 0.65, 0.9],
  ['kitchen-sink', 'Kitchen sink', 'kitchen', 'appliance', 'floor', 0.8, 0.6, 0.9],
  ['bathtub', 'Bathtub', 'bathroom', 'appliance', 'floor', 1.7, 0.75, 0.58],
  ['shower', 'Shower enclosure', 'bathroom', 'appliance', 'floor', 0.9, 0.9, 2.0],
  ['toilet', 'Toilet', 'bathroom', 'appliance', 'floor', 0.4, 0.7, 0.78],
  ['vanity', 'Bathroom vanity', 'bathroom', 'storage', 'floor', 0.9, 0.48, 0.85],
  ['rug-rect', 'Rectangular rug', 'decor', 'rug', 'under', 2.4, 1.6, 0.02],
  ['rug-round', 'Round rug', 'decor', 'rug', 'under', 1.8, 1.8, 0.02],
  ['floor-lamp', 'Floor lamp', 'decor', 'lamp', 'floor', 0.35, 0.35, 1.6],
  ['table-lamp', 'Table lamp', 'decor', 'lamp', 'surface', 0.25, 0.25, 0.45],
  ['plant', 'Indoor plant', 'decor', 'plant', 'floor', 0.4, 0.4, 1.1],
  ['mirror', 'Wall mirror', 'decor', 'art', 'wall', 0.7, 0.04, 1.0],
  ['wall-art', 'Wall art', 'decor', 'art', 'wall', 0.9, 0.04, 0.6],
  ['pendant', 'Pendant light', 'decor', 'lamp', 'surface', 0.4, 0.4, 0.35],
];

export const CATEGORIES = [
  ['living', 'Living room'],
  ['bedroom', 'Bedroom'],
  ['dining', 'Dining room'],
  ['office', 'Home office'],
  ['kitchen', 'Kitchen'],
  ['bathroom', 'Bathroom'],
  ['decor', 'Decorations and lighting'],
  ['doors', 'Doors and windows'],
];

export const FURNITURE = Object.fromEntries(rows.map(([id, name, category, kind, place, width, depth, height]) => [id, {id, name, category, kind, place, width, depth, height}]));

export const OPENINGS = {
  'door-single': {id: 'door-single', name: 'Single door', kind: 'door', width: 0.9, height: 2.05, sill: 0},
  'door-double': {id: 'door-double', name: 'Double door', kind: 'door', width: 1.6, height: 2.05, sill: 0},
  'door-sliding': {id: 'door-sliding', name: 'Sliding door', kind: 'door', width: 1.8, height: 2.1, sill: 0},
  'window-standard': {id: 'window-standard', name: 'Standard window', kind: 'window', width: 1.2, height: 1.2, sill: 0.9},
  'window-wide': {id: 'window-wide', name: 'Wide window', kind: 'window', width: 1.8, height: 1.2, sill: 0.9},
  'window-tall': {id: 'window-tall', name: 'Floor-to-ceiling window', kind: 'window', width: 1.5, height: 2.2, sill: 0.05},
};

export const FLOORS = [
  ['light-oak', 'Light oak', '#d7b48a'],
  ['walnut', 'Dark walnut', '#6b4423'],
  ['natural', 'Natural wood', '#c4a574'],
  ['hardwood', 'Hardwood', '#a67c52'],
  ['laminate', 'Laminate', '#c8b79a'],
  ['white-tile', 'White tile', '#eceae4'],
  ['gray-tile', 'Gray tile', '#b7b7b7'],
  ['marble', 'Marble-style finish', '#e7e2dc'],
  ['concrete', 'Concrete', '#9a9a96'],
  ['carpet', 'Carpet', '#8d8478'],
];
export const WALL_COLORS = [
  ['white', 'White', '#f7f5f2'],
  ['warm', 'Warm white', '#f3eadf'],
  ['beige', 'Beige', '#e6d7c3'],
  ['gray', 'Light gray', '#d5d5d2'],
  ['dark', 'Dark gray', '#4d5158'],
  ['sage', 'Sage green', '#b7c4b1'],
  ['navy', 'Navy', '#243044'],
  ['terra', 'Terracotta', '#c47a5a'],
];
export const LIGHTS = [
  ['daylight', 'Natural daylight'],
  ['warm', 'Warm indoor lighting'],
  ['cool', 'Cool indoor lighting'],
  ['studio', 'Neutral studio lighting'],
];

export function polygonArea(points) {
  if (!Array.isArray(points) || points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a.x * b.z - b.x * a.z;
  }
  return Math.abs(sum) / 2;
}

export function perimeter(points) {
  let length = 0;
  for (let i = 0; i < points.length; i += 1) length += distance(points[i], points[(i + 1) % points.length]);
  return length;
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function segmentsCross(a, b, c, d) {
  const cross = (p, q, r) => (q.x - p.x) * (r.z - p.z) - (q.z - p.z) * (r.x - p.x);
  const ab = cross(a, b, c);
  const cd = cross(a, b, d);
  const ac = cross(c, d, a);
  const bd = cross(c, d, b);
  return ab * cd < 0 && ac * bd < 0;
}

export function selfIntersects(points) {
  const n = points.length;
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 1)) continue;
      if (segmentsCross(points[i], points[(i + 1) % n], points[j], points[(j + 1) % n])) return true;
    }
  }
  return false;
}

export function validatePolygon(points) {
  if (!Array.isArray(points) || points.length < 3 || points.length > 16) throw Error('A custom room needs 3 to 16 corners.');
  const clean = points.map(point => {
    if (!point || !finite(point.x) || !finite(point.z) || Math.abs(point.x) > 30 || Math.abs(point.z) > 30) throw Error('A corner is outside the supported area.');
    return {x: point.x, z: point.z};
  });
  for (let i = 0; i < clean.length; i += 1) {
    if (distance(clean[i], clean[(i + 1) % clean.length]) < 0.3) throw Error('Each wall must be at least 0.3 m long.');
  }
  if (selfIntersects(clean)) throw Error('Room walls cannot cross each other.');
  const area = polygonArea(clean);
  if (area < 2 || area > 400) throw Error('Room area must stay between 2 and 400 square meters.');
  return clean;
}

export function rectPoints(width, depth) {
  const w = width / 2;
  const d = depth / 2;
  return [{x: -w, z: -d}, {x: w, z: -d}, {x: w, z: d}, {x: -w, z: d}];
}

export function lPoints(width, depth, cutW, cutD) {
  if (![width, depth, cutW, cutD].every(finite)) throw Error('Enter finite L-shape dimensions.');
  if (width < 2.4 || depth < 2.4 || width > 20 || depth > 20) throw Error('L-shape outer size must be from 2.4 m to 20 m.');
  if (cutW < 0.6 || cutD < 0.6 || cutW > width - 0.9 || cutD > depth - 0.9) throw Error('The missing corner must leave at least 0.9 m on each outer wall.');
  const raw = [[0, 0], [width, 0], [width, depth - cutD], [width - cutW, depth - cutD], [width - cutW, depth], [0, depth]];
  const cx = raw.reduce((sum, point) => sum + point[0], 0) / raw.length;
  const cz = raw.reduce((sum, point) => sum + point[1], 0) / raw.length;
  return raw.map(([x, z]) => ({x: x - cx, z: z - cz}));
}

export function roomPoints(project) {
  if (project.shape === 'polygon') return validatePolygon(project.points);
  if (project.shape === 'l') return lPoints(project.width, project.depth, project.cutW, project.cutD);
  const side = project.shape === 'square' ? project.width : project.depth;
  const width = clampDimension(project.width, 'width');
  return rectPoints(width, project.shape === 'square' ? width : clampDimension(side, 'depth'));
}

function clampDimension(value, label) {
  if (!finite(value)) throw Error(`Enter a finite ${label}.`);
  if (value < 1.5 || value > 20) throw Error(`${label[0].toUpperCase()}${label.slice(1)} must be from 1.5 m to 20 m.`);
  return value;
}

export function edges(points) {
  return points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    return {index, a: point, b: next, length: distance(point, next)};
  });
}

export function pointInPolygon(point, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const a = points[i];
    const b = points[j];
    const hit = ((a.z > point.z) !== (b.z > point.z)) && point.x < ((b.x - a.x) * (point.z - a.z)) / (b.z - a.z) + a.x;
    if (hit) inside = !inside;
  }
  return inside;
}

function closestEdgeDistance(point, points) {
  let best = Infinity;
  for (const edge of edges(points)) {
    const dx = edge.b.x - edge.a.x;
    const dz = edge.b.z - edge.a.z;
    const len = dx * dx + dz * dz;
    const t = len === 0 ? 0 : clamp(((point.x - edge.a.x) * dx + (point.z - edge.a.z) * dz) / len, 0, 1);
    best = Math.min(best, Math.hypot(point.x - (edge.a.x + dx * t), point.z - (edge.a.z + dz * t)));
  }
  return best;
}

export function footprint(item) {
  const angle = (item.rotation || 0) * Math.PI / 180;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const hw = item.width / 2;
  const hd = item.depth / 2;
  return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([x, z]) => ({x: item.x + x * c - z * s, z: item.z + x * s + z * c}));
}

function projectAxis(points, axis) {
  let min = Infinity;
  let max = -Infinity;
  for (const point of points) {
    const value = point.x * axis.x + point.z * axis.z;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return [min, max];
}

export function footprintsOverlap(a, b, gap = 0.02) {
  const pa = footprint(a);
  const pb = footprint(b);
  const axes = [0, 90].flatMap(extra => [a, b].map(item => {
    const angle = ((item.rotation || 0) + extra) * Math.PI / 180;
    return {x: Math.cos(angle), z: Math.sin(angle)};
  }));
  return axes.every(axis => {
    const [a0, a1] = projectAxis(pa, axis);
    const [b0, b1] = projectAxis(pb, axis);
    return a0 < b1 - gap && b0 < a1 - gap;
  });
}

function collides(a, b) {
  if (a.place === 'under' || b.place === 'under' || a.place === 'wall' || b.place === 'wall') return false;
  const aTop = (a.elevation || 0) + a.height;
  const bTop = (b.elevation || 0) + b.height;
  const separated = aTop <= (b.elevation || 0) + 0.05 || bTop <= (a.elevation || 0) + 0.05;
  if (a.place === 'surface' || b.place === 'surface' || separated) return false;
  return footprintsOverlap(a, b);
}

export function placementIssues(project, item, points = roomPoints(project)) {
  const issues = [];
  const spec = FURNITURE[item.type];
  const place = item.place || spec?.place || 'floor';
  if (place === 'wall' || place === 'surface') return issues;
  const corners = footprint(item);
  if (corners.some(corner => !pointInPolygon(corner, points))) issues.push('extends outside the room');
  else if (corners.some(corner => closestEdgeDistance(corner, points) < (project.wallThickness || 0.12) / 2)) issues.push('intersects a wall');
  for (const other of project.items) {
    if (other.id !== item.id && collides({...item, place}, {...other, place: other.place || FURNITURE[other.type]?.place})) issues.push('overlaps another floor item');
  }
  for (const opening of project.openings || []) {
    if (opening.kind === 'door' && footprintsOverlap(item, doorSwing(project, opening, points), 0)) issues.push('obstructs a door swing');
  }
  return [...new Set(issues)];
}

export function doorSwing(project, opening, points = roomPoints(project)) {
  const edge = edges(points)[opening.wall];
  if (!edge) return {x: 0, z: 0, width: 0.1, depth: 0.1, rotation: 0};
  const t = (opening.offset + opening.width / 2) / edge.length;
  const x = edge.a.x + (edge.b.x - edge.a.x) * t;
  const z = edge.a.z + (edge.b.z - edge.a.z) * t;
  const angle = Math.atan2(edge.b.z - edge.a.z, edge.b.x - edge.a.x);
  const inward = opening.flip ? angle + Math.PI / 2 : angle - Math.PI / 2;
  return {x: x + Math.cos(inward) * opening.width / 2, z: z + Math.sin(inward) * opening.width / 2, width: opening.width, depth: opening.width, rotation: angle * 180 / Math.PI};
}

export function validateOpening(project, opening, points = roomPoints(project)) {
  const wall = edges(points)[opening.wall];
  if (!wall) throw Error('Choose a wall for this opening.');
  if (!finite(opening.offset) || !finite(opening.width) || !finite(opening.height) || !finite(opening.sill)) throw Error('Opening dimensions must be finite.');
  if (opening.width < 0.4 || opening.height < 0.4 || opening.sill < 0) throw Error('This opening is too small.');
  if (opening.offset < 0.05 || opening.offset + opening.width > wall.length - 0.05) throw Error('The opening does not fit on that wall.');
  if (opening.sill + opening.height > project.height - 0.05) throw Error('The opening is taller than the wall.');
  for (const other of project.openings || []) {
    if (other.id === opening.id || other.wall !== opening.wall) continue;
    const overlap = opening.offset < other.offset + other.width && other.offset < opening.offset + opening.width;
    if (overlap) throw Error('Openings on the same wall cannot overlap.');
  }
  return opening;
}

export function metrics(project) {
  const points = roomPoints(project);
  const area = polygonArea(points);
  const edgeLength = perimeter(points);
  const grossWall = edgeLength * project.height;
  const openingArea = (project.openings || []).reduce((sum, opening) => sum + opening.width * opening.height, 0);
  const floorItems = project.items.filter(item => (item.place || FURNITURE[item.type]?.place) === 'floor');
  let occupied = floorItems.reduce((sum, item) => sum + item.width * item.depth, 0);
  const overlap = floorItems.some((item, index) => floorItems.slice(index + 1).some(other => footprintsOverlap(item, other)));
  occupied = Math.min(occupied, area);
  return {
    area,
    perimeter: edgeLength,
    volume: area * project.height,
    grossWall,
    netWall: Math.max(0, grossWall - openingArea),
    occupied,
    available: Math.max(0, area - occupied),
    occupiedIsEstimate: overlap,
  };
}

const legacyMap = {sofa: 'sofa-3', bed: 'queen-bed', table: 'coffee-table', chair: 'armchair', desk: 'writing-desk', cabinet: 'wardrobe', rug: 'rug-rect'};

function cleanName(value, fallback) {
  const name = String(value ?? fallback).replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
  return name || fallback;
}

function itemFrom(raw, index) {
  const spec = FURNITURE[raw?.type];
  if (!spec) throw Error('This project contains an unknown furniture type.');
  const item = {
    id: cleanName(raw.id, `item-${index + 1}`),
    type: spec.id,
    name: cleanName(raw.name, spec.name),
    x: Number(raw.x) || 0,
    z: Number(raw.z) || 0,
    elevation: finite(raw.elevation) ? raw.elevation : spec.place === 'wall' ? 1.2 : spec.place === 'surface' ? 0.75 : 0,
    width: finite(raw.width) ? raw.width : spec.width,
    depth: finite(raw.depth) ? raw.depth : spec.depth,
    height: finite(raw.height) ? raw.height : spec.height,
    rotation: finite(raw.rotation) ? raw.rotation : 0,
    color: /^#[0-9a-f]{6}$/i.test(raw.color || '') ? raw.color : '#8a7364',
    locked: raw.locked === true,
    place: spec.place,
  };
  if (![item.x, item.z, item.width, item.depth, item.height, item.rotation, item.elevation].every(finite)) throw Error('A furniture value is not a finite number.');
  if (item.width < 0.15 || item.width > 6 || item.depth < 0.04 || item.depth > 6 || item.height < 0.02 || item.height > 3.2) throw Error('A furniture dimension is outside the supported range.');
  if (Math.abs(item.x) > 30 || Math.abs(item.z) > 30 || Math.abs(item.rotation) > 360 || item.elevation < 0 || item.elevation > 3) throw Error('A furniture position is outside the supported range.');
  return item;
}

export function blankProject() {
  return {
    version: 2,
    id: '',
    name: 'Untitled room',
    units: 'ft-in',
    shape: 'rectangle',
    width: 4.8768,
    depth: 3.6576,
    height: 2.7,
    wallThickness: 0.12,
    cutW: 1.8,
    cutD: 1.5,
    points: rectPoints(4.8768, 3.6576),
    wall: '#f3eadf',
    wallColors: [],
    floorMaterial: 'light-oak',
    floor: '#d7b48a',
    lighting: 'daylight',
    lightLevel: 1,
    grid: 0.3048,
    snap: true,
    wallSnap: true,
    rotateSnap: 15,
    strict: false,
    showGrid: true,
    showMeasures: true,
    items: [],
    openings: [],
  };
}

export function validateProject(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('This file is not a room project.');
  const base = blankProject();
  const project = {...base, ...raw, version: 2};
  if (!UNITS.includes(project.units)) project.units = 'ft-in';
  if (!SHAPES.includes(project.shape)) throw Error('This room shape is not supported.');
  project.name = cleanName(project.name, 'Untitled room');
  project.width = clampDimension(Number(project.width), 'width');
  project.depth = project.shape === 'square' ? project.width : clampDimension(Number(project.depth), 'depth');
  project.height = Number(project.height);
  project.wallThickness = Number(project.wallThickness);
  project.cutW = Number(project.cutW);
  project.cutD = Number(project.cutD);
  if (!finite(project.height) || project.height < 2 || project.height > 5) throw Error('Wall height must be from 2 m to 5 m.');
  if (!finite(project.wallThickness) || project.wallThickness < 0.05 || project.wallThickness > 0.4) throw Error('Wall thickness must be from 0.05 m to 0.4 m.');
  if (!/^#[0-9a-f]{6}$/i.test(project.wall) || !/^#[0-9a-f]{6}$/i.test(project.floor)) throw Error('Choose valid wall and floor colors.');
  if (!Array.isArray(project.items) || project.items.length > 80) throw Error('A room can contain up to 80 objects.');
  if (!Array.isArray(project.openings) || project.openings.length > 24) throw Error('A room can contain up to 24 openings.');
  const ids = new Set();
  project.items = project.items.map((item, index) => {
    const next = itemFrom(item, index);
    if (ids.has(next.id)) throw Error('Two objects share the same id.');
    ids.add(next.id);
    return next;
  });
  project.points = roomPoints(project);
  project.openings = project.openings.map((opening, index) => {
    const spec = OPENINGS[opening.type] || OPENINGS['door-single'];
    const next = validateOpening(project, {
      id: cleanName(opening.id, `opening-${index + 1}`),
      type: spec.id,
      name: cleanName(opening.name, spec.name),
      kind: spec.kind,
      wall: Number(opening.wall) || 0,
      offset: Number(opening.offset),
      width: Number(opening.width) || spec.width,
      height: Number(opening.height) || spec.height,
      sill: opening.sill == null ? spec.sill : Number(opening.sill),
      flip: opening.flip === true,
      swing: opening.swing === 'left' ? 'left' : 'right',
    });
    if (ids.has(next.id)) throw Error('Two objects share the same id.');
    ids.add(next.id);
    return next;
  });
  if (!Array.isArray(project.wallColors)) project.wallColors = [];
  project.wallColors = project.points.map((_, index) => /^#[0-9a-f]{6}$/i.test(project.wallColors[index] || '') ? project.wallColors[index] : project.wall);
  project.grid = [0.05, 0.1, 0.25, 0.3048, 0.5, 1].includes(Number(project.grid)) ? Number(project.grid) : 0.3048;
  project.rotateSnap = [5, 15, 45, 90].includes(Number(project.rotateSnap)) ? Number(project.rotateSnap) : 15;
  project.wallSnap = project.wallSnap !== false;
  project.snap = project.snap !== false;
  project.lightLevel = finite(project.lightLevel) ? clamp(project.lightLevel, 0.4, 1.8) : 1;
  if (!LIGHTS.some(([id]) => id === project.lighting)) project.lighting = 'daylight';
  return project;
}

export function migrateLegacy(raw) {
  if (raw?.version === 2) return validateProject(raw);
  const room = validateRoom(raw);
  return validateProject({
    ...blankProject(),
    name: 'Imported room',
    units: 'm',
    shape: 'rectangle',
    width: room.width,
    depth: room.depth,
    height: room.height,
    wall: room.wall,
    floor: room.floor,
    floorMaterial: 'custom',
    items: room.items.map(item => ({
      id: item.id,
      type: legacyMap[item.type],
      name: item.type,
      x: item.x,
      z: item.z,
      width: item.width,
      depth: item.depth,
      height: legacyFurniture[item.type][2],
      rotation: item.rotation,
      color: item.color,
    })),
  });
}

export function createHistory(present) {
  const past = [];
  const future = [];
  return {
    commit(next) {
      past.push(present);
      if (past.length > 80) past.shift();
      future.length = 0;
      present = next;
      return present;
    },
    undo() {
      if (!past.length) return null;
      future.push(present);
      present = past.pop();
      return present;
    },
    redo() {
      if (!future.length) return null;
      past.push(present);
      present = future.pop();
      return present;
    },
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
    peek: () => present,
  };
}

function place(type, id, x, z, rotation = 0, extra = {}) {
  const spec = FURNITURE[type];
  return {id, type, name: spec.name, x, z, rotation, elevation: spec.place === 'wall' ? 1.2 : spec.place === 'surface' ? 0.5 : 0, width: spec.width, depth: spec.depth, height: spec.height, color: extra.color || '#8d7462', locked: false};
}

export const TEMPLATES = [
  {id: 'modern-living', name: 'Modern living room', description: 'A wide sofa, rug and media wall in a 16 by 14 ft room.', build: () => ({...blankProject(), name: 'Modern living room', width: 4.8768, depth: 4.2672, items: [place('rug-rect', 'a', 0, 0.1, 0, {color: '#c7b8a4'}), place('sofa-3', 'b', 0, -1.35), place('coffee-table', 'c', 0, -0.15), place('armchair', 'd', 1.55, 0.2, -25), place('tv-stand', 'e', 0, 1.7), place('television', 'f', 0, 1.68, 0, {color: '#22262e'}), place('floor-lamp', 'g', -1.9, -1.2)]})},
  {id: 'small-living', name: 'Small living room', description: 'A two-seat sofa and compact table for a 12 by 11 ft room.', build: () => ({...blankProject(), name: 'Small living room', width: 3.6576, depth: 3.3528, items: [place('sofa-2', 'a', 0, -1), place('coffee-table', 'b', 0, 0.15, 0, {color: '#d7b48a'}), place('side-table', 'c', 1.15, -0.9), place('floor-lamp', 'd', -1.25, -0.85)]})},
  {id: 'master-bedroom', name: 'Master bedroom', description: 'A queen bed with nightstands and a dresser in a 14 by 13 ft room.', build: () => ({...blankProject(), name: 'Master bedroom', width: 4.2672, depth: 3.9624, wall: '#f7f5f2', items: [place('queen-bed', 'a', 0, -0.35, 0, {color: '#d9d3cb'}), place('nightstand', 'b', -1.15, -0.95), place('nightstand', 'c', 1.15, -0.95), place('dresser', 'd', 0, 1.5), place('rug-rect', 'e', 0, 0.35, 0, {color: '#b7aea2'})]})},
  {id: 'small-bedroom', name: 'Small bedroom', description: 'A full bed and wardrobe arranged to keep a path to the door.', build: () => ({...blankProject(), name: 'Small bedroom', width: 3.6576, depth: 3.3528, items: [place('full-bed', 'a', -0.55, -0.15, 0, {color: '#ece7e1'}), place('nightstand', 'b', 0.7, -0.9), place('wardrobe', 'c', 0.95, 0.95)]})},
  {id: 'studio', name: 'Studio apartment layout', description: 'Sleeping, seating and a desk zone in one 18 by 14 ft room.', build: () => ({...blankProject(), name: 'Studio apartment', width: 5.4864, depth: 4.2672, items: [place('full-bed', 'a', -1.6, -1.1, 0, {color: '#e6e0d8'}), place('nightstand', 'b', -0.7, -1.1), place('sofa-2', 'c', 1.2, 0.3, 90), place('coffee-table', 'd', 0.2, 0.3), place('writing-desk', 'e', 1.7, -1.2), place('office-chair', 'f', 1.7, -0.55)]})},
  {id: 'home-office', name: 'Minimalist home office', description: 'A desk, chair and shelf with clear floor space around the chair.', build: () => ({...blankProject(), name: 'Home office', width: 3.6576, depth: 3.048, items: [place('computer-desk', 'a', 0, -0.85), place('office-chair', 'b', 0, -0.15), place('office-shelf', 'c', -1.3, 0.8), place('filing-cabinet', 'd', 1.25, -0.7)]})},
  {id: 'gaming', name: 'Gaming room', description: 'A desk, seating and a media wall in a 14 by 12 ft room.', build: () => ({...blankProject(), name: 'Gaming room', width: 4.2672, depth: 3.6576, wall: '#243044', floor: '#4d5158', floorMaterial: 'carpet', items: [place('computer-desk', 'a', -1.2, -0.9), place('office-chair', 'b', -1.2, -0.2), place('sofa-2', 'c', 0.7, 0.7), place('tv-stand', 'd', 1.3, -1.3), place('television', 'e', 1.3, -1.28, 0, {color: '#1c2128'})]})},
  {id: 'dining', name: 'Dining room', description: 'A rectangular table, six chair positions and a sideboard.', build: () => ({...blankProject(), name: 'Dining room', width: 4.572, depth: 3.6576, items: [place('dining-rect', 'a', 0, 0, 0, {color: '#a67c52'}), place('dining-chair', 'b', -0.55, -0.7), place('dining-chair', 'c', 0.55, -0.7), place('dining-chair', 'd', -0.55, 0.7, 180), place('dining-chair', 'e', 0.55, 0.7, 180), place('dining-bench', 'f', 0, 0.75, 0), place('sideboard', 'g', 0, -1.45)]})},
  {id: 'compact-kitchen', name: 'Compact kitchen', description: 'A run of cabinets, appliances and an island stool.', build: () => ({...blankProject(), name: 'Compact kitchen', width: 3.6576, depth: 3.048, items: [place('kitchen-counter', 'a', 0, -1.05), place('stove', 'b', -0.4, -1.05), place('kitchen-sink', 'c', 0.55, -1.05), place('refrigerator', 'd', -1.3, -0.95), place('kitchen-island', 'e', 0.2, 0.45), place('bar-stool', 'f', 0.7, 0.95)]})},
  {id: 'guest-bedroom', name: 'Guest bedroom', description: 'A twin bed, bench and small dresser for a spare room.', build: () => ({...blankProject(), name: 'Guest bedroom', width: 3.6576, depth: 3.6576, items: [place('twin-bed', 'a', -0.55, -0.15, 0, {color: '#e7efe8'}), place('storage-bench', 'b', -0.55, 1.05), place('dresser', 'c', 0.95, -0.9), place('plant', 'd', 1.15, 1.15)]})},
];

export function templateProject(id) {
  const template = TEMPLATES.find(item => item.id === id);
  if (!template) throw Error('Unknown room template.');
  return validateProject(template.build());
}

export function addFurniture(project, type, at = {}) {
  const spec = FURNITURE[type];
  if (!spec) throw Error('Unknown furniture.');
  if (project.items.length >= 80) throw Error('This room has reached 80 objects.');
  const item = place(type, cryptoId(), at.x || 0, at.z || 0, 0);
  return {...project, items: [...project.items, item]};
}

export function addOpening(project, type) {
  const spec = OPENINGS[type];
  if (!spec) throw Error('Unknown opening.');
  const points = roomPoints(project);
  const wall = edges(points)[0];
  const opening = {id: cryptoId(), type, name: spec.name, kind: spec.kind, wall: 0, offset: Math.max(0.1, wall.length / 2 - spec.width / 2), width: spec.width, height: spec.height, sill: spec.sill, flip: false, swing: 'right'};
  validateOpening(project, opening, points);
  return {...project, openings: [...project.openings, opening]};
}

export function cryptoId() {
  return globalThis.crypto?.randomUUID?.() || `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function snapValue(value, grid, enabled) {
  if (!enabled || !grid) return value;
  return Math.round(value / grid) * grid;
}

export function snapToWall(project, item, threshold = 0.16) {
  if (!project?.wallSnap) return {x: item.x, z: item.z};
  const points = roomPoints(project);
  let x = item.x;
  let z = item.z;
  for (let pass = 0; pass < 2; pass += 1) {
    const corners = footprint({...item, x, z});
    let best = null;
    for (const edge of edges(points)) {
      const dx = edge.b.x - edge.a.x;
      const dz = edge.b.z - edge.a.z;
      const len = Math.hypot(dx, dz);
      if (len < 0.2) continue;
      const tx = dx / len;
      const tz = dz / len;
      let nx = -tz;
      let nz = tx;
      const midX = (edge.a.x + edge.b.x) / 2;
      const midZ = (edge.a.z + edge.b.z) / 2;
      if (!pointInPolygon({x: midX + nx * 0.05, z: midZ + nz * 0.05}, points)) { nx = -nx; nz = -nz; }
      let gap = Infinity;
      for (const corner of corners) {
        const along = (corner.x - edge.a.x) * tx + (corner.z - edge.a.z) * tz;
        if (along < -0.02 || along > len + 0.02) continue;
        const signed = (corner.x - edge.a.x) * nx + (corner.z - edge.a.z) * nz;
        if (signed < gap) gap = signed;
      }
      if (gap > 0.004 && gap < threshold && (!best || gap < best.gap)) best = {gap, nx, nz};
    }
    if (!best) break;
    x -= best.nx * best.gap;
    z -= best.nz * best.gap;
  }
  return {x, z};
}

export function inventoryCsv(project) {
  const lines = ['type,name,width_m,depth_m,height_m,x_m,z_m,rotation_deg'];
  for (const item of project.items) lines.push([item.type, item.name, item.width, item.depth, item.height, item.x, item.z, item.rotation].map(value => `"${String(value).replace(/"/g, '')}"`).join(','));
  return lines.join('\n');
}

const ascii = value => String(value).normalize('NFKD').replace(/[^\x20-\x7e]/g, '').replace(/[\\()]/g, '\\$&').slice(0, 80);

export function pdfBytes(project, {paper = 'Letter', landscape = true} = {}) {
  const safe = validateProject(project);
  const stats = metrics(safe);
  let [width, height] = paper === 'A4' ? [595.276, 841.89] : [612, 792];
  if (landscape) [width, height] = [height, width];
  const points = safe.points;
  const xs = points.map(point => point.x);
  const zs = points.map(point => point.z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);
  const margin = 36;
  const scale = Math.min((width - margin * 2) / (maxX - minX + 1), (height - 150) / (maxZ - minZ + 1));
  const ox = (width - (maxX - minX) * scale) / 2 - minX * scale;
  const oy = height - 78 + minZ * scale;
  let commands = '';
  const text = (x, y, size, value) => { commands += `BT /F1 ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${ascii(value)}) Tj ET\n`; };
  const xy = point => `${(ox + point.x * scale).toFixed(2)} ${(oy - point.z * scale).toFixed(2)}`;
  text(margin, height - 28, 16, safe.name);
  text(margin, height - 46, 9, `ThreeMelo room plan | ${formatArea(stats.area, safe.units)} | Fit to page, not to scale`);
  commands += `0.93 0.9 0.84 rg 0.25 0.28 0.34 RG 0.8 w ${points.map((point, index) => `${xy(point)} ${index ? 'l' : 'm'}`).join(' ')} h B\n`;
  commands += '0.55 0.45 0.36 rg 0.25 0.28 0.34 RG\n';
  for (const item of safe.items) {
    const box = footprint(item);
    commands += `${box.map((point, index) => `${xy(point)} ${index ? 'l' : 'm'}`).join(' ')} h B\n`;
  }
  text(margin, 42, 8, `Floor ${formatArea(stats.area, safe.units)} | Perimeter ${formatLength(stats.perimeter, safe.units)} | ${safe.items.length} objects`);
  text(margin, 28, 8, 'Planning illustration only. Not a certified architectural drawing.');
  safe.items.slice(0, 18).forEach((item, index) => text(margin, 78 + index * 11, 8, `${item.name}: ${formatLength(item.width, safe.units)} x ${formatLength(item.depth, safe.units)}`));
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${commands.length} >>\nstream\n${commands}endstream`];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}

const PREFS_KEY = 'threemelo-room-prefs';
const FALLBACK_KEY = 'threemelo-room-projects';

export function readPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); } catch { return {}; }
}

export function writePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

function fallbackProjects() {
  try { return JSON.parse(localStorage.getItem(FALLBACK_KEY) || '[]'); } catch { return []; }
}

function openProjectDb() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) { reject(Error('IndexedDB unavailable')); return; }
    const request = indexedDB.open('threemelo-room', 1);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains('projects')) request.result.createObjectStore('projects', {keyPath: 'id'}); };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || Error('Storage failed'));
  });
}

export async function listBrowserProjects() {
  try {
    const database = await openProjectDb();
    const rows = await new Promise((resolve, reject) => {
      const request = database.transaction('projects').objectStore('projects').getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return rows.sort((a, b) => (b.updated || 0) - (a.updated || 0));
  } catch {
    return fallbackProjects();
  }
}

export async function saveBrowserProject(record) {
  const next = {...record, updated: Date.now()};
  try {
    const database = await openProjectDb();
    await new Promise((resolve, reject) => {
      const request = database.transaction('projects', 'readwrite').objectStore('projects').put(next);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    database.close();
    return next;
  } catch {
    try {
      const rows = fallbackProjects().filter(item => item.id !== next.id);
      rows.push(next);
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(rows.slice(-24)));
      return next;
    } catch {
      throw Error('Browser storage refused the save. Export a project file as a backup.');
    }
  }
}

export async function deleteBrowserProject(id) {
  try {
    const database = await openProjectDb();
    await new Promise((resolve, reject) => {
      const request = database.transaction('projects', 'readwrite').objectStore('projects').delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    database.close();
  } catch { /* local fallback still runs */ }
  try { localStorage.setItem(FALLBACK_KEY, JSON.stringify(fallbackProjects().filter(item => item.id !== id))); } catch { /* the IndexedDB copy is already gone */ }
}

export function createMemoryStorage() {
  const records = new Map();
  return {
    async list() { return [...records.values()]; },
    async save(record) {
      if (this.fail) throw Error('Browser storage refused the save. Export a project file as a backup.');
      records.set(record.id, record);
    },
    async remove(id) { records.delete(id); },
    fail: false,
  };
}
