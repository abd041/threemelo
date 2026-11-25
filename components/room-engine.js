import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {FURNITURE, edges, footprint, placementIssues, roomPoints} from '../lib/room-planner.mjs';

const LIGHT = {
  daylight: [0xfff4e5, 0xc5d4e8, 1.15],
  warm: [0xffe0b8, 0x8d7968, 0.85],
  cool: [0xe7f1ff, 0x9eb0c4, 0.9],
  studio: [0xffffff, 0xb7b7c4, 1],
};

export function createRoomStudio(host, handlers = {}) {
  const renderer = new T.WebGLRenderer({antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance'});
  renderer.outputColorSpace = T.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  const scene = new T.Scene();
  scene.background = new T.Color('#d9d4cc');
  const camera = new T.PerspectiveCamera(42, 1, 0.05, 80);
  const ortho = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 80);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.49;
  const hemi = new T.HemisphereLight(0xfff4e5, 0xc5d4e8, 1.1);
  const sun = new T.DirectionalLight(0xffffff, 1.3);
  sun.position.set(4, 8, 3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  scene.add(hemi, sun);
  const group = new T.Group();
  scene.add(group);
  const grid = new T.GridHelper(12, 24, 0x9aa0a8, 0xd5d0c8);
  grid.position.y = 0.004;
  scene.add(grid);
  let project = null;
  let selected = new Set();
  let view = 'perspective';
  let mode = 'move';
  let drag = null;
  let measure = [];
  let frame = 0;
  let alive = 0;
  const materials = new Map();
  const material = color => {
    const key = String(color);
    if (!materials.has(key)) materials.set(key, new T.MeshStandardMaterial({color: key, roughness: 0.72, side: T.DoubleSide}));
    return materials.get(key);
  };
  const box = (parent, w, h, d, x, y, z, color) => {
    const mesh = new T.Mesh(new T.BoxGeometry(Math.max(w, 0.02), Math.max(h, 0.02), Math.max(d, 0.02)), material(color));
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };
  function clearGroup() {
    group.traverse(object => object.geometry?.dispose());
    group.clear();
  }
  function activeCamera() { return view === 'top' ? ortho : camera; }
  function mark() { alive = performance.now() + 900; }
  function applyQuality(level) {
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const choice = level === 'auto' || !level ? (mobile || navigator.hardwareConcurrency <= 4 ? 'performance' : 'balanced') : level;
    const ratio = choice === 'high' ? 1.75 : choice === 'performance' ? 1 : 1.35;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, ratio));
    renderer.shadowMap.enabled = choice !== 'performance';
    sun.castShadow = choice !== 'performance';
    mark();
  }
  function furnish(item) {
    const g = new T.Group();
    g.userData.id = item.id;
    g.position.set(item.x, item.elevation || 0, item.z);
    g.rotation.y = -item.rotation * Math.PI / 180;
    const {width: w, depth: d, height: h, color: c} = item;
    const kind = FURNITURE[item.type]?.kind || 'storage';
    if (kind === 'sofa' || kind === 'chair' || kind === 'sectional') {
      box(g, w, h * 0.42, d, 0, h * 0.21, 0, c);
      box(g, w, h * 0.5, d * 0.18, 0, h * 0.62, -d * 0.4, c);
      if (kind !== 'chair') { box(g, w * 0.1, h * 0.35, d, -w * 0.45, h * 0.5, 0, c); box(g, w * 0.1, h * 0.35, d, w * 0.45, h * 0.5, 0, c); }
      if (kind === 'sectional') box(g, w * 0.42, h * 0.42, d * 0.7, w * 0.28, h * 0.21, d * 0.15, c);
    } else if (kind === 'bed') {
      box(g, w, 0.18, d, 0, 0.09, 0, '#6d5a4b');
      box(g, w * 0.94, 0.18, d * 0.9, 0, 0.27, 0.02, '#f4f1ec');
      box(g, w, h, 0.08, 0, h / 2, -d / 2 + 0.04, c);
    } else if (kind === 'table') {
      box(g, w, 0.06, d, 0, h - 0.03, 0, c);
      for (const x of [-1, 1]) for (const z of [-1, 1]) box(g, 0.06, h - 0.06, 0.06, x * (w / 2 - 0.08), (h - 0.06) / 2, z * (d / 2 - 0.08), '#5c4636');
    } else if (kind === 'rug') box(g, w, h, d, 0, h / 2, 0, c);
    else if (kind === 'lamp') { box(g, 0.08, h * 0.75, 0.08, 0, h * 0.38, 0, '#444'); box(g, Math.min(w, 0.4), h * 0.22, Math.min(d, 0.4), 0, h * 0.82, 0, c); }
    else if (kind === 'plant') { box(g, w * 0.45, h * 0.25, d * 0.45, 0, h * 0.12, 0, '#6b4b32'); box(g, w, h * 0.7, d, 0, h * 0.55, 0, '#4f7a45'); }
    else if (kind === 'screen' || kind === 'art') box(g, w, h, Math.max(d, 0.04), 0, h / 2, 0, c);
    else box(g, w, h, d, 0, h / 2, 0, c);
    group.add(g);
    if (selected.has(item.id)) {
      const issues = placementIssues(project, item);
      const loop = new T.LineLoop(new T.BufferGeometry().setFromPoints(footprint(item).map(point => new T.Vector3(point.x, 0.03, point.z))), new T.LineBasicMaterial({color: issues.length ? 0xb45309 : 0x6d28d9}));
      group.add(loop);
    }
  }
  function update(next, ids = []) {
    project = next;
    selected = new Set(ids);
    clearGroup();
    const points = roomPoints(project);
    const shape = new T.Shape();
    points.forEach((point, index) => index ? shape.lineTo(point.x, -point.z) : shape.moveTo(point.x, -point.z));
    const floor = new T.Mesh(new T.ShapeGeometry(shape), material(project.floor));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    group.add(floor);
    const [sky, ground, level] = LIGHT[project.lighting] || LIGHT.daylight;
    hemi.color.setHex(sky);
    hemi.groundColor.setHex(ground);
    hemi.intensity = 0.8 * (project.lightLevel || 1);
    sun.intensity = 1.25 * (project.lightLevel || 1);
    for (const edge of edges(points)) {
      const openings = (project.openings || []).filter(opening => opening.wall === edge.index).sort((a, b) => a.offset - b.offset);
      const pieces = [];
      let cursor = 0;
      for (const opening of openings) {
        if (opening.offset > cursor) pieces.push([cursor, opening.offset, 0, project.height]);
        if (opening.sill > 0.02) pieces.push([opening.offset, opening.offset + opening.width, 0, opening.sill]);
        const top = opening.sill + opening.height;
        if (project.height - top > 0.02) pieces.push([opening.offset, opening.offset + opening.width, top, project.height - top]);
        cursor = opening.offset + opening.width;
      }
      if (edge.length - cursor > 0.02) pieces.push([cursor, edge.length, 0, project.height]);
      const angle = Math.atan2(edge.b.z - edge.a.z, edge.b.x - edge.a.x);
      for (const [from, to, y, h] of pieces) {
        const mid = (from + to) / 2;
        const mesh = box(group, to - from, h, project.wallThickness, edge.a.x + Math.cos(angle) * mid, y + h / 2, edge.a.z + Math.sin(angle) * mid, project.wallColors?.[edge.index] || project.wall);
        mesh.rotation.y = -angle;
      }
      if (view === 'top') {
        for (const opening of openings.filter(item => item.kind === 'door')) {
          const start = opening.offset / edge.length;
          const a = {x: edge.a.x + (edge.b.x - edge.a.x) * start, z: edge.a.z + (edge.b.z - edge.a.z) * start};
          const swing = opening.flip ? angle + Math.PI / 2 : angle - Math.PI / 2;
          const tip = {x: a.x + Math.cos(swing) * opening.width, z: a.z + Math.sin(swing) * opening.width};
          const line = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(a.x, 0.05, a.z), new T.Vector3(tip.x, 0.05, tip.z)]), new T.LineBasicMaterial({color: 0x9a6b32}));
          group.add(line);
        }
      }
    }
    for (const item of project.items) furnish(item);
    if (measure.length === 2) {
      const line = new T.Line(new T.BufferGeometry().setFromPoints(measure.map(point => new T.Vector3(point.x, 0.06, point.z))), new T.LineBasicMaterial({color: 0x0f766e}));
      group.add(line);
    }
    grid.visible = project.showGrid !== false;
    const span = Math.max(...points.map(point => Math.hypot(point.x, point.z)), 2);
    grid.scale.setScalar(span / 6);
    mark();
  }
  function fit(nextView = view) {
    view = nextView;
    if (!project) return;
    const span = Math.max(project.width, project.depth, 2);
    controls.target.set(0, project.height * 0.35, 0);
    if (view === 'top') {
      const pad = span * 0.72;
      ortho.left = -pad; ortho.right = pad; ortho.top = pad; ortho.bottom = -pad;
      ortho.position.set(0, 24, 0);
      ortho.up.set(0, 0, -1);
      ortho.lookAt(0, 0, 0);
      ortho.updateProjectionMatrix();
      controls.object = ortho;
      controls.enableRotate = false;
    } else {
      const position = view === 'front' ? [0, project.height * 0.7, span * 1.45] : view === 'side' ? [span * 1.45, project.height * 0.7, 0] : [span * 0.85, span * 0.72, span * 0.9];
      camera.position.set(...position);
      controls.object = camera;
      controls.enableRotate = true;
      camera.updateProjectionMatrix();
    }
    controls.update();
    mark();
  }
  function resize() {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    mark();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  applyQuality('auto');
  const ray = new T.Raycaster();
  const plane = new T.Plane(new T.Vector3(0, 1, 0), 0);
  const pointer = new T.Vector2();
  function cast(event) {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    ray.setFromCamera(pointer, activeCamera());
  }
  function floorPoint(event) {
    cast(event);
    return ray.ray.intersectPlane(plane, new T.Vector3());
  }
  function down(event) {
    if (event.button != null && event.button !== 0) return;
    const point = floorPoint(event);
    cast(event);
    let id = null;
    for (const hit of ray.intersectObjects(group.children, true)) {
      let object = hit.object;
      while (object && !object.userData.id) object = object.parent;
      if (object?.userData.id) { id = object.userData.id; break; }
    }
    if (handlers.measuring && point) {
      measure = measure.length >= 2 ? [point] : [...measure, point];
      if (measure.length === 2) handlers.onMeasure?.(Math.hypot(measure[0].x - measure[1].x, measure[0].z - measure[1].z));
      update(project, [...selected]);
      return;
    }
    handlers.onSelect?.(id, event.shiftKey);
    const item = project?.items.find(entry => entry.id === id);
    if (item && !item.locked && point) {
      drag = {id, mode, x: point.x, z: point.z, item: {...item}};
      controls.enabled = false;
      renderer.domElement.setPointerCapture?.(event.pointerId);
    }
  }
  function move(event) {
    if (!drag || !project) return;
    const point = floorPoint(event);
    if (!point) return;
    handlers.onDrag?.(drag.id, {mode: drag.mode, dx: point.x - drag.x, dz: point.z - drag.z, origin: drag.item, shift: event.shiftKey});
  }
  function up() { if (!drag) return; const done = drag; drag = null; controls.enabled = true; handlers.onDragEnd?.(done.id); }
  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); handlers.onLost?.(); });
  canvas.addEventListener('webglcontextrestored', () => { applyQuality('auto'); mark(); });
  canvas.addEventListener('touchstart', event => { if (event.touches.length === 1) event.preventDefault(); }, {passive: false});
  function tick(now) {
    frame = requestAnimationFrame(tick);
    const bounds = host.getBoundingClientRect();
    const visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    if (!visible || now > alive) return;
    controls.update();
    renderer.render(scene, activeCamera());
  }
  frame = requestAnimationFrame(tick);
  return {
    update, fit, mark,
    setMode(next) { mode = next; },
    setMeasuring(value) { if (!value) measure = []; },
    quality: applyQuality,
    capture(w, h) {
      const previous = renderer.getSize(new T.Vector2());
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, activeCamera());
      const url = canvas.toDataURL('image/png');
      renderer.setSize(previous.x, previous.y, false);
      resize();
      return url;
    },
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      clearGroup();
      materials.forEach(entry => entry.dispose());
      renderer.dispose();
      canvas.remove();
    },
  };
}
