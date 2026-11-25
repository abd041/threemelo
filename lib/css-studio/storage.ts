import {defaultConfig,parseConfig} from './model.ts';
import type {Config} from './model.ts';
const KEY='threemelo-css-studio-v1';
function differences(value:unknown,base:unknown):unknown {
  if(JSON.stringify(value)===JSON.stringify(base))return undefined;
  if(value&&typeof value==='object'&&!Array.isArray(value)&&base&&typeof base==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,differences(v,(base as Record<string,unknown>)[k])]).filter(([,v])=>v!==undefined));
  return value;
}
function restore(base:unknown,patch:unknown):unknown {
  if(base&&typeof base==='object'&&!Array.isArray(base)&&patch&&typeof patch==='object'&&!Array.isArray(patch))return Object.fromEntries(Object.entries(base).map(([k,v])=>[k,Object.hasOwn(patch,k)?restore(v,(patch as Record<string,unknown>)[k]):v]));
  return patch;
}
export function encodeConfig(c:Config):string {const bytes=new TextEncoder().encode(JSON.stringify(differences(c,defaultConfig())||{}));return 'tm1='+btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
export function decodeConfig(hash:string):Config {const raw=hash.replace(/^#/,'');if(!/^tm1=[\w-]+$/.test(raw)||raw.length>16000)throw new Error('This share link is invalid or too large.');try{const bytes=Uint8Array.from(atob(raw.slice(4).replace(/-/g,'+').replace(/_/g,'/')),x=>x.charCodeAt(0));return parseConfig(JSON.stringify(restore(defaultConfig(),JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)))));}catch{throw new Error('This share link contains an invalid configuration.');}}
export function saveConfig(c:Config):void {localStorage.setItem(KEY,JSON.stringify(c));}
export function loadConfig():Config {const raw=localStorage.getItem(KEY);if(!raw)throw new Error('No saved configuration in this browser yet.');return parseConfig(raw);}
