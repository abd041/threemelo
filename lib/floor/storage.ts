import type {Project} from './types.ts';
import {validateProject,importProject} from './project.ts';
export const STORAGE_KEY='threemelo-floor-projects-v2';
export type StorageLike=Pick<Storage,'getItem'|'setItem'>;
export type Library={active:string;projects:Project[]};
export function loadLibrary(storage:StorageLike):Library {const raw=storage.getItem(STORAGE_KEY);if(!raw){const legacy=storage.getItem('threemelo-floor-plan');if(legacy){const p=importProject(legacy);return {active:p.id,projects:[p]};}return {active:'',projects:[]};}const data=JSON.parse(raw) as Library;if(!data||!Array.isArray(data.projects)||data.projects.length>20)throw Error('Saved project library is damaged. Download a backup before replacing it.');data.projects.forEach(validateProject);return data;}
export function saveProject(storage:StorageLike,p:Project):Library {validateProject(p);const library=loadLibrary(storage);if(library.projects.length>=20&&!library.projects.some(v=>v.id===p.id))throw Error('This browser already has 20 projects. Back up and delete an old project first.');const next={active:p.id,projects:[p,...library.projects.filter(v=>v.id!==p.id)]};storage.setItem(STORAGE_KEY,JSON.stringify(next));return next;}
export function removeProject(storage:StorageLike,id:string):Library {const lib=loadLibrary(storage),projects=lib.projects.filter(p=>p.id!==id);const next={active:lib.active===id?projects[0]?.id||'':lib.active,projects};storage.setItem(STORAGE_KEY,JSON.stringify(next));return next;}
