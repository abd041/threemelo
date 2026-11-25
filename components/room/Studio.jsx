'use client';
import {useEffect, useRef, useState} from 'react';
import {trackDownload, track} from '../../lib/analytics.mjs';
import {FLOORS, FURNITURE, OPENINGS, TEMPLATES, WALL_COLORS, addFurniture, addOpening, blankProject, createHistory, cryptoId, deleteBrowserProject, formatArea, inventoryCsv, listBrowserProjects, metrics, migrateLegacy, parseLength, pdfBytes, placementIssues, readPrefs, rectPoints, saveBrowserProject, snapToWall, snapValue, templateProject, validateProject, writePrefs} from '../../lib/room-planner.mjs';
import Library from './Library.jsx';
import Inspector from './Inspector.jsx';

const roomEvent = (name, detail) => track(name, {tool: '3d-room-planner', detail});

export default function Studio() {
  const host = useRef(null);
  const shell = useRef(null);
  const engine = useRef(null);
  const history = useRef(null);
  const projectRef = useRef(validateProject(blankProject()));
  const fileRef = useRef(null);
  const [project, setProject] = useState(projectRef.current);
  const [selected, setSelected] = useState([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState('');
  const [status, setStatus] = useState('Not saved yet');
  const [view, setView] = useState('perspective');
  const [mode, setMode] = useState('move');
  const [sheet, setSheet] = useState('');
  const [dialog, setDialog] = useState('');
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [recent, setRecent] = useState([]);
  const [measureOn, setMeasureOn] = useState(false);
  const [distance, setDistance] = useState(null);
  const [pending, setPending] = useState(null);
  const [quality, setQuality] = useState('auto');
  const [paper, setPaper] = useState('Letter');
  const [landscape, setLandscape] = useState(true);
  const selectedRef = useRef([]);
  const origins = useRef({});
  const transient = useRef(false);
  const hydrated = useRef(false);

  function publish(next, record) {
    const safe = validateProject(next);
    if (record) {
      const base = history.current.peek();
      if (JSON.stringify(base) !== JSON.stringify(safe)) history.current.commit(safe);
      transient.current = false;
    } else transient.current = true;
    projectRef.current = record ? history.current.peek() : safe;
    setProject(projectRef.current);
    return projectRef.current;
  }
  function commit(recipe) {
    const base = transient.current ? history.current.peek() : projectRef.current;
    return publish(recipe(structuredClone(base)), true);
  }
  function preview(recipe) {
    return publish(recipe(structuredClone(projectRef.current)), false);
  }
  function remember(type) {
    const prefs = readPrefs();
    const next = [type, ...(prefs.recent || [])].filter((id, index, list) => list.indexOf(id) === index).slice(0, 6);
    writePrefs({...prefs, recent: next});
    setRecent(next);
  }
  function select(id, shift = false) {
    const current = selectedRef.current;
    const next = !id ? (shift ? current : []) : shift ? (current.includes(id) ? current.filter(item => item !== id) : [...current, id]) : [id];
    selectedRef.current = next;
    setSelected(next);
    origins.current = Object.fromEntries(projectRef.current.items.filter(item => next.includes(item.id)).map(item => [item.id, {...item}]));
  }
  function drag(id, change) {
    const grid = projectRef.current.snap && !change.shift ? projectRef.current.grid : 0;
    try {
      preview(draft => {
        draft.items = draft.items.map(item => {
          const origin = origins.current[item.id];
          if (!origin || item.locked) return item;
          if (change.mode === 'rotate') return {...item, rotation: snapValue(origin.rotation + change.dx * 48, projectRef.current.rotateSnap, projectRef.current.snap)};
          if (change.mode === 'scale') {
            const width = Math.min(6, Math.max(0.2, origin.width + change.dx));
            const ratio = width / origin.width;
            return {...item, width, depth: origin.depth * ratio, height: origin.height * ratio};
          }
          const moved = {x: snapValue(origin.x + change.dx, grid, !!grid), z: snapValue(origin.z + change.dz, grid, !!grid)};
          const against = projectRef.current.wallSnap && grid ? snapToWall(projectRef.current, {...item, ...moved}) : moved;
          return {...item, x: against.x, z: against.z};
        });
        return draft;
      });
    } catch (error) { setStatus(error.message); }
  }
  function endDrag() {
    const next = projectRef.current;
    const blocked = next.strict && next.items.some(item => selectedRef.current.includes(item.id) && placementIssues(next, item).length);
    if (blocked) {
      projectRef.current = history.current.peek();
      setProject(projectRef.current);
      transient.current = false;
      setStatus('Strict placement kept the previous position. Warnings are planning aids, not code checks.');
      return;
    }
    if (JSON.stringify(history.current.peek()) !== JSON.stringify(next)) {
      history.current.commit(next);
      projectRef.current = history.current.peek();
      setProject(projectRef.current);
    }
    transient.current = false;
  }
  function undo() {
    const next = history.current.undo();
    if (!next) return;
    projectRef.current = next;
    setProject(next);
    transient.current = false;
  }
  function redo() {
    const next = history.current.redo();
    if (!next) return;
    projectRef.current = next;
    setProject(next);
  }
  function add(type, at) {
    try {
      const next = commit(draft => OPENINGS[type] ? addOpening(draft, type) : addFurniture(draft, type, at));
      const created = OPENINGS[type] ? next.openings.at(-1) : next.items.at(-1);
      if (created) select(created.id);
      remember(type);
      roomEvent('furniture_added', type);
      setSheet('');
    } catch (error) { setStatus(error.message); }
  }
  async function refreshProjects() { setProjects(await listBrowserProjects()); }
  async function persist(manual) {
    try {
      const current = validateProject(projectRef.current);
      const id = current.id || cryptoId();
      let thumbnail = current.thumbnail || '';
      if (manual && engine.current) { try { thumbnail = engine.current.capture(320, 180); } catch { thumbnail = ''; } }
      const saved = await saveBrowserProject({...current, id, thumbnail: thumbnail || current.thumbnail || ''});
      if (!current.id) {
        projectRef.current = {...projectRef.current, id: saved.id};
        setProject(projectRef.current);
      }
      writePrefs({...readPrefs(), lastId: saved.id, recent});
      setStatus(manual ? 'Saved in this browser.' : 'Saved automatically in this browser.');
      if (manual) roomEvent('project_saved', 'manual');
      await refreshProjects();
    } catch (error) { setStatus(error.message); }
  }
  function loadProject(record, eventName) {
    const next = validateProject(record);
    history.current = createHistory(next);
    projectRef.current = next;
    setProject(next);
    select(null);
    writePrefs({...readPrefs(), lastId: next.id});
    setDialog('');
    setStatus(`Opened ${next.name}.`);
    if (eventName) roomEvent(eventName, 'local');
  }
  function ask(kind, id) {
    if (projectRef.current.items.length || projectRef.current.openings.length) setPending({kind, id});
    else applyPending({kind, id});
  }
  function applyPending(request) {
    try {
      if (request.kind === 'template') loadProject({...templateProject(request.id), id: ''}, null);
      if (request.kind === 'template') roomEvent('room_template_loaded', request.id);
      if (request.kind === 'blank') loadProject({...blankProject(), id: ''});
      setPending(null);
      setDialog('');
    } catch (error) { setStatus(error.message); }
  }
  function download(blob, name, event, detail) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    trackDownload(a.download);a.click();
    roomEvent(event, detail);
    if (event !== 'project_exported') roomEvent('project_exported', detail);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setStatus('Download started. Your browser confirms the file.');
  }
  function exportPng(width, height, detail) {
    if (!engine.current) { setFailed('The 3D view is unavailable, so this image cannot be rendered.'); return; }
    try {
      const url = engine.current.capture(width, height);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'threemelo-room.png';
      trackDownload(a.download);a.click();
      roomEvent('png_download', detail);
      setStatus('PNG download started from the current view.');
    } catch (error) { setStatus(error.message || 'This resolution is not available on this device.'); }
  }

  useEffect(() => {
    let gone = false;
    history.current = createHistory(projectRef.current);
    (async () => {
      try {
        const prefs = readPrefs();
        setRecent(prefs.recent || []);
        if (!prefs.helpSeen) setDialog('help');
        const rows = await listBrowserProjects();
        if (gone) return;
        setProjects(rows);
        const last = rows.find(item => item.id === prefs.lastId) || rows[0];
        if (last) loadProject(last);
        else {
          const legacy = localStorage.getItem('tm-room');
          if (legacy) loadProject(migrateLegacy(JSON.parse(legacy)));
        }
      } catch { /* start from the blank room already on screen */ }
      hydrated.current = true;
      roomEvent('room_planner_start', 'editor');
    })();
    import('../room-engine.js').then(mod => {
      if (gone || !host.current) return;
      engine.current = mod.createRoomStudio(host.current, {
        onSelect: (id, shift) => select(id, shift),
        onDrag: (id, change) => drag(id, change),
        onDragEnd: endDrag,
        onMeasure: value => { setDistance(value); roomEvent('measurement_tool_used', 'distance'); },
        onLost: () => setFailed('The 3D view was interrupted. Dimensions, the object list and export still work.'),
      });
      engine.current.update(projectRef.current, []);
      engine.current.fit('perspective');
      setReady(true);
    }).catch(error => setFailed(`3D preview unavailable: ${error.message}`));
    return () => { gone = true; engine.current?.dispose(); engine.current = null; };
  }, []);
  useEffect(() => { if (ready) engine.current?.update(project, selected); }, [ready, project, selected, view]);
  useEffect(() => { engine.current?.quality(quality); }, [ready, quality]);
  useEffect(() => {
    if (!dialog && !pending) return undefined;
    const node = shell.current?.querySelector('.rp-dialog');
    const previous = document.activeElement;
    node?.querySelector('button,input,select')?.focus();
    return () => { if (previous instanceof HTMLElement) previous.focus(); };
  }, [dialog, pending]);
  useEffect(() => { if (ready) { engine.current?.fit(view); engine.current?.setMode(mode); engine.current?.setMeasuring(measureOn); } }, [ready, view, mode, measureOn]);
  useEffect(() => {
    if (!hydrated.current || (!project.id && !project.items.length && !project.openings.length)) return undefined;
    const timer = setTimeout(() => persist(false), 1500);
    return () => clearTimeout(timer);
  }, [project]);
  useEffect(() => {
    function onKey(event) {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
      if (event.key === 'Escape') { select(null); setDialog(''); setPending(null); return; }
      if (typing) return;
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'z' && event.shiftKey) { event.preventDefault(); redo(); }
      else if (meta && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(); }
      else if (meta && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
      else if (meta && event.key.toLowerCase() === 'd') { event.preventDefault(); act('duplicate'); }
      else if (event.key === 'Delete') { event.preventDefault(); act('delete'); }
      else if (event.key === 'f') { engine.current?.fit(view); }
      else if (event.key === 'g') commit(draft => ({...draft, showGrid: !draft.showGrid}));
      else if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        const step = (event.shiftKey ? projectRef.current.grid * 4 : projectRef.current.grid) || 0.1;
        const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0;
        const dz = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0;
        commit(draft => { draft.items = draft.items.map(item => selectedRef.current.includes(item.id) && !item.locked ? {...item, x: item.x + dx, z: item.z + dz} : item); return draft; });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view]);
  function act(action, id) {
    if (action === 'select') { select(id); return; }
    if (action === 'clear') { select(null); return; }
    if (action === 'delete') {
      commit(draft => ({...draft, items: draft.items.filter(item => !selectedRef.current.includes(item.id)), openings: draft.openings.filter(item => !selectedRef.current.includes(item.id))}));
      roomEvent('furniture_removed', 'selection');
      select(null);
      return;
    }
    if (action === 'duplicate') {
      commit(draft => { draft.items = [...draft.items, ...draft.items.filter(item => selectedRef.current.includes(item.id)).map(item => ({...item, id: cryptoId(), x: item.x + 0.3, locked: false}))]; return draft; });
      return;
    }
    if (action === 'lock') { commit(draft => { const lock = !draft.items.filter(item => selectedRef.current.includes(item.id)).every(item => item.locked); draft.items = draft.items.map(item => selectedRef.current.includes(item.id) ? {...item, locked: lock} : item); return draft; }); return; }
    if (action === 'reset-size') { commit(draft => { draft.items = draft.items.map(item => selectedRef.current.includes(item.id) ? {...item, width: FURNITURE[item.type].width, depth: FURNITURE[item.type].depth, height: FURNITURE[item.type].height} : item); return draft; }); return; }
    if (action === 'reset-rotation') { commit(draft => { draft.items = draft.items.map(item => selectedRef.current.includes(item.id) ? {...item, rotation: 0} : item); return draft; }); }
  }
  function onRoom(patch, record = true) {
    const run = record ? commit : preview;
    try {
      run(draft => {
        if (patch.name != null) draft.name = patch.name;
        if (patch.units) { draft.units = patch.units; roomEvent('room_dimensions_changed', patch.units); }
        if (patch.shape) { draft.shape = patch.shape; if (patch.shape === 'square') draft.depth = draft.width; if (patch.shape === 'polygon') draft.points = rectPoints(draft.width, draft.depth); roomEvent('room_shape_changed', patch.shape); }
        if (patch.width != null) { draft.width = typeof patch.width === 'number' ? patch.width : parseLength(patch.width, draft.units); if (draft.shape === 'square') draft.depth = draft.width; roomEvent('room_dimensions_changed', 'width'); }
        if (patch.depth != null) { draft.depth = parseLength(patch.depth, draft.units); roomEvent('room_dimensions_changed', 'length'); }
        if (patch.height != null) draft.height = parseLength(patch.height, draft.units);
        if (patch.wallThickness != null) draft.wallThickness = parseLength(patch.wallThickness, draft.units);
        if (patch.cutW != null) draft.cutW = parseLength(patch.cutW, draft.units);
        if (patch.cutD != null) draft.cutD = parseLength(patch.cutD, draft.units);
        if (patch.floorMaterial && patch.floorMaterial !== 'custom') { draft.floorMaterial = patch.floorMaterial; draft.floor = FLOORS.find(([id]) => id === patch.floorMaterial)[2]; }
        if (patch.floor) draft.floor = patch.floor;
        if (patch.wallPreset && patch.wallPreset !== 'custom') draft.wall = WALL_COLORS.find(([id]) => id === patch.wallPreset)[2];
        if (patch.wall) { draft.wall = patch.wall; draft.wallColors = draft.points.map(() => patch.wall); }
        if (patch.lighting) draft.lighting = patch.lighting;
        if (patch.lightLevel != null) draft.lightLevel = patch.lightLevel;
        if (patch.grid != null) draft.grid = patch.grid;
        if (patch.snap != null) draft.snap = patch.snap;
        if (patch.wallSnap != null) draft.wallSnap = patch.wallSnap;
        if (patch.rotateSnap != null) draft.rotateSnap = patch.rotateSnap;
        if (patch.wallColorIndex != null && /^#[0-9a-f]{6}$/i.test(patch.wallColor || '')) {
          const colors = draft.points.map((_, index) => draft.wallColors[index] || draft.wall);
          colors[patch.wallColorIndex] = patch.wallColor;
          draft.wallColors = colors;
        }
        if (patch.strict != null) draft.strict = patch.strict;
        if (patch.showGrid != null) draft.showGrid = patch.showGrid;
        if (patch.showMeasures != null) draft.showMeasures = patch.showMeasures;
        return draft;
      });
    } catch (error) { setStatus(error.message); }
  }
  function onItem(id, patch) {
    try {
      commit(draft => { draft.items = draft.items.map(item => item.id === id ? {...item, ...parsed(item, patch, draft.units)} : item); return draft; });
    } catch (error) { setStatus(error.message); }
  }
  function onOpening(id, patch) {
    try { commit(draft => { draft.openings = draft.openings.map(item => item.id === id ? {...item, ...parsed(item, patch, draft.units)} : item); return draft; }); }
    catch (error) { setStatus(error.message); }
  }
  function onPoint(index, key, value) {
    try {
      commit(draft => {
        if (key === 'add') draft.points = [...draft.points, {x: draft.points[0].x + 0.6, z: draft.points[0].z + 0.6}];
        else if (key === 'remove') draft.points = draft.points.filter((_, pointIndex) => pointIndex !== index);
        else draft.points = draft.points.map((point, pointIndex) => pointIndex === index ? {...point, [key]: parseLength(value, draft.units)} : point);
        draft.shape = 'polygon';
        return draft;
      });
    } catch (error) { setStatus(error.message); }
  }
  function changeView(next) { setView(next); roomEvent('view_mode_changed', next); }
  const stats = (() => { try { return metrics(project); } catch { return null; } })();
  const selectedItem = project.items.find(item => item.id === selected[0]);
  const warning = selectedItem ? placementIssues(project, selectedItem)[0] : '';
  return <section className="rp-studio" ref={shell} aria-label="3D room planner">
    <div className="rp-toolbar" role="toolbar" aria-label="Editor">
      <button type="button" onClick={() => ask('blank')}>New</button>
      <button type="button" onClick={() => setDialog('templates')}>Templates</button>
      <button type="button" onClick={undo} disabled={!history.current?.canUndo()}>Undo</button>
      <button type="button" onClick={redo} disabled={!history.current?.canRedo()}>Redo</button>
      <button type="button" onClick={() => persist(true)}>Save</button>
      <button type="button" onClick={() => { setDialog('projects'); refreshProjects(); }}>Open</button>
      <button type="button" onClick={() => setDialog('export')}>Export</button>
      <label>View<select value={view} onChange={event => changeView(event.target.value)}><option value="perspective">Perspective</option><option value="top">Top</option><option value="front">Front</option><option value="side">Side</option></select></label>
      <button type="button" aria-pressed={mode === 'move'} onClick={() => setMode('move')}>Move</button>
      <button type="button" aria-pressed={mode === 'rotate'} onClick={() => setMode('rotate')}>Rotate</button>
      <button type="button" aria-pressed={mode === 'scale'} onClick={() => setMode('scale')}>Scale</button>
      <button type="button" onClick={() => engine.current?.fit(view)}>Fit</button>
      <button type="button" aria-pressed={project.showGrid} onClick={() => onRoom({showGrid: !project.showGrid})}>Grid</button>
      <label>Quality<select value={quality} onChange={event => setQuality(event.target.value)}><option value="auto">Auto</option><option value="performance">Performance</option><option value="balanced">Balanced</option><option value="high">High quality</option></select></label>
      <button type="button" aria-pressed={measureOn} onClick={() => { setMeasureOn(value => !value); setDistance(null); }}>Measure</button>
      <button type="button" onClick={() => { const node = shell.current; if (!node?.requestFullscreen) { setStatus('Fullscreen is not available in this browser.'); return; } node.requestFullscreen().then(() => roomEvent('fullscreen_enabled', 'editor')).catch(() => setStatus('Fullscreen was blocked by the browser.')); }}>Fullscreen</button>
      <button type="button" onClick={() => setDialog('help')}>Help</button>
    </div>
    <div className={`rp-body ${sheet ? `sheet-${sheet}` : ''}`}>
      <Library query={query} onQuery={setQuery} recent={recent} onAdd={add}/>
      <div className="rp-stage" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const id = event.dataTransfer.getData('text/plain'); if (FURNITURE[id] || OPENINGS[id]) add(id); }}>
        <div className="rp-viewport" ref={host} role="img" aria-label="Room preview. Use the object list to edit without the canvas.">{!ready && !failed && <p className="rp-loading">Loading the 3D workspace…</p>}{!!failed && <p className="rp-fallback" role="alert">{failed}</p>}</div>
        <p className="rp-compass" aria-live="polite">{view} view{project.showMeasures ? ` · ${formatArea(stats?.area || 0, project.units)}` : ''}{distance != null ? ` · measured ${distance.toFixed(2)} m` : ''}</p>
      </div>
      <Inspector project={project} selected={selected} onRoom={onRoom} onItem={onItem} onOpening={onOpening} onPoint={onPoint} onAction={act}/>
    </div>
    <div className="rp-mobile" role="toolbar" aria-label="Mobile editor">
      {['library', 'room', 'edit', 'view', 'export'].map(id => <button key={id} type="button" aria-pressed={sheet === id} onClick={() => { if (id === 'view') changeView(view === 'perspective' ? 'top' : 'perspective'); else if (id === 'export') setDialog('export'); else setSheet(sheet === id ? '' : id); }}>{id === 'library' ? 'Furniture' : id[0].toUpperCase() + id.slice(1)}</button>)}
    </div>
    <footer className="rp-status"><span>{stats ? formatArea(stats.area, project.units) : 'Invalid outline'}</span><span>{project.items.length === 1 ? '1 object' : `${project.items.length} objects`}</span><span>{selectedItem ? `${selectedItem.name} ${selectedItem.width.toFixed(2)} × ${selectedItem.depth.toFixed(2)} m` : 'Nothing selected'}</span><span>{view}</span><span>Grid {project.grid} m</span><span>{status}</span>{!!warning && <span className="rp-warning">{warning}</span>}</footer>
    {dialog === 'templates' && <div className="rp-dialog" role="dialog" aria-modal="true" aria-labelledby="rp-templates"><h2 id="rp-templates">Room templates</h2><p>Templates load editable furniture, not pictures. Replacing the current room asks for confirmation.</p><ul>{TEMPLATES.map(template => <li key={template.id}><button type="button" onClick={() => ask('template', template.id)}><strong>{template.name}</strong><span>{template.description}</span></button></li>)}</ul><button type="button" onClick={() => setDialog('')}>Close</button></div>}
    {dialog === 'projects' && <div className="rp-dialog" role="dialog" aria-modal="true" aria-labelledby="rp-projects"><h2 id="rp-projects">Projects in this browser</h2><p>Your room designs are saved in this browser on your device. They are not uploaded to our servers. Export a project file to keep a backup or move your design to another device.</p>{!projects.length && <p className="rp-empty">No saved projects yet.</p>}<ul>{projects.map(item => <li key={item.id}><button type="button" onClick={() => loadProject(item, 'project_opened')}><strong>{item.name}</strong><span>{new Date(item.updated || Date.now()).toLocaleString()}</span></button><button type="button" onClick={() => { const name = prompt('Project name', item.name); if (name) saveBrowserProject({...item, name}).then(refreshProjects); }}>Rename</button><button type="button" onClick={() => saveBrowserProject({...item, id: cryptoId(), name: `${item.name} copy`}).then(refreshProjects)}>Duplicate</button><button type="button" onClick={() => deleteBrowserProject(item.id).then(refreshProjects)}>Delete</button></li>)}</ul><button type="button" onClick={() => setDialog('')}>Close</button></div>}
    {dialog === 'export' && <div className="rp-dialog" role="dialog" aria-modal="true" aria-labelledby="rp-export"><h2 id="rp-export">Export</h2><p>PNG uses the current view. PDF is a fitted planning illustration, not a scaled architectural drawing.</p><div className="rp-export-row">{[[1280, 720, '720'], [1920, 1080, '1080'], [2560, 1440, '1440'], [3840, 2160, '2160']].map(([width, height, detail]) => <button key={detail} type="button" onClick={() => exportPng(width, height, detail)}>{width} × {height}</button>)}</div><label>Paper<select value={paper} onChange={event => setPaper(event.target.value)}><option>Letter</option><option>A4</option></select></label><label className="rp-check"><input type="checkbox" checked={landscape} onChange={event => setLandscape(event.target.checked)}/>Landscape</label><button type="button" onClick={() => download(new Blob([pdfBytes(project, {paper, landscape})], {type: 'application/pdf'}), 'threemelo-room.pdf', 'pdf_download', 'pdf')}>Download PDF</button><button type="button" onClick={() => download(new Blob([JSON.stringify(validateProject(project), null, 2)], {type: 'application/json'}), 'threemelo-room.json', 'json_download', 'json')}>Download JSON</button><button type="button" onClick={() => download(new Blob([inventoryCsv(project)], {type: 'text/csv'}), 'threemelo-room.csv', 'project_exported', 'csv')}>Download CSV</button><button type="button" onClick={() => fileRef.current?.click()}>Import JSON</button><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={async event => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; try { if (file.size > 1500000) throw Error('That project file is larger than 1.5 MB.'); const raw = JSON.parse(await file.text()); loadProject(raw.version === 2 ? validateProject(raw) : migrateLegacy(raw), 'project_imported'); } catch (error) { setStatus(error.message || 'That file is not a valid room project.'); } }}/><button type="button" onClick={() => setDialog('')}>Close</button></div>}
    {dialog === 'help' && <div className="rp-dialog" role="dialog" aria-modal="true" aria-labelledby="rp-help"><h2 id="rp-help">How to plan a room</h2><ol><li>Set the room dimensions.</li><li>Choose furniture.</li><li>Move and rotate objects.</li><li>Customize materials.</li><li>Switch between top and 3D views.</li><li>Save or export the design.</li></ol><p>Shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo, Ctrl/Cmd+D duplicate, Delete removes the selection, arrows nudge, F fits the camera, G toggles the grid, Esc deselects. Shortcuts do not run while typing in a field. Hold Shift while dragging to ignore snapping.</p><p>Leave about 36 in (0.9 m) where people need to walk. That is general planning guidance, not a regulatory requirement.</p><button type="button" onClick={() => { writePrefs({...readPrefs(), helpSeen: true}); setDialog(''); }}>Close</button></div>}
    {pending && <div className="rp-dialog" role="dialog" aria-modal="true" aria-labelledby="rp-confirm"><h2 id="rp-confirm">Replace the current room?</h2><p>The current arrangement will be replaced. Undo can bring it back during this visit. Save first if you want a copy.</p><button type="button" onClick={() => applyPending(pending)}>Replace</button><button type="button" onClick={() => setPending(null)}>Cancel</button></div>}
  </section>;
}

function parsed(item, patch, units) {
  const next = {...patch};
  for (const key of ['width', 'depth', 'height', 'x', 'z', 'elevation', 'offset', 'sill']) if (typeof next[key] === 'string') next[key] = parseLength(next[key], units);
  if (typeof next.rotation === 'string') next.rotation = Number(next.rotation);
  if (next.rotation != null && !Number.isFinite(next.rotation)) throw Error('Enter a finite rotation.');
  return {...item, ...next};
}
