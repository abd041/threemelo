'use client';
import {CATEGORIES, FURNITURE, OPENINGS} from '../../lib/room-planner.mjs';

const kinds = {sofa: 'sofa', sectional: 'sofa', chair: 'chair', bed: 'bed', table: 'table', storage: 'shelf', rug: 'rug', screen: 'screen', appliance: 'box', lamp: 'lamp', plant: 'plant', art: 'frame'};

function Thumb({kind}) {
  const shape = kinds[kind] || 'box';
  return <svg viewBox="0 0 64 40" aria-hidden="true"><rect width="64" height="40" fill="none"/><g fill="none" stroke="currentColor" strokeWidth="1.6">{shape === 'sofa' && <path d="M8 28 V16 H56 V28 M14 16 V12 H50 V16"/>}{shape === 'chair' && <path d="M22 30 V16 H42 V30 M24 16 V10 H40 V16"/>}{shape === 'bed' && <path d="M10 28 V18 H54 V28 M10 18 V12 H22 V18"/>}{shape === 'table' && <path d="M8 16 H56 M14 16 V30 M50 16 V30"/>}{shape === 'shelf' && <path d="M16 8 H48 V32 H16 Z M16 16 H48 M16 24 H48"/>}{shape === 'rug' && <rect x="8" y="10" width="48" height="20" rx="2"/>}{shape === 'screen' && <rect x="14" y="8" width="36" height="22"/>}{shape === 'lamp' && <path d="M32 30 V16 M24 16 H40 L36 8 H28 Z"/>}{shape === 'plant' && <path d="M32 30 V18 M32 18 C20 18 18 8 32 10 C46 8 44 18 32 18"/>}{shape === 'frame' && <rect x="16" y="6" width="32" height="26"/>}{shape === 'box' && <path d="M10 28 L32 8 L54 28 Z"/>}</g></svg>;
}

export default function Library({query, onQuery, recent, onAdd}) {
  const term = query.trim().toLowerCase();
  const furniture = Object.values(FURNITURE).filter(item => !term || item.name.toLowerCase().includes(term));
  const openings = Object.values(OPENINGS).filter(item => !term || item.name.toLowerCase().includes(term));
  const recentItems = recent.map(id => FURNITURE[id] || OPENINGS[id]).filter(Boolean);
  return <aside className="rp-library" aria-label="Furniture library"><label className="rp-search">Search furniture<input value={query} onChange={event => onQuery(event.target.value)} placeholder="Sofa, bed, window…"/></label>{!furniture.length && !openings.length && <p className="rp-empty">No furniture matches that search.</p>}{!!recentItems.length && !term && <div className="rp-recent"><h2>Recently used</h2><div>{recentItems.map(item => <button key={item.id} type="button" onClick={() => onAdd(item.id)}>{item.name}</button>)}</div></div>}{CATEGORIES.map(([id, label]) => {
    const items = id === 'doors' ? openings : furniture.filter(item => item.category === id);
    if (!items.length) return null;
    return <details key={id} open={!term ? id === 'living' || id === 'doors' : true}><summary>{label}<span>{items.length}</span></summary><ul>{items.map(item => <li key={item.id}><button type="button" draggable onDragStart={event => event.dataTransfer.setData('text/plain', item.id)} onClick={() => onAdd(item.id)}><Thumb kind={item.kind || item.kind}/><span><strong>{item.name}</strong><small>{item.depth ? `${item.width.toFixed(2)} × ${item.depth.toFixed(2)} m` : `${item.width.toFixed(2)} m wide`}</small></span></button></li>)}</ul></details>;
  })}</aside>;
}
