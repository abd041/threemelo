import {tools} from './catalog.mjs';
export const STORAGE_EVENT='threemelo-library-change';
export function cleanSlugs(value){return Array.isArray(value)?[...new Set(value.filter(s=>tools.some(t=>t.slug===s)))].slice(0,30):[];}
export function readList(key,storage){try{return cleanSlugs(JSON.parse((storage??window.localStorage).getItem(key)||'[]'));}catch{return [];}}
export function writeList(key,value,storage){const clean=cleanSlugs(value);try{(storage??window.localStorage).setItem(key,JSON.stringify(clean));}catch{}if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(STORAGE_EVENT,{detail:{key,value:clean}}));return clean;}
export function toggleSlug(list,slug){return cleanSlugs(list.includes(slug)?list.filter(s=>s!==slug):[...list,slug]);}
export function rememberSlug(list,slug){return cleanSlugs([slug,...list]).slice(0,6);}
